# 🚀 Quick Start - Supply Chain Tracker

> **📚 COMPLETE DOCUMENTATION**: See [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) for comprehensive project guide

---

## 🚀 Primera Vez - Setup Completo

### Paso 1: Clonar el Repositorio

```bash
git clone <repo-url>
cd emujicad
```

### Paso 2: Dar Permisos al Script

```bash
chmod +x deploy.sh
```

### Paso 3: Setup Automático (Recomendado)

El script puede verificar e instalar automáticamente todo lo necesario:

```bash
# Verificar requisitos e instalar dependencias faltantes
./deploy.sh setup

# O en modo automático (sin confirmaciones)
./deploy.sh setup --yes
```

Este comando:
- ✅ Verifica herramientas del sistema (lsof, netstat, ss, curl, pgrep)
- ✅ Instala herramientas faltantes (con tu confirmación y sudo)
- ✅ Verifica Node.js v18+, npm, Foundry
- ✅ Instala dependencias del frontend (`npm install` en `web/`)
- ✅ Instala dependencias del smart contract (`forge install` en `sc/`)
- ✅ Opcionalmente configura variables de entorno

### Paso 4: Configurar Variables de Entorno (Opcional)

```bash
# Modo interactivo (recomendado para primera vez)
./deploy.sh env

# O con parámetros
./deploy.sh env --modern-design true --debug-mode false
./deploy.sh env --all true false false

# O en modo automático (usa valores por defecto)
./deploy.sh env --yes
```

**Variables disponibles:**
- `NEXT_PUBLIC_MODERN_DESIGN`: Diseño moderno 2025 (glassmorphism, gradientes)
- `NEXT_PUBLIC_DEBUG_MODE`: Logs adicionales en consola
- `NEXT_PUBLIC_DEBUG_TOKENS`: Información adicional de tokens

**Valores por defecto** (si no configuras):
- `NEXT_PUBLIC_MODERN_DESIGN=true`
- `NEXT_PUBLIC_DEBUG_MODE=false`
- `NEXT_PUBLIC_DEBUG_TOKENS=false`

**📝 Nota sobre el archivo de configuración:**
Si prefieres crear el archivo manualmente, debes crear un archivo llamado **`.env.local`** (no `.env.example`) en el directorio `web/` con el siguiente contenido:

```bash
# Supply Chain Tracker - Environment Variables
# Este archivo debe llamarse .env.local (no .env.example)

# Modern Design 2025 (glassmorphism, gradients, animations)
# Options: true | false
NEXT_PUBLIC_MODERN_DESIGN=true

# Debug Mode (additional console logs)
# Options: true | false
NEXT_PUBLIC_DEBUG_MODE=false

# Debug Tokens (additional token information)
# Options: true | false
NEXT_PUBLIC_DEBUG_TOKENS=false
```

**⚠️ IMPORTANTE:** El archivo debe llamarse exactamente **`.env.local`** (con el punto al inicio). El archivo `.env.example` es solo un template de referencia que puedes copiar, pero el archivo real que usa Next.js debe llamarse `.env.local`.

### Paso 5: Iniciar el Proyecto

```bash
./deploy.sh start

# O en modo automático
./deploy.sh start --yes
```

El script automáticamente:
1. Verifica que todo esté instalado (si no, te pregunta si quieres instalarlo)
2. Inicia Anvil (blockchain local)
3. Despliega el smart contract
4. Actualiza la configuración del frontend
5. Inicia el servidor Next.js

### Paso 6: Configurar MetaMask

```bash
./deploy.sh metamask
```

Sigue las instrucciones mostradas para:
- Agregar la red Anvil Local
- Importar cuentas de prueba
- Conectar a la DApp en http://localhost:3000

---

## 📊 Frontend Implementation Status

> **📋 For the most up-to-date project status, see [STATUS.md](./STATUS.md)**  
> **📚 For complete pages and components documentation, see [docs/FRONTEND.md](./docs/FRONTEND.md)**

### 📄 Implemented Pages (9/9 - 100%)

```
web/src/app/
├── page.tsx                    ✅ IMPLEMENTED - Landing with MetaMask + Stats (Modern Design 2025)
├── dashboard/page.tsx          ✅ IMPLEMENTED - Complete role-based main panel (Modern Design 2025)
├── tokens/
│   ├── page.tsx               ✅ IMPLEMENTED - User token list (Modern Design 2025) ⭐ Day 5
│   ├── create/page.tsx        ✅ IMPLEMENTED - Create token form (Modern Design 2025) ⭐ Day 6
│   ├── [id]/page.tsx          ✅ IMPLEMENTED - Token details with traceability ⭐ Day 8
│   └── [id]/transfer/page.tsx ✅ IMPLEMENTED - Transfer from details ⭐ Day 8
├── transfers/page.tsx         ✅ IMPLEMENTED - Complete transfer management (Modern Design 2025) ⭐ Day 7
├── admin/
│   ├── page.tsx               ✅ IMPLEMENTED - Main admin panel ⭐ Day 8
│   └── users/page.tsx         ✅ IMPLEMENTED - Complete user management (Modern Design 2025)
└── profile/page.tsx           ✅ IMPLEMENTED - User profile ⭐ Day 8
```

**Progress**: 9/9 pages (100%) ✅

### 🧩 Specific Components (6/6 implemented)

```
web/src/components/
├── ConnectWallet.tsx          ✅ IMPLEMENTED - MetaMask connection
├── Header.tsx                 ✅ IMPLEMENTED - Navigation + branding + pause badge
├── ThemeToggle.tsx            ✅ IMPLEMENTED - Light/dark mode with persistence
├── TokenCard.tsx              ✅ IMPLEMENTED - Complete token card
├── TokenCardModern.tsx        ✅ IMPLEMENTED - Modern 2025 card (glassmorphism) ⭐ Day 6
└── TransferList.tsx           ✅ IMPLEMENTED - Transfer list with filters and actions ⭐ Day 7
```

**Progress**: 6/6 specific components (100%) ✅

### 🎨 Additional Implemented Components

