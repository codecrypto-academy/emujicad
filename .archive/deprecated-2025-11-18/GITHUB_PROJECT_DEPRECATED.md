# ⚠️ ARCHIVO DEPRECADO

Este archivo ha sido **deprecado** el 18 de Noviembre de 2025.

## Razón de Deprecación

El contenido de `GITHUB_PROJECT.md` era **redundante** con la documentación oficial ubicada en:
- **`sc/docs/README.md`** - Landing page principal del proyecto
- **`sc/README.md`** - Quick start en raíz del proyecto smart contract

## Problemas que tenía este archivo

1. ❌ **Información desactualizada**: Mencionaba "96 tests" cuando el proyecto real tiene **73 tests**
2. ❌ **Ubicación incorrecta**: Estaba en `/PFM/emujicad/` en lugar de `/PFM/emujicad/sc/`
3. ❌ **Redundancia completa**: Todo su contenido ya existía (actualizado) en `docs/README.md`
4. ❌ **Métricas de coverage antiguas**: 78.22% vs 83.33% actual

## Dónde encontrar la información correcta

### 📚 Documentación Principal
- **Landing Page**: `sc/docs/README.md`
- **Quick Start**: `sc/README.md`  
- **Documentación Técnica**: `sc/docs/` (21 archivos organizados)

### ✅ Datos Actualizados (Noviembre 2025)
- **Tests Totales**: 73 (55 core + 18 edge cases)
- **Coverage**: Lines 83.33%, Branches 61.22%
- **Scripts**: SupplyChainDeploy.s.sol, SupplyChainInteractions.s.sol
- **Estado**: ✅ Production Ready con documentación 100% exacta

## Si necesitas este contenido

El archivo original se preserva como `GITHUB_PROJECT.md.deprecated` para referencia histórica.

**Recomendación**: Usar siempre `sc/docs/README.md` como fuente de verdad.

---

**Deprecado por**: Validación de Documentación y Eliminación de Redundancias  
**Fecha**: 2025-11-18  
**Alternativa**: `sc/docs/README.md` + `sc/README.md`
