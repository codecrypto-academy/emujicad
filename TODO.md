# 📋 TODO - Supply Chain Tracker

> **📋 For the most up-to-date project status, see [STATUS.md](./STATUS.md)**  
> **📚 For complete documentation index, see [INDEX.md](./INDEX.md)**

**Last Updated**: November 27, 2025  
**Purpose**: Consolidated list of pending tasks, errors and validations

---

## ⚠️ PENDING ERRORS

### Frontend

#### TypeScript Error in Dashboard
**File**: `web/src/app/dashboard/page.tsx`  
**Location**: Lines ~812-815 and ~819-822 (may have changed)

**Error**:
```
Type error: 'userInfo' is possibly 'null'.
```

**Cause**:
TypeScript cannot infer that `userInfo` is not `null` after the `userInfo &&` check when used in complex expressions with multiple `&&` operators.

**Proposed Solution**:
1. **Option 1**: Use optional chaining in all references:
   ```typescript
   {userInfo && 
    userInfo.status !== undefined &&
    (Number(userInfo?.role) === UserRole.Producer || Number(userInfo?.role) === UserRole.Factory) &&
    Number(userInfo?.status) === UserStatus.Approved
     ? 'Create your first token to start tracking products'
     : 'No tokens available yet'}
   ```

2. **Option 2**: Extract check to a variable:
   ```typescript
   const canCreateToken = userInfo && 
     userInfo.status !== undefined &&
     (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
     Number(userInfo.status) === UserStatus.Approved
   
   {canCreateToken
     ? 'Create your first token to start tracking products'
     : 'No tokens available yet'}
   ```

3. **Option 3**: Use a helper function:
   ```typescript
   const canCreateToken = (userInfo: UserInfo | null): boolean => {
     if (!userInfo || userInfo.status === undefined) return false
     const role = Number(userInfo.role)
     return (role === UserRole.Producer || role === UserRole.Factory) &&
            Number(userInfo.status) === UserStatus.Approved
   }
   ```

**Status**: 
- ❌ **PENDING** - Doesn't block functionality but prevents production build
- ⚠️ **PRIORITY**: Medium (code works in development, but build fails)

**Notes**:
- This error **WAS NOT** caused by `usePendingOwner.ts` or `useOwnershipTransfer.ts`
- The error existed before, only became visible when running build
- Ownership transfer hooks are completely functional and cause no problems
- To verify if error still exists, run: `cd web && npm run build`

---

## ✅ COMPLETED VALIDATIONS

### Smart Contract

All critical and recommended validations are implemented in the contract:

#### ✅ High Priority Validations - COMPLETED
1. **Canceled user validation in `requestRole()`** ✅ **COMPLETED**
   - **Impact**: Security and business logic
   - **Status**: ✅ **IMPLEMENTED** (Nov 24, 2025)
   - **Test**: ✅ `testCanceledUserCannotRequestRole()` added

2. **Role restriction validation by token type in transfers** ✅ **IMPLEMENTED**
   - **Impact**: Critical security and business logic
   - **Status**: ✅ **IMPLEMENTED** (verified Nov 26, 2025)
   - **Implementation**:
     - ✅ Helper function `_validateRoleForTokenType()` created
     - ✅ Validation in `transfer()` - Validates sender role
     - ✅ Validation in `acceptTransfer()` - Validates receiver role
     - ✅ Validation in `rejectTransfer()` - Validates receiver role

#### ✅ Medium Priority Validations - COMPLETED
1. **Minimum name length in `createToken()`** ✅ **COMPLETED**
   - **Impact**: UX and data consistency
   - **Status**: ✅ **IMPLEMENTED** (Nov 24, 2025)
   - **Test**: ✅ `testCreateTokenSingleCharacterName()` added

#### ✅ Verified and Implemented Validations
1. **Address format validation in `transfer()`** ✅ **IMPLEMENTED**
   - **Status**: ✅ Validates `to != address(0)` in `transfer()`

2. **tokenId > 0 validation in `transfer()` and `getToken()`** ✅ **IMPLEMENTED**
   - **Status**: ✅ Validates `tokenId == 0 || tokenId >= nextTokenId` in `getToken()`

3. **Parent token balance validation before creating FinishedProduct** ✅ **IMPLEMENTED**
   - **Status**: ✅ Validates sufficient balance in `_validateAndConsumeParentToken()`

---

## 🚨 PENDING TASKS

### High Priority

#### Video Demo (Missing +1.5 points)
**Estimated time**: 3-4 hours  
**Impact**: +1.5 academic points

**Tasks**:
- [ ] Video script (5 minutes)
- [ ] Recording with OBS/screen recorder
- [ ] Basic editing
- [ ] Upload to YouTube/Vimeo
- [ ] Add link to README.md

**Video script (5 minutes)**:
1. [ ] Introduction (30s) - Project, technologies
2. [ ] Smart Contract (1m) - Code, tests, coverage
3. [ ] Frontend Demo (2.5m):
   - Connect MetaMask
   - Request role
   - Dashboard and profile
   - Create token
   - Make transfer
   - Approve as admin
   - Pausability system
4. [ ] Architecture (1m) - Documentation, diagrams
5. [ ] Closing (30s) - GitHub, conclusions

---

### Medium Priority

#### Optional Frontend Improvements
- [ ] Frontend tests (Vitest + Playwright) - Partially implemented
- [ ] Testnet deployment (optional)
- [ ] Mobile responsive design (partially implemented)
- [ ] Improved loading states and error handling (partially implemented)

#### Optional Smart Contract Improvements
- [ ] Increase branch coverage (currently 72.15%)
- [ ] Additional gas optimization (if needed)
- [ ] Expanded NatSpec documentation

---

### Low Priority

#### Future Features
- 🔮 **Batch Transfers**: `transferBatch` for optimization
- 🔮 **`burn` Function**: Token burn with special permissions
- 🔮 **Advanced Modularization**: Division into specialized contracts
- 🔮 **Web3 Integration**: IPFS for metadata, Oracle connectivity

---

## ✅ RECENTLY COMPLETED

### Frontend
- ✅ Hook `usePendingOwner.ts` - COMPLETED
- ✅ Hook `useOwnershipTransfer.ts` - COMPLETED
- ✅ Component `OwnershipTransfer.tsx` - COMPLETED
- ✅ All 9 essential pages (100%)
- ✅ 24 custom hooks (14 files)
- ✅ 26 components (11 Shadcn + 15 custom)

### Smart Contract
- ✅ 108 tests (64 core + 44 edge cases) - 100% passing
- ✅ Coverage: 85.60% lines, 72.15% branches, 82.67% statements, 80.95% functions
- ✅ 5 critical validations implemented (100%)
- ✅ Complete pausability system
- ✅ Ownership transfer implemented

---

## 📊 Status Summary

| Category | Pending | Completed | Status |
|----------|---------|-----------|--------|
| **Frontend Errors** | 1 | 0 | ⚠️ Medium priority |
| **SC Validations** | 0 | 5 | ✅ 100% |
| **Critical Tasks** | 1 (Video) | 0 | 🚨 High priority |
| **Optional Improvements** | 4 | 0 | 🟡 Medium priority |

---

**Last Updated**: November 27, 2025  
**Next step**: Video Demo (Day 9) - +1.5 points

> **📚 For complete details, see [STATUS.md](./STATUS.md) and [CHANGELOG.md](./CHANGELOG.md)**
