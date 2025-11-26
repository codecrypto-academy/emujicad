# 🔍 Validaciones Técnicas - Supply Chain Tracker

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](./PROJECT_STATUS.md)**  
> **📚 Para documentación completa de funciones del contrato, consulta [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md)**  
> **📚 Para documentación completa de hooks del frontend, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)**

**Fecha:** Noviembre 2025  
**Estado:** ✅ VALIDACIÓN COMPLETA  
**Última actualización:** 26 de Noviembre, 2025

---

## 📋 Contenido

Este documento consolida todas las validaciones técnicas del proyecto:
1. **Validación Contrato vs Frontend** - Compatibilidad entre contrato inteligente y hooks del frontend
2. **Validación Hooks de Ownership** - Análisis específico de hooks de ownership transfer

---

# 1️⃣ VALIDACIÓN: CONTRATO INTELIGENTE VS FRONTEND

## 📋 RESUMEN EJECUTIVO

Se ha realizado una validación exhaustiva comparando las firmas de funciones del contrato inteligente (`SupplyChain.sol`) con las llamadas del frontend.

**Resultado:** ✅ **TODAS LAS FUNCIONES ESTÁN COMPATIBLES Y IMPLEMENTADAS**

> **Nota**: Este documento proporciona una validación de compatibilidad. Para detalles completos de cada función, consulta la documentación técnica en los archivos referenciados arriba.

---

## ✅ FUNCIONES DE ESCRITURA (Write Functions)

### 1. `createToken`
**Contrato:**
```solidity
function createToken(string memory name, TokenType tokenType, uint totalSupply, string memory features, uint parentId, uint parentAmount)
```

