# 🚀 Quick Start - Supply Chain Tracker

> **📚 COMPLETE DOCUMENTATION**: See [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) for comprehensive project guide

---

## 📊 Frontend Implementation Status

> **📋 For the most up-to-date project status, see [STATUS.md](./STATUS.md)**  
> **📚 For complete pages and components documentation, see [docs/FRONTEND.md](./docs/FRONTEND.md)**

### 📄 Implemented Pages (9/9 - 100%)

```
web/src/app/
├── page.tsx                    ✅ IMPLEMENTED - Landing with MetaMask + Stats (Modern Design 2025)
├── dashboard/page.tsx          ✅ IMPLEMENTED - Complete role-based main panel (Modern Design 2025)
├── tokens/
│   ├── page.tsx               ✅ IMPLEMENTED - User token list (Modern Design 2025) ⭐ Day 5
│   ├── create/page.tsx        ✅ IMPLEMENTED - Create token form (Modern Design 2025) ⭐ Day 6
│   ├── [id]/page.tsx          ✅ IMPLEMENTED - Token details with traceability ⭐ Day 8
│   └── [id]/transfer/page.tsx ✅ IMPLEMENTED - Transfer from details ⭐ Day 8
├── transfers/page.tsx         ✅ IMPLEMENTED - Complete transfer management (Modern Design 2025) ⭐ Day 7
├── admin/
│   ├── page.tsx               ✅ IMPLEMENTED - Main admin panel ⭐ Day 8
│   └── users/page.tsx         ✅ IMPLEMENTED - Complete user management (Modern Design 2025)
└── profile/page.tsx           ✅ IMPLEMENTED - User profile ⭐ Day 8
```

**Progress**: 9/9 pages (100%) ✅

### 🧩 Specific Components (6/6 implemented)

```
web/src/components/
├── ConnectWallet.tsx          ✅ IMPLEMENTED - MetaMask connection
├── Header.tsx                 ✅ IMPLEMENTED - Navigation + branding + pause badge
├── ThemeToggle.tsx            ✅ IMPLEMENTED - Light/dark mode with persistence
├── TokenCard.tsx              ✅ IMPLEMENTED - Complete token card
├── TokenCardModern.tsx        ✅ IMPLEMENTED - Modern 2025 card (glassmorphism) ⭐ Day 6
└── TransferList.tsx           ✅ IMPLEMENTED - Transfer list with filters and actions ⭐ Day 7
```

**Progress**: 6/6 specific components (100%) ✅

### 🎨 Additional Implemented Components

```
web/src/components/
├── RegisterForm.tsx           ✅ Registration form with pause validation
├── ChangeRoleDialog.tsx       ✅ Change role dialog with pause validation
├── UserProfileCard.tsx        ✅ User profile
├── QuickActions.tsx           ✅ Quick actions with pause validation
├── CreateTransferForm.tsx     ✅ Create transfer form ⭐ Day 7
├── UserTokenList.tsx          ✅ User token list ⭐ Day 7
├── AddressDisplay.tsx         ✅ Addresses with copy/tooltip ⭐ Day 7
├── TraceabilityTimeline.tsx   ✅ End-to-end traceability ⭐ Day 8
└── admin/
    ├── UserManagementTable.tsx  ✅ User management table with filters + pause
    ├── UserStatsCards.tsx       ✅ System statistics cards
    ├── PauseControl.tsx         ✅ Contract pause control
    └── OwnershipTransfer.tsx    ✅ Ownership transfer management ⭐
```

**Total custom components**: 26 implemented  
**Shadcn UI Components**: 11 components (button, card, input, label, select, table, badge, dialog, alert, skeleton, textarea)

> **📚 See complete documentation**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### 🎨 Modern Design 2025 ⭐ NEW
**Implemented features**:
- Glassmorphism (glass effects with `backdrop-blur-xl`)
- Blue-purple gradients on titles and buttons
- Smooth animations and hover effects
- Rounded borders (`rounded-2xl`, `rounded-3xl`)
- Modern shadows (`shadow-lg`, `shadow-2xl`)
- Controlled by environment variable: `NEXT_PUBLIC_MODERN_DESIGN=true`

**Pages with modern design**:
- ✅ Landing (`/`)
- ✅ Dashboard (`/dashboard`)
- ✅ Tokens (`/tokens`)
- ✅ Create Token (`/tokens/create`)
- ✅ Transfers (`/transfers`) ⭐ Day 7
- ✅ Admin Users (`/admin/users`)

### 🪝 Custom Hooks

> **📚 For complete documentation of all hooks, see [docs/FRONTEND.md](./docs/FRONTEND.md)**

**Total**: 24 custom hooks (14 files) ✅

