# 🚀 Getting Started

Complete guide to get SupplyChain smart contract up and running.

---

## 📋 Prerequisites

### Required Tools
- **Foundry** (forge, cast, anvil) - [Install Guide](https://book.getfoundry.sh/getting-started/installation)
- **Git** - Version control
- **Node.js** v16+ (optional, for frontend integration)

### Check Installation
```bash
forge --version  # Should show v0.2.0 or later
cast --version
anvil --version
```

---

## 📦 Installation

### 1. Clone Repository
```bash
git clone <repository-url>
cd sc
```

### 2. Install Dependencies
```bash
# Install Foundry dependencies
forge install

# This installs:
# - OpenZeppelin Contracts (security, access control)
# - Forge Standard Library (testing utilities)
```

### 3. Verify Installation
```bash
# Compile contracts
forge build

# Expected output:
# [⠊] Compiling...
# [⠒] Compiling 26 files with 0.8.30
# [⠢] Solc 0.8.30 finished in X.XXs
# Compiler run successful!
```

---

## 🧪 Running Tests

### Basic Test Execution
```bash
# Run all tests
forge test

# Run with verbosity
forge test -vv

# Run specific test file
forge test --match-path test/SupplyChain.t.sol

# Run specific test function
forge test --match-test testCreateToken -vvv
```

### Expected Results
```
✅ 73/73 tests passing
   - SupplyChainTest: 55 tests
   - EdgeCasesTest: 18 tests
✅ 0 tests failing
```

### Coverage Report
```bash
# Generate coverage report
forge coverage

# Generate detailed LCOV report
forge coverage --report lcov

# View coverage for specific contract
forge coverage --report summary
```

---

## �� Quick Start Workflow

### Option 1: Local Testing (Recommended for Development)
```bash
# 1. Run tests
forge test

# 2. Check coverage
forge coverage

# 3. Run validation
bash validate-all.sh
```

### Option 2: Local Deployment
```bash
# Terminal 1: Start local blockchain
anvil

# Terminal 2: Deploy contract
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast

# Terminal 3: Run interactions demo
forge script script/SupplyChainInteractions.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast
```

### Option 3: Testnet Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed testnet/mainnet procedures.

---

## ⚙️ Configuration

### Environment Variables
Create a `.env` file (never commit this!):
```bash
# Deployment
PRIVATE_KEY=0x...                    # Deployer private key
SEPOLIA_RPC_URL=https://...          # Alchemy/Infura RPC endpoint
MAINNET_RPC_URL=https://...
ETHERSCAN_API_KEY=...                # For contract verification

# Testing (optional)
FORK_URL=https://...                 # For mainnet forking tests
```

### Foundry Configuration
Check `foundry.toml` for project settings:
- Solidity version: 0.8.30
- Optimizer: Enabled with 200 runs
- Test verbosity: Medium
- Coverage: Enabled

---

## 🔍 Validation Tools

### Automated Validation Suite
```bash
# Run complete validation (20 checks)
bash validate-all.sh

# Output:
# ✅ FASE 1: Dependencias (3/3)
# ✅ FASE 2: Compilación (1/1)
# ✅ FASE 3: Tests (3/3)
# ✅ FASE 4: Scripts (2/2)
# ✅ FASE 5: Coverage (4/4)
# ✅ FASE 6: Estructura (7/7)
# 🎉 20/20 validaciones pasadas
```

### Coverage Scripts
```bash
# Quick coverage check
bash coverage-reporter-simple.sh

# Detailed coverage with markdown export
bash coverage-reporter.sh
```

---

## 🐛 Troubleshooting

### Common Issues

#### "forge: command not found"
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

#### "Library not found"
```bash
# Reinstall dependencies
forge install --force
```

#### "Compilation failed"
```bash
# Clean and rebuild
forge clean
forge build
```

#### "Tests failing"
```bash
# Run with verbose output to see errors
forge test -vvv

# Check specific test
forge test --match-test testFunctionName -vvvv
```

#### "Gas estimation failed"
```bash
# Increase gas limit in foundry.toml
[profile.default]
gas_limit = 30000000
```

---

## 📚 Next Steps

After successful setup:

1. **Explore the Contract** - Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
2. **Review API** - Check [API_REFERENCE.md](API_REFERENCE.md) for available functions
3. **Deploy** - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for deployment procedures
4. **Customize** - Modify scripts in `script/` for your use case

---

## 🆘 Getting Help

- **Documentation**: Check other docs in `docs/` folder
- **Issues**: Review error messages carefully
- **Testing**: Use `-vvvv` flag for maximum verbosity
- **Validation**: Run `validate-all.sh` to check everything

---

**Next**: [Architecture Overview](ARCHITECTURE.md) →
