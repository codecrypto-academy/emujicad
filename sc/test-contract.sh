#!/bin/bash

# 🧪 Script de Ejecución de Tests del Smart Contract SupplyChain
# Ejecuta todos los tests con diferentes niveles de verbosidad
# Autor: Proyecto PFM SupplyChain
# Fecha: 2025-11-25

set -e  # Exit on error

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Banner
echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║        🧪 TESTS DEL SMART CONTRACT SUPPLYCHAIN 🧪            ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Mostrar menú si no hay argumentos
if [ $# -eq 0 ]; then
    echo -e "${BLUE}Selecciona el nivel de detalle:${NC}\n"
    echo "  1) 📋 Básico       - Solo resultados (rápido)"
    echo "  2) 📊 Detallado    - Nombre de cada test (-vv)"
    echo "  3) �� Verbose      - Con logs de tests (-vvv)"
    echo "  4) 🔬 Máximo       - Traces completos (-vvvv)"
    echo "  5) 📈 Coverage     - Ejecutar con análisis de cobertura"
    echo "  6) 🎯 Específico   - Ejecutar un test específico"
    echo "  7) 📊 Resumen      - Mostrar resumen de tests (cantidad total)"
    echo "  8) ⛽ Gas Report   - Ejecutar tests con reporte de gas"
    echo ""
    read -p "Opción [1-8]: " option
else
    option=$1
fi

case $option in
    1|basico|basic)
        echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${MAGENTA}  🚀 EJECUTANDO TESTS BÁSICOS${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
        
        forge test
        ;;
        
    2|detallado|detail)
        echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${MAGENTA}  📊 EJECUTANDO TESTS CON DETALLE${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
        
        forge test -vv
        ;;
        
    3|verbose)
        echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${MAGENTA}  🔍 EJECUTANDO TESTS VERBOSE (con logs)${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
        
        forge test -vvv
        ;;
        
    4|maximo|max|trace)
        echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${MAGENTA}  🔬 EJECUTANDO TESTS CON MÁXIMO DETALLE${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
        
        forge test -vvvv
        ;;
        
    5|coverage|cov)
        echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${MAGENTA}  📈 EJECUTANDO TESTS CON COVERAGE${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
        
        forge coverage --match-path "test/*"
        ;;
        
    6|especifico|specific)
        echo -e "\n${BLUE}Ingresa el nombre del test (o parte del nombre):${NC}"
        read -p "Test: " test_name
        
        echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${MAGENTA}  🎯 EJECUTANDO TEST: $test_name${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
        
        forge test --match-test "$test_name" -vv
        ;;
        
    7|resumen|summary)
        echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${MAGENTA}  📊 RESUMEN DE TESTS${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
        
        # Ejecutar tests y capturar resultado
        TEST_OUTPUT=$(forge test 2>&1)
        TEST_RESULT=$?
        
        # Extraer información del resumen
        TOTAL_TESTS=$(echo "$TEST_OUTPUT" | grep -oP '\d+ tests passed' | grep -oP '\d+' | head -1)
        FAILED_TESTS=$(echo "$TEST_OUTPUT" | grep -oP '\d+ failed' | grep -oP '\d+' | head -1)
        SKIPPED_TESTS=$(echo "$TEST_OUTPUT" | grep -oP '\d+ skipped' | grep -oP '\d+' | head -1)
        
        echo -e "${CYAN}📈 Estadísticas de Tests:${NC}\n"
        echo -e "   ${GREEN}✅ Tests pasados:${NC} ${TOTAL_TESTS:-0}"
        echo -e "   ${RED}❌ Tests fallidos:${NC} ${FAILED_TESTS:-0}"
        echo -e "   ${YELLOW}⏭️  Tests omitidos:${NC} ${SKIPPED_TESTS:-0}"
        
        if [ -n "$TOTAL_TESTS" ]; then
            TOTAL_COUNT=$(echo "$TEST_OUTPUT" | grep -oP '\(\d+ total tests\)' | grep -oP '\d+' | head -1)
            if [ -n "$TOTAL_COUNT" ]; then
                echo -e "   ${BLUE}📊 Total de tests:${NC} ${TOTAL_COUNT}"
            fi
        fi
        
        echo ""
        ;;
        
    8|gas|gasreport)
        echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
        echo -e "${MAGENTA}  ⛽ EJECUTANDO TESTS CON REPORTE DE GAS${NC}"
        echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}\n"
        
        forge test --gas-report
        ;;
        
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        echo -e "${YELLOW}Uso: ./test-contract.sh [basico|detallado|verbose|maximo|coverage|especifico|resumen|gas]${NC}"
        exit 1
        ;;
esac

# Resultado final (solo si no es la opción de resumen)
if [ "$option" != "7" ] && [ "$option" != "resumen" ] && [ "$option" != "summary" ]; then
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                               ║${NC}"
        echo -e "${GREEN}║              ✅ TESTS EJECUTADOS EXITOSAMENTE ✅              ║${NC}"
        echo -e "${GREEN}║                                                               ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
    else
        echo -e "\n${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                                                               ║${NC}"
        echo -e "${RED}║                 ❌ ALGUNOS TESTS FALLARON ❌                  ║${NC}"
        echo -e "${RED}║                                                               ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
        exit 1
    fi
fi

# Mostrar ayuda adicional
echo -e "${CYAN}💡 Comandos útiles adicionales:${NC}"
echo -e "   ${BLUE}./test-contract.sh basico${NC}      - Tests sin detalles"
echo -e "   ${BLUE}./test-contract.sh detallado${NC}   - Ver nombre de cada test"
echo -e "   ${BLUE}./test-contract.sh verbose${NC}     - Con logs de tests"
echo -e "   ${BLUE}./test-contract.sh maximo${NC}      - Traces completos"
echo -e "   ${BLUE}./test-contract.sh coverage${NC}    - Con análisis de cobertura"
echo -e "   ${BLUE}./test-contract.sh especifico${NC}  - Ejecutar un test específico"
echo -e "   ${BLUE}./test-contract.sh resumen${NC}     - Mostrar resumen de tests"
echo -e "   ${BLUE}./test-contract.sh gas${NC}         - Ejecutar con reporte de gas"
echo ""
