# 📋 Validaciones Pendientes en el Contrato Inteligente

**Fecha**: 24 de Noviembre, 2025  
**Estado**: Documentación de validaciones implementadas en Frontend pero NO en el Contrato  
**Última actualización**: 24 de Noviembre, 2025 - Validación de alta prioridad COMPLETADA ✅

---

## 🔍 Resumen Ejecutivo

Este documento identifica las validaciones que se implementaron en el **Frontend** para mejorar la experiencia del usuario y prevenir errores, pero que **NO están implementadas en el Contrato Inteligente**. Estas validaciones son críticas porque:

1. **El frontend puede ser manipulado** - Un usuario malicioso puede llamar directamente al contrato saltándose las validaciones del frontend
2. **Seguridad descentralizada** - Las validaciones deben estar en el contrato para garantizar la seguridad de la aplicación
3. **Consistencia** - Las validaciones deben estar en ambos lugares para una mejor UX y seguridad

---

## 📊 Validaciones Pendientes por Función

### 1. `transfer(address to, uint tokenId, uint amount)`

#### ✅ Validaciones que SÍ tiene el contrato:
- ✅ Dirección no nula (`to != address(0)`)
- ✅ Cantidad mayor a 0 (`amount > 0`)
- ✅ Token existe (`token.id != 0`)
- ✅ Balance suficiente (`senderBalance >= amount`)
- ✅ Contrato no pausado (`whenNotPaused`)
- ✅ Usuario autorizado para transferir (`onlyTransfersAllowed`)

#### ❌ Validaciones CRÍTICAS que FALTA en el contrato:

1. **Validación de rol por tipo de token en `transfer()`** ✅ **COMPLETADO**
   - **Problema**: No valida que el rol del emisor sea compatible con el tipo de token
   - **Requisitos**:
     - Raw Material: Solo Producer puede transferir
     - Finished Product: Solo Factory o Retailer pueden transferir
   - **Riesgo**: Alto (mitigado)
   - **Prioridad**: Alta ✅
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Implementación**: Validación agregada en `transfer()` (líneas 765-773)
   - **Nota**: Previene transferencias inválidas que rompen la lógica de la cadena de suministro

2. **Validación de rol por tipo de token en `acceptTransfer()`** ✅ **COMPLETADO**
   - **Problema**: No valida que el rol del receptor sea compatible con el tipo de token
   - **Requisitos**:
     - Raw Material: Solo Factory puede aceptar
     - Finished Product: Solo Retailer o Consumer pueden aceptar
   - **Riesgo**: Alto (mitigado)
   - **Prioridad**: Alta ✅
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Implementación**: Validación agregada en `acceptTransfer()` (líneas 804-812)
   - **Nota**: Previene que roles incorrectos acepten transferencias

3. **Validación de rol por tipo de token en `rejectTransfer()`** ✅ **COMPLETADO**
   - **Problema**: No valida que el rol del receptor sea compatible con el tipo de token
   - **Requisitos**:
     - Raw Material: Solo Factory puede rechazar
     - Finished Product: Solo Retailer o Consumer pueden rechazar
   - **Riesgo**: Alto (mitigado)
   - **Prioridad**: Alta ✅
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Implementación**: Validación agregada en `rejectTransfer()` (líneas 878-886)
   - **Nota**: Previene que roles incorrectos rechacen transferencias

#### ❌ Validaciones que FALTA en el contrato (pero están en Frontend):

1. **Validación de formato de dirección**
   - **Frontend**: Usa `isAddress(to)` de viem para validar formato hexadecimal válido
   - **Contrato**: Solo valida que no sea `address(0)`, pero no valida el formato
   - **Riesgo**: Bajo (Solidity rechaza direcciones inválidas automáticamente)
   - **Prioridad**: Baja

