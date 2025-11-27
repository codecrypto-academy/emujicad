# 🤝 Contributing to Supply Chain Tracker

> **📋 Para el estado más actualizado del proyecto, consulta [STATUS.md](./STATUS.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](./INDEX.md)**  
> **📚 Para guía rápida de inicio, consulta [QUICKSTART.md](./QUICKSTART.md)**

Thank you for your interest in contributing to the Supply Chain Tracker project!

**Última actualización**: 27 de Noviembre, 2025

---

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
git clone https://github.com/YOUR_USERNAME/supply-chain-tracker.git
cd supply-chain-tracker
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
- Follow Solidity style guide (for smart contracts)
- Follow TypeScript/React best practices (for frontend)
- Add tests for new functionality
- Update documentation as needed

### 3. Test Your Changes

**Smart Contract:**
```bash
# Run all tests (should pass 108/108)
cd sc
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

**Frontend:**
```bash
# Run development server
cd web
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Build for production
npm run build
```

> **📚 Para detalles de validación, consulta [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)**

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

### TypeScript/React Style Guide
- Follow [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- Use functional components with hooks
- Follow React best practices
- Use TypeScript strict mode

### Naming Conventions

**Solidity:**
- **Contracts**: PascalCase (`SupplyChain`)
- **Functions**: camelCase (`createToken`)
- **Variables**: camelCase (`tokenId`, `userRole`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_SUPPLY`)
- **Private/Internal**: Prefix with underscore (`_internalFunction`)

**TypeScript/React:**
- **Components**: PascalCase (`TokenCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useGetUserTokens`)
- **Functions**: camelCase (`handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`)

---

## 🧪 Testing Requirements

> **📚 Para documentación completa de tests, consulta [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)**

### Smart Contract Test Coverage
All contributions must maintain or improve test coverage:
- Lines: >80% (Current: 85.60%)
- Statements: >80% (Current: 82.67%)
- Functions: >80% (Current: 80.95%)
- Branches: >60% (Current: 72.15%)

**Current Test Suite**: 108 tests (64 core + 44 edge cases) - 100% passing

### Writing Tests

**Solidity:**
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

**TypeScript/React:**
```typescript
// test/YourFeature.test.tsx
import { render, screen } from '@testing-library/react'
import { YourComponent } from '@/components/YourComponent'

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Test Checklist
- [ ] Positive test cases
- [ ] Negative test cases (reverts/errors)
- [ ] Edge cases
- [ ] Event emissions (for smart contracts)
- [ ] Gas optimization (for smart contracts)
- [ ] Access control

---

## 📚 Documentation

### Documentation Requirements
- Update README.md if adding new features
- Add NatSpec comments to all public functions (Solidity)
- Add JSDoc comments to complex functions (TypeScript)
- Update [STATUS.md](./STATUS.md) if changing project metrics
- Update [CHANGELOG.md](./CHANGELOG.md) for significant changes
- Add examples to relevant docs

> **📚 Para estructura completa de documentación, consulta [INDEX.md](./INDEX.md)**

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
- [ ] All tests passing (108/108: 64 core + 44 edge cases for SC)
- [ ] New tests added for new functionality
- [ ] Coverage maintained/improved
- [ ] Edge cases considered
- [ ] Validation script passes (for SC changes)

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
- Environment details (Foundry version, Node version, OS)
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
- [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md) - Complete smart contract documentation

**Frontend Documentation**:
- [docs/FRONTEND.md](./docs/FRONTEND.md) - Complete frontend documentation

**Project Documentation**:
- [STATUS.md](./STATUS.md) - Current project status
- [INDEX.md](./INDEX.md) - Complete documentation index
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide
- [CHANGELOG.md](./CHANGELOG.md) - Project changelog

---

**Última actualización**: 27 de Noviembre, 2025  
**Test Suite**: 108 tests (64 core + 44 edge cases) - 100% passing  
**Coverage**: 85.60% lines, 82.67% statements, 72.15% branches, 80.95% functions

**Thank you for contributing!** 🎉

