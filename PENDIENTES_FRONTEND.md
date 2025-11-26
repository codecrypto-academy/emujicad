# 🔴 Errores Pendientes - Frontend

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](./PROJECT_STATUS.md)**  
> **📚 Para documentación completa de hooks, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)**  
> **📚 Para análisis de ownership transfer hooks, consulta [VALIDACION_HOOKS_OWNERSHIP.md](./VALIDACION_HOOKS_OWNERSHIP.md)**

**Fecha de creación**: Noviembre 2025  
**Última actualización**: 26 de Noviembre, 2025

---

## ⚠️ ERROR DE TYPESCRIPT PENDIENTE

### **Archivo**: `web/src/app/dashboard/page.tsx`

### **Ubicación**: Líneas ~812-815 y ~819-822 (pueden haber cambiado)

> **⚠️ Nota**: Las líneas exactas pueden haber cambiado debido a actualizaciones del código. Verificar en el archivo actual.

### **Error**:
```
Type error: 'userInfo' is possibly 'null'.
```

### **Código problemático** (referencia):
```typescript
// Aproximadamente líneas 812-815
{userInfo && 
 userInfo.status !== undefined &&
 (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
 Number(userInfo.status) === UserStatus.Approved
  ? 'Create your first token to start tracking products'
  : 'No tokens available yet'}

// Aproximadamente líneas 819-822
{userInfo && 
 userInfo.status !== undefined &&
 (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
 Number(userInfo.status) === UserStatus.Approved && (
```

### **Causa**:
TypeScript no puede inferir que `userInfo` no es `null` después de la verificación `userInfo &&` cuando se usa en expresiones complejas con múltiples operadores `&&`.

### **Solución propuesta**:
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

### **Estado**: 
- ❌ **PENDIENTE** - No bloquea funcionalidad pero impide el build de producción
- ⚠️ **PRIORIDAD**: Media (el código funciona en desarrollo, pero el build falla)

### **Notas**:
- Este error **NO** fue causado por `usePendingOwner.ts` ni `useOwnershipTransfer.ts`
- El error existía antes, solo se hizo visible al ejecutar el build
- Los hooks de ownership transfer están completamente funcionales y no causan problemas
- Para verificar si el error sigue presente, ejecutar: `cd web && npm run build`

> **📚 Ver documentación de calidad**: [docs/reports/FRONTEND_PAGES_QUALITY_REVIEW.md](./docs/reports/FRONTEND_PAGES_QUALITY_REVIEW.md)

---

## ✅ COMPLETADO

### **Hook `usePendingOwner.ts`**
- ✅ Creado en `web/src/hooks/usePendingOwner.ts`
- ✅ Compatible con el contrato inteligente
- ✅ Sin errores de linting
- ✅ Listo para usar
- ✅ Documentado en [docs/fe/HOOKS.md](./docs/fe/HOOKS.md#21-usependingownerenabled-boolean)

> **📚 Ver documentación completa**: [docs/fe/HOOKS.md](./docs/fe/HOOKS.md) | [VALIDACION_HOOKS_OWNERSHIP.md](./VALIDACION_HOOKS_OWNERSHIP.md)

### **Hook `useOwnershipTransfer.ts`**
- ✅ Refactorizado y creado en `web/src/hooks/useOwnershipTransfer.ts`
- ✅ Estados separados para cada función (3 useWriteContract + 3 useWaitForTransactionReceipt)
- ✅ Compatible con el contrato inteligente
- ✅ Sin errores de linting
- ✅ Documentación completa
- ✅ Listo para usar
- ✅ Documentado en [docs/fe/HOOKS.md](./docs/fe/HOOKS.md#22-useownershiptransfer)

> **📚 Ver documentación completa**: [docs/fe/HOOKS.md](./docs/fe/HOOKS.md) | [VALIDACION_HOOKS_OWNERSHIP.md](./VALIDACION_HOOKS_OWNERSHIP.md)

**Mejoras implementadas**:
- ✅ Cada función tiene su propio estado independiente
- ✅ No hay conflictos entre operaciones simultáneas
- ✅ Feedback específico por operación (isPendingInitiate, isPendingAccept, isPendingReject)
- ✅ Manejo de errores individual por función

### **Componente `OwnershipTransfer.tsx`**
- ✅ Implementado en `web/src/components/admin/OwnershipTransfer.tsx`
- ✅ UI completa para gestionar ownership transfer
- ✅ Integrado con hooks `usePendingOwner` y `useOwnershipTransfer`
- ✅ Listo para usar

> **📚 Ver documentación completa**: [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md) | [VALIDACION_HOOKS_OWNERSHIP.md](./VALIDACION_HOOKS_OWNERSHIP.md)

---

**Próximos pasos**:
1. ✅ ~~Probar ambos hooks en el frontend~~ - COMPLETADO
2. ⚠️ Corregir el error de TypeScript en `dashboard/page.tsx` - PENDIENTE
3. ✅ ~~Implementar componente `OwnershipTransfer` en el frontend~~ - COMPLETADO

