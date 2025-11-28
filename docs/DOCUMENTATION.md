# 📚 Complete Documentation - Supply Chain Tracker

**Last Updated**: November 28, 2025  
**Version**: 2.2.0  
**Project**: Supply Chain DApp (PFM Web3)

> **📋 For the most up-to-date project status, see [STATUS.md](../STATUS.md)**

---

## 📑 Table of Contents

1. [Project Summary](#project-summary)
2. [Architecture](#architecture)
3. [Smart Contract](#smart-contract)
4. [Frontend](#frontend)
5. [Automated Deployment](#automated-deployment)
6. [Manual Deployment Guide](#manual-deployment-guide-no-scripts)
7. [MetaMask Configuration](#metamask-configuration)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Roadmap](#roadmap)

---

## 📖 Project Summary

Supply Chain Tracker is a decentralized DApp for managing supply chains through blockchain. It allows registering users with specific roles, creating tokens that represent products/raw materials, and performing transfers between chain participants.

### **Technology Stack**:

**Backend (Smart Contract)**:
- Solidity 0.8.30
- Foundry (Forge, Anvil, Cast)
- OpenZeppelin Contracts (Ownable, Pausable)

**Frontend**:
- Next.js 16.0.1 with App Router
- React 19.2.0
- TypeScript 5.x
- Tailwind CSS 3.4.14 + Shadcn UI
- wagmi 2.12.0 + viem 2.21.0 + ethers 6.13.0

**Local Blockchain**:
- Anvil (localhost:8545, Chain ID: 31337)

### **Project Metrics**:

> **📋 For updated metrics, see [STATUS.md](../STATUS.md)**

- **Smart Contract**: 970+ lines of code
- **Tests**: 108 tests (100% passing) - 64 core + 44 edge cases
- **Coverage**: 85.60% lines, 82.67% statements, 72.15% branches, 80.95% functions
- **Critical validations**: 5 implemented (100% completed)
- **Frontend**: ~4,000+ lines of productive code
- **Hooks**: 22 custom hooks (12 files)
- **Components**: 26 components (15 custom + 11 Shadcn UI)
- **Pages**: 9 of 9 implemented (100%) - All with Modern Design 2025
- **Frontend Tests**: 17 tests (14 unit + 3 E2E) passing
- **Development time**: ~61-68 hours (Days 1-7)
- **Status**: 7.4/9.5 ✅ PASSING (100% Frontend, critical validations completed)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USERS (MetaMask)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js 16)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Pages     │  │ Components │  │   Hooks    │           │
│  │  (App      │  │ (Shadcn    │  │  (wagmi    │           │
│  │  Router)   │  │   UI)      │  │   custom)  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ JSON-RPC (wagmi/viem)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              BLOCKCHAIN (Anvil Local)                       │
│                Chain ID: 31337                              │
│                Port: 8545                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Smart Contract Calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         SMART CONTRACT (SupplyChain.sol)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Users    │  │   Tokens   │  │ Transfers  │           │
│  │ Management │  │ Management │  │ Management │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                             │
│  Features:                                                  │
│  • Role-based access (Producer, Manufacturer, etc.)        │
│  • Token creation (RowMaterial, FinishedProduct)           │
│  • Transfer system (Pending, Accepted, Rejected)           │
│  • Admin panel (Approve/Reject/Suspend users)              │
│  • Pausability (Emergency stop)                            │
└─────────────────────────────────────────────────────────────┘
```

### **Data Flow**:

1. **User** opens the DApp in the browser
2. **Frontend** loads and connects to MetaMask
3. **MetaMask** connects to Anvil (local blockchain)
4. **Wagmi/Viem** facilitate communication with the contract
5. **Smart Contract** executes business logic
6. **Blockchain** records all transactions
7. **Frontend** displays results to the user

---

## 📜 Smart Contract

### **Location**: `sc/src/SupplyChain.sol`

### **Main Features**:

#### **1. User Management**:
```solidity
// Available roles
enum UserRole {
    Producer,      // Raw material producer
    Manufacturer,  // Product manufacturer
    Distributor,   // Distributor
    Retailer       // Retailer
}

// User states
enum UserStatus {
    Pending,    // Pending approval
    Approved,   // Approved
    Rejected,   // Rejected
    Suspended   // Suspended
}

// Main functions
requestUserRole(UserRole role)           // Request role
changeStatusUser(address, UserStatus)    // Change status (admin)
getUserInfo(address) → User              // Get info
```

#### **2. Token Management**:
```solidity
// Token types
enum TokenType {
    RowMaterial,      // Raw material
    FinishedProduct   // Finished product
}

// Creation function
createToken(
    string name,
    TokenType tokenType,
    uint256 totalSupply,
    string features,
    uint256 parentId
) → uint256 tokenId

// Query functions
getToken(uint256 tokenId) → Token
getTokenBalance(address user, uint256 tokenId) → uint256
getUserTokens(address user) → uint256[]
getTotalTokens() → uint256
```

#### **3. Transfer System**:
```solidity
// Transfer states
enum TransferStatus {
    Pending,   // Pending
    Accepted,  // Accepted
    Rejected,  // Rejected
    Cancelled  // Cancelled
}

// Main functions
transfer(address to, uint256 tokenId, uint256 amount) → uint256
acceptTransfer(uint256 transferId)
rejectTransfer(uint256 transferId)
cancelTransfer(uint256 transferId)
getTransfer(uint256 transferId) → Transfer
```

#### **4. Administrative Functions**:
```solidity
// Owner only
changeStatusUser(address user, UserStatus status)
pause()    // Pause contract
unpause()  // Resume contract
transferOwnershipProposal(address newOwner)
acceptOwnership()

// Queries
isAdmin(address) → bool
isPaused() → bool
owner() → address
```

### **Events**:
```solidity
event UserRegistered(address indexed user, UserRole role)
event UserStatusChanged(address indexed user, UserStatus status)
event TokenCreated(uint256 indexed tokenId, string name, TokenType tokenType)
event TransferCreated(uint256 indexed transferId, address from, address to)
event TransferStatusChanged(uint256 indexed transferId, TransferStatus status)
event OwnershipTransferProposed(address indexed currentOwner, address indexed newOwner)
```

### **Testing**:

**Test files**:
- `sc/test/SupplyChain.t.sol` - 55 tests core
- `sc/test/EdgeCasesTest.t.sol` - 18 tests de casos edge

**Cobertura**:
```
Lines:      85.60%
Statements: 82.67%
Branches:   72.15%
Functions:  80.95%
```

**Run tests**:
```bash
cd sc

# All tests
forge test

# Con verbosidad
forge test -vv

# Tests específicos
forge test --match-test testCreateToken

# Con coverage
forge coverage
```

---

## 🎨 Frontend

### **Location**: `web/`

### **Project Structure**:

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with providers
│   │   ├── page.tsx            # Landing page with stats
│   │   ├── globals.css         # Global styles
│   │   └── admin/
│   │       └── users/
│   │           └── page.tsx    # Admin panel - user management
│   │
│   ├── components/
│   │   ├── ui/                 # Shadcn UI components (9)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── alert.tsx
│   │   │
│   │   ├── admin/              # Admin components
│   │   │   ├── UserManagementTable.tsx  # Table + filters + actions
│   │   │   └── UserStatsCards.tsx       # Statistics cards
│   │   │
│   │   ├── ConnectWallet.tsx   # Wallet connection
│   │   ├── Header.tsx          # Unified navigation + branding
│   │   ├── ThemeToggle.tsx     # Light/dark mode
│   │   ├── RegisterForm.tsx    # User registration form
│   │   └── ChangeRoleDialog.tsx # Change role dialog
│   │
│   ├── contexts/
│   │   └── Web3Context.tsx     # Multi-tab sync
│   │
│   ├── contracts/
│   │   ├── config.ts           # Address + ABI + Enums
│   │   └── SupplyChain.json    # Contract ABI
│   │
│   ├── hooks/
│   │   ├── useContractReads.ts    # 5 read hooks
│   │   ├── useRequestRole.ts      # Request role
│   │   ├── useCreateToken.ts      # Create token
│   │   ├── useTransfer.ts         # 4 transfer hooks
│   │   ├── useAdminUsers.ts       # 2 admin hooks (getAllUsers, changeStatus)
│   │   ├── useContractOwner.ts    # Verify ownership
│   │   ├── useGetUserTokens.ts    # 4 token hooks (getUserTokens, getToken, getTokenBalance, useGetAllTokens)
│   │   ├── usePause.ts            # 3 pause hooks (isPaused, pause, unpause)
│   │   ├── useUserTokenStats.ts   # Statistics by type
│   │   ├── useGetUserTokensWithData.ts # Tokens with complete data
│   │   └── useGetUserTransfers.ts # User transfers
│   │
│   └── lib/
│       ├── utils.ts            # cn() helper
│       └── wagmi-config.ts     # Config Anvil
│
├── public/                     # Static assets
├── package.json                # Dependencias
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
├── next.config.ts              # Next.js config
├── components.json             # Shadcn config
└── README.md                   # Frontend documentation
```

### **Web3 Configuration**:

#### **wagmi-config.ts**:
```typescript
import { http, createConfig } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [localhost],
  connectors: [injected()],  // MetaMask
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
})
```

#### **contracts/config.ts**:
```typescript
// Contract address (automatically updated by deploy.sh)
export const SUPPLY_CHAIN_ADDRESS = '0x5FbDB...' as `0x${string}`

// Imported ABI
export const SUPPLY_CHAIN_ABI = SupplyChainArtifact.abi

// Enums (must match exactly with Solidity)
export enum UserRole { Producer = 0, Manufacturer = 1, ... }
export enum UserStatus { Pending = 0, Approved = 1, ... }
export enum TokenType { RowMaterial = 0, FinishedProduct = 1 }
export enum TransferStatus { Pending = 0, Accepted = 1, ... }
```

### **Custom Hooks**:

#### **useContractReads.ts** (Lectura):
```typescript
// Obtener información de usuario
useUserInfo(address) → { data, isLoading, error }

// Verificar si es admin
useIsAdmin(address) → { data: boolean, isLoading, error }

// Estadísticas
useTotalTokens() → { data: bigint, isLoading, error }
useTotalUsers() → { data: bigint, isLoading, error }
useTotalTransfers() → { data: bigint, isLoading, error }
```

#### **useRequestRole.ts** (Write):
```typescript
const { requestRole, isPending, isConfirming, isSuccess, hash } = useRequestRole()

// Usage
requestRole(UserRole.Producer)
```

#### **useCreateToken.ts** (Write):
```typescript
const { createToken, isPending, isConfirming, isSuccess } = useCreateToken()

// Usage
createToken('Madera', TokenType.RowMaterial, BigInt(1000), '{}', BigInt(0))
```

#### **useTransfer.ts** (Write):
```typescript
const { transfer, acceptTransfer, rejectTransfer, cancelTransfer, isPending } = useTransfer()

// Usage
transfer('0x123...', BigInt(1), BigInt(100))
acceptTransfer(BigInt(5))
```

### **Components**:

#### **ConnectWallet.tsx**:
```typescript
// Muestra botón de conexión o dirección + botón desconectar
<ConnectWallet />

// Internamente usa:
// - useAccount() para obtener address e isConnected
// - useConnect() para listar connectors y conectar
// - useDisconnect() para desconectar
```

#### **Landing Page (page.tsx)**:
- Header with title + ConnectWallet
- Stats cards (tokens, users, transfers) when connected
- Dynamic welcome message
- Responsive design (Tailwind)

---

## 🤖 Automated Deployment

### **Script**: `deploy.sh` (Linux/macOS)

**Version**: 2.2.0  
**Status**: ✅ Production Ready  
**Compatibility**: Linux (Ubuntu, Debian, Fedora, Arch, openSUSE) and macOS

Complete bash script that automates the ENTIRE deployment process. Fully tested on both Linux and macOS.

#### **Key Features**:
- ✅ **Automatic Foundry Installation**: Installs forge/anvil automatically if missing (uses foundryup)
- ✅ **OS Detection**: Automatically detects Linux or macOS and adapts commands
- ✅ **Dependency Management**: Installs npm packages and forge dependencies automatically
- ✅ **State Persistence**: Anvil state persists between restarts
- ✅ **Process Management**: Intelligent detection of running services
- ✅ **Logs Organization**: All logs in `logs/` directory

### **Available Commands**:

```bash
# Ver ayuda completa
./deploy.sh help

# Comandos principales
./deploy.sh start      # Inicia todo el stack (Anvil + Contract + Frontend)
./deploy.sh stop       # Detiene todos los servicios
./deploy.sh restart    # Reinicia todo el stack
./deploy.sh status     # Muestra el estado de los servicios
./deploy.sh metamask   # Muestra instrucciones para configurar MetaMask
./deploy.sh clean      # Limpia el estado persistente de Anvil

# Comandos de configuración
./deploy.sh setup      # Verifica requisitos e instala dependencias faltantes
./deploy.sh env        # Configura variables de entorno (.env.local)

# Comandos de frontend (sin afectar Anvil/Contrato)
./deploy.sh frontend start    # Inicia solo el frontend
./deploy.sh frontend stop     # Detiene solo el frontend
./deploy.sh frontend restart  # Reinicia solo el frontend
```

### **Options**:

```bash
# Automatic mode (no confirmations)
./deploy.sh setup --yes
./deploy.sh start --auto
./deploy.sh env -y

# Configure environment variables via parameters (only .env.local)
./deploy.sh env --modern-design true --debug-mode false
./deploy.sh env --debug-tokens true
./deploy.sh env --all true false false  # Todas las variables a la vez

# Configure environment variables directly when starting (updates .env.local BEFORE start)
./deploy.sh start --debug-mode false --debug-tokens false
./deploy.sh start --all true false false   # MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false
```

### **Flow of `./deploy.sh start`**:

**Important**: Before starting services, the script automatically runs `pre_start_check()` which verifies and installs all requirements. See [Automatic Pre-Start Check](#automatic-pre-start-check) section for details.

#### **STEP 0: Pre-Start Check** (Automatic)

Before starting any service, the script:
1. Verifies system tools (installs if missing)
2. Verifies Node.js, npm (shows installation instructions if missing)
3. **Verifies Foundry (forge/anvil)** - **Installs automatically if missing** using foundryup
4. Verifies project dependencies (installs if missing)
5. Checks environment variables (prompts to create if missing)

**Foundry Auto-Installation**: If Foundry is not installed, the script will:
- Download the foundryup installer from `https://foundry.paradigm.xyz`
- Run the installer automatically
- Update PATH to include `~/.foundry/bin`
- Verify installation of `forge` and `anvil`

If any critical requirement is missing and cannot be installed, the script aborts with clear instructions.

#### **STEP 1: Start Anvil**
```bash
# The script executes:
nohup anvil \
    --host 127.0.0.1 \
    --port 8545 \
    --chain-id 31337 \
    > logs/anvil.log 2>&1 &

# Saves PID in logs/anvil.pid
# Waits for port 8545 to be available
# Verifies that Anvil is running
```

**Result**:
- ✅ Anvil running at `http://127.0.0.1:8545`
- ✅ 10 accounts with 10,000 ETH each
- ✅ Chain ID: 31337
- ✅ Logs in `logs/anvil.log`

#### **STEP 2: Deploy Contract**
```bash
# The script executes:
cd sc
PRIVATE_KEY=0xac097... forge script \
    script/SupplyChainDeploy.s.sol:SupplyChainDeployScript \
    --rpc-url http://127.0.0.1:8545 \
    --broadcast

# Extracts contract address from output
# Saves in logs/contract_address.txt
```

**Result**:
- ✅ Contract deployed at address `0x5FbDB...`
- ✅ Owner: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- ✅ Logs in `logs/deploy.log`

#### **STEP 3: Update Frontend Config**
```bash
# The script executes:
# 1. Makes backup of config.ts
cp web/src/contracts/config.ts web/src/contracts/config.ts.backup

# 2. Updates SUPPLY_CHAIN_ADDRESS with sed (OS-specific syntax)
# Linux:
sed -i "s/export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]\{40\}'/export const SUPPLY_CHAIN_ADDRESS = '$contract_address'/" config.ts
# macOS:
sed -i '' "s/export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]\{40\}'/export const SUPPLY_CHAIN_ADDRESS = '$contract_address'/" config.ts

# 3. Copies updated ABI from sc/out/SupplyChain.sol/SupplyChain.json
cp sc/out/SupplyChain.sol/SupplyChain.json web/src/contracts/SupplyChain.json

# 4. Verifies that it was updated correctly
```

**Result**:
- ✅ `config.ts` updated with new address
- ✅ Backup saved in `config.ts.backup`
- ✅ ABI copied from latest compilation (`SupplyChain.json`)

#### **STEP 4: Start Frontend**
```bash
# The script executes:
cd web
nohup npm run dev > logs/frontend.log 2>&1 &

# Save PID in logs/frontend.pid
# Waits for port 3000 to be available
# Verifies that Next.js is running
```

**Result**:
- ✅ Frontend running at `http://localhost:3000` (and accessible from any IP on your network)
- ✅ Logs in `logs/frontend.log`

**Network Access**: The frontend is configured to listen on `0.0.0.0`, which means it's accessible from:
- **Localhost**: `http://localhost:3000` (from the same computer)
- **Network IP**: `http://<your-ip>:3000` (from other devices on your local network)
  - The script automatically detects and displays your local IP address
  - Example: `http://192.168.1.100:3000`

**Note**: Anvil remains on `127.0.0.1:8545` (localhost only) for security. The frontend acts as a proxy and connects to Anvil locally on the server machine.

#### **STEP 5: Show Instructions**
```bash
# The script shows:
# - Access URLs (Anvil + Frontend)
# - Contract address
# - MetaMask instructions
# - Useful commands (status, stop)
```

### **Logs Structure**:

```
logs/
├── anvil.log              # Complete Anvil output
├── anvil.pid              # Anvil process PID
├── anvil_state.json       # Persistent Anvil state (tokens, transfers, users)
├── frontend.log           # Next.js dev server output
├── frontend.pid           # Next.js process PID
├── deploy.log             # Foundry deployment output
├── contract_address.txt   # Contract address (saved after deployment)
└── install.log            # Installation logs (system tools, dependencies)
```

**Log Locations**:
- All logs are saved in the `logs/` directory at the project root
- Logs are automatically created when services start
- Installation logs (`install.log`) are created when running `setup` or when dependencies are installed automatically

**Note on persistence**: The `anvil_state.json` file contains the complete state of the local blockchain. If you delete it (with `./deploy.sh clean`), Anvil will start with a clean blockchain on the next `start`.

---

### **Command: `./deploy.sh setup`**

Verifies all requirements and automatically installs missing dependencies.

#### **What it does**:

1. **Verifies System Tools**:
   - Checks for: `lsof`, `netstat`, `curl`, `pgrep`
   - On Linux: Also checks for `ss`
   - On macOS: `ss` is not checked (not available)
   - Automatically installs missing tools using:
     - **Linux**: `apt-get`, `dnf`, `pacman`, or `zypper` (depending on distribution)
     - **macOS**: `brew` (Homebrew)

2. **Verifies Basic Requirements**:
   - **Node.js** v18+ (shows installation instructions if missing)
   - **npm** (comes with Node.js)
   - **Foundry** (`forge` and `anvil` commands)
   - Shows OS-specific installation instructions if missing

3. **Verifies Project Dependencies**:
   - **Frontend**: Checks if `web/node_modules` exists
   - **Smart Contract**: Checks if `sc/lib/forge-std` exists
   - Automatically installs missing dependencies:
     - Frontend: `npm install` in `web/` directory
     - Smart Contract: `forge install` in `sc/` directory

4. **Configures Environment Variables** (optional):
   - Prompts to configure `.env.local` if it doesn't exist
   - Can be skipped and configured later with `./deploy.sh env`

#### **Usage**:

```bash
# Interactive mode (asks for confirmation)
./deploy.sh setup

# Automatic mode (no confirmations, uses defaults)
./deploy.sh setup --yes
```

#### **What gets installed automatically**:

- **System Tools** (if missing):
  - Linux: `lsof`, `net-tools`, `iproute2`, `curl`, `procps` (or `procps-ng` on Arch)
  - macOS: Most tools come preinstalled, only installs if truly missing

- **Project Dependencies** (if missing):
  - Frontend: All npm packages (can take 5-15 minutes)
  - Smart Contract: `forge-std` and other Foundry dependencies

#### **Logs**:

All installation logs are saved to `logs/install.log` for troubleshooting.

---

### **Command: `./deploy.sh env`**

Configures frontend environment variables in `web/.env.local`.

#### **Available Variables**:

- `NEXT_PUBLIC_MODERN_DESIGN`: Modern design 2025 (glassmorphism, gradients, animations)
  - Options: `true` | `false`
  - Default: `true`

- `NEXT_PUBLIC_DEBUG_MODE`: Additional console logs
  - Options: `true` | `false`
  - Default: `false`

- `NEXT_PUBLIC_DEBUG_TOKENS`: Additional token information
  - Options: `true` | `false`
  - Default: `false`

#### **Usage Modes**:

**1. Interactive Mode** (recommended for first time):
```bash
./deploy.sh env
# Prompts for each variable with default suggestions
```

**2. Parameter Mode** (individual variables):
```bash
./deploy.sh env --modern-design true
./deploy.sh env --debug-mode false
./deploy.sh env --debug-tokens true
```

**3. All-at-once Mode**:
```bash
./deploy.sh env --all true false false
# Sets: MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false (recommended default values)
```

**4. Automatic Mode** (uses defaults):
```bash
./deploy.sh env --yes
# Creates .env.local with default values:
# MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false
```

**5. From `start` (recommended to force debug off before starting)**:
```bash
# Updates .env.local and then starts the entire stack
./deploy.sh start --debug-mode false --debug-tokens false
./deploy.sh start --all true false false   # MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false
```

#### **File Created**:

The command creates/updates `web/.env.local` with the configured values.

**Important**: The file must be named `.env.local` (not `.env.example`). The `.env.example` file is just a template for reference.

---

### **Automatic Pre-Start Check**

When you run `./deploy.sh start`, the script automatically runs `pre_start_check()` **before** starting services.

#### **What it verifies**:

1. **System Tools**: Same as `./deploy.sh setup` (checks and installs if needed)
2. **Basic Requirements**: Node.js, npm, Foundry (shows instructions if missing)
3. **Project Dependencies**: `node_modules` and `forge-std` (installs if missing)
4. **Environment Variables**: Checks if `.env.local` exists (prompts to create if missing)

#### **Behavior**:

- **Interactive Mode**: Asks for confirmation before installing missing dependencies
- **Automatic Mode** (`--yes`/`--auto`/`-y`): Installs everything automatically with defaults
- **If critical errors**: Script aborts and shows instructions to fix issues

#### **Example Flow**:

```bash
./deploy.sh start
# 1. Runs pre_start_check()
#    - Checks system tools ✅
#    - Checks Node.js ✅
#    - Checks npm ✅
#    - Checks Foundry ✅
#    - Checks node_modules ❌ (missing)
#    - Asks: "Install frontend dependencies? (S/n)"
#    - User confirms → Installs npm packages
#    - Checks .env.local ❌ (missing)
#    - Asks: "Configure environment variables? (S/n)"
#    - User confirms → Runs setup_environment_variables()
# 2. Starts Anvil
# 3. Deploys contract
# 4. Updates frontend config
# 5. Starts frontend
```

---

### **Linux/macOS Compatibility**

The script automatically detects the operating system and adapts commands accordingly. **Tested on macOS (darwin 25.1.0) and Linux (Ubuntu, Debian, Fedora, Arch)**.

#### **OS Detection**:

- **macOS**: Detected via `OSTYPE == "darwin*"`
- **Linux**: Detected via `OSTYPE == "linux-gnu*"` and distribution detection

#### **Differences Handled**:

1. **System Tools**:
   - **Linux**: Verifies `lsof`, `netstat`, `ss`, `curl`, `pgrep`
   - **macOS**: Verifies `lsof`, `netstat`, `curl`, `pgrep` (no `ss` - not available)

2. **Foundry Installation**:
   - **Both**: Uses `foundryup` (official installer) - works identically on both systems
   - Installation path: `~/.foundry/bin` (same on both)

3. **Package Managers** (for system tools):
   - **Linux**: Uses `apt-get`, `dnf`, `pacman`, or `zypper` (auto-detected)
   - **macOS**: Uses `brew` (Homebrew) - most tools come preinstalled

4. **Command Syntax**:
   - **`sed -i`**: 
     - Linux: `sed -i "s/pattern/replacement/" file`
     - macOS: `sed -i '' "s/pattern/replacement/" file`
   - **`netstat`**:
     - Linux: `netstat -tlnp` (shows process info)
     - macOS: `netstat -an` (no process info available)
   - **`grep`**:
     - Uses `sed` and `grep -oE` for address extraction (compatible with both GNU and BSD grep)
     - Note: `grep -oP` (Perl regex) is NOT used as it's not available on macOS BSD grep
   - **`timeout`**:
     - Linux: `timeout` command available
     - macOS: Uses `gtimeout` (from Homebrew coreutils) or works without timeout

5. **Preinstalled Tools**:
   - **macOS**: Most tools (`lsof`, `netstat`, `curl`, `pgrep`) come preinstalled
   - **Linux**: May need to install some tools

#### **Automatic Adaptation**:

The script automatically:
- Detects the OS
- Uses the correct package manager
- Uses the correct command syntax (sed, grep, netstat)
- Skips unavailable tools (like `ss` on macOS)
- Handles missing commands gracefully (like `timeout` on macOS)
- **Installs Foundry automatically** using the same method on both systems

---

### **Advanced Use Cases**

#### **1. First Time Setup (Complete Flow)**:

```bash
# Step 1: Setup (verify and install everything)
./deploy.sh setup --yes

# Step 2: Configure environment variables
./deploy.sh env

# Step 3: Start everything
./deploy.sh start
```

#### **2. Daily Development**:

```bash
# Morning: Start everything
./deploy.sh start

# During development: Only restart frontend after changes
./deploy.sh frontend restart

# End of day: Stop everything
./deploy.sh stop
```

#### **3. Frontend-Only Development**:

```bash
# Start Anvil and deploy contract once
./deploy.sh start

# Stop only frontend
./deploy.sh frontend stop

# Make frontend changes...

# Restart only frontend (Anvil and contract keep running)
./deploy.sh frontend start
```

#### **4. Clean State Development**:

```bash
# Stop everything
./deploy.sh stop

# Clean Anvil state (removes all tokens, transfers, users)
./deploy.sh clean

# Start with fresh blockchain
./deploy.sh start
```

#### **5. Troubleshooting**:

```bash
# Check status of all services
./deploy.sh status

# View logs
tail -f logs/anvil.log
tail -f logs/frontend.log
tail -f logs/deploy.log
tail -f logs/install.log

# Restart if something is wrong
./deploy.sh restart
```

#### **6. Automated CI/CD**:

```bash
# Fully automated setup and start (no user interaction)
./deploy.sh setup --yes
./deploy.sh env --yes
./deploy.sh start --yes
```

---

### **Complete Use Cases Reference** (42 Tested Cases)

This section documents all 42 use cases that have been tested and verified for the `deploy.sh` script, including error cases.

#### **Basic Commands** (14 cases):

**1-3. Help Commands**:
```bash
./deploy.sh help      # Show complete help
./deploy.sh --help    # Alternative help command
./deploy.sh -h        # Short help command
```
**Expected**: Shows complete help with all available commands, options, and examples.

**4-7. Start Commands**:
```bash
./deploy.sh start           # Start entire stack (interactive mode)
./deploy.sh start --yes     # Start with automatic mode (no confirmations)
./deploy.sh start --auto    # Start with automatic mode (alternative)
./deploy.sh start -y        # Start with automatic mode (short)
```
**Expected**: 
- Runs pre-start check automatically
- Starts Anvil, deploys contract, updates frontend config, starts frontend
- Shows deployment summary with URLs and MetaMask instructions

**8. Stop Command**:
```bash
./deploy.sh stop
```
**Expected**: Stops all services (Frontend and Anvil) gracefully.

**9-10. Restart Commands**:
```bash
./deploy.sh restart         # Restart entire stack (interactive mode)
./deploy.sh restart --yes   # Restart with automatic mode
```
**Expected**: Stops all services, waits 2 seconds, then starts everything again.

**11. Status Command**:
```bash
./deploy.sh status
```
**Expected**: Shows status of all services (Anvil, Frontend), RPC URL, Chain ID, Contract Address, Owner, and log file paths.

**12. MetaMask Command**:
```bash
./deploy.sh metamask
```
**Expected**: Shows detailed MetaMask configuration instructions including network settings, account import, and verification steps.

**13-14. Clean/Reset Commands**:
```bash
./deploy.sh clean   # Clean Anvil persistent state
./deploy.sh reset    # Alias for clean command
```
**Expected**: 
- Prompts for confirmation if Anvil is running
- Removes `logs/anvil_state.json` to reset blockchain state
- Shows success message

#### **Configuration Commands** (5 cases):

**15-17. Setup Commands**:
```bash
./deploy.sh setup           # Interactive mode (asks for confirmation)
./deploy.sh setup --yes     # Automatic mode (no confirmations)
./deploy.sh setup --auto    # Automatic mode (alternative)
./deploy.sh setup -y        # Automatic mode (short)
```
**Expected**: 
- Verifies system tools (installs if missing)
- Verifies Node.js, npm, Foundry (shows instructions if missing)
- Verifies project dependencies (installs if missing)
- Optionally configures environment variables

**18-19. Environment Variable Commands**:
```bash
./deploy.sh env          # Interactive mode (recommended for first time)
./deploy.sh environment  # Alias for env command
```
**Expected**: Prompts for each environment variable with default suggestions.

#### **Environment Variable Configuration** (12 cases):

**20-21. Modern Design Variable**:
```bash
./deploy.sh env --modern-design true   # Enable modern design
./deploy.sh env --modern-design false  # Disable modern design
```
**Expected**: Creates/updates `.env.local` with `NEXT_PUBLIC_MODERN_DESIGN` set accordingly.

**22-23. Debug Mode Variable**:
```bash
./deploy.sh env --debug-mode true   # Enable debug mode
./deploy.sh env --debug-mode false # Disable debug mode
```
**Expected**: Creates/updates `.env.local` with `NEXT_PUBLIC_DEBUG_MODE` set accordingly.

**24-25. Debug Tokens Variable**:
```bash
./deploy.sh env --debug-tokens true   # Enable debug tokens
./deploy.sh env --debug-tokens false # Disable debug tokens
```
**Expected**: Creates/updates `.env.local` with `NEXT_PUBLIC_DEBUG_TOKENS` set accordingly.

**26-27. All Variables at Once**:
```bash
./deploy.sh env --all true false false   # MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false
./deploy.sh env --all false true true   # MODERN_DESIGN=false, DEBUG_MODE=true, DEBUG_TOKENS=true
```
**Expected**: Sets all three variables in one command. Order: `MODERN_DESIGN`, `DEBUG_MODE`, `DEBUG_TOKENS`.

**34. Multiple Parameters Combined**:
```bash
./deploy.sh env --modern-design true --debug-mode true --debug-tokens false
```
**Expected**: Sets multiple variables in a single command. All specified variables are updated.

**35-36. Automatic Mode for Env**:
```bash
./deploy.sh env --yes   # Automatic mode (uses default values)
./deploy.sh env --auto  # Automatic mode (alternative)
```
**Expected**: Creates `.env.local` with default values:
- `NEXT_PUBLIC_MODERN_DESIGN=true`
- `NEXT_PUBLIC_DEBUG_MODE=false`
- `NEXT_PUBLIC_DEBUG_TOKENS=false`

#### **Frontend Commands** (3 cases):

**28-30. Frontend-Only Commands**:
```bash
./deploy.sh frontend start    # Start only frontend (requires Anvil running)
./deploy.sh frontend stop     # Stop only frontend
./deploy.sh frontend restart  # Restart only frontend
```
**Expected**: 
- `start`: Starts frontend only (Anvil and contract must be running)
- `stop`: Stops frontend only (Anvil and contract continue running)
- `restart`: Stops and starts frontend only

#### **Error Cases** (8 cases):

**31. Invalid Command**:
```bash
./deploy.sh invalid_command
```
**Expected Error**: 
```
✗ Invalid command: invalid_command

Usage: ./deploy.sh [command] [options]
Run ./deploy.sh help for complete help
```
**Exit Code**: `1`

**32. Invalid Frontend Subcommand**:
```bash
./deploy.sh frontend invalid
```
**Expected Error**:
```
✗ Invalid frontend command: invalid

Available commands:
  ./deploy.sh frontend start    - Start only frontend
  ./deploy.sh frontend stop     - Stop only frontend
  ./deploy.sh frontend restart  - Restart only frontend
```
**Exit Code**: `1`

**33. Invalid Environment Variable Value**:
```bash
./deploy.sh env --modern-design invalid_value
```
**Expected Error**:
```
✗ Invalid value for --modern-design: invalid_value (must be 'true' or 'false')
```
**Exit Code**: `1`

**37-38. Short Flag Variations**:
```bash
./deploy.sh setup -y   # Automatic mode (short flag)
./deploy.sh start -y   # Automatic mode (short flag)
```
**Expected**: Works the same as `--yes` or `--auto` flags.

**39. Wrong Directory Execution**:
```bash
cd /tmp
/path/to/project/deploy.sh status
```
**Expected Error**:
```
✗ This script must be run from the project root
ℹ Current directory: /tmp
```
**Exit Code**: `1`

**40. Invalid Value in Env**:
```bash
./deploy.sh env --modern-design invalid
```
**Expected Error**:
```
✗ Invalid value for --modern-design: invalid (must be 'true' or 'false')
```
**Exit Code**: `1`

**41. Missing Values in --all**:
```bash
./deploy.sh env --all true false
```
**Expected**: The script should handle this gracefully. If only 2 values are provided, it may use defaults for the third or show an error. (Behavior depends on implementation)

**42. Frontend Start Without Anvil**:
```bash
./deploy.sh frontend start  # When Anvil is not running
```
**Expected**: 
- The script attempts to start frontend
- Frontend may start but will fail to connect to Anvil
- Error messages in frontend logs indicating connection refused

#### **Notes on Error Handling**:

1. **All error cases exit with code `1`** to indicate failure
2. **Error messages are clear and actionable**, showing what went wrong and how to fix it
3. **Invalid commands show help** or list available alternatives
4. **The script validates input** before executing commands (e.g., boolean values must be 'true' or 'false')
5. **Directory validation** ensures the script is run from the correct location

#### **Complete Test Matrix**:

| Category | Cases | Documented | Tested |
|----------|-------|-------------|--------|
| Basic Commands | 14 | ✅ | ✅ |
| Configuration | 5 | ✅ | ✅ |
| Environment Variables | 12 | ✅ | ✅ |
| Frontend Commands | 3 | ✅ | ✅ |
| Error Cases | 8 | ✅ | ✅ |
| **TOTAL** | **42** | **✅** | **✅** |

---

### **Windows Script**: `deploy.ps1`

**Version**: 2.1.0  
**Status**: ✅ Production Ready  
**Use Cases Covered**: 42/42

Equivalent PowerShell script for Windows 10/11 that automates the ENTIRE deployment process. It has been specifically engineered for the Windows environment, solving process management challenges by using visible windows for background services.

#### **Key Features**:
1. **Full Feature Parity**: Implements all features of the Bash script (Setup, Env, Start, Stop, etc.).
2. **Robust Process Management**: Uses **visible PowerShell windows** for Anvil and Frontend to ensure reliability and log visibility.
3. **Automatic Pre-Start Checks**: Verifies tools and dependencies before starting.
4. **Smart Dependency Management**: Checks and installs Node.js packages and Foundry dependencies.
5. **Environment Configuration**: Full support for `.env.local` management with all flags.

> **Note**: Unlike `deploy.sh`, the Windows script does NOT install Foundry automatically. You must install Foundry manually before running the script. See [Prerequisites](#prerequisites-1) below.

#### **Prerequisites**:

1. **PowerShell 5.1+** (Pre-installed on Windows 10/11)
   ```powershell
   $PSVersionTable.PSVersion
   ```

2. **Foundry** (Anvil & Forge)
   - Install: https://book.getfoundry.sh/getting-started/installation
   - Verify: `anvil --version`, `forge --version`

3. **Node.js & npm**
   - Install: https://nodejs.org/
   - Verify: `node --version`, `npm --version`

#### **Initial Configuration**:

**Configure Execution Policy** (First time only):
```powershell
# Open PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **Complete Command Reference (42 Use Cases)**:

The script implements the exact same 42 use cases as the Linux/macOS version.

**1. Basic Commands**:
```powershell
.\deploy.ps1 start           # Start entire stack (interactive)
.\deploy.ps1 start --yes     # Start automatic (no prompts)
.\deploy.ps1 stop            # Stop all services (closes windows)
.\deploy.ps1 restart         # Restart all services
.\deploy.ps1 status          # Show service status & logs
.\deploy.ps1 help            # Show help
.\deploy.ps1 metamask        # Show MetaMask instructions
.\deploy.ps1 clean           # Clean Anvil state
```

**2. Configuration Commands**:
```powershell
# Setup (Verifies tools & installs dependencies)
.\deploy.ps1 setup           # Interactive
.\deploy.ps1 setup --yes     # Automatic

# Environment Variables
.\deploy.ps1 env             # Interactive wizard
```

**3. Environment Variable Configuration**:
```powershell
# Individual Flags
.\deploy.ps1 env --modern-design true
.\deploy.ps1 env --debug-mode true
.\deploy.ps1 env --debug-tokens false

# Combined Flags
.\deploy.ps1 env --modern-design true --debug-mode false

# All-at-once
.\deploy.ps1 env --all true false false

# Automatic Defaults
.\deploy.ps1 env --yes
```

**4. Frontend-Only Commands**:
```powershell
.\deploy.ps1 frontend start    # Start only frontend (requires Anvil)
.\deploy.ps1 frontend stop     # Stop only frontend
.\deploy.ps1 frontend restart  # Restart only frontend
```

#### **Windows-Specific Implementation Details**:

1. **Process Management (Visible Windows)**:
   - Unlike Unix `nohup`, Windows background jobs can be unstable or hide prompts.
   - `deploy.ps1` launches **Anvil** and **Next.js** in separate, visible PowerShell windows.
   - **Benefit**: You can see real-time logs and errors immediately.
   - **Benefit**: Closing the main script doesn't kill the servers (they persist in their windows).
   - **Stop**: The `stop` command finds these processes by Port/PID and closes them gracefully.

2. **System Tools Verification (`Test-SystemTools`)**:
   - Uses native `Get-NetTCPConnection` instead of `lsof`/`netstat`.
   - Checks for `curl` (usually aliases to `Invoke-WebRequest` or native curl.exe).
   - Verifies `node`, `npm`, `forge`, `anvil` availability.

3. **Path Handling**:
   - Uses `Join-Path` and proper backslashes (`\`) for file system operations.
   - Correctly handles spaces in paths (common in "My Documents").

#### **Usage Examples**:

**Scenario 1: First Run (Automated)**
```powershell
# 1. Setup dependencies
.\deploy.ps1 setup --yes

# 2. Configure environment
.\deploy.ps1 env --yes

# 3. Start stack
.\deploy.ps1 start
# Result: Two new windows open (Anvil, Frontend). 
# Browser opens at http://localhost:3000
```

**Scenario 2: Daily Development**
```powershell
# Start everything
.\deploy.ps1 start

# ... work ...

# Stop everything
.\deploy.ps1 stop
```

**Scenario 3: Troubleshooting Ports**
```powershell
# If start fails due to ports in use:
.\deploy.ps1 status
.\deploy.ps1 stop
# Wait a few seconds
.\deploy.ps1 start
```

#### **Troubleshooting**:

**Error: "Execution of scripts is disabled..."**
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**Error: "Port 3000/8545 already in use"**
- The script usually detects this. Run `.\deploy.ps1 stop` to force release.
- Or manually check: `Get-NetTCPConnection -LocalPort 3000`

**Error: "npm not found"**
- Ensure Node.js is installed and added to your System PATH.
- Restart your terminal after installing Node.js.

---

### **Feature Parity Table**

| Feature | deploy.sh (Linux/macOS) | deploy.ps1 (Windows) |
|---------|-------------------------|----------------------|
| **Version** | 2.2.0 | 2.1.0 |
| **Setup Cmd** | ✅ `setup` | ✅ `setup` |
| **Env Cmd** | ✅ `env` (all modes) | ✅ `env` (all modes) |
| **Auto Flags** | ✅ `--yes`, `--auto`, `-y` | ✅ `--yes`, `--auto` |
| **Pre-check** | ✅ Automatic | ✅ Automatic |
| **Foundry Install** | ✅ **Automatic** (foundryup) | ❌ Manual (requires user) |
| **Process Model** | Background (`nohup`) | Separate Windows (`Start-Process`) |
| **Port Check** | `lsof`/`netstat` | `Get-NetTCPConnection` |
| **Logs** | `logs/*.log` | `logs/*.log` + Window Output |
| **Dependency Install** | System + Project + **Foundry** | Project Only (System needs manual) |
| **macOS Tested** | ✅ darwin 25.1.0 | N/A |
| **Linux Tested** | ✅ Ubuntu, Debian, Fedora, Arch | N/A |

---

### **Process Management**:

The script manages processes intelligently:

- **Verificación de puertos**: Detecta si un servicio ya está corriendo
- **PIDs persistentes**: Guarda PIDs para detener servicios correctamente
- **Logs separados**: Cada servicio tiene su propio archivo de log
- **Graceful shutdown**: Intenta SIGTERM primero, luego SIGKILL si es necesario
- **State validation**: Waits for services to be ready before continuing

---

### **Network Access Configuration**

The frontend is configured to be accessible from any IP address on your local network, not just `localhost`.

#### **Configuration**:

**Frontend (Next.js)**:
- **Host**: `0.0.0.0` (listens on all network interfaces)
- **Port**: `3000`
- **Accessible from**:
  - `http://localhost:3000` (same computer)
  - `http://<your-ip>:3000` (other devices on your network)
  - Example: `http://192.168.1.100:3000`

**Anvil (Blockchain)**:
- **Host**: `127.0.0.1` (localhost only - for security)
- **Port**: `8545`
- **Accessible from**: Only the same computer where Anvil is running

#### **How It Works**:

```
Device on Network → http://192.168.1.100:3000 (Frontend)
                          ↓
                Frontend connects to Anvil
                          ↓
                http://127.0.0.1:8545 (Anvil on server)
```

The frontend acts as a proxy: devices on your network connect to the frontend, and the frontend connects to Anvil locally on the server machine.

#### **Finding Your IP Address**:

The script automatically detects and displays your local IP address when you run:
```bash
./deploy.sh start
# or
./deploy.sh status
```

**Manual detection**:
- **Linux**: `hostname -I` or `ip addr show`
- **macOS**: `ipconfig getifaddr en0` or `ifconfig | grep "inet "`
- **Windows**: `ipconfig` (look for IPv4 Address)

#### **Security Considerations**:

- ✅ **Frontend on `0.0.0.0`**: Safe for local network access (development)
- ✅ **Anvil on `127.0.0.1`**: Secure - only accessible from the server machine
- ⚠️ **Production**: For production deployments, use proper security measures (HTTPS, authentication, firewall rules)

#### **Accessing from Other Devices**:

1. **Start the application**:
   ```bash
   ./deploy.sh start
   ```

2. **Note the network IP** shown in the output:
   ```
   ✓ Frontend started successfully
   ℹ URL (localhost): http://localhost:3000
   ℹ URL (network):   http://192.168.1.100:3000
   ```

3. **From another device on the same network**:
   - Open a browser
   - Navigate to `http://<your-ip>:3000`
   - Example: `http://192.168.1.100:3000`

4. **Configure MetaMask on the other device**:
   - Add the same Anvil network configuration
   - **Important**: The RPC URL must point to the server's IP, not `127.0.0.1`
   - RPC URL: `http://<server-ip>:8545` (if Anvil is also exposed)
   - **Note**: By default, Anvil only listens on `127.0.0.1`, so MetaMask on other devices cannot connect directly to Anvil. The frontend handles this by proxying requests.

---

## 🛠️ Manual Deployment Guide (No Scripts)

If you prefer to understand the underlying process or cannot use the automation scripts (`deploy.sh`/`deploy.ps1`), follow these step-by-step instructions to deploy the DApp manually.

### **1. Prerequisites & Verification**

Before starting, it is highly recommended to verify that you have all the necessary tools.

**Required Tools:**
- **Git**: [Download](https://git-scm.com/downloads)
- **Node.js (v18+)**: [Download](https://nodejs.org/)
- **Foundry (Forge & Anvil)**: [Installation Guide](https://book.getfoundry.sh/getting-started/installation)

**How to Verify Installation (Windows PowerShell):**
```powershell
# Check Git
git --version
# Expected: git version 2.x.x

# Check Node.js
node --version
# Expected: v18.x.x or higher

# Check Foundry
forge --version
anvil --version
# Expected: forge 0.2.0... / anvil 0.2.0...
```

**How to Install if Missing:**
- **Node.js**: Download the installer from the official website and follow the wizard.
- **Foundry**: Run the following command in PowerShell:
  ```powershell
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

### **2. Start Local Blockchain (Anvil)**

Open a **new terminal** (Terminal 1) and run:

**1. Verify Prerequisites (Optional but recommended):**
```powershell
# Windows
node --version   # Should be v18+
npm --version    # Should be installed
anvil --version  # Should be installed
forge --version  # Should be installed
git --version    # Should be installed
```

**2. Start Anvil:**
```powershell
# Windows (PowerShell)
anvil
```

**Linux/macOS**:
```bash
anvil
```

> **Keep this terminal open.** You should see "Listening on 127.0.0.1:8545".

### **3. Deploy Smart Contract**

Open a **second terminal** (Terminal 2) and run:

**1. Install Dependencies:**
```bash
cd sc
forge install
```

**2. Compile & Deploy:**
```bash
# Windows (PowerShell)
$env:PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
forge script script/SupplyChainDeploy.s.sol:SupplyChainDeployScript --rpc-url http://127.0.0.1:8545 --broadcast

# Linux/macOS
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 forge script script/SupplyChainDeploy.s.sol:SupplyChainDeployScript --rpc-url http://127.0.0.1:8545 --broadcast
```

**3. Copy Contract Address:**
Look at the output logs for a line like:
`Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3`
**Copy this address.**

### **4. Configure Frontend**

Still in Terminal 2, verify and update the configuration files.

**1. Copy Contract ABI:**
The frontend needs the JSON ABI to talk to the contract.

**Windows (PowerShell)**:
```powershell
Copy-Item "..\out\SupplyChain.sol\SupplyChain.json" "..\..\web\src\contracts\SupplyChain.json" -Force
```

**Linux/macOS**:
```bash
cp ../out/SupplyChain.sol/SupplyChain.json ../../web/src/contracts/SupplyChain.json
```

**2. Update Contract Address:**
Open the file `web/src/contracts/config.ts` in your code editor.
Find the line:
```typescript
export const SUPPLY_CHAIN_ADDRESS = '0x...' as `0x${string}`
```
Replace the address with the one you copied in Step 3.

**3. Configure Environment Variables:**
Create `web/.env.local` if it doesn't exist.

**Windows (PowerShell)**:
```powershell
cd ..\web
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

**Linux/macOS**:
```bash
cd ../web
cp .env.example .env.local 2>/dev/null || :
```

### **5. Start Frontend**

**1. Install Dependencies:**

**Windows (PowerShell)**:
```powershell
# Checks if node_modules exists, if not installs
if (!(Test-Path "node_modules")) { npm install }
# Or just run to be sure:
npm install
```

**Linux/macOS**:
```bash
# Checks if node_modules exists, if not installs
if [ ! -d "node_modules" ]; then npm install; fi
# Or just run to be sure:
npm install
```

**2. Start Development Server:**
```bash
npm run dev
```

> **Keep this terminal open.** You should see "Ready in ... ms".

**Note**: The `dev` script is configured to listen on `0.0.0.0`, so the frontend is accessible from any IP on your network:
- **Localhost**: `http://localhost:3000`
- **Network**: `http://<your-ip>:3000` (from other devices on your local network)

### **6. Verify Deployment**

**1. Browser Check:**
- Open `http://localhost:3000` in your browser.
- You should see the Landing Page with the title "Supply Chain Tracker".
- **Success Criteria**: The page loads without white screens or console errors.

**2. Connect MetaMask:**
- Click the "Conectar Billetera" button.
- Select the account imported in Step 4 (Owner).
- **Success Criteria**:
  - The button changes to show your address (e.g., `0xf39...2266`).
  - You see "Bienvenido de nuevo" or dashboard stats.
  - The "Stats" cards (Users, Tokens) appear (initially at 0).

**3. Test Connection:**
- Go to the Dashboard or Admin panel.
- If data loads (even if empty), the connection to the Smart Contract is working.

### **7. Stop Services (Manual)**

To stop the services correctly and avoid "port in use" errors later, verify and kill the processes in this order: **Frontend First -> Then Anvil**.

**Windows (PowerShell):**

1. **Find Process IDs (PIDs):**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000, 8545 -ErrorAction SilentlyContinue | Select-Object LocalPort, OwningProcess, State
   ```
   *Note: Port 3000 is Frontend, 8545 is Anvil.*

2. **Stop Frontend (Port 3000):**
   ```powershell
   # Replace <PID> with the OwningProcess ID for port 3000
   Stop-Process -Id <PID> -Force
   ```

3. **Stop Anvil (Port 8545):**
   ```powershell
   # Replace <PID> with the OwningProcess ID for port 8545
   Stop-Process -Id <PID> -Force
   ```

**Linux/macOS:**

1. **Find Process IDs:**
   ```bash
   # Find PID for Frontend (Port 3000)
   lsof -ti :3000
   
   # Find PID for Anvil (Port 8545)
   lsof -ti :8545
   ```

2. **Stop Frontend (Port 3000):**
   ```bash
   kill -9 $(lsof -t -i:3000)
   ```

3. **Stop Anvil (Port 8545):**
   ```bash
   kill -9 $(lsof -t -i:8545)
   ```

4. **Verify Ports are Free:**
   ```bash
   # Should return nothing if ports are free
   lsof -i :3000
   lsof -i :8545
   ```

---

## 🦊 MetaMask Configuration

### **Step 1: Add Anvil Local Network**

1. Abrir MetaMask
2. Clic en selector de red (arriba izquierda)
3. "Add network" → "Add a network manually"
4. Completar datos:

| Campo | Valor |
|-------|-------|
| **Network Name** | `Anvil Local` |
| **RPC URL** | `http://127.0.0.1:8545` |
| **Chain ID** | `31337` |
| **Currency Symbol** | `ETH` |

5. Clic en "Save"

### **Step 2: Import Account (Owner)**

**Cuenta #0 (Deployer/Owner)**:
- Dirección: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Balance: 10,000 ETH

**Steps**:
1. Click on account icon (top right)
2. "Import Account"
3. Select "Private Key"
4. Paste the private key from above
5. "Import"

⚠️ **IMPORTANTE**: Este private key es SOLO para desarrollo local. NUNCA usar en mainnet.

### **Step 3: Additional Accounts (Optional)**

Para probar flujos de transferencias entre usuarios:

**Cuenta #1**:
- Dirección: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Cuenta #2**:
- Dirección: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

**Cuenta #3**:
- Dirección: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- Private Key: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

### **Step 3.1: Additional Accounts (10-14)**

Anvil genera 15 cuentas usando el mnemonic determinístico. Las cuentas #0-9 están documentadas arriba. Estas son las cuentas adicionales #10-14:

**Cuenta #10**:
- Dirección: `0xbcd4042de499d14e55001ccbb24a551f3b954096`
- Private Key: `0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897`

**Cuenta #11**:
- Dirección: `0x71be63f3384f5fb98995898a86b02fb2426c5788`
- Private Key: `0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82`

**Cuenta #12**:
- Dirección: `0xfabb0ac9d68b0b445fb7357272ff202c5651694a`
- Private Key: `0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1`

**Cuenta #13**:
- Dirección: `0x1cbd3b2770909d4e10f157cabc84c7264073c9ec`
- Private Key: `0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd`

**Cuenta #14**:
- Dirección: `0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097`
- Private Key: `0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa`

**How to Import in MetaMask**:
1. Abrir MetaMask (asegúrate de estar en red "Anvil Local")
2. Clic en el ícono de cuenta (arriba derecha)
3. Seleccionar **"Import Account"**
4. Elegir **"Private Key"**
5. Pegar el private key de la cuenta que deseas importar
6. Clic en **"Import"**
7. Repetir para cada cuenta adicional

⚠️ **IMPORTANTE**: Estos private keys son SOLO para desarrollo local. NUNCA usar en mainnet o con fondos reales. Cada cuenta tiene 10,000 ETH iniciales en Anvil.

### **Step 4: Connect to DApp**

1. Abrir `http://localhost:3000`
2. Asegurarse de estar en red "Anvil Local" en MetaMask
3. Clic en "Conectar MetaMask" en la DApp
4. Autorizar la conexión en el popup de MetaMask
5. ¡Listo! Deberías ver:
   - Tu dirección acortada (0xf39F...2266)
   - Botón "Desconectar"
   - Stats cards con datos del contrato

### **Step 5: Verify Connection**

**Successful connection indicators**:
- ✅ MetaMask muestra "Connected" con punto verde
- ✅ DApp muestra tu dirección
- ✅ Stats cards muestran: 0 Tokens, 0 Usuarios, 0 Transferencias
- ✅ Mensaje: "¡Bienvenido a la DApp!"

---

## 🧪 Testing

### **Smart Contract Tests**:

```bash
cd sc

# All tests
forge test

# Con verbosidad
forge test -vv

# Tests específicos
forge test --match-contract SupplyChainTest
forge test --match-test testCreateToken

# Con gas report
forge test --gas-report

# Con coverage
forge coverage

# Coverage en formato lcov
forge coverage --report lcov
```

**Test categories**:
- ✅ User Management (8 tests)
- ✅ Token Creation (8 tests)
- ✅ Transfers (8 tests)
- ✅ Admin Functions (9 tests)
- ✅ Edge Cases (18 tests)
- ✅ Events (6 tests)
- ✅ Security (6 tests)

### **Frontend Tests** (Pending):

```bash
cd web

# Unit tests (cuando estén implementados)
npm test

# E2E tests (cuando estén implementados)
npm run test:e2e
```

---

## 🐛 Troubleshooting

### **Problem: Anvil doesn't start**

**Symptoms**:
- Error: "Connection refused" al deployar
- Puerto 8545 no responde

**Solutions**:
```bash
# 1. Verificar si hay otro proceso en el puerto
lsof -i :8545

# 2. Detener procesos en ese puerto
kill -9 $(lsof -ti:8545)

# 3. Reiniciar con el script
./deploy.sh restart
```

### **Problem: Contract doesn't deploy**

**Symptoms**:
- Error: "No se pudo obtener la dirección del contrato"
- Logs de deploy vacíos

**Solutions**:
```bash
# 1. Verificar que Anvil esté corriendo
./deploy.sh status

# 2. Ver logs del deployment
cat logs/deploy.log

# 3. Compilar manualmente
cd sc && forge build

# 4. Deployar manualmente
PRIVATE_KEY=0xac09... forge script script/SupplyChainDeploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# 5. Copiar dirección y actualizar config.ts manualmente
```

### **Problem: Frontend doesn't connect with MetaMask**

**Symptoms**:
- Botón "Conectar" no hace nada
- Error en consola del navegador

**Solutions**:
```bash
# 1. Verify that MetaMask is on Anvil Local network (Chain ID: 31337)
# 2. Refrescar la página (F5)
# 3. Ver logs del frontend
cat logs/frontend.log

# 4. Verificar que wagmi-config.ts tenga la URL correcta
cat web/src/lib/wagmi-config.ts

# 5. Reiniciar frontend
./deploy.sh restart
```

### **Problem: Incorrect contract address**

**Symptoms**:
- Error: "Contract not found" al llamar funciones
- Stats cards no cargan

**Solutions**:
```bash
# 1. Ver dirección actual en config.ts
cat web/src/contracts/config.ts | grep SUPPLY_CHAIN_ADDRESS

# 2. Ver dirección deployada
cat logs/contract_address.txt

# 3. Si no coinciden, actualizar manualmente
# O redesplegar:
./deploy.sh restart
```

### **Problem: Transaction fails in MetaMask**

**Symptoms**:
- MetaMask muestra error al enviar transacción
- "Gas estimation failed"

**Solutions**:
```bash
# 1. Verificar que la cuenta conectada sea la correcta
# 2. Verificar que haya fondos suficientes
# 3. Verificar que el contrato esté desplegado
./deploy.sh status

# 4. Si persiste, ver logs de Anvil
cat logs/anvil.log

# 5. Reiniciar Anvil
./deploy.sh restart
```

### **Problem: Frontend shows "0" in all counters**

**Symptoms**:
- Stats cards muestran: 0 Tokens, 0 Usuarios, 0 Transferencias
- Pero es correcto al inicio

**Explanation**:
This is **NORMAL** at the start. The newly deployed contract doesn't have:
- Created tokens
- Registered users (owner doesn't count)
- Performed transfers

**To see data**:
1. Registrar usuarios con `requestUserRole()`
2. Aprobar usuarios (solo owner)
3. Crear tokens con `createToken()`
4. Realizar transferencias con `transfer()`

---

## 🗺️ Roadmap

### **✅ Completed (Days 1-8 - Nov 18-24, 2025)**:

- [x] Smart contract implementado y testeado (970+ líneas, 108 tests, 85.60% coverage, 72.15% branches)
- [x] Validaciones críticas del contrato (5 validaciones completadas)
- [x] Frontend base con Next.js 16 + TypeScript + Tailwind
- [x] Integración Web3 con wagmi + viem + ethers
- [x] Componentes UI con Shadcn (9 componentes)
- [x] 15 custom hooks (5 read + 7 write + 3 admin)
- [x] Automated deployment script (`deploy.sh`)
- [x] Complete project documentation
- [x] MetaMask connection working
- [x] Landing page with real-time stats
- [x] Unified header with navigation and branding
- [x] Theme toggle (light/dark mode) with per-user persistence ⭐ Day 4
- [x] Complete admin panel (user management)
- [x] Registration form with validations
- [x] Multi-tab synchronization (partial: only disconnections, automatic reconnection POSTPONED)
- [x] Security: role and status restrictions
- [x] Complete dashboard with profile, tokens and actions ⭐ Day 4
- [x] Complete integrated pausability system ⭐ Day 4
- [x] AuthContext optimized for fast redirects ⭐ Day 4
- [x] Tokens page (list) with filters and search ⭐ Day 5
- [x] Create Token page with validations ⭐ Day 6
- [x] Modern Design 2025 applied to 6 pages ⭐ Day 6-7
- [x] Complete Transfers page with CreateTransferForm ⭐ Day 7
- [x] New components: CreateTransferForm, UserTokenList, AddressDisplay ⭐ Day 7
- [x] New hooks: useGetUserTransfers, useUserTokenStats, useGetUserTokensWithData ⭐ Day 7
- [x] Main Admin panel (`/admin`) ⭐ Day 8
- [x] Token Details page (`/tokens/[id]`) with end-to-end traceability ⭐ Day 8
- [x] Transfer from Details page (`/tokens/[id]/transfer`) ⭐ Day 8
- [x] `useGetAllTransfers` hook for system statistics ⭐ Day 8
- [x] `useTokenTraceability` hook for hierarchical tree ⭐ Day 8
- [x] `TraceabilityTimeline` component with expand/collapse ⭐ Day 8
- [x] Critical contract validations (5 validations) ⭐ Day 7
- [x] Additional tests (108 total tests, 85.60% coverage, 72.15% branches) ⭐ Day 7

### **✅ Day 4 (Nov 20)**: Dashboard and Optimizations ✅ COMPLETED

- [x] Complete dashboard with UserProfileCard, QuickActions, TokenCard
- [x] Complete pausability system (PauseControl, validations)
- [x] Global ErrorBoundary implemented
- [x] Complete data validation (validation.ts)
- [x] Performance optimization (useDashboardStats with batch reads)
- [x] Tests implemented (Vitest + Playwright, 17 tests passing)
- [x] Accessibility (ARIA labels, WCAG AA)
- [x] Animations (smooth transitions, hover effects)

### **✅ Day 5 (Nov 21)**: Tokens - List ✅ COMPLETED

- [x] Complete `/tokens` page with filters and search
- [x] `useGetAllTokens()` hook optimized with batch reads
- [x] Token type filters (conditional by role)
- [x] Real-time search with accent normalization
- [x] Pagination (12 tokens per page)
- [x] Modern Design 2025 applied

### **✅ Day 6 (Nov 21)**: Tokens - Create + Modern Design ✅ COMPLETED

- [x] Complete `/tokens/create` page with validations
- [x] Real-time validation of parent token balance
- [x] Input restrictions based on available balance
- [x] Modern Design 2025 applied to all main pages
- [x] TokenCardModern.tsx created (glassmorphism, gradients)
- [x] PauseControl updated with modern design

### **🔄 Pending (Days 5-7 - Nov 22-24, 2025)**:
- [x] Página `/dashboard`
- [x] Mostrar perfil del usuario conectado (UserProfileCard)
- [x] Mostrar rol y estado (Pending/Approved/etc.)
- [x] Lista de tokens propios (TokenCard)
- [x] Acciones rápidas (QuickActions)
- [x] Control de pausa para admin (PauseControl)
- [x] Estadísticas (solo admin ve "Total Users")
- [x] Redirección inmediata para usuarios no autenticados

#### **Day 5 (Nov 21)**: Token Management - List ✅ COMPLETED
- [x] `/tokens` page ✅
- [x] Table of all tokens ✅
- [x] `useGetAllTokens()` hook implemented ✅
- [x] Type filters (RowMaterial/FinishedProduct) ✅
- [x] Name search (with accent normalization) ✅
- [x] Pagination (12 tokens per page) ✅
- [x] Modern Design 2025 applied ✅

#### **Day 6 (Nov 21)**: Create Token ✅ COMPLETED
- [x] `/tokens/create` page ✅
- [x] Form with validations ✅
- [x] Select for token type ✅
- [x] Input for supply with validation ✅
- [x] Textarea for features (JSON) ✅
- [x] Select for parent token (if applicable) ✅
- [x] Real-time validation of parent token balance ✅
- [x] Loading states during creation ✅
- [x] Success/error alert ✅
- [x] Modern Design 2025 applied ✅

#### **Day 6 (Nov 21)**: Modern Design 2025 ✅ COMPLETED
- [x] TokenCardModern.tsx created (glassmorphism) ✅
- [x] Modern design applied to 5 main pages ✅
- [x] PauseControl with modern design ✅
- [x] Environment variable NEXT_PUBLIC_MODERN_DESIGN ✅

#### **Pending**: Token Details
- [ ] `/tokens/[id]` page
- [ ] Complete token information
- [ ] Transfer history
- [ ] Transfer button (if applicable)
- [ ] Supply chain graph

#### **✅ Day 7 (Nov 22)**: Transfers ✅ COMPLETED
- [x] `/transfers` page ✅
- [x] Transfer table with sent/received separation (Factory/Retailer) ✅
- [x] Filters: Sent/Received/Pending/Accepted/Rejected by role ✅
- [x] Action buttons (Accept/Reject/Cancel) with uniform style ✅
- [x] CreateTransferForm with validations and filtered dropdowns ✅
- [x] AddressDisplay component for clickable addresses ✅
- [x] Loading states and automatic updates ✅
- [x] Separate statistics (sent/received) in dashboard ✅
- [x] Dashboard improvements: "My Tokens by Type" simplified ✅
- [x] /tokens improvements: "My Tokens by Type" with complete cards ✅

#### **Day 7 (Nov 24)**: Critical Contract Validations ✅ COMPLETED
- [x] Validation: Canceled user cannot register
- [x] Validation: Minimum name length (2 chars)
- [x] Validation: Role by token type in transfer()
- [x] Validation: Role by token type in acceptTransfer()
- [x] Validation: Role by token type in rejectTransfer()
- [x] Additional tests (8 new tests)
- [x] Improved coverage (85.60% lines, 72.15% branches)

#### **Day 8 (Nov 23)**: Admin Panel and Additional Pages ✅ COMPLETED
- [x] `/admin` page - Main administration panel
- [x] `/tokens/[id]` page - Details with end-to-end traceability
- [x] `/tokens/[id]/transfer` page - Transfer from details
- [x] `useGetAllTransfers` hook for system statistics
- [x] `useTokenTraceability` hook for hierarchical tree
- [x] `TraceabilityTimeline` component with expand/collapse

### **🎯 Week 2 (Nov 25-28, 2025)**:

#### **Day 9 (Nov 24)**: Video Demo (NEXT)
- [ ] Video script (5 minutes)
- [ ] Recording with OBS/Loom:
  - Project architecture
  - Demo of passing tests
  - Complete frontend demo
  - Admin panel demo
  - Complete E2E flow
- [ ] Basic editing
- [ ] Upload to platform

#### **Day 12 (Nov 28)**: Final Delivery
- [ ] Verify complete checklist
- [ ] Project backup
- [ ] Final push to GitHub
- [ ] Verify everything compiles
- [ ] Verify all tests pass
- [ ] Final documentation reviewed
- [ ] **DELIVERY** 🚀

---

## 📊 Project Metrics

### **Smart Contract**:
- **Lines of code**: 971
- **Tests**: 80 (100% passing)
- **Coverage**: 85.60% lines, 72.15% branches
- **Functions**: 42
- **Events**: 6
- **Modifiers**: 2

### **Frontend**:
- **Lines of code**: ~4,000+
- **Files created**: 25+
- **Files modified**: 10+
- **Hooks**: 21 (16 read + 9 write, includes useGetUserTransfers, useUserTokenStats, useGetUserTokensWithData)
- **Components**: 25 (11 Shadcn + 14 custom, includes TokenCardModern, CreateTransferForm, UserTokenList, AddressDisplay)
- **Pages**: 6 of 9 (67%) - All with Modern Design 2025
- **Features**: Theme toggle, Multi-tab sync, Complete admin panel, Modern Design 2025

### **Development Time**:
- **Smart Contract**: ~6 hours (Day 1)
- **Frontend Setup**: ~2 hours (Day 1)
- **Deployment Script**: ~1 hour (Day 1)
- **Documentation**: ~1 hour (Day 1)
- **Admin Panel**: ~6 hours (Day 2-3)
- **UI/UX Refinements**: ~4 hours (Day 3)
- **Dashboard and Optimizations**: ~8 hours (Day 4)
- **Tokens (List + Create)**: ~8 hours (Day 5-6)
- **Modern Design 2025**: ~4 hours (Day 6)
- **Total Days 1-6**: ~40 hours

---

## 🎓 Resources

### **Official Documentation**:
- [Solidity Docs](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [viem Docs](https://viem.sh)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

### **OpenZeppelin**:
- [Contracts](https://docs.openzeppelin.com/contracts/)
- [Ownable](https://docs.openzeppelin.com/contracts/access#ownership)
- [Pausable](https://docs.openzeppelin.com/contracts/api/security#Pausable)

### **MetaMask**:
- [Developer Docs](https://docs.metamask.io/)
- [Getting Started](https://docs.metamask.io/wallet/get-started/set-up-dev-environment/)

---

## 👥 Team

**Academic Project**: PFM/TFM - Supply Chain Tracker  
**Institution**: Master Blockchain Web3  
**Deadline**: November 28, 2025  
**Version**: 2.2.0

---

## 📝 Changelog

### v2.2.0 (28 Nov 2025)
- ✅ **Automatic Foundry installation** - deploy.sh now installs forge/anvil automatically using foundryup
- ✅ **Full macOS compatibility** - Tested on darwin 25.1.0 (macOS Sequoia)
- ✅ **Fixed grep -oP issue** - Replaced with sed/grep -oE for BSD grep compatibility
- ✅ **Improved documentation** - Updated to reflect new features

### v2.1.0 (27 Nov 2025)
- ✅ State persistence for Anvil
- ✅ Frontend-only commands (start/stop/restart)
- ✅ Clean command to reset blockchain state
- ✅ Improved process management

### v1.0.0 (18 Nov 2025)
- ✅ Initial release
- ✅ Smart contract implemented and tested
- ✅ Frontend base with MetaMask connection
- ✅ Automated deployment script
- ✅ Complete documentation

---

## 📄 License

This project is part of an academic work and is provided for educational purposes.

---

## 🗂️ Documentation Structure

```
📁 Proyecto Root
│
├── 📄 README.md                    ⭐ README original del proyecto
├── 📄 QUICKSTART.md                ⭐ Quick start (INICIO AQUÍ)
├── 📄 INDEX.md                     ⭐ Índice maestro de documentación
├── 📄 STATUS.md                    ⭐ Single source of truth del estado
├── 📄 TODO.md                      ⭐ Tareas pendientes
├── 📄 CHANGELOG.md                 ⭐ Historial de cambios
├── 📄 CONTRIBUTING.md              ⭐ Guía de contribución
├── 📄 IA.md                        ⭐ Retrospectiva uso de IA
├── 🚀 deploy.sh                    ⭐ Script automatizado (Linux/Mac)
├── 🚀 deploy.ps1                   ⭐ Script automatizado (Windows)
│
├── 📁 docs/                        ⭐ Documentación consolidada
│   ├── DOCUMENTATION.md            ⭐ Este archivo (guía técnica completa)
│   ├── FRONTEND.md                 ⭐ Documentación completa del frontend
│   ├── SMART_CONTRACT.md           ⭐ Documentación completa del smart contract
│   ├── REPORTS.md                  ⭐ Reportes consolidados (generales, SC, FE)
│   ├── RESEARCH.md                 ⭐ Investigación técnica consolidada
│   └── reports/
│       └── REPORTE_REORGANIZACION_FINAL.md
│
├── 📁 sc/                          ⭐ Smart Contract
│   ├── src/SupplyChain.sol
│   ├── test/
│   └── script/
│
├── 📁 web/                         ⭐ Frontend Next.js
│   ├── src/
│   │   ├── app/                    (9 páginas)
│   │   ├── components/             (26 componentes)
│   │   ├── hooks/                  (24 hooks)
│   │   ├── contracts/
│   │   └── lib/
│   └── package.json
│
└── 📁 logs/                        ⭐ Logs de ejecución
    ├── anvil.log
    ├── anvil_state.json            (Estado persistente)
    ├── frontend.log
    ├── deploy.log
    └── contract_address.txt
```

### 📊 Documentation Principles

1. **Single Source of Truth**: [`STATUS.md`](../STATUS.md) is the single source of truth for project status
2. **Consolidation**: Consolidated documentation to avoid redundancies
3. **Organization**: Logical structure from basic to advanced
4. **Update**: Dates updated to November 27, 2025

### Documentation Statistics

- **Root files**: 8 main files
- **Frontend documentation**: 1 consolidated file (`docs/FRONTEND.md`)
- **Smart contract documentation**: 1 consolidated file (`docs/SMART_CONTRACT.md`)
- **Consolidated research**: 1 file (`docs/RESEARCH.md`)
- **Consolidated reports**: 1 file (`docs/REPORTS.md`)
- **Technical documentation**: 1 file (`docs/DOCUMENTATION.md`)

---

**Last Updated**: November 28, 2025
