// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {SupplyChain} from "../src/SupplyChain.sol";

contract SupplyChainScript is Script {
    SupplyChain public supplyChain;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        // Deploy SupplyChain contract
        supplyChain = new SupplyChain();

        vm.stopBroadcast();
    }
}
