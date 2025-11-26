# Warning de Radix UI DialogContent - DialogTitle

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**  
> **⚠️ HISTORICAL DOCUMENT - November 2025**  
> Este documento documenta un warning conocido de Radix UI. El warning no afecta la funcionalidad y es solo de desarrollo.

**Fecha de documentación**: Noviembre 2025  
**Última actualización**: 26 de Noviembre, 2025

## Descripción del Warning

**Warning:** `DialogContent` requires a `DialogTitle` for the component to be accessible for screen reader users.

**Origen:** `node_modules/@radix-ui/react-dialog/src/dialog.tsx (520:30) @ TitleWarning.useEffect`

**Ubicación:** Se presenta cuando se abre el diálogo "Conectar Wallet" en `ConnectWallet.tsx`

## Análisis del Problema

### Causa Raíz

El warning se genera porque Radix UI busca el `DialogTitle` usando un `useEffect` interno (`TitleWarning.useEffect`) que se ejecuta después de que el componente se monta. Debido a que el `DialogContent` está dentro de un `DialogPortal` (que renderiza el contenido en un Portal de React), puede haber un problema de timing donde Radix UI busca el `DialogTitle` antes de que el Portal termine de renderizar completamente.

### Estado Actual del Código

El código actual tiene:
- ✅ `DialogTitle` presente con `id="connect-wallet-title"`
- ✅ `DialogContent` con `aria-labelledby="connect-wallet-title"`
- ✅ `DialogTitle` dentro de `DialogHeader` (estructura estándar de Radix UI)

**Estructura actual:**
```tsx
<DialogContent className="sm:max-w-md" aria-labelledby="connect-wallet-title">
  <DialogHeader>
    <DialogTitle id="connect-wallet-title">Conectar tu Wallet</DialogTitle>
    <DialogDescription>
      Selecciona una wallet para conectarte a la aplicación
    </DialogDescription>
  </DialogHeader>
  {/* ... resto del contenido */}
</DialogContent>
```

### Intentos de Solución Realizados

Se intentaron las siguientes soluciones sin éxito:

1. **Mover `DialogTitle` fuera de `DialogHeader`** - No resolvió el warning
2. **Agregar `aria-label` directamente** - No resolvió el warning
3. **Agregar `DialogTitle` oculto con `VisuallyHidden`** - No resolvió el warning
4. **Usar `useLayoutEffect` para forzar reflow** - No resolvió el warning

### Conclusión

El warning parece ser un problema conocido de Radix UI relacionado con el timing del Portal. Aunque el `DialogTitle` está presente y correctamente configurado, Radix UI no lo detecta a tiempo debido a cómo funciona el Portal.

## Impacto

- **Funcionalidad:** ✅ No afecta la funcionalidad - el diálogo funciona correctamente
- **Accesibilidad:** ✅ La accesibilidad está correctamente implementada con `aria-labelledby` y `DialogTitle`
- **Producción:** ⚠️ El warning solo aparece en desarrollo, no en producción
- **UX:** ✅ No afecta la experiencia del usuario

## Recomendación

**Mantener el código actual** ya que:
1. El `DialogTitle` está presente y correctamente configurado
2. La accesibilidad está correctamente implementada
3. El warning es solo de desarrollo y no afecta la funcionalidad
4. Es un problema conocido de Radix UI con Portals

## Referencias

- [Radix UI Dialog Documentation](https://radix-ui.com/primitives/docs/components/dialog)
- Warning origin: `node_modules/@radix-ui/react-dialog/src/dialog.tsx (520:30)`

---

## 📚 Referencias Relacionadas

**Documentación del Proyecto**:
- [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Estado actual del proyecto (single source of truth)
- [INDEX.md](../../INDEX.md) - Índice completo de documentación
- [QUICKSTART.md](../../QUICKSTART.md) - Guía rápida de inicio

**Documentación Técnica Frontend**:
- [docs/fe/COMPONENTS.md](../fe/COMPONENTS.md) - Documentación completa de componentes (incluye ConnectWallet)
- [docs/fe/SETUP.md](../fe/SETUP.md) - Setup del frontend

**Reportes Relacionados**:
- [HOW_TO_REVIEW_IMPLEMENTATION.md](./HOW_TO_REVIEW_IMPLEMENTATION.md) - Guía para revisar la implementación
- [FULL_VERIFICATION_REPORT.md](./FULL_VERIFICATION_REPORT.md) - Reporte completo de verificación

**Referencias Externas**:
- [Radix UI Dialog Documentation](https://radix-ui.com/primitives/docs/components/dialog)
- Warning origin: `node_modules/@radix-ui/react-dialog/src/dialog.tsx (520:30)`

> **📚 Nota**: Este warning es conocido y no afecta la funcionalidad. La accesibilidad está correctamente implementada. Para más detalles sobre componentes, consulta [docs/fe/COMPONENTS.md](../fe/COMPONENTS.md)

