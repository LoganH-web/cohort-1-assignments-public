// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {MiniAMMFactory} from "../src/MiniAMMFactory.sol";
import {MiniAMM} from "../src/MiniAMM.sol";
import {MockERC20} from "../src/MockERC20.sol";

contract FactoryScript is Script {
    MiniAMMFactory public miniAMMFactory;
    MockERC20 public token0;
    MockERC20 public token1;
    address public pair;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Step 1: Deploy MiniAMMFactory
        miniAMMFactory = new MiniAMMFactory();
        console.log("MiniAMMFactory deployed at:", address(miniAMMFactory));

        // Step 2: Deploy two MockERC20 tokens
        token0 = new MockERC20("Token A", "TKA");
        token1 = new MockERC20("Token B", "TKB");
        console.log("Token A deployed at:", address(token0));
        console.log("Token B deployed at:", address(token1));

        // Step 3: Create a MiniAMM pair using the factory
        pair = miniAMMFactory.createPair(address(token0), address(token1));
        console.log("MiniAMM pair created at:", pair);
        
        // Verify the pair was created correctly
        console.log("Pair from factory:", miniAMMFactory.getPair(address(token0), address(token1)));
        console.log("Total pairs:", miniAMMFactory.allPairsLength());

        vm.stopBroadcast();
    }
}
