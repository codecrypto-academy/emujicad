# 🪝 Custom Hooks del Frontend

> Documentación de todos los hooks personalizados implementados con wagmi

---

## 📦 Hooks Implementados (18 totales)

### Archivo: `useContractReads.ts` (6 hooks de lectura - incluye optimización batch)

#### 1. **useUserInfo(address)**
Obtiene información completa de un usuario.

```typescript
import { useUserInfo } from '@/hooks/useContractReads'

function Component() {
  const { data: userInfo, isLoading, error } = useUserInfo('0x...')
  
  // userInfo = { id, userAddress, role, status }
  // status: Pending, Approved, Rejected, Canceled
}
```

**Retorna**:
```typescript
{
  id: bigint
  userAddress: string
  role: string
  status: number // 0=Pending, 1=Approved, 2=Rejected, 3=Canceled
}
```

#### 2. **useIsAdmin(address)**
Verifica si una address es el admin del contrato.

```typescript
import { useIsAdmin } from '@/hooks/useContractReads'

function Component() {
  const { data: isAdmin, isLoading } = useIsAdmin('0x...')
  
  // isAdmin = true | false
}
```

#### 3. **useTotalTokens()**
Obtiene el total de tokens creados en el sistema.

```typescript
import { useTotalTokens } from '@/hooks/useContractReads'

function Component() {
  const { data: totalTokens } = useTotalTokens()
  
  // totalTokens = bigint (ej: 5n)
}
```

#### 4. **useTotalUsers()**
Obtiene el total de usuarios registrados.

```typescript
import { useTotalUsers } from '@/hooks/useContractReads'

function Component() {
  const { data: totalUsers } = useTotalUsers()
  
  // totalUsers = bigint (ej: 10n)
}
```

#### 5. **useTotalTransfers()**
Obtiene el total de transferencias en el sistema.

```typescript
import { useTotalTransfers } from '@/hooks/useContractReads'

function Component() {
  const { data: totalTransfers } = useTotalTransfers()
  
  // totalTransfers = bigint (ej: 8n)
}
```

#### 6. **useDashboardStats()** ⚡ **OPTIMIZADO - NUEVO**
Hook optimizado para obtener todas las estadísticas del dashboard en una sola llamada batch.

**Ventajas**:
- ✅ Reduce llamadas RPC de 3 a 1 (66% reducción)
- ✅ Datos del mismo bloque (consistencia)
- ✅ Mejor manejo de errores granular

```typescript
import { useDashboardStats } from '@/hooks/useContractReads'

function Dashboard() {
  const { 
    totalTokens, 
    totalUsers, 
    totalTransfers, 
    isLoading,
    errors 
  } = useDashboardStats()
  
  // Todos los datos en una sola llamada batch
  // errors = { totalTokens: Error | null, totalUsers: Error | null, ... }
}
```

**Retorna**:
```typescript
{
  totalTokens: bigint | undefined
  totalUsers: bigint | undefined
  totalTransfers: bigint | undefined
  isLoading: boolean
  error: Error | null
  errors: {
    totalTokens: Error | null
    totalUsers: Error | null
    totalTransfers: Error | null
  }
}
```

**Uso recomendado**: Usar este hook en lugar de `useTotalTokens()`, `useTotalUsers()`, `useTotalTransfers()` individuales para mejor performance.

> **Ver detalles**: [PERFORMANCE_OPTIMIZATION.md](../reports/PERFORMANCE_OPTIMIZATION.md)

---

### Archivo: `useRequestRole.ts` (1 hook de escritura)

#### 7. **useRequestRole()**
Hook para solicitar un rol de usuario.

```typescript
import { useRequestRole } from '@/hooks/useRequestRole'

function RegisterForm() {
  const { 
    requestRole, 
    isPending, 
    isConfirming, 
    isSuccess, 
    error 
  } = useRequestRole()
  
  const handleSubmit = (role: string) => {
    requestRole(role) // 'Producer', 'Factory', 'Retailer', 'Consumer'
  }
  
  return (
    <form onSubmit={() => handleSubmit('Producer')}>
      {/* form fields */}
      <button disabled={isPending || isConfirming}>
        {isPending ? 'Requesting...' : 'Request Role'}
      </button>
    </form>
  )
}
```

