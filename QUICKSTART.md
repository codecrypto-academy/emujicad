# 🚀 Quick Start - Supply Chain Tracker

> **📚 DOCUMENTACIÓN COMPLETA**: Ver [docs/DOCUMENTATION.md](./docs/DOCUMENTATION.md) para guía exhaustiva del proyecto

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

> **📚 Ver documentación completa**: [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md)

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

> **📚 Para documentación completa de todos los hooks, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)**

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

> **📚 Ver lista completa y documentación detallada**: [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)

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
- [docs/fe/SETUP.md](./docs/fe/SETUP.md) - Setup y configuración
- [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md) - Componentes
- [docs/fe/HOOKS.md](./docs/fe/HOOKS.md) - Hooks personalizados

**Smart Contract**:
- [docs/sc/ARCHITECTURE.md](./docs/sc/ARCHITECTURE.md) - Arquitectura
- [docs/sc/API_REFERENCE.md](./docs/sc/API_REFERENCE.md) - Referencia API

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