**Main files**:
```
web/src/hooks/
├── useContractReads.ts        ✅ 6 read hooks (userInfo, isAdmin, totals, dashboard stats)
├── useRequestRole.ts          ✅ Request user role
├── useCreateToken.ts          ✅ Create tokens
├── useTransfer.ts             ✅ 4 transfer hooks (transfer, accept, reject, cancel)
├── useAdminUsers.ts           ✅ 2 admin hooks (getAllUsers, changeUserStatus)
├── useContractOwner.ts        ✅ Verify contract ownership
├── usePendingOwner.ts         ✅ Get pendingOwner
├── useOwnershipTransfer.ts    ✅ 3 ownership functions (initiate, accept, reject)
├── useGetUserTokens.ts        ✅ 4 token hooks (getUserTokens, getToken, getTokenBalance, useGetAllTokens)
├── usePause.ts                ✅ 3 pause hooks (isPaused, pause, unpause)
├── useUserTokenStats.ts        ✅ Stats by type ⭐ Day 7
├── useGetUserTokensWithData.ts ✅ Tokens with complete data ⭐ Day 7
├── useGetUserTransfers.ts     ✅ User transfers ⭐ Day 7
├── useGetAllTransfers.ts      ✅ All system transfers ⭐ Day 8
└── useTokenTraceability.ts    ✅ End-to-end traceability ⭐ Day 8
```

> **📚 See complete list and detailed documentation**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### 📁 `contexts/` Directory

✅ **Implemented**: `src/contexts/AuthContext.tsx`
- Authentication and authorization management
- Admin vs approved users detection
- Redirect optimization (useUserIdByAddress)
- User theme preference restoration
- Optimized loading state handling

---

## 🚀 Next Steps (Roadmap)

### Start the project in 3 commands:

```bash
# 1. Give script permissions (first time only)
chmod +x deploy.sh

# 2. Start EVERYTHING (Anvil + Contract + Frontend)
./deploy.sh start

# 3. See MetaMask instructions
./deploy.sh metamask
```

**Ready!** Open http://localhost:3000 and connect MetaMask.

---

## 📋 `deploy.sh` Script Commands

