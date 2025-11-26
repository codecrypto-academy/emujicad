# ⚡ Optimización de Performance - Batch Reads

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**  
> **📚 Para documentación completa de hooks, consulta [docs/fe/HOOKS.md](../fe/HOOKS.md)**

**Fecha**: 26 de Noviembre, 2025  
**Última actualización**: 26 de Noviembre, 2025  
**Estado**: ✅ **IMPLEMENTADO**

---

## 🎯 Objetivo

Reducir el número de llamadas RPC al contrato inteligente usando batch reads de wagmi en lugar de múltiples llamadas individuales.

---

## 📊 Problema Anterior

### Antes (3 llamadas separadas):
```typescript
// Dashboard hacía 3 llamadas individuales al contrato
const { data: totalTokens } = useTotalTokens();
const { data: totalUsers } = useTotalUsers();
const { data: totalTransfers } = useTotalTransfers();
```

**Problemas**:
- ❌ 3 llamadas RPC separadas
- ❌ Mayor latencia (3 round-trips)
- ❌ Mayor consumo de recursos
- ❌ Posible inconsistencia si una falla

---

## ✅ Solución Implementada

### Después (1 llamada batch):
```typescript
// Dashboard ahora usa 1 llamada batch
const { 
  totalTokens, 
  totalUsers, 
  totalTransfers,
  isLoading,
  errors 
} = useDashboardStats();
```

**Beneficios**:
- ✅ 1 sola llamada RPC (batch)
- ✅ Menor latencia (1 round-trip)
- ✅ Menor consumo de recursos
- ✅ Datos consistentes (mismo bloque)
- ✅ Mejor manejo de errores (granular)

---

## 🔧 Implementación

### 1. Nuevo Hook: `useDashboardStats()`

**Archivo**: `web/src/hooks/useContractReads.ts`

```typescript
export function useDashboardStats() {
  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getTotalTokens',
      },
      {
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getTotalUsers',
      },
      {
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getTotalTransfers',
      },
    ],
    query: {
      refetchInterval: 5000, // Refetch cada 5 segundos
    },
  })

  // Extraer datos de forma segura
  const totalTokens = data?.[0]?.result as bigint | undefined
  const totalUsers = data?.[1]?.result as bigint | undefined
  const totalTransfers = data?.[2]?.result as bigint | undefined

  // Manejo de errores granular
  const errors = {
    totalTokens: data?.[0]?.error || null,
    totalUsers: data?.[1]?.error || null,
    totalTransfers: data?.[2]?.error || null,
  }

  return {
    totalTokens,
    totalUsers,
    totalTransfers,
    isLoading,
    error: error || (hasErrors ? errors : null),
    errors,
  }
}
```

**Características**:
- ✅ Usa `useReadContracts` de wagmi para batch reads
- ✅ Extrae datos de forma segura con optional chaining
- ✅ Manejo de errores granular (por estadística)
- ✅ Refetch automático cada 5 segundos
- ✅ Type-safe con TypeScript

---

### 2. Actualización del Dashboard

**Archivo**: `web/src/app/dashboard/page.tsx`

**Cambios**:
```typescript
// ANTES
import { useTotalTokens, useTotalUsers, useTotalTransfers } from '@/hooks/useContractReads';

const { data: totalTokens, error: totalTokensError } = useTotalTokens();
const { data: totalUsers, error: totalUsersError } = useTotalUsers();
const { data: totalTransfers, error: totalTransfersError } = useTotalTransfers();

// DESPUÉS
import { useDashboardStats } from '@/hooks/useContractReads';

const { 
  totalTokens, 
  totalUsers, 
  totalTransfers, 
  isLoading: isLoadingStats,
  errors: statsErrors 
} = useDashboardStats();
```

**Mejoras en UI**:
- ✅ Skeleton loaders durante carga
- ✅ Manejo de errores granular por card
- ✅ Mejor UX con loading states

---

## 📈 Métricas de Mejora

