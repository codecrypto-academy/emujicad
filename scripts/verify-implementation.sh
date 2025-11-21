#!/bin/bash

# 🔍 Script de Verificación Automatizada de Implementación
# Verifica que todas las mejoras implementadas estén correctas

# No usar set -e para permitir que todas las verificaciones se ejecuten

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🔍 Verificación Automatizada de Implementación${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✅${NC} $2: $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $2: $1 ${RED}(NO ENCONTRADO)${NC}"
        ((FAILED++))
        return 1
    fi
}

# Función para verificar que un archivo contiene un patrón
check_pattern() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $3: Encontrado en $1"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC} $3: ${RED}NO encontrado en $1${NC}"
        ((FAILED++))
        return 1
    fi
}

# Función para verificar que NO hay un patrón (anti-pattern)
check_no_pattern() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${RED}❌${NC} $3: ${RED}Encontrado patrón no deseado en $1${NC}"
        ((FAILED++))
        return 1
    else
        echo -e "${GREEN}✅${NC} $3: No hay patrón no deseado en $1"
        ((PASSED++))
        return 0
    fi
}

# Función para warning
warn() {
    echo -e "${YELLOW}⚠️${NC}  $1"
    ((WARNINGS++))
}

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. Verificando Archivos Creados${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar ErrorBoundary
check_file "web/src/components/ErrorBoundary.tsx" "ErrorBoundary Component"

# Verificar Validación
check_file "web/src/lib/validation.ts" "Validation Utilities"

# Verificar Tipos
check_file "web/src/types/index.ts" "Shared Types"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. Verificando Integración de ErrorBoundary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que ErrorBoundary está importado en layout
check_pattern "web/src/app/layout.tsx" "ErrorBoundary" "ErrorBoundary importado en layout"

# Verificar que ErrorBoundary está usado en layout
check_pattern "web/src/app/layout.tsx" "<ErrorBoundary>" "ErrorBoundary usado en layout"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. Verificando Validación de Datos${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar funciones de validación
check_pattern "web/src/lib/validation.ts" "validateUserInfo" "Función validateUserInfo existe"
check_pattern "web/src/lib/validation.ts" "validateUserInfoTuple" "Función validateUserInfoTuple existe"
check_pattern "web/src/lib/validation.ts" "validateBigIntArray" "Función validateBigIntArray existe"
check_pattern "web/src/lib/validation.ts" "validateTokenData" "Función validateTokenData existe"

# Verificar que se usa validación en páginas
check_pattern "web/src/app/page.tsx" "validateUserInfo" "Validación usada en Home"
check_pattern "web/src/app/dashboard/page.tsx" "validateBigIntArray" "Validación usada en Dashboard"
check_pattern "web/src/contexts/AuthContext.tsx" "validateUserInfo" "Validación usada en AuthContext"
check_pattern "web/src/components/UserProfileCard.tsx" "validateUserInfo" "Validación usada en UserProfileCard"
check_pattern "web/src/components/Header.tsx" "validateUserInfo" "Validación usada en Header"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. Verificando Tipos Centralizados${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que tipos están definidos
check_pattern "web/src/types/index.ts" "export type UserInfo" "Tipo UserInfo definido"
check_pattern "web/src/types/index.ts" "export type TokenData" "Tipo TokenData definido"

# Verificar que se importan tipos centralizados
check_pattern "web/src/app/page.tsx" "from '@/types'" "Tipos importados en Home"
check_pattern "web/src/contexts/AuthContext.tsx" "from '@/types'" "Tipos importados en AuthContext"
check_pattern "web/src/components/UserProfileCard.tsx" "from '@/types'" "Tipos importados en UserProfileCard"
check_pattern "web/src/components/Header.tsx" "from '@/types'" "Tipos importados en Header"

# Verificar que NO hay definiciones duplicadas (excepto en types/index.ts)
echo ""
echo -e "${YELLOW}Verificando que no hay definiciones duplicadas de UserInfo...${NC}"
DUPLICATES=$(grep -r "type UserInfo\|interface UserInfo" web/src --exclude-dir=node_modules --exclude-dir=.archive --exclude="types/index.ts" 2>/dev/null | grep -v "from '@/types'" | grep -v "export type UserInfo" | wc -l)
if [ "$DUPLICATES" -eq 0 ]; then
    echo -e "${GREEN}✅${NC} No hay definiciones duplicadas de UserInfo"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Se encontraron definiciones duplicadas de UserInfo:"
    grep -r "type UserInfo\|interface UserInfo" web/src --exclude-dir=node_modules --exclude-dir=.archive --exclude="types/index.ts" 2>/dev/null | grep -v "from '@/types'" | grep -v "export type UserInfo"
    ((FAILED++))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. Verificando Type Assertions Peligrosos${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que NO hay type assertions peligrosos (excepto en validation.ts)
echo -e "${YELLOW}Buscando type assertions peligrosos...${NC}"
DANGEROUS_ASSERTS=$(grep -r "as UserInfo" web/src --exclude-dir=node_modules --exclude="validation.ts" 2>/dev/null | wc -l)
if [ "$DANGEROUS_ASSERTS" -eq 0 ]; then
    echo -e "${GREEN}✅${NC} No hay type assertions peligrosos de UserInfo"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Se encontraron type assertions peligrosos:"
    grep -r "as UserInfo" web/src --exclude-dir=node_modules --exclude="validation.ts" 2>/dev/null
    ((FAILED++))
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. Verificando Manejo de Errores${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar que se manejan errores en hooks
check_pattern "web/src/app/page.tsx" "error.*ownerError\|error.*userInfoError" "Errores manejados en Home"
check_pattern "web/src/app/dashboard/page.tsx" "error.*tokensError" "Errores manejados en Dashboard"
check_pattern "web/src/app/admin/users/page.tsx" "error.*ownerError" "Errores manejados en Admin Users"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. Verificando Skeleton Loaders${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar skeleton loaders en dashboard
check_pattern "web/src/app/dashboard/page.tsx" "animate-pulse\|Skeleton" "Skeleton loaders en Dashboard"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}8. Verificando Compilación TypeScript${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd web
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} TypeScript compila correctamente"
    ((PASSED++))
else
    echo -e "${RED}❌${NC} Errores de compilación TypeScript:"
    npm run build 2>&1 | head -20
    ((FAILED++))
fi
cd ..

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}9. Verificando Linting${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd web
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Linting pasa sin errores"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️${NC}  Hay warnings/errores de linting (revisar manualmente):"
    npm run lint 2>&1 | head -20
    ((WARNINGS++))
fi
cd ..

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  📊 RESUMEN DE VERIFICACIÓN${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${GREEN}✅ Pasados:${NC} $PASSED"
echo -e "${RED}❌ Fallidos:${NC} $FAILED"
echo -e "${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
echo -e "${BLUE}📊 Total:${NC} $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 ¡Todas las verificaciones pasaron!${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  Verificaciones pasaron con warnings${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ Hay verificaciones fallidas. Revisar arriba.${NC}"
    exit 1
fi