**Estados**:
- `isPending`: Esperando confirmación del usuario en MetaMask
- `isConfirming`: Transacción enviada, esperando confirmación blockchain
- `isSuccess`: Transacción confirmada exitosamente
- `error`: Error si algo falló

---

### Archivo: `useCreateToken.ts` (1 hook de escritura)

#### 8. **useCreateToken()**
Hook para crear un nuevo token.

```typescript
import { useCreateToken } from '@/hooks/useCreateToken'

function CreateTokenForm() {
  const { 
    createToken, 
    isPending, 
    isConfirming, 
    isSuccess,
    error 
  } = useCreateToken()
  
  const handleSubmit = () => {
    createToken({
      name: 'Wheat Batch #123',
      totalSupply: 1000n,
      features: JSON.stringify({ origin: 'Farm A', quality: 'Grade A' }),
      parentId: 0n // 0 para materia prima, >0 para producto derivado
    })
  }
}
```

**Parámetros**:
```typescript
{
  name: string          // Nombre del token
  totalSupply: bigint   // Cantidad total
  features: string      // JSON con metadatos
  parentId: bigint      // ID del token padre (0 si es materia prima)
}
```

---

### Archivo: `useTransfer.ts` (4 hooks de escritura)

#### 9. **useTransfer()**
Hook para iniciar una transferencia de tokens.

```typescript
import { useTransfer } from '@/hooks/useTransfer'

function TransferForm() {
  const { 
    transfer, 
    isPending, 
    isConfirming, 
    isSuccess 
  } = useTransfer()
  
  const handleTransfer = () => {
    transfer({
      to: '0x...', // Address del receptor
      tokenId: 1n,
      amount: 100n
    })
  }
}
```

**Validaciones automáticas**:
- El receptor debe tener el rol correcto según la cadena
- El sender debe tener balance suficiente
- Ambos usuarios deben estar aprobados

#### 10. **useAcceptTransfer()**
Hook para que el receptor acepte una transferencia.

```typescript
import { useAcceptTransfer } from '@/hooks/useTransfer'

function TransferCard({ transferId }: { transferId: bigint }) {
  const { acceptTransfer, isPending } = useAcceptTransfer()
  
  return (
    <button 
      onClick={() => acceptTransfer(transferId)}
      disabled={isPending}
    >
      Accept Transfer
    </button>
  )
}
```

#### 11. **useRejectTransfer()**
Hook para que el receptor rechace una transferencia.

```typescript
import { useRejectTransfer } from '@/hooks/useTransfer'

function TransferCard({ transferId }: { transferId: bigint }) {
  const { rejectTransfer, isPending } = useRejectTransfer()
  
  return (
    <button 
      onClick={() => rejectTransfer(transferId)}
      disabled={isPending}
    >
      Reject Transfer
    </button>
  )
}
```

#### 12. **useCancelTransfer()**
Hook para que el sender cancele una transferencia pendiente.

```typescript
import { useCancelTransfer } from '@/hooks/useTransfer'

function MyTransfers({ transferId }: { transferId: bigint }) {
  const { cancelTransfer, isPending } = useCancelTransfer()
  
  return (
    <button 
      onClick={() => cancelTransfer(transferId)}
      disabled={isPending}
    >
      Cancel Transfer
    </button>
  )
}
```

---

### Archivo: `useGetUserTokens.ts` ✨ NUEVO (Día 4 - 3 hooks)

#### 13. **useGetUserTokens(address?)**
Hook para obtener todos los token IDs que posee un usuario.

```typescript
import { useGetUserTokens } from '@/hooks/useGetUserTokens'

function MyTokens() {
  const { data: tokenIds, isLoading } = useGetUserTokens()
  
  // tokenIds = bigint[] (ej: [1n, 2n, 5n])
  // Si no se pasa address, usa la address conectada
}
```

**Retorna**:
```typescript
{
  data: bigint[] | undefined  // Array de token IDs
  isLoading: boolean
  error: Error | null
}
```

**Características**:
- Auto-refresh cada 5 segundos
- Si no se pasa `address`, usa la address conectada automáticamente
- Retorna `undefined` si no hay address

