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
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0);

        // Approve user and try again
        vm.prank(owner);
        supplyChain.changeStatusUser(producerAddress, SupplyChain.UserStatus.Approved);

        vm.prank(producerAddress);
        supplyChain.createToken("Wood", SupplyChain.TokenType.RowMaterial, 100, "", 0);
        
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

    function testIsAdmin() public view {
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

    // Tests de creación de tokens
    function testCreateTokenByProducer() public { }
    function testCreateTokenByFactory() public { }
    function testCreateTokenByRetailer() public { }
    function testTokenWithParentId() public { }
    function testTokenMetadata() public { }
    function testTokenBalance() public { }
    function testGetToken() public { }
    function testGetUserTokens() public { }

    // Tests de transferencias
    function testTransferFromProducerToFactory() public { }
    function testTransferFromFactoryToRetailer() public { }
    function testTransferFromRetailerToConsumer() public { }
    function testAcceptTransfer() public { }
    function testRejectTransfer() public { }
    function testTransferInsufficientBalance() public { }
    function testGetTransfer() public { }
    function testGetUserTransfers() public { }

    // Tests de validaciones y permisos
    function testInvalidRoleTransfer() public { }
    function testUnapprovedUserCannotCreateToken() public { }
    function testUnapprovedUserCannotTransfer() public { }
    function testOnlyAdminCanChangeStatus() public { }
    function testConsumerCannotTransfer() public { }
    function testTransferToSameAddress() public { }

    // Tests de casos edge
    function testTransferZeroAmount() public { }
    function testTransferNonExistentToken() public { }
    function testAcceptNonExistentTransfer() public { }
    function testDoubleAcceptTransfer() public { }
    function testTransferAfterRejection() public { }

    // Tests de eventos
    function testUserRegisteredEvent() public { }
    function testUserStatusChangedEvent() public { }
    function testTokenCreatedEvent() public { }
    function testTransferInitiatedEvent() public { }
    function testTransferAcceptedEvent() public { }
    function testTransferRejectedEvent() public { }

    // Tests de flujo completo
    function testCompleteSupplyChainFlow() public { }
    function testMultipleTokensFlow() public { }
    function testTraceabilityFlow() public { }
}