```
web/src/components/
├── RegisterForm.tsx           ✅ Registration form with pause validation
├── ChangeRoleDialog.tsx       ✅ Change role dialog with pause validation
├── UserProfileCard.tsx        ✅ User profile
├── QuickActions.tsx           ✅ Quick actions with pause validation
├── CreateTransferForm.tsx     ✅ Create transfer form ⭐ Day 7
├── UserTokenList.tsx          ✅ User token list ⭐ Day 7
├── AddressDisplay.tsx         ✅ Addresses with copy/tooltip ⭐ Day 7
├── TraceabilityTimeline.tsx   ✅ End-to-end traceability ⭐ Day 8
└── admin/
    ├── UserManagementTable.tsx  ✅ User management table with filters + pause
    ├── UserStatsCards.tsx       ✅ System statistics cards
    ├── PauseControl.tsx         ✅ Contract pause control
    └── OwnershipTransfer.tsx    ✅ Ownership transfer management ⭐
```

**Total custom components**: 26 implemented  
**Shadcn UI Components**: 11 components (button, card, input, label, select, table, badge, dialog, alert, skeleton, textarea)

> **📚 See complete documentation**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### 🎨 Modern Design 2025 ⭐ NEW
**Implemented features**:
- Glassmorphism (glass effects with `backdrop-blur-xl`)
- Blue-purple gradients on titles and buttons
- Smooth animations and hover effects
- Rounded borders (`rounded-2xl`, `rounded-3xl`)
- Modern shadows (`shadow-lg`, `shadow-2xl`)
- Controlled by environment variable: `NEXT_PUBLIC_MODERN_DESIGN=true`

**Pages with modern design**:
- ✅ Landing (`/`)
- ✅ Dashboard (`/dashboard`)
- ✅ Tokens (`/tokens`)
- ✅ Create Token (`/tokens/create`)
- ✅ Transfers (`/transfers`) ⭐ Day 7
- ✅ Admin Users (`/admin/users`)

### 🪝 Custom Hooks

> **📚 For complete documentation of all hooks, see [docs/FRONTEND.md](./docs/FRONTEND.md)**

**Total**: 24 custom hooks (14 files) ✅

**Main files**:
```
web/src/hooks/
├── useContractReads.ts        ✅ 6 read hooks (userInfo, isAdmin, totals, dashboard stats)
├── useRequestRole.ts          ✅ Request user role
├── useCreateToken.ts          ✅ Create tokens
├── useTransfer.ts             ✅ 4 transfer hooks (transfer, accept, reject, cancel)
├── useAdminUsers.ts           ✅ 2 admin hooks (getAllUsers, changeUserStatus)
├── useContractOwner.ts        ✅ Verify contract ownership
├── usePendingOwner.ts         ✅ Get pendingOwner
├── useOwnershipTransfer.ts    ✅ 3 ownership functions (initiate, accept, reject)
├── useGetUserTokens.ts        ✅ 4 token hooks (getUserTokens, getToken, getTokenBalance, useGetAllTokens)
├── usePause.ts                ✅ 3 pause hooks (isPaused, pause, unpause)
├── useUserTokenStats.ts        ✅ Stats by type ⭐ Day 7
├── useGetUserTokensWithData.ts ✅ Tokens with complete data ⭐ Day 7
├── useGetUserTransfers.ts     ✅ User transfers ⭐ Day 7
├── useGetAllTransfers.ts      ✅ All system transfers ⭐ Day 8
└── useTokenTraceability.ts    ✅ End-to-end traceability ⭐ Day 8
```

> **📚 See complete list and detailed documentation**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### 📁 `contexts/` Directory

✅ **Implemented**: `src/contexts/AuthContext.tsx`
- Authentication and authorization management
- Admin vs approved users detection
- Redirect optimization (useUserIdByAddress)
- User theme preference restoration
- Optimized loading state handling

---

## 🚀 Next Steps (Roadmap)

### Start the project in 3 commands:

```bash
# 1. Give script permissions (first time only)
chmod +x deploy.sh

# 2. Start EVERYTHING (Anvil + Contract + Frontend)
./deploy.sh start

# 3. See MetaMask instructions
./deploy.sh metamask
```

**Ready!** Open http://localhost:3000 and connect MetaMask.

---

## 📋 `deploy.sh` Script Commands

