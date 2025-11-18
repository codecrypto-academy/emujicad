# 

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

## 📁 Archivos Disponibles

### 1. `Deploy.s.sol` - Script de Deployment
- **Propósito**: Deployment automatizado con configuración inicial
- **Características**:
  - Deploy del contrato SupplyChain
  - Configuración inicial del owner
  - Verificación automática post-deployment
  - Logs detallados del proceso

### 2. `Interactions.s.sol` - Demo de Flujo Completo  
- **Propósito**: Demostración automatizada de workflow completo
- **Fases incluidas**:
  - ✅ Registro de usuarios (Manufacturer, Distributor, Retailer)
  - ✅ Creación de tokens con metadata
  - ✅ Flujo de transferencias completo
  - ✅ Aceptación y rechazo de transfers
  - ✅ Casos edge (cancelaciones)
  - ✅ Validación final del sistema

## 🚀 Instrucciones de Uso

### Prerequisitos
```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Variables de entorno requeridas
export PRIVATE_KEY="0x..."           # Admin/Deployer private key
export ACCEPTOR_PRIVATE_KEY="0x..."  # Para accepting transfers
export REJECTOR_PRIVATE_KEY="0x..."  # Para rejecting transfers  
export RPC_URL="http://localhost:8545"  # Anvil local o testnet
```

### 1. Deployment
```bash
# Start Anvil local blockchain
anvil

# Deploy contract
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast

# Output: Contract address para usar en Interactions
```

### 2. Demo Workflow Completo
```bash
# Actualizar contract address en Interactions.s.sol línea 19

# Ejecutar demo completo
forge script script/Interactions.s.sol \
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
- Actualizar addresses en `Interactions.s.sol` líneas 14-16
- Cambiar nombres de productos en `_createToken()` calls
- Ajustar notas de transfers según necesidades

### Añadir Nuevos Escenarios
- Extend `run()` function con nuevas fases
- Implementar casos de ownership transfer
- Agregar escenarios de pause/unpause

## ⚠️ Notas Importantes

1. **Security**: Nunca commitear private keys reales
2. **Testing**: Usar Anvil para testing local seguro
3. **Production**: Validar todas las addresses antes de mainnet
4. **Gas**: Considerar gas costs en testnets reales

---

**Estos scripts demuestran la funcionalidad completa del contrato SupplyChain y proporcionan una base sólida para presentación académica y deployment en producción.**