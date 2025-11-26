# 🔗 Integración Web3

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**

Documentación de la integración Web3 con wagmi + viem + ethers

---

## 📚 Stack Web3 Implementado

### Librerías
- **wagmi**: 2.12.0 - React Hooks para Ethereum
- **viem**: 2.21.0 - TypeScript Ethereum library (bajo nivel)
- **ethers**: 6.13.0 - Ethereum interactions (compatibilidad)
- **@tanstack/react-query**: 5.x - State management y caching

### Ventajas del Stack
- ✅ **Type-safe**: Todo tipado con TypeScript
- ✅ **Modern**: wagmi es el estándar actual (2024+)
- ✅ **Optimizado**: viem es más rápido que ethers.js
- ✅ **Caching**: react-query maneja cache automáticamente
- ✅ **Hooks**: API declarativa con React Hooks

---

## ⚙️ Configuración Principal

### `lib/wagmi-config.ts`

Configuración de wagmi para conexión con Anvil local:

```typescript
import { http, createConfig } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [localhost],
  connectors: [injected()], // MetaMask
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
})
```

**Características**:
- **Chain**: localhost (Anvil - Chain ID: 31337)
- **Connector**: injected (detecta MetaMask automáticamente)
- **Transport**: HTTP RPC a Anvil local

---

### `contracts/config.ts`

Configuración del smart contract:

```typescript
import SupplyChainArtifact from './SupplyChain.json'

// Dirección del contrato desplegado (actualizada por deploy.sh)
export const SUPPLY_CHAIN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`

// ABI importado desde artifact de Foundry
export const SUPPLY_CHAIN_ABI = SupplyChainArtifact.abi

// Enums del contrato (deben coincidir con Solidity)
export enum UserRole {
  Producer = 0,
  Factory = 1,
  Retailer = 2,
  Consumer = 3
}

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Canceled = 3
}

export enum TokenType {
  RawMaterial = 0,
  FinishedProduct = 1
}

export enum PauseRole {
  OnlyAdmin = 0,
  AllApprovedUsers = 1
}
```

**Características**:
- **Address**: Auto-actualizada por deploy.sh
- **ABI**: Importado desde compilación de Foundry
- **Enums**: Sincronizados con Solidity para type-safety

---

## 🔌 Providers Setup

### `app/layout.tsx`

Configuración de providers en el layout raíz:

```typescript
'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi-config'

const queryClient = new QueryClient()

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
```

**Providers necesarios**:
1. **WagmiProvider**: Provee config de wagmi a toda la app
2. **QueryClientProvider**: Maneja caching y refetch de react-query
3. **AuthProvider**: Provee contexto de autenticación (ver sección AuthContext) ⭐ Día 4

---

## 🔐 AuthContext ⭐ NUEVO (Día 4)

### `contexts/AuthContext.tsx`

Contexto global para manejar autenticación y autorización en toda la aplicación.

**Ubicación**: `web/src/contexts/AuthContext.tsx`

**Características**:
- Detecta si el usuario es administrador
- Detecta si el usuario está aprobado
- Detecta si el usuario está autenticado
- Optimización con `useUserIdByAddress` para detección rápida
- Redirección inmediata para usuarios no registrados
- Restauración de preferencia de tema al autenticar
- Manejo mejorado de admin (no requiere userInfo)

**Uso**:
```typescript
import { useAuth } from '@/contexts/AuthContext'