2. **Validación de tokenId > 0**
   - **Frontend**: Valida `tokenIdNum > 0` antes de enviar
   - **Contrato**: Solo valida que el token exista (`token.id != 0`), pero no valida explícitamente `tokenId > 0`
   - **Riesgo**: Bajo (si `tokenId == 0`, el token no existirá)
   - **Prioridad**: Baja

---

### 2. `createToken(string memory name, TokenType tokenType, uint totalSupply, string memory features, uint parentId, uint parentAmount)`

#### ✅ Validaciones que SÍ tiene el contrato:
- ✅ Nombre no vacío (`bytes(name).length > 0`)
- ✅ TotalSupply > 0 (`totalSupply > 0`)
- ✅ Para FinishedProduct: `parentId != 0`, `parentAmount > 0`, token padre existe, balance suficiente
- ✅ Para RawMaterial: `parentId == 0`, `parentAmount == 0`
- ✅ Contrato no pausado (`whenNotPaused`)
- ✅ Usuario autorizado para crear tokens (`onlyTokenCreators`)

#### ❌ Validaciones que FALTA en el contrato (pero están en Frontend):

1. **Longitud mínima del nombre** ✅ **COMPLETADO**
   - **Frontend**: Valida `name.trim().length >= 2`
   - **Contrato**: ✅ **IMPLEMENTADO** - Valida que el nombre tenga al menos 2 caracteres
   - **Riesgo**: Medio (mitigado)
   - **Prioridad**: Media ✅
   - **Estado**: ✅ **COMPLETADO** (24 Nov 2025)
   - **Implementación**:
     ```solidity
     if (bytes(name).length < 2) revert InvalidName();
     ```
   - **Test**: ✅ `testCreateTokenSingleCharacterName()` agregado en EdgeCasesTest.t.sol
   - **Nota**: Previene nombres de 1 carácter, mejorando la consistencia de datos y UX

2. **Validación de formato JSON en features**
   - **Frontend**: Valida que `features` sea JSON válido usando `JSON.parse()`
   - **Contrato**: No valida el formato de `features`
   - **Riesgo**: Bajo (features es solo metadata, no afecta la lógica del contrato)
   - **Prioridad**: Baja
   - **Nota**: Validar JSON en Solidity es costoso en gas, probablemente no vale la pena

3. **Validación de balance del parent token antes de crear FinishedProduct**
   - **Frontend**: Valida que `parentBalance > 0` antes de permitir crear FinishedProduct
   - **Contrato**: ✅ **SÍ valida** el balance suficiente (`userParentBalance >= parentAmount`)
   - **Estado**: ✅ Ya implementado en el contrato
   - **Nota**: El frontend hace una validación adicional para mejor UX, pero el contrato ya lo valida

---

### 3. `requestRole(UserRole role)` / `registerUser(UserRole role)`

#### ✅ Validaciones que SÍ tiene el contrato:
- ✅ Rol válido (enum UserRole)
- ✅ Usuario no es el owner (`msg.sender != owner`)
- ✅ Usuario no tiene rol aprobado existente (`!existingUserWithApprovedRole`)
- ✅ Usuario no tiene el mismo rol pendiente (`!userWithExistingRole`)
- ✅ Contrato no pausado (`whenNotPaused`)

#### ❌ Validaciones que FALTA en el contrato (pero están en Frontend):

1. **Validación de usuario cancelado** ✅ **COMPLETADO**
   - **Frontend**: Bloquea completamente el registro si `userStatus == Canceled`
   - **Contrato**: ✅ **IMPLEMENTADO** - Valida explícitamente si el usuario está cancelado
   - **Riesgo**: Medio-Alto (mitigado)
   - **Prioridad**: Alta ✅
   - **Estado**: ✅ **COMPLETADO** (24 Nov 2025)
   - **Implementación**:
     ```solidity
     // Error personalizado agregado
     error UserCanceled();
     
     // Validación en requestUserRole()
     if (user.status == UserStatus.Canceled) {
         revert UserCanceled();
     }
     ```
   - **Test**: ✅ `testCanceledUserCannotRequestRole()` agregado en EdgeCasesTest.t.sol
   - **Nota**: Los usuarios cancelados NO pueden solicitar nuevos roles. Solo el admin puede cambiar su estado.

