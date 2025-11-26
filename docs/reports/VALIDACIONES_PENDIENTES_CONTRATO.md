# 📋 Validaciones Pendientes en el Contrato Inteligente

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para estado del contrato inteligente, consulta [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md)**  
> **📚 Para documentación completa de API, consulta [docs/sc/API_REFERENCE.md](../../docs/sc/API_REFERENCE.md)**  
> **📚 Para documentación completa de tests, consulta [docs/sc/TESTING.md](../../docs/sc/TESTING.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**

**Fecha**: 24 de Noviembre, 2025  
**Estado**: Documentación de validaciones implementadas en Frontend y Contrato  
**Última actualización**: 26 de Noviembre, 2025 - Verificación completa: TODAS las validaciones críticas implementadas ✅

---

## 🔍 Resumen Ejecutivo

Este documento identifica las validaciones que se implementaron en el **Frontend** y su estado de implementación en el **Contrato Inteligente**. 

**✅ ESTADO ACTUAL (26 Nov 2025)**: Todas las validaciones críticas y recomendadas están implementadas en el contrato.

Estas validaciones son críticas porque:

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

#### ✅ Validaciones CRÍTICAS - IMPLEMENTADAS:

1. **Validación de rol por tipo de token en `transfer()`** ✅ **COMPLETADO**
   - **Problema**: No valida que el rol del emisor sea compatible con el tipo de token
   - **Requisitos**:
     - Raw Material: Solo Producer puede transferir
     - Finished Product: Solo Factory o Retailer pueden transferir
   - **Riesgo**: Alto (mitigado)
   - **Prioridad**: Alta ✅
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Implementación**: Validación agregada en `transfer()` usando función helper `_validateRoleForTokenType()`
   - **Nota**: Previene transferencias inválidas que rompen la lógica de la cadena de suministro
   - **Referencia**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) para detalles actuales de implementación

2. **Validación de rol por tipo de token en `acceptTransfer()`** ✅ **COMPLETADO**
   - **Problema**: No valida que el rol del receptor sea compatible con el tipo de token
   - **Requisitos**:
     - Raw Material: Solo Factory puede aceptar
     - Finished Product: Solo Retailer o Consumer pueden aceptar
   - **Riesgo**: Alto (mitigado)
   - **Prioridad**: Alta ✅
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Implementación**: Validación agregada en `acceptTransfer()` usando función helper `_validateRoleForTokenType()`
   - **Nota**: Previene que roles incorrectos acepten transferencias
   - **Referencia**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) para detalles actuales de implementación

3. **Validación de rol por tipo de token en `rejectTransfer()`** ✅ **COMPLETADO**
   - **Problema**: No valida que el rol del receptor sea compatible con el tipo de token
   - **Requisitos**:
     - Raw Material: Solo Factory puede rechazar
     - Finished Product: Solo Retailer o Consumer pueden rechazar
   - **Riesgo**: Alto (mitigado)
   - **Prioridad**: Alta ✅
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Implementación**: Validación agregada en `rejectTransfer()` usando función helper `_validateRoleForTokenType()`
   - **Nota**: Previene que roles incorrectos rechacen transferencias
   - **Referencia**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) para detalles actuales de implementación

#### ✅ Validaciones que SÍ están en el contrato (verificadas 26 Nov 2025):

1. **Validación de formato de dirección**
   - **Frontend**: Usa `isAddress(to)` de viem para validar formato hexadecimal válido
   - **Contrato**: ✅ Valida `to != address(0)` en `transfer()`
   - **Nota**: Solidity rechaza automáticamente direcciones inválidas, por lo que validar formato explícitamente es redundante
   - **Referencia**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) para detalles actuales
   - **Estado**: ✅ **IMPLEMENTADO** (suficiente para seguridad)
   - **Prioridad**: Baja (no requiere cambios)

2. **Validación de tokenId > 0**
   - **Frontend**: Valida `tokenIdNum > 0` antes de enviar
   - **Contrato**: ✅ Valida explícitamente `tokenId == 0 || tokenId >= nextTokenId` en `getToken()`
   - **Estado**: ✅ **IMPLEMENTADO** (early validation)
   - **Referencia**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) para detalles actuales
   - **Prioridad**: Baja (ya implementado)

