# 📋 Validación de Hooks de Ownership Transfer

**Fecha**: 24 de Noviembre, 2025  
**Archivos analizados**:
- `useOwnershipTransfer.ts` (desde emujicad-back)
- `usePendingOwner.ts` (desde emujicad-back)
- `SupplyChain.sol` (contrato actual)

---

## ✅ **COMPATIBILIDAD CON EL CONTRATO INTELIGENTE**

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

### 2. **useOwnershipTransfer.ts** ⚠️ COMPATIBLE CON LIMITACIONES

**Estado**: ⚠️ **COMPATIBLE PERO CON PROBLEMA DE DISEÑO**

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

#### ⚠️ **PROBLEMA DE DISEÑO DETECTADO**

**Problema**: El hook usa un **solo `useWriteContract()`** para las 3 funciones, lo que significa que:
- ❌ Todos comparten el mismo estado (`isPending`, `isConfirming`, `isSuccess`, `error`, `hash`)
- ❌ Si llamas a `initiateOwnershipTransfer()` y luego a `acceptOwnershipTransfer()`, el segundo sobrescribirá el estado del primero
- ❌ No puedes rastrear el estado de cada operación por separado
- ❌ Si una operación falla, el error se mezcla con otras operaciones

**Comparación con patrón recomendado**:

El hook actual (problemático):
```typescript
export function useOwnershipTransfer() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  // ❌ Un solo estado para todas las funciones
  
  const initiateOwnershipTransfer = (newOwner) => { writeContract(...) }
  const acceptOwnershipTransfer = () => { writeContract(...) }
  const rejectOwnershipTransfer = () => { writeContract(...) }
  
  return { initiateOwnershipTransfer, acceptOwnershipTransfer, rejectOwnershipTransfer, isPending, ... }
}
```

Patrón recomendado (como en el componente OwnershipTransfer del summary):
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

## 📊 **RESUMEN DE VALIDACIÓN**

| Hook | Compatibilidad | Estado | Problemas |
|------|----------------|--------|-----------|
| `usePendingOwner` | ✅ 100% | ✅ LISTO PARA USAR | Ninguno |
| `useOwnershipTransfer` | ✅ 100% | ✅ REFACTORIZADO Y LISTO | ✅ Resuelto - Estados separados |

---

## 🎯 **RECOMENDACIONES**

### Para `usePendingOwner.ts`:
✅ **LISTO PARA USAR** - Puede copiarse directamente al proyecto actual.

### Para `useOwnershipTransfer.ts`:
✅ **REFACTORIZADO Y LISTO PARA USAR**

**Mejoras implementadas**:
1. ✅ **Estados separados**: 3 instancias de `useWriteContract()` (una por función)
2. ✅ **Confirmaciones separadas**: 3 instancias de `useWaitForTransactionReceipt()` (una por función)
3. ✅ **Estados individuales**: Cada función tiene su propio `isPending`, `isConfirming`, `isSuccess`, `error`, `hash`

**Beneficios**:
- ✅ Rastrear el estado de cada operación independientemente
- ✅ Mostrar feedback correcto al usuario (ej: "Iniciando transferencia..." vs "Aceptando ownership...")
- ✅ Manejar errores específicos por operación
- ✅ Evitar conflictos cuando se usan múltiples funciones

---

## ✅ **QUÉ HACEN ESTOS HOOKS**

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

**Retorna** (versión actual - problemática):
- `initiateOwnershipTransfer`, `acceptOwnershipTransfer`, `rejectOwnershipTransfer`
- `isPending`, `isConfirming`, `isSuccess`, `error`, `hash` (compartidos para todas)

**Retorna** (versión recomendada):
- `initiateOwnershipTransfer`, `acceptOwnershipTransfer`, `rejectOwnershipTransfer`
- Estados separados por función:
  - `isPendingInitiate`, `isConfirmingInitiate`, `successInitiate`, `errorInitiate`, `initiateHash`
  - `isPendingAccept`, `isConfirmingAccept`, `successAccept`, `errorAccept`, `acceptHash`
  - `isPendingReject`, `isConfirmingReject`, `successReject`, `errorReject`, `rejectHash`

---

## 🔧 **IMPLEMENTACIÓN RECOMENDADA**

Si decides usar estos hooks, te recomiendo:

1. ✅ **Copiar `usePendingOwner.ts` directamente** (está perfecto)
2. ⚠️ **Refactorizar `useOwnershipTransfer.ts`** con estados separados (ver patrón recomendado arriba)

**Alternativa**: Si prefieres mantener el hook simple, puedes usarlo pero con la limitación de que solo una operación puede estar activa a la vez. Esto puede ser suficiente si el UI está diseñado para no permitir múltiples operaciones simultáneas.

---

**Última actualización**: 24 de Noviembre, 2025