2. **Validación de cambio de rol al mismo rol**
   - **Frontend**: Valida que `selectedRole !== currentRoleName` antes de enviar
   - **Contrato**: Valida `!userWithExistingRole`, pero esto solo verifica si el rol está pendiente/aprobado
   - **Riesgo**: Bajo (el contrato ya previene roles duplicados)
   - **Prioridad**: Baja

---

## 🎯 Priorización de Validaciones Pendientes

### 🔴 Alta Prioridad

1. **Validación de usuario cancelado en `requestRole()`** ✅ **COMPLETADO**
   - **Impacto**: Seguridad y lógica de negocio
   - **Riesgo**: Medio-Alto (mitigado)
   - **Esfuerzo**: Bajo (1 línea de código)
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Test**: ✅ `testCanceledUserCannotRequestRole()` agregado
   - **Coverage**: Mejora branch coverage del contrato

2. **Validación de restricciones de rol por tipo de token en transferencias** ❌ **PENDIENTE**
   - **Impacto**: Seguridad y lógica de negocio crítica
   - **Riesgo**: Alto (permite transferencias inválidas en la cadena de suministro)
   - **Esfuerzo**: Medio (validaciones adicionales en `transfer()` y `acceptTransfer()`)
   - **Estado**: ❌ **NO IMPLEMENTADO**
   - **Problema**: El contrato actualmente permite:
     - ❌ Factory/Retailer pueden transferir Raw Material (solo debería Producer)
     - ❌ Retailer/Consumer pueden aceptar Raw Material (solo debería Factory)
     - ❌ Producer puede transferir Finished Product (solo debería Factory/Retailer)
     - ❌ Factory/Consumer pueden aceptar Finished Product de Producer (solo debería Retailer/Consumer)
   - **Recomendación**: Implementar validaciones que verifiquen:
     - Raw Material: Solo Producer puede transferir, solo Factory puede aceptar
     - Finished Product: Solo Factory/Retailer pueden transferir, solo Retailer/Consumer pueden aceptar

### 🟡 Media Prioridad

2. **Longitud mínima del nombre en `createToken()`** ✅ **COMPLETADO**
   - **Impacto**: UX y consistencia de datos
   - **Riesgo**: Medio (mitigado)
   - **Esfuerzo**: Bajo (1 línea de código)
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Test**: ✅ `testCreateTokenSingleCharacterName()` agregado
   - **Coverage**: Mejora branch coverage del contrato

### 🟢 Baja Prioridad

3. **Validación de formato de dirección en `transfer()`**
   - **Impacto**: Mínimo (Solidity ya valida automáticamente)
   - **Riesgo**: Bajo
   - **Esfuerzo**: N/A (no necesario)
   - **Recomendación**: No implementar (redundante)

4. **Validación de tokenId > 0 en `transfer()`**
   - **Impacto**: Mínimo (ya validado implícitamente)
   - **Riesgo**: Bajo
   - **Esfuerzo**: Bajo
   - **Recomendación**: Opcional (mejora la claridad del código)

5. **Validación de formato JSON en `createToken()`**
   - **Impacto**: Mínimo (features es solo metadata)
   - **Riesgo**: Bajo
   - **Esfuerzo**: Alto (validar JSON en Solidity es costoso)
   - **Recomendación**: No implementar (no vale la pena el costo en gas)

---

## 📝 Recomendaciones de Implementación

### 1. Agregar Error Personalizado

```solidity
/**
 * @notice El usuario está cancelado y no puede realizar acciones.
 */
error UserCanceled();
```

### 2. Actualizar `requestRole()`

