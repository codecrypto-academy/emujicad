// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {SupplyChain} from "../src/SupplyChain.sol";

/**
 * @title SupplyChainInteractions
 * @dev Workflow demonstration using real SupplyChain contract functions
 * @notice Run with: forge script script/SupplyChainInteractions.s.sol --rpc-url anvil --broadcast
 * 
 * KEY CORRECTIONS:
 * - Uses requestUserRole() instead of registerUser()
 * - Uses changeStatusUser() by owner to approve users  
 * - Correct function signatures for createToken() and transfer()
 * - Proper enum values (UserRole and UserStatus)
 */
contract SupplyChainInteractions is Script {
    SupplyChain public supplyChain;
    
    // Demo addresses
    address public owner;
    address public producerAddress = address(0x1111);
    address public factoryAddress = address(0x2222);
    address public retailerAddress = address(0x3333);
    address public consumerAddress = address(0x4444);
    
    function setUp() public {
        // Deploy new contract for testing
        supplyChain = new SupplyChain();
        owner = supplyChain.owner();
    }

    function run() public {
        console.log("=== SupplyChain Workflow Demonstration ===");
        console.log("Contract:", address(supplyChain));
        console.log("Owner:", owner);
        
        // PHASE 1: USER REGISTRATION
        console.log("\n=== PHASE 1: USER REGISTRATION ===");
        
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        console.log("Producer requested role");
        
        vm.prank(factoryAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        console.log("Factory requested role");
        
        vm.prank(retailerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Retailer);
        console.log("Retailer requested role");
        
        vm.prank(consumerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Consumer);
        console.log("Consumer requested role");
        
        // Owner approves all users
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);
        supplyChain.changeStatusUser(factoryAddress, SupplyChain.UserStatus.Approved);
        supplyChain.changeStatusUser(retailerAddress, SupplyChain.UserStatus.Approved);
        supplyChain.changeStatusUser(consumerAddress, SupplyChain.UserStatus.Approved);
        console.log("All users approved by owner");
        
        // PHASE 2: TOKEN CREATION
        console.log("\n=== PHASE 2: TOKEN CREATION ===");
        
        vm.prank(producerAddress);
        supplyChain.createToken("Raw Cotton", SupplyChain.TokenType.RowMaterial, 1000, "Organic cotton", 0);
        console.log("Token 1: Raw Cotton created by Producer");
        
        vm.prank(factoryAddress);
        supplyChain.createToken("Cotton Fabric", SupplyChain.TokenType.FinishedProduct, 500, "Premium fabric", 0);
        console.log("Token 2: Cotton Fabric created by Factory");
        
        // PHASE 3: TRANSFERS
        console.log("\n=== PHASE 3: TRANSFERS ===");
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 500);
        console.log("Transfer 1: Producer -> Factory (500 units)");
        
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        console.log("Transfer 1 accepted");
        
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 2, 200);
        console.log("Transfer 2: Factory -> Retailer (200 units)");
        
        vm.prank(retailerAddress);
        supplyChain.acceptTransfer(2);
        console.log("Transfer 2 accepted");
        
        vm.prank(retailerAddress);
        supplyChain.transfer(consumerAddress, 2, 50);
        console.log("Transfer 3: Retailer -> Consumer (50 units)");
        
        vm.prank(consumerAddress);
        supplyChain.acceptTransfer(3);
        console.log("Transfer 3 accepted");
        
        // PHASE 4: REJECTION & CANCELLATION
        console.log("\n=== PHASE 4: REJECTION & CANCELLATION ===");
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 100);
        console.log("Transfer 4 initiated (will be rejected)");
        
        vm.prank(factoryAddress);
        supplyChain.rejectTransfer(4);
        console.log("Transfer 4 rejected");
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        console.log("Transfer 5 initiated (will be cancelled)");
        
        vm.prank(producerAddress);
        supplyChain.cancelTransfer(5);
        console.log("Transfer 5 cancelled");
        
        // FINAL STATUS
        console.log("\n=== FINAL STATUS ===");
        console.log("Next Token ID:", supplyChain.nextTokenId());
        console.log("Next Transfer ID:", supplyChain.nextTransferId());
        console.log("Producer balance (token 1):", supplyChain.getTokenBalance(1, producerAddress));
        console.log("Factory balance (token 1):", supplyChain.getTokenBalance(1, factoryAddress));
        console.log("Consumer balance (token 2):", supplyChain.getTokenBalance(2, consumerAddress));
        console.log("\nDemo completed successfully!");
    }
}
