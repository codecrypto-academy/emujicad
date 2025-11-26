# 🚀 Getting Started

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para estado del contrato inteligente, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**  
> **📚 Para guía rápida de inicio completo, consulta [QUICKSTART.md](../../QUICKSTART.md)**

Complete guide to get SupplyChain smart contract up and running.

**Última actualización**: 26 de Noviembre, 2025

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
✅ 108/108 tests passing
   - SupplyChain.t.sol: 64 tests (core functionality)
   - EdgeCasesTest.t.sol: 44 tests (edge cases)
✅ 0 tests failing

> **📚 Para documentación completa de tests, consulta [TESTING.md](TESTING.md)**
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

### Option 4: Full Stack Deployment (Recommended)
```bash
# Use deploy.sh for complete automation (Anvil + Contract + Frontend)
./deploy.sh start

# For more details, see:
# - [QUICKSTART.md](../../QUICKSTART.md)
# - [deploy.sh](../../deploy.sh)
```

> **📚 Para deployment automatizado completo, consulta [QUICKSTART.md](../../QUICKSTART.md) o ejecuta `./deploy.sh help`**

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
# Run complete validation (26+ checks in 8 phases)
bash validate-all.sh

# Output:
# ✅ FASE 1: Dependencias (3/3)
# ✅ FASE 2: Compilación (1/1)
# ✅ FASE 3: Tests (3/3)
# ✅ FASE 4: Scripts de Deployment (2/2)
# ✅ FASE 5: Métricas de Coverage (4/4)
# ✅ FASE 6: Scripts de Reporte (2/2)
# ✅ FASE 7: Estructura de Archivos (5/5)
# ✅ FASE 8: Validación de Documentación (6/6)
# 🎉 26+/26+ validaciones pasadas

> **📚 Para detalles de validaciones, consulta [SCRIPTS.md](SCRIPTS.md#validation-scripts) y [SCRIPTS_ARCHITECTURE.md](SCRIPTS_ARCHITECTURE.md)**
```

### Coverage Scripts
```bash
# Detailed coverage with markdown export (interactive mode)
bash coverage-reporter.sh

# Detailed coverage with markdown export (automatic mode)
bash coverage-reporter.sh --auto

> **📚 Para documentación completa de scripts de coverage, consulta [SCRIPTS.md](SCRIPTS.md#coverage-scripts)**
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
3. **Review Tests** - Check [TESTING.md](TESTING.md) for test coverage and methodology
4. **Review Security** - Check [SECURITY.md](SECURITY.md) for security features
5. **Deploy** - Follow [DEPLOYMENT.md](DEPLOYMENT.md) for deployment procedures
6. **Customize** - Modify scripts in `script/` for your use case

> **📚 Para documentación completa, consulta [INDEX.md](../../INDEX.md)**

---

## 🆘 Getting Help

- **Documentation**: Check other docs in `docs/` folder
- **Project Status**: See [PROJECT_STATUS.md](../../PROJECT_STATUS.md) for current state
- **Issues**: Review error messages carefully
- **Testing**: Use `-vvvv` flag for maximum verbosity
- **Validation**: Run `validate-all.sh` to check everything
- **Scripts**: See [SCRIPTS.md](SCRIPTS.md) for automation scripts
- **Architecture**: See [SCRIPTS_ARCHITECTURE.md](SCRIPTS_ARCHITECTURE.md) for script design

---

## 🔗 Referencias Relacionadas

**Smart Contract Documentation**:
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design and architecture
- [API_REFERENCE.md](API_REFERENCE.md) - Contract interface and functions
- [TESTING.md](TESTING.md) - Test coverage and validation (108 tests)
- [SECURITY.md](SECURITY.md) - Security features and best practices
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment procedures
- [SCRIPTS.md](SCRIPTS.md) - Automation scripts documentation
- [SCRIPTS_ARCHITECTURE.md](SCRIPTS_ARCHITECTURE.md) - Script architecture

**Project Documentation**:
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Current project status
- [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md) - Contract status and metrics
- [INDEX.md](../../INDEX.md) - Complete documentation index
- [QUICKSTART.md](../../QUICKSTART.md) - Quick start guide

---

**Última actualización**: 26 de Noviembre, 2025  
**Next**: [Architecture Overview](ARCHITECTURE.md) →
