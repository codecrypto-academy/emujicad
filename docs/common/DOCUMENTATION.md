# 📚 Documentación Completa - Supply Chain Tracker

**Fecha**: 21 Noviembre 2025  
**Versión**: 1.2.0  
**Proyecto**: Supply Chain DApp (PFM Web3)

---

## 📑 Índice

1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Arquitectura](#arquitectura)
3. [Smart Contract](#smart-contract)
4. [Frontend](#frontend)
5. [Deployment Automatizado](#deployment-automatizado)
6. [Configuración de MetaMask](#configuración-de-metamask)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Roadmap](#roadmap)

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

- **Smart Contract**: 971 líneas de código
- **Tests**: 80 tests (100% passing)
- **Coverage**: 83.33% líneas, 80.09% statements, 64.41% branches
- **Frontend**: ~4,000+ líneas de código productivo
- **Hooks**: 21 hooks personalizados (incluye useDashboardStats optimizado, useGetUserTransfers, useUserTokenStats, useGetUserTokensWithData)
- **Componentes**: 25 componentes (15 personalizados + 10 Shadcn UI, incluye TokenCardModern, CreateTransferForm, UserTokenList, AddressDisplay)
- **Páginas**: 6 de 9 implementadas (67%) - Todas con Diseño Moderno 2025
- **Tests Frontend**: 17 tests (14 unitarios + 3 E2E) pasando
- **Tiempo de desarrollo**: ~55 horas (Días 1-7)
- **Estado**: 7.2/9.5 ✅ APROBATORIO (90% Frontend)

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
Lines:      83.33% (168/202)
Statements: 80.09% (180/224)
Branches:   61.22% (30/49)
Functions:  80.95% (34/42)
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

### **Script**: `deploy.sh`

Script bash completo que automatiza TODO el proceso de deployment.

### **Comandos Disponibles**:

```bash
# Ver ayuda
./deploy.sh help

# Iniciar todo el stack
./deploy.sh start

# Ver estado
./deploy.sh status

# Instrucciones MetaMask
./deploy.sh metamask

# Detener todo
./deploy.sh stop

# Reiniciar
./deploy.sh restart
```

### **Flujo de `./deploy.sh start`**:

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

# 2. Actualiza SUPPLY_CHAIN_ADDRESS con sed
sed -i "s/0x[a-fA-F0-9]\{40\}/$contract_address/" config.ts

# 3. Verifica que se actualizó correctamente
```

**Resultado**:
- ✅ `config.ts` actualizado con nueva dirección
- ✅ Backup guardado en `config.ts.backup`

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
├── frontend.log           # Output de Next.js dev server
├── frontend.pid           # PID del proceso Next.js
├── deploy.log             # Output del deployment Foundry
└── contract_address.txt   # Dirección del contrato deployado
```

### **Gestión de Procesos**:

El script gestiona los procesos de forma inteligente:

- **Verificación de puertos**: Detecta si un servicio ya está corriendo
- **PIDs persistentes**: Guarda PIDs para detener servicios correctamente
- **Logs separados**: Cada servicio tiene su propio archivo de log
- **Graceful shutdown**: Intenta SIGTERM primero, luego SIGKILL si es necesario
- **Validación de estado**: Espera a que los servicios estén listos antes de continuar

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

### **✅ Completado (Días 1-4 - 18-21 Nov 2025)**:

- [x] Smart contract implementado y testeado (934 líneas, 73 tests)
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

#### **Día 7 (24 Nov)**: Panel Admin
- [ ] Página `/admin`
- [ ] Tabla de usuarios registrados
- [ ] Filtros por rol y estado
- [ ] Botones de acción (Approve/Reject/Suspend)
- [ ] Estadísticas globales
- [ ] Logs de eventos importantes
- [ ] Protección: Solo accesible por owner

### **🎯 Semana 2 (25-28 Nov 2025)**:

#### **Día 8 (25 Nov)**: E2E Testing
- [ ] Tests de flujo completo de usuario
- [ ] Tests de flujo de transferencias
- [ ] Tests de panel admin
- [ ] Tests de manejo de errores
- [ ] Scripts de testing automatizado

#### **Días 9-10 (25-26 Nov)**: Documentación IA
- [ ] Archivo `IA.md` con:
  - IAs utilizadas (ChatGPT, Claude, Copilot)
  - Tiempo consumido por tarea
  - Errores encontrados y soluciones
  - Prompts efectivos
  - Lecciones aprendidas
  - Comparación de IAs

#### **Día 11 (27 Nov)**: Video Demo
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
- **Coverage**: 83.33% lines, 64.41% branches
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
**Versión**: 1.0.0

---

## 📝 Changelog

### v1.0.0 (18 Nov 2025)
- ✅ Initial release
- ✅ Smart contract implementado y testeado
- ✅ Frontend base con conexión MetaMask
- ✅ Script de deployment automatizado
- ✅ Documentación completa

---

## 📄 Licencia

Este proyecto es parte de un trabajo académico y se proporciona con fines educativos.

---

**Última actualización**: 21 de Noviembre, 2025 - Día 6
