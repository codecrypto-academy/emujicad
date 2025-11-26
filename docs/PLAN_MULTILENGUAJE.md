# 🌍 Plan de Implementación: Multilenguaje y Documentación

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**  
> **📚 Para índice completo de documentación, consulta [INDEX.md](../../INDEX.md)**

**Fecha**: 26 de Noviembre, 2025  
**Última actualización**: 26 de Noviembre, 2025  
**Estado**: ⏳ En Planificación (Futuro)

## 📋 Objetivos

1. **Reorganizar Documentación**: Renombrar archivos `.md` a `.es.md` (español) o `.en.md` (inglés)
2. **Traducir Comentarios**: Convertir todos los comentarios en código de español a inglés
3. **Implementar i18n**: Sistema de internacionalización para la aplicación web

---

## 📁 Fase 1: Reorganización de Documentación

> **📚 Nota**: Esta fase es opcional y futura. Los archivos actuales están funcionando correctamente sin necesidad de renombrarlos.

### Archivos en Español (→ `.es.md`)

> **📚 Nota**: Esta lista incluye los archivos principales en español. Algunos archivos pueden haber sido actualizados o reorganizados desde la creación de este plan.

**Archivos principales en raíz**:
- `CUENTAS_ANVIL_10_14.md` → `CUENTAS_ANVIL_10_14.es.md`
- `ESTADO_CONTRATO_INTELIGENTE.md` → `ESTADO_CONTRATO_INTELIGENTE.es.md`
- `VALIDACION_HOOKS_OWNERSHIP.md` → `VALIDACION_HOOKS_OWNERSHIP.es.md`
- `VALIDACION_CONTRATO_FRONTEND.md` → `VALIDACION_CONTRATO_FRONTEND.es.md`
- `PENDIENTES_FRONTEND.md` → `PENDIENTES_FRONTEND.es.md`
- `INDEX.md` → `INDEX.es.md`
- `NAVEGACION_GUIA.md` → `NAVEGACION_GUIA.es.md`
- `PAGES_DETAILS.md` → `PAGES_DETAILS.es.md`

