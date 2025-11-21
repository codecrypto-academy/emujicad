# 🚀 Quick Start - Supply Chain Tracker

> **📚 DOCUMENTACIÓN COMPLETA**: Ver [docs/common/DOCUMENTATION.md](./docs/common/DOCUMENTATION.md) para guía exhaustiva del proyecto

---

## 📊 Estado de Implementación del Frontend

### 📄 Páginas Implementadas (3 de 9)

```
web/src/app/
├── page.tsx                    ✅ IMPLEMENTADO - Landing con MetaMask + Stats
├── dashboard/page.tsx          ✅ IMPLEMENTADO - Panel principal por rol COMPLETO
├── tokens/
│   ├── page.tsx               ❌ PENDIENTE - Lista de tokens usuario
│   ├── create/page.tsx        ❌ PENDIENTE - Formulario crear token
│   ├── [id]/page.tsx          ❌ PENDIENTE - Detalles token
│   └── [id]/transfer/page.tsx ❌ PENDIENTE - Transferir token
├── transfers/page.tsx         ❌ PENDIENTE - Gestión transferencias
├── admin/
│   ├── page.tsx               ❌ PENDIENTE - Panel admin principal
│   └── users/page.tsx         ✅ IMPLEMENTADO - Gestión completa de usuarios
└── profile/page.tsx           ❌ PENDIENTE - Perfil usuario
```

**Progreso**: 3/9 páginas (33%)

### 🧩 Componentes Específicos (4 de 5 implementados)

```
web/src/components/
├── ConnectWallet.tsx          ✅ IMPLEMENTADO - Conexión MetaMask
├── Header.tsx                 ✅ IMPLEMENTADO - Navegación + branding + pausa badge
├── ThemeToggle.tsx            ✅ IMPLEMENTADO - Modo claro/oscuro con persistencia
├── TokenCard.tsx              ✅ IMPLEMENTADO - Tarjeta de token completa
└── TransferList.tsx           ❌ PENDIENTE - Lista transferencias
```

**Progreso**: 4/5 componentes específicos (80%)

### 🎨 Componentes Adicionales Implementados

```
web/src/components/
├── RegisterForm.tsx           ✅ Formulario registro con validación de pausa
├── ChangeRoleDialog.tsx       ✅ Diálogo cambiar rol con validación de pausa
├── UserProfileCard.tsx        ✅ Perfil de usuario
├── QuickActions.tsx           ✅ Acciones rápidas con validación de pausa
└── admin/
    ├── UserManagementTable.tsx  ✅ Tabla gestión usuarios con filtros + pausa
    ├── UserStatsCards.tsx       ✅ Cards estadísticas del sistema
    └── PauseControl.tsx         ✅ Control de pausa del contrato
```

**Total componentes personalizados**: 11 implementados
**Componentes Shadcn UI**: 10 componentes (button, card, input, label, select, table, badge, dialog, alert, skeleton)

### 🪝 Hooks Personalizados (18 implementados)

```
web/src/hooks/
├── useContractReads.ts        ✅ 5 hooks lectura (userInfo, isAdmin, totals)
├── useRequestRole.ts          ✅ Solicitar rol de usuario
├── useCreateToken.ts          ✅ Crear tokens
├── useTransfer.ts             ✅ 4 hooks transferencias (transfer, accept, reject, cancel)
├── useAdminUsers.ts           ✅ 2 hooks admin (getAllUsers, changeUserStatus)
├── useContractOwner.ts        ✅ Verificar ownership del contrato
├── useGetUserTokens.ts        ✅ 3 hooks tokens (getUserTokens, getToken, getTokenBalance)
└── usePause.ts                ✅ 3 hooks pausa (isPaused, pause, unpause)
```

**Total**: 18 hooks personalizados (8 archivos)

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

## 📋 Comandos del Script

```bash
./deploy.sh start      # Iniciar todo el stack
./deploy.sh stop       # Detener todos los servicios
./deploy.sh status     # Ver estado de servicios
./deploy.sh metamask   # Instrucciones MetaMask
./deploy.sh restart    # Reiniciar todo
./deploy.sh help       # Ayuda completa
```

---

## 📖 Documentación Disponible

- **[QUICKSTART.md](./QUICKSTART.md)** - Esta guía rápida
- **[INDEX.md](./INDEX.md)** - Índice maestro de toda la documentación
- **[IA.md](./IA.md)** ⭐ - Retrospectiva del uso de IA en el proyecto
- **¿Necesitas entender la arquitectura?**
→ [docs/common/DOCUMENTATION.md](./docs/common/DOCUMENTATION.md)
- **[docs/reports/SUMMARY_DAY1.md](./docs/reports/SUMMARY_DAY1.md)** - Resumen del Día 1
- **[docs/reports/ACADEMIC_ASSESSMENT.md](./docs/reports/ACADEMIC_ASSESSMENT.md)** - Evaluación académica
- **[docs/fe/SETUP.md](./docs/fe/SETUP.md)** - Documentación del frontend (40KB)

---

## 🛠️ Stack Tecnológico

### Smart Contract
- **Solidity** 0.8.30
- **Foundry** (Forge + Anvil)
- **OpenZeppelin** Contracts
- **934 líneas** de código
- **73 tests** (83.33% coverage)

### Frontend
- **Next.js** 16.0.1
- **React** 19.2.0
- **TypeScript** 5.x
- **Tailwind CSS** 3.4.14
- **Shadcn UI**
- **wagmi** 2.12.0 + **viem** 2.21.0 + **ethers** 6.13.0

