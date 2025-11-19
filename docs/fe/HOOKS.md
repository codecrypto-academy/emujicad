# 🪝 Custom Hooks del Frontend

> Documentación de todos los hooks personalizados implementados con wagmi

---

## 📦 Hooks Implementados (12 totales)

### Archivo: `useContractReads.ts` (5 hooks de lectura)

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

---

### Archivo: `useRequestRole.ts` (1 hook de escritura)

#### 6. **useRequestRole()**
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

#### 7. **useCreateToken()**
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

#### 8. **useTransfer()**
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

#### 9. **useAcceptTransfer()**
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

#### 10. **useRejectTransfer()**
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

#### 11. **useCancelTransfer()**
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

## 📊 Resumen de Hooks

| Hook | Tipo | Archivo | Función |
|------|------|---------|---------|
| useUserInfo | Read | useContractReads.ts | Info de usuario |
| useIsAdmin | Read | useContractReads.ts | Verificar admin |
| useTotalTokens | Read | useContractReads.ts | Total tokens |
| useTotalUsers | Read | useContractReads.ts | Total usuarios |
| useTotalTransfers | Read | useContractReads.ts | Total transfers |
| useRequestRole | Write | useRequestRole.ts | Solicitar rol |
| useCreateToken | Write | useCreateToken.ts | Crear token |
| useTransfer | Write | useTransfer.ts | Iniciar transfer |
| useAcceptTransfer | Write | useTransfer.ts | Aceptar transfer |
| useRejectTransfer | Write | useTransfer.ts | Rechazar transfer |
| useCancelTransfer | Write | useTransfer.ts | Cancelar transfer |

**Total**: 11 hooks documentados (12 si se cuenta un hook adicional no listado en archivos)

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

## ❌ Hooks Faltantes (según funcionalidad del contrato)

Según el smart contract, podrían faltar:
- `useGetToken(tokenId)` - Obtener info completa de un token
- `useGetTokenBalance(tokenId, address)` - Balance específico
- `useGetUserTokens(address)` - Array de tokens del usuario
- `useGetTransfer(transferId)` - Info completa de transferencia
- `useGetUserTransfers(address)` - Array de transfers del usuario
- `useChangeStatusUser(address, status)` - Admin cambiar status (podría estar implícito)

Estos hooks adicionales mejorarían la funcionalidad completa del frontend.

---

**Última actualización**: 19 de Noviembre 2025