> **📚 For complete script documentation, see [docs/DOCUMENTATION.md - Automated Deployment](./docs/DOCUMENTATION.md#-deployment-automatizado)**

### Main Commands

```bash
./deploy.sh start      # Start entire stack (Anvil + Contract + Frontend)
./deploy.sh stop       # Stop all services
./deploy.sh restart    # Restart entire stack
./deploy.sh status     # See service status
./deploy.sh metamask   # Instructions to configure MetaMask
./deploy.sh clean      # Clean Anvil persistent state (requires Anvil stopped)
./deploy.sh help       # Complete help with all commands
```

### Frontend Commands (without affecting Anvil/Contract)

```bash
./deploy.sh frontend start    # Start only frontend (requires Anvil running)
./deploy.sh frontend stop     # Stop only frontend
./deploy.sh frontend restart  # Restart only frontend
```

**Typical usage**: After making frontend changes, you can restart only the frontend without affecting Anvil or the deployed contract.

### Script Features

✅ **State Persistence**: Anvil saves blockchain state between restarts  
✅ **Smart Detection**: Detects if services are already running before starting them  
✅ **Automatic Validation**: Verifies contract is deployed before starting frontend  
✅ **Automatic Update**: Updates ABI and contract address in frontend automatically  
✅ **Organized Logs**: All logs saved in `logs/`  
✅ **Error Handling**: Clear validations and error messages

---

## 📖 Available Documentation

> **📚 For complete documentation index, see [INDEX.md](./INDEX.md)**

### Main Documentation
- **[STATUS.md](./STATUS.md)** ⭐ - Single source of truth for project status
- **[QUICKSTART.md](./QUICKSTART.md)** - This quick guide
- **[INDEX.md](./INDEX.md)** - Master index of all documentation
- **[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)** - Complete technical guide

### Component Documentation
- **[docs/FRONTEND.md](./docs/FRONTEND.md)** - Complete frontend documentation
- **[docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)** - Complete smart contract documentation

### Reports and Evaluations
- **[docs/REPORTS.md](./docs/REPORTS.md)** - Consolidated project reports
- **[docs/RESEARCH.md](./docs/RESEARCH.md)** - Technical research and analysis
- **[IA.md](./IA.md)** ⭐ - AI usage retrospective

---

## 🛠️ Technology Stack

> **📚 For detailed stack information, see [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)**

### Smart Contract
- **Solidity** 0.8.30
- **Foundry** (Forge + Anvil)
- **OpenZeppelin** Contracts
- **970+ lines** of code
- **108 tests** (85.60% lines, 72.15% branches, 82.67% statements, 80.95% functions)
- **Critical validations**: 5 implemented (100% completed)

> **📚 See complete documentation**: [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)

### Frontend
- **Next.js** 16.0.1
- **React** 19.2.0
- **TypeScript** 5.x
- **Tailwind CSS** 3.4.14
- **Shadcn UI**
- **wagmi** 2.12.0 + **viem** 2.21.0 + **ethers** 6.13.0

> **📚 See complete documentation**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### Local Blockchain
- **Anvil** (Foundry)
- **Chain ID**: 31337
- **RPC**: http://127.0.0.1:8545
- **15 accounts** with 10,000 ETH each

---

## 🔧 Requirements

Make sure you have installed:

```bash
# Node.js and npm
node --version  # v18+
npm --version   # v9+

# Foundry
forge --version
anvil --version

# Git
git --version
```

### Install Foundry (if you don't have it):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## 📖 Manual Setup Guide (All Operating Systems)

> **⚠️ IMPORTANTE**: Esta guía es para usuarios que prefieren instalar y configurar todo manualmente, o que no pueden usar el script automatizado `deploy.sh`.  
> **💡 RECOMENDADO**: Si estás en Linux, usa el script automatizado: `./deploy.sh setup`

Esta guía cubre la instalación manual completa en **Linux**, **Windows** y **macOS**.

---

## 📋 Requisitos del Sistema

### Requisitos Comunes (Todos los SO)

| Herramienta | Versión Mínima | Descripción |
|------------|----------------|-------------|
| **Node.js** | v18.0.0+ | Runtime de JavaScript |
| **npm** | v9.0.0+ | Gestor de paquetes de Node.js |
| **Foundry** | Latest | Suite de herramientas para desarrollo de smart contracts |
| **Git** | Latest | Control de versiones |
| **MetaMask** | Latest | Extensión de navegador para conectar con blockchain |

### Herramientas Adicionales (Linux)

| Herramienta | Descripción | Paquete |
|------------|-------------|---------|
| **lsof** | Listar archivos abiertos | `lsof` |
| **netstat** | Estadísticas de red | `net-tools` |
| **ss** | Utilidad de sockets | `iproute2` |
| **curl** | Cliente HTTP | `curl` |
| **pgrep** | Buscar procesos | `procps` o `procps-ng` |

---

## 🐧 Linux - Instalación Manual Completa

### Paso 1: Instalar Node.js y npm

#### Ubuntu/Debian:
```bash
# Opción A: Usando NodeSource (Recomendado)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Opción B: Usando apt (puede tener versión antigua)
sudo apt-get update
sudo apt-get install -y nodejs npm

# Verificar instalación
node --version  # Debe ser v18 o superior
npm --version   # Debe ser v9 o superior
```

#### Fedora/RHEL/CentOS:
```bash
# Instalar Node.js y npm
sudo dnf install -y nodejs npm

# Verificar instalación
node --version
npm --version
```

#### Arch Linux/Manjaro:
```bash
# Instalar Node.js y npm
sudo pacman -S nodejs npm

# Verificar instalación
node --version
npm --version
```

#### openSUSE:
```bash
# Instalar Node.js y npm
sudo zypper install nodejs npm

# Verificar instalación
node --version
npm --version
```

### Paso 2: Instalar Foundry

```bash
# Instalar Foundry (funciona en todas las distribuciones Linux)
curl -L https://foundry.paradigm.xyz | bash

# Agregar Foundry al PATH (si no se agregó automáticamente)
export PATH="$HOME/.foundry/bin:$PATH"

# O agregar permanentemente a ~/.bashrc o ~/.zshrc
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Instalar/actualizar herramientas de Foundry
foundryup

# Verificar instalación
forge --version
anvil --version
cast --version
```

### Paso 3: Instalar Herramientas del Sistema

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y lsof net-tools iproute2 curl procps

# Verificar instalación
lsof --version
netstat --version
ss --version
curl --version
pgrep --version
```

#### Fedora/RHEL/CentOS:
```bash
sudo dnf install -y lsof net-tools iproute curl procps

# Verificar instalación
lsof --version
netstat --version
ss --version
curl --version
pgrep --version
```

#### Arch Linux/Manjaro:
```bash
sudo pacman -S --noconfirm lsof net-tools iproute2 curl procps-ng

# Verificar instalación
lsof --version
netstat --version
ss --version
curl --version
pgrep --version
```

#### openSUSE:
```bash
sudo zypper install -y lsof net-tools iproute2 curl procps

# Verificar instalación
lsof --version
netstat --version
ss --version
curl --version
pgrep --version
```

### Paso 4: Clonar el Repositorio

```bash
git clone <repo-url>
cd emujicad
```

### Paso 5: Instalar Dependencias del Frontend

```bash
cd web
npm install

# Esto instalará todas las dependencias listadas en package.json
# Puede tardar varios minutos (5-15 minutos dependiendo de la conexión)

# Verificar que se instalaron correctamente
ls node_modules  # Debe mostrar muchos directorios

cd ..
```

### Paso 6: Instalar Dependencias del Smart Contract

```bash
cd sc
forge install

# Esto instalará forge-std y otras dependencias de Foundry
# Se guardarán en sc/lib/

# Verificar que se instalaron correctamente
ls lib/forge-std  # Debe existir este directorio

cd ..
```

### Paso 7: Configurar Variables de Entorno

```bash
cd web

# Crear archivo .env.local
# IMPORTANTE: El nombre del archivo debe ser exactamente .env.local (no .env.example)
cat > .env.local << 'EOF'
# Supply Chain Tracker - Environment Variables
# Generated manually
# 
# NOTA: Este archivo debe llamarse .env.local (no .env.example)
# El archivo .env.example es solo un template de referencia

# Modern Design 2025 (glassmorphism, gradients, animations)
# Options: true | false
NEXT_PUBLIC_MODERN_DESIGN=true

# Debug Mode (additional console logs)
# Options: true | false
NEXT_PUBLIC_DEBUG_MODE=false

# Debug Tokens (additional token information)
# Options: true | false
NEXT_PUBLIC_DEBUG_TOKENS=false
EOF

# O editar manualmente
nano .env.local
# o
vim .env.local

cd ..
```

**📝 Nota Importante sobre el nombre del archivo:**
- El archivo debe llamarse **`.env.local`** (con el punto al inicio)
- **NO** uses `.env.example` como nombre - ese es solo un template de referencia
- El contenido mostrado arriba es el que debe ir en tu archivo `.env.local`

### Paso 8: Iniciar Anvil (Blockchain Local)

**Terminal 1:**
```bash
cd sc
anvil --host 127.0.0.1 --port 8545 --chain-id 31337 --state ../logs/anvil_state.json --accounts 15

# Anvil se ejecutará en primer plano
# Deja esta terminal abierta
# Verás output como:
# Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
# Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Paso 9: Desplegar Smart Contract

**Terminal 2:**
```bash
cd sc

# Configurar private key (usa la Account #0 de Anvil)
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Desplegar contrato
forge script script/SupplyChainDeploy.s.sol:SupplyChainDeployScript \
    --rpc-url http://127.0.0.1:8545 \
    --broadcast

# Copiar la dirección del contrato que aparece en el output
# Ejemplo: Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### Paso 10: Actualizar Configuración del Frontend

```bash
cd web

# 1. Copiar ABI del contrato compilado
cp ../sc/out/SupplyChain.sol/SupplyChain.json src/contracts/SupplyChain.json

# 2. Actualizar dirección del contrato en config.ts
# Editar: src/contracts/config.ts
# Cambiar: export const SUPPLY_CHAIN_ADDRESS = '0x...'
# Por la dirección que obtuviste en el Paso 9

nano src/contracts/config.ts
# o
vim src/contracts/config.ts

cd ..
```

### Paso 11: Iniciar Frontend

**Terminal 3:**
```bash
cd web
npm run dev

# El servidor se iniciará en http://localhost:3000
# Deja esta terminal abierta
```

### Paso 12: Configurar MetaMask

1. **Abrir MetaMask** en tu navegador
2. **Agregar Red Local:**
   - Clic en el selector de red (arriba izquierda)
   - "Add network" → "Add a network manually"
   - Completar:
     - **Network Name**: `Anvil Local`
     - **RPC URL**: `http://127.0.0.1:8545`
     - **Chain ID**: `31337`
     - **Currency Symbol**: `ETH`
   - Clic en "Save"

3. **Importar Cuenta de Prueba:**
   - Clic en el icono de cuenta (arriba derecha)
   - "Import Account"
   - Seleccionar "Private Key"
   - Pegar: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Clic en "Import"
   - Verificar que el balance es ~10,000 ETH

4. **Conectar a la DApp:**
   - Abrir http://localhost:3000
   - Clic en "Conectar MetaMask"
   - Autorizar la conexión

### Paso 13: Verificar que Todo Funciona

#### Linux/macOS:

```bash
# Verificar que Anvil está corriendo
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Debe devolver: {"jsonrpc":"2.0","id":1,"result":"0x..."}
# Donde "result" es un número de bloque en hexadecimal

# Verificar que el frontend está corriendo
curl http://localhost:3000

# Debe devolver HTML de la página (verás <!DOCTYPE html>...)

# Verificar procesos en ejecución
lsof -i :8545  # Debe mostrar proceso de Anvil
lsof -i :3000  # Debe mostrar proceso de Node.js/Next.js
```

#### Windows:

```powershell
# Verificar que Anvil está corriendo
curl -X POST http://127.0.0.1:8545 `
  -H "Content-Type: application/json" `
  --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'

# Debe devolver: {"jsonrpc":"2.0","id":1,"result":"0x..."}

# Verificar que el frontend está corriendo
curl http://localhost:3000

# Debe devolver HTML de la página

# Verificar procesos en ejecución
netstat -an | findstr 8545  # Debe mostrar LISTENING en 127.0.0.1:8545
netstat -an | findstr 3000  # Debe mostrar LISTENING en 127.0.0.1:3000
```

**✅ Si todo está correcto:**
- Anvil responde con un número de bloque
- Frontend responde con HTML
- Ambos puertos están en uso (LISTENING)
- Puedes abrir http://localhost:3000 en tu navegador

---

## 🪟 Windows - Instalación Manual Completa

### Paso 1: Instalar Node.js y npm

1. **Descargar Node.js:**
   - Ir a https://nodejs.org/
   - Descargar la versión LTS (v20.x o superior)
   - Ejecutar el instalador `.msi`
   - Seguir el asistente de instalación
   - ✅ Marcar "Add to PATH" durante la instalación

2. **Verificar instalación:**
   ```powershell
   # Abrir PowerShell o CMD
   node --version  # Debe ser v18 o superior
   npm --version   # Debe ser v9 o superior
   ```

### Paso 2: Instalar Foundry

**Opción A: Usando Git Bash (Recomendado)**

1. **Instalar Git para Windows:**
   - Descargar desde https://git-scm.com/download/win
   - Instalar con opciones por defecto
   - ✅ Incluir Git Bash

2. **Abrir Git Bash** y ejecutar:
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

3. **Agregar Foundry al PATH:**
   - Buscar "Variables de entorno" en Windows
   - Agregar `C:\Users\<tu-usuario>\.foundry\bin` al PATH del usuario
   - Reiniciar terminal

**Opción B: Usando WSL2 (Windows Subsystem for Linux)**

1. **Instalar WSL2:**
   ```powershell
   # Ejecutar como Administrador en PowerShell
   wsl --install
   ```

2. **Seguir instrucciones de Linux** dentro de WSL2

### Paso 3: Instalar Herramientas del Sistema

Windows incluye algunas herramientas, pero necesitarás:

1. **curl**: Incluido en Windows 10/11 (build 1803+)
   ```powershell
   curl --version
   ```

2. **netstat**: Incluido en Windows
   ```powershell
   netstat --version
   ```

3. **Para lsof, ss, pgrep**: Usar alternativas o WSL2
   - **lsof**: No disponible nativamente, usar WSL2 o herramientas alternativas
   - **ss**: No disponible, usar `netstat` como alternativa
   - **pgrep**: No disponible, usar `tasklist` como alternativa

**Nota**: El script `deploy.sh` no funciona nativamente en Windows. Usa WSL2 o ejecuta los comandos manualmente.

### Paso 4: Clonar el Repositorio

```powershell
# En PowerShell o Git Bash
git clone <repo-url>
cd emujicad
```

### Paso 5: Instalar Dependencias del Frontend

```powershell
cd web
npm install

# Verificar
ls node_modules  # En PowerShell
# o
dir node_modules  # En CMD

cd ..
```

### Paso 6: Instalar Dependencias del Smart Contract

**En Git Bash o WSL2:**
```bash
cd sc
forge install

# Verificar
ls lib/forge-std

cd ..
```

### Paso 7: Configurar Variables de Entorno

```powershell
cd web

# Crear archivo .env.local
# IMPORTANTE: El nombre del archivo debe ser exactamente .env.local (no .env.example)
@"
# Supply Chain Tracker - Environment Variables
# Generated manually
# 
# NOTA: Este archivo debe llamarse .env.local (no .env.example)
# El archivo .env.example es solo un template de referencia

# Modern Design 2025 (glassmorphism, gradients, animations)
# Options: true | false
NEXT_PUBLIC_MODERN_DESIGN=true

# Debug Mode (additional console logs)
# Options: true | false
NEXT_PUBLIC_DEBUG_MODE=false

# Debug Tokens (additional token information)
# Options: true | false
NEXT_PUBLIC_DEBUG_TOKENS=false
"@ | Out-File -FilePath .env.local -Encoding utf8

# O editar manualmente con Notepad
notepad .env.local

cd ..
```

**📝 Nota Importante sobre el nombre del archivo:**
- El archivo debe llamarse **`.env.local`** (con el punto al inicio)
- **NO** uses `.env.example` como nombre - ese es solo un template de referencia
- El contenido mostrado arriba es el que debe ir en tu archivo `.env.local`

### Paso 8: Iniciar Anvil

**Terminal 1 (Git Bash o WSL2):**
```bash
cd sc
anvil --host 127.0.0.1 --port 8545 --chain-id 31337 --state ../logs/anvil_state.json --accounts 15
```

### Paso 9: Desplegar Smart Contract

**Terminal 2 (Git Bash o WSL2):**
```bash
cd sc
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

forge script script/SupplyChainDeploy.s.sol:SupplyChainDeployScript \
    --rpc-url http://127.0.0.1:8545 \
    --broadcast
```

### Paso 10: Actualizar Configuración del Frontend

```powershell
# En PowerShell
cd web

# Copiar ABI
Copy-Item ..\sc\out\SupplyChain.sol\SupplyChain.json src\contracts\SupplyChain.json

# Editar config.ts manualmente
notepad src\contracts\config.ts
# Cambiar SUPPLY_CHAIN_ADDRESS por la dirección del contrato

cd ..
```

### Paso 11: Iniciar Frontend

**Terminal 3 (PowerShell o CMD):**
```powershell
cd web
npm run dev
```

### Paso 12: Configurar MetaMask

Sigue los mismos pasos que en Linux (Paso 12 de la sección Linux).

---

## 🍎 macOS - Instalación Manual Completa

### Paso 1: Instalar Node.js y npm

**Opción A: Usando Homebrew (Recomendado)**

```bash
# Instalar Homebrew si no lo tienes
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Verificar
node --version
npm --version
```

**Opción B: Descargar desde nodejs.org**

1. Ir a https://nodejs.org/
2. Descargar el instalador `.pkg` para macOS
3. Ejecutar e instalar
4. Verificar en terminal

### Paso 2: Instalar Foundry

```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash

# Agregar al PATH (si no se agregó automáticamente)
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.zshrc
# o si usas bash:
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.bash_profile

# Recargar shell
source ~/.zshrc
# o
source ~/.bash_profile

# Instalar herramientas
foundryup

# Verificar
forge --version
anvil --version
```

### Paso 3: Instalar Herramientas del Sistema

macOS incluye la mayoría de herramientas, pero algunas pueden necesitar instalación:

```bash
# Instalar herramientas adicionales con Homebrew
brew install lsof curl

# Verificar herramientas incluidas
netstat --version  # Incluido en macOS
ss --version       # No disponible, usar netstat
pgrep --version    # Incluido en macOS
```

### Paso 4: Clonar el Repositorio

```bash
git clone <repo-url>
cd emujicad
```

### Paso 5: Instalar Dependencias del Frontend

```bash
cd web
npm install

# Verificar
ls node_modules

cd ..
```

### Paso 6: Instalar Dependencias del Smart Contract

```bash
cd sc
forge install

# Verificar
ls lib/forge-std

cd ..
```

### Paso 7: Configurar Variables de Entorno

```bash
cd web

# Crear archivo .env.local
# IMPORTANTE: El nombre del archivo debe ser exactamente .env.local (no .env.example)
cat > .env.local << 'EOF'
# Supply Chain Tracker - Environment Variables
# Generated manually
# 
# NOTA: Este archivo debe llamarse .env.local (no .env.example)
# El archivo .env.example es solo un template de referencia

# Modern Design 2025 (glassmorphism, gradients, animations)
# Options: true | false
NEXT_PUBLIC_MODERN_DESIGN=true

# Debug Mode (additional console logs)
# Options: true | false
NEXT_PUBLIC_DEBUG_MODE=false

# Debug Tokens (additional token information)
# Options: true | false
NEXT_PUBLIC_DEBUG_TOKENS=false
EOF

# O editar manualmente
nano .env.local
# o
vim .env.local

cd ..
```

**📝 Nota Importante sobre el nombre del archivo:**
- El archivo debe llamarse **`.env.local`** (con el punto al inicio)
- **NO** uses `.env.example` como nombre - ese es solo un template de referencia
- El contenido mostrado arriba es el que debe ir en tu archivo `.env.local`

### Paso 8: Iniciar Anvil

**Terminal 1:**
```bash
cd sc
anvil --host 127.0.0.1 --port 8545 --chain-id 31337 --state ../logs/anvil_state.json --accounts 15

# Anvil se ejecutará en primer plano
# Deja esta terminal abierta
```

### Paso 9: Desplegar Smart Contract

**Terminal 2:**
```bash
cd sc
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

forge script script/SupplyChainDeploy.s.sol:SupplyChainDeployScript \
    --rpc-url http://127.0.0.1:8545 \
    --broadcast

# Copiar la dirección del contrato que aparece en el output
```

### Paso 10: Actualizar Configuración del Frontend

```bash
cd web

# 1. Copiar ABI del contrato compilado
cp ../sc/out/SupplyChain.sol/SupplyChain.json src/contracts/SupplyChain.json

# 2. Actualizar dirección del contrato en config.ts
nano src/contracts/config.ts
# o
vim src/contracts/config.ts
# Cambiar SUPPLY_CHAIN_ADDRESS por la dirección del contrato

cd ..
```

### Paso 11: Iniciar Frontend

**Terminal 3:**
```bash
cd web
npm run dev

# El servidor se iniciará en http://localhost:3000
# Deja esta terminal abierta
```

### Paso 12: Configurar MetaMask

Sigue los mismos pasos que en Linux (Paso 12 de la sección Linux).

### Paso 13: Verificar que Todo Funciona

#### Linux/macOS:

```bash
# Verificar que Anvil está corriendo
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Debe devolver: {"jsonrpc":"2.0","id":1,"result":"0x..."}
# Donde "result" es un número de bloque en hexadecimal

# Verificar que el frontend está corriendo
curl http://localhost:3000

# Debe devolver HTML de la página (verás <!DOCTYPE html>...)

# Verificar procesos en ejecución
lsof -i :8545  # Debe mostrar proceso de Anvil
lsof -i :3000  # Debe mostrar proceso de Node.js/Next.js
```

#### Windows:

```powershell
# Verificar que Anvil está corriendo
curl -X POST http://127.0.0.1:8545 `
  -H "Content-Type: application/json" `
  --data '{\"jsonrpc\":\"2.0\",\"method\":\"eth_blockNumber\",\"params\":[],\"id\":1}'

# Debe devolver: {"jsonrpc":"2.0","id":1,"result":"0x..."}

# Verificar que el frontend está corriendo
curl http://localhost:3000

# Debe devolver HTML de la página

# Verificar procesos en ejecución
netstat -an | findstr 8545  # Debe mostrar LISTENING en 127.0.0.1:8545
netstat -an | findstr 3000  # Debe mostrar LISTENING en 127.0.0.1:3000
```

**✅ Si todo está correcto:**
- Anvil responde con un número de bloque
- Frontend responde con HTML
- Ambos puertos están en uso (LISTENING)
- Puedes abrir http://localhost:3000 en tu navegador

---

## 🔍 Verificación Final (Todos los SO)

### Verificar que Todo Está Instalado Correctamente

```bash
# Node.js y npm
node --version  # v18+
npm --version   # v9+

# Foundry
forge --version
anvil --version

# Git
git --version

# Dependencias del proyecto
ls web/node_modules        # Debe existir
ls sc/lib/forge-std        # Debe existir

# Archivos de configuración
ls web/.env.local          # Debe existir
ls web/src/contracts/config.ts  # Debe existir
```

### Verificar que los Servicios Están Corriendo

```bash
# Verificar Anvil (puerto 8545)
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Verificar Frontend (puerto 3000)
curl http://localhost:3000
```

### Abrir la Aplicación

1. Abrir navegador en http://localhost:3000
2. Conectar MetaMask (debe estar configurado con la red Anvil Local)
3. Deberías ver la página principal con estadísticas del contrato

---

## 🐛 Troubleshooting Manual

### Problema: Node.js no se encuentra

**Linux/macOS:**
```bash
# Verificar instalación
which node
which npm

# Si no están en PATH, agregar manualmente
export PATH="/usr/local/bin:$PATH"
# O agregar a ~/.bashrc o ~/.zshrc
```

**Windows:**
- Verificar que Node.js está en el PATH del sistema
- Reiniciar terminal después de instalar

### Problema: Foundry no se encuentra

**Linux/macOS:**
```bash
# Verificar instalación
which forge
which anvil

# Si no están, agregar al PATH
export PATH="$HOME/.foundry/bin:$PATH"
echo 'export PATH="$HOME/.foundry/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Windows:**
- Verificar que Foundry está en el PATH
- Usar Git Bash o WSL2 para ejecutar comandos de Foundry

### Problema: npm install falla

```bash
# Limpiar cache
npm cache clean --force

# Eliminar node_modules y reinstalar
cd web
rm -rf node_modules package-lock.json
npm install
```

### Problema: forge install falla

```bash
# Verificar conexión
ping github.com

# Reintentar
cd sc
forge install
```

### Problema: Anvil no inicia

```bash
# Verificar que el puerto 8545 no está en uso
# Linux/macOS:
lsof -i :8545
# o
netstat -an | grep 8545

# Windows:
netstat -an | findstr 8545

# Si está en uso, matar el proceso o usar otro puerto
```

### Problema: Frontend no inicia

```bash
# Verificar que el puerto 3000 no está en uso
# Linux/macOS:
lsof -i :3000

# Windows:
netstat -an | findstr 3000

# Verificar que las dependencias están instaladas
cd web
ls node_modules

# Reinstalar si es necesario
rm -rf node_modules package-lock.json
npm install
```

### Problema: MetaMask no se conecta

1. Verificar que Anvil está corriendo
2. Verificar que la red Anvil Local está agregada en MetaMask
3. Verificar Chain ID: debe ser 31337
4. Verificar RPC URL: debe ser http://127.0.0.1:8545
5. Verificar que la cuenta importada tiene la dirección correcta

---

## 📝 Resumen de Comandos Manuales

### Iniciar Todo Manualmente (3 Terminales)

**Terminal 1 - Anvil:**
```bash
cd sc
anvil --host 127.0.0.1 --port 8545 --chain-id 31337 --state ../logs/anvil_state.json --accounts 15
```

**Terminal 2 - Deploy Contract (una vez):**
```bash
cd sc
export PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
forge script script/SupplyChainDeploy.s.sol:SupplyChainDeployScript --rpc-url http://127.0.0.1:8545 --broadcast
# Copiar dirección del contrato y actualizar web/src/contracts/config.ts
```

**Terminal 3 - Frontend:**
```bash
cd web
npm run dev
```

### Detener Todo Manualmente

#### Linux/macOS:

**Terminal 1 (Anvil):**
- Presionar `Ctrl+C` en la terminal donde está corriendo Anvil
- O usar: `pkill -f "anvil.*8545"`

**Terminal 3 (Frontend):**
- Presionar `Ctrl+C` en la terminal donde está corriendo el frontend
- O usar: `pkill -f "next.*dev"` o `pkill -f "node.*3000"`

**Verificar que los servicios se detuvieron:**
```bash
# Verificar puerto 8545 (Anvil)
lsof -i :8545
# No debe mostrar ningún proceso

# Verificar puerto 3000 (Frontend)
lsof -i :3000
# No debe mostrar ningún proceso
```

#### Windows:

**Terminal 1 (Anvil - Git Bash o WSL2):**
- Presionar `Ctrl+C` en la terminal donde está corriendo Anvil
- O usar: `taskkill /F /IM anvil.exe` (en CMD/PowerShell)

**Terminal 3 (Frontend - PowerShell o CMD):**
- Presionar `Ctrl+C` en la terminal donde está corriendo el frontend
- O usar: `taskkill /F /IM node.exe` (esto detendrá todos los procesos Node.js)

**Verificar que los servicios se detuvieron:**
```powershell
# Verificar puerto 8545 (Anvil)
netstat -an | findstr 8545
# No debe mostrar ninguna conexión LISTENING

# Verificar puerto 3000 (Frontend)
netstat -an | findstr 3000
# No debe mostrar ninguna conexión LISTENING
```

**⚠️ NOTA**: Si usas `taskkill /F /IM node.exe`, esto detendrá TODOS los procesos de Node.js en tu sistema. Si solo quieres detener el frontend, es mejor usar `Ctrl+C` en la terminal correspondiente.

---

## 🔗 Referencias Rápidas

- **Node.js**: https://nodejs.org/
- **Foundry**: https://book.getfoundry.sh/
- **MetaMask**: https://metamask.io/
- **Next.js**: https://nextjs.org/docs
- **wagmi**: https://wagmi.sh/

---

> **💡 TIP**: Si estás en Linux, considera usar el script automatizado `./deploy.sh setup` que hace todo esto automáticamente.

---

## 📁 Project Structure

> **📚 For detailed structure, see [docs/DOCUMENTATION.md - Project Structure](./docs/DOCUMENTATION.md#-estructura-del-proyecto)**

```
emujicad/
│
├── 🚀 deploy.sh                 # Automated script (650 lines)
├── 📄 QUICKSTART.md             # This guide
├── 📄 STATUS.md                  # Current project status ⭐
├── 📄 INDEX.md                  # Documentation index
├── 📁 docs/                     # All documentation
│   ├── DOCUMENTATION.md      # Complete technical guide
│   ├── FRONTEND.md           # Frontend documentation
│   ├── SMART_CONTRACT.md     # Smart contract documentation
│   ├── REPORTS.md            # Consolidated reports
│   ├── RESEARCH.md           # Technical research
│   └── SECURITY.md           # Security policy
│
├── 📁 sc/                       # Smart Contract
│   ├── src/SupplyChain.sol
│   ├── test/
│   └── script/
│
├── 📁 web/                      # Frontend Next.js
│   ├── src/
│   │   ├── app/              # 9 implemented pages
│   │   ├── components/       # 26 components
│   │   ├── hooks/            # 24 custom hooks
│   │   ├── contracts/
│   │   └── lib/
│   └── package.json
│
└── 📁 logs/                     # Execution logs
    ├── anvil.log
    ├── frontend.log
    └── deploy.log
```

---

## 🎯 Workflow

### 1️⃣ First Time (Setup)

```bash
# Clone the repo (if applicable)
git clone <repo-url>
cd emujicad

# Give script permissions
chmod +x deploy.sh

# Start everything
./deploy.sh start
```

### 2️⃣ Configure MetaMask

```bash
# See detailed instructions
./deploy.sh metamask
```

**Quick summary**:
- Add Anvil network (Chain ID: 31337, RPC: http://127.0.0.1:8545)
- Import test account (see command output)
- Connect at http://localhost:3000

### 3️⃣ Daily Development

```bash
# At start of day
./deploy.sh start

# Develop features...

# If you only change frontend, you can restart only frontend
./deploy.sh frontend restart

# At end of day
./deploy.sh stop
```

**Tip**: If you're only working on frontend, use `./deploy.sh frontend restart` to save time (doesn't redeploy contract).

### 4️⃣ Verify Status

```bash
# See service status
./deploy.sh status

# See logs in real time
tail -f logs/anvil.log
tail -f logs/frontend.log
tail -f logs/deploy.log
```

### 5️⃣ Clean Anvil State (Optional)

If you need to start with a clean blockchain (no tokens, transfers, users):

```bash
# Stop Anvil first
./deploy.sh stop

# Clean persistent state
./deploy.sh clean

# Restart everything with clean blockchain
./deploy.sh start
```

**Note**: The script will ask for confirmation before deleting state. If Anvil is running, it will offer to stop it first.

---

## 🔍 Quick Verification

After `./deploy.sh start`, verify:

1. **Anvil running**: 
   ```bash
   lsof -i :8545
   # Should show a process
   ```

2. **Frontend running**:
   ```bash
   lsof -i :3000
   # Should show a process
   ```

3. **Contract deployed**:
   ```bash
   cat logs/contract_address.txt
   # Should show an address (0x...)
   ```

4. **Open DApp**:
   - Browser: http://localhost:3000
   - Connect MetaMask
   - See stats: 0 Tokens, 0 Users, 0 Transfers (initial state)

5. **Verify persistent state** (if you restart Anvil):
   ```bash
   # If Anvil restarted but state persists, you'll see:
   ls -lh logs/anvil_state.json
   # File contains blockchain state (tokens, transfers, users)
   ```

---

## 🐛 Quick Troubleshooting

### Error: "Port already in use"

```bash
# Stop services
./deploy.sh stop

# Verify ports
lsof -i :8545  # Anvil
lsof -i :3000  # Frontend

# Kill processes if necessary
kill -9 <PID>
```

### Error: "Contract not deployed"

```bash
# See deployment logs
cat logs/deploy.log

# Restart everything
./deploy.sh restart
```

### Error: "Cannot connect to MetaMask"

```bash
# Verify configuration
./deploy.sh metamask

# Make sure:
# - Anvil network added in MetaMask
# - Account imported
# - Frontend running on :3000
```

### More problems

See **[docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)** for detailed solutions.

---

## 📊 Current Project Status

> **📋 For detailed and up-to-date project status information, see [STATUS.md](./STATUS.md)**

**Last Updated**: November 27, 2025

### 🎯 Executive Summary

**General Score: 7.4/9.5** ✅ PASSING

| Component | Status |
|-----------|--------|
| **Smart Contract** | ✅ 4.0/4.0 (100%) - 108 tests, 85.60% coverage, critical validations completed |
| **Frontend** | ✅ 3.0/3.0 (100%) - 9/9 pages, 26 components, 24 hooks |
| **Extras** | ⚠️ 0.5/1.0 (50%) - deploy script validated |
| **Video** | ❌ 0.0/1.5 (0%) - Pending |

**Next step**: Video Demo (Day 9) - +1.5 points

> **📚 See detailed roadmap and next steps**: [STATUS.md](./STATUS.md)

---

## 🔗 Useful Links

### Project Documentation
> **📚 See [INDEX.md](./INDEX.md) for complete index**

**Main**:
- [STATUS.md](./STATUS.md) ⭐ - Current status and next steps
- [INDEX.md](./INDEX.md) - Master index of all documentation
- [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) - Complete technical guide

**Frontend**:
- [docs/FRONTEND.md](./docs/FRONTEND.md) - Complete frontend documentation

**Smart Contract**:
- [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md) - Complete smart contract documentation

### Technologies
- [Solidity Docs](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [viem Docs](https://viem.sh)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

---

## 💡 Tips

### For Developers

1. **Use the script**: Don't start services manually
2. **Check logs**: Always verify `logs/` for errors
3. **Read docs/DOCUMENTATION.md**: All architecture is there
4. **Run tests**: `cd sc && forge test` before commits

### For Evaluators

1. **Run**: `./deploy.sh start`
2. **Test**: http://localhost:3000
3. **Review tests**: `cd sc && forge test -vv`
4. **Read**: [docs/REPORTS.md](./docs/REPORTS.md) for complete evaluation

---

## 📞 Help

**Problem with deployment?**
→ `./deploy.sh help` and [docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)

**Need to understand the code?**
→ [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)

**Working on frontend?**
→ [docs/FRONTEND.md](./docs/FRONTEND.md)

**Working on smart contract?**
→ [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)

**Want to see complete index?**
→ [INDEX.md](./INDEX.md)

**Current project status?**
→ [STATUS.md](./STATUS.md) ⭐

---

## 🔍 Quick Guides by Role

### For Developers

**First time**:
1. Read [README.md](./README.md)
2. Run `./deploy.sh start`
3. Configure MetaMask: `./deploy.sh metamask`
4. Read [docs/FRONTEND.md](./docs/FRONTEND.md) for frontend

**Daily development**:
1. `./deploy.sh start` - Start services
2. Develop features
3. `./deploy.sh frontend restart` - Restart only frontend (if only changing frontend)
4. `./deploy.sh stop` - Stop services

**Troubleshooting**:
1. `./deploy.sh status` - See status
2. Review logs in `logs/`
3. Consult [docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)

### For Evaluators

**Evaluate the project**:
1. Read [docs/REPORTS.md](./docs/REPORTS.md) - Consolidated reports
2. Run `./deploy.sh start`
3. Test DApp at http://localhost:3000
4. See tests: `cd sc && forge test`

### For New Contributors

**Onboarding**:
1. [README.md](./README.md) - Quick start
2. [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) - Complete architecture
3. [docs/FRONTEND.md](./docs/FRONTEND.md) - Frontend details
4. [STATUS.md](./STATUS.md) - Current status

---

## 📚 External Documentation

### Useful Links

**Technologies**:
- [Solidity Docs](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [viem Docs](https://viem.sh)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

**OpenZeppelin**:
- [Contracts](https://docs.openzeppelin.com/contracts/)
- [Ownable](https://docs.openzeppelin.com/contracts/access#ownership)
- [Pausable](https://docs.openzeppelin.com/contracts/api/security#Pausable)

**MetaMask**:
- [Developer Docs](https://docs.metamask.io/)
- [Getting Started](https://docs.metamask.io/wallet/get-started/set-up-dev-environment/)

---

**Created**: November 18, 2025  
**Last Updated**: November 27, 2025  
**Version**: 1.6.0  
**Status**: ✅ 9/9 pages completed (100%), 24 hooks implemented, critical contract validations implemented

> **📋 For the most up-to-date status, see [STATUS.md](./STATUS.md)**

---

<div align="center">

### 🚀 Let's Develop!

```bash
./deploy.sh start
```

</div>
