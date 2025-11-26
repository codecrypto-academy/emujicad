# Transfer Permissions - Supply Chain Roles

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**

## 📋 Overview

This document explains the transfer permissions for each role in the supply chain system, ensuring the frontend is aligned with the smart contract rules.

---

## 🔐 Smart Contract Rules

The smart contract (`SupplyChain.sol`) defines strict rules about who can send and receive transfers:

### **Transfer Functions and Their Permissions:**

#### 1. **`transfer(address to, uint tokenId, uint amount)`** - Create Transfer (SEND)
- **Modifier:** `onlyTransfersAllowed` (Lines 423-426)
- **Who can call:** Producer, Factory, Retailer
- **Blocked:** Consumer
- **Creates:** Transfer in `Pending` status
- **Decreases:** Sender's balance immediately (to prevent double-spend)

```solidity
function _onlyTransfersAllowed() internal view {
    User storage user = users[addressToUserId[msg.sender]];
    if (!(user.status == UserStatus.Approved && 
         (user.role == UserRole.Producer || 
          user.role == UserRole.Factory || 
          user.role == UserRole.Retailer))) 
        revert NoTransfersAllowed();
}
```

#### 2. **`acceptTransfer(uint transferId)`** - Accept Transfer (RECEIVE)
- **Modifier:** `onlyReceiverAllowed` (Lines 418-421)
- **Who can call:** Factory, Retailer, Consumer
- **Blocked:** Producer
- **Condition:** Transfer must be in `Pending` status AND caller must be the recipient (`transfer.to`)
- **Action:** Increases recipient's balance, changes status to `Accepted`

#### 3. **`rejectTransfer(uint transferId)`** - Reject Transfer (RECEIVE)
- **Modifier:** `onlyReceiverAllowed` (Lines 418-421)
- **Who can call:** Factory, Retailer, Consumer
- **Blocked:** Producer
- **Condition:** Transfer must be in `Pending` status AND caller must be the recipient (`transfer.to`)
- **Action:** Returns tokens to sender, changes status to `Rejected`

```solidity
function _onlyReceiverAllowed() internal view {
    User storage user = users[addressToUserId[msg.sender]];
    if (!(user.status == UserStatus.Approved && 
         (user.role == UserRole.Factory || 
          user.role == UserRole.Retailer || 
          user.role == UserRole.Consumer))) 
        revert NoReceiverAllowed();
}
```

#### 4. **`cancelTransfer(uint transferId)`** - Cancel Own Transfer (SEND)
- **Modifier:** `onlyTransfersAllowed`
- **Who can call:** Producer, Factory, Retailer
- **Blocked:** Consumer
- **Condition:** Transfer must be in `Pending` status AND caller must be the sender (`transfer.from`)
- **Action:** Returns tokens to sender, changes status to `Cancelled`

### **Key Validation Rules:**

| Function | Who Can Call | Transfer Condition | Status Required |
|----------|-------------|-------------------|-----------------|
| `transfer()` | Producer, Factory, Retailer | Must own tokens | N/A (creates new) |
| `acceptTransfer()` | Factory, Retailer, Consumer | Must be recipient (`to`) | `Pending` |
| `rejectTransfer()` | Factory, Retailer, Consumer | Must be recipient (`to`) | `Pending` |
| `cancelTransfer()` | Producer, Factory, Retailer | Must be sender (`from`) | `Pending` |

---

## 🔄 Transfer Status Flow

Transfers go through different statuses, and actions are only allowed on `Pending` transfers:

```
                    ┌─────────────┐
                    │   PENDING   │ ← Created by transfer()
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
    ┌─────────┐      ┌──────────┐     ┌───────────┐
    │ACCEPTED │      │ REJECTED │     │ CANCELLED │
    └─────────┘      └──────────┘     └───────────┘
    (by recipient)   (by recipient)   (by sender)
```

### **Status Descriptions:**

- **`Pending` (0):** Transfer created, awaiting recipient action
  - ✅ Recipient can: `acceptTransfer()` or `rejectTransfer()`
  - ✅ Sender can: `cancelTransfer()`
  - Tokens already deducted from sender

- **`Accepted` (1):** Recipient accepted the transfer
  - ✅ Tokens moved to recipient
  - ❌ No further actions possible (final state)

- **`Rejected` (2):** Recipient rejected the transfer
  - ✅ Tokens returned to sender
  - ❌ No further actions possible (final state)

- **`Cancelled` (3):** Sender cancelled the transfer
  - ✅ Tokens returned to sender
  - ❌ No further actions possible (final state)

