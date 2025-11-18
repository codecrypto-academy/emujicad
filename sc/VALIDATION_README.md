# 📝 Sistema de Validación Automatizado

Este directorio contiene un sistema automatizado de validación para el proyecto SupplyChain.

---

## 🎯 Scripts de Validación

### 1. `validate-all.sh` - Validación Integral Completa

Script principal que ejecuta todas las validaciones del proyecto y **genera automáticamente** el reporte `VALIDATION_RESULTS.md`.

#### Uso:
```bash
bash validate-all.sh
```

#### Qué valida:
- ✅ **Dependencias**: Foundry (forge, cast), bc
- ✅ **Compilación**: forge build
- ✅ **Tests**: 73 tests (SupplyChain.t.sol + EdgeCasesTest.t.sol)
- ✅ **Deployment Scripts**: SupplyChainDeploy.s.sol, SupplyChainInteractions.s.sol
- ✅ **Coverage**: Lines, Statements, Branches, Functions
- ✅ **Scripts de Reporte**: coverage-reporter-simple.sh, coverage-reporter.sh
- ✅ **Estructura de Archivos**: Verifica existencia de archivos clave

#### Output:
- Terminal con resultados coloridos (20 validaciones)
- **Genera automáticamente**: `VALIDATION_RESULTS.md`

---

### 2. `coverage-reporter-simple.sh` - Reporte de Coverage Rápido

Genera un reporte simple de métricas de cobertura de tests.

#### Uso:
```bash
bash coverage-reporter-simple.sh
```

#### Métricas reportadas:
- 📏 Lines Coverage
- 📝 Statements Coverage
- 🌿 Branches Coverage
- ⚡ Functions Coverage

#### Evaluación:
- Estándares industriales aplicados
- Recomendación de deployment
- Calidad para proyecto académico

---

### 3. `coverage-reporter.sh` - Reporte de Coverage Detallado

Genera un reporte detallado con opción de exportar a markdown.

#### Uso:
```bash
bash coverage-reporter.sh
# Preguntará si deseas generar COVERAGE_REPORT.md
```

#### Features:
- Output con colores en terminal
- Evaluación detallada por métrica
- Opción de generar `COVERAGE_REPORT.md`
- Calificación general (Producción Ready / Buena Calidad / Requiere Mejoras)

---

## 📄 Archivos Generados Automáticamente

### `VALIDATION_RESULTS.md` ✨ **Auto-generado**

Este archivo es **regenerado automáticamente** cada vez que ejecutas `validate-all.sh`.

**Contenido**:
- 📊 Resumen ejecutivo con estadísticas
- 🎯 Detalle de las 20 validaciones ejecutadas
- 🚀 Comandos de reproducción
- 📜 Certificación de validación con timestamp

**⚠️ IMPORTANTE**: 
- No edites este archivo manualmente
- Se sobrescribe en cada ejecución de `validate-all.sh`
- Siempre refleja el estado actual del proyecto

---

### `COVERAGE_REPORT.md` (Opcional)

Generado solo si respondes 'y' cuando `coverage-reporter.sh` lo pregunta.

**Contenido**:
- Métricas detalladas de coverage
- Tabla comparativa con estándares
- Recomendaciones específicas
- Suite de tests documentada

---

## 🔄 Workflow Recomendado

### Validación Completa:
```bash
# Ejecuta todas las validaciones y genera reporte
bash validate-all.sh

# Revisa el reporte generado
cat VALIDATION_RESULTS.md
```

### Solo Coverage:
```bash
# Reporte rápido en terminal
bash coverage-reporter-simple.sh

# O reporte detallado con opción de markdown
bash coverage-reporter.sh
```

### Desarrollo Continuo:
```bash
# Después de hacer cambios en el código
forge test                    # Primero ejecuta tests
bash coverage-reporter-simple.sh  # Verifica coverage
bash validate-all.sh          # Validación completa + reporte actualizado
```

---

## 📊 Estándares de Calidad Aplicados

Los scripts evalúan según estándares industriales:

| Métrica | Mínimo | Excelente |
|---------|--------|-----------|
| Lines | 70% | 85% |
| Statements | 70% | 85% |
| Branches | 50% | 75% |
| Functions | 75% | 90% |

---

## 🎓 Para Presentación Académica

Ejecuta antes de presentar:

```bash
# Validación completa
bash validate-all.sh

# Si todo pasa (20/20):
# 1. VALIDATION_RESULTS.md se genera automáticamente
# 2. Úsalo como evidencia de calidad del proyecto
# 3. Muestra las métricas de coverage
```

---

## 🛠️ Troubleshooting

### "forge: command not found"
```bash
# Instalar Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### "bc: command not found"
```bash
# En Ubuntu/Debian
sudo apt-get install bc

# En macOS
brew install bc
```

### Tests fallando
```bash
# Ver detalles de los tests
forge test -vvv

# Ejecutar solo un test específico
forge test --match-test testNombreDelTest -vvv
```

### Coverage no se genera
```bash
# Verificar que forge funciona
forge --version

# Ejecutar coverage manualmente
forge coverage

# Limpiar y recompilar
forge clean && forge build
```

---

## 📁 Estructura de Archivos

```
sc/
├── validate-all.sh              # ⭐ Script principal de validación
├── coverage-reporter-simple.sh  # Reporte rápido de coverage
├── coverage-reporter.sh         # Reporte detallado de coverage
├── VALIDATION_RESULTS.md        # ✨ Auto-generado por validate-all.sh
├── COVERAGE_REPORT.md           # Opcional (generado por coverage-reporter.sh)
├── src/
│   └── SupplyChain.sol
├── test/
│   ├── SupplyChain.t.sol
│   └── EdgeCasesTest.t.sol
└── script/
    ├── SupplyChainDeploy.s.sol
    └── SupplyChainInteractions.s.sol
```

---

## ✅ Ventajas del Sistema

1. **Automatización Completa**
   - Un solo comando valida todo
   - Reporte generado automáticamente
   - No hay que escribir documentación manualmente

2. **Consistencia**
   - Mismo formato en cada ejecución
   - Timestamp automático
   - Resultados reproducibles

3. **Trazabilidad**
   - Cada validación documentada
   - Métricas precisas con porcentajes
   - Estado claro (✅ APROBADO / ❌ FALLIDO)

4. **Presentación Profesional**
   - Output colorido en terminal
   - Markdown bien formateado
   - Certificación automática

---

**Última actualización**: 2025-11-18  
**Versión**: 1.0.0  
**Proyecto**: SupplyChain Smart Contract
