# 🚀 Quick Start - Supply Chain Tracker

> **📚 DOCUMENTACIÓN COMPLETA**: Ver [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) para guía exhaustiva del proyecto

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

## 📊 Estado de Implementación del Frontend

> **📋 Para el estado más actualizado del proyecto, consulta [STATUS.md](./STATUS.md)**  
> **📚 Para documentación completa de páginas y componentes, consulta [docs/FRONTEND.md](./docs/FRONTEND.md)**

### 📄 Páginas Implementadas (9/9 - 100%)

```
web/src/app/
├── page.tsx                    ✅ IMPLEMENTADO - Landing con MetaMask + Stats (Diseño Moderno 2025)
├── dashboard/page.tsx          ✅ IMPLEMENTADO - Panel principal por rol COMPLETO (Diseño Moderno 2025)
├── tokens/
│   ├── page.tsx               ✅ IMPLEMENTADO - Lista de tokens usuario (Diseño Moderno 2025) ⭐ Día 5
│   ├── create/page.tsx        ✅ IMPLEMENTADO - Formulario crear token (Diseño Moderno 2025) ⭐ Día 6
│   ├── [id]/page.tsx          ✅ IMPLEMENTADO - Detalles token con trazabilidad ⭐ Día 8
│   └── [id]/transfer/page.tsx ✅ IMPLEMENTADO - Transferir desde detalles ⭐ Día 8
├── transfers/page.tsx         ✅ IMPLEMENTADO - Gestión transferencias COMPLETA (Diseño Moderno 2025) ⭐ Día 7
├── admin/
│   ├── page.tsx               ✅ IMPLEMENTADO - Panel admin principal ⭐ Día 8
│   └── users/page.tsx         ✅ IMPLEMENTADO - Gestión completa de usuarios (Diseño Moderno 2025)
└── profile/page.tsx           ✅ IMPLEMENTADO - Perfil usuario ⭐ Día 8
```

**Progreso**: 9/9 páginas (100%) ✅

### 🧩 Componentes Específicos (6/6 implementados)

```
web/src/components/
├── ConnectWallet.tsx          ✅ IMPLEMENTADO - Conexión MetaMask
├── Header.tsx                 ✅ IMPLEMENTADO - Navegación + branding + pausa badge
├── ThemeToggle.tsx            ✅ IMPLEMENTADO - Modo claro/oscuro con persistencia
├── TokenCard.tsx              ✅ IMPLEMENTADO - Tarjeta de token completa
├── TokenCardModern.tsx        ✅ IMPLEMENTADO - Tarjeta moderna 2025 (glassmorphism) ⭐ Día 6
└── TransferList.tsx           ✅ IMPLEMENTADO - Lista transferencias con filtros y acciones ⭐ Día 7
```

**Progreso**: 6/6 componentes específicos (100%) ✅

### 🎨 Componentes Adicionales Implementados

```
web/src/components/
├── RegisterForm.tsx           ✅ Formulario registro con validación de pausa
├── ChangeRoleDialog.tsx       ✅ Diálogo cambiar rol con validación de pausa
├── UserProfileCard.tsx        ✅ Perfil de usuario
├── QuickActions.tsx           ✅ Acciones rápidas con validación de pausa
├── CreateTransferForm.tsx     ✅ Formulario crear transferencias ⭐ Día 7
├── UserTokenList.tsx          ✅ Lista tokens usuario ⭐ Día 7
├── AddressDisplay.tsx         ✅ Direcciones con copy/tooltip ⭐ Día 7
├── TraceabilityTimeline.tsx   ✅ Trazabilidad end-to-end ⭐ Día 8
└── admin/
    ├── UserManagementTable.tsx  ✅ Tabla gestión usuarios con filtros + pausa
    ├── UserStatsCards.tsx       ✅ Cards estadísticas del sistema
    ├── PauseControl.tsx         ✅ Control de pausa del contrato
    └── OwnershipTransfer.tsx    ✅ Gestión ownership transfer ⭐
```

**Total componentes personalizados**: 26 implementados  
**Componentes Shadcn UI**: 11 componentes (button, card, input, label, select, table, badge, dialog, alert, skeleton, textarea)

> **📚 Ver documentación completa**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### 🎨 Diseño Moderno 2025 ⭐ NUEVO
**Características implementadas**:
- Glassmorphism (efectos de vidrio con `backdrop-blur-xl`)
- Gradientes azul-púrpura en títulos y botones
- Animaciones suaves y efectos hover
- Bordes redondeados (`rounded-2xl`, `rounded-3xl`)
- Sombras modernas (`shadow-lg`, `shadow-2xl`)
- Controlado por variable de entorno: `NEXT_PUBLIC_MODERN_DESIGN=true`