#### 14. **useGetToken(tokenId?)**
Hook para obtener información detallada de un token específico.

```typescript
import { useGetToken } from '@/hooks/useGetUserTokens'

function TokenDetails({ tokenId }: { tokenId: bigint }) {
  const { data: tokenData, isLoading } = useGetToken(tokenId)
  
  // tokenData = [id, name, tokenType, totalSupply, creator, parentToken, createdAt, features]
}
```

**Retorna**:
```typescript
{
  data: [bigint, string, bigint, bigint, string, bigint, bigint, string] | undefined
  isLoading: boolean
  error: Error | null
}
```

**Estructura de datos**:
```typescript
[
  id: bigint,              // ID del token
  name: string,            // Nombre del token
  tokenType: bigint,       // 0=RawMaterial, 1=FinishedProduct
  totalSupply: bigint,     // Supply total
  creator: string,         // Address del creador
  parentToken: bigint,     // ID del token padre (0 si es materia prima)
  createdAt: bigint,       // Timestamp Unix
  features: string         // JSON string con metadatos
]
```

#### 15. **useGetTokenBalance(tokenId?, address?)**
Hook para obtener el balance de un token específico para un usuario.

```typescript
import { useGetTokenBalance } from '@/hooks/useGetUserTokens'

function TokenBalance({ tokenId }: { tokenId: bigint }) {
  const { data: balance, isLoading } = useGetTokenBalance(tokenId)
  
  // balance = bigint (ej: 100n)
}
```

**Retorna**:
```typescript
{
  data: bigint | undefined  // Balance del usuario
  isLoading: boolean
  error: Error | null
}
```

**Características**:
- Si no se pasa `address`, usa la address conectada
- Auto-refresh cada 5 segundos
- Retorna `undefined` si no hay tokenId o address

---

### Archivo: `usePause.ts` ✨ NUEVO (Día 4 - 3 hooks)

#### 16. **useIsPaused()**
Hook para leer el estado de pausa del contrato.

```typescript
import { useIsPaused } from '@/hooks/usePause'

function Component() {
  const { data: isPaused, isLoading } = useIsPaused()
  
  // isPaused = true | false
}
```

**Retorna**:
```typescript
{
  data: boolean | undefined
  isLoading: boolean
  error: Error | null
}
```

**Características**:
- Auto-refresh cada 5 segundos
- Útil para deshabilitar UI cuando el contrato está pausado

#### 17. **usePause()**
Hook para pausar el contrato (solo admin).

```typescript
import { usePause } from '@/hooks/usePause'

function PauseButton() {
  const { pause, isPending, isConfirming, isSuccess, error } = usePause()
  
  return (
    <button 
      onClick={() => pause()}
      disabled={isPending || isConfirming}
    >
      {isPending ? 'Confirming...' : 'Pause Contract'}
    </button>
  )
}
```

**Retorna**:
```typescript
{
  pause: () => void
  isPending: boolean      // Esperando confirmación MetaMask
  isConfirming: boolean   // Transacción enviada, esperando confirmación
  isSuccess: boolean      // Transacción confirmada
  error: Error | null
  hash: string | undefined // Transaction hash
}
```

#### 18. **useUnpause()**
Hook para reanudar el contrato (solo admin).

```typescript
import { useUnpause } from '@/hooks/usePause'

function UnpauseButton() {
  const { unpause, isPending, isConfirming, isSuccess, error } = useUnpause()
  
  return (
    <button 
      onClick={() => unpause()}
      disabled={isPending || isConfirming}
    >
      {isPending ? 'Confirming...' : 'Unpause Contract'}
    </button>
  )
}
```

**Retorna**:
```typescript
{
  unpause: () => void
  isPending: boolean
  isConfirming: boolean
  isSuccess: boolean
  error: Error | null
  hash: string | undefined
}
```

---

### Archivo: `useContractReads.ts` ✨ ACTUALIZADO (Día 4)

#### 19. **useUserIdByAddress(address?)** ✨ NUEVO
Hook para obtener rápidamente el User ID de una address (optimización para AuthContext).

