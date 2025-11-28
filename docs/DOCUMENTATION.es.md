# 📚 Documentación Completa - Supply Chain Tracker

**Última actualización**: 28 de Noviembre, 2025  
**Versión**: 2.2.0  
**Proyecto**: Supply Chain DApp (PFM Web3)

> **📋 Para el estado más actualizado del proyecto, consulta [STATUS.md](../STATUS.md)**

---

## 📑 Índice

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura](#arquitectura)
3. [Smart Contract](#smart-contract)
4. [Frontend](#frontend)
5. [Deployment Automatizado](#deployment-automatizado)
6. [Guía de Despliegue Manual](#guía-de-despliegue-manual-sin-scripts)
7. [Configuración de MetaMask](#configuración-de-metamask)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Roadmap](#roadmap)

---

## 📖 Resumen del Proyecto

Supply Chain Tracker es una DApp descentralizada para gestionar cadenas de suministro mediante blockchain. Permite registrar usuarios con roles específicos, crear tokens que representan productos/materias primas, y realizar transferencias entre participantes de la cadena.

### **Stack Tecnológico**:

**Backend (Smart Contract)**:
- Solidity 0.8.30
- Foundry (Forge, Anvil, Cast)
- OpenZeppelin Contracts (Ownable, Pausable)

**Frontend**:
- Next.js 16.0.1 con App Router
- React 19.2.0
- TypeScript 5.x
- Tailwind CSS 3.4.14 + Shadcn UI
- wagmi 2.12.0 + viem 2.21.0 + ethers 6.13.0

**Blockchain Local**:
- Anvil (localhost:8545, Chain ID: 31337)

### **Métricas del Proyecto**:

> **📋 Para métricas actualizadas, consulta [STATUS.md](../STATUS.md)**

- **Smart Contract**: 970+ líneas de código
- **Tests**: 108 tests (100% passing) - 64 core + 44 edge cases
- **Coverage**: 85.60% líneas, 82.67% statements, 72.15% branches, 80.95% functions
- **Validaciones críticas**: 5 implementadas (100% completadas)
- **Frontend**: ~4,000+ líneas de código productivo
- **Hooks**: 22 hooks personalizados (12 archivos)
- **Componentes**: 26 componentes (15 personalizados + 11 Shadcn UI)
- **Páginas**: 9 de 9 implementadas (100%) - Todas con Diseño Moderno 2025
- **Tests Frontend**: 17 tests (14 unitarios + 3 E2E) pasando
- **Tiempo de desarrollo**: ~61-68 horas (Días 1-7)
- **Estado**: 7.4/9.5 ✅ APROBATORIO (100% Frontend, validaciones críticas completadas)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIOS (MetaMask)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js 16)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │  Pages     │  │ Components │  │   Hooks    │           │
│  │  (App      │  │ (Shadcn    │  │  (wagmi    │           │
│  │  Router)   │  │   UI)      │  │   custom)  │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ JSON-RPC (wagmi/viem)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              BLOCKCHAIN (Anvil Local)                       │
│                Chain ID: 31337                              │
│                Port: 8545                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Smart Contract Calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│         SMART CONTRACT (SupplyChain.sol)                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Users    │  │   Tokens   │  │ Transfers  │           │
│  │ Management │  │ Management │  │ Management │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│                                                             │
│  Features:                                                  │
│  • Role-based access (Producer, Manufacturer, etc.)        │
│  • Token creation (RowMaterial, FinishedProduct)           │
│  • Transfer system (Pending, Accepted, Rejected)           │
│  • Admin panel (Approve/Reject/Suspend users)              │
│  • Pausability (Emergency stop)                            │
└─────────────────────────────────────────────────────────────┘
```

### **Flujo de Datos**:

1. **Usuario** abre la DApp en el navegador
2. **Frontend** carga y se conecta a MetaMask
3. **MetaMask** se conecta a Anvil (blockchain local)
4. **Wagmi/Viem** facilitan la comunicación con el contrato
5. **Smart Contract** ejecuta la lógica de negocio
6. **Blockchain** registra todas las transacciones
7. **Frontend** muestra los resultados al usuario

---

## 📜 Smart Contract

### **Ubicación**: `sc/src/SupplyChain.sol`

### **Características Principales**:

#### **1. Gestión de Usuarios**:
```solidity
// Roles disponibles
enum UserRole {
    Producer,      // Productor de materia prima
    Manufacturer,  // Fabricante de productos
    Distributor,   // Distribuidor
    Retailer       // Minorista
}

// Estados de usuario
enum UserStatus {
    Pending,    // Pendiente de aprobación
    Approved,   // Aprobado
    Rejected,   // Rechazado
    Suspended   // Suspendido
}

// Funciones principales
requestUserRole(UserRole role)           // Solicitar rol
changeStatusUser(address, UserStatus)    // Cambiar estado (admin)
getUserInfo(address) → User              // Obtener info
```

#### **2. Gestión de Tokens**:
```solidity
// Tipos de token
enum TokenType {
    RowMaterial,      // Materia prima
    FinishedProduct   // Producto terminado
}

// Función de creación
createToken(
    string name,
    TokenType tokenType,
    uint256 totalSupply,
    string features,
    uint256 parentId
) → uint256 tokenId

// Funciones de consulta
getToken(uint256 tokenId) → Token
getTokenBalance(address user, uint256 tokenId) → uint256
getUserTokens(address user) → uint256[]
getTotalTokens() → uint256
```

#### **3. Sistema de Transferencias**:
```solidity
// Estados de transferencia
enum TransferStatus {
    Pending,   // Pendiente
    Accepted,  // Aceptada
    Rejected,  // Rechazada
    Cancelled  // Cancelada
}

// Funciones principales
transfer(address to, uint256 tokenId, uint256 amount) → uint256
acceptTransfer(uint256 transferId)
rejectTransfer(uint256 transferId)
cancelTransfer(uint256 transferId)
getTransfer(uint256 transferId) → Transfer
```

#### **4. Funciones Administrativas**:
```solidity
// Solo owner
changeStatusUser(address user, UserStatus status)
pause()    // Pausar contrato
unpause()  // Reanudar contrato
transferOwnershipProposal(address newOwner)
acceptOwnership()

// Consultas
isAdmin(address) → bool
isPaused() → bool
owner() → address
```

### **Eventos**:
```solidity
event UserRegistered(address indexed user, UserRole role)
event UserStatusChanged(address indexed user, UserStatus status)
event TokenCreated(uint256 indexed tokenId, string name, TokenType tokenType)
event TransferCreated(uint256 indexed transferId, address from, address to)
event TransferStatusChanged(uint256 indexed transferId, TransferStatus status)
event OwnershipTransferProposed(address indexed currentOwner, address indexed newOwner)
```

### **Testing**:

**Archivos de test**:
- `sc/test/SupplyChain.t.sol` - 55 tests core
- `sc/test/EdgeCasesTest.t.sol` - 18 tests de casos edge

**Cobertura**:
```
Lines:      85.60%
Statements: 82.67%
Branches:   72.15%
Functions:  80.95%
```

**Ejecutar tests**:
```bash
cd sc

# Todos los tests
forge test

# Con verbosidad
forge test -vv

# Tests específicos
forge test --match-test testCreateToken

# Con coverage
forge coverage
```

---

## 🎨 Frontend

### **Ubicación**: `web/`

### **Estructura del Proyecto**:

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout con providers
│   │   ├── page.tsx            # Landing page con stats
│   │   ├── globals.css         # Estilos globales
│   │   └── admin/
│   │       └── users/
│   │           └── page.tsx    # Admin panel - gestión usuarios
│   │
│   ├── components/
│   │   ├── ui/                 # Shadcn UI components (9)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── alert.tsx
│   │   │
│   │   ├── admin/              # Componentes admin
│   │   │   ├── UserManagementTable.tsx  # Tabla + filtros + acciones
│   │   │   └── UserStatsCards.tsx       # Cards estadísticas
│   │   │
│   │   ├── ConnectWallet.tsx   # Conexión wallet
│   │   ├── Header.tsx          # Navegación unificada + branding
│   │   ├── ThemeToggle.tsx     # Modo claro/oscuro
│   │   ├── RegisterForm.tsx    # Formulario registro usuarios
│   │   └── ChangeRoleDialog.tsx # Diálogo cambiar rol
│   │
│   ├── contexts/
│   │   └── Web3Context.tsx     # Multi-tab sync
│   │
│   ├── contracts/
│   │   ├── config.ts           # Dirección + ABI + Enums
│   │   └── SupplyChain.json    # ABI del contrato
│   │
│   ├── hooks/
│   │   ├── useContractReads.ts    # 5 hooks de lectura
│   │   ├── useRequestRole.ts      # Solicitar rol
│   │   ├── useCreateToken.ts      # Crear token
│   │   ├── useTransfer.ts         # 4 hooks transferencias
│   │   ├── useAdminUsers.ts       # 2 hooks admin (getAllUsers, changeStatus)
│   │   ├── useContractOwner.ts    # Verificar ownership
│   │   ├── useGetUserTokens.ts    # 4 hooks tokens (getUserTokens, getToken, getTokenBalance, useGetAllTokens)
│   │   ├── usePause.ts            # 3 hooks pausa (isPaused, pause, unpause)
│   │   ├── useUserTokenStats.ts   # Estadísticas por tipo
│   │   ├── useGetUserTokensWithData.ts # Tokens con datos completos
│   │   └── useGetUserTransfers.ts # Transferencias de un usuario
│   │
│   └── lib/
│       ├── utils.ts            # cn() helper
│       └── wagmi-config.ts     # Config Anvil
│
├── public/                     # Assets estáticos
├── package.json                # Dependencias
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind config
├── next.config.ts              # Next.js config
├── components.json             # Shadcn config
└── README.md                   # Documentación frontend
```

### **Configuración Web3**:

#### **wagmi-config.ts**:
```typescript
import { http, createConfig } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [localhost],
  connectors: [injected()],  // MetaMask
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
})
```

#### **contracts/config.ts**:
```typescript
// Dirección del contrato (actualizada automáticamente por deploy.sh)
export const SUPPLY_CHAIN_ADDRESS = '0x5FbDB...' as `0x${string}`

// ABI importado
export const SUPPLY_CHAIN_ABI = SupplyChainArtifact.abi

// Enums (deben coincidir exactamente con Solidity)
export enum UserRole { Producer = 0, Manufacturer = 1, ... }
export enum UserStatus { Pending = 0, Approved = 1, ... }
export enum TokenType { RowMaterial = 0, FinishedProduct = 1 }
export enum TransferStatus { Pending = 0, Accepted = 1, ... }
```

### **Hooks Personalizados**:

#### **useContractReads.ts** (Lectura):
```typescript
// Obtener información de usuario
useUserInfo(address) → { data, isLoading, error }

// Verificar si es admin
useIsAdmin(address) → { data: boolean, isLoading, error }

// Estadísticas
useTotalTokens() → { data: bigint, isLoading, error }
useTotalUsers() → { data: bigint, isLoading, error }
useTotalTransfers() → { data: bigint, isLoading, error }
```

#### **useRequestRole.ts** (Escritura):
```typescript
const { requestRole, isPending, isConfirming, isSuccess, hash } = useRequestRole()

// Uso
requestRole(UserRole.Producer)
```

#### **useCreateToken.ts** (Escritura):
```typescript
const { createToken, isPending, isConfirming, isSuccess } = useCreateToken()

// Uso
createToken('Madera', TokenType.RowMaterial, BigInt(1000), '{}', BigInt(0))
```

#### **useTransfer.ts** (Escritura):
```typescript
const { transfer, acceptTransfer, rejectTransfer, cancelTransfer, isPending } = useTransfer()

// Uso
transfer('0x123...', BigInt(1), BigInt(100))
acceptTransfer(BigInt(5))
```

### **Componentes**:

#### **ConnectWallet.tsx**:
```typescript
// Muestra botón de conexión o dirección + botón desconectar
<ConnectWallet />

// Internamente usa:
// - useAccount() para obtener address e isConnected
// - useConnect() para listar connectors y conectar
// - useDisconnect() para desconectar
```

#### **Landing Page (page.tsx)**:
- Header con título + ConnectWallet
- Stats cards (tokens, users, transfers) cuando está conectado
- Mensaje de bienvenida dinámico
- Diseño responsive (Tailwind)

---

## 🤖 Deployment Automatizado

### **Script**: `deploy.sh` (Linux/macOS)

**Versión**: 2.2.0  
**Estado**: ✅ Producción  
**Compatibilidad**: Linux (Ubuntu, Debian, Fedora, Arch, openSUSE) y macOS

Script bash completo que automatiza TODO el proceso de deployment. Completamente probado en Linux y macOS.

#### **Características Principales**:
- ✅ **Instalación Automática de Foundry**: Instala forge/anvil automáticamente si no están instalados (usa foundryup)
- ✅ **Detección de OS**: Detecta automáticamente Linux o macOS y adapta los comandos
- ✅ **Gestión de Dependencias**: Instala paquetes npm y dependencias de forge automáticamente
- ✅ **Persistencia de Estado**: El estado de Anvil persiste entre reinicios
- ✅ **Gestión de Procesos**: Detección inteligente de servicios en ejecución
- ✅ **Logs Organizados**: Todos los logs en el directorio `logs/`

### **Comandos Disponibles**:

```bash
# Ver ayuda completa
./deploy.sh help

# Comandos principales
./deploy.sh start      # Inicia todo el stack (Anvil + Contract + Frontend)
./deploy.sh stop       # Detiene todos los servicios
./deploy.sh restart    # Reinicia todo el stack
./deploy.sh status     # Muestra el estado de los servicios
./deploy.sh metamask   # Muestra instrucciones para configurar MetaMask
./deploy.sh clean      # Limpia el estado persistente de Anvil

# Comandos de configuración
./deploy.sh setup      # Verifica requisitos e instala dependencias faltantes
./deploy.sh env        # Configura variables de entorno (.env.local)

# Comandos de frontend (sin afectar Anvil/Contrato)
./deploy.sh frontend start    # Inicia solo el frontend
./deploy.sh frontend stop     # Detiene solo el frontend
./deploy.sh frontend restart  # Reinicia solo el frontend
```

### **Opciones**:

```bash
# Modo automático (sin confirmaciones)
./deploy.sh setup --yes
./deploy.sh start --auto
./deploy.sh env -y

# Configurar variables de entorno con parámetros (solo .env.local)
./deploy.sh env --modern-design true --debug-mode false
./deploy.sh env --debug-tokens true
./deploy.sh env --all true false false  # Todas las variables a la vez

# Configurar variables de entorno directamente al iniciar (actualiza .env.local ANTES de start)
./deploy.sh start --debug-mode false --debug-tokens false
./deploy.sh start --all true false false   # MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false
```

### **Flujo de `./deploy.sh start`**:

**Importante**: Antes de iniciar los servicios, el script ejecuta automáticamente `pre_start_check()` que verifica e instala todos los requisitos. Ver sección [Verificación Pre-Inicio Automática](#verificación-pre-inicio-automática) para más detalles.

#### **PASO 0: Verificación Pre-Inicio** (Automático)

Antes de iniciar cualquier servicio, el script:
1. Verifica herramientas del sistema (instala si faltan)
2. Verifica Node.js, npm (muestra instrucciones de instalación si faltan)
3. **Verifica Foundry (forge/anvil)** - **Instala automáticamente si falta** usando foundryup
4. Verifica dependencias del proyecto (instala si faltan)
5. Verifica variables de entorno (pregunta para crear si faltan)

**Instalación Automática de Foundry**: Si Foundry no está instalado, el script:
- Descarga el instalador foundryup desde `https://foundry.paradigm.xyz`
- Ejecuta el instalador automáticamente
- Actualiza el PATH para incluir `~/.foundry/bin`
- Verifica la instalación de `forge` y `anvil`

Si algún requisito crítico falta y no se puede instalar, el script aborta con instrucciones claras.

#### **PASO 1: Iniciar Anvil**
```bash
# El script ejecuta:
nohup anvil \
    --host 127.0.0.1 \
    --port 8545 \
    --chain-id 31337 \
    > logs/anvil.log 2>&1 &

# Guarda PID en logs/anvil.pid
# Espera a que el puerto 8545 esté disponible
# Verifica que Anvil esté corriendo
```

**Resultado**:
- ✅ Anvil corriendo en `http://127.0.0.1:8545`
- ✅ 10 cuentas con 10,000 ETH cada una
- ✅ Chain ID: 31337
- ✅ Logs en `logs/anvil.log`

#### **PASO 2: Desplegar Contrato**
```bash
# El script ejecuta:
cd sc
PRIVATE_KEY=0xac097... forge script \
    script/SupplyChainDeploy.s.sol:SupplyChainDeployScript \
    --rpc-url http://127.0.0.1:8545 \
    --broadcast

# Extrae la dirección del contrato del output
# Guarda en logs/contract_address.txt
```

**Resultado**:
- ✅ Contrato desplegado en dirección `0x5FbDB...`
- ✅ Owner: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- ✅ Logs en `logs/deploy.log`

#### **PASO 3: Actualizar Frontend Config**
```bash
# El script ejecuta:
# 1. Hace backup de config.ts
cp web/src/contracts/config.ts web/src/contracts/config.ts.backup

# 2. Actualiza SUPPLY_CHAIN_ADDRESS con sed (sintaxis específica del OS)
# Linux:
sed -i "s/export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]\{40\}'/export const SUPPLY_CHAIN_ADDRESS = '$contract_address'/" config.ts
# macOS:
sed -i '' "s/export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]\{40\}'/export const SUPPLY_CHAIN_ADDRESS = '$contract_address'/" config.ts

# 3. Copia el ABI actualizado desde sc/out/SupplyChain.sol/SupplyChain.json
cp sc/out/SupplyChain.sol/SupplyChain.json web/src/contracts/SupplyChain.json

# 4. Verifica que se actualizó correctamente
```

**Resultado**:
- ✅ `config.ts` actualizado con nueva dirección
- ✅ Backup guardado en `config.ts.backup`
- ✅ ABI copiado desde la última compilación (`SupplyChain.json`)

#### **PASO 4: Iniciar Frontend**
```bash
# El script ejecuta:
cd web
nohup npm run dev > logs/frontend.log 2>&1 &

# Guarda PID en logs/frontend.pid
# Espera a que el puerto 3000 esté disponible
# Verifica que Next.js esté corriendo
```

**Resultado**:
- ✅ Frontend corriendo en `http://localhost:3000`
- ✅ Logs en `logs/frontend.log`

#### **PASO 5: Mostrar Instrucciones**
```bash
# El script muestra:
# - URLs de acceso (Anvil + Frontend)
# - Dirección del contrato
# - Instrucciones de MetaMask
# - Comandos útiles (status, stop)
```

### **Estructura de Logs**:

```
logs/
├── anvil.log              # Output completo de Anvil
├── anvil.pid              # PID del proceso Anvil
├── anvil_state.json       # Estado persistente de Anvil (tokens, transferencias, usuarios)
├── frontend.log           # Output de Next.js dev server
├── frontend.pid           # PID del proceso Next.js
├── deploy.log             # Output del deployment Foundry
├── contract_address.txt   # Dirección del contrato (guardada después del deployment)
└── install.log            # Logs de instalación (herramientas del sistema, dependencias)
```

**Ubicación de Logs**:
- Todos los logs se guardan en el directorio `logs/` en la raíz del proyecto
- Los logs se crean automáticamente cuando los servicios inician
- Los logs de instalación (`install.log`) se crean al ejecutar `setup` o cuando las dependencias se instalan automáticamente

**Nota sobre persistencia**: El archivo `anvil_state.json` contiene el estado completo de la blockchain local. Si lo eliminas (con `./deploy.sh clean`), Anvil iniciará con una blockchain limpia en el próximo `start`.

---

### **Comando: `./deploy.sh setup`**

Verifica todos los requisitos e instala automáticamente las dependencias faltantes.

#### **Qué hace**:

1. **Verifica Herramientas del Sistema**:
   - Verifica: `lsof`, `netstat`, `curl`, `pgrep`
   - En Linux: También verifica `ss`
   - En macOS: `ss` no se verifica (no está disponible)
   - Instala automáticamente herramientas faltantes usando:
     - **Linux**: `apt-get`, `dnf`, `pacman`, o `zypper` (según la distribución)
     - **macOS**: `brew` (Homebrew)

2. **Verifica Requisitos Básicos**:
   - **Node.js** v18+ (muestra instrucciones de instalación si falta)
   - **npm** (viene con Node.js)
   - **Foundry** (comandos `forge` y `anvil`)
   - Muestra instrucciones de instalación específicas del OS si faltan

3. **Verifica Dependencias del Proyecto**:
   - **Frontend**: Verifica si existe `web/node_modules`
   - **Smart Contract**: Verifica si existe `sc/lib/forge-std`
   - Instala automáticamente dependencias faltantes:
     - Frontend: `npm install` en el directorio `web/`
     - Smart Contract: `forge install` en el directorio `sc/`

4. **Configura Variables de Entorno** (opcional):
   - Pregunta para configurar `.env.local` si no existe
   - Se puede omitir y configurar después con `./deploy.sh env`

#### **Uso**:

```bash
# Modo interactivo (pide confirmación)
./deploy.sh setup

# Modo automático (sin confirmaciones, usa valores por defecto)
./deploy.sh setup --yes
```

#### **Qué se instala automáticamente**:

- **Herramientas del Sistema** (si faltan):
  - Linux: `lsof`, `net-tools`, `iproute2`, `curl`, `procps` (o `procps-ng` en Arch)
  - macOS: La mayoría de herramientas vienen preinstaladas, solo instala si realmente faltan

- **Dependencias del Proyecto** (si faltan):
  - Frontend: Todos los paquetes npm (puede tomar 5-15 minutos)
  - Smart Contract: `forge-std` y otras dependencias de Foundry

#### **Logs**:

Todos los logs de instalación se guardan en `logs/install.log` para troubleshooting.

---

### **Comando: `./deploy.sh env`**

Configura las variables de entorno del frontend en `web/.env.local`.

#### **Variables Disponibles**:

- `NEXT_PUBLIC_MODERN_DESIGN`: Diseño moderno 2025 (glassmorphism, gradientes, animaciones)
  - Opciones: `true` | `false`
  - Por defecto: `true`

- `NEXT_PUBLIC_DEBUG_MODE`: Logs adicionales en consola
  - Opciones: `true` | `false`
  - Por defecto: `false`

- `NEXT_PUBLIC_DEBUG_TOKENS`: Información adicional de tokens
  - Opciones: `true` | `false`
  - Por defecto: `false`

#### **Modos de Uso**:

**1. Modo Interactivo** (recomendado para primera vez):
```bash
./deploy.sh env
# Pregunta por cada variable con sugerencias por defecto
```

**2. Modo con Parámetros** (variables individuales):
```bash
./deploy.sh env --modern-design true
./deploy.sh env --debug-mode false
./deploy.sh env --debug-tokens true
```

**3. Modo Todo a la Vez**:
```bash
./deploy.sh env --all true false false
# Establece: MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false (valores recomendados por defecto)
```

**4. Modo Automático** (usa valores por defecto):
```bash
./deploy.sh env --yes
# Crea .env.local con valores por defecto:
# MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false
```

**5. Desde `start` (recomendado para forzar debug off antes de arrancar)**:
```bash
# Actualiza .env.local y luego inicia todo el stack
./deploy.sh start --debug-mode false --debug-tokens false
./deploy.sh start --all true false false   # MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false
```

#### **Archivo Creado**:

El comando crea/actualiza `web/.env.local` con los valores configurados.

**Importante**: El archivo debe llamarse `.env.local` (no `.env.example`). El archivo `.env.example` es solo una plantilla de referencia.

---

### **Verificación Pre-Inicio Automática**

Cuando ejecutas `./deploy.sh start`, el script ejecuta automáticamente `pre_start_check()` **antes** de iniciar los servicios.

#### **Qué verifica**:

1. **Herramientas del Sistema**: Igual que `./deploy.sh setup` (verifica e instala si es necesario)
2. **Requisitos Básicos**: Node.js, npm, Foundry (muestra instrucciones si faltan)
3. **Dependencias del Proyecto**: `node_modules` y `forge-std` (instala si faltan)
4. **Variables de Entorno**: Verifica si existe `.env.local` (pregunta para crear si falta)

#### **Comportamiento**:

- **Modo Interactivo**: Pide confirmación antes de instalar dependencias faltantes
- **Modo Automático** (`--yes`/`--auto`/`-y`): Instala todo automáticamente con valores por defecto
- **Si hay errores críticos**: El script aborta y muestra instrucciones para corregir problemas

#### **Ejemplo de Flujo**:

```bash
./deploy.sh start
# 1. Ejecuta pre_start_check()
#    - Verifica herramientas del sistema ✅
#    - Verifica Node.js ✅
#    - Verifica npm ✅
#    - Verifica Foundry ✅
#    - Verifica node_modules ❌ (falta)
#    - Pregunta: "¿Instalar dependencias del frontend? (S/n)"
#    - Usuario confirma → Instala paquetes npm
#    - Verifica .env.local ❌ (falta)
#    - Pregunta: "¿Configurar variables de entorno? (S/n)"
#    - Usuario confirma → Ejecuta setup_environment_variables()
# 2. Inicia Anvil
# 3. Despliega contrato
# 4. Actualiza config del frontend
# 5. Inicia frontend
```

---

### **Compatibilidad Linux/macOS**

El script detecta automáticamente el sistema operativo y adapta los comandos en consecuencia. **Probado en macOS (darwin 25.1.0) y Linux (Ubuntu, Debian, Fedora, Arch)**.

#### **Detección de OS**:

- **macOS**: Detectado mediante `OSTYPE == "darwin*"`
- **Linux**: Detectado mediante `OSTYPE == "linux-gnu*"` y detección de distribución

#### **Diferencias Manejadas**:

1. **Herramientas del Sistema**:
   - **Linux**: Verifica `lsof`, `netstat`, `ss`, `curl`, `pgrep`
   - **macOS**: Verifica `lsof`, `netstat`, `curl`, `pgrep` (no `ss` - no disponible)

2. **Instalación de Foundry**:
   - **Ambos**: Usa `foundryup` (instalador oficial) - funciona idéntico en ambos sistemas
   - Ruta de instalación: `~/.foundry/bin` (igual en ambos)

3. **Gestores de Paquetes** (para herramientas del sistema):
   - **Linux**: Usa `apt-get`, `dnf`, `pacman`, o `zypper` (auto-detectado)
   - **macOS**: Usa `brew` (Homebrew) - la mayoría de herramientas vienen preinstaladas

4. **Sintaxis de Comandos**:
   - **`sed -i`**: 
     - Linux: `sed -i "s/patrón/reemplazo/" archivo`
     - macOS: `sed -i '' "s/patrón/reemplazo/" archivo`
   - **`netstat`**:
     - Linux: `netstat -tlnp` (muestra información de proceso)
     - macOS: `netstat -an` (no hay información de proceso disponible)
   - **`grep`**:
     - Usa `sed` y `grep -oE` para extracción de direcciones (compatible con GNU y BSD grep)
     - Nota: `grep -oP` (regex Perl) NO se usa porque no está disponible en BSD grep de macOS
   - **`timeout`**:
     - Linux: Comando `timeout` disponible
     - macOS: Usa `gtimeout` (de Homebrew coreutils) o funciona sin timeout

5. **Herramientas Preinstaladas**:
   - **macOS**: La mayoría de herramientas (`lsof`, `netstat`, `curl`, `pgrep`) vienen preinstaladas
   - **Linux**: Puede necesitar instalar algunas herramientas

#### **Adaptación Automática**:

El script automáticamente:
- Detecta el OS
- Usa el gestor de paquetes correcto
- Usa la sintaxis de comandos correcta (sed, grep, netstat)
- Omite herramientas no disponibles (como `ss` en macOS)
- Maneja comandos faltantes con gracia (como `timeout` en macOS)
- **Instala Foundry automáticamente** usando el mismo método en ambos sistemas

---

### **Casos de Uso Avanzados**

#### **1. Primera Vez - Setup Completo**:

```bash
# Paso 1: Setup (verificar e instalar todo)
./deploy.sh setup --yes

# Paso 2: Configurar variables de entorno
./deploy.sh env

# Paso 3: Iniciar todo
./deploy.sh start
```

#### **2. Desarrollo Diario**:

```bash
# Mañana: Iniciar todo
./deploy.sh start

# Durante desarrollo: Solo reiniciar frontend después de cambios
./deploy.sh frontend restart

# Fin del día: Detener todo
./deploy.sh stop
```

#### **3. Desarrollo Solo Frontend**:

```bash
# Iniciar Anvil y desplegar contrato una vez
./deploy.sh start

# Detener solo frontend
./deploy.sh frontend stop

# Hacer cambios en frontend...

# Reiniciar solo frontend (Anvil y contrato siguen corriendo)
./deploy.sh frontend start
```

#### **4. Desarrollo con Estado Limpio**:

```bash
# Detener todo
./deploy.sh stop

# Limpiar estado de Anvil (elimina todos los tokens, transferencias, usuarios)
./deploy.sh clean

# Iniciar con blockchain limpia
./deploy.sh start
```

#### **5. Troubleshooting**:

```bash
# Verificar estado de todos los servicios
./deploy.sh status

# Ver logs
tail -f logs/anvil.log
tail -f logs/frontend.log
tail -f logs/deploy.log
tail -f logs/install.log

# Reiniciar si algo está mal
./deploy.sh restart
```

#### **6. CI/CD Automatizado**:

```bash
# Setup y inicio completamente automatizado (sin interacción del usuario)
./deploy.sh setup --yes
./deploy.sh env --yes
./deploy.sh start --yes
```

---

### **Referencia Completa de Casos de Uso** (42 Casos Probados)

Esta sección documenta los 42 casos de uso que han sido probados y verificados para el script `deploy.sh`, incluyendo casos de error.

#### **Comandos Básicos** (14 casos):

**1-3. Comandos de Ayuda**:
```bash
./deploy.sh help      # Mostrar ayuda completa
./deploy.sh --help    # Comando de ayuda alternativo
./deploy.sh -h        # Comando de ayuda corto
```
**Esperado**: Muestra ayuda completa con todos los comandos disponibles, opciones y ejemplos.

**4-7. Comandos de Inicio**:
```bash
./deploy.sh start           # Iniciar todo el stack (modo interactivo)
./deploy.sh start --yes     # Iniciar con modo automático (sin confirmaciones)
./deploy.sh start --auto    # Iniciar con modo automático (alternativa)
./deploy.sh start -y        # Iniciar con modo automático (corto)
```
**Esperado**: 
- Ejecuta verificación pre-inicio automáticamente
- Inicia Anvil, despliega contrato, actualiza configuración del frontend, inicia frontend
- Muestra resumen del deployment con URLs e instrucciones de MetaMask

**8. Comando de Detención**:
```bash
./deploy.sh stop
```
**Esperado**: Detiene todos los servicios (Frontend y Anvil) de forma ordenada.

**9-10. Comandos de Reinicio**:
```bash
./deploy.sh restart         # Reiniciar todo el stack (modo interactivo)
./deploy.sh restart --yes   # Reiniciar con modo automático
```
**Esperado**: Detiene todos los servicios, espera 2 segundos, luego inicia todo nuevamente.

**11. Comando de Estado**:
```bash
./deploy.sh status
```
**Esperado**: Muestra el estado de todos los servicios (Anvil, Frontend), URL RPC, Chain ID, Dirección del Contrato, Owner, y rutas de archivos de log.

**12. Comando MetaMask**:
```bash
./deploy.sh metamask
```
**Esperado**: Muestra instrucciones detalladas de configuración de MetaMask incluyendo configuración de red, importación de cuenta y pasos de verificación.

**13-14. Comandos de Limpieza/Reset**:
```bash
./deploy.sh clean   # Limpiar estado persistente de Anvil
./deploy.sh reset   # Alias para comando clean
```
**Esperado**: 
- Solicita confirmación si Anvil está corriendo
- Elimina `logs/anvil_state.json` para resetear el estado de la blockchain
- Muestra mensaje de éxito

#### **Comandos de Configuración** (5 casos):

**15-17. Comandos Setup**:
```bash
./deploy.sh setup           # Modo interactivo (solicita confirmación)
./deploy.sh setup --yes     # Modo automático (sin confirmaciones)
./deploy.sh setup --auto    # Modo automático (alternativa)
./deploy.sh setup -y        # Modo automático (corto)
```
**Esperado**: 
- Verifica herramientas del sistema (instala si faltan)
- Verifica Node.js, npm, Foundry (muestra instrucciones si faltan)
- Verifica dependencias del proyecto (instala si faltan)
- Opcionalmente configura variables de entorno

**18-19. Comandos de Variables de Entorno**:
```bash
./deploy.sh env          # Modo interactivo (recomendado para primera vez)
./deploy.sh environment  # Alias para comando env
```
**Esperado**: Solicita cada variable de entorno con sugerencias por defecto.

#### **Configuración de Variables de Entorno** (12 casos):

**20-21. Variable Modern Design**:
```bash
./deploy.sh env --modern-design true   # Habilitar diseño moderno
./deploy.sh env --modern-design false  # Deshabilitar diseño moderno
```
**Esperado**: Crea/actualiza `.env.local` con `NEXT_PUBLIC_MODERN_DESIGN` configurado en consecuencia.

**22-23. Variable Debug Mode**:
```bash
./deploy.sh env --debug-mode true   # Habilitar modo debug
./deploy.sh env --debug-mode false  # Deshabilitar modo debug
```
**Esperado**: Crea/actualiza `.env.local` con `NEXT_PUBLIC_DEBUG_MODE` configurado en consecuencia.

**24-25. Variable Debug Tokens**:
```bash
./deploy.sh env --debug-tokens true   # Habilitar debug tokens
./deploy.sh env --debug-tokens false  # Deshabilitar debug tokens
```
**Esperado**: Crea/actualiza `.env.local` con `NEXT_PUBLIC_DEBUG_TOKENS` configurado en consecuencia.

**26-27. Todas las Variables a la Vez**:
```bash
./deploy.sh env --all true false false   # MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false
./deploy.sh env --all false true true    # MODERN_DESIGN=false, DEBUG_MODE=true, DEBUG_TOKENS=true
```
**Esperado**: Establece las tres variables en un solo comando. Orden: `MODERN_DESIGN`, `DEBUG_MODE`, `DEBUG_TOKENS`.

**34. Múltiples Parámetros Combinados**:
```bash
./deploy.sh env --modern-design true --debug-mode true --debug-tokens false
```
**Esperado**: Establece múltiples variables en un solo comando. Todas las variables especificadas se actualizan.

**35-36. Modo Automático para Env**:
```bash
./deploy.sh env --yes   # Modo automático (usa valores por defecto)
./deploy.sh env --auto  # Modo automático (alternativa)
```
**Esperado**: Crea `.env.local` con valores por defecto:
- `NEXT_PUBLIC_MODERN_DESIGN=true`
- `NEXT_PUBLIC_DEBUG_MODE=false`
- `NEXT_PUBLIC_DEBUG_TOKENS=false`

#### **Comandos de Frontend** (3 casos):

**28-30. Comandos Solo Frontend**:
```bash
./deploy.sh frontend start    # Iniciar solo frontend (requiere Anvil corriendo)
./deploy.sh frontend stop     # Detener solo frontend
./deploy.sh frontend restart  # Reiniciar solo frontend
```
**Esperado**: 
- `start`: Inicia solo el frontend (Anvil y contrato deben estar corriendo)
- `stop`: Detiene solo el frontend (Anvil y contrato continúan corriendo)
- `restart`: Detiene e inicia solo el frontend

#### **Casos de Error** (8 casos):

**31. Comando Inválido**:
```bash
./deploy.sh invalid_command
```
**Error Esperado**: 
```
✗ Invalid command: invalid_command

Usage: ./deploy.sh [command] [options]
Run ./deploy.sh help for complete help
```
**Código de Salida**: `1`

**32. Subcomando de Frontend Inválido**:
```bash
./deploy.sh frontend invalid
```
**Error Esperado**:
```
✗ Invalid frontend command: invalid

Available commands:
  ./deploy.sh frontend start    - Start only frontend
  ./deploy.sh frontend stop     - Stop only frontend
  ./deploy.sh frontend restart  - Restart only frontend
```
**Código de Salida**: `1`

**33. Valor Inválido de Variable de Entorno**:
```bash
./deploy.sh env --modern-design invalid_value
```
**Error Esperado**:
```
✗ Invalid value for --modern-design: invalid_value (must be 'true' or 'false')
```
**Código de Salida**: `1`

**37-38. Variaciones de Bandera Corta**:
```bash
./deploy.sh setup -y   # Modo automático (bandera corta)
./deploy.sh start -y   # Modo automático (bandera corta)
```
**Esperado**: Funciona igual que las banderas `--yes` o `--auto`.

**39. Ejecución desde Directorio Incorrecto**:
```bash
cd /tmp
/ruta/al/proyecto/deploy.sh status
```
**Error Esperado**:
```
✗ This script must be run from the project root
ℹ Current directory: /tmp
```
**Código de Salida**: `1`

**40. Valor Inválido en Env**:
```bash
./deploy.sh env --modern-design invalid
```
**Error Esperado**:
```
✗ Invalid value for --modern-design: invalid (must be 'true' or 'false')
```
**Código de Salida**: `1`

**41. Valores Faltantes en --all**:
```bash
./deploy.sh env --all true false
```
**Esperado**: El script debe manejar esto de forma ordenada. Si solo se proporcionan 2 valores, puede usar valores por defecto para el tercero o mostrar un error. (El comportamiento depende de la implementación)

**42. Frontend Start Sin Anvil**:
```bash
./deploy.sh frontend start  # Cuando Anvil no está corriendo
```
**Esperado**: 
- El script intenta iniciar el frontend
- El frontend puede iniciar pero fallará al conectar con Anvil
- Mensajes de error en los logs del frontend indicando conexión rechazada

#### **Notas sobre Manejo de Errores**:

1. **Todos los casos de error salen con código `1`** para indicar fallo
2. **Los mensajes de error son claros y accionables**, mostrando qué salió mal y cómo solucionarlo
3. **Los comandos inválidos muestran ayuda** o listan alternativas disponibles
4. **El script valida la entrada** antes de ejecutar comandos (ej., los valores booleanos deben ser 'true' o 'false')
5. **La validación de directorio** asegura que el script se ejecute desde la ubicación correcta

#### **Matriz Completa de Pruebas**:

| Categoría | Casos | Documentado | Probado |
|-----------|-------|-------------|---------|
| Comandos Básicos | 14 | ✅ | ✅ |
| Configuración | 5 | ✅ | ✅ |
| Variables de Entorno | 12 | ✅ | ✅ |
| Comandos Frontend | 3 | ✅ | ✅ |
| Casos de Error | 8 | ✅ | ✅ |
| **TOTAL** | **42** | **✅** | **✅** |

---

### **Script Windows**: `deploy.ps1`

**Versión**: 2.1.0  
**Estado**: ✅ Producción

Script PowerShell equivalente para Windows 10/11 que automatiza TODO el proceso de deployment.

> **Nota**: A diferencia de `deploy.sh`, el script de Windows NO instala Foundry automáticamente. Debes instalar Foundry manualmente antes de ejecutar el script. Ver [Requisitos Previos](#requisitos-previos) abajo.

#### **Requisitos Previos**:

1. **PowerShell 5.1+** (viene preinstalado en Windows 10/11)
   ```powershell
   $PSVersionTable.PSVersion
   ```

2. **Foundry** (Anvil y Forge)
   - Instalar desde: https://book.getfoundry.sh/getting-started/installation
   - Verificar: `anvil --version`, `forge --version`

3. **Node.js y npm**
   - Instalar desde: https://nodejs.org/
   - Verificar: `node --version`, `npm --version`

#### **Configuración Inicial (Solo Primera Vez)**:

**Configurar Política de Ejecución**:
```powershell
# Abrir PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Alternativa** (si no quieres cambiar la política):
```powershell
# Ejecutar script con bypass temporal
powershell -ExecutionPolicy Bypass -File .\deploy.ps1 start
```

#### **Comandos Disponibles**:

```powershell
# Iniciar todo el stack (Anvil + Contrato + Frontend)
.\deploy.ps1 start

# Detener todos los servicios
.\deploy.ps1 stop

# Reiniciar todo el stack
.\deploy.ps1 restart

# Ver estado de servicios
.\deploy.ps1 status

# Mostrar instrucciones de MetaMask
.\deploy.ps1 metamask

# Limpiar estado persistente de Anvil
.\deploy.ps1 clean

# Comandos de Frontend (Sin Afectar Anvil/Contrato)
.\deploy.ps1 frontend start
.\deploy.ps1 frontend stop
.\deploy.ps1 frontend restart

# Ayuda
.\deploy.ps1 help
```

#### **Ejemplos de Uso**:

**Escenario 1: Primera Ejecución**
```powershell
# 1. Configurar política (solo primera vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. Iniciar todo
.\deploy.ps1 start

# 3. Verificar estado
.\deploy.ps1 status

# 4. Abrir navegador en http://localhost:3000
```

**Escenario 2: Desarrollo Frontend (Anvil ya corriendo)**
```powershell
# 1. Hacer cambios en el frontend

# 2. Reiniciar solo el frontend (Anvil y contrato siguen corriendo)
.\deploy.ps1 frontend restart

# 3. Los cambios se reflejan sin perder el estado de Anvil
```

**Escenario 3: Limpiar Estado de Anvil**
```powershell
# 1. Detener Anvil primero
.\deploy.ps1 stop

# 2. Limpiar estado
.\deploy.ps1 clean

# 3. Reiniciar con blockchain limpia
.\deploy.ps1 start
```

#### **Verificación de Funcionamiento**:

**Verificar que los Servicios Están Corriendo**:
```powershell
.\deploy.ps1 status
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
✓ CORRIENDO (PID: 67890, Puerto: 3000)
ℹ URL: http://localhost:3000

Smart Contract:
ℹ Dirección: 0x...
ℹ Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Ver Logs**:
```powershell
# Ver últimos logs de Anvil
Get-Content logs\anvil.log -Tail 20

# Ver últimos logs del frontend
Get-Content logs\frontend.log -Tail 20
```

**Verificar Puertos**:
```powershell
# Verificar puerto de Anvil (8545)
Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue

# Verificar puerto del frontend (3000)
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

#### **Solución de Problemas**:

**Error: "No se puede cargar el archivo porque la ejecución de scripts está deshabilitada"**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Error: "Anvil no está instalado o no está en el PATH"**
1. Instalar Foundry: https://book.getfoundry.sh/getting-started/installation
2. Verificar que `anvil` esté en el PATH: `Get-Command anvil`
3. Si no está, agregar Foundry al PATH manualmente

**Error: "Puerto 8545 ya está en uso"**
```powershell
# Ver qué proceso está usando el puerto
Get-NetTCPConnection -LocalPort 8545 | Select-Object OwningProcess

# Detener el proceso manualmente
Stop-Process -Id <PID> -Force

# O usar el script
.\deploy.ps1 stop
```

**Error: "Puerto 3000 ya está en uso"**
```powershell
# Ver qué proceso está usando el puerto
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Detener el proceso manualmente
Stop-Process -Id <PID> -Force

# O usar el script
.\deploy.ps1 frontend stop
```

#### **Tabla de Paridad de Características**:

| Característica | deploy.sh (Linux/macOS) | deploy.ps1 (Windows) |
|----------------|-------------------------|----------------------|
| **Versión** | 2.2.0 | 2.1.0 |
| **Setup Cmd** | ✅ `setup` | ✅ `setup` |
| **Env Cmd** | ✅ `env` (todos los modos) | ✅ `env` (todos los modos) |
| **Flags Auto** | ✅ `--yes`, `--auto`, `-y` | ✅ `--yes`, `--auto` |
| **Pre-check** | ✅ Automático | ✅ Automático |
| **Instalación Foundry** | ✅ **Automática** (foundryup) | ❌ Manual (requiere usuario) |
| **Modelo de Procesos** | Background (`nohup`) | Ventanas Separadas (`Start-Process`) |
| **Verificación de puertos** | `lsof`, `netstat` | `Get-NetTCPConnection` |
| **Logs** | `logs/*.log` | `logs/*.log` + Salida en Ventana |
| **Instalación Dependencias** | Sistema + Proyecto + **Foundry** | Solo Proyecto (Sistema manual) |
| **macOS Probado** | ✅ darwin 25.1.0 | N/A |
| **Linux Probado** | ✅ Ubuntu, Debian, Fedora, Arch | N/A |

**Funcionalidad**: ✅ **Paridad completa** - Todas las funciones del script bash están implementadas en PowerShell.

### **Gestión de Procesos**:

El script gestiona los procesos de forma inteligente:

- **Verificación de puertos**: Detecta si un servicio ya está corriendo
- **PIDs persistentes**: Guarda PIDs para detener servicios correctamente
- **Logs separados**: Cada servicio tiene su propio archivo de log
- **Graceful shutdown**: Intenta SIGTERM primero, luego SIGKILL si es necesario
- **Validación de estado**: Espera a que los servicios estén listos antes de continuar

---

## 🛠️ Guía de Despliegue Manual (Sin Scripts)

Si prefieres entender el proceso subyacente o no puedes usar los scripts de automatización, sigue estas instrucciones paso a paso.

### **1. Prerrequisitos y Verificación**

Herramientas necesarias:
- **Git**: [Descargar](https://git-scm.com/downloads)
- **Node.js (v18+)**: [Descargar](https://nodejs.org/)
- **Foundry (Forge & Anvil)**: [Guía de Instalación](https://book.getfoundry.sh/getting-started/installation)

**Verificar en Windows (PowerShell):**
```powershell
# Verificar Git
git --version
# Esperado: git version 2.x.x

# Verificar Node.js
node --version
# Esperado: v18.x.x o superior

# Verificar Foundry
forge --version
anvil --version
# Esperado: forge 0.2.0... / anvil 0.2.0...
```

**Cómo instalar si falta:**
- **Node.js**: Descarga el instalador del sitio oficial.
- **Foundry**: Ejecuta en PowerShell:
  ```powershell
  curl -L https://foundry.paradigm.xyz | bash
  foundryup
  ```

### **2. Iniciar Blockchain Local (Anvil)**

Abre una **nueva terminal** (Terminal 1) y ejecuta:

```powershell
# Windows (PowerShell)
anvil
```

**Linux/macOS**:
```bash
anvil
```

> **Mantén esta terminal abierta.** Deberías ver "Listening on 127.0.0.1:8545".

### **3. Desplegar Smart Contract**

Abre una **segunda terminal** (Terminal 2) y ejecuta:

**1. Instalar Dependencias:**
```bash
cd sc
forge install
```

**2. Compilar y Desplegar:**
```bash
# Windows (PowerShell)
$env:PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
forge script script/SupplyChainDeploy.s.sol:SupplyChainDeployScript --rpc-url http://127.0.0.1:8545 --broadcast

# Linux/macOS
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 forge script script/SupplyChainDeploy.s.sol:SupplyChainDeployScript --rpc-url http://127.0.0.1:8545 --broadcast
```

**3. Copiar Dirección del Contrato:**
Busca en los logs una línea como: `Contract Address: 0x...`
**Copia esta dirección.**

### **4. Configurar Frontend**

Aún en la Terminal 2:

**1. Copiar ABI del Contrato:**
El frontend necesita el JSON ABI para hablar con el contrato.

**Windows (PowerShell)**:
```powershell
Copy-Item "..\out\SupplyChain.sol\SupplyChain.json" "..\..\web\src\contracts\SupplyChain.json" -Force
```

**Linux/macOS**:
```bash
cp ../out/SupplyChain.sol/SupplyChain.json ../../web/src/contracts/SupplyChain.json
```

**2. Actualizar Dirección del Contrato:**
Abre `web/src/contracts/config.ts` en tu editor.
Encuentra la línea:
```typescript
export const SUPPLY_CHAIN_ADDRESS = '0x...' as `0x${string}`
```
Reemplaza la dirección con la que copiaste en el Paso 3.

**3. Configurar Variables de Entorno:**
Crea `web/.env.local` si no existe.

**Windows (PowerShell)**:
```powershell
cd ..\web
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

**Linux/macOS**:
```bash
cd ../web
cp .env.example .env.local 2>/dev/null || :
```

### **5. Iniciar Frontend**

**1. Instalar Dependencias:**

**Windows (PowerShell)**:
```powershell
# Verifica si existe node_modules, si no instala
if (!(Test-Path "node_modules")) { npm install }
# O simplemente ejecuta:
npm install
```

**Linux/macOS**:
```bash
# Verifica si existe node_modules, si no instala
if [ ! -d "node_modules" ]; then npm install; fi
# O simplemente ejecuta:
npm install
```

**2. Iniciar Servidor de Desarrollo:**
```bash
npm run dev
```

> **Mantén esta terminal abierta.** Deberías ver "Ready in ... ms".

### **6. Verificar Despliegue**

**1. Chequeo de Navegador:**
- Abre `http://localhost:3000`.
- Deberías ver la Landing Page con el título "Supply Chain Tracker".
- **Criterio de Éxito**: La página carga sin pantallas blancas ni errores de consola.

**2. Conectar MetaMask:**
- Haz clic en "Conectar Billetera".
- Selecciona la cuenta importada (Owner).
- **Criterio de Éxito**:
  - El botón muestra tu dirección (e.g., `0xf39...2266`).
  - Ves las tarjetas de estadísticas (inicialmente en 0).

**3. Probar Conexión:**
- Ve al Dashboard o Admin panel.
- Si los datos cargan (aunque estén vacíos), la conexión funciona.

### **7. Detener Servicios (Manual)**

Para detener los servicios correctamente y evitar errores de "puerto en uso", sigue este orden: **Frontend Primero -> Luego Anvil**.

**Windows (PowerShell):**

1. **Encontrar PIDs:**
   ```powershell
   Get-NetTCPConnection -LocalPort 3000, 8545 -ErrorAction SilentlyContinue | Select-Object LocalPort, OwningProcess, State
   ```
   *Nota: Puerto 3000 es Frontend, 8545 es Anvil.*

2. **Detener Frontend (Puerto 3000):**
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

3. **Detener Anvil (Puerto 8545):**
   ```powershell
   Stop-Process -Id <PID> -Force
   ```

**Linux/macOS:**

1. **Encontrar PIDs:**
   ```bash
   # Encontrar PID del Frontend (Puerto 3000)
   lsof -ti :3000
   
   # Encontrar PID de Anvil (Puerto 8545)
   lsof -ti :8545
   ```

2. **Detener Frontend (Puerto 3000):**
   ```bash
   kill -9 $(lsof -t -i:3000)
   ```

3. **Detener Anvil (Puerto 8545):**
   ```bash
   kill -9 $(lsof -t -i:8545)
   ```

4. **Verificar que los puertos estén libres:**
   ```bash
   # No debería retornar nada si los puertos están libres
   lsof -i :3000
   lsof -i :8545
   ```

---

## 🦊 Configuración de MetaMask

### **Paso 1: Agregar Red Anvil Local**

1. Abrir MetaMask
2. Clic en selector de red (arriba izquierda)
3. "Add network" → "Add a network manually"
4. Completar datos:

| Campo | Valor |
|-------|-------|
| **Network Name** | `Anvil Local` |
| **RPC URL** | `http://127.0.0.1:8545` |
| **Chain ID** | `31337` |
| **Currency Symbol** | `ETH` |

5. Clic en "Save"

### **Paso 2: Importar Cuenta (Owner)**

**Cuenta #0 (Deployer/Owner)**:
- Dirección: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Balance: 10,000 ETH

**Pasos**:
1. Clic en icono de cuenta (arriba derecha)
2. "Import Account"
3. Seleccionar "Private Key"
4. Pegar el private key de arriba
5. "Import"

⚠️ **IMPORTANTE**: Este private key es SOLO para desarrollo local. NUNCA usar en mainnet.

### **Paso 3: Cuentas Adicionales (Opcional)**

Para probar flujos de transferencias entre usuarios:

**Cuenta #1**:
- Dirección: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Cuenta #2**:
- Dirección: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

**Cuenta #3**:
- Dirección: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
- Private Key: `0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`

### **Paso 3.1: Cuentas Adicionales (10-14)**

Anvil genera 15 cuentas usando el mnemonic determinístico. Las cuentas #0-9 están documentadas arriba. Estas son las cuentas adicionales #10-14:

**Cuenta #10**:
- Dirección: `0xbcd4042de499d14e55001ccbb24a551f3b954096`
- Private Key: `0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897`

**Cuenta #11**:
- Dirección: `0x71be63f3384f5fb98995898a86b02fb2426c5788`
- Private Key: `0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82`

**Cuenta #12**:
- Dirección: `0xfabb0ac9d68b0b445fb7357272ff202c5651694a`
- Private Key: `0xa267530f49f8280200edf313ee7af6b827f2a8bce2897751d06a843f644967b1`

**Cuenta #13**:
- Dirección: `0x1cbd3b2770909d4e10f157cabc84c7264073c9ec`
- Private Key: `0x47c99abed3324a2707c28affff1267e45918ec8c3f20b8aa892e8b065d2942dd`

**Cuenta #14**:
- Dirección: `0xdf3e18d64bc6a983f673ab319ccae4f1a57c7097`
- Private Key: `0xc526ee95bf44d8fc405a158bb884d9d1238d99f0612e9f33d006bb0789009aaa`

**Cómo Importar en MetaMask**:
1. Abrir MetaMask (asegúrate de estar en red "Anvil Local")
2. Clic en el ícono de cuenta (arriba derecha)
3. Seleccionar **"Import Account"**
4. Elegir **"Private Key"**
5. Pegar el private key de la cuenta que deseas importar
6. Clic en **"Import"**
7. Repetir para cada cuenta adicional

⚠️ **IMPORTANTE**: Estos private keys son SOLO para desarrollo local. NUNCA usar en mainnet o con fondos reales. Cada cuenta tiene 10,000 ETH iniciales en Anvil.

### **Paso 4: Conectar a la DApp**

1. Abrir `http://localhost:3000`
2. Asegurarse de estar en red "Anvil Local" en MetaMask
3. Clic en "Conectar MetaMask" en la DApp
4. Autorizar la conexión en el popup de MetaMask
5. ¡Listo! Deberías ver:
   - Tu dirección acortada (0xf39F...2266)
   - Botón "Desconectar"
   - Stats cards con datos del contrato

### **Paso 5: Verificar Conexión**

**Indicadores de conexión exitosa**:
- ✅ MetaMask muestra "Connected" con punto verde
- ✅ DApp muestra tu dirección
- ✅ Stats cards muestran: 0 Tokens, 0 Usuarios, 0 Transferencias
- ✅ Mensaje: "¡Bienvenido a la DApp!"

---

## 🧪 Testing

### **Smart Contract Tests**:

```bash
cd sc

# Todos los tests
forge test

# Con verbosidad
forge test -vv

# Tests específicos
forge test --match-contract SupplyChainTest
forge test --match-test testCreateToken

# Con gas report
forge test --gas-report

# Con coverage
forge coverage

# Coverage en formato lcov
forge coverage --report lcov
```

**Categorías de tests**:
- ✅ User Management (8 tests)
- ✅ Token Creation (8 tests)
- ✅ Transfers (8 tests)
- ✅ Admin Functions (9 tests)
- ✅ Edge Cases (18 tests)
- ✅ Events (6 tests)
- ✅ Security (6 tests)

### **Frontend Tests** (Pendiente):

```bash
cd web

# Unit tests (cuando estén implementados)
npm test

# E2E tests (cuando estén implementados)
npm run test:e2e
```

---

## 🐛 Troubleshooting

### **Problema: Anvil no inicia**

**Síntomas**:
- Error: "Connection refused" al deployar
- Puerto 8545 no responde

**Soluciones**:
```bash
# 1. Verificar si hay otro proceso en el puerto
lsof -i :8545

# 2. Detener procesos en ese puerto
kill -9 $(lsof -ti:8545)

# 3. Reiniciar con el script
./deploy.sh restart
```

### **Problema: Contrato no se despliega**

**Síntomas**:
- Error: "No se pudo obtener la dirección del contrato"
- Logs de deploy vacíos

**Soluciones**:
```bash
# 1. Verificar que Anvil esté corriendo
./deploy.sh status

# 2. Ver logs del deployment
cat logs/deploy.log

# 3. Compilar manualmente
cd sc && forge build

# 4. Deployar manualmente
PRIVATE_KEY=0xac09... forge script script/SupplyChainDeploy.s.sol --rpc-url http://127.0.0.1:8545 --broadcast

# 5. Copiar dirección y actualizar config.ts manualmente
```

### **Problema: Frontend no conecta con MetaMask**

**Síntomas**:
- Botón "Conectar" no hace nada
- Error en consola del navegador

**Soluciones**:
```bash
# 1. Verificar que MetaMask esté en red Anvil Local (Chain ID: 31337)
# 2. Refrescar la página (F5)
# 3. Ver logs del frontend
cat logs/frontend.log

# 4. Verificar que wagmi-config.ts tenga la URL correcta
cat web/src/lib/wagmi-config.ts

# 5. Reiniciar frontend
./deploy.sh restart
```

### **Problema: Dirección del contrato incorrecta**

**Síntomas**:
- Error: "Contract not found" al llamar funciones
- Stats cards no cargan

**Soluciones**:
```bash
# 1. Ver dirección actual en config.ts
cat web/src/contracts/config.ts | grep SUPPLY_CHAIN_ADDRESS

# 2. Ver dirección deployada
cat logs/contract_address.txt

# 3. Si no coinciden, actualizar manualmente
# O redesplegar:
./deploy.sh restart
```

### **Problema: Transacción falla en MetaMask**

**Síntomas**:
- MetaMask muestra error al enviar transacción
- "Gas estimation failed"

**Soluciones**:
```bash
# 1. Verificar que la cuenta conectada sea la correcta
# 2. Verificar que haya fondos suficientes
# 3. Verificar que el contrato esté desplegado
./deploy.sh status

# 4. Si persiste, ver logs de Anvil
cat logs/anvil.log

# 5. Reiniciar Anvil
./deploy.sh restart
```

### **Problema: Frontend muestra "0" en todos los contadores**

**Síntomas**:
- Stats cards muestran: 0 Tokens, 0 Usuarios, 0 Transferencias
- Pero es correcto al inicio

**Explicación**:
Esto es **NORMAL** al inicio. El contrato recién deployado no tiene:
- Tokens creados
- Usuarios registrados (el owner no cuenta)
- Transferencias realizadas

**Para ver datos**:
1. Registrar usuarios con `requestUserRole()`
2. Aprobar usuarios (solo owner)
3. Crear tokens con `createToken()`
4. Realizar transferencias con `transfer()`

---

## 🗺️ Roadmap

### **✅ Completado (Días 1-8 - 18-24 Nov 2025)**:

- [x] Smart contract implementado y testeado (970+ líneas, 108 tests, 85.60% coverage, 72.15% branches)
- [x] Validaciones críticas del contrato (5 validaciones completadas)
- [x] Frontend base con Next.js 16 + TypeScript + Tailwind
- [x] Integración Web3 con wagmi + viem + ethers
- [x] Componentes UI con Shadcn (9 componentes)
- [x] 15 hooks personalizados (5 lectura + 7 escritura + 3 admin)
- [x] Script de deployment automatizado (`deploy.sh`)
- [x] Documentación completa del proyecto
- [x] Conexión MetaMask funcionando
- [x] Landing page con stats en tiempo real
- [x] Header unificado con navegación y branding
- [x] Theme toggle (modo claro/oscuro) con persistencia por usuario ⭐ Día 4
- [x] Admin panel completo (gestión de usuarios)
- [x] Formulario de registro con validaciones
- [x] Multi-tab synchronization (parcial: solo desconexiones, reconexión automática POSTPONED)
- [x] Seguridad: restricciones por rol y estado
- [x] Dashboard completo con perfil, tokens y acciones ⭐ Día 4
- [x] Sistema de pausabilidad completo integrado ⭐ Día 4
- [x] AuthContext optimizado para redirecciones rápidas ⭐ Día 4
- [x] Página de Tokens (lista) con filtros y búsqueda ⭐ Día 5
- [x] Página de Crear Token con validaciones ⭐ Día 6
- [x] Diseño Moderno 2025 aplicado a 6 páginas ⭐ Día 6-7
- [x] Página de Transferencias completa con CreateTransferForm ⭐ Día 7
- [x] Componentes nuevos: CreateTransferForm, UserTokenList, AddressDisplay ⭐ Día 7
- [x] Hooks nuevos: useGetUserTransfers, useUserTokenStats, useGetUserTokensWithData ⭐ Día 7
- [x] Panel Admin principal (`/admin`) ⭐ Día 8
- [x] Página de Detalles de Token (`/tokens/[id]`) con trazabilidad end-to-end ⭐ Día 8
- [x] Página de Transferir desde Detalles (`/tokens/[id]/transfer`) ⭐ Día 8
- [x] Hook `useGetAllTransfers` para estadísticas del sistema ⭐ Día 8
- [x] Hook `useTokenTraceability` para árbol jerárquico ⭐ Día 8
- [x] Componente `TraceabilityTimeline` con expand/collapse ⭐ Día 8
- [x] Validaciones críticas del contrato (5 validaciones) ⭐ Día 7
- [x] Tests adicionales (108 tests totales, 85.60% coverage, 72.15% branches) ⭐ Día 7

### **✅ Día 4 (20 Nov)**: Dashboard y Optimizaciones ✅ COMPLETADO

- [x] Dashboard completo con UserProfileCard, QuickActions, TokenCard
- [x] Sistema de pausabilidad completo (PauseControl, validaciones)
- [x] ErrorBoundary global implementado
- [x] Validación completa de datos (validation.ts)
- [x] Optimización de performance (useDashboardStats con batch reads)
- [x] Tests implementados (Vitest + Playwright, 17 tests pasando)
- [x] Accesibilidad (ARIA labels, WCAG AA)
- [x] Animaciones (transiciones suaves, hover effects)

### **✅ Día 5 (21 Nov)**: Tokens - Lista ✅ COMPLETADO

- [x] Página `/tokens` completa con filtros y búsqueda
- [x] Hook `useGetAllTokens()` optimizado con batch reads
- [x] Filtros por tipo de token (condicionales por rol)
- [x] Búsqueda en tiempo real con normalización de acentos
- [x] Paginación (12 tokens por página)
- [x] Diseño Moderno 2025 aplicado

### **✅ Día 6 (21 Nov)**: Tokens - Crear + Diseño Moderno ✅ COMPLETADO

- [x] Página `/tokens/create` completa con validaciones
- [x] Validación en tiempo real de balance de parent token
- [x] Restricciones de input basadas en balance disponible
- [x] Diseño Moderno 2025 aplicado a todas las páginas principales
- [x] TokenCardModern.tsx creado (glassmorphism, gradientes)
- [x] PauseControl actualizado con diseño moderno

### **🔄 Pendiente (Días 5-7 - 22-24 Nov 2025)**:
- [x] Página `/dashboard`
- [x] Mostrar perfil del usuario conectado (UserProfileCard)
- [x] Mostrar rol y estado (Pending/Approved/etc.)
- [x] Lista de tokens propios (TokenCard)
- [x] Acciones rápidas (QuickActions)
- [x] Control de pausa para admin (PauseControl)
- [x] Estadísticas (solo admin ve "Total Users")
- [x] Redirección inmediata para usuarios no autenticados

#### **Día 5 (21 Nov)**: Gestión de Tokens - Lista ✅ COMPLETADO
- [x] Página `/tokens` ✅
- [x] Tabla de todos los tokens ✅
- [x] Hook `useGetAllTokens()` implementado ✅
- [x] Filtros por tipo (RowMaterial/FinishedProduct) ✅
- [x] Búsqueda por nombre (con normalización de acentos) ✅
- [x] Paginación (12 tokens por página) ✅
- [x] Diseño Moderno 2025 aplicado ✅

#### **Día 6 (21 Nov)**: Crear Token ✅ COMPLETADO
- [x] Página `/tokens/create` ✅
- [x] Formulario con validaciones ✅
- [x] Select para tipo de token ✅
- [x] Input para supply con validación ✅
- [x] Textarea para features (JSON) ✅
- [x] Select para parent token (si aplica) ✅
- [x] Validación en tiempo real de balance de parent token ✅
- [x] Loading states durante creación ✅
- [x] Alert de éxito/error ✅
- [x] Diseño Moderno 2025 aplicado ✅

#### **Día 6 (21 Nov)**: Diseño Moderno 2025 ✅ COMPLETADO
- [x] TokenCardModern.tsx creado (glassmorphism) ✅
- [x] Diseño moderno aplicado a 5 páginas principales ✅
- [x] PauseControl con diseño moderno ✅
- [x] Variable de entorno NEXT_PUBLIC_MODERN_DESIGN ✅

#### **Pendiente**: Detalles de Token
- [ ] Página `/tokens/[id]`
- [ ] Información completa del token
- [ ] Historial de transferencias
- [ ] Botón para transferir (si aplica)
- [ ] Gráfico de supply chain

#### **✅ Día 7 (22 Nov)**: Transferencias ✅ COMPLETADO
- [x] Página `/transfers` ✅
- [x] Tabla de transferencias con separación sent/received (Factory/Retailer) ✅
- [x] Filtros: Enviadas/Recibidas/Pending/Accepted/Rejected por rol ✅
- [x] Botones de acción (Accept/Reject/Cancel) con estilo uniforme ✅
- [x] CreateTransferForm con validaciones y dropdowns filtrados ✅
- [x] Componente AddressDisplay para direcciones clickeables ✅
- [x] Loading states y actualizaciones automáticas ✅
- [x] Estadísticas separadas (sent/received) en dashboard ✅
- [x] Mejoras en dashboard: "My Tokens by Type" simplificado ✅
- [x] Mejoras en /tokens: "My Tokens by Type" con tarjetas completas ✅

#### **Día 7 (24 Nov)**: Validaciones Críticas del Contrato ✅ COMPLETADO
- [x] Validación: Usuario cancelado no puede registrar
- [x] Validación: Longitud mínima nombre (2 chars)
- [x] Validación: Rol por tipo de token en transfer()
- [x] Validación: Rol por tipo de token en acceptTransfer()
- [x] Validación: Rol por tipo de token en rejectTransfer()
- [x] Tests adicionales (8 nuevos tests)
- [x] Coverage mejorado (85.60% lines, 72.15% branches)

#### **Día 8 (23 Nov)**: Panel Admin y Páginas Adicionales ✅ COMPLETADO
- [x] Página `/admin` - Panel principal de administración
- [x] Página `/tokens/[id]` - Detalles con trazabilidad end-to-end
- [x] Página `/tokens/[id]/transfer` - Transferir desde detalles
- [x] Hook `useGetAllTransfers` para estadísticas del sistema
- [x] Hook `useTokenTraceability` para árbol jerárquico
- [x] Componente `TraceabilityTimeline` con expand/collapse

### **🎯 Semana 2 (25-28 Nov 2025)**:

#### **Día 9 (24 Nov)**: Video Demo (PRÓXIMO)
- [ ] Script del video (5 minutos)
- [ ] Grabación con OBS/Loom:
  - Arquitectura del proyecto
  - Demo de tests pasando
  - Demo de frontend completo
  - Demo de panel admin
  - Flujo E2E completo
- [ ] Edición básica
- [ ] Upload a plataforma

#### **Día 12 (28 Nov)**: Entrega Final
- [ ] Verificar checklist completo
- [ ] Backup del proyecto
- [ ] Push final a GitHub
- [ ] Verificar que todo compile
- [ ] Verificar que todos los tests pasen
- [ ] Documentación final revisada
- [ ] **ENTREGA** 🚀

---

## 📊 Métricas del Proyecto

### **Smart Contract**:
- **Líneas de código**: 971
- **Tests**: 80 (100% passing)
- **Coverage**: 85.60% lines, 72.15% branches
- **Funciones**: 42
- **Eventos**: 6
- **Modificadores**: 2

### **Frontend**:
- **Líneas de código**: ~4,000+
- **Archivos creados**: 25+
- **Archivos modificados**: 10+
- **Hooks**: 21 (16 lectura + 9 escritura, incluye useGetUserTransfers, useUserTokenStats, useGetUserTokensWithData)
- **Componentes**: 25 (11 Shadcn + 14 personalizados, incluye TokenCardModern, CreateTransferForm, UserTokenList, AddressDisplay)
- **Páginas**: 6 de 9 (67%) - Todas con Diseño Moderno 2025
- **Features**: Theme toggle, Multi-tab sync, Admin panel completo, Diseño Moderno 2025

### **Tiempo de Desarrollo**:
- **Smart Contract**: ~6 horas (Día 1)
- **Frontend Setup**: ~2 horas (Día 1)
- **Deployment Script**: ~1 hora (Día 1)
- **Documentación**: ~1 hora (Día 1)
- **Admin Panel**: ~6 horas (Día 2-3)
- **UI/UX Refinements**: ~4 horas (Día 3)
- **Dashboard y Optimizaciones**: ~8 horas (Día 4)
- **Tokens (Lista + Crear)**: ~8 horas (Día 5-6)
- **Diseño Moderno 2025**: ~4 horas (Día 6)
- **Total Días 1-6**: ~40 horas

---

## 🎓 Recursos

### **Documentación Oficial**:
- [Solidity Docs](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [viem Docs](https://viem.sh)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

### **OpenZeppelin**:
- [Contracts](https://docs.openzeppelin.com/contracts/)
- [Ownable](https://docs.openzeppelin.com/contracts/access#ownership)
- [Pausable](https://docs.openzeppelin.com/contracts/api/security#Pausable)

### **MetaMask**:
- [Developer Docs](https://docs.metamask.io/)
- [Getting Started](https://docs.metamask.io/wallet/get-started/set-up-dev-environment/)

---

## 👥 Equipo

**Proyecto Académico**: PFM/TFM - Supply Chain Tracker  
**Institución**: Master Blockchain Web3  
**Fecha límite**: 28 de Noviembre, 2025  
**Versión**: 2.2.0

---

## 📝 Changelog

### v2.2.0 (28 Nov 2025)
- ✅ **Instalación automática de Foundry** - deploy.sh ahora instala forge/anvil automáticamente usando foundryup
- ✅ **Compatibilidad completa con macOS** - Probado en darwin 25.1.0 (macOS Sequoia)
- ✅ **Corrección de grep -oP** - Reemplazado con sed/grep -oE para compatibilidad con BSD grep
- ✅ **Documentación mejorada** - Actualizada para reflejar nuevas características

### v2.1.0 (27 Nov 2025)
- ✅ Persistencia de estado para Anvil
- ✅ Comandos solo para frontend (start/stop/restart)
- ✅ Comando clean para resetear estado de blockchain
- ✅ Gestión de procesos mejorada

### v1.0.0 (18 Nov 2025)
- ✅ Lanzamiento inicial
- ✅ Smart contract implementado y testeado
- ✅ Frontend base con conexión MetaMask
- ✅ Script de deployment automatizado
- ✅ Documentación completa

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico y se proporciona con fines educativos.

---

## 🗂️ Estructura de Documentación

```
📁 Proyecto Root
│
├── 📄 README.md                    ⭐ README original del proyecto
├── 📄 QUICKSTART.md                ⭐ Quick start (INICIO AQUÍ)
├── 📄 INDEX.md                     ⭐ Índice maestro de documentación
├── 📄 STATUS.md                    ⭐ Single source of truth del estado
├── 📄 TODO.md                      ⭐ Tareas pendientes
├── 📄 CHANGELOG.md                 ⭐ Historial de cambios
├── 📄 CONTRIBUTING.md              ⭐ Guía de contribución
├── 📄 IA.md                        ⭐ Retrospectiva uso de IA
├── 🚀 deploy.sh                    ⭐ Script automatizado (Linux/Mac)
├── 🚀 deploy.ps1                   ⭐ Script automatizado (Windows)
│
├── 📁 docs/                        ⭐ Documentación consolidada
│   ├── DOCUMENTATION.md            ⭐ Este archivo (guía técnica completa)
│   ├── FRONTEND.md                 ⭐ Documentación completa del frontend
│   ├── SMART_CONTRACT.md           ⭐ Documentación completa del smart contract
│   ├── REPORTS.md                  ⭐ Reportes consolidados (generales, SC, FE)
│   ├── RESEARCH.md                 ⭐ Investigación técnica consolidada
│   └── reports/
│       └── REPORTE_REORGANIZACION_FINAL.md
│
├── 📁 sc/                          ⭐ Smart Contract
│   ├── src/SupplyChain.sol
│   ├── test/
│   └── script/
│
├── 📁 web/                         ⭐ Frontend Next.js
│   ├── src/
│   │   ├── app/                    (9 páginas)
│   │   ├── components/             (26 componentes)
│   │   ├── hooks/                  (24 hooks)
│   │   ├── contracts/
│   │   └── lib/
│   └── package.json
│
└── 📁 logs/                        ⭐ Logs de ejecución
    ├── anvil.log
    ├── anvil_state.json            (Estado persistente)
    ├── frontend.log
    ├── deploy.log
    └── contract_address.txt
```

### 📊 Principios de Documentación

1. **Single Source of Truth**: [`STATUS.md`](../STATUS.md) es la fuente única de verdad para el estado del proyecto
2. **Consolidación**: Documentación consolidada para evitar redundancias
3. **Organización**: Estructura lógica de básico a avanzado
4. **Actualización**: Fechas actualizadas a 27 de Noviembre, 2025

### Estadísticas de Documentación

- **Archivos en raíz**: 8 archivos principales
- **Documentación frontend**: 1 archivo consolidado (`docs/FRONTEND.md`)
- **Documentación smart contract**: 1 archivo consolidado (`docs/SMART_CONTRACT.md`)
- **Investigación consolidada**: 1 archivo (`docs/RESEARCH.md`)
- **Reportes consolidados**: 1 archivo (`docs/REPORTS.md`)
- **Documentación técnica**: 1 archivo (`docs/DOCUMENTATION.md`)

---

**Última actualización**: 28 de Noviembre, 2025
