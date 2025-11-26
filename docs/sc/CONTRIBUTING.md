# 🤝 Contributing to SupplyChain

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para estado del contrato inteligente, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**  
> **📚 Para guía rápida de inicio, consulta [QUICKSTART.md](../../QUICKSTART.md)**

Thank you for your interest in contributing to the SupplyChain smart contract project!

**Última actualización**: 26 de Noviembre, 2025

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to:
- Be respectful and inclusive
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🛠️ Development Setup

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version
cast --version
anvil --version
```

### Clone and Setup
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/smart-contracts.git
cd sc
forge install
forge build
forge test
```

---

## 🔄 Contribution Workflow

### 1. Create a Branch
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Or bugfix branch
git checkout -b fix/your-bug-fix
```

### 2. Make Changes
- Write clean, well-documented code
- Follow Solidity style guide
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run all tests (should pass 108/108)
forge test

# Run with verbosity for debugging
forge test -vvv

# Check coverage
forge coverage

# Run validation (26+ checks in 8 phases)
bash validate-all.sh

# Generate detailed coverage report
bash coverage-reporter.sh --auto
```

> **📚 Para detalles de validación, consulta [SCRIPTS.md](SCRIPTS.md) y [SCRIPTS_ARCHITECTURE.md](SCRIPTS_ARCHITECTURE.md)**

### 4. Commit
```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve bug description"
```

### 5. Push and Create PR
```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

---

## 💎 Coding Standards

### Solidity Style Guide
- Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- Use `pragma solidity 0.8.30;` (fixed version)
- Use NatSpec comments for all public functions
- Custom errors instead of `require` with strings

### Example
```solidity
/// @notice Creates a new token in the supply chain
/// @param name Token name
/// @param tokenType Type of token (RawMaterial, WIP, FinishedProduct)
/// @param totalSupply Initial supply
/// @param features Product features/description
/// @param parentId Parent token ID (0 for raw materials)
/// @return tokenId The newly created token ID
function createToken(
    string memory name,
    TokenType tokenType,
    uint256 totalSupply,
    string memory features,
    uint256 parentId
) external onlyApprovedUser returns (uint256) {
    // Implementation
}
```

### Naming Conventions
- **Contracts**: PascalCase (`SupplyChain`)
- **Functions**: camelCase (`createToken`)
- **Variables**: camelCase (`tokenId`, `userRole`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SUPPLY`)
- **Private/Internal**: Prefix with underscore (`_internalFunction`)

---

## 🧪 Testing Requirements

> **📚 Para documentación completa de tests, consulta [TESTING.md](TESTING.md)**

### Test Coverage
All contributions must maintain or improve test coverage:
- Lines: >80% (Current: 85.60%)
- Statements: >80% (Current: 82.67%)
- Functions: >80% (Current: 80.95%)
- Branches: >60% (Current: 72.15%)

> **📚 Para detalles de coverage actual, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md) y [TESTING.md](TESTING.md)**

### Writing Tests
```solidity
// test/YourFeature.t.sol
pragma solidity 0.8.30;

import {Test} from "forge-std/Test.sol";
import {SupplyChain} from "../src/SupplyChain.sol";

contract YourFeatureTest is Test {
    SupplyChain public supplyChain;
    
    function setUp() public {
        supplyChain = new SupplyChain();
    }
    
    function testYourFeature() public {
        // Arrange
        // Act
        // Assert
    }
}
```

### Test Checklist
- [ ] Positive test cases
- [ ] Negative test cases (reverts)
- [ ] Edge cases (see [TESTING.md](TESTING.md) for methodology)
- [ ] Event emissions
- [ ] Gas optimization
- [ ] Access control

**Current Test Suite**: 108 tests (64 core + 44 edge cases) - 100% passing

> **📚 Para metodología de testing y ejemplos, consulta [TESTING.md](TESTING.md)**

---

## 📚 Documentation

### Documentation Requirements
- Update README.md if adding new features
- Add NatSpec comments to all public functions
- Update [ARCHITECTURE.md](ARCHITECTURE.md) if changing design
- Update [API_REFERENCE.md](API_REFERENCE.md) if adding/changing functions
- Update [TESTING.md](TESTING.md) if adding new tests
- Update [PROJECT_STATUS.md](../../PROJECT_STATUS.md) if changing project metrics
- Add examples to relevant docs

> **📚 Para estructura completa de documentación, consulta [INDEX.md](../../INDEX.md)**

### Documentation Style
- Clear and concise
- Use code examples
- Include diagrams when helpful
- Keep formatting consistent

---

## 🔍 Pull Request Guidelines

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests passing (108/108: 64 core + 44 edge cases)
- [ ] New tests added for new functionality
- [ ] Coverage maintained/improved (Lines: 85.60%, Statements: 82.67%, Branches: 72.15%, Functions: 80.95%)
- [ ] Edge cases considered
- [ ] Validation script (`validate-all.sh`) passes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process
1. Automated checks (CI/CD) must pass
2. Code review by maintainer
3. Address feedback
4. Final approval and merge

---

## 🐛 Reporting Issues

### Bug Reports
Include:
- Clear title and description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment details (Foundry version, OS)
- Code snippets if relevant

### Feature Requests
Include:
- Clear description of feature
- Use case and benefits
- Proposed implementation (optional)
- Alternatives considered

---

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/owner/repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/owner/repo/discussions)

---

## 📚 Additional Resources