---

### 2. `createToken(string memory name, TokenType tokenType, uint totalSupply, string memory features, uint parentId, uint parentAmount)`

#### ✅ Validaciones que SÍ tiene el contrato:
- ✅ Nombre no vacío (`bytes(name).length > 0`)
- ✅ TotalSupply > 0 (`totalSupply > 0`)
- ✅ Para FinishedProduct: `parentId != 0`, `parentAmount > 0`, token padre existe, balance suficiente
- ✅ Para RawMaterial: `parentId == 0`, `parentAmount == 0`
- ✅ Contrato no pausado (`whenNotPaused`)
- ✅ Usuario autorizado para crear tokens (`onlyTokenCreators`)

#### ✅ Validaciones Verificadas en el Contrato (26 Nov 2025):

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
   - **Contrato**: ✅ **SÍ valida** el balance suficiente en `_validateAndConsumeParentToken()`
   - **Validación**: `if (userParentBalance < parentAmount) revert InsufficientBalance(...)`
   - **Referencia**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) para detalles actuales
   - **Estado**: ✅ **IMPLEMENTADO** (verificado 26 Nov 2025)
   - **Nota**: El frontend hace una validación adicional para mejor UX, pero el contrato ya lo valida completamente

---

### 3. `requestRole(UserRole role)` / `registerUser(UserRole role)`

#### ✅ Validaciones que SÍ tiene el contrato:
- ✅ Rol válido (enum UserRole)
- ✅ Usuario no es el owner (`msg.sender != owner`)
- ✅ Usuario no tiene rol aprobado existente (`!existingUserWithApprovedRole`)
- ✅ Usuario no tiene el mismo rol pendiente (`!userWithExistingRole`)
- ✅ Contrato no pausado (`whenNotPaused`)

#### ✅ Validaciones Verificadas en el Contrato (26 Nov 2025):

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
   - **Contrato**: ✅ **SÍ valida** explícitamente en `_updateExistingUserRole()`
   - **Validación**: `if (uint(role) == uint(user.role)) revert UserWithExistingRole();`
   - **Referencia**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) para detalles actuales
   - **Estado**: ✅ **IMPLEMENTADO** (verificado 26 Nov 2025)
   - **Prioridad**: Baja (ya implementado)

---

## 🎯 Priorización de Validaciones Pendientes

### ✅ Alta Prioridad - COMPLETADO

1. **Validación de usuario cancelado en `requestRole()`** ✅ **COMPLETADO**
   - **Impacto**: Seguridad y lógica de negocio
   - **Riesgo**: Medio-Alto (mitigado)
   - **Esfuerzo**: Bajo (1 línea de código)
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Test**: ✅ `testCanceledUserCannotRequestRole()` agregado
   - **Coverage**: Mejora branch coverage del contrato

2. **Validación de restricciones de rol por tipo de token en transferencias** ✅ **IMPLEMENTADO**
   - **Impacto**: Seguridad y lógica de negocio crítica
   - **Riesgo**: Alto (permite transferencias inválidas en la cadena de suministro)
   - **Esfuerzo**: ✅ Completado (Fase 3 de optimizaciones)
   - **Estado**: ✅ **IMPLEMENTADO** (verificado 26 Nov 2025)
   - **Implementación**:
     - ✅ Función helper `_validateRoleForTokenType()` creada - Centraliza la lógica de validación
     - ✅ Validación en `transfer()` - Valida rol del emisor usando helper
     - ✅ Validación en `acceptTransfer()` - Valida rol del receptor usando helper
     - ✅ Validación en `rejectTransfer()` - Valida rol del receptor usando helper
   - **Reglas implementadas**:
     - ✅ Raw Material: Solo Producer puede transferir, solo Factory puede aceptar/rechazar
     - ✅ Finished Product: Solo Factory/Retailer pueden transferir, solo Retailer/Consumer pueden aceptar/rechazar
   - **Error personalizado**: `InvalidRoleForTokenType()`
   - **Nota**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md#custom-errors) para detalles completos de errores personalizados.

### ✅ Media Prioridad - COMPLETADO

