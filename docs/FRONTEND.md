# 🎨 Frontend - Complete Documentation

> **📋 For the most up-to-date project status, see [STATUS.md](../../STATUS.md)**

Complete documentation of the Supply Chain Tracker project frontend, developed with Next.js 16, React 19, TypeScript, wagmi, viem and Shadcn UI.

**Last Updated**: November 27, 2025

---

## 📋 Table of Contents

1. [Setup y Configuración](#setup-y-configuración)
2. [Web3 Architecture](#web3-architecture)
3. [Components](#components)
4. [Custom Hooks](#custom-hooks)
5. [Pages and Navigation](#pages-and-navigation)
6. [Pausability System](#pausability-system)
7. [Multi-Tab Synchronization](#multi-tab-synchronization)
8. [Transfer Permissions](#transfer-permissions)
9. [Testing Guide](#testing-guide)

---

## 🚀 Setup and Configuration

### Technologies

- **Framework**: Next.js 16.0.1 with App Router
- **UI**: React 19.2.0, TypeScript 5.x
- **Styles**: Tailwind CSS 3.4.14 + Shadcn UI
- **Web3 Stack**:
  - wagmi 2.12.0 (React Hooks for Ethereum)
  - viem 2.21.0 (TypeScript Ethereum library)
  - ethers 6.13.0 (Ethereum interactions)
  - @tanstack/react-query 5.x (Data fetching/caching)
- **Local Blockchain**: Anvil (localhost:8545, Chain ID: 31337)

### Complete Setup - Step by Step

#### **STEP 0**: Initial location
```bash
cd /mnt/backups/emujicad/Documents/master_blockchainweb3/web3/PFM/emujicad
```

#### **STEP 1**: Create Next.js project
```bash
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --src-dir \
  --app \
  --import-alias "@/*" \
  --no-git \
  --skip-install
```

#### **STEP 2**: Add Web3 dependencies
```bash
cd web
npm pkg set dependencies.ethers="^6.13.0"
npm pkg set dependencies.viem="^2.21.0"
npm pkg set dependencies.wagmi="^2.12.0"
npm pkg set dependencies."@rainbow-me/rainbowkit"="^2.1.0"
npm install
```

#### **STEP 3**: Configure Shadcn UI
```bash
npx shadcn@latest add button card label select input table badge dialog alert -y
```

#### **STEP 4**: Copy Smart Contract ABI
```bash
cp ../sc/out/SupplyChain.sol/SupplyChain.json src/contracts/
```

#### **STEP 5**: Create directory structure
```bash
mkdir -p src/contracts src/hooks src/lib
```

### Main Configuration

#### `lib/wagmi-config.ts`
```typescript
import { http, createConfig } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [localhost],
  connectors: [injected()], // MetaMask
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
})
```

#### `contracts/config.ts`
```typescript
import SupplyChainArtifact from './SupplyChain.json'

export const SUPPLY_CHAIN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`
export const SUPPLY_CHAIN_ABI = SupplyChainArtifact.abi

export enum UserRole {
  Producer = 0,
  Factory = 1,
  Retailer = 2,
  Consumer = 3
}

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3
}

export enum TokenType {
  RawMaterial = 0,
  FinishedProduct = 1
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Canceled = 3
}
```

#### `app/layout.tsx`
```typescript
'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi-config'
import { AuthProvider } from '@/contexts/AuthContext'

const queryClient = new QueryClient()

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
```

### Automated Deployment

The `deploy.sh` script manages the entire project lifecycle:

```bash
# Start entire stack
./deploy.sh start

# View service status
./deploy.sh status

# View MetaMask instructions
./deploy.sh metamask

# Stop everything
./deploy.sh stop
```

---

## 🔗 Web3 Architecture

### Implemented Web3 Stack

- **wagmi**: 2.12.0 - React Hooks for Ethereum
- **viem**: 2.21.0 - TypeScript Ethereum library (low level)
- **ethers**: 6.13.0 - Ethereum interactions (compatibility)
- **@tanstack/react-query**: 5.x - State management and caching

### Stack Advantages

- ✅ **Type-safe**: Everything typed with TypeScript
- ✅ **Modern**: wagmi is the current standard (2024+)
- ✅ **Optimized**: viem is faster than ethers.js
- ✅ **Caching**: react-query handles cache automatically
- ✅ **Hooks**: Declarative API with React Hooks

### AuthContext

Global context to handle authentication and authorization:

**Location**: `web/src/contexts/AuthContext.tsx`

**Features**:
- Detects if user is administrator
- Detects if user is approved
- Detects if user is authenticated
- Optimization with `useUserIdByAddress` for fast detection
- Immediate redirect for unregistered users
- Theme preference restoration on authentication

**Usage**:
```typescript
import { useAuth } from '@/contexts/AuthContext'

function Component() {
  const { isAdmin, isApproved, isAuthenticated, userInfo, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please connect your wallet</div>
  if (isAdmin) return <AdminPanel />
  if (isApproved) return <UserDashboard />
  return <PendingApproval />
}
```

### wagmi Hooks Used

#### Connection Hooks
- `useAccount()` - Connected account information
- `useConnect()` - Handles MetaMask connection
- `useDisconnect()` - Handles disconnection

#### Read Hooks
- `useReadContract()` - Reads contract data (view/pure functions)
- `useReadContracts()` - Reads multiple functions in parallel

#### Write Hooks
- `useWriteContract()` - Executes transactions
- `useWaitForTransactionReceipt()` - Waits for transaction confirmation

### Complete Pattern: Write + Wait

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

export function useRequestRole() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const requestRole = (role: string) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'requestUserRole',
      args: [role]
    })
  }
  
  return {
    requestRole,
    isPending,      // Waiting for user in MetaMask
    isConfirming,   // Waiting for blockchain confirmation
    isSuccess,      // Transaction confirmed
    error
  }
}
```

---

## 🎨 Components

### Custom Components (26 total)

#### 1. ConnectWallet.tsx
Component for MetaMask connection/disconnection.

**Features**:
- MetaMask connection using wagmi
- Shows shortened address (0x1234...5678)
- Disconnect button
- Loading states (connecting, isPending)
- Prevents double MetaMask popup

#### 2. Header.tsx
Unified navigation and branding component.

**Features**:
- Two-row layout: (1) Branding + Actions, (2) Address + Role/Status
- Branding: "📦 Supply Chain Tracker"
- Conditional buttons according to page
- User information (address, role, status)
- Integrated theme toggle
- Contract pause status badge

#### 3. ThemeToggle.tsx
Toggle to switch between light and dark mode.

**Features**:
- Persistent state in localStorage
- Default: light mode
- Icons: 🌙 (light mode) / ☀️ (dark mode)
- Smooth transitions

#### 4. RegisterForm.tsx
User registration form with role selection.

**Features**:
- Select with 4 roles: Producer, Factory, Retailer, Consumer
- Selected role validation
- Specific error handling
- Loading states
- Validation when contract is paused

#### 5. ChangeRoleDialog.tsx
Modal dialog to change a user's role.

**Features**:
- Dialog with 4-role select
- New role validation
- Confirmation before changing
- Loading states
- Pause and user status validation

#### 6. UserManagementTable.tsx (Admin)
Complete user management component.

**Features**:
- UserStatsCards integration
- Table with all users
- Status filters: All, Pending, Approved, Rejected, Canceled
- Address search
- Actions per user (Approve, Reject, Cancel, Change Role)
- Auto-refresh after changes

#### 7. UserStatsCards.tsx (Admin)
Cards with system statistics.

**Features**:
- 5 cards with counters (Total, Pending, Approved, Rejected, Canceled)
- Responsive grid
- Visual icons
- Dark mode compatible

#### 8. TokenCard.tsx
Reusable component to display token information.

**Features**:
- Shows complete token information
- Support to show user balance
- Different icons for Raw Material vs Finished Product
- Badge with token ID
- Shows parent token if it's a derived product
- Loading states with Skeleton
- Hover effects

#### 9. TokenCardModern.tsx
Modern version of TokenCard with 2025 design.

**Features**:
- Glassmorphism with `backdrop-blur-xl`
- Blue-purple gradients
- Smooth animations
- Same functionality as TokenCard

#### 10. UserProfileCard.tsx
Component to display the connected user's profile.

**Features**:
- Shows User ID, Address, Role and Status
- Status badges with icons
- Colors by role
- Informative messages according to status
- Loading states with Skeleton

#### 11. QuickActions.tsx
Component with quick action buttons.

**Features**:
- Conditional buttons according to role
- Status validation (only approved users)
- Disabling when contract is paused
- Informative alert when paused

#### 12. PauseControl.tsx (Admin)
Component for administrator to pause/resume the contract.

**Features**:
- Shows current contract status
- Pause button with confirmation (requires typing "PAUSAR")
- Resume button with confirmation
- Alert with list of disabled functions when paused
- Loading states during transactions

#### 13. TransferList.tsx
Transfer list with sent/received separation and filters.

**Features**:
- Separation of sent/received transfers
- Dynamic filters by role
- Token Name shown alongside Token ID
- Action buttons (Accept/Reject/Cancel)
- Clickable addresses with AddressDisplay
- States: Pending, Accepted, Rejected

#### 14. CreateTransferForm.tsx
Form to create new transfers.

**Features**:
- Recipient dropdown filtered by role
- Token dropdown showing name
- Amount validation
- Contract pause validation
- Friendly success messages

#### 15. UserTokenList.tsx
User's token list.

**Features**:
- Shows tokens with balance > 0
- Filtered by token type according to role
- Integration with TokenCard/TokenCardModern
- Loading states and empty states

#### 16. AddressDisplay.tsx
Reusable component to display addresses.

**Features**:
- Truncated address (0x1234...5678)
- Copy to clipboard button
- Tooltip with full address
- Visual indicator of successful copy

#### 17. TraceabilityTimeline.tsx
End-to-end traceability with interactive tree.

### Shadcn UI Components (10 total)

All located in `web/src/components/ui/`:
- `button.tsx` - Buttons with variants
- `card.tsx` - Container with header, content and footer
- `input.tsx` - Text input field
- `label.tsx` - Form label
- `select.tsx` - Dropdown selector
- `table.tsx` - Table with header, body, footer
- `badge.tsx` - Badge/label for states
- `dialog.tsx` - Modal/dialog
- `alert.tsx` - Alerts/notifications
- `skeleton.tsx` - Animated loading placeholder

---

## 🪝 Custom Hooks

### Implemented Hooks (27 total)

#### File: `useContractReads.ts` (7 read hooks)

1. **useUserInfo(address)** - Gets complete user information
2. **useIsAdmin(address)** - Verifies if an address is the admin
3. **useTotalTokens()** - Gets total tokens created
4. **useTotalUsers()** - Gets total registered users
5. **useTotalTransfers()** - Gets total transfers
6. **useDashboardStats()** - Optimized batch hook for statistics
7. **useUserIdByAddress(address?)** - Quickly gets User ID

#### File: `useRequestRole.ts` (1 write hook)

8. **useRequestRole()** - Hook to request a user role

#### File: `useCreateToken.ts` (1 write hook)

9. **useCreateToken()** - Hook to create a new token

#### File: `useTransfer.ts` (4 write hooks)

10. **useTransfer()** - Hook to initiate a transfer
11. **useAcceptTransfer()** - Hook to accept a transfer
12. **useRejectTransfer()** - Hook to reject a transfer
13. **useCancelTransfer()** - Hook to cancel a transfer

#### File: `useGetUserTokens.ts` (4 read hooks)

14. **useGetUserTokens(address?)** - Gets all token IDs owned by a user
15. **useGetToken(tokenId?)** - Gets detailed token information
16. **useGetTokenBalance(tokenId?, address?)** - Gets token balance
17. **useGetAllTokens()** - Gets all tokens in the system

#### File: `usePause.ts` (3 hooks)

18. **useIsPaused()** - Reads contract pause status
19. **usePause()** - Hook to pause the contract (admin only)
20. **useUnpause()** - Hook to resume the contract (admin only)

#### File: `useAdminUsers.ts` (2 admin hooks)

21. **useGetAllUsers()** - Gets all registered users (admin only)
22. **useChangeUserStatus()** - Hook to change a user's status

#### File: `useContractOwner.ts` (1 hook)

23. **useContractOwner()** - Verifies if connected user is the owner

#### File: `usePendingOwner.ts` (1 hook)

24. **usePendingOwner(enabled?)** - Gets the `pendingOwner` address

#### File: `useOwnershipTransfer.ts` (1 hook with 3 functions)

25. **useOwnershipTransfer()** - Hook to manage ownership transfer
   - `initiateOwnershipTransfer(newOwner)`
   - `acceptOwnershipTransfer()`
   - `rejectOwnershipTransfer()`

#### File: `useGetUserTransfers.ts` (1 hook)

26. **useGetUserTransfers(address)** - Gets all transfers of a user

#### File: `useUserTokenStats.ts` (1 hook)

27. **useUserTokenStats()** - Gets token statistics by type

### Hooks Summary by File

| File | Hooks | Type | Status |
|------|-------|------|--------|
| useContractReads.ts | 7 | Read | ✅ |
| useRequestRole.ts | 1 | Write | ✅ |
| useCreateToken.ts | 1 | Write | ✅ |
| useTransfer.ts | 4 | Write | ✅ |
| useAdminUsers.ts | 2 | Read + Write | ✅ |
| useContractOwner.ts | 1 | Read | ✅ |
| useGetUserTokens.ts | 4 | Read | ✅ |
| usePause.ts | 3 | Read + Write | ✅ |
| useUserTokenStats.ts | 1 | Read | ✅ |
| useGetUserTokensWithData.ts | 1 | Read | ✅ |
| useGetUserTransfers.ts | 1 | Read | ✅ |
| usePendingOwner.ts | 1 | Read | ✅ |
| useOwnershipTransfer.ts | 1 | Write | ✅ |
| **TOTAL** | **27** | **17 read + 10 write** | **100%** |

---

## 📄 Pages and Navigation

### Executive Summary

**Status**: ✅ All pages are completed (9/9 - 100%)

### Implemented Pages

1. **`/` (Home)** - Landing page with registration
2. **`/dashboard`** - User/admin dashboard
3. **`/admin/users`** - User management (admin)
4. **`/tokens`** - Token list
5. **`/tokens/[id]`** - Token details with end-to-end traceability
6. **`/tokens/[id]/transfer`** - Transfer form from details
7. **`/transfers`** - Transfer list
8. **`/transfers/[id]`** - Transfer details
9. **`/tokens/create`** - Token creation

---

### Token Details Page (`/tokens/[id]`)

#### 🎯 Purpose
Display complete and detailed information of a specific token, including its transfer history and complete traceability.

#### 📋 Implemented Sections

**1. Main Token Information**
- Header with token name (large and prominent)
- Type badge: Raw Material / Finished Product
- Token ID, Total Supply, My Balance
- Creation date, Creator (with AddressDisplay)
- Parent Token (if Finished Product): ID, name and link to parent token
- Features: JSON metadata parsed and displayed in readable format

**2. Complete Traceability** (Only for Finished Product)
- Traceability tree with hierarchical visualization
- Transformation history: Show how this product was created from raw material
- Parent token information: Link to view parent token details
- Special features:
  - ✅ Tree visualization with expand/collapse
  - ✅ Address filtering in the tree
  - ✅ Node highlighting according to current user role
  - ✅ `useTokenTraceability` hook for complete end-to-end traceability

**3. Transfer History**
- Table of transfers related to this token
- Filters: By status (All, Pending, Accepted, Rejected, Cancelled) and by address (From/To)
- Statistics: Total transfers, accepted, pending, total tokens transferred

**4. Token Distribution**
- List of users with balance of this token
- Percentage of total supply per user

**5. Actions**
- "Transfer Tokens" button: Link to `/tokens/[id]/transfer`
- "Back to Tokens" button: Return to `/tokens`
- "View Parent Token" button: If has parent, view parent token details

#### 📊 Hooks Used
- ✅ `useGetToken(tokenId)` - Token information
- ✅ `useGetTokenBalance(tokenId, address)` - User balance
- ✅ `useGetAllTransfers()` - All transfers (filter by tokenId)
- ✅ `useGetToken(parentTokenId)` - Parent token information (if applicable)
- ✅ `useTokenTraceability(tokenId)` - End-to-end traceability with hierarchical tree

---

### Transfer Page from Details (`/tokens/[id]/transfer`)

#### 🎯 Purpose
Pre-filled transfer form with the selected token, allowing direct transfer from the details page.

#### 📋 Implemented Sections

**1. Token Information to Transfer**
- Card with token summary (name, ID, type, available balance, total supply)
- "View complete details" link → `/tokens/[id]`

**2. Transfer Form**
- Token ID: Pre-selected and locked (not editable)
- Token Name: Shown for reference (read-only)
- Amount: Editable field with validations:
  - Cannot be 0
  - Cannot be negative
  - Cannot exceed available balance
  - Show: "Available balance: X tokens"
- Recipient: Dropdown with available users according to role (automatic filtering):
  - Producer → Only approved Factory
  - Factory → Only approved Retailer
  - Retailer → Only approved Consumer
  - Consumer → Cannot transfer (show message)

**3. Transfer Summary**
- Token: Name and ID
- Amount: X tokens
- Recipient: Address and role
- Balance after: "Your balance will be: X tokens"

**4. Actions**
- "Transfer" button: Send transfer
- "Cancel" button: Return to `/tokens/[id]`
- "Back to Details" button: Return to `/tokens/[id]`

#### ⚠️ Special Validations
- Verify user has sufficient balance
- Verify contract is not paused
- Verify user is approved
- Verify recipient is valid according to role

#### 📊 Hooks Used
- ✅ `useGetToken(tokenId)` - Token information
- ✅ `useGetTokenBalance(tokenId, address)` - User balance
- ✅ `useGetAllUsers()` - Available users according to role (filtered in component)
- ✅ `useTransfer()` - Hook to create transfer
- ✅ `useIsPaused()` - Verify if contract is paused

---

### Navigation Guide

#### Complete Navigation Flow

```
/tokens (token list)
  └── Click on token card
      └── /tokens/[id] (details)
          ├── Click "Transfer Tokens"
          │   └── /tokens/[id]/transfer (form)
          │       ├── Submit → Create transfer → Redirect to /tokens/[id]
          │       └── Cancel/Back → Return to /tokens/[id]
          └── Click "View Parent Token" (if applicable)
              └── /tokens/[parentId] (parent details)
```

#### Step by Step

**Step 1: Go to Token List**
1. **From Header**: Click on "My Tokens" in the top bar
2. **From Dashboard**: Click on "My Tokens" in the dashboard
3. **Direct URL**: `http://localhost:3000/tokens`

**Step 2: View Token Details**
- **Option A**: Click on any token card in `/tokens`
- **Option B**: Direct URL: `http://localhost:3000/tokens/1`

**Step 3: Transfer Tokens from Details**
- From `/tokens/[id]`, click on "Transfer Tokens" button (top right)
- You'll be redirected to `/tokens/[id]/transfer`

**Step 4: Go Back**
- From details: "Back to Tokens" button → Returns to `/tokens`
- From transfer: "Cancel" or "Back to Token Details" button → Returns to `/tokens/[id]`

#### Visual Indicators

**On `/tokens` Page**:
- ✅ **Hover effect**: When hovering, cards slightly elevate
- ✅ **Cursor pointer**: Cursor changes to "hand" when hovering
- ✅ **Increased shadow**: On hover, shadow becomes larger
- ✅ **Entire card is clickable**: Not just the title, the entire card

**On Details Page (`/tokens/[id]`)**:
- ✅ "Transfer Tokens" button visible if you have balance > 0 and can transfer
- ✅ End-to-End Traceability section visible only for Finished Products with parent token
- ✅ Transfer History always visible (may be empty)

#### Common Problems and Solutions

**Problem 1: "I don't see the Transfer Tokens button"**
- Check your balance on the details page
- If you're a Consumer, you can only receive transfers
- If contract is paused, wait for it to be reactivated
- Check your user status in the dashboard

**Problem 2: "I can't click on the cards"**
- Open browser console (F12)
- Look for errors in red
- Reload page (Ctrl+R or Cmd+R)

**Problem 3: "Details page doesn't load"**
- Verify token ID is correct
- Make sure contract is deployed (`./deploy.sh status`)
- Verify MetaMask is connected
- Verify Anvil is running (`./deploy.sh status`)

> **📚 For more details on navigation and troubleshooting, see [docs/RESEARCH.md](./RESEARCH.md#navigation-guide)**

---

## ⏸️ Pausability System

### Contract Status

The contract can be in two states:
- **Active**: All functions are available
- **Paused**: Critical functions disabled

### Functions Affected when Paused

When the contract is paused, the following are disabled:
1. Role requests (`requestRole`)
2. Role changes (`changeRole`)
3. Token creation (`createToken`)
4. Transfers (`transfer`)
5. Accept transfers (`acceptTransfer`)
6. Reject transfers (`rejectTransfer`)
7. Cancel transfers (`cancelTransfer`)
8. User status changes

### Hooks

#### `useIsPaused()`
Hook to read the contract pause status.

```typescript
import { useIsPaused } from '@/hooks/usePause'

function Component() {
  const { data: isPaused, isLoading } = useIsPaused()
  // isPaused = true | false | undefined
  // Auto-refresh every 5 seconds
}
```

#### `usePause()` and `useUnpause()`
Hooks to pause/resume the contract (admin only).

### PauseControl.tsx Component

Main component for the administrator to control pause status.

**Features**:
- Shows current status (Paused/Active) with visual colors
- Pause button with confirmation (requires typing "PAUSAR")
- Resume button with confirmation
- Confirmation dialogs for both actions
- Alert with list of disabled functions when paused

### Component Integration

All components that perform critical actions check pause status:
- `Header.tsx` - Shows visual badge when paused
- `RegisterForm.tsx` - Hides form and shows alert
- `ChangeRoleDialog.tsx` - Validates pause status
- `QuickActions.tsx` - Disables buttons
- `UserManagementTable.tsx` - Disables actions
- `Dashboard Page` - Disables "Create Token" button

---

## 🔄 Multi-Tab Synchronization

### Current Status

**Implemented (Day 2 - Simplified Version)**:
- ✅ Disconnection synchronization between tabs
- ✅ Persistence of last connected address in localStorage
- ✅ Detection of account changes in MetaMask

**POSTPONED**:
- ⏸️ Automatic reconnection when another tab connects (caused race conditions)
- ⏸️ Complete state synchronization between tabs

### Technologies Used

1. **localStorage**: To persist session between tabs
2. **StorageEvent API**: To detect changes in localStorage from other tabs
3. **MetaMask Events**: To detect account changes/disconnection from wallet

### Synchronization Flows

#### 1. Disconnection in Tab B
```
Tab B: User disconnects → localStorage cleared
    ↓
Tab A: Detects change → Automatically disconnects
Tab C: Detects change → Automatically disconnects
```

#### 2. Account Change in MetaMask
```
MetaMask: User changes account → accountsChanged event
    ↓
All tabs: Detect change → Update localStorage
```

### Storage Keys

```typescript
const STORAGE_KEY = 'lastConnectedAddress'
const SESSION_STORAGE_KEY = 'wallet_connection_session'
```

---

## 🔐 Transfer Permissions

### Smart Contract Rules

The smart contract defines strict rules about who can send and receive transfers:

#### Transfer Functions and Their Permissions

1. **`transfer()`** - Create Transfer (SEND)
   - **Who can call**: Producer, Factory, Retailer
   - **Blocked**: Consumer
   - **Creates**: Transfer in `Pending` status

2. **`acceptTransfer()`** - Accept Transfer (RECEIVE)
   - **Who can call**: Factory, Retailer, Consumer
   - **Blocked**: Producer
   - **Condition**: Transfer must be in `Pending` status AND caller must be the recipient

3. **`rejectTransfer()`** - Reject Transfer (RECEIVE)
   - **Who can call**: Factory, Retailer, Consumer
   - **Blocked**: Producer
   - **Condition**: Transfer must be in `Pending` status AND caller must be the recipient

4. **`cancelTransfer()`** - Cancel Own Transfer (SEND)
   - **Who can call**: Producer, Factory, Retailer
   - **Blocked**: Consumer
   - **Condition**: Transfer must be in `Pending` status AND caller must be the sender

### Role Permissions Matrix

| Role | Can Create Tokens | Can SEND Transfers | Can RECEIVE Transfers | Can View Own Tokens |
|------|-------------------|--------------------|-----------------------|---------------------|
| **Producer** | ✅ YES (RowMaterial) | ✅ YES | ❌ NO | ✅ YES |
| **Factory** | ✅ YES (Both types) | ✅ YES | ✅ YES (Accept/Reject) | ✅ YES |
| **Retailer** | ❌ NO | ✅ YES | ✅ YES (Accept/Reject) | ✅ YES |
| **Consumer** | ❌ NO | ❌ NO | ✅ YES (Accept/Reject) | ✅ YES |

### Supply Chain Flow

```
Producer → Factory → Retailer → Consumer
   │          │          │          │
   │          │          │          └─ Only receives
   │          │          └─ Can send & receive
   │          └─ Can send & receive
   └─ Only sends (produces raw materials)
```

### Frontend Implementation

#### CreateTransferForm.tsx
- Validates user role before showing form
- Consumer sees informative message instead of form
- Only Producer, Factory, and Retailer can access the form

#### TransferList.tsx
- Shows all transfers (sent and received)
- Contextual action buttons:
  - **Accept/Reject**: Only for receiver
  - **Cancel**: Only for sender
- Simplified UI for Consumer:
  - Statistics: Shows Total, Received, Pending (hides "Sent")
  - Address filter: **Completely hidden**
  - Status filter: Shows "All", "Pending", "Accepted", "Rejected" (hides "Cancelled")

---

## 🧪 Testing Guide

### Testing Checklist

#### 1. Token Creation (`/tokens/create`)

##### 1.1. Create Raw Material Token (Producer)
- [ ] Connect wallet as approved Producer
- [ ] Navigate to `/tokens/create?type=raw`
- [ ] Verify form shows correct fields
- [ ] Fill form and create token
- [ ] Verify success message and redirect

##### 1.2. Create Finished Product Token (Factory)
- [ ] Connect wallet as approved Factory
- [ ] Ensure having balance of a Raw Material token
- [ ] Navigate to `/tokens/create?type=product`
- [ ] Verify it shows "Parent Token" field
- [ ] Select Parent Token and create product
- [ ] Verify parent token balance decreased

##### 1.3. Insufficient Balance Validation
- [ ] Try to create Finished Product with balance 0
- [ ] Verify fields are disabled
- [ ] Verify insufficient balance message

##### 1.4. Paused Contract Validation
- [ ] As Admin, pause the contract
- [ ] Try to create token as Producer/Factory
- [ ] Verify alert message and disabled form

#### 2. Token Visualization (`/tokens`)

##### 2.1. Own Token List
- [ ] Connect wallet with tokens
- [ ] Navigate to `/tokens`
- [ ] Verify that ONLY tokens with balance > 0 are shown
- [ ] Verify displayed information (name, type, balance, ID)

##### 2.2. Type Filters (According to Role)
- [ ] As Producer: Verify that type filter does NOT appear
- [ ] As Factory: Verify that type filter DOES appear
- [ ] Test filters: "All Types", "Raw Material", "Finished Product"

##### 2.3. Name Search
- [ ] Search "plátano" (with accent)
- [ ] Verify it finds tokens named "Plátano"
- [ ] Search "banana" (without accent)
- [ ] Verify it also finds "Plátano" (flexible search)

##### 2.4. Pagination
- [ ] Create more than 12 tokens
- [ ] Verify maximum 12 tokens per page are shown
- [ ] Test pagination controls

#### 3. Dashboard (`/dashboard`)

##### 3.1. Profile Visualization
- [ ] Connect wallet
- [ ] Navigate to `/dashboard`
- [ ] Verify UserProfileCard with correct information

##### 3.2. Token Statistics by Type
- [ ] Verify "Token Statistics" table
- [ ] Verify it shows types with balance > 0

##### 3.3. Own Token List
- [ ] Verify "My Tokens" section
- [ ] Verify maximum 6 tokens visible
- [ ] Verify "View All" button redirects to `/tokens`

##### 3.4. Quick Actions
- [ ] As Producer: Verify "Create Raw Material" button
- [ ] As Factory: Verify "Create Product" button
- [ ] As Retailer/Consumer: Verify creation buttons do NOT appear

##### 3.5. Admin Panel
- [ ] As Admin, navigate to `/dashboard`
- [ ] Verify global statistics
- [ ] Verify Pause Control (PauseControl)
- [ ] Verify "Manage Users" button

#### 4. Validations and Edge Cases

##### 4.1. Redirects
- [ ] Unconnected user tries to access `/tokens` → redirects to `/`
- [ ] Unapproved user tries to access `/tokens` → redirects to `/`
- [ ] Admin tries to access `/tokens` → redirects to `/dashboard`

##### 4.2. Loading States
- [ ] Verify skeleton loaders during data loading
- [ ] Verify no flickering when refreshing data
- [ ] Verify error messages if loading fails

##### 4.3. Modern Design
- [ ] Verify modern design is active (if `NEXT_PUBLIC_MODERN_DESIGN=true`)
- [ ] Verify glassmorphism in cards
- [ ] Verify gradients and animations
- [ ] Verify it works in light and dark mode

### Success Criteria

Implementation is successful if:
1. ✅ All tests pass
2. ✅ No errors in browser console
3. ✅ User experience is smooth and uninterrupted
4. ✅ Validations work correctly
5. ✅ Design is responsive and accessible

---

## 📊 File Summary

### Complete Structure

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ✅ Providers configured
│   │   ├── page.tsx            ✅ Landing with stats
│   │   └── globals.css         ✅ Tailwind base
│   ├── components/
│   │   ├── ui/                 ✅ 10 Shadcn components
│   │   ├── ConnectWallet.tsx   ✅ Custom component
│   │   ├── Header.tsx          ✅ Unified navigation
│   │   ├── ThemeToggle.tsx     ✅ Theme toggle
│   │   ├── RegisterForm.tsx    ✅ Registration form
│   │   ├── ChangeRoleDialog.tsx ✅ Role change dialog
│   │   ├── TokenCard.tsx       ✅ Token card
│   │   ├── TokenCardModern.tsx ✅ Modern 2025 card
│   │   ├── UserProfileCard.tsx  ✅ User profile
│   │   ├── QuickActions.tsx    ✅ Quick actions
│   │   ├── TransferList.tsx     ✅ Transfer list
│   │   ├── CreateTransferForm.tsx ✅ Transfer form
│   │   ├── UserTokenList.tsx     ✅ User token list
│   │   ├── AddressDisplay.tsx    ✅ Address display
│   │   ├── TraceabilityTimeline.tsx ✅ Traceability
│   │   └── admin/
│   │       ├── UserManagementTable.tsx ✅ User management
│   │       ├── UserStatsCards.tsx      ✅ User stats
│   │       └── PauseControl.tsx         ✅ Pause control
│   ├── contracts/
│   │   ├── config.ts           ✅ Address + ABI + Enums
│   │   └── SupplyChain.json   ✅ Complete ABI
│   ├── hooks/
│   │   ├── useContractReads.ts ✅ 7 read hooks
│   │   ├── useRequestRole.ts   ✅ Write hook
│   │   ├── useCreateToken.ts   ✅ Write hook
│   │   ├── useTransfer.ts      ✅ 4 write hooks
│   │   ├── useGetUserTokens.ts ✅ 4 read hooks
│   │   ├── usePause.ts         ✅ 3 pause hooks
│   │   ├── useAdminUsers.ts    ✅ 2 admin hooks
│   │   ├── useContractOwner.ts ✅ Owner hook
│   │   ├── usePendingOwner.ts  ✅ Pending owner hook
│   │   ├── useOwnershipTransfer.ts ✅ Ownership hook
│   │   ├── useGetUserTransfers.ts ✅ Transfers hook
│   │   └── useUserTokenStats.ts ✅ Stats hook
│   ├── contexts/
│   │   └── AuthContext.tsx    ✅ Authentication context
│   └── lib/
│       ├── utils.ts            ✅ cn() helper
│       └── wagmi-config.ts     ✅ Anvil config
├── public/                     ✅ Static assets
├── package.json                ✅ All deps installed
├── tsconfig.json               ✅ TypeScript config
├── tailwind.config.js          ✅ Tailwind config
├── next.config.ts              ✅ Next.js config
└── components.json             ✅ Shadcn config
```

### Metrics

- **Files created**: 40+ new files
- **Lines of code**: ~5000+ productive code lines
- **Hooks implemented**: 27 hooks (17 read + 10 write)
- **UI Components**: 26 components (10 Shadcn + 16 custom)
- **Pages implemented**: 9/9 pages (100%)
- **Modern Design 2025**: Applied to 5 main pages

---

## 🔗 References

- **Project Status**: [STATUS.md](../../STATUS.md)
- **Smart Contract**: [docs/SMART_CONTRACT.md](./SMART_CONTRACT.md)
- **Changelog**: [CHANGELOG.md](../../CHANGELOG.md)
- **Contributing**: [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Last Updated**: November 27, 2025

