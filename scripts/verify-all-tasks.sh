#!/bin/bash

# Script maestro para verificar TODAS las tareas implementadas
# Incluye: Críticas, Media, Baja prioridad

set +e

echo "🔍 VERIFICACIÓN COMPLETA DE TAREAS IMPLEMENTADAS"
echo "=================================================="
echo ""

# Ejecutar verificación de implementación (críticas y media)
echo "📋 Ejecutando verificación de tareas críticas y media..."
bash scripts/verify-implementation.sh 2>&1 | tail -10

echo ""
echo ""

# Ejecutar verificación de calidad de código
echo "📋 Ejecutando verificación de calidad de código..."
bash scripts/verify-code-quality.sh 2>&1 | tail -10

echo ""
echo ""

# Ejecutar verificación de tareas de baja prioridad
echo "📋 Ejecutando verificación de tareas de baja prioridad..."
bash scripts/verify-low-priority-tasks.sh 2>&1 | tail -15

echo ""
echo ""

# Ejecutar validaciones adicionales
echo "📋 Ejecutando validaciones adicionales..."
bash scripts/verify-additional-checks.sh 2>&1 | tail -15

echo ""
echo "=================================================="
echo "✅ VERIFICACIÓN COMPLETA FINALIZADA"
echo "=================================================="

