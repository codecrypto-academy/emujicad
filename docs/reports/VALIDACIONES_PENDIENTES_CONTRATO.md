# 📋 Validaciones Pendientes en el Contrato Inteligente

**Fecha**: 23 de Noviembre, 2025  
**Estado**: Documentación de validaciones implementadas en Frontend pero NO en el Contrato

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

1. **Longitud mínima del nombre**
   - **Frontend**: Valida `name.trim().length >= 2`
   - **Contrato**: Solo valida que no esté vacío
   - **Riesgo**: Medio (permite nombres de 1 carácter, puede causar problemas de UX)
   - **Prioridad**: Media
   - **Recomendación**: Agregar `require(bytes(name).length >= 2, "Name must be at least 2 characters")`

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

1. **Validación de usuario cancelado**
   - **Frontend**: Bloquea completamente el registro si `userStatus == Canceled`
   - **Contrato**: No valida explícitamente si el usuario está cancelado
   - **Riesgo**: Medio-Alto
   - **Prioridad**: Alta
   - **Recomendación**: Agregar validación:
     ```solidity
     if (users[msg.sender].status == UserStatus.Canceled) {
         revert UserCanceled();
     }
     ```
   - **Nota**: Los usuarios cancelados NO deberían poder solicitar nuevos roles. Solo el admin puede cambiar su estado.

2. **Validación de cambio de rol al mismo rol**
   - **Frontend**: Valida que `selectedRole !== currentRoleName` antes de enviar
   - **Contrato**: Valida `!userWithExistingRole`, pero esto solo verifica si el rol está pendiente/aprobado
   - **Riesgo**: Bajo (el contrato ya previene roles duplicados)
   - **Prioridad**: Baja

---

## 🎯 Priorización de Validaciones Pendientes

### 🔴 Alta Prioridad

1. **Validación de usuario cancelado en `requestRole()`**
   - **Impacto**: Seguridad y lógica de negocio
   - **Riesgo**: Medio-Alto
   - **Esfuerzo**: Bajo (1 línea de código)
   - **Recomendación**: Implementar inmediatamente

### 🟡 Media Prioridad

2. **Longitud mínima del nombre en `createToken()`**
   - **Impacto**: UX y consistencia de datos
   - **Riesgo**: Medio
   - **Esfuerzo**: Bajo (1 línea de código)
   - **Recomendación**: Implementar en próxima iteración

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

---

## 🔒 Consideraciones de Seguridad

### Validaciones que DEBEN estar en el contrato:

1. ✅ **Balance suficiente** - Ya implementado
2. ✅ **Usuario autorizado** - Ya implementado
3. ✅ **Contrato no pausado** - Ya implementado
4. ❌ **Usuario cancelado** - **FALTA** (Alta prioridad)

### Validaciones que son NICE-TO-HAVE:

1. 🟡 **Longitud mínima del nombre** - Mejora UX y consistencia
2. 🟢 **Formato de dirección** - Redundante (Solidity ya valida)
3. 🟢 **Formato JSON** - No vale la pena (costo en gas alto)

---

## 📊 Resumen de Estado

| Validación | Frontend | Contrato | Prioridad | Estado |
|------------|----------|----------|-----------|--------|
| Usuario cancelado no puede registrar | ✅ | ❌ | 🔴 Alta | **PENDIENTE** |
| Longitud mínima nombre (2 chars) | ✅ | ❌ | 🟡 Media | **PENDIENTE** |
| Formato de dirección válido | ✅ | ⚠️ Parcial | 🟢 Baja | Opcional |
| tokenId > 0 | ✅ | ⚠️ Implícito | 🟢 Baja | Opcional |
| Features JSON válido | ✅ | ❌ | 🟢 Baja | No recomendado |

---

## ✅ Conclusión

**Total de validaciones pendientes críticas**: **1** (Usuario cancelado)  
**Total de validaciones pendientes recomendadas**: **1** (Longitud mínima nombre)  
**Total de validaciones opcionales**: **3**

**Recomendación final**: Implementar la validación de usuario cancelado inmediatamente, y la validación de longitud mínima del nombre en la próxima iteración.

---

**Última actualización**: 23 de Noviembre, 2025

