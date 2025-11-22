# Supply Chain Tracker - Frontend

Frontend Web3 DApp desarrollada con Next.js 16 para interactuar con el smart contract SupplyChain.sol desplegado en blockchain local (Anvil).

## 📋 Tecnologías

- **Framework**: Next.js 16.0.1 con App Router
- **UI**: React 19.2.0, TypeScript 5.x
- **Estilos**: Tailwind CSS 3.4.14 + Shadcn UI
- **Web3 Stack**:
  - wagmi 2.12.0 (React Hooks para Ethereum)
  - viem 2.21.0 (TypeScript Ethereum library)
  - ethers 6.13.0 (Ethereum interactions)
  - @tanstack/react-query 5.x (Data fetching/caching)
- **Blockchain Local**: Anvil (localhost:8545, Chain ID: 31337)

## 🚀 Setup Completo - Paso a Paso

### **PASO 0**: Ubicación inicial
```bash
cd /mnt/backups/emujicad/Documents/master_blockchainweb3/web3/PFM/emujicad
```

---

### **PASO 1**: Crear proyecto Next.js con create-next-app

```bash
npx create-next-app@latest web \
  --typescript \
  --tailwind \
  --src-dir \
  --app \
  --import-alias "@/*" \
  --no-git \
  --skip-install
```

**Explicación de flags**:
- `--typescript`: Habilita TypeScript en el proyecto
- `--tailwind`: Configura Tailwind CSS automáticamente
- `--src-dir`: Crea carpeta `src/` para código fuente
- `--app`: Usa App Router (Next.js 13+)
- `--import-alias "@/*"`: Alias para imports (`@/components` → `src/components`)
- `--no-git`: No inicializa repositorio git (ya existe en nivel superior)
- `--skip-install`: No ejecuta npm install aún (agregaremos deps primero)

**Resultado**: Estructura base creada en carpeta `web/`

**Estructura creada**:
```
web/
├── src/
│   └── app/
│       ├── layout.tsx      # Root layout
│       ├── page.tsx        # Página principal
│       └── globals.css     # Estilos globales
├── public/                 # Archivos estáticos
├── package.json            # Dependencias (sin instalar aún)
├── tsconfig.json           # Configuración TypeScript
├── tailwind.config.js      # Configuración Tailwind
├── next.config.ts          # Configuración Next.js
└── .gitignore              # Archivos a ignorar
```

---

### **PASO 2**: Navegar al proyecto
```bash
cd web
```

---

### **PASO 3**: Agregar dependencias Web3 al package.json

**IMPORTANTE**: Agregamos las deps ANTES de instalar para evitar reinstalaciones.

```bash
npm pkg set dependencies.ethers="^6.13.0"
npm pkg set dependencies.viem="^2.21.0"
npm pkg set dependencies.wagmi="^2.12.0"
npm pkg set dependencies."@rainbow-me/rainbowkit"="^2.1.0"
```

**¿Qué hace cada paquete?**

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| **ethers** | 6.13.0 | Biblioteca para interactuar con Ethereum (contratos, wallets, providers) |
| **viem** | 2.21.0 | TypeScript library para Ethereum (alternativa moderna a ethers, usada por wagmi) |
| **wagmi** | 2.12.0 | React Hooks para Ethereum (useAccount, useConnect, useReadContract, useWriteContract) |
| **@rainbow-me/rainbowkit** | 2.1.0 | UI components para conexión de wallets (MetaMask, WalletConnect, etc.) - NO USADO EN ESTE SETUP |

**Resultado**: `package.json` actualizado con dependencias Web3

---

### **PASO 4**: Instalar todas las dependencias

```bash
npm install
```

**Resultado**:
```
✅ 981 paquetes instalados en ~2 segundos
⚠️ 19 low severity vulnerabilities (no críticas)
⚠️ Peer dependency warnings de React 19 (compatibles)
```

**Paquetes principales instalados**:
- next@16.0.1
- react@19.2.0, react-dom@19.2.0
- typescript@5.x
- tailwindcss@3.4.14, autoprefixer, postcss
- wagmi@2.12.0, viem@2.21.0, ethers@6.13.0
- @tanstack/react-query@5.x (peer dependency de wagmi)

---

### **PASO 5**: Verificar instalación de dependencias Web3

```bash
npm list wagmi viem ethers @rainbow-me/rainbowkit
```

**Resultado esperado**:
```
web@0.1.0
├── @rainbow-me/rainbowkit@2.1.0
├── ethers@6.13.0
├── viem@2.21.0
└── wagmi@2.12.0
```

---

### **PASO 6**: Configurar Shadcn UI

#### 6.1. Intentar inicializar Shadcn UI
```bash
npx shadcn@latest init -y
```

**Resultado**: ❌ Falló porque `components.json` ya existía en el template

#### 6.2. Agregar componentes UI necesarios
```bash
npx shadcn@latest add button card label select input table badge dialog alert -y
```

