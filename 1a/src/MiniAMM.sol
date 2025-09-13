<<<<<<< HEAD
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {IMiniAMM, IMiniAMMEvents} from "./IMiniAMM.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Add as many variables or functions as you would like
// for the implementation. The goal is to pass `forge test`.
contract MiniAMM is IMiniAMM, IMiniAMMEvents {
    uint256 public k = 0;

    // reserve: amount of tokenX and tokenY in this contract
    uint256 public xReserve = 0;
    uint256 public yReserve = 0;

    address public tokenX;
    address public tokenY;

    // implement constructor
    constructor(address _tokenX, address _tokenY) {
        require(_tokenX != address(0), "tokenX cannot be zero address");
        require(_tokenY != address(0), "tokenY cannot be zero address");
        require(_tokenX != _tokenY, "Tokens must be different");

        if (_tokenX < _tokenY) {
            tokenX = _tokenX;
            tokenY = _tokenY;
        } else {
            // swap to ensure tokenX < tokenY
            tokenX = _tokenY;
            tokenY = _tokenX;
        }
    }

    // add parameters and implement function.
    // this function will determine the initial 'k'.
    function _addLiquidityFirstTime(uint256 xAmount, uint256 yAmount) internal {
        require(xAmount > 0, "Amounts must be greater than 0");
        require(yAmount > 0, "Amounts must be greater than 0");

        // transfer tokens from the sender to the contract
        IERC20(tokenX).transferFrom(msg.sender, address(this), xAmount);
        IERC20(tokenY).transferFrom(msg.sender, address(this), yAmount);
        
        // update reserves
        xReserve += xAmount;
        yReserve += yAmount;

        // set initial k
        k = xReserve * yReserve;
        
        emit AddLiquidity(xAmount, yAmount);

    }

    // add parameters and implement function.
    // this function will increase the 'k'
    // because it is transferring liquidity from users to this contract.
    function _addLiquidityNotFirstTime(uint256 xAmount, uint256 yAmount) internal {
        require(xAmount > 0 && yAmount > 0, "Amounts must be greater than zero");

        // Ensure the ratio of xAmount to yAmount matches the current reserve ratio
        uint expectedXAmount = (yAmount * xReserve) / yReserve;
        require(xAmount == expectedXAmount, "Token ratio must be maintained");
        uint expectedYAmount = (xAmount * yReserve) / xReserve;
        require(yAmount == expectedYAmount, "Token ratio must be maintained");

        // transfer tokens from the sender to the contract
        IERC20(tokenX).transferFrom(msg.sender, address(this), xAmount);
        IERC20(tokenY).transferFrom(msg.sender, address(this), yAmount);

        // update reserves
        xReserve += xAmount;
        yReserve += yAmount;

        // update k
        k = xReserve * yReserve;

        emit AddLiquidity(xAmount, yAmount);
 
    }

    // complete the function
    function addLiquidity(uint256 xAmountIn, uint256 yAmountIn) external {
        if (k == 0) {
            // add params
            _addLiquidityFirstTime(xAmountIn, yAmountIn);
        } else {
            // add params
            _addLiquidityNotFirstTime(xAmountIn, yAmountIn);
        }
    }

    // complete the function
    /* Swap: users can swap X amount of token into Y amount of
     token, keeping K constant. Essentially, this transfers X 
     amount of token into the contract, and transfers out Y 
     amount of token to the user, while keeping K constant. */

    function swap(uint256 xAmountIn, uint256 yAmountIn) external {
        require(k > 0, "No liquidity in pool");

        // 둘다 0인 경우
        require(xAmountIn > 0 || yAmountIn > 0, "Must swap at least one token");

        // swap only one token at a time 
        require(
            (xAmountIn > 0 && yAmountIn == 0) || (xAmountIn == 0 && yAmountIn > 0),
            "Can only swap one direction at a time"); 

        if (xAmountIn > 0){
            // AMM formula: (xReserve + xAmountIn) * (yReserve - yAmountOut) = k
            // So, yAmountOut = yReserve - (k / (xReserve + xAmountIn))  => yReserve - (newYreserve)
            require(xAmountIn < xReserve, "Insufficient liquidity");

            uint256 yAmountOut = yReserve - (k / (xReserve + xAmountIn));
            require(yAmountOut > 0 && yAmountOut < yReserve, "Insufficient liquidity");

            IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);
            IERC20(tokenY).transfer(msg.sender, yAmountOut);

            xReserve += xAmountIn;
            yReserve -= yAmountOut; 

            emit Swap(xAmountIn, yAmountOut);

        } else {
            require(yAmountIn < yReserve, "Insufficient liquidity");

            uint256 xAmountOut = xReserve - (k / (yReserve + yAmountIn));
            require(xAmountOut > 0 && xAmountOut < xReserve, "Insufficient liquidity");

            IERC20(tokenY).transferFrom(msg.sender, address(this), yAmountIn);
            IERC20(tokenX).transfer(msg.sender, xAmountOut);

            xReserve -= xAmountOut;
            yReserve += yAmountIn;

            // Emit output and input in corresponding positions to match tests
            emit Swap(xAmountOut, yAmountIn);
        }
    }
}
=======
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {IMiniAMM, IMiniAMMEvents} from "./IMiniAMM.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Add as many variables or functions as you would like
// for the implementation. The goal is to pass `forge test`.
contract MiniAMM is IMiniAMM, IMiniAMMEvents {
    uint256 public k = 0;

    // reserve: amount of tokenX and tokenY in this contract
    uint256 public xReserve = 0;
    uint256 public yReserve = 0;

    address public tokenX;
    address public tokenY;

    // implement constructor
    constructor(address _tokenX, address _tokenY) {
        require(_tokenX != address(0), "tokenX cannot be zero address");
        require(_tokenY != address(0), "tokenY cannot be zero address");
        require(_tokenX != _tokenY, "Tokens must be different");

        if (_tokenX < _tokenY) {
            tokenX = _tokenX;
            tokenY = _tokenY;
        } else {
            // swap to ensure tokenX < tokenY
            tokenX = _tokenY;
            tokenY = _tokenX;
        }
    }

    // add parameters and implement function.
    // this function will determine the initial 'k'.
    function _addLiquidityFirstTime(uint256 xAmount, uint256 yAmount) internal {
        require(xAmount > 0, "Amounts must be greater than 0");
        require(yAmount > 0, "Amounts must be greater than 0");

        // transfer tokens from the sender to the contract
        IERC20(tokenX).transferFrom(msg.sender, address(this), xAmount);
        IERC20(tokenY).transferFrom(msg.sender, address(this), yAmount);
        
        // update reserves
        xReserve += xAmount;
        yReserve += yAmount;

        // set initial k
        k = xReserve * yReserve;
        
        emit AddLiquidity(xAmount, yAmount);

    }

    // add parameters and implement function.
    // this function will increase the 'k'
    // because it is transferring liquidity from users to this contract.
    function _addLiquidityNotFirstTime(uint256 xAmount, uint256 yAmount) internal {
        require(xAmount > 0 && yAmount > 0, "Amounts must be greater than zero");

        // Ensure the ratio of xAmount to yAmount matches the current reserve ratio
        uint expectedXAmount = (yAmount * xReserve) / yReserve;
        require(xAmount == expectedXAmount, "Token ratio must be maintained");
        uint expectedYAmount = (xAmount * yReserve) / xReserve;
        require(yAmount == expectedYAmount, "Token ratio must be maintained");

        // transfer tokens from the sender to the contract
        IERC20(tokenX).transferFrom(msg.sender, address(this), xAmount);
        IERC20(tokenY).transferFrom(msg.sender, address(this), yAmount);

        // update reserves
        xReserve += xAmount;
        yReserve += yAmount;

        // update k
        k = xReserve * yReserve;

        emit AddLiquidity(xAmount, yAmount);
 
    }

    // complete the function
    function addLiquidity(uint256 xAmountIn, uint256 yAmountIn) external {
        if (k == 0) {
            // add params
            _addLiquidityFirstTime(xAmountIn, yAmountIn);
        } else {
            // add params
            _addLiquidityNotFirstTime(xAmountIn, yAmountIn);
        }
    }

    // complete the function
    /* Swap: users can swap X amount of token into Y amount of
     token, keeping K constant. Essentially, this transfers X 
     amount of token into the contract, and transfers out Y 
     amount of token to the user, while keeping K constant. */

    function swap(uint256 xAmountIn, uint256 yAmountIn) external {
        require(k > 0, "No liquidity in pool");

        // 둘다 0인 경우
        require(xAmountIn > 0 || yAmountIn > 0, "Must swap at least one token");

        // swap only one token at a time 
        require(
            (xAmountIn > 0 && yAmountIn == 0) || (xAmountIn == 0 && yAmountIn > 0),
            "Can only swap one direction at a time"); 

        if (xAmountIn > 0){
            // AMM formula: (xReserve + xAmountIn) * (yReserve - yAmountOut) = k
            // So, yAmountOut = yReserve - (k / (xReserve + xAmountIn))  => yReserve - (newYreserve)
            require(xAmountIn < xReserve, "Insufficient liquidity");

            uint256 yAmountOut = yReserve - (k / (xReserve + xAmountIn));
            require(yAmountOut > 0 && yAmountOut < yReserve, "Insufficient liquidity");

            IERC20(tokenX).transferFrom(msg.sender, address(this), xAmountIn);
            IERC20(tokenY).transfer(msg.sender, yAmountOut);

            xReserve += xAmountIn;
            yReserve -= yAmountOut; 

            emit Swap(xAmountIn, yAmountOut);

        } else {
            require(yAmountIn < yReserve, "Insufficient liquidity");

            uint256 xAmountOut = xReserve - (k / (yReserve + yAmountIn));
            require(xAmountOut > 0 && xAmountOut < xReserve, "Insufficient liquidity");

            IERC20(tokenY).transferFrom(msg.sender, address(this), yAmountIn);
            IERC20(tokenX).transfer(msg.sender, xAmountOut);

            xReserve -= xAmountOut;
            yReserve += yAmountIn;

            // Emit output and input in corresponding positions to match tests
            emit Swap(xAmountOut, yAmountIn);
        }
    }
}
>>>>>>> 456ffe0 (Update MiniAMM and MockERC20 contracts)