> **📚 For complete script documentation, see [docs/DOCUMENTATION.md - Automated Deployment](./docs/DOCUMENTATION.md#-deployment-automatizado)**

### Main Commands

```bash
./deploy.sh start      # Start entire stack (Anvil + Contract + Frontend)
./deploy.sh stop       # Stop all services
./deploy.sh restart    # Restart entire stack
./deploy.sh status     # See service status
./deploy.sh metamask   # Instructions to configure MetaMask
./deploy.sh clean      # Clean Anvil persistent state (requires Anvil stopped)
./deploy.sh help       # Complete help with all commands
```

### Frontend Commands (without affecting Anvil/Contract)

```bash
./deploy.sh frontend start    # Start only frontend (requires Anvil running)
./deploy.sh frontend stop     # Stop only frontend
./deploy.sh frontend restart  # Restart only frontend
```

**Typical usage**: After making frontend changes, you can restart only the frontend without affecting Anvil or the deployed contract.

### Script Features

✅ **State Persistence**: Anvil saves blockchain state between restarts  
✅ **Smart Detection**: Detects if services are already running before starting them  
✅ **Automatic Validation**: Verifies contract is deployed before starting frontend  
✅ **Automatic Update**: Updates ABI and contract address in frontend automatically  
✅ **Organized Logs**: All logs saved in `logs/`  
✅ **Error Handling**: Clear validations and error messages

---

## 📖 Available Documentation

> **📚 For complete documentation index, see [INDEX.md](./INDEX.md)**

### Main Documentation
- **[STATUS.md](./STATUS.md)** ⭐ - Single source of truth for project status
- **[QUICKSTART.md](./QUICKSTART.md)** - This quick guide
- **[INDEX.md](./INDEX.md)** - Master index of all documentation
- **[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)** - Complete technical guide

### Component Documentation
- **[docs/FRONTEND.md](./docs/FRONTEND.md)** - Complete frontend documentation
- **[docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)** - Complete smart contract documentation

### Reports and Evaluations
- **[docs/REPORTS.md](./docs/REPORTS.md)** - Consolidated project reports
- **[docs/RESEARCH.md](./docs/RESEARCH.md)** - Technical research and analysis
- **[IA.md](./IA.md)** ⭐ - AI usage retrospective

---

## 🛠️ Technology Stack

> **📚 For detailed stack information, see [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)**

### Smart Contract
- **Solidity** 0.8.30
- **Foundry** (Forge + Anvil)
- **OpenZeppelin** Contracts
- **970+ lines** of code
- **108 tests** (85.60% lines, 72.15% branches, 82.67% statements, 80.95% functions)
- **Critical validations**: 5 implemented (100% completed)

> **📚 See complete documentation**: [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)

### Frontend
- **Next.js** 16.0.1
- **React** 19.2.0
- **TypeScript** 5.x
- **Tailwind CSS** 3.4.14
- **Shadcn UI**
- **wagmi** 2.12.0 + **viem** 2.21.0 + **ethers** 6.13.0

> **📚 See complete documentation**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### Local Blockchain
- **Anvil** (Foundry)
- **Chain ID**: 31337
- **RPC**: http://127.0.0.1:8545
- **15 accounts** with 10,000 ETH each

---

## 🔧 Requirements

Make sure you have installed:

```bash
# Node.js and npm
node --version  # v18+
npm --version   # v9+

# Foundry
forge --version
anvil --version

# Git
git --version
```

### Install Foundry (if you don't have it):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## 📁 Project Structure

> **📚 For detailed structure, see [docs/DOCUMENTATION.md - Project Structure](./docs/DOCUMENTATION.md#-estructura-del-proyecto)**

```
emujicad/
│
├── 🚀 deploy.sh                 # Automated script (650 lines)
├── 📄 QUICKSTART.md             # This guide
├── 📄 STATUS.md                  # Current project status ⭐
├── 📄 INDEX.md                  # Documentation index
├── 📁 docs/                     # All documentation
│   ├── DOCUMENTATION.md      # Complete technical guide
│   ├── FRONTEND.md           # Frontend documentation
│   ├── SMART_CONTRACT.md     # Smart contract documentation
│   ├── REPORTS.md            # Consolidated reports
│   ├── RESEARCH.md           # Technical research
│   └── SECURITY.md           # Security policy
│
├── 📁 sc/                       # Smart Contract
│   ├── src/SupplyChain.sol
│   ├── test/
│   └── script/
│
├── 📁 web/                      # Frontend Next.js
│   ├── src/
│   │   ├── app/              # 9 implemented pages
│   │   ├── components/       # 26 components
│   │   ├── hooks/            # 24 custom hooks
│   │   ├── contracts/
│   │   └── lib/
│   └── package.json
│
└── 📁 logs/                     # Execution logs
    ├── anvil.log
    ├── frontend.log
    └── deploy.log
```

---

## 🎯 Workflow

### 1️⃣ First Time (Setup)

```bash
# Clone the repo (if applicable)
git clone <repo-url>
cd emujicad

# Give script permissions
chmod +x deploy.sh

# Start everything
./deploy.sh start
```

### 2️⃣ Configure MetaMask

```bash
# See detailed instructions
./deploy.sh metamask
```

**Quick summary**:
- Add Anvil network (Chain ID: 31337, RPC: http://127.0.0.1:8545)
- Import test account (see command output)
- Connect at http://localhost:3000

### 3️⃣ Daily Development

```bash
# At start of day
./deploy.sh start

# Develop features...

# If you only change frontend, you can restart only frontend
./deploy.sh frontend restart

# At end of day
./deploy.sh stop
```

**Tip**: If you're only working on frontend, use `./deploy.sh frontend restart` to save time (doesn't redeploy contract).

### 4️⃣ Verify Status

```bash
# See service status
./deploy.sh status

# See logs in real time
tail -f logs/anvil.log
tail -f logs/frontend.log
tail -f logs/deploy.log
```

### 5️⃣ Clean Anvil State (Optional)

If you need to start with a clean blockchain (no tokens, transfers, users):

```bash
# Stop Anvil first
./deploy.sh stop

# Clean persistent state
./deploy.sh clean

# Restart everything with clean blockchain
./deploy.sh start
```

**Note**: The script will ask for confirmation before deleting state. If Anvil is running, it will offer to stop it first.

---

## 🔍 Quick Verification

After `./deploy.sh start`, verify:

1. **Anvil running**: 
   ```bash
   lsof -i :8545
   # Should show a process
   ```

2. **Frontend running**:
   ```bash
   lsof -i :3000
   # Should show a process
   ```

3. **Contract deployed**:
   ```bash
   cat logs/contract_address.txt
   # Should show an address (0x...)
   ```

4. **Open DApp**:
   - Browser: http://localhost:3000
   - Connect MetaMask
   - See stats: 0 Tokens, 0 Users, 0 Transfers (initial state)

5. **Verify persistent state** (if you restart Anvil):
   ```bash
   # If Anvil restarted but state persists, you'll see:
   ls -lh logs/anvil_state.json
   # File contains blockchain state (tokens, transfers, users)
   ```

---

## 🐛 Quick Troubleshooting

### Error: "Port already in use"

```bash
# Stop services
./deploy.sh stop

# Verify ports
lsof -i :8545  # Anvil
lsof -i :3000  # Frontend

# Kill processes if necessary
kill -9 <PID>
```

### Error: "Contract not deployed"

```bash
# See deployment logs
cat logs/deploy.log

# Restart everything
./deploy.sh restart
```

### Error: "Cannot connect to MetaMask"

```bash
# Verify configuration
./deploy.sh metamask

# Make sure:
# - Anvil network added in MetaMask
# - Account imported
# - Frontend running on :3000
```

### More problems

See **[docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)** for detailed solutions.

---

## 📊 Current Project Status

> **📋 For detailed and up-to-date project status information, see [STATUS.md](./STATUS.md)**

**Last Updated**: November 27, 2025

### 🎯 Executive Summary

**General Score: 7.4/9.5** ✅ PASSING

| Component | Status |
|-----------|--------|
| **Smart Contract** | ✅ 4.0/4.0 (100%) - 108 tests, 85.60% coverage, critical validations completed |
| **Frontend** | ✅ 3.0/3.0 (100%) - 9/9 pages, 26 components, 24 hooks |
| **Extras** | ⚠️ 0.5/1.0 (50%) - deploy script validated |
| **Video** | ❌ 0.0/1.5 (0%) - Pending |

**Next step**: Video Demo (Day 9) - +1.5 points

> **📚 See detailed roadmap and next steps**: [STATUS.md](./STATUS.md)

---

## 🔗 Useful Links

### Project Documentation
> **📚 See [INDEX.md](./INDEX.md) for complete index**

**Main**:
- [STATUS.md](./STATUS.md) ⭐ - Current status and next steps
- [INDEX.md](./INDEX.md) - Master index of all documentation
- [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) - Complete technical guide

**Frontend**:
- [docs/FRONTEND.md](./docs/FRONTEND.md) - Complete frontend documentation

**Smart Contract**:
- [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md) - Complete smart contract documentation

### Technologies
- [Solidity Docs](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [viem Docs](https://viem.sh)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

---

## 💡 Tips

### For Developers

1. **Use the script**: Don't start services manually
2. **Check logs**: Always verify `logs/` for errors
3. **Read docs/DOCUMENTATION.md**: All architecture is there
4. **Run tests**: `cd sc && forge test` before commits

### For Evaluators

1. **Run**: `./deploy.sh start`
2. **Test**: http://localhost:3000
3. **Review tests**: `cd sc && forge test -vv`
4. **Read**: [docs/REPORTS.md](./docs/REPORTS.md) for complete evaluation

---

## 📞 Help

**Problem with deployment?**
→ `./deploy.sh help` and [docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)

**Need to understand the code?**
→ [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)

**Working on frontend?**
→ [docs/FRONTEND.md](./docs/FRONTEND.md)

**Working on smart contract?**
→ [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)

**Want to see complete index?**
→ [INDEX.md](./INDEX.md)

**Current project status?**
→ [STATUS.md](./STATUS.md) ⭐

---

## 🔍 Quick Guides by Role

### For Developers

**First time**:
1. Read [README.md](./README.md)
2. Run `./deploy.sh start`
3. Configure MetaMask: `./deploy.sh metamask`
4. Read [docs/FRONTEND.md](./docs/FRONTEND.md) for frontend

**Daily development**:
1. `./deploy.sh start` - Start services
2. Develop features
3. `./deploy.sh frontend restart` - Restart only frontend (if only changing frontend)
4. `./deploy.sh stop` - Stop services

**Troubleshooting**:
1. `./deploy.sh status` - See status
2. Review logs in `logs/`
3. Consult [docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)

### For Evaluators

**Evaluate the project**:
1. Read [docs/REPORTS.md](./docs/REPORTS.md) - Consolidated reports
2. Run `./deploy.sh start`
3. Test DApp at http://localhost:3000
4. See tests: `cd sc && forge test`

### For New Contributors

**Onboarding**:
1. [README.md](./README.md) - Quick start
2. [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) - Complete architecture
3. [docs/FRONTEND.md](./docs/FRONTEND.md) - Frontend details
4. [STATUS.md](./STATUS.md) - Current status

---

## 📚 External Documentation

### Useful Links

**Technologies**:
- [Solidity Docs](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [viem Docs](https://viem.sh)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

**OpenZeppelin**:
- [Contracts](https://docs.openzeppelin.com/contracts/)
- [Ownable](https://docs.openzeppelin.com/contracts/access#ownership)
- [Pausable](https://docs.openzeppelin.com/contracts/api/security#Pausable)

**MetaMask**:
- [Developer Docs](https://docs.metamask.io/)
- [Getting Started](https://docs.metamask.io/wallet/get-started/set-up-dev-environment/)

---

**Created**: November 18, 2025  
**Last Updated**: November 27, 2025  
**Version**: 1.6.0  
**Status**: ✅ 9/9 pages completed (100%), 24 hooks implemented, critical contract validations implemented

> **📋 For the most up-to-date status, see [STATUS.md](./STATUS.md)**

---

<div align="center">

### 🚀 Let's Develop!

```bash
./deploy.sh start
```

</div>