**Resultado**: 
- ✅ Creados: `dialog.tsx`, `alert.tsx`
- ⏭️ Omitidos: `button.tsx`, `card.tsx`, `label.tsx`, `select.tsx`, `input.tsx`, `table.tsx`, `badge.tsx` (ya existían)

**Componentes disponibles** (en `src/components/ui/`):
- `button.tsx`: Botones con variantes (default, outline, ghost, destructive)
- `card.tsx`: Cards con header, content, footer
- `label.tsx`: Labels para formularios
- `select.tsx`: Select/dropdown menus
- `input.tsx`: Inputs de texto
- `table.tsx`: Tablas responsivas
- `badge.tsx`: Badges/etiquetas
- `dialog.tsx`: Modales/diálogos
- `alert.tsx`: Alertas/notificaciones

---

### **PASO 7**: Copiar ABI del Smart Contract

```bash
cp /mnt/backups/emujicad/Documents/master_blockchainweb3/web3/PFM/emujicad/sc/out/SupplyChain.sol/SupplyChain.json /mnt/backups/emujicad/Documents/master_blockchainweb3/web3/PFM/emujicad/web/src/contracts/
```

**Desde**: `../sc/out/SupplyChain.sol/SupplyChain.json` (compilado por Foundry)  
**Hacia**: `./src/contracts/SupplyChain.json`

**¿Qué es el ABI?**
- **Application Binary Interface**: Interfaz JSON que describe las funciones del contrato
- Necesario para que wagmi/ethers sepa cómo llamar funciones del contrato
- Generado automáticamente por `forge build`

**Contenido**: ABI del contrato SupplyChain.sol (934 líneas, 73 funciones)

---

### **PASO 8**: Crear estructura de directorios

```bash
# Directorios creados automáticamente al crear archivos:
mkdir -p src/contracts  # Para ABI y configuración del contrato
mkdir -p src/hooks      # Para custom hooks de Web3
mkdir -p src/lib        # Para configuraciones (wagmi-config.ts ya existe)
```

**Estructura resultante**:
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # Componentes Shadcn
│   └── ConnectWallet.tsx      # ← CREADO
├── contracts/
│   ├── SupplyChain.json       # ← COPIADO (ABI)
│   └── config.ts              # ← CREADO
├── hooks/
│   ├── useContractReads.ts    # ← CREADO
│   ├── useRequestRole.ts      # ← CREADO
│   ├── useCreateToken.ts      # ← CREADO
│   └── useTransfer.ts         # ← CREADO
└── lib/
    ├── utils.ts               # Helper de Shadcn (ya existe)
    └── wagmi-config.ts        # ← CREADO
```

---

### **PASO 9**: Crear configuración de Wagmi

**Archivo**: `src/lib/wagmi-config.ts`

```typescript
import { http, createConfig } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Configuración de la blockchain local Anvil
export const config = createConfig({
  chains: [localhost],
  connectors: [
    injected(), // MetaMask y otros wallets inyectados
  ],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'), // URL de Anvil
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
```

**Explicación**:
- `chains: [localhost]`: Solo red local (Chain ID: 31337)
- `connectors: [injected()]`: Soporte para MetaMask, Coinbase Wallet, etc.
- `transports`: HTTP RPC endpoint de Anvil
- `declare module 'wagmi'`: Type augmentation para TypeScript

---

### **PASO 10**: Crear configuración del contrato

**Archivo**: `src/contracts/config.ts`

```typescript
import SupplyChainArtifact from './SupplyChain.json'

// Dirección del contrato deployado en Anvil
export const SUPPLY_CHAIN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`

// ABI del contrato
export const SUPPLY_CHAIN_ABI = SupplyChainArtifact.abi

// Enums del contrato (deben coincidir con Solidity)
export enum UserRole {
  Producer = 0,
  Manufacturer = 1,
  Distributor = 2,
  Retailer = 3,
}

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Suspended = 3,
}

export enum TokenType {
  RowMaterial = 0,
  FinishedProduct = 1,
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Cancelled = 3,
}

export enum PauseRole {
  None = 0,
  Pauser = 1,
}
```

**⚠️ IMPORTANTE**: Actualizar `SUPPLY_CHAIN_ADDRESS` después de cada deploy con Foundry.

**Uso**:
```typescript
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI, UserRole } from '@/contracts/config'
```

---

### **PASO 11**: Actualizar Layout con Providers Web3

**Archivo**: `src/app/layout.tsx`

**Cambios realizados**:
1. Agregado `'use client'` directive (providers son client components)
2. Importado WagmiProvider y QueryClientProvider
3. Envuelto children con providers
4. Comentado metadata (requiere server component)

```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi-config'
import { useState } from 'react'
// ... imports de fuentes y CSS

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient())

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

**¿Por qué estos providers?**
- **WagmiProvider**: Context para todos los hooks de wagmi
- **QueryClientProvider**: Caching y refetching de datos blockchain

---

### **PASO 12**: Crear componente ConnectWallet

**Archivo**: `src/components/ConnectWallet.tsx`

```typescript
'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button onClick={() => disconnect()} variant="outline">
          Desconectar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          variant="default"
        >
          Conectar {connector.name}
        </Button>
      ))}
    </div>
  )
}
```

**Hooks utilizados**:
- `useAccount()`: Obtiene dirección y estado de conexión
- `useConnect()`: Lista conectores disponibles y ejecuta conexión
- `useDisconnect()`: Desconecta wallet

**Uso**:
```tsx
import { ConnectWallet } from '@/components/ConnectWallet'

