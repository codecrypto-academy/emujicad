# 🚀 Quick Start - Supply Chain Tracker

> **📚 DOCUMENTACIÓN COMPLETA**: Ver [docs/common/DOCUMENTATION.md](./docs/common/DOCUMENTATION.md) para guía exhaustiva del proyecto

---

## ⚠️ Páginas y Componentes Faltantes

### 📄 Páginas por Implementar (6 de 7 faltantes)

```
web/src/app/
├── page.tsx                    ✅ Landing con MetaMask
├── dashboard/page.tsx          ❌ FALTA - Panel principal por rol
├── tokens/
│   ├── page.tsx               ❌ FALTA - Lista de tokens usuario
│   └── create/page.tsx        ❌ FALTA - Formulario crear token
├── transfers/page.tsx         ❌ FALTA - Gestión transferencias
├── admin/
│   ├── page.tsx              ❌ FALTA - Panel admin
│   └── users/page.tsx        ❌ FALTA - Aprobar/rechazar usuarios
└── profile/page.tsx           ❌ FALTA - Perfil y portfolio
```

### 🧩 Componentes Específicos Faltantes (4 de 5)

```
web/src/components/
├── ConnectWallet.tsx          ✅ IMPLEMENTADO
├── Headers.tsx                ❌ FALTA - Navegación principal
├── TokenCard.tsx              ❌ FALTA - Tarjeta de token
├── TransferList.tsx           ❌ FALTA - Lista transferencias
└── UserTable.tsx              ❌ FALTA - Tabla usuarios admin
```

### 📁 Directorio `contexts/` - OPCIONAL

⚠️ **Nota**: README.md requiere `src/contexts/Web3Context.tsx`, pero:
- Tu implementación usa **wagmi** (práctica moderna recomendada)
- No necesitas crear contexto manual
- **Decisión correcta**: Evitar código duplicado

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

**Día 1 Completado** - 18 de Noviembre 2025

### 🎯 Comparación con Estructura de Referencia

**Puntuación General: 7/10** ✅ (Base implementado, falta UI completa)

| Componente | README.md | Implementación Actual | Estado |
|------------|-----------|----------------------|--------|
| **Infraestructura** | ✅ | ✅ **Superior** (wagmi + viem) | 10/10 |
| **Hooks personalizados** | ✅ | ✅ **12 hooks** | 10/10 |
| **Componentes UI** | ✅ | ✅ **10 componentes** | 10/10 |
| **Páginas** | ✅ 7 requeridas | ⚠️ **1 de 7** (solo landing) | 2/10 |
| **Componentes específicos** | ✅ 4 requeridos | ⚠️ **1 de 5** (ConnectWallet) | 2/10 |

### ✅ Smart Contract (Backend Blockchain):

---

## 🎓 Contexto Académico

Este proyecto es parte de un **PFM/TFM** de Master en Blockchain y Web3.

**Fecha de entrega**: 28 de Noviembre, 2025  
**Días restantes**: 11 días  
**Estado**: Día 1 completado

Ver **[docs/reports/ACADEMIC_ASSESSMENT.md](./docs/reports/ACADEMIC_ASSESSMENT.md)** para evaluación académica completa.

---

## 🔗 Links Útiles

### Documentación del Proyecto
- [INDEX.md](./INDEX.md) - Índice maestro de toda la documentación
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