**⚠️ IMPORTANT:** All transfer actions (accept/reject/cancel) **ONLY work on `Pending` transfers**. Once a transfer reaches a final state (Accepted/Rejected/Cancelled), it cannot be modified.

---

## 👥 Role Permissions Matrix

| Role | Can Create Tokens | Can SEND Transfers | Can RECEIVE Transfers | Can View Own Tokens |
|------|-------------------|--------------------|-----------------------|---------------------|
| **Producer** | ✅ YES (RowMaterial) | ✅ YES | ❌ NO | ✅ YES |
| **Factory** | ✅ YES (Both types) | ✅ YES | ✅ YES (Accept/Reject) | ✅ YES |
| **Retailer** | ❌ NO | ✅ YES | ✅ YES (Accept/Reject) | ✅ YES |
| **Consumer** | ❌ NO | ❌ NO | ✅ YES (Accept/Reject) | ✅ YES |

---

## 🔄 Supply Chain Flow

The permissions enforce a natural supply chain flow:

```
Producer → Factory → Retailer → Consumer
   │          │          │          │
   │          │          │          └─ Only receives
   │          │          └─ Can send & receive
   │          └─ Can send & receive
   └─ Only sends (produces raw materials)
```

### **Detailed Flow:**

1. **Producer**
   - Creates raw materials (tokens)
   - Sends to Factory (transfer function)
   - Cannot receive (end of chain upstream)
   - Views own tokens

2. **Factory**
   - Receives raw materials from Producer (accept/reject)
   - Transforms into finished products
   - Sends to Retailer (transfer function)
   - Can send and receive
   - Views own tokens

3. **Retailer**
   - Receives finished products from Factory (accept/reject)
   - Distributes to Consumers (transfer function)
   - Can send and receive
   - Views own tokens

4. **Consumer**
   - Final destination of products
   - Only receives transfers (accept/reject)
   - Cannot send (end of chain downstream)
   - Views own tokens received

---

## 🎯 Frontend Implementation

### **Components Updated:**

#### 1. `CreateTransferForm.tsx`
- **Validates user role before showing form**
- **Consumer** sees informative message instead of form
- Shows supply chain flow explanation
- Only Producer, Factory, and Retailer can access the form

**Key validation:**
```typescript
const canTransfer = userInfo && (
  userInfo.role === BigInt(UserRole.Producer) || 
  userInfo.role === BigInt(UserRole.Factory) || 
  userInfo.role === BigInt(UserRole.Retailer)
)
```

#### 2. `UserTokenList.tsx`
- **Visible for ALL roles** (Producer, Factory, Retailer, Consumer)
- Shows tokens the user currently owns
- Displays Token ID, Name, Symbol for quick reference
- Helpful for all users to see their inventory
- Consumer can see tokens received from others

#### 3. `TransferList.tsx`
- **Shows all transfers** (sent and received)
- **Action buttons contextual:**
  - **Accept/Reject:** Only for receiver (destination user)
  - **Cancel:** Only for sender (source user)
- **UI Simplified for Consumer:**
  - Statistics: Shows Total, Received, Pending (hides "Sent")
  - Direction filter: **Hidden completely** (all transfers are "received" for Consumer)
  - Status filter: Shows "All", "Pending", "Accepted", "Rejected" (hides "Cancelled")
- Full UI for Producer, Factory, Retailer

---

## 📝 User Experience by Role

