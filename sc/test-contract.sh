#!/bin/bash

# 🧪 Script de Ejecución de Tests del Smart Contract SupplyChain
# Ejecuta todos los tests con diferentes niveles de verbosidad
# Autor: Proyecto PFM SupplyChain
# Fecha: 2025-11-20

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
    echo ""
    read -p "Opción [1-6]: " option
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
        
    *)
        echo -e "${RED}❌ Opción inválida${NC}"
        echo -e "${YELLOW}Uso: ./test-contract.sh [basico|detallado|verbose|maximo|coverage|especifico]${NC}"
        exit 1
        ;;
esac

# Resultado final
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

# Mostrar ayuda adicional
echo -e "${CYAN}💡 Comandos útiles adicionales:${NC}"
echo -e "   ${BLUE}./test-contract.sh basico${NC}      - Tests sin detalles"
echo -e "   ${BLUE}./test-contract.sh detallado${NC}   - Ver nombre de cada test"
echo -e "   ${BLUE}./test-contract.sh verbose${NC}     - Con logs de tests"
echo -e "   ${BLUE}./test-contract.sh coverage${NC}    - Con análisis de cobertura"
echo -e "   ${BLUE}./test-contract.sh especifico${NC}  - Ejecutar un test específico"
echo ""