### Blockchain Local
- **Anvil** (Foundry)
- **Chain ID**: 31337
- **RPC**: http://127.0.0.1:8545
- **10 cuentas** con 10,000 ETH cada una

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

```
emujicad/
│
├── 🚀 deploy.sh                 # Script automatizado (650 líneas)
├── 📄 QUICKSTART.md             # Esta guía
├── 📁 docs/                     # Toda la documentación
│   ├── common/               # Doc general
│   ├── sc/                   # 18 archivos SC
│   ├── fe/                   # 5 archivos frontend
│   └── reports/              # 4 evaluaciones
├── 📄 INDEX.md                  # Índice de docs
│
├── 📁 sc/                       # Smart Contract
│   ├── src/SupplyChain.sol
│   ├── test/
│   └── script/
│
├── 📁 web/                      # Frontend Next.js
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── contracts/
│   │   ├── hooks/
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

# Al terminar el día
./deploy.sh stop
```

### 4️⃣ Verificar Estado

```bash
# Ver estado de servicios
./deploy.sh status

# Ver logs en tiempo real
tail -f logs/anvil.log
tail -f logs/frontend.log
```

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

Ver **[docs/common/DOCUMENTATION.md - Troubleshooting](./docs/common/DOCUMENTATION.md#-troubleshooting)** para soluciones detalladas.

---

## 📊 Estado Actual del Proyecto

**Día 4 Completado** - 21 de Noviembre 2025

### 🎯 Comparación con Estructura de Referencia

**Puntuación General: 8.0/10** ✅ (Dashboard completo, sistema de pausabilidad, infraestructura 75%, todas las tareas de baja prioridad completadas)

| Componente | README.md | Implementación Actual | Estado |
|------------|-----------|----------------------|--------|
| **Infraestructura** | ✅ | ✅ **Superior** (wagmi + viem) | 10/10 |
| **Hooks personalizados** | ✅ | ✅ **15 hooks** (+3 admin) | 10/10 |
| **Componentes UI** | ✅ | ✅ **16 componentes** (9 Shadcn + 7 custom) | 10/10 |
| **Páginas** | ✅ 7 requeridas | ⚠️ **2 de 7** (landing + admin/users) | 3/10 |
| **Componentes específicos** | ✅ 5 requeridos | ⚠️ **3 de 5** (+RegisterForm, +4 admin) | 6/10 |

### ✅ Smart Contract (Backend Blockchain):

---

## 🎓 Contexto Académico

Este proyecto es parte de un **PFM/TFM** de Master en Blockchain y Web3.

**Fecha de entrega**: 28 de Noviembre, 2025  
**Días restantes**: 8 días  
**Estado**: Día 3 completado (Admin Panel funcional)

**Puntuación actual**: 8.0/10 ✅ APROBATORIO
- Smart Contract: 4.0/4.0 ✅
- Frontend: 2.8/3.0 (75% implementado) ⚠️
- Extras: 0.5/1.0 (deploy script + pausabilidad + performance + tests + accesibilidad + animaciones) ⚠️
- Video: 0.0/1.5 ❌

**Estado Día 4**: ✅ Todas las tareas de baja prioridad completadas (Performance, Tests, Accesibilidad, Animaciones)

**Próximo objetivo**: Páginas de Tokens y Transfers (Día 5-6) para completar frontend a 3.0/3.0

Ver **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** para roadmap detallado y próximos pasos.

---

## 🔗 Links Útiles

### Documentación del Proyecto
- [INDEX.md](./INDEX.md) - Índice maestro de toda la documentación
- [IA.md](./IA.md) - Retrospectiva del uso de IA
- [docs/common/DOCUMENTATION.md](./docs/common/DOCUMENTATION.md) - Guía técnica completa
- [docs/fe/SETUP.md](./docs/fe/SETUP.md) - Documentación del frontend
- [docs/reports/SUMMARY_DAY1.md](./docs/reports/SUMMARY_DAY1.md) - Resumen del Día 1

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
3. **Lee docs/common/DOCUMENTATION.md**: Toda la arquitectura está ahí
4. **Ejecuta tests**: `cd sc && forge test` antes de commits

### Para Evaluadores

1. **Ejecuta**: `./deploy.sh start`
2. **Prueba**: http://localhost:3000
3. **Revisa tests**: `cd sc && forge test -vv`
4. **Lee**: docs/reports/ACADEMIC_ASSESSMENT.md para evaluación completa

---

## 📞 Ayuda

**¿Problema con el deployment?**
→ `./deploy.sh help` y [docs/common/DOCUMENTATION.md - Troubleshooting](./docs/common/DOCUMENTATION.md#-troubleshooting)

**¿Necesitas entender el código?**
→ [DOCUMENTATION.md](./DOCUMENTATION.md)

**¿Trabajando en el frontend?**
→ [docs/fe/SETUP.md](./docs/fe/SETUP.md) | [COMPONENTS.md](./docs/fe/COMPONENTS.md) | [HOOKS.md](./docs/fe/HOOKS.md)

**¿Quieres ver el índice completo?**
→ [INDEX.md](./INDEX.md)

---

**Creado**: 18 de Noviembre, 2025  
**Versión**: 1.0.0  
**Estado**: ✅ Día 1 completado - Listo para desarrollo

---

<div align="center">

### 🚀 ¡A Desarrollar!

```bash
./deploy.sh start
```

</div>
