# 🎨 Frontend - Documentación Completa

> **📋 Para el estado más actualizado del proyecto, consulta [STATUS.md](../../STATUS.md)**

Documentación completa del frontend del proyecto Supply Chain Tracker, desarrollado con Next.js 16, React 19, TypeScript, wagmi, viem y Shadcn UI.

**Última actualización**: 27 de Noviembre, 2025

---

## 📋 Índice

1. [Setup y Configuración](#setup-y-configuración)
2. [Arquitectura Web3](#arquitectura-web3)
3. [Componentes](#componentes)
4. [Custom Hooks](#custom-hooks)
5. [Páginas y Navegación](#páginas-y-navegación)
6. [Sistema de Pausabilidad](#sistema-de-pausabilidad)
7. [Sincronización Multi-Pestaña](#sincronización-multi-pestaña)
8. [Permisos de Transferencia](#permisos-de-transferencia)
9. [Guía de Testing](#guía-de-testing)

---

## 🚀 Setup y Configuración

### Tecnologías

- **Framework**: Next.js 16.0.1 con App Router
- **UI**: React 19.2.0, TypeScript 5.x
- **Estilos**: Tailwind CSS 3.4.14 + Shadcn UI
- **Web3 Stack**:
  - wagmi 2.12.0 (React Hooks para Ethereum)
  - viem 2.21.0 (TypeScript Ethereum library)
  - ethers 6.13.0 (Ethereum interactions)
  - @tanstack/react-query 5.x (Data fetching/caching)
- **Blockchain Local**: Anvil (localhost:8545, Chain ID: 31337)

### Setup Completo - Paso a Paso

#### **PASO 0**: Ubicación inicial
```bash
cd /mnt/backups/emujicad/Documents/master_blockchainweb3/web3/PFM/emujicad
```

#### **PASO 1**: Crear proyecto Next.js
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

#### **PASO 2**: Agregar dependencias Web3
```bash
cd web
npm pkg set dependencies.ethers="^6.13.0"
npm pkg set dependencies.viem="^2.21.0"
npm pkg set dependencies.wagmi="^2.12.0"
npm pkg set dependencies."@rainbow-me/rainbowkit"="^2.1.0"
npm install
```

#### **PASO 3**: Configurar Shadcn UI
```bash
npx shadcn@latest add button card label select input table badge dialog alert -y
```

#### **PASO 4**: Copiar ABI del Smart Contract
```bash
cp ../sc/out/SupplyChain.sol/SupplyChain.json src/contracts/
```

#### **PASO 5**: Crear estructura de directorios
```bash
mkdir -p src/contracts src/hooks src/lib
```

### Configuración Principal

#### `lib/wagmi-config.ts`
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
  multiInjectedProviderDiscovery: false, // Prevenir múltiples solicitudes de conexión
  ssr: false, // Deshabilitar SSR para evitar problemas de hidratación
})
```

**Notas Importantes de Configuración**:
- `multiInjectedProviderDiscovery: false`: Previene que wagmi haga múltiples solicitudes de conexión cuando se detectan múltiples proveedores inyectados
- `ssr: false`: Deshabilita el renderizado del lado del servidor para wagmi para prevenir problemas de hidratación en Next.js

#### `contracts/config.ts`
```typescript
import SupplyChainArtifact from './SupplyChain.json'

export const SUPPLY_CHAIN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`
export const SUPPLY_CHAIN_ABI = SupplyChainArtifact.abi

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

export enum TokenType {
  RawMaterial = 0,
  FinishedProduct = 1
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Canceled = 3
}
```

#### `app/layout.tsx`
```typescript
'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from '@/lib/wagmi-config'
import { AuthProvider } from '@/contexts/AuthContext'

const queryClient = new QueryClient()

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

### Deployment Automatizado

El script `deploy.sh` maneja todo el ciclo de vida del proyecto:

```bash
# Iniciar todo el stack
./deploy.sh start

# Ver estado de servicios
./deploy.sh status

# Ver instrucciones de MetaMask
./deploy.sh metamask

# Detener todo
./deploy.sh stop
```

---

## 🔗 Arquitectura Web3

### Stack Web3 Implementado

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

### AuthContext

Contexto global para manejar autenticación y autorización:

**Ubicación**: `web/src/contexts/AuthContext.tsx`

**Características**:
- Detecta si el usuario es administrador
- Detecta si el usuario está aprobado
- Detecta si el usuario está autenticado
- Optimización con `useUserIdByAddress` para detección rápida
- Redirección inmediata para usuarios no registrados
- Restauración de preferencia de tema al autenticar

**Uso**:
```typescript
import { useAuth } from '@/contexts/AuthContext'

function Component() {
  const { isAdmin, isApproved, isAuthenticated, userInfo, isLoading } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please connect your wallet</div>
  if (isAdmin) return <AdminPanel />
  if (isApproved) return <UserDashboard />
  return <PendingApproval />
}
```

### Hooks de wagmi Utilizados

#### Hooks de Conexión
- `useAccount()` - Información de la cuenta conectada
- `useConnect()` - Maneja la conexión con MetaMask
- `useDisconnect()` - Maneja la desconexión

#### Hooks de Lectura
- `useReadContract()` - Lee datos del contrato (view/pure functions)
- `useReadContracts()` - Lee múltiples funciones en paralelo

#### Hooks de Escritura
- `useWriteContract()` - Ejecuta transacciones
- `useWaitForTransactionReceipt()` - Espera confirmación de transacción

### Patrón Completo: Write + Wait

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

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

## 🎨 Componentes

### Componentes Personalizados (26 totales)

#### 1. ConnectWallet.tsx
Componente para conexión/desconexión con MetaMask.

**Características**:
- Conexión con MetaMask usando wagmi
- Muestra dirección acortada (0x1234...5678)
- Botón de desconexión
- Estados de carga (connecting, isPending)
- Previene doble popup de MetaMask

#### 2. Header.tsx
Componente unificado de navegación y branding.

**Características**:
- Layout de dos filas: (1) Branding + Acciones, (2) Dirección + Rol/Estado
- Branding: "📦 Supply Chain Tracker"
- Botones condicionales según página
- Información de usuario (dirección, rol, estado)
- Theme toggle integrado
- Badge de estado de pausa del contrato

#### 3. ThemeToggle.tsx
Toggle para cambiar entre modo claro y oscuro.

**Características**:
- Estado persistente en localStorage
- Default: modo claro
- Iconos: 🌙 (light mode) / ☀️ (dark mode)
- Transiciones suaves

#### 4. RegisterForm.tsx
Formulario de registro de usuarios con selección de rol.

**Características**:
- Select con 4 roles: Producer, Factory, Retailer, Consumer
- Validación de rol seleccionado
- Manejo de errores específicos
- Estados de carga
- Validación cuando el contrato está pausado

#### 5. ChangeRoleDialog.tsx
Diálogo modal para cambiar el rol de un usuario.

**Características**:
- Dialog con select de 4 roles
- Validación de nuevo rol
- Confirmación antes de cambiar
- Estados de carga
- Validación de pausa y estados de usuario

#### 6. UserManagementTable.tsx (Admin)
Componente completo de gestión de usuarios.

**Características**:
- Integración de UserStatsCards
- Tabla con todos los usuarios
- Filtros por estado: All, Pending, Approved, Rejected, Canceled
- Búsqueda por dirección
- Acciones por usuario (Aprobar, Rechazar, Cancelar, Cambiar Rol)
- Auto-refresh después de cambios

#### 7. UserStatsCards.tsx (Admin)
Cards con estadísticas del sistema.

**Características**:
- 5 cards con contadores (Total, Pending, Approved, Rejected, Canceled)
- Grid responsive
- Iconos visuales
- Dark mode compatible

#### 8. TokenCard.tsx
Componente reutilizable para mostrar información de un token.

**Características**:
- Muestra información completa del token
- Soporte para mostrar balance del usuario
- Iconos diferentes para Raw Material vs Finished Product
- Badge con ID del token
- Muestra parent token si es un producto derivado
- Estados de carga con Skeleton
- Hover effects

#### 9. TokenCardModern.tsx
Versión moderna del TokenCard con diseño 2025.

**Características**:
- Glassmorphism con `backdrop-blur-xl`
- Gradientes azul-púrpura
- Animaciones suaves
- Misma funcionalidad que TokenCard

#### 10. UserProfileCard.tsx
Componente para mostrar el perfil del usuario conectado.

**Características**:
- Muestra User ID, Address, Role y Status
- Badges de estado con iconos
- Colores por rol
- Mensajes informativos según estado
- Estados de carga con Skeleton

#### 11. QuickActions.tsx
Componente con botones de acciones rápidas.

**Características**:
- Botones condicionales según rol
- Validación de estado (solo usuarios aprobados)
- Deshabilitación cuando el contrato está pausado
- Alert informativo cuando está pausado

#### 12. PauseControl.tsx (Admin)
Componente para que el administrador pause/reanude el contrato.

**Características**:
- Muestra estado actual del contrato
- Botón para pausar con confirmación (requiere escribir "PAUSAR")
- Botón para reanudar con confirmación
- Alert con lista de funciones deshabilitadas cuando está pausado
- Estados de carga durante transacciones

#### 13. TransferList.tsx
Lista de transferencias con separación sent/received y filtros.

**Características**:
- Separación de transferencias enviadas/recibidas
- Filtros dinámicos por rol
- Token Name mostrado junto al Token ID
- Botones de acción (Accept/Reject/Cancel)
- Direcciones clickeables con AddressDisplay
- Estados: Pending, Accepted, Rejected

#### 14. CreateTransferForm.tsx
Formulario para crear nuevas transferencias.

**Características**:
- Dropdown de destinatarios filtrado por rol
- Dropdown de tokens mostrando nombre
- Validación de cantidad
- Validación de pausa del contrato
- Mensajes de éxito amigables

#### 15. UserTokenList.tsx
Lista de tokens del usuario.

**Características**:
- Muestra tokens con balance > 0
- Filtrado por tipo de token según rol
- Integración con TokenCard/TokenCardModern
- Loading states y empty states

#### 16. AddressDisplay.tsx
Componente reutilizable para mostrar direcciones.

**Características**:
- Dirección truncada (0x1234...5678)
- Botón de copiar al portapapeles
- Tooltip con dirección completa
- Indicador visual de copia exitosa

#### 17. TraceabilityTimeline.tsx
Trazabilidad end-to-end con árbol interactivo.

### Componentes Shadcn UI (10 totales)

Todos ubicados en `web/src/components/ui/`:
- `button.tsx` - Botones con variantes
- `card.tsx` - Contenedor con header, contenido y footer
- `input.tsx` - Campo de entrada de texto
- `label.tsx` - Etiqueta para formularios
- `select.tsx` - Selector dropdown
- `table.tsx` - Tabla con header, body, footer
- `badge.tsx` - Badge/etiqueta para estados
- `dialog.tsx` - Modal/diálogo
- `alert.tsx` - Alertas/notificaciones
- `skeleton.tsx` - Placeholder de carga animado

---

## 🪝 Custom Hooks

### Hooks Implementados (27 totales)

#### Archivo: `useContractReads.ts` (7 hooks de lectura)

1. **useUserInfo(address)** - Obtiene información completa de un usuario
2. **useIsAdmin(address)** - Verifica si una address es el admin
3. **useTotalTokens()** - Obtiene el total de tokens creados
4. **useTotalUsers()** - Obtiene el total de usuarios registrados
5. **useTotalTransfers()** - Obtiene el total de transferencias
6. **useDashboardStats()** - Hook optimizado batch para estadísticas
7. **useUserIdByAddress(address?)** - Obtiene rápidamente el User ID

#### Archivo: `useRequestRole.ts` (1 hook de escritura)

8. **useRequestRole()** - Hook para solicitar un rol de usuario

#### Archivo: `useCreateToken.ts` (1 hook de escritura)

9. **useCreateToken()** - Hook para crear un nuevo token

#### Archivo: `useTransfer.ts` (4 hooks de escritura)

10. **useTransfer()** - Hook para iniciar una transferencia
11. **useAcceptTransfer()** - Hook para aceptar una transferencia
12. **useRejectTransfer()** - Hook para rechazar una transferencia
13. **useCancelTransfer()** - Hook para cancelar una transferencia

#### Archivo: `useGetUserTokens.ts` (4 hooks de lectura)

14. **useGetUserTokens(address?)** - Obtiene todos los token IDs que posee un usuario
15. **useGetToken(tokenId?)** - Obtiene información detallada de un token
16. **useGetTokenBalance(tokenId?, address?)** - Obtiene el balance de un token
17. **useGetAllTokens()** - Obtiene todos los tokens del sistema

#### Archivo: `usePause.ts` (3 hooks)

18. **useIsPaused()** - Lee el estado de pausa del contrato
19. **usePause()** - Hook para pausar el contrato (solo admin)
20. **useUnpause()** - Hook para reanudar el contrato (solo admin)

#### Archivo: `useAdminUsers.ts` (2 hooks admin)

21. **useGetAllUsers()** - Obtiene todos los usuarios registrados (solo admin)
22. **useChangeUserStatus()** - Hook para cambiar el estado de un usuario

#### Archivo: `useContractOwner.ts` (1 hook)

23. **useContractOwner()** - Verifica si el usuario conectado es el owner

#### Archivo: `usePendingOwner.ts` (1 hook)

24. **usePendingOwner(enabled?)** - Obtiene la dirección del `pendingOwner`

#### Archivo: `useOwnershipTransfer.ts` (1 hook con 3 funciones)

25. **useOwnershipTransfer()** - Hook para gestionar la transferencia de ownership
   - `initiateOwnershipTransfer(newOwner)`
   - `acceptOwnershipTransfer()`
   - `rejectOwnershipTransfer()`

#### Archivo: `useGetUserTransfers.ts` (1 hook)

26. **useGetUserTransfers(address)** - Obtiene todas las transferencias de un usuario

#### Archivo: `useUserTokenStats.ts` (1 hook)

27. **useUserTokenStats()** - Obtiene estadísticas de tokens por tipo

### Resumen de Hooks por Archivo

| Archivo | Hooks | Tipo | Estado |
|---------|-------|------|--------|
| useContractReads.ts | 7 | Lectura | ✅ |
| useRequestRole.ts | 1 | Escritura | ✅ |
| useCreateToken.ts | 1 | Escritura | ✅ |
| useTransfer.ts | 4 | Escritura | ✅ |
| useAdminUsers.ts | 2 | Lectura + Escritura | ✅ |
| useContractOwner.ts | 1 | Lectura | ✅ |
| useGetUserTokens.ts | 4 | Lectura | ✅ |
| usePause.ts | 3 | Lectura + Escritura | ✅ |
| useUserTokenStats.ts | 1 | Lectura | ✅ |
| useGetUserTokensWithData.ts | 1 | Lectura | ✅ |
| useGetUserTransfers.ts | 1 | Lectura | ✅ |
| usePendingOwner.ts | 1 | Lectura | ✅ |
| useOwnershipTransfer.ts | 1 | Escritura | ✅ |
| **TOTAL** | **27** | **17 lectura + 10 escritura** | **100%** |

---

## 📄 Páginas y Navegación

### Resumen Ejecutivo

**Estado**: ✅ Todas las páginas están completadas (9/9 - 100%)

### Páginas Implementadas

1. **`/` (Home)** - Landing page con registro
2. **`/dashboard`** - Dashboard de usuario/admin
3. **`/admin/users`** - Gestión de usuarios (admin)
4. **`/tokens`** - Lista de tokens
5. **`/tokens/[id]`** - Detalles del token con trazabilidad end-to-end
6. **`/tokens/[id]/transfer`** - Formulario de transferencia desde detalles
7. **`/transfers`** - Lista de transferencias
8. **`/transfers/[id]`** - Detalles de transferencia
9. **`/tokens/create`** - Creación de tokens

---

### Página de Detalles del Token (`/tokens/[id]`)

#### 🎯 Propósito
Mostrar información completa y detallada de un token específico, incluyendo su historial de transferencias y trazabilidad completa.

#### 📋 Secciones Implementadas

**1. Información Principal del Token**
- Header con nombre del token (grande y destacado)
- Badge del tipo: Raw Material / Finished Product
- Token ID, Total Supply, Mi Balance
- Fecha de creación, Creator (con AddressDisplay)
- Parent Token (si es Finished Product): ID, nombre y link al token padre
- Features: Metadatos JSON parseados y mostrados de forma legible

**2. Trazabilidad Completa** (Solo para Finished Product)
- Árbol de trazabilidad con visualización jerárquica
- Historial de transformación: Mostrar cómo se creó este producto desde la materia prima
- Información del parent token: Link para ver detalles del token padre
- Características especiales:
  - ✅ Visualización de árbol con expand/collapse
  - ✅ Filtrado por dirección en el árbol
  - ✅ Resaltado de nodos según el rol del usuario actual
  - ✅ Hook `useTokenTraceability` para trazabilidad end-to-end completa

**3. Historial de Transferencias**
- Tabla de transferencias relacionadas con este token
- Filtros: Por estado (All, Pending, Accepted, Rejected, Cancelled) y por dirección (From/To)
- Estadísticas: Total de transferencias, aceptadas, pendientes, total de tokens transferidos

**4. Distribución de Tokens**
- Lista de usuarios con balance de este token
- Porcentaje del total supply por usuario

**5. Acciones**
- Botón "Transfer Tokens": Link a `/tokens/[id]/transfer`
- Botón "Back to Tokens": Volver a `/tokens`
- Botón "View Parent Token": Si tiene parent, ver detalles del token padre

#### 📊 Hooks Utilizados
- ✅ `useGetToken(tokenId)` - Información del token
- ✅ `useGetTokenBalance(tokenId, address)` - Balance del usuario
- ✅ `useGetAllTransfers()` - Todas las transferencias (filtrar por tokenId)
- ✅ `useGetToken(parentTokenId)` - Información del token padre (si aplica)
- ✅ `useTokenTraceability(tokenId)` - Trazabilidad end-to-end con árbol jerárquico

---

### Página de Transferencia desde Detalles (`/tokens/[id]/transfer`)

#### 🎯 Propósito
Formulario de transferencia pre-rellenado con el token seleccionado, permitiendo transferir directamente desde la página de detalles.

#### 📋 Secciones Implementadas

**1. Información del Token a Transferir**
- Card con resumen del token (nombre, ID, tipo, balance disponible, total supply)
- Link "Ver detalles completos" → `/tokens/[id]`

**2. Formulario de Transferencia**
- Token ID: Pre-seleccionado y bloqueado (no editable)
- Token Name: Mostrado para referencia (solo lectura)
- Amount: Campo editable con validaciones:
  - No puede ser 0
  - No puede ser negativo
  - No puede exceder el balance disponible
  - Mostrar: "Balance disponible: X tokens"
- Recipient: Dropdown con usuarios disponibles según rol (filtrado automático):
  - Producer → Solo Factory aprobados
  - Factory → Solo Retailer aprobados
  - Retailer → Solo Consumer aprobados
  - Consumer → No puede transferir (mostrar mensaje)

**3. Resumen de la Transferencia**
- Token: Nombre e ID
- Cantidad: X tokens
- Destinatario: Dirección y rol
- Balance después: "Tu balance será: X tokens"

**4. Acciones**
- Botón "Transfer": Enviar transferencia
- Botón "Cancel": Volver a `/tokens/[id]`
- Botón "Back to Details": Volver a `/tokens/[id]`

#### ⚠️ Validaciones Especiales
- Verificar que el usuario tiene balance suficiente
- Verificar que el contrato no está pausado
- Verificar que el usuario está aprobado
- Verificar que el destinatario es válido según el rol

#### 📊 Hooks Utilizados
- ✅ `useGetToken(tokenId)` - Información del token
- ✅ `useGetTokenBalance(tokenId, address)` - Balance del usuario
- ✅ `useGetAllUsers()` - Usuarios disponibles según rol (filtrado en el componente)
- ✅ `useTransfer()` - Hook para crear transferencia
- ✅ `useIsPaused()` - Verificar si el contrato está pausado

---

### Guía de Navegación

#### Flujo de Navegación Completo

```
/tokens (lista de tokens)
  └── Click en token card
      └── /tokens/[id] (detalles)
          ├── Click "Transfer Tokens"
          │   └── /tokens/[id]/transfer (formulario)
          │       ├── Submit → Crear transferencia → Redirección a /tokens/[id]
          │       └── Cancel/Back → Volver a /tokens/[id]
          └── Click "View Parent Token" (si aplica)
              └── /tokens/[parentId] (detalles del parent)
```

#### Paso a Paso

**Paso 1: Ir a la Lista de Tokens**
1. **Desde el Header**: Click en "My Tokens" en la barra superior
2. **Desde el Dashboard**: Click en "My Tokens" en el dashboard
3. **URL directa**: `http://localhost:3000/tokens`

**Paso 2: Ver Detalles de un Token**
- **Opción A**: Click en cualquier tarjeta de token en `/tokens`
- **Opción B**: URL directa: `http://localhost:3000/tokens/1`

**Paso 3: Transferir Tokens desde Detalles**
- Desde `/tokens/[id]`, click en botón "Transfer Tokens" (arriba a la derecha)
- Serás redirigido a `/tokens/[id]/transfer`

**Paso 4: Volver Atrás**
- Desde detalles: Botón "Back to Tokens" → Vuelve a `/tokens`
- Desde transferencia: Botón "Cancel" o "Back to Token Details" → Vuelve a `/tokens/[id]`

#### Indicadores Visuales

**En la Página `/tokens`**:
- ✅ **Hover effect**: Al pasar el mouse, las tarjetas se elevan ligeramente
- ✅ **Cursor pointer**: El cursor cambia a "mano" al pasar sobre ellas
- ✅ **Sombra aumentada**: Al hacer hover, la sombra se hace más grande
- ✅ **Toda la tarjeta es clickeable**: No solo el título, toda la tarjeta

**En la Página de Detalles (`/tokens/[id]`)**:
- ✅ Botón "Transfer Tokens" visible si tienes balance > 0 y puedes transferir
- ✅ Sección de Trazabilidad End-to-End visible solo para Finished Products con parent token
- ✅ Historial de Transferencias siempre visible (puede estar vacío)

#### Problemas Comunes y Soluciones

**Problema 1: "No veo el botón Transfer Tokens"**
- Verifica tu balance en la página de detalles
- Si eres Consumer, solo puedes recibir transferencias
- Si el contrato está pausado, espera a que se reactive
- Verifica tu estado de usuario en el dashboard

**Problema 2: "No puedo hacer clic en las tarjetas"**
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Recarga la página (Ctrl+R o Cmd+R)

**Problema 3: "La página de detalles no carga"**
- Verifica que el token ID sea correcto
- Asegúrate de que el contrato esté desplegado (`./deploy.sh status`)
- Verifica que MetaMask esté conectado
- Verifica que Anvil esté corriendo (`./deploy.sh status`)

> **📚 Para más detalles sobre navegación y troubleshooting, consulta [docs/RESEARCH.md](./RESEARCH.md#guía-de-navegación)**

---

## ⏸️ Sistema de Pausabilidad

### Estado del Contrato

El contrato puede estar en dos estados:
- **Activo**: Todas las funciones están disponibles
- **Pausado**: Funciones críticas deshabilitadas

### Funciones Afectadas cuando está Pausado

Cuando el contrato está pausado, se deshabilitan:
1. Solicitud de roles (`requestRole`)
2. Cambio de roles (`changeRole`)
3. Creación de tokens (`createToken`)
4. Transferencias (`transfer`)
5. Aceptar transferencias (`acceptTransfer`)
6. Rechazar transferencias (`rejectTransfer`)
7. Cancelar transferencias (`cancelTransfer`)
8. Cambio de estado de usuarios

### Hooks

#### `useIsPaused()`
Hook para leer el estado de pausa del contrato.

```typescript
import { useIsPaused } from '@/hooks/usePause'

function Component() {
  const { data: isPaused, isLoading } = useIsPaused()
  // isPaused = true | false | undefined
  // Auto-refresh cada 5 segundos
}
```

#### `usePause()` y `useUnpause()`
Hooks para pausar/reanudar el contrato (solo admin).

### Componente PauseControl.tsx

Componente principal para que el administrador controle el estado de pausa.

**Características**:
- Muestra estado actual (Pausado/Activo) con colores visuales
- Botón para pausar con confirmación (requiere escribir "PAUSAR")
- Botón para reanudar con confirmación
- Dialogs de confirmación para ambas acciones
- Alert con lista de funciones deshabilitadas cuando está pausado

### Integración en Componentes

Todos los componentes que realizan acciones críticas verifican el estado de pausa:
- `Header.tsx` - Muestra badge visual cuando está pausado
- `RegisterForm.tsx` - Oculta formulario y muestra alert
- `ChangeRoleDialog.tsx` - Valida estado de pausa
- `QuickActions.tsx` - Deshabilita botones
- `UserManagementTable.tsx` - Deshabilita acciones
- `Dashboard Page` - Deshabilita botón "Create Token"

---

## 🔄 Sincronización Multi-Pestaña

### Estado Actual

**Implementado (Día 2 - Versión Simplificada)**:
- ✅ Sincronización de desconexiones entre pestañas
- ✅ Persistencia de última dirección conectada en localStorage
- ✅ Detección de cambios de cuenta en MetaMask
- ✅ Prevención de auto-conexión (fuerza conexión manual)

**POSTPONED**:
- ⏸️ Reconexión automática cuando otra pestaña se conecta (causaba race conditions)
- ⏸️ Sincronización completa de estado entre pestañas

### Tecnologías Utilizadas

1. **localStorage**: Para persistir la sesión entre pestañas
2. **StorageEvent API**: Para detectar cambios en localStorage desde otras pestañas
3. **MetaMask Events**: Para detectar cambios de cuenta/desconexión desde la wallet

### Flujos de Sincronización

#### 1. Desconexión en Pestaña B
```
Pestaña B: Usuario desconecta → localStorage limpiado
    ↓
Pestaña A: Detecta cambio → Se desconecta automáticamente
Pestaña C: Detecta cambio → Se desconecta automáticamente
```

#### 2. Cambio de Cuenta en MetaMask
```
MetaMask: Usuario cambia cuenta → Evento accountsChanged
    ↓
Todas las pestañas: Detectan cambio → Actualizan localStorage
```

### Claves de Storage

```typescript
const STORAGE_KEY = 'lastConnectedAddress'
const SESSION_STORAGE_KEY = 'wallet_connection_session'
```

### Prevención de Auto-Conexión

**Problema**: Por defecto, wagmi se reconecta automáticamente a MetaMask cuando la aplicación carga, incluso si el usuario no ha hecho clic explícitamente en "Conectar Wallet". Esto hace que la aplicación muestre el dashboard en lugar de la landing page.

**Solución**: El componente `Web3Context` incluye lógica para prevenir auto-conexiones no deseadas:

```typescript
// En Web3Context.tsx
useEffect(() => {
  if (typeof window === 'undefined') return

  const checkAutoConnect = setTimeout(() => {
    const stored = localStorage.getItem('lastConnectedAddress')
    
    // Si no hay conexión guardada Y está conectado, es un auto-connect no deseado
    if (!stored && isConnected) {
      console.log('🚫 Auto-connect detectado sin conexión guardada, desconectando...')
      disconnect()
      localStorage.removeItem('lastConnectedAddress')
    }
  }, 200) // Dar tiempo a wagmi para inicializar

  return () => clearTimeout(checkAutoConnect)
}, [])
```

**Cómo funciona**:
1. Al cargar la aplicación, el efecto espera 200ms para que wagmi inicialice
2. Verifica si hay una conexión guardada en `localStorage` (`lastConnectedAddress`)
3. Si **no hay conexión guardada** pero wagmi reporta `isConnected === true`, es un auto-connect no deseado
4. Se desconecta automáticamente para forzar que el usuario haga clic manualmente en "Conectar Wallet"
5. Solo las conexiones hechas a través de acción explícita del usuario (clic en "Conectar Wallet") se persisten

**Resultado**: La aplicación siempre inicia mostrando la landing page con el botón "Conectar Wallet", asegurando que los usuarios deben conectarse explícitamente antes de acceder al dashboard.

---

## 🔐 Permisos de Transferencia

### Smart Contract Rules

El smart contract define reglas estrictas sobre quién puede enviar y recibir transferencias:

#### Transfer Functions and Their Permissions

1. **`transfer()`** - Create Transfer (SEND)
   - **Who can call**: Producer, Factory, Retailer
   - **Blocked**: Consumer
   - **Creates**: Transfer in `Pending` status

2. **`acceptTransfer()`** - Accept Transfer (RECEIVE)
   - **Who can call**: Factory, Retailer, Consumer
   - **Blocked**: Producer
   - **Condition**: Transfer must be in `Pending` status AND caller must be the recipient

3. **`rejectTransfer()`** - Reject Transfer (RECEIVE)
   - **Who can call**: Factory, Retailer, Consumer
   - **Blocked**: Producer
   - **Condition**: Transfer must be in `Pending` status AND caller must be the recipient

4. **`cancelTransfer()`** - Cancel Own Transfer (SEND)
   - **Who can call**: Producer, Factory, Retailer
   - **Blocked**: Consumer
   - **Condition**: Transfer must be in `Pending` status AND caller must be the sender

### Role Permissions Matrix

| Role | Can Create Tokens | Can SEND Transfers | Can RECEIVE Transfers | Can View Own Tokens |
|------|-------------------|--------------------|-----------------------|---------------------|
| **Producer** | ✅ YES (RowMaterial) | ✅ YES | ❌ NO | ✅ YES |
| **Factory** | ✅ YES (Both types) | ✅ YES | ✅ YES (Accept/Reject) | ✅ YES |
| **Retailer** | ❌ NO | ✅ YES | ✅ YES (Accept/Reject) | ✅ YES |
| **Consumer** | ❌ NO | ❌ NO | ✅ YES (Accept/Reject) | ✅ YES |

### Supply Chain Flow

```
Producer → Factory → Retailer → Consumer
   │          │          │          │
   │          │          │          └─ Only receives
   │          │          └─ Can send & receive
   │          └─ Can send & receive
   └─ Only sends (produces raw materials)
```

### Frontend Implementation

#### CreateTransferForm.tsx
- Valida user role antes de mostrar form
- Consumer ve mensaje informativo en lugar de form
- Solo Producer, Factory, y Retailer pueden acceder al form

#### TransferList.tsx
- Muestra todas las transferencias (sent y received)
- Botones de acción contextuales:
  - **Accept/Reject**: Solo para receiver
  - **Cancel**: Solo para sender
- UI simplificada para Consumer:
  - Estadísticas: Muestra Total, Received, Pending (oculta "Sent")
  - Filtro de dirección: **Oculto completamente**
  - Filtro de estado: Muestra "All", "Pending", "Accepted", "Rejected" (oculta "Cancelled")

---

## 🧪 Guía de Testing

### Checklist de Pruebas

#### 1. Creación de Tokens (`/tokens/create`)

##### 1.1. Crear Raw Material Token (Producer)
- [ ] Conectar wallet como Producer aprobado
- [ ] Navegar a `/tokens/create?type=raw`
- [ ] Verificar que el formulario muestra campos correctos
- [ ] Llenar formulario y crear token
- [ ] Verificar mensaje de éxito y redirección

##### 1.2. Crear Finished Product Token (Factory)
- [ ] Conectar wallet como Factory aprobado
- [ ] Asegurarse de tener balance de un Raw Material token
- [ ] Navegar a `/tokens/create?type=product`
- [ ] Verificar que muestra campo "Parent Token"
- [ ] Seleccionar Parent Token y crear producto
- [ ] Verificar que balance del parent token se redujo

##### 1.3. Validación de Balance Insuficiente
- [ ] Intentar crear Finished Product con balance 0
- [ ] Verificar que campos están deshabilitados
- [ ] Verificar mensaje de balance insuficiente

##### 1.4. Validación de Contrato Pausado
- [ ] Como Admin, pausar el contrato
- [ ] Intentar crear token como Producer/Factory
- [ ] Verificar mensaje de alerta y formulario deshabilitado

#### 2. Visualización de Tokens (`/tokens`)

##### 2.1. Lista de Tokens Propios
- [ ] Conectar wallet con tokens
- [ ] Navegar a `/tokens`
- [ ] Verificar que se muestran SOLO tokens con balance > 0
- [ ] Verificar información mostrada (nombre, tipo, balance, ID)

##### 2.2. Filtros por Tipo (Según Rol)
- [ ] Como Producer: Verificar que NO aparece filtro de tipo
- [ ] Como Factory: Verificar que SÍ aparece filtro de tipo
- [ ] Probar filtros: "All Types", "Raw Material", "Finished Product"

##### 2.3. Búsqueda por Nombre
- [ ] Buscar "plátano" (con acento)
- [ ] Verificar que encuentra tokens con nombre "Plátano"
- [ ] Buscar "banana" (sin acento)
- [ ] Verificar que también encuentra "Plátano" (búsqueda flexible)

##### 2.4. Paginación
- [ ] Crear más de 12 tokens
- [ ] Verificar que se muestran máximo 12 tokens por página
- [ ] Probar controles de paginación

#### 3. Dashboard (`/dashboard`)

##### 3.1. Visualización de Perfil
- [ ] Conectar wallet
- [ ] Navegar a `/dashboard`
- [ ] Verificar UserProfileCard con información correcta

##### 3.2. Estadísticas de Tokens por Tipo
- [ ] Verificar tabla "Token Statistics"
- [ ] Verificar que muestra tipos con balance > 0

##### 3.3. Lista de Tokens Propios
- [ ] Verificar sección "My Tokens"
- [ ] Verificar máximo 6 tokens visibles
- [ ] Verificar botón "View All" redirige a `/tokens`

##### 3.4. Acciones Rápidas
- [ ] Como Producer: Verificar botón "Create Raw Material"
- [ ] Como Factory: Verificar botón "Create Product"
- [ ] Como Retailer/Consumer: Verificar que NO aparecen botones de creación

##### 3.5. Panel de Admin
- [ ] Como Admin, navegar a `/dashboard`
- [ ] Verificar estadísticas globales
- [ ] Verificar Control de pausa (PauseControl)
- [ ] Verificar botón "Manage Users"

#### 4. Validaciones y Edge Cases

##### 4.1. Redirecciones
- [ ] Usuario no conectado intenta acceder a `/tokens` → redirige a `/`
- [ ] Usuario no aprobado intenta acceder a `/tokens` → redirige a `/`
- [ ] Admin intenta acceder a `/tokens` → redirige a `/dashboard`

##### 4.2. Estados de Carga
- [ ] Verificar skeleton loaders durante carga de datos
- [ ] Verificar que no hay flickering al refrescar datos
- [ ] Verificar mensajes de error si falla la carga

##### 4.3. Diseño Moderno
- [ ] Verificar que el diseño moderno está activo (si `NEXT_PUBLIC_MODERN_DESIGN=true`)
- [ ] Verificar glassmorphism en cards
- [ ] Verificar gradientes y animaciones
- [ ] Verificar que funciona en modo claro y oscuro

### Criterios de Éxito

La implementación es exitosa si:
1. ✅ Todas las pruebas pasan
2. ✅ No hay errores en la consola del navegador
3. ✅ La experiencia de usuario es fluida y sin interrupciones
4. ✅ Las validaciones funcionan correctamente
5. ✅ El diseño es responsive y accesible

---

## 📊 Resumen de Archivos

### Estructura Completa

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ✅ Providers configurados
│   │   ├── page.tsx            ✅ Landing con stats
│   │   └── globals.css         ✅ Tailwind base
│   ├── components/
│   │   ├── ui/                 ✅ 10 componentes Shadcn
│   │   ├── ConnectWallet.tsx   ✅ Componente custom
│   │   ├── Header.tsx          ✅ Navegación unificada
│   │   ├── ThemeToggle.tsx     ✅ Toggle de tema
│   │   ├── RegisterForm.tsx    ✅ Formulario registro
│   │   ├── ChangeRoleDialog.tsx ✅ Diálogo cambio rol
│   │   ├── TokenCard.tsx       ✅ Card de token
│   │   ├── TokenCardModern.tsx ✅ Card moderna 2025
│   │   ├── UserProfileCard.tsx  ✅ Perfil usuario
│   │   ├── QuickActions.tsx    ✅ Acciones rápidas
│   │   ├── TransferList.tsx     ✅ Lista transferencias
│   │   ├── CreateTransferForm.tsx ✅ Formulario transferencia
│   │   ├── UserTokenList.tsx     ✅ Lista tokens usuario
│   │   ├── AddressDisplay.tsx    ✅ Display dirección
│   │   ├── TraceabilityTimeline.tsx ✅ Trazabilidad
│   │   └── admin/
│   │       ├── UserManagementTable.tsx ✅ Gestión usuarios
│   │       ├── UserStatsCards.tsx      ✅ Stats usuarios
│   │       └── PauseControl.tsx         ✅ Control pausa
│   ├── contracts/
│   │   ├── config.ts           ✅ Dirección + ABI + Enums
│   │   └── SupplyChain.json   ✅ ABI completo
│   ├── hooks/
│   │   ├── useContractReads.ts ✅ 7 hooks lectura
│   │   ├── useRequestRole.ts   ✅ Hook escritura
│   │   ├── useCreateToken.ts   ✅ Hook escritura
│   │   ├── useTransfer.ts      ✅ 4 hooks escritura
│   │   ├── useGetUserTokens.ts ✅ 4 hooks lectura
│   │   ├── usePause.ts         ✅ 3 hooks pausa
│   │   ├── useAdminUsers.ts    ✅ 2 hooks admin
│   │   ├── useContractOwner.ts ✅ Hook owner
│   │   ├── usePendingOwner.ts  ✅ Hook pending owner
│   │   ├── useOwnershipTransfer.ts ✅ Hook ownership
│   │   ├── useGetUserTransfers.ts ✅ Hook transfers
│   │   └── useUserTokenStats.ts ✅ Hook stats
│   ├── contexts/
│   │   └── AuthContext.tsx    ✅ Contexto autenticación
│   └── lib/
│       ├── utils.ts            ✅ cn() helper
│       └── wagmi-config.ts     ✅ Config Anvil
├── public/                     ✅ Assets estáticos
├── package.json                ✅ Todas deps instaladas
├── tsconfig.json               ✅ TypeScript config
├── tailwind.config.js          ✅ Tailwind config
├── next.config.ts              ✅ Next.js config
└── components.json             ✅ Shadcn config
```

### Métricas

- **Archivos creados**: 40+ archivos nuevos
- **Líneas de código**: ~5000+ líneas de código productivo
- **Hooks implementados**: 27 hooks (17 lectura + 10 escritura)
- **Componentes UI**: 26 componentes (10 Shadcn + 16 custom)
- **Páginas implementadas**: 9/9 páginas (100%)
- **Diseño Moderno 2025**: Aplicado a 5 páginas principales

---

## 🔗 Referencias

- **Estado del Proyecto**: [STATUS.md](../../STATUS.md)
- **Smart Contract**: [docs/SMART_CONTRACT.md](./SMART_CONTRACT.md)
- **Changelog**: [CHANGELOG.md](../../CHANGELOG.md)
- **Contributing**: [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Última actualización**: 27 de Noviembre, 2025

