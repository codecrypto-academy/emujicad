// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {SupplyChain} from "../src/SupplyChain.sol";

/**
 * @title SupplyChainDeployScript
 * @dev Automated deployment script with initial configuration
 * @notice Run with: forge script script/SupplyChainDeploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
 */

contract SupplyChainDeployScript is Script {
    SupplyChain public supplyChain;
    
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== SupplyChain Deployment Script ===");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy SupplyChain contract
        supplyChain = new SupplyChain();
        
        console.log("SupplyChain deployed at:", address(supplyChain));
        console.log("Contract owner:", supplyChain.owner());
        
        vm.stopBroadcast();
        
        // Verification logs
        console.log("=== Deployment Verification ===");
        console.log("Contract deployed successfully");
        console.log("Owner set correctly:", supplyChain.owner() == deployer);
        console.log("Ready for interactions");
    }
}