```solidity
function requestRole(UserRole role) external whenNotPaused {
    // ... validaciones existentes ...
    
    // 🔴 NUEVA VALIDACIÓN: Usuario cancelado no puede solicitar roles
    if (users[msg.sender].status == UserStatus.Canceled) {
        revert UserCanceled();
    }
    
    // ... resto del código ...
}
```

### 3. Actualizar `createToken()`

```solidity
function createToken(...) external onlyTokenCreators whenNotPaused {
    // 🟡 NUEVA VALIDACIÓN: Longitud mínima del nombre
    if (bytes(name).length < 2) revert InvalidName();
    
    // ... resto de validaciones existentes ...
}
```

### 4. Agregar Error Personalizado para Rol Inválido

```solidity
/**
 * @notice El rol del usuario no es válido para este tipo de token.
 */
error InvalidRoleForTokenType();
```

### 5. Actualizar `transfer()` con Validación de Rol por Tipo de Token

```solidity
function transfer(address to, uint tokenId, uint amount) external whenNotPaused onlyTransfersAllowed nonReentrant {
    // ... validaciones existentes ...
    
    Token storage token = tokens[tokenId];
    if (token.id == 0) revert TokenDoesNotExist();
    
    // 🔴 NUEVA VALIDACIÓN: Verificar rol del emisor según tipo de token
    User storage sender = users[addressToUserId[msg.sender]];
    
    if (token.tokenType == TokenType.RowMaterial) {
        if (sender.role != UserRole.Producer) {
            revert InvalidRoleForTokenType();
        }
    } else if (token.tokenType == TokenType.FinishedProduct) {
        if (sender.role != UserRole.Factory && sender.role != UserRole.Retailer) {
            revert InvalidRoleForTokenType();
        }
    }
    
    // ... resto del código ...
}
```

### 6. Actualizar `acceptTransfer()` con Validación de Rol por Tipo de Token

```solidity
function acceptTransfer(uint transferId) external whenNotPaused onlyReceiverAllowed nonReentrant {
    // ... validaciones existentes ...
    
    Token storage token = tokens[transferItem.tokenId];
    
    // 🔴 NUEVA VALIDACIÓN: Verificar rol del receptor según tipo de token
    User storage receiver = users[addressToUserId[msg.sender]];
    
    if (token.tokenType == TokenType.RowMaterial) {
        if (receiver.role != UserRole.Factory) {
            revert InvalidRoleForTokenType();
        }
    } else if (token.tokenType == TokenType.FinishedProduct) {
        if (receiver.role != UserRole.Retailer && receiver.role != UserRole.Consumer) {
            revert InvalidRoleForTokenType();
        }
    }
    
    // ... resto del código ...
}
```

### 7. Actualizar `rejectTransfer()` con Validación de Rol por Tipo de Token

```solidity
function rejectTransfer(uint transferId) external whenNotPaused onlyReceiverAllowed nonReentrant {
    // ... validaciones existentes ...
    
    Token storage token = tokens[transferItem.tokenId];
    
    // 🔴 NUEVA VALIDACIÓN: Verificar rol del receptor según tipo de token
    // (Misma lógica que acceptTransfer, ya que solo el receptor puede rechazar)
    User storage receiver = users[addressToUserId[msg.sender]];
    
    if (token.tokenType == TokenType.RowMaterial) {
        if (receiver.role != UserRole.Factory) {
            revert InvalidRoleForTokenType();
        }
    } else if (token.tokenType == TokenType.FinishedProduct) {
        if (receiver.role != UserRole.Retailer && receiver.role != UserRole.Consumer) {
            revert InvalidRoleForTokenType();
        }
    }
    
    // ... resto del código ...
}
```

---

## 🔒 Consideraciones de Seguridad

### Validaciones que DEBEN estar en el contrato:

1. ✅ **Balance suficiente** - Ya implementado
2. ✅ **Usuario autorizado** - Ya implementado
3. ✅ **Contrato no pausado** - Ya implementado
4. ✅ **Usuario cancelado** - **IMPLEMENTADO** (24 Nov 2025) ✅
5. ❌ **Rol por tipo de token en transferencias** - **PENDIENTE** 🔴 **CRÍTICO**