<ConnectWallet />
```

---

### **PASO 13**: Actualizar página principal

**Archivo**: `src/app/page.tsx`

**Cambios**:
1. Agregado `'use client'` directive
2. Importado ConnectWallet y hooks personalizados
3. Agregado header con botón de conexión
4. Stats cards que aparecen al conectar
5. Mensaje de bienvenida dinámico

```typescript
'use client'

import { ConnectWallet } from '@/components/ConnectWallet'
import { useAccount } from 'wagmi'
import { useTotalTokens, useTotalUsers, useTotalTransfers } from '@/hooks/useContractReads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { isConnected } = useAccount()
  const { data: totalTokens } = useTotalTokens()
  const { data: totalUsers } = useTotalUsers()
  const { data: totalTransfers } = useTotalTransfers()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold">Supply Chain Tracker</h1>
          <ConnectWallet />
        </div>

        {/* Stats cuando esté conectado */}
        {isConnected && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Tokens</CardTitle>
                <CardDescription>Total registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalTokens?.toString() || '0'}</p>
              </CardContent>
            </Card>
            {/* ... más cards ... */}
          </div>
        )}

        {/* Bienvenida */}
        <div className="flex flex-col items-center gap-6 text-center">
          <h2>
            {isConnected ? '¡Bienvenido a la DApp!' : 'Conecta tu wallet para comenzar'}
          </h2>
          <p>Sistema descentralizado de tracking para supply chain...</p>
        </div>
      </main>
    </div>
  )
}
```

---

### **PASO 14**: Crear hooks de lectura del contrato

**Archivo**: `src/hooks/useContractReads.ts`

```typescript
'use client'

import { useReadContract } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para obtener información de un usuario por su dirección
 */
export function useUserInfo(userAddress?: `0x${string}`) {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getUserInfo',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })
}

/**
 * Hook para verificar si una dirección es admin
 */
export function useIsAdmin(userAddress?: `0x${string}`) {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'isAdmin',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })
}

/**
 * Hook para obtener el total de tokens
 */
export function useTotalTokens() {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getTotalTokens',
  })
}

// ... más hooks ...
```

**Hooks disponibles**:
- `useUserInfo(address)`: Obtiene información del usuario (rol, status, id)
- `useIsAdmin(address)`: Verifica si dirección es owner del contrato
- `useTotalTokens()`: Total de tokens creados
- `useTotalUsers()`: Total de usuarios registrados
- `useTotalTransfers()`: Total de transferencias realizadas

**Uso**:
```typescript
const { data: userInfo, isLoading, error } = useUserInfo('0x...')
console.log(userInfo) // { id: 1n, userAddress: '0x...', role: 0, status: 1 }
```

---

### **PASO 15**: Crear hook para solicitar rol

**Archivo**: `src/hooks/useRequestRole.ts`

```typescript
'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI, UserRole } from '@/contracts/config'

/**
 * Hook para solicitar un rol de usuario
 */
