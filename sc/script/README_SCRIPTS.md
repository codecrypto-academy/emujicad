# 📜 Scripts Documentation

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para documentación completa de scripts, consulta [docs/sc/SCRIPTS.md](../../docs/sc/SCRIPTS.md)**  
> **📚 Para deployment automatizado, consulta [deploy.sh](../../deploy.sh) o [QUICKSTART.md](../../QUICKSTART.md)**

**Última actualización**: 26 de Noviembre, 2025

<div align="center">

```
     ████████╗ ██████╗ ██████╗ ██╗██████╗ ████████╗███████╗
     ╚══██╔══╝██╔════╝██╔═══██╗██║██╔══██╗╚══██╔══╝██╔════╝
        ██║   ╚█████╗ ██║   ██║██║██████╔╝   ██║   ███████╗
        ██║    ╚═══██╗██║   ██║██║██╔═══╝    ██║   ╚════██║
        ██║   ██████╔╝╚██████╔╝██║██║        ██║   ███████║
        ╚═╝   ╚═════╝  ╚═════╝ ╚═╝╚═╝        ╚═╝   ╚══════╝
```

## 🤖 Script Automation - SupplyChain Contract

[![Foundry](https://img.shields.io/badge/Foundry-Script-green?style=for-the-badge&logo=ethereum)](https://book.getfoundry.sh/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.30-blue?style=for-the-badge&logo=solidity)](https://soliditylang.org/)
[![Automation](https://img.shields.io/badge/Deployment-Automated-orange?style=for-the-badge&logo=github-actions)](/)
[![Demo](https://img.shields.io/badge/Demo-Interactive-purple?style=for-the-badge&logo=play)](/)

</div>

---

Este directorio contiene scripts de Foundry para automatizar el deployment y demostración completa del contrato SupplyChain.

> **📚 Nota**: Para deployment automatizado completo (Anvil + Contrato + Frontend), usa el script `deploy.sh` en la raíz del proyecto. Estos scripts de Foundry son útiles para testing manual y demostraciones específicas.

## 📁 Archivos Disponibles

### 1. `SupplyChainDeploy.s.sol` - Script de Deployment
- **Propósito**: Deployment automatizado con configuración inicial
- **Características**:
  - Deploy del contrato SupplyChain
  - Configuración inicial del owner
  - Verificación automática post-deployment
  - Logs detallados del proceso

### 2. `SupplyChainInteractions.s.sol` - Demo de Flujo Completo  
- **Propósito**: Demostración automatizada de workflow completo
- **Fases incluidas**:
  - ✅ PHASE 1: Registro de usuarios (Producer, Factory, Retailer, Consumer)
  - ✅ PHASE 2: Creación de tokens con metadata (Raw Material y Finished Product)
  - ✅ PHASE 3: Flujo de transferencias completo
  - ✅ PHASE 4: Aceptación, rechazo y cancelación de transfers
  - ✅ PHASE 5: Transferencia de ownership (initiate, accept, reject)
  - ✅ Validación final del sistema

## 🚀 Instrucciones de Uso

### Prerequisitos

> **📚 Para setup completo del proyecto, consulta [QUICKSTART.md](../../QUICKSTART.md) o [docs/fe/SETUP.md](../../docs/fe/SETUP.md)**

```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Variables de entorno requeridas
export PRIVATE_KEY="0x..."           # Admin/Deployer private key (Account #0 de Anvil: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80)
export ACCEPTOR_PRIVATE_KEY="0x..."  # Para accepting transfers
export REJECTOR_PRIVATE_KEY="0x..."  # Para rejecting transfers  
export RPC_URL="http://localhost:8545"  # Anvil local o testnet

# Nota: Si usas deploy.sh, las variables de entorno se configuran automáticamente
```

### 1. Deployment

> **📚 Alternativa automatizada**: El script `deploy.sh` en la raíz del proyecto automatiza todo el proceso (Anvil + Deployment + Frontend). Ver [QUICKSTART.md](../../QUICKSTART.md) o ejecutar `./deploy.sh start`.

```bash
# Opción A: Usar deploy.sh (recomendado)
./deploy.sh start  # Inicia Anvil, despliega contrato y frontend automáticamente

# Opción B: Deployment manual con Foundry
# Start Anvil local blockchain
anvil

# Deploy contract
forge script script/SupplyChainDeploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Output: Contract address para usar en Interactions
```

### 2. Demo Workflow Completo
```bash
# El script SupplyChainInteractions.s.sol despliega su propio contrato en setUp()
# No es necesario actualizar ninguna dirección

# Ejecutar demo completo
forge script script/SupplyChainInteractions.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Output: Demo completo con logs detallados
```

## 📊 Ejemplo de Output Esperado

```
=== SupplyChain Complete Workflow Demo ===
Contract address: 0x5FbDB2315678afecb367f032d93F642f64180aa3

🏭 === PHASE 1: USER REGISTRATION ===
✅ Registered: Tesla Manufacturing as Manufacturer
✅ Registered: Global Distribution Co as Distributor  
✅ Registered: TechRetail Store as Retailer

📦 === PHASE 2: TOKEN CREATION ===
📦 Token created - ID: 1 Name: iPhone 15 Pro Owner: 0x1111...
📦 Token created - ID: 2 Name: MacBook Pro M3 Owner: 0x1111...

🚚 === PHASE 3: TRANSFER WORKFLOW ===
🚚 Transfer initiated - ID: 1 Token: 1 To: 0x2222...
🚚 Transfer initiated - ID: 2 Token: 2 To: 0x2222...

✅ === PHASE 4: TRANSFER OPERATIONS ===
✅ Transfer accepted - ID: 1 By: 0x2222...
❌ Transfer rejected - ID: 2 Reason: Quality issues detected

📊 === WORKFLOW COMPLETION SUMMARY ===
✅ Workflow completed successfully!
🎯 Ready for academic presentation
```

## 🎯 Beneficios de los Scripts

### Para Desarrollo
- ✅ **Testing Automatizado**: Validación end-to-end del contrato
- ✅ **Deployment Repetible**: Proceso standardizado de deployment
- ✅ **Debugging**: Logs detallados para troubleshooting

### Para Presentación Académica
- ✅ **Demo Interactivo**: Demostración completa automatizada
- ✅ **Casos de Uso Reales**: Escenarios prácticos implementados  
- ✅ **Validación Visual**: Output claro y profesional
- ✅ **Documentación Viva**: Código auto-documentado

### Para Auditoría
- ✅ **Flujos Verificables**: Cada operación registrada y validada
- ✅ **Edge Cases**: Demostración de manejo de errores
- ✅ **Trazabilidad**: Logs completos de todas las operaciones

## 🔧 Personalización

### Modificar Datos Demo
- Actualizar addresses en `SupplyChainInteractions.s.sol` líneas 23-34
- Cambiar nombres de productos en `createToken()` calls
- Ajustar cantidades de tokens según necesidades

### Escenarios Incluidos
- ✅ PHASE 1: Registro y aprobación de usuarios
- ✅ PHASE 2: Creación de tokens (Raw Material y Finished Product)
- ✅ PHASE 3: Transferencias entre roles
- ✅ PHASE 4: Rechazo y cancelación de transfers
- ✅ PHASE 5: Transferencia de ownership (initiate, accept, reject) - ✅ Implementado
- 🔄 Agregar escenarios de pause/unpause (opcional)

> **📚 Para documentación completa de todas las funciones del contrato, consulta [docs/sc/API_REFERENCE.md](../../docs/sc/API_REFERENCE.md)**

## ⚠️ Notas Importantes

1. **Security**: Nunca commitear private keys reales
2. **Testing**: Usar Anvil para testing local seguro
3. **Production**: Validar todas las addresses antes de mainnet
4. **Gas**: Considerar gas costs en testnets reales
5. **Deployment Automatizado**: Para uso diario, preferir `deploy.sh` que automatiza todo el proceso

## 🔗 Referencias Relacionadas

- **Deployment Automatizado**: [deploy.sh](../../deploy.sh) - Script completo de deployment (1,110 líneas)
- **Quick Start**: [QUICKSTART.md](../../QUICKSTART.md) - Guía rápida de inicio
- **Documentación Scripts**: [docs/sc/SCRIPTS.md](../../docs/sc/SCRIPTS.md) - Documentación técnica completa
- **Documentación Deployment**: [docs/sc/DEPLOYMENT.md](../../docs/sc/DEPLOYMENT.md) - Guía de deployment
- **Estado del Proyecto**: [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Estado actual y próximos pasos
- **Cuentas Anvil**: [CUENTAS_ANVIL_10_14.md](../../CUENTAS_ANVIL_10_14.md) - Private keys de cuentas adicionales

---

**Última actualización**: 26 de Noviembre, 2025

**Estos scripts demuestran la funcionalidad completa del contrato SupplyChain y proporcionan una base sólida para presentación académica y deployment en producción.**