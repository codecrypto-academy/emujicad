# 🧪 Testing Guide

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para estado del contrato inteligente, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**

Comprehensive testing documentation for SupplyChain smart contract.

---

## 📊 Test Suite Overview

### Test Statistics
- **Total Tests**: 108 (100% passing)
  - Core Tests: 64 (SupplyChain.t.sol)
  - Edge Cases: 44 (EdgeCasesTest.t.sol)
- **Test Methodology**: Scientific 3-phase analysis ([see details](research/COVERAGE_ANALYSIS.md))
- **Coverage**: Enterprise-grade (80%+ on critical metrics)
- **Validation**: Automated with "Fail Fast, Fail Clear" principle ([see philosophy](research/SCRIPT_EVOLUTION.md))

### Test Files
```
test/
├── SupplyChain.t.sol        # Core functionality tests (64 tests)
└── EdgeCasesTest.t.sol      # Edge cases and boundary conditions (44 tests)
```

> **📚 Para métricas actualizadas de cobertura, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**

---

## 🚀 Running Tests

### Basic Execution
```bash
# Run all tests
forge test

# Run with verbosity
forge test -vv          # Show test names
forge test -vvv         # Show execution traces
forge test -vvvv        # Show setup traces
forge test -vvvvv       # Show internal calls
```

### Selective Testing
```bash
# Run specific test file
forge test --match-path test/SupplyChain.t.sol

# Run specific test function
forge test --match-test testCreateToken

# Run tests matching pattern
forge test --match-test "test.*Transfer"

# Run specific contract tests
forge test --match-contract SupplyChainTest
```

### Advanced Options
```bash
# Run tests on fork (requires RPC)
forge test --fork-url $MAINNET_RPC_URL

# Run with gas reporting
forge test --gas-report

# Run tests in parallel
forge test --threads 4
```

---

## 📈 Coverage Analysis

### Generate Coverage Report
```bash
# Basic coverage
forge coverage

# With specific output format
forge coverage --report summary
forge coverage --report lcov

# Coverage for specific files
forge coverage --match-path "test/SupplyChain.t.sol"
```

### Current Coverage Metrics

> **📚 Para métricas actualizadas y detalladas, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**

| Metric | Coverage | Status | Standard |
|--------|----------|--------|----------|
| **Lines** | 85.60% | ✅ Excellent | >70% Good, >80% Excellent |
| **Statements** | 82.67% | ✅ Excellent | >70% Good, >80% Excellent |
| **Branches** | 72.15% | 🟡 Good | >60% Good, >75% Excellent |
| **Functions** | 80.95% | ✅ Excellent | >75% Good, >85% Excellent |

### Coverage Standards
- **Lines**: 70% good, 80% excellent ✅
- **Statements**: 70% good, 80% excellent ✅
- **Branches**: 60% good, 75% excellent 🟡
- **Functions**: 75% good, 85% excellent ✅

---

## 🔬 Test Categories

### 1. User Management Tests (8 tests)
- ✅ User registration with role request
- ✅ Admin approval/rejection workflow
- ✅ User status transitions
- ✅ Role-based permissions

### 2. Token Management Tests (8 tests)
- ✅ Token creation by approved users
- ✅ Token types (RawMaterial, WIP, FinishedProduct)
- ✅ Token supply management
- ✅ Parent-child token relationships

### 3. Transfer Tests (8 tests)
- ✅ Transfer initiation
- ✅ Transfer acceptance
- ✅ Transfer rejection
- ✅ Transfer cancellation
- ✅ Balance updates
- ✅ Escrow mechanics

### 4. Security Tests (9 tests)
- ✅ Access control validation
- ✅ ReentrancyGuard protection
- ✅ Pausable functionality
- ✅ Owner controls
- ✅ Invalid state transitions

### 5. Edge Cases (44 tests)
- ✅ Boundary conditions
- ✅ Zero values
- ✅ Invalid inputs
- ✅ State conflicts
- ✅ Race conditions
- ✅ Scientific 3-phase analysis approach

### 6. Events Tests (6 tests)
- ✅ UserRoleRequested emission
- ✅ UserStatusChanged emission
- ✅ TokenCreated emission
- ✅ TransferInitiated emission
- ✅ TransferStatusChanged emission

---

## 🎯 Validation System

### Automated Validation Script

The project includes `validate-all.sh` for comprehensive validation:

```bash
# Run complete validation
bash validate-all.sh

# Auto-generates report in docs/reports/VALIDATION_RESULTS.md
```

### Validation Phases (20 checks)

**FASE 1: Dependencies** (3/3)
- ✅ Foundry (forge) installed
- ✅ Foundry (cast) installed
- ✅ bc (calculator) installed

**FASE 2: Compilation** (1/1)
- ✅ forge build successful

**FASE 3: Tests** (3/3)
- ✅ Core tests (64) passing
- ✅ Edge case tests (44) passing
- ✅ Total tests (108) passing

