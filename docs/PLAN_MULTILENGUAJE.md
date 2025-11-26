# 🌍 Plan de Implementación: Multilenguaje y Documentación

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**

**Fecha**: 2025-01-XX  
**Estado**: En Planificación

## 📋 Objetivos

1. **Reorganizar Documentación**: Renombrar archivos `.md` a `.es.md` (español) o `.en.md` (inglés)
2. **Traducir Comentarios**: Convertir todos los comentarios en código de español a inglés
3. **Implementar i18n**: Sistema de internacionalización para la aplicación web

---

## 📁 Fase 1: Reorganización de Documentación

### Archivos en Español (→ `.es.md`)
- `docs/reports/PROXIMOS_PASOS.md` → `PROXIMOS_PASOS.es.md`
- `docs/reports/PATRON_PROXY_ANALISIS.md` → `PATRON_PROXY_ANALISIS.es.md`
- `docs/reports/VALIDACIONES_PENDIENTES_CONTRATO.md` → `VALIDACIONES_PENDIENTES_CONTRATO.es.md`
- `docs/reports/CONSOLIDACION_DOCUMENTACION.md` → `CONSOLIDACION_DOCUMENTACION.es.md`
- `docs/reports/PROYECTO_EVALUACION_COMPLETA.md` → `PROYECTO_EVALUACION_COMPLETA.es.md`
- `docs/reports/PLAN_IMPLEMENTACION_OPTIMIZACIONES.md` → `PLAN_IMPLEMENTACION_OPTIMIZACIONES.es.md`
- `docs/reports/RECOMENDACIONES_EXTRAS.md` → `RECOMENDACIONES_EXTRAS.es.md`
- `docs/reports/RECOMENDACIONES_OPTIMIZACION_CONTRATO.md` → `RECOMENDACIONES_OPTIMIZACION_CONTRATO.es.md`
- `CUENTAS_ANVIL_10_14.md` → `CUENTAS_ANVIL_10_14.es.md`
- `ESTADO_CONTRATO_INTELIGENTE.md` → `ESTADO_CONTRATO_INTELIGENTE.es.md`
- `VALIDACION_HOOKS_OWNERSHIP.md` → `VALIDACION_HOOKS_OWNERSHIP.es.md`
- `VALIDACION_CONTRATO_FRONTEND.md` → `VALIDACION_CONTRATO_FRONTEND.es.md`
- `PENDIENTES_FRONTEND.md` → `PENDIENTES_FRONTEND.es.md`
- `INDEX.md` → `INDEX.es.md`
- `NAVEGACION_GUIA.md` → `NAVEGACION_GUIA.es.md`
- `PAGES_DETAILS.md` → `PAGES_DETAILS.es.md`

### Archivos en Inglés (→ `.en.md`)
- `README.md` → `README.en.md` (o mantener como principal)
- `web/README.md` → `web/README.en.md`
- `sc/README.md` → `sc/README.en.md`
- `QUICKSTART.md` → `QUICKSTART.en.md`
- `PROJECT_STATUS.md` → `PROJECT_STATUS.en.md`
- `docs/reports/PERFORMANCE_OPTIMIZATION.md` → `PERFORMANCE_OPTIMIZATION.en.md`
- `docs/reports/ACCESSIBILITY_IMPLEMENTATION.md` → `ACCESSIBILITY_IMPLEMENTATION.en.md`
- `docs/reports/TESTING_REPORT.md` → `TESTING_REPORT.en.md`
- `docs/reports/ACADEMIC_ASSESSMENT.md` → `ACADEMIC_ASSESSMENT.en.md`
- `docs/sc/ARCHITECTURE.md` → `ARCHITECTURE.en.md`
- `docs/sc/SECURITY.md` → `SECURITY.en.md`
- `docs/sc/TESTING.md` → `TESTING.en.md`
- `docs/sc/API_REFERENCE.md` → `API_REFERENCE.en.md`
- `docs/fe/COMPONENTS.md` → `COMPONENTS.en.md`
- `docs/fe/HOOKS.md` → `HOOKS.en.md`

### Archivos a Revisar (Determinar idioma)
- `docs/reports/SUMMARY_DAY1.md`
- `docs/reports/SUMMARY_DAY4.md`
- `docs/reports/TASK_STATUS_REAL.md`
- `docs/reports/IA.md`
- `docs/reports/RADIX_UI_DIALOG_WARNING.md`
- `docs/reports/AUTOMATED_VERIFICATION_REPORT.md`
- `docs/reports/FULL_VERIFICATION_REPORT.md`
- `docs/reports/VALIDATION_SUMMARY.md`
- `docs/reports/FRONTEND_PAGES_QUALITY_REVIEW.md`
- `docs/reports/HOW_TO_REVIEW_IMPLEMENTATION.md`
- `docs/reports/TESTING_IMPLEMENTATION.md`
- `docs/reports/DOCUMENTATION_AUDIT.md`
- `docs/reports/ADDITIONAL_VALIDATIONS.md`

---

## 💻 Fase 2: Traducción de Comentarios en Código

### Archivos a Revisar
- `sc/src/SupplyChain.sol` - Comentarios en español
- `web/src/components/*.tsx` - Comentarios en español
- `web/src/hooks/*.ts` - Comentarios en español
- `web/src/app/**/*.tsx` - Comentarios en español

### Estrategia
1. Identificar todos los comentarios en español
2. Traducirlos a inglés manteniendo el mismo formato
3. Asegurar que los comentarios sean claros y técnicamente precisos

---

## 🌐 Fase 3: Implementación de i18n

### Tecnología Sugerida
- **next-intl** o **react-i18next** para Next.js
- Archivos de traducción: `locales/es.json` y `locales/en.json`

### Componentes a Internacionalizar
- Todos los textos de la UI
- Mensajes de error
- Placeholders de formularios
- Botones y acciones
- Títulos y descripciones

### Estructura Propuesta
```
web/
  locales/
    es.json
    en.json
  src/
    i18n/
      config.ts
      messages.ts
```

---

## 📝 Notas

- Mantener `README.md` principal en inglés (estándar de la industria)
- Crear `README.es.md` para versión en español
- Los archivos de reportes históricos pueden mantenerse en su idioma original con extensión apropiada

