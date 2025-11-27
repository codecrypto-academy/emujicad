# 📋 TODO - Supply Chain Tracker

> **📋 Para el estado más actualizado del proyecto, consulta [STATUS.md](./STATUS.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](./INDEX.md)**

**Última actualización**: 27 de Noviembre, 2025  
**Objetivo**: Lista consolidada de tareas pendientes, errores y validaciones

---

## ⚠️ ERRORES PENDIENTES

### Frontend

#### Error de TypeScript en Dashboard
**Archivo**: `web/src/app/dashboard/page.tsx`  
**Ubicación**: Líneas ~812-815 y ~819-822 (pueden haber cambiado)

**Error**:
```
Type error: 'userInfo' is possibly 'null'.
```

**Causa**:
TypeScript no puede inferir que `userInfo` no es `null` después de la verificación `userInfo &&` cuando se usa en expresiones complejas con múltiples operadores `&&`.

**Solución propuesta**:
1. **Opción 1**: Usar optional chaining en todas las referencias:
   ```typescript
   {userInfo && 
    userInfo.status !== undefined &&
    (Number(userInfo?.role) === UserRole.Producer || Number(userInfo?.role) === UserRole.Factory) &&
    Number(userInfo?.status) === UserStatus.Approved
     ? 'Create your first token to start tracking products'
     : 'No tokens available yet'}
   ```

2. **Opción 2**: Extraer la verificación a una variable:
   ```typescript
   const canCreateToken = userInfo && 
     userInfo.status !== undefined &&
     (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
     Number(userInfo.status) === UserStatus.Approved
   
   {canCreateToken
     ? 'Create your first token to start tracking products'
     : 'No tokens available yet'}
   ```

3. **Opción 3**: Usar una función helper:
   ```typescript
   const canCreateToken = (userInfo: UserInfo | null): boolean => {
     if (!userInfo || userInfo.status === undefined) return false
     const role = Number(userInfo.role)
     return (role === UserRole.Producer || role === UserRole.Factory) &&
            Number(userInfo.status) === UserStatus.Approved
   }
   ```

**Estado**: 
- ❌ **PENDIENTE** - No bloquea funcionalidad pero impide el build de producción
- ⚠️ **PRIORIDAD**: Media (el código funciona en desarrollo, pero el build falla)

**Notas**:
- Este error **NO** fue causado por `usePendingOwner.ts` ni `useOwnershipTransfer.ts`
- El error existía antes, solo se hizo visible al ejecutar el build
- Los hooks de ownership transfer están completamente funcionales y no causan problemas
- Para verificar si el error sigue presente, ejecutar: `cd web && npm run build`

---

## ✅ VALIDACIONES COMPLETADAS

### Smart Contract

Todas las validaciones críticas y recomendadas están implementadas en el contrato:

#### ✅ Validaciones de Alta Prioridad - COMPLETADAS
1. **Validación de usuario cancelado en `requestRole()`** ✅ **COMPLETADO**
   - **Impacto**: Seguridad y lógica de negocio
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Test**: ✅ `testCanceledUserCannotRequestRole()` agregado

2. **Validación de restricciones de rol por tipo de token en transferencias** ✅ **IMPLEMENTADO**
   - **Impacto**: Seguridad y lógica de negocio crítica
   - **Estado**: ✅ **IMPLEMENTADO** (verificado 26 Nov 2025)
   - **Implementación**:
     - ✅ Función helper `_validateRoleForTokenType()` creada
     - ✅ Validación en `transfer()` - Valida rol del emisor
     - ✅ Validación en `acceptTransfer()` - Valida rol del receptor
     - ✅ Validación en `rejectTransfer()` - Valida rol del receptor

#### ✅ Validaciones de Media Prioridad - COMPLETADAS
1. **Longitud mínima del nombre en `createToken()`** ✅ **COMPLETADO**
   - **Impacto**: UX y consistencia de datos
   - **Estado**: ✅ **IMPLEMENTADO** (24 Nov 2025)
   - **Test**: ✅ `testCreateTokenSingleCharacterName()` agregado