**FASE 4: Scripts** (2/2)
- ✅ SupplyChainDeploy.s.sol functional
- ✅ SupplyChainInteractions.s.sol functional

**FASE 5: Coverage** (4/4)
- ✅ Lines coverage > 80%
- ✅ Statements coverage > 75%
- ✅ Branches coverage > 50%
- ✅ Functions coverage > 75%

**FASE 6: Scripts de Reporte** (2/2)
- ✅ coverage-reporter-simple.sh functional
- ✅ coverage-reporter.sh functional

**FASE 7: File Structure** (5/5)
- ✅ All critical files present

### Validation Report

Auto-generated report includes:
- Timestamp of validation
- All 20 validation results
- Coverage metrics
- Certification status
- Reproduction commands

---

## 🔧 Coverage Scripts

### Quick Coverage Check
```bash
bash coverage-reporter-simple.sh
```

**Output**:
- Coverage metrics table
- Evaluation against standards
- Overall quality score
- Deployment recommendation

### Detailed Coverage Report
```bash
bash coverage-reporter.sh
```

**Features**:
- Colored terminal output
- Detailed metric breakdown
- Optional markdown export
- Industry standards comparison

---

## 🧬 Scientific Testing Methodology

### 3-Phase Analysis Approach

**FASE 1: Speculative Edge Cases**
- 12 unique edge cases implemented
- Coverage of unexpected scenarios
- Boundary condition testing

**FASE 2: Duplicate Analysis**
- Identification of redundant tests
- Elimination of 6 duplicate tests
- Test suite optimization

**FASE 3: Directed Edge Cases**
- 11 scientifically targeted tests
- Based on coverage gap analysis
- Systematic branch coverage improvement

### Key Findings
- ✅ Branch coverage 72.15% is acceptable for smart contracts
- ✅ Compound conditions generate multiple branches per line
- ✅ ROI diminishes for additional branch-specific tests
- ✅ Test quality more important than coverage percentage

---

## 📊 Test Execution Best Practices

### Before Committing
```bash
# Full test suite
forge test

# Coverage check
forge coverage

# Validation suite
bash validate-all.sh
```

### During Development
```bash
# Watch mode (re-run on file changes)
forge test --watch

# Focus on specific feature
forge test --match-contract MyFeature -vvv
```

### For CI/CD
```bash
# Non-interactive with detailed output
forge test --no-match-path "test/Fork.t.sol" -vv

# Generate coverage for reporting
forge coverage --report lcov
```

---

## 🐛 Debugging Tests

### Verbose Output Levels
- `-v`: Show test names
- `-vv`: Show setup traces
- `-vvv`: Show execution traces
- `-vvvv`: Show setup traces and internal calls
- `-vvvvv`: Maximum verbosity

### Common Debugging Commands
```bash
# Debug specific test with traces
forge test --match-test testFailingTest -vvvv

# Show gas usage
forge test --gas-report --match-test testGasIntensive

# Run with debugger
forge test --debug testMyFunction
```

### Troubleshooting

**Tests failing unexpectedly**:
```bash
# Clean build cache
forge clean
forge build
forge test
```

**Coverage not updating**:
```bash
# Clear coverage cache
rm -rf coverage/
forge coverage
```

**Gas estimation errors**:
```bash
# Increase gas limit in foundry.toml
[profile.default]
gas_limit = 30000000
```

---

## 📋 Test Checklist

Before considering testing complete:

- [ ] All functions have at least one test
- [ ] Edge cases identified and tested
- [ ] Error cases tested (reverts)
- [ ] Events tested for emission
- [ ] Access control tested
- [ ] State transitions validated
- [ ] Coverage meets standards (>80% lines/statements)
- [ ] All tests passing
- [ ] Validation suite passes (20/20)

---

## 🔗 Related Documentation

**Smart Contract Documentation**:
- [Getting Started](GETTING_STARTED.md) - Setup and installation
- [Architecture](ARCHITECTURE.md) - System design
- [API Reference](API_REFERENCE.md) - Contract interface
- [Coverage Analysis](research/COVERAGE_ANALYSIS.md) - Scientific methodology
- [Security](SECURITY.md) - Security considerations
- [Deployment](DEPLOYMENT.md) - Deployment guide

**Project Documentation**:
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Current project status
- [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md) - Contract status and metrics
- [INDEX.md](../../INDEX.md) - Complete documentation index
- [QUICKSTART.md](../../QUICKSTART.md) - Quick start guide

---

**Última actualización**: 26 de Noviembre, 2025  
**Test Suite Version**: 1.2.0  
**Status**: ✅ 108/108 tests passing (64 core + 44 edge cases)  
**Coverage**: ✅ Enterprise-grade (85.60% lines, 82.67% statements, 72.15% branches, 80.95% functions)