### **Producer**
✅ Can create transfers (send tokens)
✅ Sees "Your Available Tokens" list
✅ Can cancel own pending transfers
❌ Never sees Accept/Reject buttons (doesn't receive)
✅ Views all own tokens

### **Factory**
✅ Can create transfers (send tokens)
✅ Sees "Your Available Tokens" list
✅ Can cancel own pending transfers
✅ Can accept/reject incoming transfers (onlyReceiverAllowed)
✅ Views all own tokens

### **Retailer**
✅ Can create transfers (send tokens)
✅ Sees "Your Available Tokens" list
✅ Can cancel own pending transfers
✅ Can accept/reject incoming transfers (onlyReceiverAllowed)
✅ Views all own tokens

### **Consumer**
❌ Cannot create transfers
✅ **Sees "Your Available Tokens" list** (same position as other roles - before transfer list)
❌ Never sees Cancel button (doesn't send)
✅ Can accept/reject incoming transfers (onlyReceiverAllowed)
✅ Page title: "Incoming Transfers" (not "Transfers")
✅ Description: "Review and manage transfers sent to you"
❌ **"Create New Transfer" section completely hidden** (no form, no message)
✅ **Simplified UI:**
  - Page focused on pending transfers requiring action
  - Statistics: Total, Received, Pending (no "Sent")
  - Direction filter: **Hidden** (all transfers are "received")
  - Status filter: All, Pending, Accepted, Rejected (no "Cancelled")
  - Similar UX to Admin approving user roles
  - **Consistent layout:** Token list in same position for all roles

---

## 🚨 Error Handling

### **Smart Contract Errors:**

If frontend validation fails and a Consumer tries to create a transfer:
```solidity
error NoTransfersAllowed();
```

If a Producer tries to receive a transfer:
```solidity
error NoReceiverAllowed();
```

### **Frontend Prevention:**

The frontend prevents these errors by:
1. **Hiding forms** for unauthorized roles
2. **Showing informative messages** explaining why
3. **Validating permissions** before actions
4. **Contextual UI** based on user role

---

## 🔧 Testing Scenarios

### **Test 1: Consumer - Action-Focused UI**
1. Login as Consumer
2. Navigate to `/transfers`
3. Page title should show: **"Incoming Transfers"** (not "Transfers")
4. Description: "Review and manage transfers sent to you"
5. **SHOULD NOT see "Create New Transfer" section** (completely hidden)
6. **SHOULD see "Your Available Tokens"** (same position as other roles - before transfer list)
7. Statistics should show: Total, Received, Pending (NO "Sent")
8. **Direction filter should be HIDDEN** (all transfers are "received")
9. Status filter should show: All, Pending, Accepted, Rejected (NO "Cancelled")
10. Should see incoming transfers with Accept/Reject buttons
11. Should NOT see Cancel buttons (doesn't send)
12. **Layout consistent with other roles** (tokens before transfers)

### **Test 2: Producer Cannot Receive Transfer**
1. Login as Factory
2. Create transfer to Producer address
3. Producer should NOT see Accept/Reject buttons
4. Transaction would fail at smart contract level

### **Test 3: Factory Can Send and Receive (Full Permissions)**
1. Login as Factory
2. Should see "Create Transfer" form
3. Should see "Your Available Tokens"
4. Should see both sent and received transfers
5. Can Accept/Reject incoming (onlyReceiverAllowed), Cancel outgoing (onlyTransfersAllowed)
6. Views all own tokens

### **Test 4: Full Supply Chain Flow**
```
1. Producer creates token → ✅
2. Producer transfers to Factory → ✅
3. Factory accepts transfer → ✅
4. Factory creates finished product → ✅
5. Factory transfers to Retailer → ✅
6. Retailer accepts transfer → ✅
7. Retailer transfers to Consumer → ✅
8. Consumer accepts transfer → ✅
9. Consumer tries to transfer → ❌ (Blocked by frontend & contract)
```

---

## 📊 Validation Checklist

- [x] Smart contract rules documented
- [x] Frontend validation implemented
- [x] Consumer blocked from creating transfers
- [x] UserTokenList visible for ALL roles (including Consumer)
- [x] Informative messages for restricted actions
- [x] No linter errors
- [x] Aligned with contract logic
- [x] Supply chain flow explained
- [x] Error handling documented
- [x] Testing scenarios defined
- [x] Accept/Reject only for receivers (Factory, Retailer, Consumer)
- [x] Cancel only for senders (Producer, Factory, Retailer)

---

## 🔄 Related Files

- `/sc/src/SupplyChain.sol` - Smart contract with modifiers
- `/web/src/components/CreateTransferForm.tsx` - Transfer creation form
- `/web/src/components/UserTokenList.tsx` - User tokens display
- `/web/src/components/TransferList.tsx` - Transfer list and actions
- `/web/src/contracts/config.ts` - UserRole enum definition

---

## 📅 Last Updated

**Date:** November 23, 2025  
**Reason:** Aligned frontend with smart contract transfer permissions + UX optimization for Consumer  
**Changes:** 
- Added role validation to prevent Consumer from creating transfers
- Consumer CAN view own tokens (UserTokenList visible for all roles)
- Factory, Retailer, Consumer can Accept/Reject incoming transfers (onlyReceiverAllowed)
- Producer, Factory, Retailer can Cancel own sent transfers (onlyTransfersAllowed)
- All roles can view their token inventory
- **NEW: Simplified UI for Consumer role:**
  - Statistics: Hide "Sent" (always 0 for Consumer)
  - Direction filter: **Completely hidden** (all transfers are "received")
  - Status filter: Hide "Cancelled" option (Consumer never cancels)
  - Cleaner, more focused user experience without redundant options

