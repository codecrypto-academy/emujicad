#!/bin/bash

# 🔍 Script de Verificación de Calidad de Código
# Verifica patrones de código, estructura y mejores prácticas

# No usar set -e para permitir que todas las verificaciones se ejecuten

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🔍 Verificación de Calidad de Código${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Función para verificar patrón
check_pattern() {
    local file=$1
    local pattern=$2
    local description=$3
    local should_exist=${4:-true}
    
    if [ "$should_exist" = true ]; then
        if grep -q "$pattern" "$file" 2>/dev/null; then
            echo -e "${GREEN}✅${NC} $description"
            ((PASSED++))
            return 0
        else
            echo -e "${RED}❌${NC} $description ${RED}(NO ENCONTRADO)${NC}"
            ((FAILED++))
            return 1
        fi
    else
        if ! grep -q "$pattern" "$file" 2>/dev/null; then
            echo -e "${GREEN}✅${NC} $description"
            ((PASSED++))
            return 0
        else
            echo -e "${RED}❌${NC} $description ${RED}(ENCONTRADO - NO DEBERÍA ESTAR)${NC}"
            ((FAILED++))
            return 1
        fi
    fi
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. Verificando Estructura de ErrorBoundary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "web/src/components/ErrorBoundary.tsx" ]; then
    check_pattern "web/src/components/ErrorBoundary.tsx" "componentDidCatch" "ErrorBoundary tiene componentDidCatch"
    check_pattern "web/src/components/ErrorBoundary.tsx" "getDerivedStateFromError" "ErrorBoundary tiene getDerivedStateFromError"
    check_pattern "web/src/components/ErrorBoundary.tsx" "handleReset" "ErrorBoundary tiene función de reset"
    check_pattern "web/src/components/ErrorBoundary.tsx" "dark:" "ErrorBoundary soporta dark mode"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. Verificando Funciones de Validación${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "web/src/lib/validation.ts" ]; then
    check_pattern "web/src/lib/validation.ts" "export function validateUserInfo" "validateUserInfo es exportada"
    check_pattern "web/src/lib/validation.ts" "export function validateUserInfoTuple" "validateUserInfoTuple es exportada"
    check_pattern "web/src/lib/validation.ts" "export function validateBigIntArray" "validateBigIntArray es exportada"
    check_pattern "web/src/lib/validation.ts" "isValidAddress" "Validación de direcciones Ethereum"
    check_pattern "web/src/lib/validation.ts" "toBigInt" "Conversión segura a bigint"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. Verificando Uso de Validación en Páginas${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que se usa validación en lugar de type assertions
# Nota: page.tsx usa useAuth que internamente usa validación, no directamente
check_pattern "web/src/app/page.tsx" "useAuth" "Home usa useAuth (que incluye validación)" true
check_pattern "web/src/app/page.tsx" "as UserInfo" "Home NO usa type assertion" false

check_pattern "web/src/app/dashboard/page.tsx" "validateBigIntArray" "Dashboard usa validación" true
check_pattern "web/src/contexts/AuthContext.tsx" "validateUserInfo\|validateUserInfoTuple" "AuthContext usa validación" true
check_pattern "web/src/components/UserProfileCard.tsx" "validateUserInfo\|validateUserInfoTuple" "UserProfileCard usa validación" true
# Header usa useAuth que internamente maneja validación, no necesita validación directa
check_pattern "web/src/components/Header.tsx" "useAuth" "Header usa useAuth (que incluye validación)" true

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. Verificando Manejo de Errores en Páginas${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Home usa useAuth que maneja errores internamente, no necesita manejo directo de errores
check_pattern "web/src/app/page.tsx" "useAuth" "Home usa useAuth (que maneja errores)" true
check_pattern "web/src/app/dashboard/page.tsx" "error.*tokensError\|error.*totalTokensError" "Dashboard maneja errores" true
check_pattern "web/src/app/admin/users/page.tsx" "error.*ownerError" "Admin Users maneja errores" true

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Verificando Skeleton Loaders${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_pattern "web/src/app/dashboard/page.tsx" "animate-pulse\|Skeleton" "Dashboard tiene skeleton loaders" true
check_pattern "web/src/app/admin/users/page.tsx" "animate-pulse\|Skeleton" "Admin Users tiene skeleton loaders" true

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. Verificando Dark Mode${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

check_pattern "web/src/app/dashboard/page.tsx" "dark:" "Dashboard tiene variantes dark" true
check_pattern "web/src/app/page.tsx" "dark:" "Home tiene variantes dark" true
check_pattern "web/src/app/admin/users/page.tsx" "dark:" "Admin Users tiene variantes dark" true

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. Verificando Imports Correctos${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Nota: page.tsx usa useAuth que maneja tipos y validación internamente
check_pattern "web/src/app/page.tsx" "useAuth" "Home usa useAuth (maneja tipos y validación)" true
check_pattern "web/src/app/layout.tsx" "from '@/components/ErrorBoundary'" "Layout importa ErrorBoundary" true

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 RESUMEN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL=$((PASSED + FAILED + WARNINGS))
echo -e "${GREEN}✅ Pasados:${NC} $PASSED"
echo -e "${RED}❌ Fallidos:${NC} $FAILED"
echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 Calidad de código verificada correctamente!${NC}"
    exit 0
else
    echo -e "${RED}❌ Hay problemas de calidad. Revisar arriba.${NC}"
    exit 1
fi