```typescript
import { useUserIdByAddress } from '@/hooks/useContractReads'

function Component() {
  const { data: userId, isLoading } = useUserIdByAddress('0x...')
  
  // userId = bigint (ej: 1n) o 0n si no existe
}
```

**Retorna**:
```typescript
{
  data: bigint | undefined  // User ID o 0n si no existe
  isLoading: boolean
  error: Error | null
}
```

**Características**:
- Más rápido que `useUserInfo` para solo verificar existencia
- Retorna `0n` si el usuario no está registrado
- Usado en `AuthContext` para redirección rápida

---

## 📊 Resumen de Hooks

| Hook | Tipo | Archivo | Función |
|------|------|---------|---------|
| useUserInfo | Read | useContractReads.ts | Info de usuario |
| useIsAdmin | Read | useContractReads.ts | Verificar admin |
| useTotalTokens | Read | useContractReads.ts | Total tokens |
| useTotalUsers | Read | useContractReads.ts | Total usuarios |
| useTotalTransfers | Read | useContractReads.ts | Total transfers |
| useUserIdByAddress | Read | useContractReads.ts | User ID rápido ⭐ Día 4 |
| useRequestRole | Write | useRequestRole.ts | Solicitar rol |
| useCreateToken | Write | useCreateToken.ts | Crear token |
| useTransfer | Write | useTransfer.ts | Iniciar transfer |
| useAcceptTransfer | Write | useTransfer.ts | Aceptar transfer |
| useRejectTransfer | Write | useTransfer.ts | Rechazar transfer |
| useCancelTransfer | Write | useTransfer.ts | Cancelar transfer |
| useGetUserTokens | Read | useGetUserTokens.ts | Tokens del usuario ⭐ Día 4 |
| useGetToken | Read | useGetUserTokens.ts | Info de token ⭐ Día 4 |
| useGetTokenBalance | Read | useGetUserTokens.ts | Balance de token ⭐ Día 4 |
| useIsPaused | Read | usePause.ts | Estado de pausa ⭐ Día 4 |
| usePause | Write | usePause.ts | Pausar contrato ⭐ Día 4 |
| useUnpause | Write | usePause.ts | Reanudar contrato ⭐ Día 4 |

**Total**: 18 hooks (9 lectura + 9 escritura)

---

## 🎯 Patrones de Uso

### Patrón 1: Mostrar datos del usuario conectado
```typescript
function UserProfile() {
  const { address } = useAccount()
  const { data: userInfo, isLoading } = useUserInfo(address)
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <p>Role: {userInfo.role}</p>
      <p>Status: {userInfo.status === 1 ? 'Approved' : 'Pending'}</p>
    </div>
  )
}
```

### Patrón 2: Crear token con validación
```typescript
function CreateToken() {
  const { createToken, isPending, isSuccess, error } = useCreateToken()
  const [name, setName] = useState('')
  const [supply, setSupply] = useState('')
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createToken({
      name,
      totalSupply: BigInt(supply),
      features: JSON.stringify({ createdAt: Date.now() }),
      parentId: 0n
    })
  }
  
  useEffect(() => {
    if (isSuccess) {
      toast.success('Token created!')
      // Redirect o limpiar form
    }
  }, [isSuccess])
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Patrón 3: Gestión de transferencias
```typescript
function TransferActions({ transfer }) {
  const { address } = useAccount()
  const { acceptTransfer, isPending: isAccepting } = useAcceptTransfer()
  const { rejectTransfer, isPending: isRejecting } = useRejectTransfer()
  
  // Solo mostrar acciones si soy el receptor y está pendiente
  if (transfer.to !== address || transfer.status !== 0) return null
  
  return (
    <div>
      <button 
        onClick={() => acceptTransfer(transfer.id)}
        disabled={isAccepting}
      >
        Accept
      </button>
      <button 
        onClick={() => rejectTransfer(transfer.id)}
        disabled={isRejecting}
      >
        Reject
      </button>
    </div>
  )
}
```

---

## 🔧 Configuración Base

Todos los hooks usan la configuración de `contracts/config.ts`:

```typescript
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