**Páginas con diseño moderno**:
- ✅ Landing (`/`)
- ✅ Dashboard (`/dashboard`)
- ✅ Tokens (`/tokens`)
- ✅ Crear Token (`/tokens/create`)
- ✅ Transfers (`/transfers`) ⭐ Día 7
- ✅ Admin Users (`/admin/users`)

### 🪝 Hooks Personalizados

> **📚 Para documentación completa de todos los hooks, consulta [docs/FRONTEND.md](./docs/FRONTEND.md)**

**Total**: 24 hooks personalizados (14 archivos) ✅

**Archivos principales**:
```
web/src/hooks/
├── useContractReads.ts        ✅ 6 hooks lectura (userInfo, isAdmin, totals, dashboard stats)
├── useRequestRole.ts          ✅ Solicitar rol de usuario
├── useCreateToken.ts          ✅ Crear tokens
├── useTransfer.ts             ✅ 4 hooks transferencias (transfer, accept, reject, cancel)
├── useAdminUsers.ts           ✅ 2 hooks admin (getAllUsers, changeUserStatus)
├── useContractOwner.ts        ✅ Verificar ownership del contrato
├── usePendingOwner.ts         ✅ Obtener pendingOwner
├── useOwnershipTransfer.ts    ✅ 3 funciones ownership (initiate, accept, reject)
├── useGetUserTokens.ts        ✅ 4 hooks tokens (getUserTokens, getToken, getTokenBalance, useGetAllTokens)
├── usePause.ts                ✅ 3 hooks pausa (isPaused, pause, unpause)
├── useUserTokenStats.ts        ✅ Estadísticas por tipo ⭐ Día 7
├── useGetUserTokensWithData.ts ✅ Tokens con datos completos ⭐ Día 7
├── useGetUserTransfers.ts     ✅ Transferencias de usuario ⭐ Día 7
├── useGetAllTransfers.ts      ✅ Todas las transferencias ⭐ Día 8
└── useTokenTraceability.ts    ✅ Trazabilidad end-to-end ⭐ Día 8
```

> **📚 Ver lista completa y documentación detallada**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### 📁 Directorio `contexts/`

✅ **Implementado**: `src/contexts/AuthContext.tsx`
- Gestión de autenticación y autorización
- Detección de admin vs usuarios aprobados
- Optimización de redirecciones (useUserIdByAddress)
- Restauración de preferencias de tema por usuario
- Manejo de estados de carga optimizado

---

## 🚀 Próximos Pasos (Roadmap)

### Iniciar el proyecto en 3 comandos:

```bash
# 1. Dar permisos al script (solo primera vez)
chmod +x deploy.sh

# 2. Iniciar TODO (Anvil + Contrato + Frontend)
./deploy.sh start

# 3. Ver instrucciones de MetaMask
./deploy.sh metamask
```

**¡Listo!** Abre http://localhost:3000 y conecta MetaMask.

---

## 📋 Comandos del Script `deploy.sh`

