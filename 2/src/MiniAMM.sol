// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {IMiniAMM, IMiniAMMEvents} from "./IMiniAMM.sol";
import {MiniAMMLP} from "./MiniAMMLP.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Add as many variables or functions as you would like
// for the implementation. The goal is to pass `forge test`.
contract MiniAMM is IMiniAMM, IMiniAMMEvents, MiniAMMLP {
    uint256 public k = 0;
    uint256 public xReserve = 0;
    uint256 public yReserve = 0;

    address public tokenX;
    address public tokenY;

    // implement constructor
    constructor(address _tokenX, address _tokenY) MiniAMMLP(_tokenX, _tokenY) {
        require(_tokenX != address(0), "tokenX cannot be zero address");
        require(_tokenY != address(0), "tokenY cannot be zero address");
        require(_tokenX != _tokenY, "Tokens must be different");
        
        // Order tokens by address (tokenX should be < tokenY)
        if (_tokenX < _tokenY) {
            tokenX = _tokenX;
            tokenY = _tokenY;
        } else {
            tokenX = _tokenY;
            tokenY = _tokenX;
        }
    }

    // Helper function to calculate square root
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    // add parameters and implement function.
    // this function will determine the 'k'.
    function _addLiquidityFirstTime(uint256 xAmountIn, uint256 yAmountIn) internal returns (uint256 lpMinted) {
        // Transfer tokens from user
        IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);
        IERC20(tokenY).transferFrom(msg.sender, address(this), yAmountIn);
        
        // Update reserves
        xReserve = xAmountIn;
        yReserve = yAmountIn;
        k = xAmountIn * yAmountIn;
        
        // Mint LP tokens: sqrt(x * y)
        lpMinted = sqrt(xAmountIn * yAmountIn);
        _mintLP(msg.sender, lpMinted);
    }

    // add parameters and implement function.
    // this function will increase the 'k'
    // because it is transferring liquidity from users to this contract.
    function _addLiquidityNotFirstTime(uint256 xAmountIn) internal returns (uint256 lpMinted) {
        // Calculate required yAmountIn to maintain ratio
        uint256 yAmountIn = (xAmountIn * yReserve) / xReserve;
        
        // Transfer tokens from user
        IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);
        IERC20(tokenY).transferFrom(msg.sender, address(this), yAmountIn);
        
        // Calculate LP tokens to mint proportionally
        lpMinted = (xAmountIn * totalSupply()) / xReserve;
        
        // Update reserves
        xReserve += xAmountIn;
        yReserve += yAmountIn;
        k = xReserve * yReserve;
        
        // Mint LP tokens
        _mintLP(msg.sender, lpMinted);
    }

    // complete the function. Should transfer LP token to the user.
    function addLiquidity(uint256 xAmountIn, uint256 yAmountIn) external returns (uint256 lpMinted) {
        if (k == 0) {
            lpMinted = _addLiquidityFirstTime(xAmountIn, yAmountIn);
        } else {
            lpMinted = _addLiquidityNotFirstTime(xAmountIn);
        }
        
        emit AddLiquidity(xAmountIn, yAmountIn);
    }

    // Remove liquidity by burning LP tokens
    function removeLiquidity(uint256 lpAmount) external returns (uint256 xAmount, uint256 yAmount) {
        // Calculate proportional amounts to return
        xAmount = (lpAmount * xReserve) / totalSupply();
        yAmount = (lpAmount * yReserve) / totalSupply();
        
        // Burn LP tokens
        _burnLP(msg.sender, lpAmount);
        
        // Update reserves
        xReserve -= xAmount;
        yReserve -= yAmount;
        k = xReserve * yReserve;
        
        // Transfer tokens back to user
        IERC20(tokenX).transfer(msg.sender, xAmount);
        IERC20(tokenY).transfer(msg.sender, yAmount);
    }

    // complete the function
    function swap(uint256 xAmountIn, uint256 yAmountIn) external {
        require(k > 0, "No liquidity in pool");
        require(xAmountIn > 0 || yAmountIn > 0, "Must swap at least one token");
        require(!(xAmountIn > 0 && yAmountIn > 0), "Can only swap one direction at a time");
        
        uint256 xAmountOut = 0;
        uint256 yAmountOut = 0;
        
        if (xAmountIn > 0) {
            // Swapping X for Y
            require(xAmountIn < xReserve, "Insufficient liquidity");
            
            // Transfer X tokens from user
            IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);
            
            // Apply 0.3% fee (997/1000 = 0.997, so fee is 0.3%)
            uint256 xAmountInWithFee = xAmountIn * 997;
            
            // Calculate output using constant product formula: (x + dx*0.997) * (y - dy) = x * y
            // dy = (y * dx * 0.997) / (x + dx * 0.997)
            yAmountOut = (yReserve * xAmountInWithFee) / (xReserve * 1000 + xAmountInWithFee);
            
            // Update reserves
            xReserve += xAmountIn;
            yReserve -= yAmountOut;
            
            // Transfer Y tokens to user
            IERC20(tokenY).transfer(msg.sender, yAmountOut);
        } else {
            // Swapping Y for X
            require(yAmountIn < yReserve, "Insufficient liquidity");
            
            // Transfer Y tokens from user
            IERC20(tokenY).transferFrom(msg.sender, address(this), yAmountIn);
            
            // Apply 0.3% fee
            uint256 yAmountInWithFee = yAmountIn * 997;
            
            // Calculate output using constant product formula
            xAmountOut = (xReserve * yAmountInWithFee) / (yReserve * 1000 + yAmountInWithFee);
            
            // Update reserves
            yReserve += yAmountIn;
            xReserve -= xAmountOut;
            
            // Transfer X tokens to user
            IERC20(tokenX).transfer(msg.sender, xAmountOut);
        }
        
        // Update k (should increase due to fees)
        k = xReserve * yReserve;
        
        emit Swap(xAmountIn, yAmountIn, xAmountOut, yAmountOut);
    }
}