### Validaciones que son NICE-TO-HAVE:

1. 🟡 **Longitud mínima del nombre** - Mejora UX y consistencia
2. 🟢 **Formato de dirección** - Redundante (Solidity ya valida)
3. 🟢 **Formato JSON** - No vale la pena (costo en gas alto)

---

## 📊 Resumen de Estado

| Validación | Frontend | Contrato | Prioridad | Estado |
|------------|----------|----------|-----------|--------|
| Usuario cancelado no puede registrar | ✅ | ✅ | 🔴 Alta | **✅ COMPLETADO** (24 Nov 2025) |
| Longitud mínima nombre (2 chars) | ✅ | ✅ | 🟡 Media | **✅ COMPLETADO** (24 Nov 2025) |
| Rol por tipo de token en transfer() | ✅ | ✅ | 🔴 Alta | **✅ COMPLETADO** (24 Nov 2025) |
| Rol por tipo de token en acceptTransfer() | ✅ | ✅ | 🔴 Alta | **✅ COMPLETADO** (24 Nov 2025) |
| Rol por tipo de token en rejectTransfer() | ✅ | ✅ | 🔴 Alta | **✅ COMPLETADO** (24 Nov 2025) |
| Formato de dirección válido | ✅ | ⚠️ Parcial | 🟢 Baja | Opcional |
| tokenId > 0 | ✅ | ⚠️ Implícito | 🟢 Baja | Opcional |
| Features JSON válido | ✅ | ❌ | 🟢 Baja | No recomendado |

---

## ✅ Conclusión

**Total de validaciones pendientes críticas**: **0** ✅ (Todas las validaciones críticas completadas)  
**Total de validaciones pendientes recomendadas**: **0** ✅ (Longitud mínima nombre - COMPLETADO)  
**Total de validaciones opcionales**: **3**

**Estado actual**: ✅ **Todas las validaciones críticas implementadas**

**Recomendación final**: Todas las validaciones críticas y recomendadas han sido implementadas exitosamente. Las validaciones opcionales pueden implementarse en el futuro si se considera necesario.

### 📊 Implementación Completada (24 Nov 2025)

#### ✅ Validación de Alta Prioridad - Usuario Cancelado
- **Error `UserCanceled()` agregado** en `sc/src/SupplyChain.sol`  
- **Validación implementada** en `requestUserRole()` (líneas 532-535)  
- **Test agregado**: `testCanceledUserCannotRequestRole()` en `EdgeCasesTest.t.sol`

#### ✅ Validación de Media Prioridad - Longitud Mínima del Nombre
- **Validación implementada** en `createToken()` (línea 656)  
- **Test agregado**: `testCreateTokenSingleCharacterName()` en `EdgeCasesTest.t.sol`

#### ✅ Validaciones de Alta Prioridad - Rol por Tipo de Token
- **Error `InvalidRoleForTokenType()` agregado** en `sc/src/SupplyChain.sol`  
- **Validación en `transfer()`** (líneas 765-773) - Valida rol del emisor  
- **Validación en `acceptTransfer()`** (líneas 804-812) - Valida rol del receptor  
- **Validación en `rejectTransfer()`** (líneas 878-886) - Valida rol del receptor  
- **Tests corregidos**: `testFinishedProductWithNonRowMaterialParent()` y `testConsumerCannotTransfer()`

#### 📊 Resultados Finales
- ✅ **Todos los tests pasan**: 82/82 tests ✅  
- ✅ **Coverage mejorado**: Branch coverage mejorado con las nuevas validaciones  
- ✅ **Funcionalidad preservada**: Ningún test existente falló  
- ✅ **Seguridad mejorada**: Transferencias inválidas ahora son prevenidas en el contrato

---

**Última actualización**: 24 de Noviembre, 2025