**Frontend (`useCreateToken.ts`):**
```typescript
args: [name, tokenTypeValue, totalSupply, features, parentId, parentAmount]
```
✅ **COMPATIBLE** - Todos los parámetros coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - createToken](./docs/sc/API_REFERENCE.md#createtoken) | [docs/fe/HOOKS.md - useCreateToken](./docs/fe/HOOKS.md#8-usecreatetoken)

---

### 2. `transfer`
**Contrato:**
```solidity
function transfer(address to, uint tokenId, uint amount)
```

**Frontend (`useTransfer.ts`):**
```typescript
args: [to, tokenId, amount]
```
✅ **COMPATIBLE** - Todos los parámetros coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - transfer](./docs/sc/API_REFERENCE.md#transferaddressto-uint-tokenid-uint-amount) | [docs/fe/HOOKS.md - useTransfer](./docs/fe/HOOKS.md#9-usetransfer)

---

### 3. `acceptTransfer`
**Contrato:**
```solidity
function acceptTransfer(uint transferId)
```

**Frontend (`useTransfer.ts`):**
```typescript
args: [transferId]
```
✅ **COMPATIBLE** - Parámetros coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - acceptTransfer](./docs/sc/API_REFERENCE.md#accepttransferuint-transferid) | [docs/fe/HOOKS.md - useAcceptTransfer](./docs/fe/HOOKS.md#10-useaccepttransfer)

---

### 4. `rejectTransfer`
**Contrato:**
```solidity
function rejectTransfer(uint transferId)
```

**Frontend (`useTransfer.ts`):**
```typescript
args: [transferId]
```
✅ **COMPATIBLE** - Parámetros coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - rejectTransfer](./docs/sc/API_REFERENCE.md#rejecttransferuint-transferid) | [docs/fe/HOOKS.md - useRejectTransfer](./docs/fe/HOOKS.md#11-userejecttransfer)

---

### 5. `cancelTransfer`
**Contrato:**
```solidity
function cancelTransfer(uint transferId)
```

**Frontend (`useTransfer.ts`):**
```typescript
args: [transferId]
```
✅ **COMPATIBLE** - Parámetros coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - cancelTransfer](./docs/sc/API_REFERENCE.md#canceltransferuint-transferid) | [docs/fe/HOOKS.md - useCancelTransfer](./docs/fe/HOOKS.md#12-usecanceltransfer)

---

### 6. `requestUserRole`
**Contrato:**
```solidity
function requestUserRole(UserRole role)
```

**Frontend (`useRequestRole.ts`):**
```typescript
args: [roleValue]  // roleValue es 0-3
```
✅ **COMPATIBLE** - Parámetros coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - requestUserRole](./docs/sc/API_REFERENCE.md#requestuserroleuserrole-role) | [docs/fe/HOOKS.md - useRequestRole](./docs/fe/HOOKS.md#7-userequestrole)

---

### 7. `changeStatusUser`
**Contrato:**
```solidity
function changeStatusUser(address userAddress, UserStatus newStatus)
```

**Frontend (`useAdminUsers.ts`):**
```typescript
args: [userAddress, statusValue]  // statusValue es 0-3
```
✅ **COMPATIBLE** - Parámetros coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - changeStatusUser](./docs/sc/API_REFERENCE.md#changestatususeraddress-useraddress-userstatus-newstatus) | [docs/fe/HOOKS.md - useChangeUserStatus](./docs/fe/HOOKS.md#22-usechangeuserstatus)

---

### 8. `pause` / `unpause`
**Contrato:**
```solidity
function pause() external onlyPauser whenNotPaused
function unpause() external onlyPauser whenPaused
```

**Frontend (`usePause.ts`):**
```typescript
// pause: sin argumentos
// unpause: sin argumentos
```
✅ **COMPATIBLE** - Sin parámetros, correcto

> **📚 Ver**: [docs/sc/API_REFERENCE.md - Pause Management](./docs/sc/API_REFERENCE.md#pause-management) | [docs/fe/HOOKS.md - usePause](./docs/fe/HOOKS.md#archivo-usepause-3-hooks)

---

## ✅ FUNCIONES DE LECTURA (Read Functions)

### 9. `getUserInfo`
**Contrato:**
```solidity
function getUserInfo(address userAddress) public view returns (User memory)
```

**Frontend (`useContractReads.ts`):**
```typescript
functionName: 'getUserInfo',
args: [userAddress]
```
✅ **COMPATIBLE** - Parámetros y retorno coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - getUserInfo](./docs/sc/API_REFERENCE.md#getuserinfoaddress-useraddress) | [docs/fe/HOOKS.md - useUserInfo](./docs/fe/HOOKS.md#1-useuserinfoaddress)

---

### 10. `getUserInfoById`
**Contrato:**
```solidity
function getUserInfoById(uint userId) public view returns (User memory)
```

**Frontend (`useContractReads.ts`):**
```typescript
functionName: 'getUserInfoById',
args: [userId]
```
✅ **COMPATIBLE** - Parámetros y retorno coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - getUserInfoById](./docs/sc/API_REFERENCE.md#getuserinfobyiduint-userid) | [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)

---

### 11. `getToken`
**Contrato:**
```solidity
function getToken(uint tokenId) public view returns (Token memory)
```

**Frontend (múltiples hooks):**
```typescript
functionName: 'getToken',
args: [tokenId]
```
✅ **COMPATIBLE** - Parámetros y retorno coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - getToken](./docs/sc/API_REFERENCE.md#gettokenuint-tokenid) | [docs/fe/HOOKS.md - useGetToken](./docs/fe/HOOKS.md#14-usegettokentokenid)

---

### 12. `getTokenBalance`
**Contrato:**
```solidity
function getTokenBalance(uint tokenId, address userAddress) public view returns (uint)
```

**Frontend (`useGetUserTokens.ts`):**
```typescript
functionName: 'getTokenBalance',
args: [tokenId, userAddress]
```
✅ **COMPATIBLE** - Parámetros y retorno coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - getTokenBalance](./docs/sc/API_REFERENCE.md#gettokenbalanceuint-tokenid-address-useraddress) | [docs/fe/HOOKS.md - useGetTokenBalance](./docs/fe/HOOKS.md#15-usegettokenbalancetokenid-address)

---

### 13. `getTransfer`
**Contrato:**
```solidity
function getTransfer(uint transferId) public view returns (Transfer memory)
```

**Frontend (`useGetAllTransfers.ts`, `useGetUserTransfers.ts`):**
```typescript
functionName: 'getTransfer',
args: [transferId]
```
✅ **COMPATIBLE** - Parámetros y retorno coinciden

> **📚 Ver**: [docs/sc/API_REFERENCE.md - getTransfer](./docs/sc/API_REFERENCE.md#gettransferuint-transferid) | [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)

---

### 14. `getUserTokens`
**Contrato:**
```solidity
function getUserTokens(address userAddress) public view returns (Token[] memory)
```

**Frontend (`useGetUserTokens.ts`):**
```typescript
functionName: 'getUserTokens',
args: [userAddress]
```
✅ **COMPATIBLE** - Parámetros y retorno coinciden

> **⚠️ GAS WARNING**: Esta función tiene alto coste de gas. Ver [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md#getusertokensaddress-useraddress) para detalles.  
> **📚 Ver**: [docs/fe/HOOKS.md - useGetUserTokens](./docs/fe/HOOKS.md#13-usegetusertokensaddress)

---

### 15. `getUserTransfers`
**Contrato:**
```solidity
function getUserTransfers(address userAddress) public view returns (Transfer[] memory)
```

**Frontend (`useGetUserTransfers.ts`):**
```typescript
functionName: 'getUserTransfers',
args: [userAddress]
```
✅ **COMPATIBLE** - Parámetros y retorno coinciden

> **⚠️ GAS WARNING**: Esta función tiene alto coste de gas. Ver [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md#getusertransfersaddress-useraddress) para detalles.  
> **📚 Ver**: [docs/fe/HOOKS.md - useGetUserTransfers](./docs/fe/HOOKS.md#usegetusertransfersaddress-implementado)

---

### 16. `getTotalTokens` / `getTotalUsers` / `getTotalTransfers`
**Contrato:**
```solidity
function getTotalTokens() public view returns (uint)
function getTotalUsers() public view returns (uint)
function getTotalTransfers() public view returns (uint)
```

**Frontend (`useContractReads.ts`):**
```typescript
functionName: 'getTotalTokens' | 'getTotalUsers' | 'getTotalTransfers'
// Sin argumentos
```
✅ **COMPATIBLE** - Sin parámetros, retorno correcto

> **📚 Ver**: [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md) | [docs/fe/HOOKS.md - useTotalTokens, useTotalUsers, useTotalTransfers](./docs/fe/HOOKS.md#3-usetotaltokens)

---

### 17. `isPaused`
**Contrato:**
```solidity
function isPaused() public view returns (bool)
```

**Frontend (`usePause.ts`):**
```typescript
functionName: 'isPaused'
// Sin argumentos
```
✅ **COMPATIBLE** - Sin parámetros, retorno correcto

> **📚 Ver**: [docs/sc/API_REFERENCE.md - isPaused](./docs/sc/API_REFERENCE.md#ispaused) | [docs/fe/HOOKS.md - useIsPaused](./docs/fe/HOOKS.md#archivo-usepause-3-hooks)

---

### 18. `owner`
**Contrato:**
```solidity
address public owner;
```

**Frontend (`useContractOwner.ts`):**
```typescript
functionName: 'owner'
// Sin argumentos
```
✅ **COMPATIBLE** - Variable pública, lectura correcta

> **📚 Ver**: [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md) | [docs/fe/HOOKS.md - useContractOwner](./docs/fe/HOOKS.md#20-usecontractowner)

---

## ✅ FUNCIONES DE OWNERSHIP TRANSFER - IMPLEMENTADAS

> **Nota**: Actualizado - Los hooks fueron implementados después de la creación inicial de este documento.  
> **📚 Para análisis detallado, consulta la sección 2 de este documento**

Las siguientes funciones de ownership transfer **SÍ** tienen hooks correspondientes en el frontend:

### 1. `initiateOwnershipTransfer` ✅ IMPLEMENTADO
**Contrato:**
```solidity
function initiateOwnershipTransfer(address newOwner) external onlyOwner whenNotPaused
```
✅ **IMPLEMENTADO** - Hook: `useOwnershipTransfer().initiateOwnershipTransfer()`
- Ubicación: `web/src/hooks/useOwnershipTransfer.ts`
- Componente: `web/src/components/admin/OwnershipTransfer.tsx`

> **📚 Ver**: [docs/sc/API_REFERENCE.md - initiateOwnershipTransfer](./docs/sc/API_REFERENCE.md#initiateownershiptransferaddress-newowner) | [docs/fe/HOOKS.md - useOwnershipTransfer](./docs/fe/HOOKS.md#22-useownershiptransfer)

---

### 2. `acceptOwnershipTransfer` ✅ IMPLEMENTADO
**Contrato:**
```solidity
function acceptOwnershipTransfer() external whenNotPaused
```
✅ **IMPLEMENTADO** - Hook: `useOwnershipTransfer().acceptOwnershipTransfer()`
- Ubicación: `web/src/hooks/useOwnershipTransfer.ts`
- Componente: `web/src/components/admin/OwnershipTransfer.tsx`

> **📚 Ver**: [docs/sc/API_REFERENCE.md - acceptOwnership](./docs/sc/API_REFERENCE.md#acceptownership) | [docs/fe/HOOKS.md - useOwnershipTransfer](./docs/fe/HOOKS.md#22-useownershiptransfer)

---

### 3. `rejectOwnershipTransfer` ✅ IMPLEMENTADO
**Contrato:**
```solidity
function rejectOwnershipTransfer() external whenNotPaused
```
✅ **IMPLEMENTADO** - Hook: `useOwnershipTransfer().rejectOwnershipTransfer()`
- Ubicación: `web/src/hooks/useOwnershipTransfer.ts`
- Componente: `web/src/components/admin/OwnershipTransfer.tsx`

> **📚 Ver**: [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md) | [docs/fe/HOOKS.md - useOwnershipTransfer](./docs/fe/HOOKS.md#22-useownershiptransfer)

---

### 4. `getPendingOwner` ✅ IMPLEMENTADO
**Contrato:**
```solidity
function getPendingOwner() public view returns (address)
```
✅ **IMPLEMENTADO** - Hook: `usePendingOwner()`
- Ubicación: `web/src/hooks/usePendingOwner.ts`
- Componente: `web/src/components/admin/OwnershipTransfer.tsx`

> **📚 Ver**: [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md) | [docs/fe/HOOKS.md - usePendingOwner](./docs/fe/HOOKS.md#21-usependingownerenabled-boolean)

---

## 📊 CONCLUSIÓN - VALIDACIÓN CONTRATO VS FRONTEND

### ✅ Funciones del Contrato Compatibles: 22/22
Todas las funciones del contrato inteligente tienen hooks correspondientes en el frontend y están correctamente alineadas.

**Desglose**:
- **Funciones de escritura**: 8/8 ✅
- **Funciones de lectura**: 10/10 ✅
- **Funciones de ownership transfer**: 4/4 ✅

### ✅ Hooks del Frontend: 24 hooks personalizados
El frontend implementa 24 hooks personalizados que cubren todas las funciones del contrato.

> **📚 Para lista completa de hooks, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)**  
> **📚 Para documentación completa de funciones del contrato, consulta [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md)**

### 🎯 ESTADO ACTUAL

**✅ IMPLEMENTACIÓN COMPLETA** - El frontend está completamente compatible con el contrato actual, incluyendo todas las funciones de ownership transfer.

---

## 🔍 DETALLES TÉCNICOS

> **📚 Para detalles técnicos completos sobre tipos y conversiones, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md) y el código fuente de los hooks.**

### Tipos de Datos
- ✅ Todos los `uint` del contrato se mapean correctamente a `bigint` en TypeScript
- ✅ Todos los `address` se mapean correctamente a `0x${string}`
- ✅ Todos los enums (`UserRole`, `UserStatus`, `TokenType`, `TransferStatus`) coinciden
- ✅ Los strings se manejan correctamente

### Conversiones
- ✅ `TokenType` se convierte a número (0 o 1) antes de enviar al contrato
- ✅ `UserStatus` se convierte a número (0-3) antes de enviar al contrato
- ✅ `UserRole` se convierte a número (0-3) antes de enviar al contrato

> **Nota**: Las conversiones están implementadas en los hooks. Ver código fuente para detalles específicos.

---

# 2️⃣ VALIDACIÓN: HOOKS DE OWNERSHIP TRANSFER

> **⚠️ HISTORICAL DOCUMENT - Nov 24, 2025** - Los hooks ya están implementados y funcionando en el proyecto actual.

**Fecha**: 24 de Noviembre, 2025  
**Última actualización**: 26 de Noviembre, 2025  
**Estado actual**: ✅ **IMPLEMENTADO Y FUNCIONANDO** - Los hooks fueron implementados y están en producción.

**Archivos analizados**:
- `useOwnershipTransfer.ts` (implementado en `web/src/hooks/useOwnershipTransfer.ts`)
- `usePendingOwner.ts` (implementado en `web/src/hooks/usePendingOwner.ts`)
- `SupplyChain.sol` (contrato actual)

---

## ✅ COMPATIBILIDAD CON EL CONTRATO INTELIGENTE

### 1. **usePendingOwner.ts** ✅ COMPATIBLE

**Estado**: ✅ **COMPLETAMENTE COMPATIBLE**

#### Análisis:
- ✅ **Función del contrato**: `getPendingOwner() public view returns (address)`
- ✅ **Hook llama a**: `getPendingOwner` ✅
- ✅ **Parámetros**: Ninguno (coincide) ✅
- ✅ **Retorno**: `address` → `string | undefined` ✅
- ✅ **Estructura**: Similar a `useContractOwner.ts` (patrón consistente) ✅
- ✅ **Habilitación condicional**: Soporta `enabled: boolean` ✅

#### Comparación con contrato:
```solidity
// Contrato (SupplyChain.sol:567-569)
function getPendingOwner() public view returns (address) {
    return pendingOwner;
}
```

```typescript
// Hook (usePendingOwner.ts:14-21)
const { data: pendingOwner, isLoading, error } = useReadContract({
  address: SUPPLY_CHAIN_ADDRESS,
  abi: SUPPLY_CHAIN_ABI,
  functionName: 'getPendingOwner',  // ✅ Coincide
  query: { enabled },
})
```

**Conclusión**: El hook `usePendingOwner` es **100% compatible** con el contrato inteligente.

---

### 2. **useOwnershipTransfer.ts** ✅ COMPATIBLE Y RESUELTO

**Estado**: ✅ **COMPATIBLE Y PROBLEMA DE DISEÑO RESUELTO**

#### Análisis de compatibilidad con el contrato:

##### ✅ **initiateOwnershipTransfer** - COMPATIBLE
- ✅ **Función del contrato**: `initiateOwnershipTransfer(address newOwner) external onlyOwner whenNotPaused`
- ✅ **Hook llama a**: `initiateOwnershipTransfer` ✅
- ✅ **Parámetros**: `[newOwner]` donde `newOwner: 0x${string}` ✅
- ✅ **Tipo de parámetro**: `address` → `0x${string}` ✅

##### ✅ **acceptOwnershipTransfer** - COMPATIBLE
- ✅ **Función del contrato**: `acceptOwnershipTransfer() external whenNotPaused`
- ✅ **Hook llama a**: `acceptOwnershipTransfer` ✅
- ✅ **Parámetros**: `[]` (ninguno) ✅

##### ✅ **rejectOwnershipTransfer** - COMPATIBLE
- ✅ **Función del contrato**: `rejectOwnershipTransfer() external whenNotPaused`
- ✅ **Hook llama a**: `rejectOwnershipTransfer` ✅
- ✅ **Parámetros**: `[]` (ninguno) ✅

#### ✅ **PROBLEMA DE DISEÑO RESUELTO**

> **Nota**: El problema original fue detectado y **YA FUE RESUELTO** en la implementación actual.

**Problema original detectado**: El hook usaba un **solo `useWriteContract()`** para las 3 funciones, lo que significaba que:
- ❌ Todos compartían el mismo estado (`isPending`, `isConfirming`, `isSuccess`, `error`, `hash`)
- ❌ Si llamabas a `initiateOwnershipTransfer()` y luego a `acceptOwnershipTransfer()`, el segundo sobrescribía el estado del primero
- ❌ No se podía rastrear el estado de cada operación por separado
- ❌ Si una operación fallaba, el error se mezclaba con otras operaciones

**✅ SOLUCIÓN IMPLEMENTADA**: El hook actual (`web/src/hooks/useOwnershipTransfer.ts`) ya tiene estados separados para cada función.

**Patrón implementado**:
```typescript
export function useOwnershipTransfer() {
  // ✅ Estados separados para cada función
  const { data: initiateHash, writeContract: writeInitiate, isPending: isPendingInitiate, error: errorInitiate } = useWriteContract()
  const { data: acceptHash, writeContract: writeAccept, isPending: isPendingAccept, error: errorAccept } = useWriteContract()
  const { data: rejectHash, writeContract: writeReject, isPending: isPendingReject, error: errorReject } = useWriteContract()
  
  // ✅ useWaitForTransactionReceipt separado para cada función
  const { isLoading: isConfirmingInitiate, isSuccess: successInitiate } = useWaitForTransactionReceipt({ hash: initiateHash })
  const { isLoading: isConfirmingAccept, isSuccess: successAccept } = useWaitForTransactionReceipt({ hash: acceptHash })
  const { isLoading: isConfirmingReject, isSuccess: successReject } = useWaitForTransactionReceipt({ hash: rejectHash })
  
  return {
    initiateOwnershipTransfer,
    acceptOwnershipTransfer,
    rejectOwnershipTransfer,
    isPendingInitiate, isConfirmingInitiate, successInitiate, errorInitiate, initiateHash,
    isPendingAccept, isConfirmingAccept, successAccept, errorAccept, acceptHash,
    isPendingReject, isConfirmingReject, successReject, errorReject, rejectHash,
  }
}
```

---

## 📊 RESUMEN DE VALIDACIÓN

| Hook | Compatibilidad | Estado | Problemas |
|------|----------------|--------|-----------|
| `usePendingOwner` | ✅ 100% | ✅ IMPLEMENTADO Y FUNCIONANDO | Ninguno |
| `useOwnershipTransfer` | ✅ 100% | ✅ IMPLEMENTADO Y FUNCIONANDO | ✅ Resuelto - Estados separados |

---

## 🎯 RECOMENDACIONES

### Para `usePendingOwner.ts`:
✅ **IMPLEMENTADO Y FUNCIONANDO** - Hook implementado en `web/src/hooks/usePendingOwner.ts` y en uso en producción.

### Para `useOwnershipTransfer.ts`:
✅ **IMPLEMENTADO Y FUNCIONANDO** - Hook implementado en `web/src/hooks/useOwnershipTransfer.ts` con estados separados.

**Mejoras implementadas** (ya aplicadas):
1. ✅ **Estados separados**: 3 instancias de `useWriteContract()` (una por función)
2. ✅ **Confirmaciones separadas**: 3 instancias de `useWaitForTransactionReceipt()` (una por función)
3. ✅ **Estados individuales**: Cada función tiene su propio `isPending`, `isConfirming`, `isSuccess`, `error`, `hash`

**Beneficios**:
- ✅ Rastrear el estado de cada operación independientemente
- ✅ Mostrar feedback correcto al usuario (ej: "Iniciando transferencia..." vs "Aceptando ownership...")
- ✅ Manejar errores específicos por operación
- ✅ Evitar conflictos cuando se usan múltiples funciones

**Componente relacionado**: `web/src/components/admin/OwnershipTransfer.tsx` - UI completa para gestionar ownership transfer.

**Documentación completa**: Ver `docs/fe/HOOKS.md` para documentación detallada de estos hooks.

---

## ✅ QUÉ HACEN ESTOS HOOKS

### `usePendingOwner(enabled?: boolean)`
**Propósito**: Obtener la dirección del `pendingOwner` del contrato.

**Retorna**:
- `pendingOwner: string | undefined` - Dirección del pendingOwner (o `address(0)` si no hay)
- `isLoading: boolean` - Estado de carga
- `error: Error | null` - Error si falla

**Uso típico**:
```typescript
const { pendingOwner, isLoading } = usePendingOwner(isConnected)
const hasPendingOwner = pendingOwner && pendingOwner !== '0x0000000000000000000000000000000000000000'
```

---

### `useOwnershipTransfer()`
**Propósito**: Gestionar las 3 operaciones de transferencia de ownership.

**Funciones expuestas**:
1. **`initiateOwnershipTransfer(newOwner: 0x${string})`**
   - Solo el owner actual puede llamarla
   - Inicia la transferencia de ownership a `newOwner`
   - Establece `pendingOwner = newOwner`

2. **`acceptOwnershipTransfer()`**
   - Solo el `pendingOwner` puede llamarla
   - Completa la transferencia de ownership
   - Valida que el nuevo owner nunca haya solicitado un rol
   - Si el usuario existe en el sistema → `revert UserExists()`

3. **`rejectOwnershipTransfer()`**
   - Puede ser llamada por el owner actual o el `pendingOwner`
   - Cancela/rechaza la transferencia pendiente
   - Emite eventos diferentes según quién la llama:
     - `OwnershipTransferCancelledByOwner` (si owner cancela)
     - `OwnershipTransferRejectedByPendingOwner` (si pendingOwner rechaza)

**Retorna** (versión actual - ✅ IMPLEMENTADA):
- `initiateOwnershipTransfer`, `acceptOwnershipTransfer`, `rejectOwnershipTransfer`
- Estados separados por función:
  - `isPendingInitiate`, `isConfirmingInitiate`, `successInitiate`, `errorInitiate`, `initiateHash`
  - `isPendingAccept`, `isConfirmingAccept`, `successAccept`, `errorAccept`, `acceptHash`
  - `isPendingReject`, `isConfirmingReject`, `successReject`, `errorReject`, `rejectHash`

---

## ✅ ESTADO DE IMPLEMENTACIÓN

**✅ IMPLEMENTACIÓN COMPLETA** - Los hooks ya están implementados y funcionando en el proyecto.

**Ubicación de los hooks**:
1. ✅ `web/src/hooks/usePendingOwner.ts` - Implementado
2. ✅ `web/src/hooks/useOwnershipTransfer.ts` - Implementado con estados separados

**Componente UI**:
- ✅ `web/src/components/admin/OwnershipTransfer.tsx` - Componente completo para gestionar ownership transfer

**Documentación**:
- ✅ `docs/fe/HOOKS.md` - Documentación completa de los hooks (hooks #21 y #22)
- ✅ `docs/sc/API_REFERENCE.md` - Documentación de funciones del contrato y eventos

**Estado**: ✅ **LISTO PARA USO EN PRODUCCIÓN**

---

**Validación completada:** ✅  
**Estado del proyecto:** 🟢 LISTO PARA USO

---

**Última actualización**: 26 de Noviembre, 2025