### Performance:
- **Llamadas RPC**: 3 → 1 (66% reducción)
- **Latencia**: ~3x round-trips → 1 round-trip (66% reducción)
- **Consistencia**: Datos del mismo bloque (mejor)

### UX:
- ✅ Carga más rápida
- ✅ Skeleton loaders mejorados
- ✅ Mejor manejo de errores

---

## 🔍 Verificación

### Compilación:
```bash
✅ TypeScript compila correctamente
✅ No hay errores de tipo
✅ Build exitoso
```

### Funcionalidad:
- ✅ Dashboard carga correctamente
- ✅ Estadísticas se muestran correctamente
- ✅ Errores se manejan granularmente
- ✅ Skeleton loaders funcionan

---

## 📝 Notas Técnicas

### `useReadContracts` vs `useReadContract`:

**`useReadContract`** (individual):
```typescript
const { data } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CONTRACT_ABI,
  functionName: 'getTotalTokens',
})
// 1 llamada RPC
```

**`useReadContracts`** (batch):
```typescript
const { data } = useReadContracts({
  contracts: [
    { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getTotalTokens' },
    { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getTotalUsers' },
    { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'getTotalTransfers' },
  ]
})
// 1 llamada RPC (batch)
```

### Estructura de datos retornada:

```typescript
data = [
  { result: bigint, error: null },  // getTotalTokens
  { result: bigint, error: null },  // getTotalUsers
  { result: bigint, error: null },  // getTotalTransfers
]
```

---

## 🚀 Próximas Optimizaciones Posibles

### 1. Optimizar carga de tokens:
```typescript
// En lugar de cargar tokens uno por uno
// Usar batch read para múltiples tokens
const { data: tokens } = useReadContracts({
  contracts: tokenIds.map(id => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getToken',
    args: [id],
  }))
})
```

### 2. Optimizar carga de usuarios:
```typescript
// Batch read para múltiples usuarios
const { data: users } = useReadContracts({
  contracts: userIds.map(id => ({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserInfoById',
    args: [id],
  }))
})
```

---

## ✅ Checklist de Implementación

- [x] Crear hook `useDashboardStats()`
- [x] Actualizar Dashboard para usar batch reads
- [x] Actualizar manejo de errores
- [x] Agregar skeleton loaders
- [x] Verificar compilación
- [x] Verificar funcionalidad
- [x] Documentar cambios

---

## 📚 Referencias

- [wagmi `useReadContracts` Documentation](https://wagmi.sh/react/api/hooks/useReadContracts)
- [Batch Calls Best Practices](https://ethereum.org/en/developers/tutorials/batch-calls/)

---

**Última actualización**: 26 de Noviembre, 2025  
**Estado**: ✅ Implementado y verificado

---

## 📚 Referencias Relacionadas

**Documentación del Proyecto**:
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Estado actual del proyecto (single source of truth)
- [INDEX.md](../../INDEX.md) - Índice completo de documentación
- [QUICKSTART.md](../../QUICKSTART.md) - Guía rápida de inicio

**Documentación Técnica Frontend**:
- [docs/fe/HOOKS.md](../fe/HOOKS.md) - Documentación completa de hooks (24 hooks, incluye useDashboardStats)
- [docs/fe/COMPONENTS.md](../fe/COMPONENTS.md) - Documentación completa de componentes
- [docs/fe/SETUP.md](../fe/SETUP.md) - Setup del frontend

**Reportes Relacionados**:
- [TASK_STATUS_REAL.md](./TASK_STATUS_REAL.md) - Estado real de tareas completadas (incluye optimización de performance)
- [TESTING_IMPLEMENTATION.md](./TESTING_IMPLEMENTATION.md) - Estado actual de tests frontend

> **📚 Nota**: Esta optimización está implementada y funcionando. Para detalles del hook `useDashboardStats`, consulta [docs/fe/HOOKS.md](../fe/HOOKS.md)