**Smart Contract Documentation**:
- [Getting Started Guide](GETTING_STARTED.md) - Setup and installation
- [Architecture Documentation](ARCHITECTURE.md) - System design
- [API Reference](API_REFERENCE.md) - Contract interface and functions
- [Testing Guide](TESTING.md) - Test coverage and validation (108 tests)
- [Security Guide](SECURITY.md) - Security features and best practices
- [Deployment Guide](DEPLOYMENT.md) - Deployment procedures
- [Scripts Documentation](SCRIPTS.md) - Automation scripts

**Project Documentation**:
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Current project status
- [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md) - Contract status and metrics
- [INDEX.md](../../INDEX.md) - Complete documentation index
- [QUICKSTART.md](../../QUICKSTART.md) - Quick start guide

---

## 🎨 Visual Style Guide

### Documentation Badges

Use badges to provide quick visual information about the project. Follow these guidelines:

#### Badge Style by Context

**1. README Files (Main Landing Pages)**
Use `for-the-badge` style for prominent, eye-catching badges:

```markdown
![Solidity](https://img.shields.io/badge/Solidity-v0.8.30-blue?style=for-the-badge&logo=solidity)
![Foundry](https://img.shields.io/badge/Foundry-Tested-green?style=for-the-badge&logo=ethereum)
![Tests](https://img.shields.io/badge/Tests-108%20Passing-brightgreen?style=for-the-badge&logo=checkmarx)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
```

**2. Technical Documentation**
Use `flat-square` style for compact, professional look:

```markdown
[![Solidity](https://img.shields.io/badge/Solidity-v0.8.30-blue?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Coverage](https://img.shields.io/badge/Lines-85.60%25-brightgreen?style=flat-square&logo=codecov)](/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square&logo=github)](LICENSE)
```

**3. Research Documentation**
Include scientific/academic badges:

```markdown
![Academic](https://img.shields.io/badge/Academic-PFM%20Project-purple?style=flat-square&logo=academic)
![Methodology](https://img.shields.io/badge/Testing-Scientific%20Analysis-red?style=flat-square&logo=research)
```

#### Standard Badge Categories

**Technology Stack:**
```markdown
![Solidity](https://img.shields.io/badge/Solidity-v0.8.30-blue?style=for-the-badge&logo=solidity)
![Foundry](https://img.shields.io/badge/Foundry-Framework-green?style=for-the-badge&logo=ethereum)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-Security-red?style=for-the-badge&logo=openzeppelin)
```

**Testing Metrics:**
```markdown
![Total Tests](https://img.shields.io/badge/Total%20Tests-108-brightgreen?style=for-the-badge&logo=checkmarx)
![Core Tests](https://img.shields.io/badge/Core%20Tests-64-success?style=for-the-badge)
![Edge Cases](https://img.shields.io/badge/Edge%20Cases-44-orange?style=for-the-badge)
```

**Coverage Metrics:**
```markdown
![Lines](https://img.shields.io/badge/Coverage%20Lines-85.60%25-brightgreen?style=for-the-badge&logo=codecov)
![Statements](https://img.shields.io/badge/Coverage%20Statements-82.67%25-brightgreen?style=for-the-badge&logo=codecov)
![Branches](https://img.shields.io/badge/Coverage%20Branches-72.15%25-yellow?style=for-the-badge&logo=codecov)
![Functions](https://img.shields.io/badge/Coverage%20Functions-80.95%25-brightgreen?style=for-the-badge&logo=codecov)
```

> **📚 Para métricas actualizadas, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**

**Project Status:**
```markdown
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
![Quality](https://img.shields.io/badge/Quality-Enterprise%20Grade-gold?style=for-the-badge&logo=star)
```

#### Color Guidelines

| Metric | Color | When to Use |
|--------|-------|-------------|
| **Green** (`brightgreen`, `success`) | >80% metrics, passing tests | Excellent status |
| **Yellow** (`yellow`) | 70-80% metrics | Good, room for improvement |
| **Orange** (`orange`) | 60-70% metrics | Acceptable, needs attention |
| **Red** (`red`) | <60% metrics | Critical, requires work |
| **Blue** (`blue`) | Technology/framework | Informational |
| **Purple** (`purple`) | Academic/research | Educational context |

#### ASCII Art Banners

For documentation headers, use consistent banner style:

```
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║     ⛓️   🔧   SupplyChain Smart Contract   🚀   ⚡       ║
  ║                                                           ║
  ║           🏆 Enterprise-Grade Blockchain Solution         ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
```

### Visual Consistency Rules

1. **Badge Placement**: Always at top of README files, after title
2. **Badge Grouping**: Group by category (technology, metrics, status)
3. **Color Harmony**: Use consistent colors for same metrics across docs
4. **Update Frequency**: Update coverage badges when metrics change
5. **Link Targets**: Link badges to relevant documentation sections

### Examples in This Project

- **Main README**: `for-the-badge` style with full metrics
- **API Reference**: `flat-square` style, compact
- **Research Docs**: Include academic badges
- **Contributing Guide**: Minimal badges, focus on content

### Tools

- **Badge Generator**: [Shields.io](https://shields.io/)
- **Logo Icons**: Available at [Simple Icons](https://simpleicons.org/)
- **Color Reference**: [Shields.io Color List](https://shields.io/#colors)

---

**Última actualización**: 26 de Noviembre, 2025  
**Test Suite**: 108 tests (64 core + 44 edge cases) - 100% passing  
**Coverage**: 85.60% lines, 82.67% statements, 72.15% branches, 80.95% functions

**Thank you for contributing!** 🎉
