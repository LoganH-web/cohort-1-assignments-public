// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

// DO NOT change the interface
interface IMiniAMM {
    // supply two tokens at a same time 
    function addLiquidity(uint256 xAmountIn, uint256 yAmountIn) external;

    // swap one token for another
    function swap(uint256 xAmountIn, uint256 yAmountIn) external;
}

// DO NOT change the interface
interface IMiniAMMEvents {
    event AddLiquidity(uint256 xAmountIn, uint256 yAmountIn);
    event Swap(uint256 xAmountIn, uint256 yAmountIn);
}