**Archivos en docs/reports/**:
- `docs/reports/PROXIMOS_PASOS.md` → `PROXIMOS_PASOS.es.md`
- `docs/reports/PATRON_PROXY_ANALISIS.md` → `PATRON_PROXY_ANALISIS.es.md`
- `docs/reports/VALIDACIONES_PENDIENTES_CONTRATO.md` → `VALIDACIONES_PENDIENTES_CONTRATO.es.md`
- `docs/reports/CONSOLIDACION_DOCUMENTACION.md` → `CONSOLIDACION_DOCUMENTACION.es.md`
- `docs/reports/PROYECTO_EVALUACION_COMPLETA.md` → `PROYECTO_EVALUACION_COMPLETA.es.md`
- `docs/reports/PLAN_IMPLEMENTACION_OPTIMIZACIONES.md` → `PLAN_IMPLEMENTACION_OPTIMIZACIONES.es.md`
- `docs/reports/RECOMENDACIONES_EXTRAS.md` → `RECOMENDACIONES_EXTRAS.es.md`
- `docs/reports/RECOMENDACIONES_OPTIMIZACION_CONTRATO.md` → `RECOMENDACIONES_OPTIMIZACION_CONTRATO.es.md`

**Archivos en sc/script/**:
- `sc/script/README_SCRIPTS.md` → `README_SCRIPTS.es.md`

### Archivos en Inglés (→ `.en.md`)

> **📚 Nota**: Esta lista incluye los archivos principales en inglés. Algunos archivos pueden estar ya en inglés o necesitar traducción.

**Archivos principales en raíz**:
- `README.md` → Mantener como principal (estándar de la industria) o crear `README.en.md`
- `QUICKSTART.md` → `QUICKSTART.en.md`
- `PROJECT_STATUS.md` → `PROJECT_STATUS.en.md`

**Archivos en subdirectorios**:
- `web/README.md` → `web/README.en.md`
- `sc/README.md` → `sc/README.en.md`

**Archivos en docs/reports/**:
- `docs/reports/PERFORMANCE_OPTIMIZATION.md` → `PERFORMANCE_OPTIMIZATION.en.md`
- `docs/reports/ACCESSIBILITY_IMPLEMENTATION.md` → `ACCESSIBILITY_IMPLEMENTATION.en.md`
- `docs/reports/TESTING_REPORT.md` → `TESTING_REPORT.en.md`
- `docs/reports/ACADEMIC_ASSESSMENT.md` → `ACADEMIC_ASSESSMENT.en.md`

**Archivos en docs/sc/**:
- `docs/sc/ARCHITECTURE.md` → `ARCHITECTURE.en.md`
- `docs/sc/SECURITY.md` → `SECURITY.en.md`
- `docs/sc/TESTING.md` → `TESTING.en.md`
- `docs/sc/API_REFERENCE.md` → `API_REFERENCE.en.md`

**Archivos en docs/fe/**:
- `docs/fe/COMPONENTS.md` → `COMPONENTS.en.md`
- `docs/fe/HOOKS.md` → `HOOKS.en.md`
- `docs/fe/SETUP.md` → `SETUP.en.md`
- `docs/fe/WEB3.md` → `WEB3.en.md`

### Archivos a Revisar (Determinar idioma)

> **📚 Nota**: Estos archivos necesitan revisión para determinar su idioma principal antes de renombrarlos.

**Reportes y evaluaciones**:
- `docs/reports/SUMMARY_DAY1.md` - Revisar idioma
- `docs/reports/SUMMARY_DAY4.md` - Revisar idioma (si existe)
- `docs/reports/TASK_STATUS_REAL.md` - Revisar idioma (si existe)
- `IA.md` - Revisar idioma
- `docs/reports/RADIX_UI_DIALOG_WARNING.md` - Revisar idioma (si existe)
- `docs/reports/FULL_VERIFICATION_REPORT.md` - Revisar idioma (consolidado)
- `docs/reports/FRONTEND_PAGES_QUALITY_REVIEW.md` - Revisar idioma (histórico)
- `docs/reports/HOW_TO_REVIEW_IMPLEMENTATION.md` - Revisar idioma
- `docs/reports/TESTING_IMPLEMENTATION.md` - Revisar idioma
- `docs/reports/DOCUMENTATION_AUDIT.md` - Revisar idioma

> **📚 Para verificar qué archivos existen actualmente, consulta [INDEX.md](../../INDEX.md)**

---

## 💻 Fase 2: Traducción de Comentarios en Código

> **📚 Nota**: Esta fase es opcional y no crítica para la entrega actual. Los comentarios en español son funcionales y no afectan la ejecución del código.

### Archivos a Revisar
- `sc/src/SupplyChain.sol` - Comentarios NatSpec (revisar si hay comentarios en español)
- `sc/script/*.s.sol` - Scripts de Foundry (comentarios en código)
- `web/src/components/*.tsx` - Componentes React (comentarios en código)
- `web/src/hooks/*.ts` - Hooks personalizados (comentarios en código)
- `web/src/app/**/*.tsx` - Páginas Next.js (comentarios en código)

### Estrategia
1. Identificar todos los comentarios en español usando búsqueda de texto
2. Traducirlos a inglés manteniendo el mismo formato y estructura
3. Asegurar que los comentarios sean claros y técnicamente precisos
4. Mantener comentarios NatSpec en inglés (estándar de Solidity)
5. Actualizar documentación inline si es necesario

> **📚 Para documentación completa del código, consulta [docs/sc/API_REFERENCE.md](../sc/API_REFERENCE.md) y [docs/fe/HOOKS.md](../fe/HOOKS.md)**

---

## 🌐 Fase 3: Implementación de i18n

> **⚠️ IMPORTANTE**: Esta fase es **futura/opcional** y no es crítica para la entrega actual del proyecto. El proyecto está completo y funcional sin i18n.

### Tecnología Sugerida
- **next-intl** (recomendado para Next.js App Router) o **react-i18next** para Next.js
- Archivos de traducción: `locales/es.json` y `locales/en.json`
- Detección automática de idioma del navegador
- Selector de idioma en la UI (opcional)

### Componentes a Internacionalizar
- Todos los textos de la UI (títulos, descripciones, labels)
- Mensajes de error y validación
- Placeholders de formularios
- Botones y acciones
- Mensajes de éxito/confirmación
- Tooltips y ayuda contextual
- Notificaciones y alerts

### Estructura Propuesta
```
web/
  locales/
    es.json          # Traducciones en español
    en.json          # Traducciones en inglés
  src/
    i18n/
      config.ts      # Configuración de i18n
      messages.ts    # Carga de mensajes
```

### Consideraciones
- **Prioridad**: Baja - No es requerido para la entrega académica actual
- **Complejidad**: Media - Requiere refactorizar todos los componentes
- **Tiempo estimado**: 8-12 horas para implementación completa
- **Recomendación**: Implementar después de completar Video Demo (Día 9)

> **📚 Para documentación de componentes actuales, consulta [docs/fe/COMPONENTS.md](../fe/COMPONENTS.md)**

---

## 📝 Notas

- Mantener `README.md` principal en inglés (estándar de la industria)
- Crear `README.es.md` para versión en español
- Los archivos de reportes históricos pueden mantenerse en su idioma original con extensión apropiada
- Este plan es **futuro/opcional** y no es crítico para la entrega actual del proyecto
- Prioridad: Primero completar Video Demo (Día 9) antes de considerar implementación de i18n

## 🔗 Referencias Relacionadas

- **Estado del Proyecto**: [PROJECT_STATUS.md](../../PROJECT_STATUS.md) - Estado actual y próximos pasos
- **Índice de Documentación**: [INDEX.md](../../INDEX.md) - Índice maestro de toda la documentación
- **Quick Start**: [QUICKSTART.md](../../QUICKSTART.md) - Guía rápida de inicio
- **Documentación Técnica**: [docs/common/DOCUMENTATION.md](../common/DOCUMENTATION.md) - Guía técnica completa

---

**Última actualización**: 26 de Noviembre, 2025  
**Nota**: Este plan es para implementación futura. El proyecto actual está completo y funcional sin necesidad de multilenguaje.

