# 🤝 Contributing to SupplyChain

Thank you for your interest in contributing to the SupplyChain smart contract project!

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
# Run all tests
forge test

# Check coverage
forge coverage

# Run validation
bash validate-all.sh
```

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

### Test Coverage
All contributions must maintain or improve test coverage:
- Lines: >80%
- Statements: >80%
- Functions: >80%
- Branches: >60%

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
- [ ] Edge cases
- [ ] Event emissions
- [ ] Gas optimization
- [ ] Access control

---

## 📚 Documentation

### Documentation Requirements
- Update README.md if adding new features
- Add NatSpec comments to all public functions
- Update ARCHITECTURE.md if changing design
- Add examples to relevant docs

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
- [ ] All tests passing
- [ ] New tests added
- [ ] Coverage maintained/improved

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

## 🎨 Visual Style Guide

### Documentation Badges

Use badges to provide quick visual information about the project. Follow these guidelines:

#### Badge Style by Context

**1. README Files (Main Landing Pages)**
Use `for-the-badge` style for prominent, eye-catching badges:

```markdown
![Solidity](https://img.shields.io/badge/Solidity-v0.8.30-blue?style=for-the-badge&logo=solidity)
![Foundry](https://img.shields.io/badge/Foundry-Tested-green?style=for-the-badge&logo=ethereum)
![Tests](https://img.shields.io/badge/Tests-73%20Passing-brightgreen?style=for-the-badge&logo=checkmarx)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)
```

**2. Technical Documentation**
Use `flat-square` style for compact, professional look:

```markdown
[![Solidity](https://img.shields.io/badge/Solidity-v0.8.30-blue?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Coverage](https://img.shields.io/badge/Lines-78.22%25-yellow?style=flat-square&logo=codecov)](/)
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
![Total Tests](https://img.shields.io/badge/Total%20Tests-73-brightgreen?style=for-the-badge&logo=checkmarx)
![Core Tests](https://img.shields.io/badge/Core%20Tests-55-success?style=for-the-badge)
![Edge Cases](https://img.shields.io/badge/Edge%20Cases-18-orange?style=for-the-badge)
```

**Coverage Metrics:**
```markdown
![Lines](https://img.shields.io/badge/Coverage%20Lines-78.22%25-yellow?style=for-the-badge&logo=codecov)
![Functions](https://img.shields.io/badge/Coverage%20Functions-77.14%25-orange?style=for-the-badge&logo=codecov)
```

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

**Thank you for contributing!** 🎉