#### ✅ Validaciones Verificadas e Implementadas
1. **Validación de formato de dirección en `transfer()`** ✅ **IMPLEMENTADO**
   - **Estado**: ✅ Valida `to != address(0)` en `transfer()`

2. **Validación de tokenId > 0 en `transfer()` y `getToken()`** ✅ **IMPLEMENTADO**
   - **Estado**: ✅ Valida `tokenId == 0 || tokenId >= nextTokenId` en `getToken()`

3. **Validación de balance del parent token antes de crear FinishedProduct** ✅ **IMPLEMENTADO**
   - **Estado**: ✅ Valida balance suficiente en `_validateAndConsumeParentToken()`

---

## 🚨 TAREAS PENDIENTES

### Prioridad Alta

#### Video Demo (Falta +1.5 puntos)
**Tiempo estimado**: 3-4 horas  
**Impacto**: +1.5 puntos académicos

**Tareas**:
- [ ] Script del video (5 minutos)
- [ ] Grabación con OBS/screen recorder
- [ ] Edición básica
- [ ] Upload a YouTube/Vimeo
- [ ] Agregar link al README.md

**Script del video (5 minutos)**:
1. [ ] Introducción (30s) - Proyecto, tecnologías
2. [ ] Smart Contract (1m) - Código, tests, coverage
3. [ ] Demo Frontend (2.5m):
   - Conectar MetaMask
   - Solicitar rol
   - Dashboard y perfil
   - Crear token
   - Hacer transferencia
   - Aprobar como admin
   - Sistema de pausabilidad
4. [ ] Arquitectura (1m) - Documentación, diagramas
5. [ ] Cierre (30s) - GitHub, conclusiones

---

### Prioridad Media

#### Mejoras Opcionales del Frontend
- [ ] Tests frontend (Vitest + Playwright) - Parcialmente implementado
- [ ] Testnet deployment (opcional)
- [ ] Responsive design mobile (parcialmente implementado)
- [ ] Loading states y error handling mejorados (parcialmente implementado)

#### Mejoras Opcionales del Smart Contract
- [ ] Aumentar cobertura de branches (actualmente 72.15%)
- [ ] Optimización de gas adicional (si es necesario)
- [ ] Documentación NatSpec expandida

---

### Prioridad Baja

#### Features Futuras
- 🔮 **Transferencias por Lote**: `transferBatch` para optimización
- 🔮 **Función `burn`**: Burn de tokens con permisos especiales
- 🔮 **Modularización Avanzada**: División en contratos especializados
- 🔮 **Integración Web3**: IPFS para metadatos, Oracle connectivity

---

## ✅ COMPLETADO RECIENTEMENTE

### Frontend
- ✅ Hook `usePendingOwner.ts` - COMPLETADO
- ✅ Hook `useOwnershipTransfer.ts` - COMPLETADO
- ✅ Componente `OwnershipTransfer.tsx` - COMPLETADO
- ✅ Todas las 9 páginas esenciales (100%)
- ✅ 24 hooks personalizados (14 archivos)
- ✅ 26 componentes (11 Shadcn + 15 personalizados)

### Smart Contract
- ✅ 108 tests (64 core + 44 edge cases) - 100% passing
- ✅ Coverage: 85.60% lines, 72.15% branches, 82.67% statements, 80.95% functions
- ✅ 5 validaciones críticas implementadas (100%)
- ✅ Sistema de pausabilidad completo
- ✅ Ownership transfer implementado

---

## 📊 Resumen de Estado

| Categoría | Pendiente | Completado | Estado |
|-----------|-----------|------------|--------|
| **Errores Frontend** | 1 | 0 | ⚠️ Media prioridad |
| **Validaciones SC** | 0 | 5 | ✅ 100% |
| **Tareas Críticas** | 1 (Video) | 0 | 🚨 Alta prioridad |
| **Mejoras Opcionales** | 4 | 0 | 🟡 Media prioridad |

---

**Última actualización**: 27 de Noviembre, 2025  
**Próximo paso**: Video Demo (Día 9) - +1.5 puntos

> **📚 Para detalles completos, consulta [STATUS.md](./STATUS.md) y [CHANGELOG.md](./CHANGELOG.md)**

