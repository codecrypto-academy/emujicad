# 📖 API Reference - SupplyChain Contract

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para estado del contrato inteligente, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**  
> **📚 Para documentación completa de tests, consulta [TESTING.md](TESTING.md)**  
> **📚 Para documentación de arquitectura, consulta [ARCHITECTURE.md](ARCHITECTURE.md)**

Complete API documentation for all functions, events, modifiers, and data structures.

**Última actualización**: 26 de Noviembre, 2025

---

## 📋 Table of Contents

1. [Data Structures](#data-structures)
2. [Modifiers](#modifiers)
3. [Functions](#functions)
   - [Ownership Management](#ownership-management)
   - [Pause Management](#pause-management)
   - [User Management](#user-management)
   - [Token Management](#token-management)
   - [Transfer Management](#transfer-management)
4. [Events](#events)
5. [Custom Errors](#custom-errors)
6. [Gas Limitations](#gas-limitations)

---

## 📊 Data Structures

### **User**
```solidity
struct User {
    uint256 id;
    address userAddress;
    UserRole role;
    UserStatus status;
}
```

**Fields:**
- `id`: Unique identifier for the user
- `userAddress`: Ethereum address of the user
- `role`: Requested role (Producer, Factory, Retailer, Consumer)
- `status`: Current status (Pending, Approved, Rejected, Canceled)

### **Token**
```solidity
struct Token {
    uint256 id;
    address creator;
    string name;
    TokenType tokenType;
    uint256 totalSupply;
    string features;
    uint256 parentId;
    uint256 dateCreated;
    mapping(address => uint256) balance;
}
```

**Fields:**
- `id`: Unique token identifier
- `creator`: Address that created the token
- `name`: Token/product name
- `tokenType`: RowMaterial or FinishedProduct
- `totalSupply`: Total amount created
- `features`: JSON string with product characteristics
- `parentId`: Reference to parent token (0 for raw materials)
- `dateCreated`: Creation timestamp
- `balance`: Mapping of user balances

### **Transfer**
```solidity
struct Transfer {
    uint256 id;
    address from;
    address to;
    uint256 tokenId;
    uint256 amount;
    TransferStatus status;
    uint256 dateCreated;
}
```

**Fields:**
- `id`: Unique transfer identifier
- `from`: Sender address
- `to`: Receiver address
- `tokenId`: Token being transferred
- `amount`: Quantity being transferred
- `status`: Pending, Accepted, Rejected, or Canceled
- `dateCreated`: Transfer initiation timestamp

### **Enums**

```solidity
enum UserRole { Producer, Factory, Retailer, Consumer }
enum UserStatus { Pending, Approved, Rejected, Canceled }
enum TokenType { RowMaterial, FinishedProduct }
enum TransferStatus { Pending, Accepted, Rejected, Canceled }
enum PauseRole { None, Pauser }
```

---

## 🔒 Modifiers

### **`onlyOwner`**
Restricts function access to the contract owner only.
```solidity
modifier onlyOwner()
```
**Reverts:** `NoOwner()` if caller is not the owner

### **`onlyPauser`**
Restricts function access to owner or accounts with Pauser role.
```solidity
modifier onlyPauser()
```
**Reverts:** `NoPauser()` if caller lacks pauser privileges

### **`whenNotPaused`**
Ensures function can only execute when contract is not paused.
```solidity
modifier whenNotPaused()
```
**Reverts:** `EnforcedPause()` if contract is paused

### **`whenPaused`**
Ensures function can only execute when contract is paused.
```solidity
modifier whenPaused()
```
**Reverts:** `ExpectedPause()` if contract is not paused

### **`onlyTokenCreators`**
Restricts token creation to approved Producers and Factories.
```solidity
modifier onlyTokenCreators()
```
**Reverts:** `Unauthorized()` if caller is not an approved Producer/Factory

### **`onlyTransfersAllowed`**
Allows transfer initiation for approved Producers, Factories, and Retailers.
```solidity
modifier onlyTransfersAllowed()
```
**Reverts:** `NoTransfersAllowed()` if caller lacks transfer privileges

### **`onlyReceiverAllowed`**
Restricts transfer acceptance to approved Factories, Retailers, and Consumers.
```solidity
modifier onlyReceiverAllowed()
```
**Reverts:** `NoTransfersAllowed()` if caller cannot receive transfers

---

## ⚙️ Functions

## Ownership Management

### **`initiateOwnershipTransfer(address newOwner)`**
Initiates the two-step ownership transfer process.

**Parameters:**
- `newOwner`: Address of the proposed new owner

**Requirements:**
- Caller must be current owner
- `newOwner` cannot be `address(0)`

**Events Emitted:**
- `OwnershipTransferInitiated(address indexed previousOwner, address indexed newOwner)`

**Errors:**
- `NoOwner()`: Caller is not the owner
- `InvalidAddress()`: newOwner is zero address

```solidity
function initiateOwnershipTransfer(address newOwner) external onlyOwner
```

---

### **`acceptOwnershipTransfer()`**
Completes ownership transfer by allowing pending owner to accept.

**Requirements:**
- Caller must be the `pendingOwner`
- Caller must never have requested a user role (owner cannot be part of supply chain)
- Contract must not be paused

**Behavior:**
- Transfers ownership from current owner to pending owner
- Clears `pendingOwner` to `address(0)`
- Validates that new owner has never been a registered user

**Events Emitted:**
- `OwnershipTransferred(address indexed previousOwner, address indexed newOwner)`

**Errors:**
- `Unauthorized()`: Caller is not the pending owner
- `UserExists()`: New owner has previously requested a user role

```solidity
function acceptOwnershipTransfer() external whenNotPaused
```

---

### **`rejectOwnershipTransfer()`**
Allows owner or pending owner to reject/cancel the ownership transfer.

**Requirements:**
- Caller must be the current `owner` OR the `pendingOwner`
- Contract must not be paused

**Behavior:**
- If called by owner: Cancels the transfer (owner changed mind)
- If called by pending owner: Rejects the transfer (pending owner doesn't want it)
- Clears `pendingOwner` to `address(0)`

**Events Emitted:**
- `OwnershipTransferCancelledByOwner(...)`: If called by owner
- `OwnershipTransferRejectedByPendingOwner(...)`: If called by pending owner

**Errors:**
- `Unauthorized()`: Caller is neither owner nor pending owner

```solidity
function rejectOwnershipTransfer() external whenNotPaused
```

---

### **`getPendingOwner()`**
Returns the address of the pending owner (if any ownership transfer is in progress).

**Returns:**
- `address`: Address of pending owner, or `address(0)` if no transfer pending

```solidity
function getPendingOwner() public view returns (address)
```

> **📚 Para más detalles sobre el flujo completo de ownership transfer, consulta [ARCHITECTURE.md](ARCHITECTURE.md)**

---

## Pause Management

### **`setPauseRole(address account, PauseRole role)`**
Assigns or revokes the Pauser role to/from an account.

**Parameters:**
- `account`: Target address
- `role`: `PauseRole.Pauser` or `PauseRole.None`

**Requirements:**
- Caller must be owner

**Errors:**
- `NoOwner()`: Caller is not the owner

```solidity
function setPauseRole(address account, PauseRole role) external onlyOwner
```

---

### **`pause()`**
Pauses critical contract functions (emergency stop).

**Requirements:**
- Caller must be owner or have Pauser role
- Contract must not already be paused

**Events Emitted:**
- `Paused(address account)`

**Errors:**
- `NoPauser()`: Caller lacks pause privileges
- `EnforcedPause()`: Contract already paused

```solidity
function pause() external onlyPauser
```

---

### **`unpause()`**
Resumes contract functionality after pause.

**Requirements:**
- Caller must be owner or have Pauser role
- Contract must be paused

**Events Emitted:**
- `Unpaused(address account)`

**Errors:**
- `NoPauser()`: Caller lacks pause privileges
- `ExpectedPause()`: Contract not paused

```solidity
function unpause() external onlyPauser
```

---

## User Management

### **`requestUserRole(UserRole role)`**
Allows any address to request a role in the system.

**Parameters:**
- `role`: Desired role (Producer, Factory, Retailer, Consumer)

**Behavior:**
- Creates new user in `Pending` status
- Allows reapplication if previously `Rejected` or `Canceled`

**Events Emitted:**
- `UserRoleRequested(address indexed user, UserRole role, uint256 userId)`

**Errors:**
- `UserStatusNotAllowedToRequestRole()`: User is already `Approved` or `Pending`

```solidity
function requestUserRole(UserRole role) external
```

---

### **`changeStatusUser(address userAddress, UserStatus newStatus)`**
Approves, rejects, or cancels user requests.

**Parameters:**
- `userAddress`: User to modify
- `newStatus`: New status to assign

**Requirements:**
- Caller must be owner
- User must exist

**Events Emitted:**
- `UserStatusChanged(address indexed user, UserStatus oldStatus, UserStatus newStatus)`

**Errors:**
- `NoOwner()`: Caller is not owner
- `UserDoesNotExist()`: Address not registered

```solidity
function changeStatusUser(address userAddress, UserStatus newStatus) external onlyOwner
```

---

### **`getUserInfo(address userAddress)`**
Retrieves complete user information.

**Parameters:**
- `userAddress`: Address to query

**Returns:**
- `User memory`: User struct with all data

**Errors:**
- `UserDoesNotExist()`: Address not registered

```solidity
function getUserInfo(address userAddress) external view returns (User memory)
```

---

### **`getUserInfoById(uint userId)`**
Retrieves user information by ID.

**Parameters:**
- `userId`: User ID to query

**Returns:**
- `User memory`: User struct with all data

**Errors:**
- `UserDoesNotExist()`: Invalid user ID

```solidity
function getUserInfoById(uint userId) external view returns (User memory)
```

---

### **`getUserTokens(address userAddress)`**
Returns all tokens with non-zero balances for a user.

**⚠️ GAS WARNING**: O(n) complexity where n = total tokens. Use off-chain only.

**Parameters:**
- `userAddress`: Address to query

**Returns:**
- `Token[] memory`: Array of tokens owned by user

```solidity
function getUserTokens(address userAddress) external view returns (Token[] memory)
```

---

### **`getUserTransfers(address userAddress)`**
Returns all transfers involving the user (as sender or receiver).

**⚠️ GAS WARNING**: O(2n) complexity. OFF-CHAIN ONLY. Will fail with many transfers.

**Parameters:**
- `userAddress`: Address to query

**Returns:**
- `uint[] memory`: Array of transfer IDs related to the user

```solidity
function getUserTransfers(address userAddress) external view returns (uint[] memory)
```

---

### **`getTotalUsers()`**
Returns the total number of registered users in the system.

**Returns:**
- `uint`: Total count of registered users

```solidity
function getTotalUsers() public view returns (uint)
```

---

### **`isAdmin(address userAddress)`**
Checks if an address is the contract owner (admin).

**Parameters:**
- `userAddress`: Address to check

**Returns:**
- `bool`: `true` if address is owner, `false` otherwise

**Errors:**
- `InvalidAddress()`: Address is zero address

```solidity
function isAdmin(address userAddress) public view returns (bool)
```

---

## Token Management

### **`createToken(...)`**
Creates a new token (raw material or finished product).

**Parameters:**
- `name`: Token/product name
- `tokenType`: RowMaterial or FinishedProduct
- `totalSupply`: Total quantity created
- `features`: JSON string with product characteristics
- `parentId`: Parent token ID (must be 0 for RowMaterial)

**Requirements:**
- Caller must be approved Producer or Factory
- Contract must not be paused
- `totalSupply` must be > 0
- `name` must not be empty
- `parentId` must exist if specified (for FinishedProduct)

**Behavior:**
- Creator receives full `totalSupply` in their balance

**Events Emitted:**
- `TokenCreated(uint256 indexed tokenId, address indexed creator, string name, TokenType tokenType, uint256 totalSupply, uint256 parentId)`

**Errors:**
- `Unauthorized()`: Caller not authorized to create tokens
- `InvalidAmount()`: totalSupply is 0
- `ParentTokenDoesNotExist()`: Invalid parentId reference

```solidity
function createToken(
    string memory name,
    TokenType tokenType,
    uint256 totalSupply,
    string memory features,
    uint256 parentId
) external onlyTokenCreators whenNotPaused
```

---

### **`getToken(uint tokenId)`**
Retrieves complete token information.

**Parameters:**
- `tokenId`: Token ID to query

**Returns:**
- `Token memory`: Token struct with all data (except balance mapping)

**Errors:**
- `TokenDoesNotExist()`: Invalid token ID

```solidity
function getToken(uint tokenId) external view returns (Token memory)
```

---

### **`getTokenBalance(uint tokenId, address userAddress)`**
Queries a user's balance for a specific token.

**Parameters:**
- `tokenId`: Token to query
- `userAddress`: Address to check

**Returns:**
- `uint256`: Token balance for that user

**Errors:**
- `InvalidAddress()`: userAddress is zero address
- `TokenDoesNotExist()`: Invalid token ID

```solidity
function getTokenBalance(uint tokenId, address userAddress) public view returns (uint)
```

---

### **`getTotalTokens()`**
Returns the total number of tokens created in the system.

**Returns:**
- `uint`: Total count of tokens

```solidity
function getTotalTokens() public view returns (uint)
```

---

## Transfer Management

### **`transfer(address to, uint tokenId, uint amount)`**
Initiates a token transfer (requires receiver acceptance).

**Parameters:**
- `to`: Receiver address
- `tokenId`: Token to transfer
- `amount`: Quantity to transfer

**Requirements:**
- Caller must be approved Producer, Factory, or Retailer
- Contract must not be paused
- Caller must have sufficient balance
- Receiver must be registered and approved
- `amount` must be > 0

**Behavior:**
- Deducts tokens from sender immediately
- Transfer status set to `Pending`
- Receiver must accept to receive tokens

**Events Emitted:**
- `TransferRequested(uint256 indexed transferId, address indexed from, address indexed to, uint256 tokenId, uint256 amount)`

**Errors:**
- `NoTransfersAllowed()`: Caller not authorized
- `InsufficientBalance()`: Not enough tokens
- `UserDoesNotExist()`: Receiver not registered
- `UserStatusNotAllowedToReceiveTransfers()`: Receiver not approved
- `InvalidAmount()`: amount is 0

```solidity
function transfer(address to, uint tokenId, uint amount) 
    external 
    onlyTransfersAllowed 
    whenNotPaused 
    nonReentrant
```

---

### **`acceptTransfer(uint transferId)`**
Accepts a pending transfer, adding tokens to receiver's balance.

**Parameters:**
- `transferId`: Transfer to accept

**Requirements:**
- Caller must be the receiver
- Transfer must be in `Pending` status
- Caller must be approved Factory, Retailer, or Consumer

**Behavior:**
- Adds tokens to receiver's balance
- Updates transfer status to `Accepted`

**Events Emitted:**
- `TransferAccepted(uint256 indexed transferId, address indexed receiver)`

**Errors:**
- `Unauthorized()`: Caller is not the receiver
- `InvalidTransferStatus()`: Transfer not pending
- `NoTransfersAllowed()`: Receiver not authorized

```solidity
function acceptTransfer(uint transferId) 
    external 
    onlyReceiverAllowed 
    whenNotPaused 
    nonReentrant
```

---

### **`rejectTransfer(uint transferId)`**
Rejects a pending transfer, returning tokens to sender.

**Parameters:**
- `transferId`: Transfer to reject

**Requirements:**
- Caller must be the receiver
- Transfer must be in `Pending` status

**Behavior:**
- Returns tokens to sender's balance
- Updates transfer status to `Rejected`

**Events Emitted:**
- `TransferRejected(uint256 indexed transferId, address indexed receiver)`

**Errors:**
- `Unauthorized()`: Caller is not the receiver
- `InvalidTransferStatus()`: Transfer not pending

```solidity
function rejectTransfer(uint transferId) 
    external 
    whenNotPaused 
    nonReentrant
```

---

### **`cancelTransfer(uint transferId)`**
Cancels a pending transfer (sender-initiated), returning tokens to sender.

**Parameters:**
- `transferId`: Transfer to cancel

**Requirements:**
- Caller must be the sender
- Transfer must be in `Pending` status

**Behavior:**
- Returns tokens to sender's balance
- Updates transfer status to `Canceled`

**Events Emitted:**
- `TransferCanceled(uint256 indexed transferId, address indexed sender)`

**Errors:**
- `Unauthorized()`: Caller is not the sender
- `InvalidTransferStatus()`: Transfer not pending

```solidity
function cancelTransfer(uint transferId) 
    external 
    whenNotPaused 
    nonReentrant
```

---

### **`getTransfer(uint transferId)`**
Retrieves complete transfer information.

**Parameters:**
- `transferId`: Transfer ID to query

**Returns:**
- `Transfer memory`: Transfer struct with all data

**Errors:**
- `TransferDoesNotExist()`: Invalid transfer ID

```solidity
function getTransfer(uint transferId) external view returns (Transfer memory)
```

---

### **`getTotalTransfers()`**
Returns the total number of transfers created in the system.

**Returns:**
- `uint`: Total count of transfers

```solidity
function getTotalTransfers() public view returns (uint)
```

---

### **`isPaused()`**
Checks if the contract is currently paused.

**Returns:**
- `bool`: `true` if contract is paused, `false` otherwise

```solidity
function isPaused() public view returns (bool)
```

---

## 📡 Events

### Ownership Events
```solidity
event OwnershipTransferInitiated(address indexed previousOwner, address indexed newOwner);
event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
event OwnershipTransferCancelledByOwner(address indexed owner, address indexed cancelledPendingOwner);
event OwnershipTransferRejectedByPendingOwner(address indexed owner, address indexed rejectedPendingOwner);
event AssignInitialContractOwner(address indexed initialOwner);
```

### Pause Events
```solidity
event Paused(address account);
event Unpaused(address account);
event PauseRoleChanged(address indexed account, PauseRole role);
```

### User Management Events
```solidity
event UserRoleRequested(address indexed user, UserRole role, uint256 userId);
event UserStatusChanged(address indexed user, UserStatus oldStatus, UserStatus newStatus);
```

### Token Events
```solidity
event TokenCreated(
    uint256 indexed tokenId, 
    address indexed creator, 
    string name,
    TokenType tokenType, 
    uint256 totalSupply,
    uint256 parentId
);
```

### Transfer Events
```solidity
event TransferRequested(
    uint256 indexed transferId, 
    address indexed from, 
    address indexed to, 
    uint256 tokenId, 
    uint256 amount
);
event TransferAccepted(uint256 indexed transferId, address indexed receiver);
event TransferRejected(uint256 indexed transferId, address indexed receiver);
event TransferCanceled(uint256 indexed transferId, address indexed sender);
```

---

## ⚠️ Custom Errors

```solidity
error NoOwner();
error NoPauser();
error Unauthorized();
error InvalidAddress();
error InvalidUserId();
error UserDoesNotExist();
error UserExists();
error UserStatusNotAllowedToRequestRole();
error UserStatusNotAllowedToReceiveTransfers();
error TokenDoesNotExist();
error ParentTokenDoesNotExist();
error NoTransfersAllowed();
error InsufficientBalance(uint256 available, uint256 required);
error InvalidAmount();
error InvalidTransferStatus();
error TransferDoesNotExist();
error EnforcedPause();
error ExpectedPause();
```

**Benefits:**
- Gas-efficient (saves ~50 gas per revert vs string messages)
- Type-safe error handling
- Clear error semantics

---

## ⚠️ Gas Limitations

### High Gas Cost Functions

#### **`getUserTokens(address userAddress)`**
- **Complexity:** O(n) where n = total tokens in system
- **Warning:** Will fail with gas limit exceeded if token count is high
- **Recommended Usage:** Off-chain queries only
- **Suggested Limit:** Max 100-200 tokens before issues
- **Alternative:** Implement pagination or use events for indexing

#### **`getUserTransfers(address userAddress)`**
- **Complexity:** O(2n) where n = total transfers
- **Warning:** EXTREME gas consumption - likely to fail on mainnet
- **Recommended Usage:** OFF-CHAIN ONLY
- **Suggested Limit:** Max 50-100 transfers before failure
- **Alternative:** Use event indexing with subgraphs or similar

**⚠️ PRODUCTION RECOMMENDATION:**
For production deployments, implement:
1. **Event-based indexing** (The Graph, custom indexer)
2. **Pagination** for large list queries
3. **Off-chain caching** for user data aggregation

---

## 📚 Additional Resources

**Smart Contract Documentation**:
- [Getting Started Guide](GETTING_STARTED.md) - Setup and installation
- [Architecture Documentation](ARCHITECTURE.md) - System architecture and design
- [Testing Guide](TESTING.md) - Test coverage and validation (108 tests)
- [Security Guide](SECURITY.md) - Security features and best practices
- [Deployment Guide](DEPLOYMENT.md) - Deployment procedures
- [Scripts Documentation](SCRIPTS.md) - Automation scripts
- [Changelog](CHANGELOG.md) - Project evolution and improvements

**Project Documentation**:
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Current project status
- [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md) - Contract status and metrics
- [INDEX.md](../../INDEX.md) - Complete documentation index
- [QUICKSTART.md](../../QUICKSTART.md) - Quick start guide

---

**Última actualización**: 26 de Noviembre, 2025  
**Contract Version**: 1.2.0  
**Solidity Version**: 0.8.30  
**Test Suite**: 108 tests (64 core + 44 edge cases) - 100% passing  
**Coverage**: 85.60% lines, 82.67% statements, 72.15% branches, 80.95% functions
