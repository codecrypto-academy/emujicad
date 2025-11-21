#!/bin/bash

# 🔍 Script Maestro de Verificación Completa
# Ejecuta todas las verificaciones automatizadas

set -e

# Colores
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🔍 VERIFICACIÓN COMPLETA DE IMPLEMENTACIÓN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Ejecutando todas las verificaciones...${NC}"
echo ""

# Obtener directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

# Ejecutar verificaciones
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 1: Verificación de Implementación${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "scripts/verify-implementation.sh" ]; then
    bash scripts/verify-implementation.sh
    IMPL_RESULT=$?
else
    echo -e "${RED}❌ Script verify-implementation.sh no encontrado${NC}"
    IMPL_RESULT=1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 2: Verificación de Calidad de Código${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "scripts/verify-code-quality.sh" ]; then
    bash scripts/verify-code-quality.sh
    QUALITY_RESULT=$?
else
    echo -e "${RED}❌ Script verify-code-quality.sh no encontrado${NC}"
    QUALITY_RESULT=1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}PASO 3: Verificación de Compilación${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd web
if npm run build > /tmp/build-output.log 2>&1; then
    echo -e "${GREEN}✅ Build exitoso${NC}"
    BUILD_RESULT=0
else
    echo -e "${RED}❌ Build falló. Últimas líneas del error:${NC}"
    tail -30 /tmp/build-output.log
    BUILD_RESULT=1
fi
cd ..

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 RESUMEN FINAL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL_FAILED=$((IMPL_RESULT + QUALITY_RESULT + BUILD_RESULT))

if [ $TOTAL_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODAS LAS VERIFICACIONES PASARON!${NC}"
    echo ""
    echo -e "${GREEN}✅ Implementación: Correcta${NC}"
    echo -e "${GREEN}✅ Calidad de código: Correcta${NC}"
    echo -e "${GREEN}✅ Compilación: Exitosa${NC}"
    echo ""
    echo -e "${BLUE}La implementación está lista para usar.${NC}"
    exit 0
else
    echo -e "${RED}❌ ALGUNAS VERIFICACIONES FALLARON${NC}"
    echo ""
    [ $IMPL_RESULT -ne 0 ] && echo -e "${RED}❌ Verificación de implementación falló${NC}"
    [ $QUALITY_RESULT -ne 0 ] && echo -e "${RED}❌ Verificación de calidad falló${NC}"
    [ $BUILD_RESULT -ne 0 ] && echo -e "${RED}❌ Compilación falló${NC}"
    echo ""
    echo -e "${BLUE}Revisar los errores arriba y corregir antes de continuar.${NC}"
    exit 1
fi

