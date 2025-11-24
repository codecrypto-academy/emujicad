// SPDX-License-Identifier: MIT
// Define la versión del compilador de Solidity a utilizar.
// En este caso, es compatible con versiones desde 0.8.30.

pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {SupplyChain} from "../src/SupplyChain.sol";

contract SupplyChainTest is Test {
    SupplyChain public supplyChain;
    address owner;
    address producerAddress;
    address factoryAddress;
    address retailerAddress;
    address consumerAddress;


    function setUp() public {
        owner = address(this);
        producerAddress = makeAddr("producer");
        factoryAddress = makeAddr("factory");
        retailerAddress = makeAddr("retailer");
        consumerAddress = makeAddr("consumer");
        
        vm.prank(owner);
        supplyChain = new SupplyChain();
    }

    // --- Helper Functions ---
    function _registerAndApproveUser(address userAddr, SupplyChain.UserRole role) internal {
        vm.prank(userAddr);
        supplyChain.requestUserRole(role);
        vm.prank(owner);
        supplyChain.changeStatusUser(userAddr, SupplyChain.UserStatus.Approved);
    }

    // --- Tests de gestión de usuarios ---
    function testUserRegistration() public {
        SupplyChain.UserRole roleToRequest = SupplyChain.UserRole.Producer;

        vm.prank(producerAddress);
        supplyChain.requestUserRole(roleToRequest);

        uint256 userId = supplyChain.addressToUserId(producerAddress);
        assertTrue(userId > 0, "User ID should be greater than 0 after registration");

        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(user.id, userId, "User ID mismatch");
        assertEq(user.userAddress, producerAddress, "User address mismatch");
        assertEq(uint(user.role), uint(roleToRequest), "User role mismatch");
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending), "User status should be Pending");
        assertEq(supplyChain.nextUserId(), 2, "nextUserId should be incremented to 2");
    }

    function testAdminApproveUser() public {
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        uint256 userId = supplyChain.addressToUserId(producerAddress);
        assertTrue(userId > 0, "Setup failed: User should be registered");

        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);

        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved), "User status should be Approved");
    }

    function testAdminRejectUser() public {
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        uint256 userId = supplyChain.addressToUserId(producerAddress);
        assertTrue(userId > 0, "Setup failed: User should be registered");

        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Rejected);

        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Rejected), "User status should be Rejected");
    }

    function testOnlyApprovedUsersCanOperate() public {
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);

        // User with Pending status cannot create a token
        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.Unauthorized.selector);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        // Approve user and try again
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        assertEq(supplyChain.nextTokenId(), 2, "nextTokenId should be incremented after token creation");
    }

    function testGetUserInfo() public {
        SupplyChain.UserRole roleToRequest = SupplyChain.UserRole.Producer;
        vm.prank(producerAddress);
        supplyChain.requestUserRole(roleToRequest);
        uint256 userId = supplyChain.addressToUserId(producerAddress);

        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(user.id, userId, "Returned user ID mismatch");
        assertEq(user.userAddress, producerAddress, "Returned user address mismatch");
        assertEq(uint(user.role), uint(roleToRequest), "Returned user role mismatch");
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending), "Returned user status should be Pending");
    }

    function testIsAdmin() public view{
        assertTrue(supplyChain.isAdmin(owner), "Owner should be admin");
        assertFalse(supplyChain.isAdmin(producerAddress), "Producer should not be admin");
        assertFalse(supplyChain.isAdmin(address(1)), "Random address should not be admin");
    }

    function testUserStatusChanges() public {
        // Purpose: Test the various status changes a user can undergo (Pending, Approved, Rejected, Canceled).

        // 1. Setup: Register a user (producerAddress) with a Producer role.
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        //uint256 userId = supplyChain.addressToUserId(producerAddress);

        // 2. Assert initial status is 'Pending'.
        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending), "Initial status should be Pending");

        // 3. Action & Assert: Change status to 'Approved' and verify.
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);
        user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved), "Status should be Approved");

        // 4. Action & Assert: Change status to 'Rejected' and verify.
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Rejected);
        user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Rejected), "Status should be Rejected");

        // 5. Action & Assert: Change status to 'Canceled' and verify.
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Canceled);
        user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Canceled), "Status should be Canceled");
        
        // 6. Action & Assert: Change status back to 'Pending' and verify.
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Pending);
        user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Pending), "Status should be back to Pending");
    }

    // --- Tests de creación de tokens ---
    function testCreateTokenByProducer() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);

        (uint256 id, address creator, string memory name, SupplyChain.TokenType tokenType, uint256 totalSupply, string memory features, uint256 parentId, uint256 dateCreated) = supplyChain.getToken(1);
        assertEq(id, 1, "Token ID should be 1");
        assertEq(creator, producerAddress, "Token creator should be producer");
        assertEq(name, "Wood", "Token name should be Wood");
        assertEq(uint(tokenType), uint(SupplyChain.TokenType.RowMaterial), "Token type should be RowMaterial");
        assertEq(totalSupply, 100, "Token total supply should be 100");
        assertEq(features, "{}", "Token features should match");
        assertEq(parentId, 0, "Raw material should have parentId 0");
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 100, "Producer should have full balance");
        assertEq(dateCreated, block.timestamp, "Date created should match current block timestamp");
    }

    function testGetToken() public {
        // Setup: Create a token first
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "High quality oak wood", 0, 0);

        // Test: Get token information
        (uint256 id, address creator, string memory name, SupplyChain.TokenType tokenType, uint256 totalSupply, string memory features, uint256 parentId, uint256 dateCreated) = supplyChain.getToken(1);
        
        // Assertions
        assertEq(id, 1, "Token ID should be 1");
        assertEq(creator, producerAddress, "Creator should be producer");
        assertEq(name, "Wood", "Name should be Wood");
        assertEq(uint(tokenType), uint(SupplyChain.TokenType.RowMaterial), "Type should be RowMaterial");
        assertEq(totalSupply, 100, "Total supply should be 100");
        assertEq(features, "High quality oak wood", "Features should match");
        assertEq(parentId, 0, "Parent ID should be 0 for raw material");
        assertTrue(dateCreated > 0, "Date created should be greater than 0");
    }

    function testTokenBalance() public {
        // Setup: Create users and token
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        // Create a token
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        // Test initial balances
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 100, "Producer should have initial balance of 100");
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 0, "Factory should have initial balance of 0");
        assertEq(supplyChain.getTokenBalance(1, owner), 0, "Owner should have balance of 0");
        
        // Transfer some tokens and test balances
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 30);
        
        // After transfer (before acceptance)
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 70, "Producer balance should be 70 after transfer");
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 0, "Factory balance should still be 0 before acceptance");
        
        // Accept transfer
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // After acceptance
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 70, "Producer balance should remain 70");
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 30, "Factory balance should be 30 after acceptance");
    }

    function testCreateTokenByFactory() public {
        // First create a raw material token (parentId will be 1)
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "{}", 0, 0);

        // Factory needs to receive raw material first before creating finished product
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);

        // Now factory can create finished product with parentId 1
        vm.prank(factoryAddress);
        supplyChain.createToken("Chair", SupplyChain.TokenType.FinishedProduct, 50, "{}", 1, 50);

        (uint256 id, address creator, string memory name, SupplyChain.TokenType tokenType, uint256 totalSupply, string memory features, uint256 parentId, uint256 dateCreated) = supplyChain.getToken(2);
        assertEq(id, 2, "Token ID should be 2");
        assertEq(creator, factoryAddress, "Token creator should be factory");
        assertEq(name, "Chair", "Token name should be Chair");
        assertEq(uint(tokenType), uint(SupplyChain.TokenType.FinishedProduct), "Token type should be FinishedProduct");
        assertEq(totalSupply, 50, "Token total supply should be 50");
        assertEq(features, "{}", "Token features should match");
        assertEq(parentId, 1, "Finished product should have parentId");
        assertEq(supplyChain.getTokenBalance(2, factoryAddress), 50, "Factory should have full balance");
        assertEq(dateCreated, block.timestamp, "Date created should match current block timestamp");
    }

    function testUnapprovedUserCannotCreateToken() public {
        vm.prank(consumerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Consumer);
        
        vm.prank(owner);
        supplyChain.changeStatusUser(consumerAddress, SupplyChain.UserStatus.Approved);

        vm.prank(consumerAddress);
        vm.expectRevert(SupplyChain.Unauthorized.selector);
        supplyChain.createToken("Illegal Token", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
    }

    // --- Tests de transferencias básicas ---
    function testTransferFromProducerToFactory() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        // Create token
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        // Transfer
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);

        SupplyChain.Transfer memory transferItem = supplyChain.getTransfer(1);
        assertEq(transferItem.from, producerAddress, "Transfer from should be producer");
        assertEq(transferItem.to, factoryAddress, "Transfer to should be factory");
        assertEq(transferItem.tokenId, 1, "Transfer token ID should be 1");
        assertEq(transferItem.amount, 50, "Transfer amount should be 50");
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Pending), "Transfer should be pending");

        // Verify balances after transfer
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 50, "Producer balance should be 50 after transfer");
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 0, "Factory balance should be 0 before acceptance");
    }

    function testTransferFromFactoryToRetailer() public {
        // Setup complete chain: Producer → Factory → Retailer
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        _registerAndApproveUser(retailerAddress, SupplyChain.UserRole.Retailer);

        // 1. Producer creates raw material
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        // 2. Producer transfers to Factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 80);
        
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);

        // 3. Factory creates finished product
        vm.prank(factoryAddress);
        supplyChain.createToken("Chair", SupplyChain.TokenType.FinishedProduct, 40, "", 1, 40);

        // 4. Factory transfers finished product to Retailer
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 2, 25);

        // Test transfer details
        SupplyChain.Transfer memory transferItem = supplyChain.getTransfer(2);
        assertEq(transferItem.from, factoryAddress, "Transfer from should be factory");
        assertEq(transferItem.to, retailerAddress, "Transfer to should be retailer");
        assertEq(transferItem.tokenId, 2, "Transfer token ID should be 2 (finished product)");
        assertEq(transferItem.amount, 25, "Transfer amount should be 25");
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Pending), "Transfer should be pending");

        // Test balances before acceptance
        assertEq(supplyChain.getTokenBalance(2, factoryAddress), 15, "Factory should have 15 chairs left");
        assertEq(supplyChain.getTokenBalance(2, retailerAddress), 0, "Retailer should have 0 before acceptance");

        // Accept transfer
        vm.prank(retailerAddress);
        supplyChain.acceptTransfer(2);

        // Test final balances
        assertEq(supplyChain.getTokenBalance(2, factoryAddress), 15, "Factory should have 15 chairs");
        assertEq(supplyChain.getTokenBalance(2, retailerAddress), 25, "Retailer should have 25 chairs");
    }

    function testTransferFromRetailerToConsumer() public {
        // Setup complete chain: Producer → Factory → Retailer → Consumer
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        _registerAndApproveUser(retailerAddress, SupplyChain.UserRole.Retailer);
        _registerAndApproveUser(consumerAddress, SupplyChain.UserRole.Consumer);

        // 1. Producer creates and transfers raw material to Factory
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);

        // 2. Factory creates finished product and transfers to Retailer
        vm.prank(factoryAddress);
        supplyChain.createToken("Chair", SupplyChain.TokenType.FinishedProduct, 20, "", 1, 20);
        
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 2, 15);
        vm.prank(retailerAddress);
        supplyChain.acceptTransfer(2);

        // 3. Retailer transfers to Consumer (final step)
        vm.prank(retailerAddress);
        supplyChain.transfer(consumerAddress, 2, 8);

        // Test transfer details
        SupplyChain.Transfer memory transferItem = supplyChain.getTransfer(3);
        assertEq(transferItem.from, retailerAddress, "Transfer from should be retailer");
        assertEq(transferItem.to, consumerAddress, "Transfer to should be consumer");
        assertEq(transferItem.tokenId, 2, "Transfer token ID should be 2 (finished product)");
        assertEq(transferItem.amount, 8, "Transfer amount should be 8");
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Pending), "Transfer should be pending");

        // Test balances before acceptance
        assertEq(supplyChain.getTokenBalance(2, retailerAddress), 7, "Retailer should have 7 chairs left");
        assertEq(supplyChain.getTokenBalance(2, consumerAddress), 0, "Consumer should have 0 before acceptance");

        // Accept transfer (Consumer receives final product)
        vm.prank(consumerAddress);
        supplyChain.acceptTransfer(3);

        // Test final balances - chain completed
        assertEq(supplyChain.getTokenBalance(2, retailerAddress), 7, "Retailer should have 7 chairs");
        assertEq(supplyChain.getTokenBalance(2, consumerAddress), 8, "Consumer should have 8 chairs");
        
        // Verify transfer status
        transferItem = supplyChain.getTransfer(3);
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Accepted), "Transfer should be accepted");
    }

    function testGetTransfer() public {
        // Setup: Create transfer scenario
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);

        // Test: Get transfer information
        SupplyChain.Transfer memory transferItem = supplyChain.getTransfer(1);
        
        // Assertions
        assertEq(transferItem.id, 1, "Transfer ID should be 1");
        assertEq(transferItem.from, producerAddress, "Transfer from should be producer");
        assertEq(transferItem.to, factoryAddress, "Transfer to should be factory");
        assertEq(transferItem.tokenId, 1, "Transfer token ID should be 1");
        assertEq(transferItem.amount, 50, "Transfer amount should be 50");
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Pending), "Transfer should be pending");
        assertTrue(transferItem.dateCreated > 0, "Date created should be greater than 0");

        // Test with accepted transfer
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);

        transferItem = supplyChain.getTransfer(1);
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Accepted), "Transfer should be accepted after acceptance");
    }

    function testOnlyAdminCanChangeStatus() public {
        // Setup: Register a user
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);

        // Test: Only admin (owner) can change status
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);

        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved), "Status should be approved by admin");

        // Test: Non-admin cannot change status
        vm.prank(factoryAddress);
        vm.expectRevert(SupplyChain.NoOwner.selector);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Rejected);

        // Test: Producer cannot change their own status
        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.NoOwner.selector);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Pending);

        // Test: Random user cannot change status
        address randomUser = makeAddr("randomUser");
        vm.prank(randomUser);
        vm.expectRevert(SupplyChain.NoOwner.selector);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Canceled);

        // Verify status hasn't changed
        user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved), "Status should remain approved");
    }

    function testCompleteSupplyChainFlow() public {
        // Complete integration test: Raw material → Finished product → Consumer
        
        // 1. Setup all participants
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        _registerAndApproveUser(retailerAddress, SupplyChain.UserRole.Retailer);
        _registerAndApproveUser(consumerAddress, SupplyChain.UserRole.Consumer);

        // 2. Producer creates raw material
        vm.prank(producerAddress);
        supplyChain.createToken("Oak Wood", SupplyChain.TokenType.RowMaterial, 1000, "Premium quality oak", 0, 0);
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 1000, "Producer should have 1000 oak wood");

        // 3. Producer → Factory: Raw material transfer
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 500);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 500, "Producer should have 500 oak left");
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 500, "Factory should have 500 oak");

        // 4. Factory creates finished product from raw material
        vm.prank(factoryAddress);
        supplyChain.createToken("Oak Chair", SupplyChain.TokenType.FinishedProduct, 100, "Handcrafted oak chair", 1, 100);
        assertEq(supplyChain.getTokenBalance(2, factoryAddress), 100, "Factory should have 100 chairs");

        // 5. Factory → Retailer: Finished product transfer
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 2, 75);
        vm.prank(retailerAddress);
        supplyChain.acceptTransfer(2);
        
        assertEq(supplyChain.getTokenBalance(2, factoryAddress), 25, "Factory should have 25 chairs left");
        assertEq(supplyChain.getTokenBalance(2, retailerAddress), 75, "Retailer should have 75 chairs");

        // 6. Retailer → Consumer: Final sale
        vm.prank(retailerAddress);
        supplyChain.transfer(consumerAddress, 2, 20);
        vm.prank(consumerAddress);
        supplyChain.acceptTransfer(3);
        
        assertEq(supplyChain.getTokenBalance(2, retailerAddress), 55, "Retailer should have 55 chairs left");
        assertEq(supplyChain.getTokenBalance(2, consumerAddress), 20, "Consumer should have 20 chairs");

        // 7. Verify traceability - check token parent relationship
        (uint256 id, address creator, string memory name, SupplyChain.TokenType tokenType, uint256 totalSupply, string memory features, uint256 parentId, uint256 dateCreated) = supplyChain.getToken(2);
        assertEq(id, 2, "Token ID should be 2 for chair");
        assertEq(parentId, 1, "Chair should trace back to oak wood");
        assertEq(name, "Oak Chair", "Token name should be Oak Chair");
        assertEq(totalSupply, 100, "Total supply should be 100 chairs");
        assertEq(features, "Handcrafted oak chair", "Features should match description");
        assertEq(creator, factoryAddress, "Chair should be created by factory");
        assertEq(uint(tokenType), uint(SupplyChain.TokenType.FinishedProduct), "Should be finished product");
        assertEq(dateCreated, block.timestamp, "Date created should match current block timestamp");

        // 8. Verify total transfers in the system
        assertEq(supplyChain.getTotalTransfers(), 3, "Should have 3 total transfers");

        // 9. Test that consumer cannot transfer further (end of chain)
        vm.prank(consumerAddress);
        vm.expectRevert(SupplyChain.NoTransfersAllowed.selector);
        supplyChain.transfer(producerAddress, 2, 5);
    }

    function testCreateTokenByRetailer() public {
        // Note: Retailers typically don't create tokens but can in some supply chains
        _registerAndApproveUser(retailerAddress, SupplyChain.UserRole.Retailer);
        
        // Retailer cannot create tokens (only Producer and Factory can)
        vm.prank(retailerAddress);
        vm.expectRevert(SupplyChain.Unauthorized.selector);
        supplyChain.createToken("Retail Product", SupplyChain.TokenType.FinishedProduct, 50, "", 0, 0);
    }

    function testGetUserTokens() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        // Create multiple tokens
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Steel", SupplyChain.TokenType.RowMaterial, 200, "", 0, 0);
        
        // Factory needs to receive raw material first before creating finished product
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        vm.prank(factoryAddress);
        supplyChain.createToken("Chair", SupplyChain.TokenType.FinishedProduct, 50, "", 1, 50);
        
        // Test getUserTokens function exists and can be called
        // Note: This is a gas-expensive function, mainly for off-chain use
        uint[] memory producerTokens = supplyChain.getUserTokens(producerAddress);
        uint[] memory factoryTokens = supplyChain.getUserTokens(factoryAddress);
        
        assertEq(producerTokens.length, 2, "Producer should have 2 tokens");
        assertEq(factoryTokens.length, 1, "Factory should have 1 token");
    }

    function testGetUserTransfers() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        // Create multiple transfers
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 30);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 20);
        
        // Test getUserTransfers function exists and can be called
        uint[] memory producerTransfers = supplyChain.getUserTransfers(producerAddress);
        uint[] memory factoryTransfers = supplyChain.getUserTransfers(factoryAddress);
        
        assertEq(producerTransfers.length, 2, "Producer should have 2 transfers");
        assertEq(factoryTransfers.length, 2, "Factory should have 2 transfers");
    }

    function testTransferNonExistentToken() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        // Try to transfer non-existent token
        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.TokenDoesNotExist.selector);
        supplyChain.transfer(factoryAddress, 999, 50);
    }

    function testTokenWithParentId() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        // Create parent token
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        // Factory needs to receive raw material first before creating finished product
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 25);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Create child token with parent
        vm.prank(factoryAddress);
        supplyChain.createToken("Chair", SupplyChain.TokenType.FinishedProduct, 25, "", 1, 25);
        
        // Verify parent relationship
        (uint256 id, address creator, string memory name, SupplyChain.TokenType tokenType, uint256 totalSupply, string memory features, uint256 parentId, uint256 dateCreated) = supplyChain.getToken(2);
        assertEq(id, 2, "Token ID should be 2");
        assertEq(creator, factoryAddress, "Token creator should be factory");
        assertEq(name, "Chair", "Token name should be Chair");
        assertEq(totalSupply, 25, "Total supply should be 25 chairs");
        assertEq(features, "", "Features should be empty");
        assertEq(parentId, 1, "Child token should have correct parent ID");
        assertEq(uint(tokenType), uint(SupplyChain.TokenType.FinishedProduct), "Child should be finished product");
        assertEq(dateCreated, block.timestamp, "Date created should match current block timestamp");
    }

    function testTokenMetadata() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        
        string memory features = "High quality oak wood, sustainably sourced";
        vm.prank(producerAddress);
        supplyChain.createToken("Oak Wood", SupplyChain.TokenType.RowMaterial, 100, features, 0, 0);
        
        (uint256 id, address creator, string memory name, SupplyChain.TokenType tokenType, uint256 totalSupply, string memory returnedFeatures, uint256 parentId, uint256 dateCreated) = supplyChain.getToken(1);

        assertEq(id, 1, "Token ID should be 1");
        assertEq(name, "Oak Wood", "Token name should match");
        assertEq(uint(tokenType), uint(SupplyChain.TokenType.RowMaterial), "Token type should match");
        assertEq(totalSupply, 100, "Total supply should match");
        assertEq(returnedFeatures, features, "Token features should match");
        assertEq(parentId, 0, "Parent ID should be 0 for root token");
        assertEq(creator, producerAddress, "Creator should match");
        assertEq(totalSupply, 100, "Total supply should match");
        assertEq(dateCreated, block.timestamp, "Date created should match current block timestamp");
    }

    function testUnapprovedUserCannotTransfer() public {
        // Register but don't approve producer
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        vm.prank(factoryAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        // Unapproved producer cannot initiate transfers
        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.NoTransfersAllowed.selector);
        supplyChain.transfer(factoryAddress, 1, 50);
    }

    function testInvalidRoleTransfer() public {
        _registerAndApproveUser(consumerAddress, SupplyChain.UserRole.Consumer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        // Create a raw material token first
        vm.prank(factoryAddress);
        supplyChain.createToken("Raw Material", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        // Consumer cannot initiate transfers (only can receive)
        vm.prank(consumerAddress);
        vm.expectRevert(SupplyChain.NoTransfersAllowed.selector);
        supplyChain.transfer(factoryAddress, 1, 50);
    }

    function testTransferToSameAddress() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        // Transfer to same address is allowed - creates pending transfer to self
        vm.prank(producerAddress);
        supplyChain.transfer(producerAddress, 1, 50);
        
        // Check that transfer was created
        SupplyChain.Transfer memory transferItem = supplyChain.getTransfer(1);
        assertEq(transferItem.from, producerAddress, "Transfer from should be producer");
        assertEq(transferItem.to, producerAddress, "Transfer to should be producer");
        assertEq(transferItem.amount, 50, "Transfer amount should be 50");
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Pending), "Transfer should be pending");
    }

    function testAcceptNonExistentTransfer() public {
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        // Try to accept non-existent transfer
        vm.prank(factoryAddress);
        vm.expectRevert(SupplyChain.TransferDoesNotExist.selector);
        supplyChain.acceptTransfer(999);
    }

    function testTransferAfterRejection() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        // Create and reject transfer
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        
        vm.prank(factoryAddress);
        supplyChain.rejectTransfer(1);
        
        // Verify tokens returned to producer
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 100, "Tokens should return to producer");
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 0, "Factory should have 0 tokens");
        
        // Producer can create new transfer after rejection
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 30);
        
        // Verify new transfer
        SupplyChain.Transfer memory transfer = supplyChain.getTransfer(2);
        assertEq(transfer.amount, 30, "New transfer amount should be 30");
        assertEq(uint(transfer.status), uint(SupplyChain.TransferStatus.Pending), "New transfer should be pending");
    }

    function testAcceptTransfer() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);

        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);

        SupplyChain.Transfer memory transferItem = supplyChain.getTransfer(1);
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Accepted), "Transfer should be accepted");
        
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 50, "Producer balance should be 50");
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 50, "Factory balance should be 50 after acceptance");
    }

    function testRejectTransfer() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);

        vm.prank(factoryAddress);
        supplyChain.rejectTransfer(1);

        SupplyChain.Transfer memory transferItem = supplyChain.getTransfer(1);
        assertEq(uint(transferItem.status), uint(SupplyChain.TransferStatus.Rejected), "Transfer should be rejected");
        
        // Tokens should return to sender
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 100, "Producer should have original balance back");
        assertEq(supplyChain.getTokenBalance(1, factoryAddress), 0, "Factory should have 0 balance");
    }

    function testTransferInsufficientBalance() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InsufficientBalance.selector, 100, 150));
        supplyChain.transfer(factoryAddress, 1, 150);
    }

    // --- Test de pausa ---
    function testPauseFunctionality() public {
        // Only owner can pause
        vm.prank(owner);
        supplyChain.pause();
        
        assertTrue(supplyChain.isPaused(), "Contract should be paused");

        // Functions should fail when paused
        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.ContractPaused.selector);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);

        // Only owner can unpause
        vm.prank(owner);
        supplyChain.unpause();
        
        assertFalse(supplyChain.isPaused(), "Contract should not be paused");
    }

    // --- Test de ownership transfer ---
    function testOwnershipTransfer() public {
        address newOwner = makeAddr("newOwner");
        
        // Initiate transfer
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        assertEq(supplyChain.getPendingOwner(), newOwner, "Pending owner should be set");
        
        // Accept ownership
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        assertEq(supplyChain.owner(), newOwner, "New owner should be set");
        assertEq(supplyChain.getPendingOwner(), address(0), "Pending owner should be reset");
    }

    /// @notice Test: PendingOwner puede rechazar la transferencia de ownership
    /// @dev Verifica que el pendingOwner puede rechazar la transferencia pendiente y se emite el evento correcto
    function testRejectOwnershipTransfer() public {
        address newOwner = makeAddr("newOwner");
        
        // Iniciar transferencia
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        assertEq(supplyChain.getPendingOwner(), newOwner, "Pending owner should be set");
        
        // Rechazar ownership y verificar evento
        vm.expectEmit(true, true, false, true);
        emit SupplyChain.OwnershipTransferRejectedByPendingOwner(owner, newOwner);
        
        vm.prank(newOwner);
        supplyChain.rejectOwnershipTransfer();
        
        // Verificar que el owner sigue siendo el original
        assertEq(supplyChain.owner(), owner, "Owner should remain the same");
        assertEq(supplyChain.getPendingOwner(), address(0), "Pending owner should be reset");
    }

    /// @notice Test: Owner actual puede cancelar la transferencia pendiente
    /// @dev Verifica que el owner actual puede cancelar una transferencia que inició por error y se emite el evento correcto
    function testOwnerCanCancelOwnershipTransfer() public {
        address newOwner = makeAddr("newOwner");
        
        // Iniciar transferencia
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        assertEq(supplyChain.getPendingOwner(), newOwner, "Pending owner should be set");
        
        // Owner actual puede cancelar la transferencia y verificar evento
        vm.expectEmit(true, true, false, true);
        emit SupplyChain.OwnershipTransferCancelledByOwner(owner, newOwner);
        
        vm.prank(owner);
        supplyChain.rejectOwnershipTransfer();
        
        // Verificar que el owner sigue siendo el original
        assertEq(supplyChain.owner(), owner, "Owner should remain the same");
        assertEq(supplyChain.getPendingOwner(), address(0), "Pending owner should be reset");
    }

    /// @notice Test: Solo el owner o pendingOwner pueden rechazar la transferencia
    /// @dev Verifica que solo el owner actual o el pendingOwner pueden llamar rejectOwnershipTransfer
    ///      y que se emiten los eventos correctos
    function testOnlyOwnerOrPendingOwnerCanReject() public {
        address newOwner = makeAddr("newOwner");
        address randomUser = makeAddr("randomUser");
        
        // Iniciar transferencia
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        // Random user no puede rechazar
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.Unauthorized.selector));
        vm.prank(randomUser);
        supplyChain.rejectOwnershipTransfer();
        
        // Owner actual SÍ puede rechazar y emite evento de cancelación
        vm.expectEmit(true, true, false, true);
        emit SupplyChain.OwnershipTransferCancelledByOwner(owner, newOwner);
        
        vm.prank(owner);
        supplyChain.rejectOwnershipTransfer();
        
        // Reiniciar transferencia para probar pendingOwner
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        // PendingOwner SÍ puede rechazar y emite evento de rechazo
        vm.expectEmit(true, true, false, true);
        emit SupplyChain.OwnershipTransferRejectedByPendingOwner(owner, newOwner);
        
        vm.prank(newOwner);
        supplyChain.rejectOwnershipTransfer();
        
        assertEq(supplyChain.getPendingOwner(), address(0), "Pending owner should be reset");
    }

    /// @notice Test: No se puede rechazar si no hay transferencia pendiente
    /// @dev Verifica que se revierte si no hay pendingOwner
    function testCannotRejectWhenNoPendingTransfer() public {
        // No hay transferencia pendiente
        assertEq(supplyChain.getPendingOwner(), address(0), "No pending owner");
        
        // Intentar rechazar sin transferencia pendiente debe fallar
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidAddress.selector));
        vm.prank(owner);
        supplyChain.rejectOwnershipTransfer();
    }

    /// @notice Test: Usuario con rol Approved no puede aceptar ownership
    /// @dev Valida que el nuevo owner no pueda tener rol Approved
    function testApprovedUserCannotAcceptOwnership() public {
        address newOwner = makeAddr("newOwner");
        
        // Registrar y aprobar usuario
        vm.prank(newOwner);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        vm.prank(owner);
        supplyChain.changeStatusUser(newOwner, SupplyChain.UserStatus.Approved);
        
        // Iniciar transferencia
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        // Intentar aceptar ownership (debe fallar porque el usuario ya existe en el sistema)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.UserExists.selector));
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Verificar que el owner sigue siendo el original
        assertEq(supplyChain.owner(), owner, "Owner should remain the same");
    }

    /// @notice Test: Usuario con rol Pending NO puede aceptar ownership
    /// @dev Un usuario que haya solicitado un rol (incluso en estado Pending) no puede ser owner
    function testPendingUserCannotAcceptOwnership() public {
        address newOwner = makeAddr("newOwner");
        
        // Registrar usuario (estado Pending)
        vm.prank(newOwner);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        // Iniciar transferencia
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        // Intentar aceptar ownership (debe fallar porque el usuario ya existe en el sistema)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.UserExists.selector));
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Verificar que el owner sigue siendo el original
        assertEq(supplyChain.owner(), owner, "Owner should remain the same");
    }

    /// @notice Test: Usuario sin rol puede aceptar ownership
    /// @dev Un usuario sin registro puede aceptar ownership
    function testUserWithoutRoleCanAcceptOwnership() public {
        address newOwner = makeAddr("newOwner");
        
        // Iniciar transferencia (newOwner no tiene rol)
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        // Aceptar ownership (debe funcionar)
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Verificar que el nuevo owner es el owner
        assertEq(supplyChain.owner(), newOwner, "New owner should be set");
        
        // Verificar que el nuevo owner puede aprobar usuarios
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        vm.prank(newOwner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);
        
        SupplyChain.User memory user = supplyChain.getUserInfo(producerAddress);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved), "New owner should be able to approve users");
    }

    /// @notice Test: Nuevo owner no puede registrarse como usuario
    /// @dev Después de aceptar ownership, el nuevo owner no puede tener rol
    function testNewOwnerCannotRegisterAsUser() public {
        address newOwner = makeAddr("newOwner");
        
        // Transferir ownership
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Intentar registrarse como usuario (debe fallar)
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InvalidAddress.selector));
        vm.prank(newOwner);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
    }

    /// @notice Test: Flujo completo de ownership transfer con aprobación de usuarios
    /// @dev Verifica que después de transferir ownership, solo el nuevo owner puede aprobar
    function testOwnershipTransferCompleteFlow() public {
        address newOwner = makeAddr("newOwner");
        address user1 = makeAddr("user1");
        address user2 = makeAddr("user2");
        
        // Usuarios solicitan rol antes de transferencia
        vm.prank(user1);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        vm.prank(user2);
        supplyChain.requestUserRole(SupplyChain.UserRole.Factory);
        
        // Transferir ownership
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        vm.prank(newOwner);
        supplyChain.acceptOwnershipTransfer();
        
        // Verificar que el owner antiguo NO puede aprobar usuarios
        vm.expectRevert(SupplyChain.NoOwner.selector);
        vm.prank(owner);
        supplyChain.changeStatusUser(user1, SupplyChain.UserStatus.Approved);
        
        // Verificar que el nuevo owner SÍ puede aprobar usuarios
        vm.prank(newOwner);
        supplyChain.changeStatusUser(user1, SupplyChain.UserStatus.Approved);
        
        SupplyChain.User memory user = supplyChain.getUserInfo(user1);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Approved), "New owner should be able to approve users");
        
        // Verificar que el nuevo owner puede rechazar usuarios
        vm.prank(newOwner);
        supplyChain.changeStatusUser(user2, SupplyChain.UserStatus.Rejected);
        
        user = supplyChain.getUserInfo(user2);
        assertEq(uint(user.status), uint(SupplyChain.UserStatus.Rejected), "New owner should be able to reject users");
    }

    // --- Tests adicionales de seguridad ---
    function testOnlyOwnerCanInitiateTransfer() public {
        address newOwner = makeAddr("newOwner");
        
        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.NoOwner.selector);
        supplyChain.initiateOwnershipTransfer(newOwner);
    }

    function testCannotTransferToZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(SupplyChain.InvalidAddress.selector);
        supplyChain.initiateOwnershipTransfer(address(0));
    }

    function testOnlyPendingOwnerCanAccept() public {
        address newOwner = makeAddr("newOwner");
        address randomUser = makeAddr("randomUser");
        
        vm.prank(owner);
        supplyChain.initiateOwnershipTransfer(newOwner);
        
        vm.prank(randomUser);
        vm.expectRevert(SupplyChain.Unauthorized.selector);
        supplyChain.acceptOwnershipTransfer();
    }

    function testUnauthorizedUserCannotPause() public {
        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.Unauthorized.selector);
        supplyChain.pause();
    }

    function testCannotPauseWhenAlreadyPaused() public {
        vm.prank(owner);
        supplyChain.pause();
        
        vm.prank(owner);
        vm.expectRevert(SupplyChain.ContractPaused.selector);
        supplyChain.pause();
    }

    function testCannotUnpauseWhenNotPaused() public {
        vm.prank(owner);
        vm.expectRevert(SupplyChain.ContractNotPaused.selector);
        supplyChain.unpause();
    }

    function testOnlyReceiverCanAcceptTransfer() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);

        // Random user cannot accept transfer
        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.NoReceiverAllowed.selector);
        supplyChain.acceptTransfer(1);
    }

    function testCannotAcceptNonPendingTransfer() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);

        // Accept once
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);

        // Cannot accept again
        vm.prank(factoryAddress);
        vm.expectRevert(SupplyChain.TransferNotPending.selector);
        supplyChain.acceptTransfer(1);
    }

    function testCannotTransferMoreThanBalance() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        vm.expectRevert(abi.encodeWithSelector(SupplyChain.InsufficientBalance.selector, 100, 150));
        supplyChain.transfer(factoryAddress, 1, 150);
    }

    function testTransferZeroAmount() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.InvalidAmount.selector);
        supplyChain.transfer(factoryAddress, 1, 0);
    }

    function testCannotTransferToZeroAddressInTransfer() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        vm.prank(producerAddress);
        vm.expectRevert(SupplyChain.InvalidAddress.selector);
        supplyChain.transfer(address(0), 1, 50);
    }

    function testConsumerCannotTransfer() public {
        _registerAndApproveUser(consumerAddress, SupplyChain.UserRole.Consumer);
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);

        // Transfer some tokens to consumer first (through factory/retailer)
        // Primero Producer -> Factory (Raw Material)
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Factory crea Finished Product
        vm.prank(factoryAddress);
        supplyChain.createToken("Chair", SupplyChain.TokenType.FinishedProduct, 25, "", 1, 25);
        
        // Factory -> Retailer (Finished Product)
        _registerAndApproveUser(retailerAddress, SupplyChain.UserRole.Retailer);
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 2, 20);
        vm.prank(retailerAddress);
        supplyChain.acceptTransfer(2);
        
        // Retailer -> Consumer (Finished Product)
        vm.prank(retailerAddress);
        supplyChain.transfer(consumerAddress, 2, 10);
        vm.prank(consumerAddress);
        supplyChain.acceptTransfer(3);

        // Consumer cannot transfer to anyone (Consumer no puede transferir Finished Product)
        vm.prank(consumerAddress);
        vm.expectRevert(SupplyChain.NoTransfersAllowed.selector);
        supplyChain.transfer(producerAddress, 2, 5);
    }

    // --- Tests de eventos ---
    function testUserRegisteredEvent() public {
        vm.expectEmit(true, false, false, true);
        emit SupplyChain.UserRoleRequested(producerAddress, SupplyChain.UserRole.Producer);
        
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
    }

    function testUserStatusChangedEvent() public {
        vm.prank(producerAddress);
        supplyChain.requestUserRole(SupplyChain.UserRole.Producer);
        
        vm.expectEmit(true, false, false, true);
        emit SupplyChain.UserStatusChanged(producerAddress, SupplyChain.UserStatus.Pending, SupplyChain.UserStatus.Approved);
        
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);
    }

    function testTokenCreatedEvent() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        
        vm.expectEmit(true, true, false, true);
        emit SupplyChain.TokenCreated(1, producerAddress, "Wood", SupplyChain.TokenType.RowMaterial, 100, 0);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
    }

    function testTransferInitiatedEvent() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        vm.expectEmit(true, true, true, true);
        emit SupplyChain.TransferRequested(1, producerAddress, factoryAddress, 1, 50);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
    }

    function testTransferAcceptedEvent() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        
        vm.expectEmit(true, false, false, true);
        emit SupplyChain.TransferAccepted(1);
        
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
    }

    function testTransferRejectedEvent() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        
        vm.expectEmit(true, false, false, true);
        emit SupplyChain.TransferRejected(1);
        
        vm.prank(factoryAddress);
        supplyChain.rejectTransfer(1);
    }

    // --- Tests de casos edge adicionales ---
    function testDoubleAcceptTransfer() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 50);
        
        // First acceptance should work
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // Second acceptance should fail
        vm.prank(factoryAddress);
        vm.expectRevert(SupplyChain.TransferNotPending.selector);
        supplyChain.acceptTransfer(1);
    }

    // --- Tests de flujo completo adicionales ---
    function testMultipleTokensFlow() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        _registerAndApproveUser(retailerAddress, SupplyChain.UserRole.Retailer);
        
        // Producer creates multiple raw materials
        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0, 0);
        
        vm.prank(producerAddress);
        supplyChain.createToken("Metal", SupplyChain.TokenType.RowMaterial, 200, "", 0, 0);
        
        // Transfer different amounts to factory
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 30); // Wood
        
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 2, 50); // Metal
        
        // Factory accepts both transfers
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(2);
        
        // Factory creates finished products from both materials
        vm.prank(factoryAddress);
        supplyChain.createToken("WoodChair", SupplyChain.TokenType.FinishedProduct, 15, "", 1, 15);
        
        vm.prank(factoryAddress);
        supplyChain.createToken("MetalTable", SupplyChain.TokenType.FinishedProduct, 10, "", 2, 10);
        
        // Transfer products to retailer
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 3, 10); // WoodChair
        
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 4, 5); // MetalTable
        
        // Verify final balances
        assertEq(supplyChain.getTokenBalance(1, producerAddress), 70, "Producer should have remaining wood");
        assertEq(supplyChain.getTokenBalance(2, producerAddress), 150, "Producer should have remaining metal");
        assertEq(supplyChain.getTokenBalance(3, factoryAddress), 5, "Factory should have remaining wood chairs");
        assertEq(supplyChain.getTokenBalance(4, factoryAddress), 5, "Factory should have remaining metal tables");
    }

    function testTraceabilityFlow() public {
        _registerAndApproveUser(producerAddress, SupplyChain.UserRole.Producer);
        _registerAndApproveUser(factoryAddress, SupplyChain.UserRole.Factory);
        _registerAndApproveUser(retailerAddress, SupplyChain.UserRole.Retailer);
        _registerAndApproveUser(consumerAddress, SupplyChain.UserRole.Consumer);
        
        // 1. Producer creates raw material
        vm.prank(producerAddress);
        supplyChain.createToken("RawWood", SupplyChain.TokenType.RowMaterial, 1000, "Oak wood from sustainable forest", 0, 0);
        
        // 2. Producer → Factory transfer
        vm.prank(producerAddress);
        supplyChain.transfer(factoryAddress, 1, 100);
        vm.prank(factoryAddress);
        supplyChain.acceptTransfer(1);
        
        // 3. Factory creates finished product with traceability
        vm.prank(factoryAddress);
        supplyChain.createToken("OakChair", SupplyChain.TokenType.FinishedProduct, 25, "Handcrafted oak chair, batch #001", 1, 25);
        
        // 4. Factory → Retailer transfer
        vm.prank(factoryAddress);
        supplyChain.transfer(retailerAddress, 2, 20);
        vm.prank(retailerAddress);
        supplyChain.acceptTransfer(2);
        
        // 5. Retailer → Consumer transfer
        vm.prank(retailerAddress);
        supplyChain.transfer(consumerAddress, 2, 1);
        vm.prank(consumerAddress);
        supplyChain.acceptTransfer(3);
        
        // 6. Verify full traceability
        (uint256 id, address creator, string memory name, SupplyChain.TokenType tokenType, uint256 totalSupply, string memory features, uint256 parentId, uint256 dateCreated) = supplyChain.getToken(2);
        
        assertEq(id, 2, "Product ID should be 2");
        assertEq(creator, factoryAddress, "Product creator should be factory");
        assertEq(name, "OakChair", "Product name should be OakChair");
        assertEq(uint(tokenType), uint(SupplyChain.TokenType.FinishedProduct), "Should be finished product");
        assertEq(totalSupply, 25, "Total supply should be 25 chairs");
        assertEq(features, "Handcrafted oak chair, batch #001", "Features should match description");
        assertEq(dateCreated, block.timestamp, "Date created should match current block timestamp");
        assertEq(parentId, 1, "Should trace back to raw material token 1");
        
        // Verify raw material traceability
        (uint256 rawId, address rawCreator, string memory rawName, SupplyChain.TokenType rawType, , string memory rawFeatures, uint256 rawParentId, ) = supplyChain.getToken(1);
        
        assertEq(rawId, 1, "Raw material ID should be 1");
        assertEq(rawCreator, producerAddress, "Raw material creator should be producer");
        assertEq(rawName, "RawWood", "Raw material name should be RawWood");
        assertEq(uint(rawType), uint(SupplyChain.TokenType.RowMaterial), "Should be raw material");
        assertEq(rawParentId, 0, "Raw material should have no parent");
        assertEq(rawFeatures, "Oak wood from sustainable forest", "Raw material features should match description");
        
        // Verify consumer received the product
        assertEq(supplyChain.getTokenBalance(2, consumerAddress), 1, "Consumer should have 1 chair");
        
        // Verify transfer history
        SupplyChain.Transfer memory transfer1 = supplyChain.getTransfer(1); // Producer → Factory
        SupplyChain.Transfer memory transfer2 = supplyChain.getTransfer(2); // Factory → Retailer  
        SupplyChain.Transfer memory transfer3 = supplyChain.getTransfer(3); // Retailer → Consumer
        
        assertEq(transfer1.from, producerAddress, "First transfer from producer");
        assertEq(transfer1.to, factoryAddress, "First transfer to factory");
        assertEq(transfer2.from, factoryAddress, "Second transfer from factory");
        assertEq(transfer2.to, retailerAddress, "Second transfer to retailer");
        assertEq(transfer3.from, retailerAddress, "Third transfer from retailer");
        assertEq(transfer3.to, consumerAddress, "Third transfer to consumer");
        
        // All transfers should be accepted
        assertEq(uint(transfer1.status), uint(SupplyChain.TransferStatus.Accepted), "Transfer 1 should be accepted");
        assertEq(uint(transfer2.status), uint(SupplyChain.TransferStatus.Accepted), "Transfer 2 should be accepted");
        assertEq(uint(transfer3.status), uint(SupplyChain.TransferStatus.Accepted), "Transfer 3 should be accepted");
    }
}