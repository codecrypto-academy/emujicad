#!/bin/bash

# Script para verificar la implementación de la página de tokens de forma automatizada
# Sin intervención humana

set +e  # Continuar aunque haya errores para reporte completo

echo "🔍 VERIFICACIÓN AUTOMATIZADA - PÁGINA DE TOKENS"
echo "═══════════════════════════════════════════════════════════════"
echo ""

PASSED=0
FAILED=0
WARNINGS=0

check() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
        ((PASSED++))
        return 0
    else
        echo "❌ $1"
        ((FAILED++))
        return 1
    fi
}

warn() {
    echo "⚠️  $1"
    ((WARNINGS++))
}

echo "📦 1. Verificando hook useGetAllTokens()"
echo "───────────────────────────────────────────────────────────────"

# Verificar que el hook existe
if grep -q "export function useGetAllTokens" web/src/hooks/useGetUserTokens.ts; then
    check "Hook useGetAllTokens() exportado"
else
    check "Hook useGetAllTokens() exportado"
fi

# Verificar que usa useReadContracts
if grep -q "useReadContracts" web/src/hooks/useGetUserTokens.ts; then
    check "Hook usa useReadContracts para batch reads"
else
    check "Hook usa useReadContracts para batch reads"
fi

# Verificar que valida datos
if grep -q "validateTokenDataTuple" web/src/hooks/useGetUserTokens.ts; then
    check "Hook valida datos con validateTokenDataTuple"
else
    check "Hook valida datos con validateTokenDataTuple"
fi

# Verificar que usa useTotalTokens
if grep -q "useTotalTokens" web/src/hooks/useGetUserTokens.ts; then
    check "Hook usa useTotalTokens para obtener total"
else
    check "Hook usa useTotalTokens para obtener total"
fi

echo ""
echo "📄 2. Verificando página /tokens"
echo "───────────────────────────────────────────────────────────────"

# Verificar que la página existe
if [ -f "web/src/app/tokens/page.tsx" ]; then
    check "Página web/src/app/tokens/page.tsx existe"
else
    check "Página web/src/app/tokens/page.tsx existe"
fi

# Verificar que importa el hook (la página usa useGetUserTokensWithData, no useGetAllTokens)
if grep -q "useGetUserTokensWithData\|useGetAllTokens" web/src/app/tokens/page.tsx; then
    check "Página importa hook de tokens (useGetUserTokensWithData o useGetAllTokens)"
else
    check "Página importa hook de tokens (useGetUserTokensWithData o useGetAllTokens)"
fi

# Verificar que importa TokenCard
if grep -q "TokenCard" web/src/app/tokens/page.tsx; then
    check "Página importa TokenCard"
else
    check "Página importa TokenCard"
fi

# Verificar que tiene filtros
if grep -q "filterType\|Filter by type" web/src/app/tokens/page.tsx; then
    check "Página tiene filtros por tipo"
else
    check "Página tiene filtros por tipo"
fi

# Verificar que tiene búsqueda
if grep -q "searchQuery\|Search tokens" web/src/app/tokens/page.tsx; then
    check "Página tiene búsqueda por nombre"
else
    check "Página tiene búsqueda por nombre"
fi

# Verificar que tiene paginación
if grep -q "currentPage\|pagination\|Pagination" web/src/app/tokens/page.tsx; then
    check "Página tiene paginación"
else
    check "Página tiene paginación"
fi

# Verificar que tiene loading states
if grep -q "isLoading\|Skeleton" web/src/app/tokens/page.tsx; then
    check "Página tiene loading states"
else
    check "Página tiene loading states"
fi

# Verificar que tiene error handling
if grep -q "error\|Error\|Alert" web/src/app/tokens/page.tsx; then
    check "Página tiene error handling"
else
    check "Página tiene error handling"
fi

# Verificar que tiene empty state
if grep -q "No tokens\|empty\|Empty" web/src/app/tokens/page.tsx; then
    check "Página tiene empty state"
else
    check "Página tiene empty state"
fi

# Verificar accesibilidad
if grep -q "aria-label" web/src/app/tokens/page.tsx; then
    check "Página tiene ARIA labels"
else
    check "Página tiene ARIA labels"
fi

# Verificar dark mode
if grep -q "dark:" web/src/app/tokens/page.tsx; then
    check "Página tiene soporte dark mode"
else
    check "Página tiene soporte dark mode"
fi

# Verificar que usa Header
if grep -q "Header" web/src/app/tokens/page.tsx; then
    check "Página usa Header component"
else
    check "Página usa Header component"
fi

echo ""
echo "🔧 3. Verificando compilación TypeScript"
echo "───────────────────────────────────────────────────────────────"

cd web
if npm run build > /tmp/build-output.log 2>&1; then
    check "Compilación TypeScript exitosa"
else
    check "Compilación TypeScript exitosa"
    echo "   Errores encontrados:"
    grep -i "error" /tmp/build-output.log | head -5
fi
cd ..

echo ""
echo "🧪 4. Verificando tests E2E"
echo "───────────────────────────────────────────────────────────────"

# Verificar que el test existe
if [ -f "web/e2e/tokens.spec.ts" ]; then
    check "Test E2E tokens.spec.ts existe"
else
    check "Test E2E tokens.spec.ts existe"
fi

# Verificar que el test importa las funciones correctas
if grep -q "from '@playwright/test'" web/e2e/tokens.spec.ts; then
    check "Test importa @playwright/test"
else
    check "Test importa @playwright/test"
fi

echo ""
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Pasados: $PASSED"
echo "❌ Fallidos: $FAILED"
echo "⚠️  Advertencias: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 ¡Todas las verificaciones pasaron!"
    exit 0
else
    echo "⚠️  Algunas verificaciones fallaron. Revisar arriba."
    exit 1
fi