function Component() {
  const { isAdmin, isApproved, isAuthenticated, userInfo, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  
  if (!isAuthenticated) {
    return <div>Please connect your wallet</div>
  }
  
  if (isAdmin) {
    return <AdminPanel />
  }
  
  if (isApproved) {
    return <UserDashboard />
  }
  
  return <PendingApproval />
}
```

**API del Contexto**:
```typescript
type AuthContextType = {
  isAdmin: boolean           // Es administrador del contrato
  isApproved: boolean        // Usuario aprobado (status === Approved)
  isAuthenticated: boolean  // Usuario conectado y registrado
  userInfo: UserInfo | null  // Información completa del usuario
  isLoading: boolean        // Estado de carga
}
```

**Optimizaciones (Día 4)**:

1. **Detección Rápida con `useUserIdByAddress`**:
   - Usa `useUserIdByAddress` para verificar rápidamente si el usuario existe
   - Si `userId === 0n`, marca como no autenticado inmediatamente
   - Evita esperar por `useUserInfo` completo

2. **Manejo de Admin**:
   - Si `isAdmin === true`, autentica inmediatamente
   - No espera por `useUserInfo` (admin puede no estar registrado como usuario)

3. **Restauración de Tema**:
   - Al autenticar, restaura preferencia de tema del usuario desde `localStorage`
   - Key específica: `theme_${address.toLowerCase()}`

**Integración en Layout**:
```typescript
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
```

**Hooks Utilizados Internamente**:
- `useAccount()` - Obtiene address conectada
- `useIsAdmin(address)` - Verifica si es admin
- `useUserIdByAddress(address)` - Obtiene User ID rápidamente ⭐ Día 4
- `useUserInfo(address)` - Obtiene información completa del usuario

**Flujo de Autenticación**:

1. **Usuario no conectado**:
   - `isAuthenticated = false`
   - `isAdmin = false`
   - `isApproved = false`
   - `userInfo = null`

2. **Usuario conectado pero no registrado**:
   - `isAuthenticated = false` (detectado rápidamente con `useUserIdByAddress`)
   - Redirección inmediata a home

3. **Usuario conectado y registrado (Pending/Rejected)**:
   - `isAuthenticated = true`
   - `isApproved = false`
   - `userInfo` contiene datos del usuario

4. **Usuario conectado y aprobado**:
   - `isAuthenticated = true`
   - `isApproved = true`
   - `userInfo` contiene datos del usuario
   - Tema restaurado desde localStorage

5. **Administrador**:
   - `isAuthenticated = true`
   - `isAdmin = true`
   - `isApproved = false` (admin no necesita aprobación)
   - Autenticación inmediata sin esperar `useUserInfo`

---

## 🪝 Hooks de wagmi Utilizados

### Hooks de Conexión

#### `useAccount()`
Obtiene información de la cuenta conectada.

```typescript
import { useAccount } from 'wagmi'

function Component() {
  const { address, isConnected, isConnecting, isDisconnected } = useAccount()
  
  if (!isConnected) return <ConnectWallet />
  
  return <div>Connected: {address}</div>
}
```

#### `useConnect()`
Maneja la conexión con MetaMask.

```typescript
import { useConnect } from 'wagmi'

function ConnectButton() {
  const { connect, connectors, isPending } = useConnect()
  
  return (
    <button onClick={() => connect({ connector: connectors[0] })}>
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}
```

#### `useDisconnect()`
Maneja la desconexión.

```typescript
import { useDisconnect } from 'wagmi'

function DisconnectButton() {
  const { disconnect } = useDisconnect()
  
  return <button onClick={() => disconnect()}>Disconnect</button>
}
```

---

### Hooks de Lectura

#### `useReadContract()`
Lee datos del contrato (view/pure functions).

```typescript
import { useReadContract } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

function Component() {
  const { data, isLoading, error } = useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getUserInfo',
    args: ['0x...']
  })
  
  // data está tipado automáticamente según el ABI
}
```

**Características**:
- Auto-refetch cuando cambia la blockchain
- Caching automático
- Type-safe con TypeScript

#### `useReadContracts()`
Lee múltiples funciones en paralelo (más eficiente).

```typescript
import { useReadContracts } from 'wagmi'

const { data } = useReadContracts({
  contracts: [
    {
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'totalTokens'
    },
    {
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'totalUsers'
    }
  ]
})

// data[0] = totalTokens
// data[1] = totalUsers
```

---

### Hooks de Escritura

#### `useWriteContract()`
Ejecuta transacciones (state-changing functions).

```typescript
import { useWriteContract } from 'wagmi'

function Component() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract()
  
  const handleRequest = () => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'requestUserRole',
      args: ['Producer']
    })
  }
  
  return (
    <button onClick={handleRequest} disabled={isPending}>
      {isPending ? 'Requesting...' : 'Request Role'}
    </button>
  )
}
```

#### `useWaitForTransactionReceipt()`
Espera confirmación de transacción.

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

function Component() {
  const { data: hash, writeContract } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  return (
    <div>
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isSuccess && <div>Transaction confirmed!</div>}
    </div>
  )
}
```

---

## 🎯 Patrón Completo: Write + Wait

Patrón recomendado para transacciones con feedback completo:

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useEffect } from 'react'