> **📚 Para documentación completa del script, consulta [docs/DOCUMENTATION.md - Deployment Automatizado](./docs/DOCUMENTATION.md#-deployment-automatizado)**

### Comandos Principales

```bash
./deploy.sh start      # Iniciar todo el stack (Anvil + Contrato + Frontend)
./deploy.sh stop       # Detener todos los servicios
./deploy.sh restart    # Reiniciar todo el stack
./deploy.sh status     # Ver estado de servicios
./deploy.sh metamask   # Instrucciones para configurar MetaMask
./deploy.sh clean      # Limpiar estado persistente de Anvil (requiere Anvil detenido)
./deploy.sh help       # Ayuda completa con todos los comandos
```

### Comandos de Configuración

```bash
./deploy.sh setup      # Verifica requisitos e instala dependencias faltantes
./deploy.sh env        # Configura variables de entorno (.env.local)
```

**Ejemplos de uso:**
```bash
# Setup completo en modo automático
./deploy.sh setup --yes

# Configurar variables de entorno interactivamente
./deploy.sh env

# Configurar variables con parámetros
./deploy.sh env --modern-design true --debug-mode false
./deploy.sh env --all true false false
```

### Comandos de Frontend (sin afectar Anvil/Contrato)

```bash
./deploy.sh frontend start    # Iniciar solo el frontend (requiere Anvil corriendo)
./deploy.sh frontend stop     # Detener solo el frontend
./deploy.sh frontend restart  # Reiniciar solo el frontend
```

**Uso típico**: Después de hacer cambios en el frontend, puedes reiniciar solo el frontend sin afectar Anvil ni el contrato desplegado.

### Características del Script

✅ **Persistencia de Estado**: Anvil guarda el estado de la blockchain entre reinicios  
✅ **Detección Inteligente**: Detecta si servicios ya están corriendo antes de iniciarlos  
✅ **Validación Automática**: Verifica que el contrato esté desplegado antes de iniciar frontend  
✅ **Actualización Automática**: Actualiza ABI y dirección del contrato en el frontend automáticamente  
✅ **Logs Organizados**: Todos los logs se guardan en `logs/`  
✅ **Manejo de Errores**: Validaciones y mensajes de error claros

---

## 📖 Documentación Disponible

> **📚 Para índice completo de documentación, consulta [INDEX.md](./INDEX.md)**

### Documentación Principal
- **[STATUS.md](./STATUS.md)** ⭐ - Single source of truth del estado del proyecto
- **[QUICKSTART.md](./QUICKSTART.md)** - Esta guía rápida
- **[INDEX.md](./INDEX.md)** - Índice maestro de toda la documentación
- **[docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)** - Guía técnica completa

### Documentación por Componente
- **[docs/FRONTEND.md](./docs/FRONTEND.md)** - Documentación completa del frontend
- **[docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)** - Documentación completa del smart contract

### Reportes y Evaluaciones
- **[docs/REPORTS.md](./docs/REPORTS.md)** - Reportes consolidados del proyecto
- **[docs/RESEARCH.md](./docs/RESEARCH.md)** - Investigación y análisis técnico
- **[IA.md](./IA.md)** ⭐ - Retrospectiva del uso de IA

---

## 🛠️ Stack Tecnológico

> **📚 Para información detallada del stack, consulta [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)**

### Smart Contract
- **Solidity** 0.8.30
- **Foundry** (Forge + Anvil)
- **OpenZeppelin** Contracts
- **970+ líneas** de código
- **108 tests** (85.60% lines, 72.15% branches, 82.67% statements, 80.95% functions)
- **Validaciones críticas**: 5 implementadas (100% completadas)

> **📚 Ver documentación completa**: [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)

### Frontend
- **Next.js** 16.0.1
- **React** 19.2.0
- **TypeScript** 5.x
- **Tailwind CSS** 3.4.14
- **Shadcn UI**
- **wagmi** 2.12.0 + **viem** 2.21.0 + **ethers** 6.13.0

> **📚 Ver documentación completa**: [docs/FRONTEND.md](./docs/FRONTEND.md)

### Blockchain Local
- **Anvil** (Foundry)
- **Chain ID**: 31337
- **RPC**: http://127.0.0.1:8545
- **15 cuentas** con 10,000 ETH cada una

---

## 🔧 Requisitos

Asegúrate de tener instalado:

```bash
# Node.js y npm
node --version  # v18+
npm --version   # v9+

# Foundry
forge --version
anvil --version

# Git
git --version
```

### Instalar Foundry (si no lo tienes):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

---

## 📖 Guía de Setup Manual (Todos los Sistemas Operativos)

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

```bash
# Verificar que Anvil está corriendo
curl -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Debe devolver un número de bloque

# Verificar que el frontend está corriendo
curl http://localhost:3000

# Debe devolver HTML de la página
```

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

### Paso 8-12: Siguen los mismos pasos que Linux

Los pasos 8-12 son idénticos a Linux:
- Paso 8: Iniciar Anvil
- Paso 9: Desplegar Smart Contract
- Paso 10: Actualizar Configuración del Frontend
- Paso 11: Iniciar Frontend
- Paso 12: Configurar MetaMask

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

**Terminal 1 (Anvil):** `Ctrl+C`  
**Terminal 3 (Frontend):** `Ctrl+C`

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

## 📁 Estructura del Proyecto

> **📚 Para estructura detallada, consulta [docs/DOCUMENTATION.md - Estructura del Proyecto](./docs/DOCUMENTATION.md#-estructura-del-proyecto)**

```
emujicad/
│
├── 🚀 deploy.sh                 # Script automatizado (650 líneas)
├── 📄 QUICKSTART.md             # Esta guía
├── 📄 STATUS.md                  # Estado actual del proyecto ⭐
├── 📄 INDEX.md                  # Índice de docs
├── 📁 docs/                     # Toda la documentación
│   ├── common/               # Doc general
│   ├── sc/                   # 18 archivos Smart Contract
│   ├── fe/                   # 5 archivos frontend
│   └── reports/              # Reportes y evaluaciones
│
├── 📁 sc/                       # Smart Contract
│   ├── src/SupplyChain.sol
│   ├── test/
│   └── script/
│
├── 📁 web/                      # Frontend Next.js
│   ├── src/
│   │   ├── app/              # 9 páginas implementadas
│   │   ├── components/       # 26 componentes
│   │   ├── hooks/            # 24 hooks personalizados
│   │   ├── contracts/
│   │   └── lib/
│   └── package.json
│
└── 📁 logs/                     # Logs de ejecución
    ├── anvil.log
    ├── frontend.log
    └── deploy.log
```

---

## 🎯 Flujo de Trabajo

### 1️⃣ Primera vez (Setup)

```bash
# Clonar el repo (si aplica)
git clone <repo-url>
cd emujicad

# Dar permisos al script
chmod +x deploy.sh

# Iniciar todo
./deploy.sh start
```

### 2️⃣ Configurar MetaMask

```bash
# Ver instrucciones detalladas
./deploy.sh metamask
```

**Resumen rápido**:
- Agregar red Anvil (Chain ID: 31337, RPC: http://127.0.0.1:8545)
- Importar cuenta de prueba (ver output del comando)
- Conectar en http://localhost:3000

### 3️⃣ Desarrollo Diario

```bash
# Al iniciar el día
./deploy.sh start

# Desarrollar features...

# Si solo cambias el frontend, puedes reiniciar solo el frontend
./deploy.sh frontend restart

# Al terminar el día
./deploy.sh stop
```

**Tip**: Si solo estás trabajando en el frontend, usa `./deploy.sh frontend restart` para ahorrar tiempo (no redesplega el contrato).

### 4️⃣ Verificar Estado

```bash
# Ver estado de servicios
./deploy.sh status

# Ver logs en tiempo real
tail -f logs/anvil.log
tail -f logs/frontend.log
tail -f logs/deploy.log
```

### 5️⃣ Limpiar Estado de Anvil (Opcional)

Si necesitas empezar con una blockchain limpia (sin tokens, transferencias, usuarios):

```bash
# Detener Anvil primero
./deploy.sh stop

# Limpiar estado persistente
./deploy.sh clean

# Reiniciar todo con blockchain limpia
./deploy.sh start
```

**Nota**: El script te preguntará confirmación antes de eliminar el estado. Si Anvil está corriendo, te ofrecerá detenerlo primero.

---

## 🔍 Verificación Rápida

Después de `./deploy.sh start`, verifica:

1. **Anvil corriendo**: 
   ```bash
   lsof -i :8545
   # Debe mostrar un proceso
   ```

2. **Frontend corriendo**:
   ```bash
   lsof -i :3000
   # Debe mostrar un proceso
   ```

3. **Contrato deployado**:
   ```bash
   cat logs/contract_address.txt
   # Debe mostrar una dirección (0x...)
   ```

4. **Abrir DApp**:
   - Navegador: http://localhost:3000
   - Conectar MetaMask
   - Ver stats: 0 Tokens, 0 Users, 0 Transfers (estado inicial)

5. **Verificar estado persistente** (si reinicias Anvil):
   ```bash
   # Si Anvil se reinició pero el estado persiste, verás:
   ls -lh logs/anvil_state.json
   # El archivo contiene el estado de la blockchain (tokens, transferencias, usuarios)
   ```

---

## 🐛 Troubleshooting Rápido

### Error: "Port already in use"

```bash
# Detener servicios
./deploy.sh stop

# Verificar puertos
lsof -i :8545  # Anvil
lsof -i :3000  # Frontend

# Matar procesos si es necesario
kill -9 <PID>
```

### Error: "Contract not deployed"

```bash
# Ver logs de deployment
cat logs/deploy.log

# Reiniciar todo
./deploy.sh restart
```

### Error: "Cannot connect to MetaMask"

```bash
# Verificar configuración
./deploy.sh metamask

# Asegurarse de:
# - Red Anvil agregada en MetaMask
# - Cuenta importada
# - Frontend corriendo en :3000
```

### Más problemas

Ver **[docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)** para soluciones detalladas.

---

## 📊 Estado Actual del Proyecto

> **📋 Para información detallada y actualizada del estado del proyecto, consulta [STATUS.md](./STATUS.md)**

**Última actualización**: 27 de Noviembre, 2025

### 🎯 Resumen Ejecutivo

**Puntuación General: 7.4/9.5** ✅ APROBATORIO

| Componente | Estado |
|------------|--------|
| **Smart Contract** | ✅ 4.0/4.0 (100%) - 108 tests, 85.60% coverage, validaciones críticas completadas |
| **Frontend** | ✅ 3.0/3.0 (100%) - 9/9 páginas, 26 componentes, 24 hooks |
| **Extras** | ⚠️ 0.5/1.0 (50%) - deploy script validado |
| **Video** | ❌ 0.0/1.5 (0%) - Pendiente |

**Próximo paso**: Video Demo (Día 9) - +1.5 puntos

> **📚 Ver roadmap detallado y próximos pasos**: [STATUS.md](./STATUS.md)

---

## 🔗 Links Útiles

### Documentación del Proyecto
> **📚 Ver [INDEX.md](./INDEX.md) para índice completo**

**Principales**:
- [STATUS.md](./STATUS.md) ⭐ - Estado actual y próximos pasos
- [INDEX.md](./INDEX.md) - Índice maestro de toda la documentación
- [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) - Guía técnica completa

**Frontend**:
- [docs/FRONTEND.md](./docs/FRONTEND.md) - Documentación completa del frontend

**Smart Contract**:
- [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md) - Documentación completa del smart contract

### Tecnologías
- [Solidity Docs](https://docs.soliditylang.org/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Next.js Docs](https://nextjs.org/docs)
- [wagmi Docs](https://wagmi.sh)
- [viem Docs](https://viem.sh)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)

---

## 💡 Consejos

### Para Desarrolladores

1. **Usa el script**: No inicies servicios manualmente
2. **Revisa logs**: Siempre verifica `logs/` ante errores
3. **Lee docs/DOCUMENTATION.md**: Toda la arquitectura está ahí
4. **Ejecuta tests**: `cd sc && forge test` antes de commits

### Para Evaluadores

1. **Ejecuta**: `./deploy.sh start`
2. **Prueba**: http://localhost:3000
3. **Revisa tests**: `cd sc && forge test -vv`
4. **Lee**: [docs/REPORTS.md](./docs/REPORTS.md) para evaluación completa

---

## 📞 Ayuda

**¿Problema con el deployment?**
→ `./deploy.sh help` y [docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)

**¿Necesitas entender el código?**
→ [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md)

**¿Trabajando en el frontend?**
→ [docs/FRONTEND.md](./docs/FRONTEND.md)

**¿Trabajando en el smart contract?**
→ [docs/SMART_CONTRACT.md](./docs/SMART_CONTRACT.md)

**¿Quieres ver el índice completo?**
→ [INDEX.md](./INDEX.md)

**¿Estado actual del proyecto?**
→ [STATUS.md](./STATUS.md) ⭐

---

## 🔍 Guías Rápidas por Rol

### Para Desarrolladores

**Primera vez**:
1. Leer [README.md](./README.md)
2. Ejecutar `./deploy.sh start`
3. Configurar MetaMask: `./deploy.sh metamask`
4. Leer [docs/FRONTEND.md](./docs/FRONTEND.md) para frontend

**Desarrollo diario**:
1. `./deploy.sh start` - Iniciar servicios
2. Desarrollar features
3. `./deploy.sh frontend restart` - Reiniciar solo frontend (si solo cambias frontend)
4. `./deploy.sh stop` - Detener servicios

**Troubleshooting**:
1. `./deploy.sh status` - Ver estado
2. Revisar logs en `logs/`
3. Consultar [docs/DOCUMENTATION.md - Troubleshooting](./docs/DOCUMENTATION.md#-troubleshooting)

### Para Evaluadores

**Evaluar el proyecto**:
1. Leer [docs/REPORTS.md](./docs/REPORTS.md) - Reportes consolidados
2. Ejecutar `./deploy.sh start`
3. Probar la DApp en http://localhost:3000
4. Ver tests: `cd sc && forge test`

### Para Nuevos Colaboradores

**Onboarding**:
1. [README.md](./README.md) - Quick start
2. [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) - Arquitectura completa
3. [docs/FRONTEND.md](./docs/FRONTEND.md) - Detalles frontend
4. [STATUS.md](./STATUS.md) - Estado actual

---

## 📚 Documentación Externa

### Links Útiles

**Tecnologías**:
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

**Creado**: 18 de Noviembre, 2025  
**Última actualización**: 27 de Noviembre, 2025  
**Versión**: 1.6.0  
**Estado**: ✅ 9/9 páginas completadas (100%), 24 hooks implementados, validaciones críticas del contrato implementadas

> **📋 Para el estado más actualizado, consulta [STATUS.md](./STATUS.md)**

---

<div align="center">

### 🚀 ¡A Desarrollar!

```bash
./deploy.sh start
```

</div>