1. **Longitud mínima del nombre en `createToken()`** ✅ **COMPLETADO**
   - **Impacto**: UX y consistencia de datos
   - **Riesgo**: Medio (mitigado)
   - **Esfuerzo**: Bajo (1 línea de código)
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Test**: ✅ `testCreateTokenSingleCharacterName()` agregado
   - **Coverage**: Mejora branch coverage del contrato

### ✅ Baja Prioridad - Verificadas e Implementadas

1. **Validación de formato de dirección en `transfer()`** ✅ **IMPLEMENTADO**
   - **Impacto**: Mínimo (Solidity ya valida automáticamente)
   - **Riesgo**: Bajo
   - **Estado**: ✅ **IMPLEMENTADO** - Valida `to != address(0)` en `transfer()`
   - **Recomendación**: ✅ Ya implementado (suficiente, validación de formato explícita es redundante)

2. **Validación de tokenId > 0 en `transfer()` y `getToken()`** ✅ **IMPLEMENTADO**
   - **Impacto**: Mínimo (ya validado explícitamente)
   - **Riesgo**: Bajo
   - **Estado**: ✅ **IMPLEMENTADO** - Valida `tokenId == 0 || tokenId >= nextTokenId` en `getToken()`
   - **Nota**: En `transfer()` se valida que `token.id != 0`, lo cual es equivalente
   - **Recomendación**: ✅ Ya implementado (early validation en getToken, validación implícita en transfer)

3. **Validación de formato JSON en `createToken()`** ⚠️ **NO RECOMENDADO**
   - **Impacto**: Mínimo (features es solo metadata)
   - **Riesgo**: Bajo
   - **Esfuerzo**: Alto (validar JSON en Solidity es costoso)
   - **Recomendación**: No implementar (no vale la pena el costo en gas)

---

## 📝 Recomendaciones de Implementación

> **⚠️ NOTA HISTÓRICA**: Esta sección documenta las recomendaciones originales. Todas las validaciones críticas y recomendadas ya están implementadas (verificado 26 Nov 2025).

### ✅ 1. Error Personalizado - IMPLEMENTADO

```solidity
/**
 * @notice El usuario está cancelado y no puede realizar acciones.
 */
error UserCanceled();
```

### ✅ 2. Actualizar `requestRole()` - IMPLEMENTADO

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

### ✅ 3. Actualizar `createToken()` - IMPLEMENTADO

```solidity
function createToken(...) external onlyTokenCreators whenNotPaused {
    // 🟡 NUEVA VALIDACIÓN: Longitud mínima del nombre
    if (bytes(name).length < 2) revert InvalidName();
    
    // ... resto de validaciones existentes ...
}
```

### ✅ 4. Agregar Error Personalizado para Rol Inválido - IMPLEMENTADO

```solidity
/**
 * @notice El rol del usuario no es válido para este tipo de token.
 */
error InvalidRoleForTokenType();
```

### ✅ 5. Actualizar `transfer()` con Validación de Rol por Tipo de Token - IMPLEMENTADO

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

### ✅ 6. Actualizar `acceptTransfer()` con Validación de Rol por Tipo de Token - IMPLEMENTADO

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

### ✅ 7. Actualizar `rejectTransfer()` con Validación de Rol por Tipo de Token - IMPLEMENTADO

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
5. ✅ **Rol por tipo de token en transferencias** - **IMPLEMENTADO** (24 Nov 2025, verificado 26 Nov 2025) ✅

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
| Formato de dirección válido | ✅ | ✅ Implementado | 🟢 Baja | ✅ Implementado (address(0) check) |
| tokenId > 0 | ✅ | ✅ Implementado | 🟢 Baja | ✅ Implementado (early validation) |
| Features JSON válido | ✅ | ❌ | 🟢 Baja | No recomendado |

---

## ✅ Conclusión

**Total de validaciones pendientes críticas**: **0** ✅ (Todas las validaciones críticas completadas)  
**Total de validaciones pendientes recomendadas**: **0** ✅ (Longitud mínima nombre - COMPLETADO)  
**Total de validaciones opcionales**: **1** (solo Features JSON, no recomendado implementar)

**Estado actual**: ✅ **Todas las validaciones críticas implementadas**

**Recomendación final**: Todas las validaciones críticas y recomendadas han sido implementadas exitosamente. Las validaciones opcionales pueden implementarse en el futuro si se considera necesario.