export function useRequestRole() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const requestRole = (role: UserRole) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'requestUserRole',
      args: [role],
    })
  }

  return {
    requestRole,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
```

**Estados del hook**:
- `isPending`: Esperando aprobación del usuario en MetaMask
- `isConfirming`: Transacción enviada, esperando confirmación en blockchain
- `isSuccess`: Transacción confirmada exitosamente
- `error`: Error durante la transacción
- `hash`: Transaction hash (0x...)

**Uso**:
```typescript
const { requestRole, isPending, isConfirming, isSuccess } = useRequestRole()

<Button 
  onClick={() => requestRole(UserRole.Producer)}
  disabled={isPending || isConfirming}
>
  {isPending ? 'Confirmando...' : isConfirming ? 'Procesando...' : 'Solicitar Rol'}
</Button>

{isSuccess && <Alert>Rol solicitado exitosamente</Alert>}
```

---

### **PASO 16**: Crear hook para crear tokens

**Archivo**: `src/hooks/useCreateToken.ts`

```typescript
'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI, TokenType } from '@/contracts/config'

/**
 * Hook para crear un nuevo token
 */
export function useCreateToken() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createToken = (
    name: string,
    tokenType: TokenType,
    totalSupply: bigint,
    features: string,
    parentId: bigint
  ) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'createToken',
      args: [name, tokenType, totalSupply, features, parentId],
    })
  }

  return {
    createToken,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
```

**Uso**:
```typescript
const { createToken, isPending, isSuccess } = useCreateToken()

createToken(
  'Madera Roble',              // name
  TokenType.RowMaterial,       // tokenType
  BigInt(1000),                // totalSupply
  JSON.stringify({ origin: 'Chile' }),  // features
  BigInt(0)                    // parentId (0 = materia prima)
)
```

---

### **PASO 17**: Crear hook para transferencias

**Archivo**: `src/hooks/useTransfer.ts`

```typescript
'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para gestionar transferencias de tokens
 */
export function useTransfer() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const transfer = (to: `0x${string}`, tokenId: bigint, amount: bigint) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'transfer',
      args: [to, tokenId, amount],
    })
  }

  const acceptTransfer = (transferId: bigint) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'acceptTransfer',
      args: [transferId],
    })
  }

  const rejectTransfer = (transferId: bigint) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'rejectTransfer',
      args: [transferId],
    })
  }

  const cancelTransfer = (transferId: bigint) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'cancelTransfer',
      args: [transferId],
    })
  }

  return {
    transfer,
    acceptTransfer,
    rejectTransfer,
    cancelTransfer,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
```

**Funciones disponibles**:
- `transfer(to, tokenId, amount)`: Solicitar transferencia
- `acceptTransfer(transferId)`: Aceptar transferencia pendiente
- `rejectTransfer(transferId)`: Rechazar transferencia pendiente
- `cancelTransfer(transferId)`: Cancelar transferencia propia

**Uso**:
```typescript
const { transfer, acceptTransfer, isPending } = useTransfer()

// Solicitar transferencia
transfer('0x123...', BigInt(1), BigInt(100))

// Aceptar transferencia recibida
acceptTransfer(BigInt(5))
```

---

### **PASO 18**: Compilar proyecto (verificación)

```bash
npm run build
```

**Resultado esperado**: Build exitoso sin errores de TypeScript

**Si hay errores**:
1. Verificar imports correctos
2. Verificar tipos de datos (BigInt para uint256)
3. Verificar que `SUPPLY_CHAIN_ABI` no tenga `as const` (causa error)

---

## 📊 Resumen de Archivos Creados/Modificados

### ✅ Archivos CREADOS (11):

1. **`src/lib/wagmi-config.ts`** (20 líneas)
   - Configuración de wagmi para Anvil local

2. **`src/contracts/config.ts`** (42 líneas)
   - Dirección del contrato + ABI + Enums

3. **`src/contracts/SupplyChain.json`** (COPIADO)
   - ABI completo del smart contract

4. **`src/components/ConnectWallet.tsx`** (38 líneas)
   - Componente de conexión de wallet

5. **`src/hooks/useContractReads.ts`** (70 líneas)
   - 5 hooks de lectura del contrato

6. **`src/hooks/useRequestRole.ts`** (35 líneas)
   - Hook para solicitar rol de usuario

7. **`src/hooks/useCreateToken.ts`** (45 líneas)
   - Hook para crear tokens

8. **`src/hooks/useTransfer.ts`** (70 líneas)
   - 4 hooks de transferencias

9. **`README.md`** (este archivo, ~600 líneas)
   - Documentación completa del proyecto

10. **`README.nextjs.md`** (RENOMBRADO)
    - Backup del README original de Next.js

### ✏️ Archivos MODIFICADOS (2):

1. **`src/app/layout.tsx`**
   - Agregado: WagmiProvider, QueryClientProvider
   - Cambiado a client component

2. **`src/app/page.tsx`**
   - Reemplazado contenido default
   - Agregado: ConnectWallet, stats cards, hooks

### 📦 Archivos de configuración (sin cambios):
- `package.json` (dependencias agregadas en PASO 3)
- `tsconfig.json` (generado por create-next-app)
- `tailwind.config.js` (generado por create-next-app)
- `next.config.ts` (generado por create-next-app)
- `components.json` (ya existía de template)

## 🚦 Estado Actual del Proyecto

### ✅ **AMBIENTE PREPARADO Y FUNCIONAL** (Nov 18, 2025)

#### 🏗️ Infraestructura Base:
- [x] Proyecto Next.js 16.0.1 creado con create-next-app
- [x] TypeScript 5.x configurado con path alias `@/*`
- [x] Tailwind CSS 3.4.14 instalado y funcional
- [x] App Router (Next.js 13+) configurado
- [x] 981 paquetes npm instalados correctamente

#### 🎨 Componentes UI:
- [x] Shadcn UI configurado (components.json)
- [x] 9 componentes UI instalados: Button, Card, Label, Select, Input, Table, Badge, Dialog, Alert
- [x] Utility function `cn()` disponible en `lib/utils.ts`

#### 🔗 Stack Web3:
- [x] wagmi 2.12.0 instalado y configurado
- [x] viem 2.21.0 (TypeScript Ethereum library)
- [x] ethers 6.13.0 (Ethereum interactions)
- [x] @tanstack/react-query 5.x (caching/refetching)
- [x] @rainbow-me/rainbowkit 2.1.0 (instalado, no usado)

#### ⚙️ Configuración Web3:
- [x] `wagmi-config.ts`: Configurado para Anvil local (Chain ID: 31337)
- [x] `contracts/config.ts`: Dirección + ABI + 5 Enums exportados
- [x] `contracts/SupplyChain.json`: ABI completo copiado (934 líneas contract)
- [x] Layout con WagmiProvider + QueryClientProvider

#### 🧩 Componentes Creados:
- [x] `ConnectWallet.tsx`: Botón conexión/desconexión con dirección acortada
- [x] Landing page actualizada con stats cards y header

#### 🪝 Hooks Personalizados (4 archivos, 220 líneas):
- [x] `useContractReads.ts`: 5 hooks de lectura (getUserInfo, isAdmin, totals)
- [x] `useRequestRole.ts`: Solicitar rol de usuario con estados
- [x] `useCreateToken.ts`: Crear tokens con confirmación de tx
- [x] `useTransfer.ts`: 4 funciones (transfer, accept, reject, cancel)

#### 📁 Estructura Completa:
```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ✅ Providers configurados
│   │   ├── page.tsx            ✅ Landing con stats
│   │   └── globals.css         ✅ Tailwind base
│   ├── components/
│   │   ├── ui/                 ✅ 9 componentes Shadcn
│   │   └── ConnectWallet.tsx   ✅ Componente custom
│   ├── contracts/
│   │   ├── config.ts           ✅ Dirección + ABI + Enums
│   │   └── SupplyChain.json    ✅ ABI completo
│   ├── hooks/
│   │   ├── useContractReads.ts ✅ 5 hooks lectura
│   │   ├── useRequestRole.ts   ✅ Hook escritura
│   │   ├── useCreateToken.ts   ✅ Hook escritura
│   │   └── useTransfer.ts      ✅ 4 hooks escritura
│   └── lib/
│       ├── utils.ts            ✅ cn() helper
│       └── wagmi-config.ts     ✅ Config Anvil
├── public/                     ✅ Assets estáticos
├── package.json                ✅ Todas deps instaladas
├── tsconfig.json               ✅ TypeScript config
├── tailwind.config.js          ✅ Tailwind config
├── next.config.ts              ✅ Next.js config
├── components.json             ✅ Shadcn config
├── README.md                   ✅ Esta documentación
└── README.nextjs.md            ✅ Backup original
```

#### 📊 Métricas:
- **Archivos creados**: 11 nuevos archivos
- **Archivos modificados**: 2 archivos (layout, page)
- **Líneas de código**: ~500 líneas de código productivo
- **Hooks implementados**: 18 hooks (5 lectura + 13 escritura)
- **Componentes UI**: 22 componentes (10 Shadcn + 12 custom, incluye TokenCardModern)
- **Diseño Moderno 2025**: Aplicado a 5 páginas principales (glassmorphism, gradientes, animaciones)
- **Tiempo de setup**: ~1 hora (Día 1)
- **Estado actual**: Dashboard completo, Admin panel completo, Sistema de pausabilidad completo (Día 4)

---

### ⚠️ **Advertencias no críticas**:

#### npm vulnerabilities:
```
19 low severity vulnerabilities
```
**Acción**: Ejecutar `npm audit fix` cuando sea conveniente (no afecta desarrollo)

#### Peer dependencies:
```
WARN peer dependency React 19 (algunos paquetes esperan React 18)
```
**Impacto**: Ninguno. Next.js 16 soporta React 19 oficialmente. Warnings son solo informativos.

#### Dirección del contrato:
```
SUPPLY_CHAIN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
```
**⚠️ IMPORTANTE**: Esta es una dirección de ejemplo. DEBE actualizarse después de cada deploy en Anvil.

---

### 🔄 **Pendiente** (según ACADEMIC_ASSESSMENT.md):

#### Semana 1 - Días 2-7 (Nov 19-24):
- [x] **Desplegar contrato** en Anvil y actualizar dirección en config.ts ✅
- [x] **Probar conexión** MetaMask → Anvil → DApp ✅
- [x] **Dashboard de usuario**: Perfil, rol, estado, tokens propios ✅ Día 4
- [x] **Panel admin**: Aprobar/rechazar/suspender usuarios ✅ Día 3
- [x] **Sistema de pausabilidad**: Completo en frontend ✅ Día 4
- [x] **ErrorBoundary**: Implementado globalmente ✅ Día 4
- [x] **Validación de datos**: Sistema completo ✅ Día 4
- [x] **Performance**: Optimización con batch reads ✅ Día 4
- [x] **Tests Frontend**: Vitest + Playwright (17 tests) ✅ Día 4
- [x] **Accesibilidad**: ARIA labels, WCAG AA ✅ Día 4
- [x] **Animaciones**: Transiciones suaves ✅ Día 4
- [ ] **Formulario crear token**: Validaciones, tipo, supply, features
- [ ] **Tabla de tokens**: Listar, filtrar, ver detalles
- [ ] **UI transferencias**: Solicitar, listar, aceptar/rechazar/cancelar
- [ ] **Responsive design**: Mobile-first approach (parcialmente implementado)
- [ ] **Loading states**: Spinners durante transacciones (parcialmente implementado)
- [ ] **Error handling**: Alertas user-friendly (parcialmente implementado)

#### Semana 2 (Nov 25-28):
- [ ] **E2E testing** con Anvil (Nov 25)
- [ ] **Documentación IA.md** (Nov 25-26): IAs usadas, tiempo, errores, chats
- [ ] **Video demo** 5 min (Nov 27): Arquitectura, tests, frontend, admin
- [ ] **Entrega final** (Nov 28): Checklist completo

---

---

## 🤖 Deployment Automatizado

### **Script de Deployment Completo** (`deploy.sh`)

Se creó un script bash completamente automatizado que maneja todo el ciclo de vida del proyecto.

**Ubicación**: `/mnt/backups/emujicad/Documents/master_blockchainweb3/web3/PFM/emujicad/deploy.sh`

### **Características del Script**:

✅ **Inicialización completa**:
- Levanta Anvil en background con `nohup`
- Valida que Anvil esté activo y escuchando en el puerto correcto
- Despliega el contrato automáticamente
- Obtiene la dirección del contrato deployado
- Actualiza `config.ts` con la nueva dirección
- Inicia el frontend en background

✅ **Gestión de servicios**:
- Start: Inicia todo el stack
- Stop: Detiene todos los servicios
- Status: Muestra estado de cada servicio
- Restart: Reinicia todo

✅ **Logs centralizados**:
- Todos los logs en `./logs/`
- Archivos PID para cada proceso
- Fácil troubleshooting

✅ **Instrucciones MetaMask**:
- Comando dedicado para mostrar configuración
- Private keys de cuentas de prueba
- Paso a paso detallado

### **Uso del Script**:

```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x deploy.sh

# Ver ayuda
./deploy.sh help

# Iniciar todo el stack
./deploy.sh start

# Ver estado de servicios
./deploy.sh status

# Ver instrucciones de MetaMask
./deploy.sh metamask

# Detener todo
./deploy.sh stop

# Reiniciar todo
./deploy.sh restart
```

### **Flujo Completo de Inicio**:

```bash
cd /mnt/backups/emujicad/Documents/master_blockchainweb3/web3/PFM/emujicad

# 1. Iniciar todo con un solo comando
./deploy.sh start
```

**Salida esperada**:
```
═══════════════════════════════════════════════════════════
  PASO 1: Iniciar Anvil (Blockchain Local)
═══════════════════════════════════════════════════════════

➜ Iniciando Anvil en 127.0.0.1:8545 con Chain ID 31337...
ℹ Anvil iniciado con PID: 12345
ℹ Logs: ./logs/anvil.log
✓ Anvil iniciado correctamente
ℹ Cuenta deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
ℹ Balance inicial: 10,000 ETH

═══════════════════════════════════════════════════════════
  PASO 2: Desplegar Smart Contract
═══════════════════════════════════════════════════════════

➜ Desplegando SupplyChain.sol en Anvil...
✓ Contrato desplegado exitosamente
ℹ Dirección: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ℹ Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

═══════════════════════════════════════════════════════════
  PASO 3: Actualizar Configuración del Frontend
═══════════════════════════════════════════════════════════

➜ Actualizando config.ts con dirección...
ℹ Backup creado: config.ts.backup
✓ Configuración actualizada correctamente

═══════════════════════════════════════════════════════════
  PASO 4: Iniciar Frontend (Next.js)
═══════════════════════════════════════════════════════════

➜ Iniciando servidor Next.js en puerto 3000...
ℹ Frontend iniciado con PID: 12346
✓ Frontend iniciado correctamente
ℹ URL: http://localhost:3000

═══════════════════════════════════════════════════════════
  ✅ Deployment Completado
═══════════════════════════════════════════════════════════

Todos los servicios están corriendo correctamente:

  Anvil:    http://127.0.0.1:8545
  Frontend: http://localhost:3000
  Contract: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### **Verificar Estado**:

```bash
./deploy.sh status
```

**Salida esperada**:
```
═══════════════════════════════════════════════════════════
  Estado de Servicios
═══════════════════════════════════════════════════════════

Anvil (Blockchain Local):
✓ CORRIENDO (PID: 12345, Puerto: 8545)
ℹ RPC URL: http://127.0.0.1:8545
ℹ Chain ID: 31337

Frontend (Next.js):
✓ CORRIENDO (PID: 12346, Puerto: 3000)
ℹ URL: http://localhost:3000

Smart Contract:
ℹ Dirección: 0x5FbDB2315678afecb367f032d93F642f64180aa3
ℹ Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Logs:
ℹ Anvil: ./logs/anvil.log
ℹ Frontend: ./logs/frontend.log
ℹ Deploy: ./logs/deploy.log
```

### **Configurar MetaMask**:

```bash
./deploy.sh metamask
```

**Salida esperada** (instrucciones paso a paso):
```
═══════════════════════════════════════════════════════════
  Configuración de MetaMask
═══════════════════════════════════════════════════════════

📝 INSTRUCCIONES PARA CONFIGURAR METAMASK

1. Agregar Red Anvil Local:
   • Abrir MetaMask → Selector de red (arriba izquierda)
   • Clic en 'Add network' → 'Add a network manually'
   • Completar los siguientes datos:

     Network Name:     Anvil Local
     RPC URL:          http://127.0.0.1:8545
     Chain ID:         31337
     Currency Symbol:  ETH

   • Clic en 'Save'

2. Importar Cuenta de Anvil (Owner):
   • Abrir MetaMask → Icono de cuenta (arriba derecha)
   • Clic en 'Import Account'
   • Seleccionar 'Private Key'
   • Pegar el siguiente private key:

     0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

   • Clic en 'Import'

   ⚠ IMPORTANTE: Este private key es SOLO para desarrollo local.
   NUNCA usar en mainnet o con fondos reales.

3. Verificar Configuración:
   • La cuenta importada debe tener dirección: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   • El balance debe ser ~10,000 ETH
   • La red debe estar en 'Anvil Local'

4. Conectar a la DApp:
   • Abrir http://localhost:3000
   • Clic en 'Conectar MetaMask'
   • Autorizar la conexión en MetaMask
   • ¡Listo! Deberías ver tu dirección y las estadísticas del contrato

5. Cuentas Adicionales (Opcional):
   Para probar transferencias entre usuarios:

   Cuenta #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

   Cuenta #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
   Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

### **Detener Servicios**:

```bash
./deploy.sh stop
```

**Salida esperada**:
```
═══════════════════════════════════════════════════════════
  Deteniendo Servicios
═══════════════════════════════════════════════════════════

➜ Deteniendo Frontend (PID: 12346)...
✓ Frontend detenido
➜ Deteniendo Anvil (PID: 12345)...
✓ Anvil detenido
✓ Se detuvieron 2 servicio(s)
```

### **Estructura de Logs**:

```
logs/
├── anvil.log          # Output completo de Anvil
├── anvil.pid          # PID del proceso Anvil
├── frontend.log       # Output de Next.js
├── frontend.pid       # PID del proceso Next.js
├── deploy.log         # Output del deployment Foundry
└── contract_address.txt  # Dirección del contrato deployado
```

### **Troubleshooting del Script**:

#### Error: "Puerto ya en uso"
```bash
# Ver qué proceso está usando el puerto
lsof -i :8545  # Para Anvil
lsof -i :3000  # Para Frontend

# Detener con el script
./deploy.sh stop
```

#### Error: "No se pudo desplegar el contrato"
```bash
# Ver logs del deployment
cat logs/deploy.log

# Verificar que Anvil esté corriendo
./deploy.sh status

# Reintentar
./deploy.sh restart
```

#### Error: "Frontend no inicia"
```bash
# Ver logs del frontend
cat logs/frontend.log

# Verificar dependencias
cd web && npm install

# Reintentar
cd .. && ./deploy.sh restart
```

---

### 🎯 **Próximo paso inmediato (AUTOMATIZADO)**:

```bash
# TODO el proceso en UN SOLO COMANDO:
./deploy.sh start

# Luego configurar MetaMask siguiendo:
./deploy.sh metamask
```

### 🎯 **Flujo Manual (Alternativo)**:

## 📝 Uso

### Iniciar desarrollo

```bash
# Terminal 1: Iniciar Anvil
cd ../sc
anvil --chain-id 31337

# Terminal 2: Deploy contrato (actualizar dirección en config.ts)
forge script script/Deploy.s.sol:DeploySupplyChain --rpc-url http://localhost:8545 --broadcast

# Terminal 3: Iniciar frontend
cd web
npm run dev
```

Abrir: http://localhost:3000

### Conectar MetaMask

1. Agregar red custom:
   - Network Name: Anvil Local
   - RPC URL: http://127.0.0.1:8545
   - Chain ID: 31337
   - Currency Symbol: ETH

2. Importar cuenta de Anvil (copiar private key del terminal de Anvil)

3. Hacer clic en "Conectar MetaMask" en la DApp

## 📁 Estructura

```
src/
├── app/
│   ├── layout.tsx          # Providers Web3 (WagmiProvider, QueryClient)
│   └── page.tsx            # Landing: stats + ConnectWallet
├── components/
│   ├── ui/                 # Shadcn components (button, card, etc.)
│   └── ConnectWallet.tsx   # Botón conexión wallet
├── contracts/
│   ├── config.ts           # Dirección + ABI + enums
│   └── SupplyChain.json    # ABI completo (934 lines contract)
├── hooks/
│   ├── useContractReads.ts # Hooks lectura (getUserInfo, totals)
│   ├── useRequestRole.ts   # Solicitar rol de usuario
│   ├── useCreateToken.ts   # Crear token
│   └── useTransfer.ts      # Transferencias (transfer, accept, reject, cancel)
└── lib/
    ├── utils.ts            # cn() helper de Shadcn
    └── wagmi-config.ts     # Config Anvil + injected connector
```

## 🔐 Seguridad

⚠️ **IMPORTANTE - DESARROLLO ÚNICAMENTE**:
- NO exponer private keys en código
- NO commitear `.env` con claves privadas
- Este setup es para Anvil local, NO para mainnet
- Antes de producción: auditoría + variables de entorno

## 🐛 Troubleshooting

### Error: "Chain mismatch"
```bash
# Verificar Chain ID en MetaMask = 31337
# Reiniciar Anvil si es necesario
anvil --chain-id 31337
```

### Error: "Contract not deployed"
```bash
# Verificar dirección en src/contracts/config.ts
# Redesplegar si es necesario
cd ../sc
forge script script/Deploy.s.sol:DeploySupplyChain --rpc-url http://localhost:8545 --broadcast
# Copiar nueva dirección a config.ts: SUPPLY_CHAIN_ADDRESS
```

### Error: "Insufficient funds"
```bash
# Verificar balance en MetaMask
# Importar cuenta de Anvil con fondos (10,000 ETH por defecto)
```

### Warnings de React 19
- Algunos paquetes (valtio) esperan React 18
- Next.js 16 soporta React 19 oficialmente
- Warnings no afectan funcionalidad

## 📊 Timeline (ACADEMIC_ASSESSMENT.md)

### ✅ Semana 1 - Día 1 (Nov 18, 2025)
- [x] npm install (wagmi, viem, ethers, rainbowkit, shadcn)
- [x] Configurar wagmi-config.ts (Anvil local)
- [x] Copiar ABI del smart contract
- [x] Crear contracts/config.ts (dirección + enums)
- [x] Actualizar layout.tsx (WagmiProvider + QueryClientProvider)
- [x] Componente ConnectWallet.tsx
- [x] Hooks personalizados (useContractReads, useRequestRole, useCreateToken, useTransfer)
- [x] Landing page con stats en tiempo real

### 🔄 Semana 1 - Días 2-7 (Nov 19-24)
- [x] Dashboard de usuario (perfil, rol, tokens propios) ✅ Día 4
- [x] Panel admin (aprobar/rechazar usuarios) ✅ Día 3
- [x] Sistema de pausabilidad completo ✅ Día 4
- [x] ErrorBoundary global ✅ Día 4
- [x] Validación completa de datos ✅ Día 4
- [x] Performance optimizada (batch reads) ✅ Día 4
- [x] Tests Frontend (Vitest + Playwright) ✅ Día 4
- [x] Accesibilidad (ARIA, WCAG AA) ✅ Día 4
- [x] Animaciones (transiciones suaves) ✅ Día 4
- [ ] Formulario crear token + validaciones
- [ ] Tabla de tokens con filtros
- [ ] UI transferencias (solicitar, listar, acciones)
- [ ] Responsive design mobile (parcialmente implementado)
- [ ] Loading states y error handling (parcialmente implementado)

### 🔄 Semana 2 (Nov 25-28)
- [ ] E2E testing con Anvil (Nov 25)
- [ ] Documentación IA.md (Nov 25-26)
- [ ] Video demo 5 min (Nov 27)
- [ ] Entrega final (Nov 28)

## 📚 Recursos

- [Next.js 16 Docs](https://nextjs.org/docs)
- [wagmi Documentation](https://wagmi.sh)
- [viem Documentation](https://viem.sh)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

## 👨‍💻 Autor

Proyecto académico PFM/TFM - Supply Chain Tracker  
**Smart Contract**: SupplyChain.sol (971 lines, 80 tests passing, 83.33% lines, 64.41% branches)  
**Blockchain**: Ethereum Local (Anvil)  
**Frontend**: 5/9 páginas implementadas (56%) | Diseño Moderno 2025 aplicado  
**Fecha límite**: 28 de noviembre, 2025  
**Última actualización**: 21 de Noviembre, 2025 - Día 6

---

**Nota**: README del setup original de Next.js disponible en `README.nextjs.md`