export function useRequestRole() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  
  const requestRole = (role: string) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'requestUserRole',
      args: [role]
    })
  }
  
  useEffect(() => {
    if (isSuccess) {
      // Transacción confirmada
      console.log('Role requested successfully!')
    }
  }, [isSuccess])
  
  return {
    requestRole,
    isPending,      // Esperando usuario en MetaMask
    isConfirming,   // Esperando confirmación blockchain
    isSuccess,      // Transacción confirmada
    error
  }
}
```

---

## 🔄 Manejo de Estados

### Estados de Conexión
- `isConnecting`: Proceso de conexión iniciado
- `isConnected`: Wallet conectada
- `isDisconnected`: No hay wallet conectada

### Estados de Transacción
- `isPending`: Usuario debe aprobar en MetaMask
- `isConfirming`: Transacción enviada, esperando mining
- `isSuccess`: Transacción confirmada en blockchain
- `error`: Error en cualquier paso

### Flujo Completo
```
User clicks button
    ↓
isPending = true (esperando MetaMask)
    ↓
User approves in MetaMask
    ↓
isPending = false, isConfirming = true
    ↓
Transaction mined
    ↓
isConfirming = false, isSuccess = true
```

---

## 🛠️ Utilidades

### Conversión BigInt ↔ Number

```typescript
// BigInt to Number
const amount = Number(data.totalSupply)

// Number to BigInt
const supply = BigInt(1000)
```

### Address Formatting

```typescript
function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
// → 0x742d...0bEb
```

### Manejo de Errores

```typescript
if (error) {
  if (error.message.includes('User rejected')) {
    toast.error('Transaction rejected by user')
  } else if (error.message.includes('insufficient funds')) {
    toast.error('Insufficient balance')
  } else {
    toast.error('Transaction failed')
  }
}
```

---

## 🚀 Configuración de MetaMask

### Agregar Red Anvil Local

**Configuración manual**:
```
Network Name: Anvil Local
RPC URL: http://localhost:8545
Chain ID: 31337
Currency Symbol: ETH
```

**Programática** (usando `window.ethereum`):
```typescript
async function addAnvilNetwork() {
  await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: '0x7A69', // 31337 en hex
      chainName: 'Anvil Local',
      rpcUrls: ['http://localhost:8545'],
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18
      }
    }]
  })
}
```

---

## ⚠️ Problemas Comunes

### Error: "Chain mismatch"
**Solución**: Cambiar a red Anvil Local (Chain ID: 31337) en MetaMask

### Error: "Contract not deployed"
**Solución**: 
1. Verificar que Anvil esté corriendo: `anvil`
2. Redesplegar contrato
3. Actualizar address en `contracts/config.ts`

### Error: "Transaction reverted"
**Solución**: Revisar validaciones del contrato (usuario aprobado, balance suficiente, etc.)

---

## 📦 Alternativas No Usadas

### ❌ Contexto Manual (Web3Context)
El README.md sugiere crear un contexto manual, pero usamos wagmi que ya provee:
- State management
- Caching
- Auto-refetch
- TypeScript types

**Decisión**: ✅ Mejor usar wagmi directamente (práctica moderna)

### ❌ ethers.js directo
Podríamos usar ethers.js directamente, pero wagmi + viem es:
- Más rápido
- Mejor tipado
- Más declarativo
- Más mantenible

---

## 📚 Recursos

- [wagmi Docs](https://wagmi.sh/)
- [viem Docs](https://viem.sh/)
- [TanStack Query](https://tanstack.com/query/latest)
- [MetaMask Docs](https://docs.metamask.io/)

---

## 📝 Notas de Actualización (Día 4)

### AuthContext Optimizado:
- ✅ Agregado `useUserIdByAddress` para detección rápida
- ✅ Redirección inmediata para usuarios no registrados
- ✅ Manejo mejorado de admin (no requiere userInfo)
- ✅ Restauración de preferencia de tema al autenticar

### Referencias:
- **Hooks**: [HOOKS.md](./HOOKS.md)
- **Componentes**: [COMPONENTS.md](./COMPONENTS.md)
- **Pausabilidad**: [PAUSABILITY.md](./PAUSABILITY.md) ⭐ NUEVO

---

**Última actualización**: 21 de Noviembre 2025 (Día 4)
