# 🚀 Deployment Guide

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**

Complete deployment guide for the SupplyChain smart contract.

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

### Local Development (Anvil)

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

### Testnet Deployment (Sepolia)

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

### Mainnet Deployment (Production)

⚠️ **CRITICAL**: Review all code thoroughly before mainnet deployment!

**Pre-Deployment Checklist:**
- [ ] All tests passing (108/108)
- [ ] Security audit completed
- [ ] Gas optimization reviewed
- [ ] Emergency procedures documented
- [ ] Backup deployer key secured
- [ ] Sufficient ETH for deployment (~0.5 ETH recommended)
- [ ] Post-deployment monitoring ready

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

### SupplyChainDeploy.s.sol - Main Deployment Script

**Purpose**: Automated, reproducible contract deployment for any network.

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

**Full workflow phases:**
1. **User Registration**: All 4 users request roles and get approved
2. **Token Creation**: Producer and Factory create their products
3. **Supply Chain**: Transfers flow through the chain
4. **Edge Cases**: Rejection and cancellation scenarios
5. **Final Verification**: All balances validated

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
cast call <address> "paused()(bool)" --rpc-url <network_url>
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

**2. Optional: Assign Pauser Role:**
```bash
cast send $CONTRACT_ADDRESS \
    "setPauseRole(address,uint8)" \
    <pauser_address> \
    1 \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY
```

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

- [Getting Started Guide](GETTING_STARTED.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [API Reference](API_REFERENCE.md)
- [Testing Guide](TESTING.md)
- [Scripts Documentation](SCRIPTS.md)

---

**Last Updated:** November 18, 2025  
**Contract Version:** 1.1.0  
**Network Support:** Anvil, Sepolia, Ethereum Mainnet