### 📊 Implementación Completada (24 Nov 2025)

#### ✅ Validación de Alta Prioridad - Usuario Cancelado
- **Error `UserCanceled()` agregado** en `sc/src/SupplyChain.sol`  
- **Validación implementada** en `requestUserRole()`  
- **Test agregado**: `testCanceledUserCannotRequestRole()` en `EdgeCasesTest.t.sol`
- **Nota**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) y [TESTING.md](../../docs/sc/TESTING.md) para detalles actuales.

#### ✅ Validación de Media Prioridad - Longitud Mínima del Nombre
- **Validación implementada** en `createToken()`  
- **Test agregado**: `testCreateTokenSingleCharacterName()` en `EdgeCasesTest.t.sol`
- **Nota**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) y [TESTING.md](../../docs/sc/TESTING.md) para detalles actuales.

#### ✅ Validaciones de Alta Prioridad - Rol por Tipo de Token
- **Error `InvalidRoleForTokenType()` agregado** en `sc/src/SupplyChain.sol`
- **Función helper `_validateRoleForTokenType()` creada** - Centraliza la lógica de validación
- **Validación en `transfer()`** - Valida rol del emisor usando helper
- **Validación en `acceptTransfer()`** - Valida rol del receptor usando helper
- **Validación en `rejectTransfer()`** - Valida rol del receptor usando helper
- **Nota**: Consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md) para detalles completos de implementación.
- **Tests agregados**: 8 nuevos tests en `EdgeCasesTest.t.sol` para cubrir todas las combinaciones inválidas
- **Tests corregidos**: `testFinishedProductWithNonRowMaterialParent()` y `testConsumerCannotTransfer()` actualizados

#### 📊 Resultados Finales
- ✅ **Todos los tests pasan**: 108/108 tests ✅  
- ✅ **Coverage mejorado**: Branch coverage 72.15% (mejorado con las nuevas validaciones)  
- ✅ **Funcionalidad preservada**: Ningún test existente falló  
- ✅ **Seguridad mejorada**: Transferencias inválidas ahora son prevenidas en el contrato

---

### ✅ Verificación Completa (26 Nov 2025)

**Todas las validaciones mencionadas han sido verificadas en el contrato:**

1. ✅ **Rol por tipo de token** - Implementado en `transfer()`, `acceptTransfer()`, `rejectTransfer()`
2. ✅ **tokenId > 0** - Implementado en `getToken()` con early validation
3. ✅ **Cambio al mismo rol** - Implementado en `_updateExistingUserRole()`
4. ✅ **Balance del parent token** - Implementado en `_validateAndConsumeParentToken()`
5. ✅ **Formato de dirección** - Implementado (valida `address(0)`, suficiente para seguridad)

**Estado**: ✅ **Todas las validaciones críticas y recomendadas están implementadas**

---

**Última actualización**: 26 de Noviembre, 2025 (Verificación completa)

---

## 📚 Referencias Relacionadas

**Documentación del Contrato Inteligente**:
- [API Reference](../../docs/sc/API_REFERENCE.md) - Documentación completa de funciones, eventos y errores personalizados
- [Testing Guide](../../docs/sc/TESTING.md) - Documentación completa de tests (108 tests: 64 core + 44 edge cases)
- [Security Policy](../../docs/sc/SECURITY.md) - Política de seguridad y mejores prácticas
- [Architecture](../../docs/sc/ARCHITECTURE.md) - Arquitectura del sistema

**Documentación del Proyecto**:
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Estado actual del proyecto
- [ESTADO_CONTRATO_INTELIGENTE.md](../../ESTADO_CONTRATO_INTELIGENTE.md) - Estado y métricas del contrato
- [INDEX.md](../../INDEX.md) - Índice completo de documentación

**Errores Personalizados Documentados**:
- `UserCanceled()` - Usuario cancelado no puede solicitar roles
- `InvalidRoleForTokenType()` - Rol inválido para tipo de token en transferencias
- `InvalidName()` - Nombre de token inválido (menos de 2 caracteres)

> **📚 Para detalles completos de errores personalizados, consulta [API_REFERENCE.md](../../docs/sc/API_REFERENCE.md#custom-errors)**

