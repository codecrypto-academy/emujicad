# 🚀 Deployment Guide

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para estado del contrato inteligente, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**  
> **📚 Para guía rápida de inicio, consulta [QUICKSTART.md](../../QUICKSTART.md)**  
> **📚 Para deployment automatizado completo, consulta [deploy.sh](../../deploy.sh)**

Complete deployment guide for the SupplyChain smart contract.

**Última actualización**: 26 de Noviembre, 2025

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Deployment](#quick-deployment)
3. [Deployment Scripts](#deployment-scripts)
4. [Network Configurations](#network-configurations)
5. [Verification](#verification)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Tools
- **Foundry** (forge, anvil, cast)
- **Node.js** (v16+ for optional tooling)
- **Git** (for version control)

### Installation
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
anvil --version
cast --version
```

### Required Environment Variables
```bash
# For testnet/mainnet deployment
export PRIVATE_KEY=0x<your_private_key>

# For network RPC URLs
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your_api_key>
export MAINNET_RPC_URL=https://mainnet.infura.io/v3/<your_api_key>

# For verification (optional)
export ETHERSCAN_API_KEY=<your_etherscan_api_key>
```

⚠️ **Security Warning**: Never commit private keys to version control!

---

## 🚀 Quick Deployment

### Option 0: Full Stack Automated Deployment (Recommended)

**Use `deploy.sh` for complete automation:**

```bash
# Start everything (Anvil + Contract + Frontend)
./deploy.sh start

# Check status
./deploy.sh status

# Stop everything
./deploy.sh stop

# For more details, see:
# - [QUICKSTART.md](../../QUICKSTART.md)
# - [deploy.sh](../../deploy.sh)
```

> **📚 Para deployment automatizado completo, consulta [QUICKSTART.md](../../QUICKSTART.md) o ejecuta `./deploy.sh help`**

---

### Option 1: Local Development (Anvil - Manual)

**Step 1: Start Local Blockchain**
```bash
# Terminal 1: Start Anvil
anvil
```

Expected output:
```
Available Accounts
==================
(0) 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
(1) 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
...

Private Keys
==================
(0) 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...

Listening on 127.0.0.1:8545
```

**Step 2: Deploy Contract**
```bash
# Terminal 2: Deploy
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast
```

Expected output:
```
=== SupplyChain Deployment Script ===
Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Balance: 10000000000000000000000

SupplyChain deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Contract owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

✅ Deployment successful
```

**Step 3: Run Interactive Demo**
```bash
# Terminal 3: Execute workflow demo
forge script script/SupplyChainInteractions.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast
```

---

### Option 2: Testnet Deployment (Sepolia)

**Step 1: Configure Environment**
```bash
export PRIVATE_KEY=0x<your_private_key>
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<your_api_key>
export ETHERSCAN_API_KEY=<your_etherscan_api_key>
```

**Step 2: Verify Deployer Balance**
```bash
# Check balance (should have > 0.1 ETH for deployment + gas)
cast balance <your_address> --rpc-url $SEPOLIA_RPC_URL
```

Get testnet ETH from faucets:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

**Step 3: Deploy & Verify**
```bash
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    -vvv
```

**Step 4: Verify Deployment**
```bash
# Check if contract is deployed
cast code <deployed_contract_address> --rpc-url $SEPOLIA_RPC_URL

# Verify owner
cast call <deployed_contract_address> \
    "owner()(address)" \
    --rpc-url $SEPOLIA_RPC_URL
```

---

### Option 3: Mainnet Deployment (Production)

⚠️ **CRITICAL**: Review all code thoroughly before mainnet deployment!

**Pre-Deployment Checklist:**
- [ ] All tests passing (108/108: 64 core + 44 edge cases)
- [ ] Security audit completed (see [SECURITY.md](SECURITY.md))
- [ ] Gas optimization reviewed
- [ ] Emergency procedures documented
- [ ] Backup deployer key secured
- [ ] Sufficient ETH for deployment (~0.5 ETH recommended)
- [ ] Post-deployment monitoring ready

> **📚 Para detalles de tests, consulta [TESTING.md](TESTING.md)**

**Deployment Steps:**
```bash
# 1. Final test run
forge test --match-contract "SupplyChain|EdgeCases"

# 2. Configure mainnet
export PRIVATE_KEY=0x<your_private_key>
export MAINNET_RPC_URL=https://mainnet.infura.io/v3/<your_api_key>
export ETHERSCAN_API_KEY=<your_etherscan_api_key>

# 3. Estimate gas cost
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url $MAINNET_RPC_URL

# 4. Deploy with verification
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url $MAINNET_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY \
    --slow \
    -vvv

# 5. Save deployment address immediately!
echo "Contract deployed at: <address>" > deployment.txt
```

---

## 📜 Deployment Scripts

### deploy.sh - Full Stack Automation (Recommended)

**Location**: `deploy.sh` (root directory)

**Purpose**: Complete automation for Anvil + Smart Contract + Frontend.

> **📚 Para documentación completa de `deploy.sh`, consulta [QUICKSTART.md](../../QUICKSTART.md) o ejecuta `./deploy.sh help`**

**Comandos disponibles:**
- `./deploy.sh start` - Inicia todo el stack (Anvil + Contrato + Frontend)
- `./deploy.sh stop` - Detiene todos los servicios
- `./deploy.sh restart` - Reinicia todo el stack
- `./deploy.sh status` - Muestra estado de servicios
- `./deploy.sh frontend start/stop/restart` - Gestión independiente del frontend
- `./deploy.sh clean` - Limpia estado persistente de Anvil
- `./deploy.sh metamask` - Instrucciones para configurar MetaMask
- `./deploy.sh help` - Ayuda completa

**Características:**
- ✅ Persistencia de estado de Anvil (`logs/anvil_state.json`)
- ✅ Detección inteligente de procesos en ejecución
- ✅ Logs organizados en directorio `logs/`
- ✅ Actualización automática de configuración del frontend
- ✅ Gestión independiente del frontend sin afectar Anvil/Contrato

---

### SupplyChainDeploy.s.sol - Main Deployment Script

**Location**: `script/SupplyChainDeploy.s.sol`

**Purpose**: Automated, reproducible contract deployment for any network.

> **📚 Nota**: Para desarrollo local, se recomienda usar `deploy.sh`. Este script es útil para deployment manual o en testnets/mainnet.

**What it does:**
1. ✅ Reads private key from environment
2. ✅ Verifies deployer balance
3. ✅ Deploys SupplyChain contract
4. ✅ Verifies owner assignment
5. ✅ Logs all deployment information

**Usage:**
```bash
# Syntax
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url <network_url> \
    --broadcast \
    [--verify] \
    [--etherscan-api-key <key>]

# Local
forge script script/SupplyChainDeploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Sepolia
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY

# Mainnet
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url $MAINNET_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY
```

**Expected Output:**
```
=== SupplyChain Deployment Script ===
Deployer address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Deployer balance: 10000000000000000000000

SupplyChain deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Contract owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

=== Deployment Verification ===
✅ Contract deployed successfully
✅ Owner set correctly: true
✅ Ready for interactions
```

---

### SupplyChainInteractions.s.sol - Workflow Demo Script

**Purpose**: End-to-end demonstration of contract functionality.

**What it simulates:**
- 👥 4 users: Producer, Factory, Retailer, Consumer
- 🪙 2 tokens: Raw Cotton, Cotton Fabric
- 🔄 5 transfers: 3 accepted, 1 rejected, 1 canceled
- 👑 Ownership transfer: Initiate, accept, reject scenarios

**Full workflow phases:**
1. **User Registration**: All 4 users request roles and get approved
2. **Token Creation**: Producer and Factory create their products
3. **Supply Chain**: Transfers flow through the chain
4. **Edge Cases**: Rejection and cancellation scenarios
5. **Ownership Transfer** ✅ (Implementado): Initiate, accept, reject ownership transfer
6. **Final Verification**: All balances validated, ownership verified

> **📚 Para detalles de ownership transfer, consulta [API_REFERENCE.md](API_REFERENCE.md#ownership-transfer-functions)**

**Usage:**
```bash
# Simulation only (no gas cost)
forge script script/SupplyChainInteractions.s.sol

# Deploy and execute on Anvil
anvil  # Terminal 1
forge script script/SupplyChainInteractions.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast  # Terminal 2

# Execute on existing deployed contract
# (Edit line 32 in SupplyChainInteractions.s.sol with deployed address)
forge script script/SupplyChainInteractions.s.sol \
    --rpc-url <network_url> \
    --broadcast

# Detailed output
forge script script/SupplyChainInteractions.s.sol -vvv
```

**Expected Output:**
```
=== SupplyChain Workflow Demonstration ===
Contract: 0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3

=== PHASE 1: USER REGISTRATION ===
✅ Producer requested role
✅ Factory requested role
✅ Retailer requested role
✅ Consumer requested role
✅ All users approved

=== PHASE 2: TOKEN CREATION ===
✅ Token 1: Raw Cotton (1000 units)
✅ Token 2: Cotton Fabric (500 units)

=== PHASE 3: TRANSFERS ===
✅ Transfer 1: Producer -> Factory accepted
✅ Transfer 2: Factory -> Retailer accepted
✅ Transfer 3: Retailer -> Consumer accepted
❌ Transfer 4: Producer -> Factory rejected
�� Transfer 5: Producer -> Factory canceled

=== FINAL STATUS ===
✅ All balances verified
✅ Demo completed successfully!
```

---

## 🌐 Network Configurations

### Supported Networks

| Network | Chain ID | RPC URL | Explorer | Gas Token |
|---------|----------|---------|----------|-----------|
| **Anvil (Local)** | 31337 | http://localhost:8545 | - | ETH |
| **Sepolia (Testnet)** | 11155111 | https://sepolia.infura.io/v3/... | https://sepolia.etherscan.io | SepoliaETH |
| **Ethereum Mainnet** | 1 | https://mainnet.infura.io/v3/... | https://etherscan.io | ETH |

### Gas Estimates

| Network | Deployment Cost | Typical Transaction |
|---------|-----------------|---------------------|
| **Anvil** | ~3M gas (free) | ~100k gas (free) |
| **Sepolia** | ~3M gas (~0.01 ETH) | ~100k gas (~0.0003 ETH) |
| **Mainnet** | ~3M gas (~0.1-0.5 ETH)* | ~100k gas (~0.01-0.05 ETH)* |

*Varies with gas prices

### RPC Providers

**Free Tier:**
- [Infura](https://infura.io/) - 100k requests/day
- [Alchemy](https://www.alchemy.com/) - 300M compute units/month
- [Ankr](https://www.ankr.com/) - Free tier available

**Public RPCs:**
- Sepolia: https://rpc.sepolia.org
- Mainnet: https://eth.llamarpc.com

---

## ✅ Verification

### Verify Contract on Etherscan

**Automatic Verification (during deployment):**
```bash
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY
```

**Manual Verification (after deployment):**
```bash
forge verify-contract \
    <deployed_contract_address> \
    src/SupplyChain.sol:SupplyChain \
    --chain-id 11155111 \
    --etherscan-api-key $ETHERSCAN_API_KEY
```

**Verify deployment success:**
```bash
# Check contract code exists
cast code <address> --rpc-url <network_url>

# Verify owner
cast call <address> "owner()(address)" --rpc-url <network_url>

# Check if paused
cast call <address> "isPaused()(bool)" --rpc-url <network_url>
```

---

## 🔧 Post-Deployment

### Initial Setup

**1. Verify Deployment:**
```bash
# Contract exists
cast code $CONTRACT_ADDRESS --rpc-url $RPC_URL

# Owner is correct
cast call $CONTRACT_ADDRESS "owner()(address)" --rpc-url $RPC_URL
```

**2. Optional: Pause/Unpause Contract:**
```bash
# Pause contract (only owner)
cast send $CONTRACT_ADDRESS \
    "pause()" \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY

# Unpause contract (only owner)
cast send $CONTRACT_ADDRESS \
    "unpause()" \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY

# Check if paused
cast call $CONTRACT_ADDRESS "isPaused()(bool)" --rpc-url $RPC_URL
```

> **📚 Nota**: Las funciones `pause()` y `unpause()` solo pueden ser llamadas por el owner del contrato. Para más detalles, consulta [API_REFERENCE.md](API_REFERENCE.md).

**3. Monitor Contract:**
- Set up event monitoring for critical operations
- Monitor gas costs for optimization opportunities
- Track user registrations and approvals

### Best Practices

✅ **DO:**
- Keep private keys in secure vaults (never in code)
- Use hardware wallets for mainnet deployments
- Test thoroughly on testnet before mainnet
- Verify contracts on Etherscan
- Document all deployment addresses
- Set up monitoring and alerting
- Have emergency response procedures

❌ **DON'T:**
- Commit private keys to Git
- Deploy without thorough testing
- Skip verification on Etherscan
- Deploy on mainnet without testnet validation
- Lose track of deployment addresses
- Deploy without backup plans

---

## 🔍 Troubleshooting

### Common Issues

**Issue: "Insufficient funds"**
```bash
# Solution: Check balance
cast balance <your_address> --rpc-url $RPC_URL

# Get testnet ETH from faucets
```

**Issue: "Nonce too low"**
```bash
# Solution: Check pending transactions
cast nonce <your_address> --rpc-url $RPC_URL

# Wait for pending txs or increase gas price
```

**Issue: "Gas estimation failed"**
```bash
# Solution: Simulate deployment
forge script script/SupplyChainDeploy.s.sol --rpc-url $RPC_URL

# Check for compilation errors
forge build
```

**Issue: "Verification failed"**
```bash
# Solution: Verify manually
forge verify-contract \
    <address> \
    src/SupplyChain.sol:SupplyChain \
    --chain-id <chain_id> \
    --etherscan-api-key $ETHERSCAN_API_KEY

# Check constructor arguments if needed
```

**Issue: "Transaction reverted"**
```bash
# Solution: Check transaction details
cast tx <tx_hash> --rpc-url $RPC_URL

# Get revert reason
cast run <tx_hash> --rpc-url $RPC_URL
```

---

## 📚 Additional Resources

**Smart Contract Documentation**:
- [Getting Started Guide](GETTING_STARTED.md) - Setup and installation
- [Architecture Documentation](ARCHITECTURE.md) - System design
- [API Reference](API_REFERENCE.md) - Contract interface and functions
- [Testing Guide](TESTING.md) - Test coverage and validation (108 tests)
- [Security Guide](SECURITY.md) - Security features and best practices
- [Scripts Documentation](SCRIPTS.md) - Automation scripts

**Project Documentation**:
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Current project status
- [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md) - Contract status and metrics
- [INDEX.md](../../INDEX.md) - Complete documentation index
- [QUICKSTART.md](../../QUICKSTART.md) - Quick start guide
- [deploy.sh](../../deploy.sh) - Full stack deployment automation

---

**Última actualización**: 26 de Noviembre, 2025  
**Contract Version**: 1.2.0  
**Network Support**: Anvil (Local), Sepolia (Testnet), Ethereum Mainnet  
**Test Suite**: 108 tests (64 core + 44 edge cases) - 100% passing