// wagmi hooks con esta config
const result = useReadContract({
  address: SUPPLY_CHAIN_ADDRESS,
  abi: SUPPLY_CHAIN_ABI,
  functionName: '...',
  args: [...]
})
```

---

---

### Archivo: `useAdminUsers.ts` ✨ NUEVO (2 hooks admin)

#### 13. **useGetAllUsers()**
Hook para obtener todos los usuarios registrados en el sistema (solo admin).

```typescript
import { useGetAllUsers } from '@/hooks/useAdminUsers'

function AdminPanel() {
  const { users, isLoading, error, refetch } = useGetAllUsers()
  
  // users = Array de { id, address, role, status }
  // status: 0=Pending, 1=Approved, 2=Rejected, 3=Canceled
}
```

**Retorna**:
```typescript
{
  users: Array<{
    id: bigint
    address: string
    role: string
    status: number
  }>
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```

**Características**:
- Usa RPC directo con fetch (ANVIL_RPC_URL hardcoded)
- Itera userId desde 1 hasta totalUsers
- Llama getUserInfoById con selector 0x31f01140
- Parsea respuesta (4 campos × 64 hex cada uno)
- Refetch inteligente con hash tracking

#### 22. **useChangeUserStatus()**
Hook para cambiar el estado de un usuario (aprobar, rechazar, cancelar).

```typescript
import { useChangeUserStatus } from '@/hooks/useAdminUsers'

function UserActions({ userAddress }) {
  const { changeStatus, isPending, error, hash } = useChangeUserStatus()
  
  return (
    <>
      <button 
        onClick={() => changeStatus({ address: userAddress, newStatus: 1 })}
        disabled={isPending}
      >
        Approve
      </button>
      <button 
        onClick={() => changeStatus({ address: userAddress, newStatus: 2 })}
        disabled={isPending}
      >
        Reject
      </button>
    </>
  )
}
```

**Parámetros**:
```typescript
{
  address: string    // Dirección del usuario
  newStatus: number  // 1=Approved, 2=Rejected, 3=Canceled
}
```

**Retorna**:
```typescript
{
  changeStatus: (params) => void
  isPending: boolean
  error: Error | null
  hash: string | undefined  // Transaction hash
}
```

---

### Archivo: `useContractOwner.ts` ✨ NUEVO (1 hook)

#### 20. **useContractOwner()**
Hook para verificar si el usuario conectado es el owner del contrato.

```typescript
import { useContractOwner } from '@/hooks/useContractOwner'

function AdminRoute() {
  const { isOwner, isLoading } = useContractOwner()
  
  if (!isOwner) {
    return <div>Access denied</div>
  }
  
  return <AdminPanel />
}
```

**Retorna**:
```typescript
{
  isOwner: boolean
  isLoading: boolean
}
```

**Características**:
- Compara address del usuario con owner del contrato
- Usa useAccount y useReadContract
- Útil para proteger rutas admin

---

## 📊 Resumen de Hooks por Archivo

| Archivo | Hooks | Tipo | Estado |
|---------|-------|------|--------|
| useContractReads.ts | 6 | Lectura | ✅ (Día 4: +useUserIdByAddress) |
| useRequestRole.ts | 1 | Escritura | ✅ |
| useCreateToken.ts | 1 | Escritura | ✅ |
| useTransfer.ts | 4 | Escritura | ✅ |
| useAdminUsers.ts | 2 | Lectura + Escritura | ✅ |
| useContractOwner.ts | 1 | Lectura | ✅ |
| useGetUserTokens.ts | 4 | Lectura | ✅ Día 4-5 |
| usePause.ts | 3 | Lectura + Escritura | ✅ Día 4 |
| useUserTokenStats.ts | 1 | Lectura | ✅ Día 7 |
| useGetUserTokensWithData.ts | 1 | Lectura | ✅ Día 7 |
| useGetUserTransfers.ts | 1 | Lectura | ✅ Día 7 |
| **TOTAL** | **25** | **16 lectura + 9 escritura** | **100%** |

**Nota**: 
- `useContractReads.ts` incluye 6 hooks (5 individuales + 1 optimizado batch)
- `useGetUserTokens.ts` incluye 4 hooks (getUserTokens, getToken, getTokenBalance, useGetAllTokens)
- `usePause.ts` incluye 3 hooks
- `useTransfer.ts` incluye 4 hooks
- `useAdminUsers.ts` incluye 2 hooks
- Total documentado: 25 hooks únicos (21 hooks principales + 4 hooks adicionales de admin) ⭐ Día 7

---

## ✅ Hooks Nuevos (Día 7)

### **useGetUserTransfers(address)** ✅ IMPLEMENTADO
**Ubicación**: `web/src/hooks/useGetUserTransfers.ts`

Obtiene todas las transferencias de un usuario (enviadas y recibidas).

```typescript
import { useGetUserTransfers } from '@/hooks/useGetUserTransfers'

function Component() {
  const { data: transfers, isLoading, error } = useGetUserTransfers('0x...')
  
  // transfers = TransferData[] con from, to, tokenId, amount, status, etc.
}
```

**Retorna**:
```typescript
{
  transfers: TransferData[] | undefined
  isLoading: boolean
  error: Error | null
}
```

**Características**:
- Parsea correctamente la tupla de datos del contrato
- Incluye información completa de cada transferencia
- Usado en TransferList para mostrar transferencias

---

### **useUserTokenStats()** ✅ IMPLEMENTADO
**Ubicación**: `web/src/hooks/useUserTokenStats.ts`

Obtiene estadísticas de tokens por tipo (Raw Material / Finished Product).

```typescript
import { useUserTokenStats } from '@/hooks/useUserTokenStats'

function Component() {
  const { rowMaterial, finishedProduct, isLoading, error } = useUserTokenStats()
}
```

**Retorna**:
```typescript
{
  rowMaterial: { tokenTypeName, totalBalance, tokenCount } | undefined
  finishedProduct: { tokenTypeName, totalBalance, tokenCount } | undefined
  isLoading: boolean
  error: Error | null
}
```

---

### **useGetUserTokensWithData()** ✅ IMPLEMENTADO
**Ubicación**: `web/src/hooks/useGetUserTokensWithData.ts`

Obtiene tokens del usuario con todos sus datos completos (no solo IDs).

```typescript
import { useGetUserTokensWithData } from '@/hooks/useGetUserTokensWithData'

function Component() {
  const { tokens, isLoading, error } = useGetUserTokensWithData('0x...')
}
```

**Retorna**:
```typescript
{
  tokens: TokenWithData[] | undefined
  isLoading: boolean
  error: Error | null
}
```

---

## ❌ Hooks Pendientes (opcionales)

Según el smart contract, estos hooks podrían mejorar la funcionalidad:
- `useGetTransfer(transferId)` - Info completa de una transferencia específica

**Nota**: `useGetAllTokens()` ya está implementado en `useGetUserTokens.ts` (Día 5).

---

## 📝 Notas de Actualización (Día 4)

### Hooks Nuevos:
- ✅ **useGetUserTokens()** - Obtener tokens del usuario (Día 4)
- ✅ **useGetToken()** - Obtener info de un token (Día 4)
- ✅ **useGetTokenBalance()** - Obtener balance de un token (Día 4)
- ✅ **useGetAllTokens()** - Obtener todos los tokens del sistema (Día 5)
- ✅ **useIsPaused()** - Leer estado de pausa (Día 4)
- ✅ **usePause()** - Pausar contrato (Día 4)
- ✅ **useUnpause()** - Reanudar contrato (Día 4)
- ✅ **useUserIdByAddress()** - Optimización para AuthContext (Día 4)
- ✅ **useGetUserTransfers()** - Transferencias de un usuario (Día 7)
- ✅ **useUserTokenStats()** - Estadísticas por tipo (Día 7)
- ✅ **useGetUserTokensWithData()** - Tokens con datos completos (Día 7)
- ✅ **useGetAllTransfers()** - Todas las transferencias del sistema (Día 8)
- ✅ **useTokenTraceability()** - Trazabilidad end-to-end con árbol jerárquico (Día 8)

### Hooks Mejorados:
- ✅ **useContractReads.ts** - Agregado `useUserIdByAddress` para detección rápida

---

**Última actualización**: 21 de Noviembre 2025 (Día 4)
