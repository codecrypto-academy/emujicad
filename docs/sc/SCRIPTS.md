# 🤖 Scripts Documentation

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**

Complete documentation for all automation scripts in the project.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Deployment Scripts](#deployment-scripts)
3. [Interaction Scripts](#interaction-scripts)
4. [Testing Scripts](#testing-scripts)
5. [Validation Scripts](#validation-scripts)
6. [Coverage Scripts](#coverage-scripts)
7. [Best Practices](#best-practices)

---

## 🎯 Overview

This project includes comprehensive automation scripts for deployment, testing, validation, and demonstrations.

### Script Categories

| Category | Scripts | Purpose |
|----------|---------|---------|
| **Deployment** | `SupplyChainDeploy.s.sol` | Contract deployment automation |
| **Demo** | `SupplyChainInteractions.s.sol` | End-to-end workflow demonstration |
| **Validation** | `validate-all.sh` | Comprehensive validation suite |
| **Coverage** | `coverage.sh` | Code coverage analysis |
| **Testing** | Foundry tests | Automated testing suite |

---

## 🚀 Deployment Scripts

### SupplyChainDeploy.s.sol

**Location:** `script/SupplyChainDeploy.s.sol`

**Purpose:** Automated deployment of SupplyChain contract to any network.

#### Features
- ✅ Environment-based configuration
- ✅ Deployer balance verification
- ✅ Automatic ownership assignment
- ✅ Deployment verification
- ✅ Comprehensive logging

#### Usage

```bash
# Local deployment (Anvil)
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast

# Testnet deployment (Sepolia)
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY

# Mainnet deployment
forge script script/SupplyChainDeploy.s.sol \
    --rpc-url $MAINNET_RPC_URL \
    --broadcast \
    --verify \
    --etherscan-api-key $ETHERSCAN_API_KEY
```

#### Environment Variables

```bash
# Required
export PRIVATE_KEY=0x<your_private_key>

# Optional (for specific networks)
export SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/<api_key>
export MAINNET_RPC_URL=https://mainnet.infura.io/v3/<api_key>
export ETHERSCAN_API_KEY=<your_etherscan_key>
```

#### Output Example

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

#### Use Cases
- 🌐 CI/CD automated deployments
- 🧪 Testing environment setup
- 🏭 Production deployment
- 📚 Documentation and demos

---

## 🎭 Interaction Scripts

### SupplyChainInteractions.s.sol

**Location:** `script/SupplyChainInteractions.s.sol`

**Purpose:** Complete workflow demonstration simulating real supply chain operations.

#### What It Demonstrates

**Phase 1: User Registration**
- 4 users request roles (Producer, Factory, Retailer, Consumer)
- Owner approves all requests
- Users transition to Approved status

**Phase 2: Token Creation**
- Producer creates "Raw Cotton" (1000 units)
- Factory creates "Cotton Fabric" (500 units)
- Tokens properly initialized with parent relationships

**Phase 3: Supply Chain Flow**
- Producer → Factory: 500 units transfer
- Factory → Retailer: 200 units transfer
- Retailer → Consumer: 50 units transfer

**Phase 4: Edge Cases**
- Transfer rejection scenario
- Transfer cancellation scenario

**Phase 5: Final Verification**
- All balances validated
- System state confirmed

#### Usage

```bash
# Simulation only (no broadcast)
forge script script/SupplyChainInteractions.s.sol

# Execute on Anvil (local)
anvil  # Terminal 1
forge script script/SupplyChainInteractions.s.sol \
    --rpc-url http://localhost:8545 \
    --broadcast  # Terminal 2

# Execute on deployed contract
# (Edit contract address in line 32)
forge script script/SupplyChainInteractions.s.sol \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast

# Detailed output
forge script script/SupplyChainInteractions.s.sol -vvv
```

#### Output Example

```
=== SupplyChain Workflow Demonstration ===
Contract: 0x5aAdFB43eF8dAF45DD80F4676345b7676f1D70e3
Owner: 0x9f7cF1d1F558E57ef88a59ac3D47214eF25B6A06

=== PHASE 1: USER REGISTRATION ===
✅ Producer requested role
✅ Factory requested role
✅ Retailer requested role
✅ Consumer requested role
✅ All users approved by owner

=== PHASE 2: TOKEN CREATION ===
✅ Token 1: Raw Cotton created by Producer (1000 units)
✅ Token 2: Cotton Fabric created by Factory (500 units)

=== PHASE 3: SUPPLY CHAIN TRANSFERS ===
✅ Transfer 1 requested: Producer -> Factory (500 units)
✅ Transfer 1 accepted by Factory
  Producer balance: 500, Factory balance: 500

✅ Transfer 2 requested: Factory -> Retailer (200 units)  
✅ Transfer 2 accepted by Retailer
  Factory balance: 300, Retailer balance: 200

✅ Transfer 3 requested: Retailer -> Consumer (50 units)
✅ Transfer 3 accepted by Consumer
  Retailer balance: 150, Consumer balance: 50

=== PHASE 4: EDGE CASES ===
❌ Transfer 4: Rejected by Factory
  Tokens returned to Producer: 50
  
🚫 Transfer 5: Canceled by Producer
  Tokens returned to Producer: 50

=== FINAL STATUS ===
Next Token ID: 3
Next Transfer ID: 6
✅ Producer balance (token 1): 600
✅ Factory balance (token 1): 500  
✅ Consumer balance (token 2): 50

✅ Demo completed successfully!
```

#### Use Cases
- 🎓 Academic presentations
- 📚 Documentation examples
- 🧪 End-to-end testing
- �� Team onboarding
- 🔍 System debugging

---

## �� Testing Scripts

### Foundry Test Suite

**Location:** `test/`

#### Test Files

| File | Tests | Focus |
|------|-------|-------|
| `SupplyChain.t.sol` | 55 | Core functionality |
| `EdgeCasesTest.t.sol` | 18 | Edge cases & branch coverage |

**Total: 108 tests** (all passing consistently)

#### Running Tests

```bash
# All tests
forge test

# Specific test file
forge test --match-path test/SupplyChain.t.sol

# Specific test
forge test --match-test testCreateToken_Success

# With verbosity
forge test -vvv

# Gas report
forge test --gas-report

# Only core tests (55 tests)
forge test --match-contract SupplyChain

# Only edge cases (18 tests)
forge test --match-path test/EdgeCasesTest.t.sol
```

#### Test Categories

**1. Ownership & Access Control**
- Initial state verification
- Ownership transfer (initiate + accept)
- Unauthorized access prevention

**2. Pausability**
- Pause role assignment
- Emergency pause functionality
- Unpause functionality
- Paused state enforcement

**3. User Management**
- Role requests
- Status changes
- User queries
- Re-application scenarios

**4. Token Management**
- Token creation (raw materials & finished products)
- Parent-child relationships
- Balance tracking
- Query functions

**5. Transfer Management**
- Transfer requests
- Transfer acceptance
- Transfer rejection
- Transfer cancellation
- Balance updates

**6. Events**
- All critical events emitted correctly
- Event parameters verified

**7. Edge Cases**
- Boundary conditions
- Branch coverage scenarios
- Error handling
- State transitions

---

## ✅ Validation Scripts

### validate-all.sh

**Location:** `validate-all.sh` (root directory)

**Purpose:** Comprehensive 20-point validation suite.

#### What It Validates

1. ✅ **Structure**: Contract file existence
2. ✅ **Compilation**: Successful build
3. ✅ **Syntax**: No compilation errors
4. ✅ **Dependencies**: All imports resolved
5. ✅ **Testing**: All tests passing
6. ✅ **Coverage**: Meets thresholds
7. ✅ **Security**: ReentrancyGuard present
8. ✅ **Access Control**: Modifiers implemented
9. ✅ **Events**: Critical events defined
10. ✅ **Documentation**: NatSpec comments
11. ✅ **Errors**: Custom errors used
12. ✅ **Gas Optimization**: Efficient patterns
13. ✅ **Code Quality**: No TODO/FIXME
14. ✅ **Best Practices**: Follow conventions
15. ✅ **Script Validation**: Deployment scripts
16. ✅ **Script Testing**: Scripts compile
17. ✅ **Script Functionality**: Scripts run
18. ✅ **File Organization**: Proper structure
19. ✅ **Git Status**: Clean working directory
20. ✅ **Final Report**: Complete assessment

#### Usage

```bash
# Run full validation
./validate-all.sh

# Generate detailed report
./validate-all.sh > validation_report.txt

# Check specific validations (edit script)
./validate-all.sh
```

#### Output

Report saved to: `docs/reports/VALIDATION_RESULTS.md`

```markdown
# ✅ SupplyChain Contract - Validation Report

**Date**: 2025-11-18 10:30:45
**Contract**: SupplyChain.sol
**Status**: ✅ **ALL VALIDATIONS PASSED**

## 📊 Validation Results (20/20 checks passed)

1. ✅ Contract file structure validated
2. ✅ Compilation successful
3. ✅ Syntax validation passed
...
20. ✅ Final validation complete

## 🎯 Summary
- Total Checks: 20
- Passed: 20
- Failed: 0
- Success Rate: 100%

✅ **CERTIFICATION**: Ready for production deployment
```

#### Automation

```bash
# Add to CI/CD pipeline
.github/workflows/validation.yml:
  - name: Validate Contract
    run: ./validate-all.sh
```

---

## 📊 Coverage Scripts

### coverage.sh (if exists)

**Purpose:** Generate detailed coverage reports.

#### Usage

```bash
# Generate coverage
forge coverage

# Specific contract
forge coverage --match-path test/SupplyChain.t.sol

# Detailed report
forge coverage --report lcov

# Generate HTML report
forge coverage --report lcov
genhtml lcov.info -o coverage/

# Open in browser
open coverage/index.html
```

#### Coverage Metrics

Current project metrics:
- **Lines**: 85.60%
- **Statements**: 82.67%
- **Branches**: 72.15%
- **Functions**: 80.95%

#### Interpreting Coverage

```bash
# View uncovered lines
forge coverage --report debug

# Generate coverage JSON
forge coverage --report json > coverage.json
```

---

## 🎓 Error Handling Philosophy

### Principle: "Fail Fast, Fail Clear"

All scripts in this project follow a critical design principle:

```
┌─────────────────────────────────────────┐
│  Better to FAIL EXPLICITLY              │
│  than show INCORRECT INFORMATION        │
└─────────────────────────────────────────┘
```

### Core Tenets

1. **No Fallback Data**: Scripts never use cached or hardcoded values
2. **Explicit Failures**: Exit code 1 on any error condition
3. **Clear Diagnostics**: Error messages explain what to check
4. **Actionable Feedback**: Commands provided for debugging

### Example: Coverage Scripts

```bash
# ✅ Correct Behavior
$ ./coverage-reporter.sh --auto
❌ ERROR: Unable to obtain coverage information

Possible causes:
  • Tests are failing
  • Compilation errors
  • Foundry not installed correctly

To diagnose: forge coverage --match-path 'test/*'

$ echo $?
1  ← Exit code indicates failure
```

### Why This Matters

- **CI/CD Integration**: Pipelines stop on actual problems
- **Developer Trust**: Metrics are always current and valid
- **Production Safety**: Never deploy based on stale data
- **Debugging Speed**: Clear errors save hours of investigation

**For complete history and design rationale, see:**
→ [SCRIPT_EVOLUTION.md](research/SCRIPT_EVOLUTION.md) - Technical history and philosophy

---

## 💡 Best Practices

### Script Development

✅ **DO:**
- Use environment variables for sensitive data
- Validate inputs before execution
- Provide clear, informative output
- Include error handling
- Document all parameters
- Test scripts thoroughly
- Use version control
- **Follow "Fail Fast, Fail Clear" principle**

❌ **DON'T:**
- Hardcode private keys
- Skip error checking
- Use unclear variable names
- Forget to clean up
- Assume execution order
- Skip documentation
- **Use fallback/cached data on errors**

### Automation Tips

**1. Makefile Integration**
```makefile
# Makefile
deploy-local:
forge script script/SupplyChainDeploy.s.sol --rpc-url http://localhost:8545 --broadcast

demo:
forge script script/SupplyChainInteractions.s.sol --rpc-url http://localhost:8545 --broadcast

test:
forge test

validate:
./validate-all.sh

coverage:
forge coverage
```

**2. CI/CD Integration**
```yaml
# .github/workflows/test.yml
name: Test & Validate
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Foundry
        uses: foundry-rs/foundry-toolchain@v1
      - name: Run tests
        run: forge test
      - name: Validate
        run: ./validate-all.sh
```

**3. Environment Management**
```bash
# .env.example
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://...
MAINNET_RPC_URL=https://...
ETHERSCAN_API_KEY=...

# .gitignore
.env
broadcast/
```

---

## 🔧 Custom Script Examples

### Quick Test Script

```bash
#!/bin/bash
# quick-test.sh
echo "Running quick validation..."
forge build && forge test --match-contract SupplyChain
```

### Deploy & Demo Script

```bash
#!/bin/bash
# deploy-and-demo.sh
echo "Starting Anvil..."
anvil &
ANVIL_PID=$!
sleep 2

echo "Deploying contract..."
forge script script/SupplyChainDeploy.s.sol --rpc-url http://localhost:8545 --broadcast

echo "Running demo..."
forge script script/SupplyChainInteractions.s.sol --rpc-url http://localhost:8545 --broadcast

echo "Stopping Anvil..."
kill $ANVIL_PID
```

### Coverage Check Script

```bash
#!/bin/bash
# check-coverage.sh
MIN_COVERAGE=70

COVERAGE=$(forge coverage | grep "Total" | awk '{print $2}' | sed 's/%//')

if (( $(echo "$COVERAGE >= $MIN_COVERAGE" | bc -l) )); then
    echo "✅ Coverage: $COVERAGE% (meets $MIN_COVERAGE% threshold)"
    exit 0
else
    echo "❌ Coverage: $COVERAGE% (below $MIN_COVERAGE% threshold)"
    exit 1
fi
```

---

## 📚 Additional Resources

- [Deployment Guide](DEPLOYMENT.md)
- [Testing Guide](TESTING.md)
- [Getting Started](GETTING_STARTED.md)
- [API Reference](API_REFERENCE.md)

---

**Last Updated:** November 18, 2025  
**Project Version:** 1.1.0  
**Script Count:** 5+ automation scripts
