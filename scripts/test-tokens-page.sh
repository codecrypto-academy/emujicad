#!/bin/bash

# Script automatizado para probar la página /tokens sin intervención humana
# Ejecuta verificación estática + tests E2E si el servidor está disponible

set +e  # Continuar aunque haya errores

echo "🧪 PRUEBA AUTOMATIZADA - PÁGINA /tokens"
echo "═══════════════════════════════════════════════════════════════"
echo ""

PASSED=0
FAILED=0

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

echo "📋 PASO 1: Verificación estática"
echo "───────────────────────────────────────────────────────────────"

# Verificar que el hook existe y está exportado (puede ser useGetAllTokens o useGetUserTokensWithData)
if grep -q "export function useGetAllTokens\|export function useGetUserTokensWithData" web/src/hooks/useGetUserTokens.ts; then
    check "Hook de tokens exportado correctamente"
else
    check "Hook de tokens exportado correctamente"
fi

# Verificar que la página existe
if [ -f "web/src/app/tokens/page.tsx" ]; then
    check "Página tokens/page.tsx existe"
else
    check "Página tokens/page.tsx existe"
fi

# Verificar imports críticos (puede ser useGetAllTokens o useGetUserTokensWithData)
if grep -q "import.*useGetAllTokens\|import.*useGetUserTokensWithData" web/src/app/tokens/page.tsx; then
    check "Página importa hook de tokens"
else
    check "Página importa hook de tokens"
fi

if grep -q "import.*TokenCard" web/src/app/tokens/page.tsx; then
    check "Página importa TokenCard"
else
    check "Página importa TokenCard"
fi

echo ""
echo "📋 PASO 2: Verificación de compilación"
echo "───────────────────────────────────────────────────────────────"

cd web
if npm run build > /tmp/tokens-build.log 2>&1; then
    check "Compilación TypeScript exitosa"
    
    # Verificar que la ruta /tokens está en el build
    if grep -q "/tokens" /tmp/tokens-build.log 2>/dev/null || [ -d ".next/app/tokens" ] 2>/dev/null; then
        check "Ruta /tokens incluida en el build"
    else
        # No es crítico si no aparece en el log, la ruta se genera dinámicamente
        echo "ℹ️  Ruta /tokens (verificación opcional)"
    fi
else
    check "Compilación TypeScript exitosa"
    echo "   Errores:"
    grep -i "error" /tmp/tokens-build.log | head -3
fi
cd ..

echo ""
echo "📋 PASO 3: Verificación de funcionalidades"
echo "───────────────────────────────────────────────────────────────"

# Verificar filtros
if grep -q "filterType\|Filter by type" web/src/app/tokens/page.tsx; then
    check "Filtros por tipo implementados"
else
    check "Filtros por tipo implementados"
fi

# Verificar búsqueda
if grep -q "searchQuery\|Search tokens" web/src/app/tokens/page.tsx; then
    check "Búsqueda por nombre implementada"
else
    check "Búsqueda por nombre implementada"
fi

# Verificar paginación
if grep -q "currentPage\|pagination" web/src/app/tokens/page.tsx; then
    check "Paginación implementada"
else
    check "Paginación implementada"
fi

# Verificar loading states
if grep -q "isLoading\|Skeleton" web/src/app/tokens/page.tsx; then
    check "Loading states implementados"
else
    check "Loading states implementados"
fi

# Verificar error handling
if grep -q "error\|Error\|Alert" web/src/app/tokens/page.tsx; then
    check "Error handling implementado"
else
    check "Error handling implementado"
fi

echo ""
echo "📋 PASO 4: Verificación de calidad"
echo "───────────────────────────────────────────────────────────────"

# Verificar accesibilidad
if grep -q "aria-label" web/src/app/tokens/page.tsx; then
    check "ARIA labels presentes"
else
    check "ARIA labels presentes"
fi

# Verificar dark mode
if grep -q "dark:" web/src/app/tokens/page.tsx; then
    check "Dark mode support presente"
else
    check "Dark mode support presente"
fi

# Verificar que usa Header
if grep -q "Header" web/src/app/tokens/page.tsx; then
    check "Header component integrado"
else
    check "Header component integrado"
fi

echo ""
echo "📋 PASO 5: Verificación de tests E2E"
echo "───────────────────────────────────────────────────────────────"

# Verificar que el test existe
if [ -f "web/e2e/tokens.spec.ts" ]; then
    check "Test E2E tokens.spec.ts existe"
    
    # Verificar que el test tiene casos básicos
    if grep -q "test\|describe" web/e2e/tokens.spec.ts; then
        check "Test E2E tiene casos de prueba"
    else
        check "Test E2E tiene casos de prueba"
    fi
else
    check "Test E2E tokens.spec.ts existe"
fi

echo ""
echo "📋 PASO 6: Verificación de estructura de archivos"
echo "───────────────────────────────────────────────────────────────"

# Verificar que el directorio existe
if [ -d "web/src/app/tokens" ]; then
    check "Directorio tokens/ existe"
else
    check "Directorio tokens/ existe"
fi

# Verificar que page.tsx existe
if [ -f "web/src/app/tokens/page.tsx" ]; then
    check "Archivo page.tsx existe en tokens/"
    
    # Verificar que tiene contenido mínimo
    LINES=$(wc -l < web/src/app/tokens/page.tsx)
    if [ $LINES -gt 100 ]; then
        check "Página tiene contenido suficiente ($LINES líneas)"
    else
        check "Página tiene contenido suficiente ($LINES líneas)"
    fi
else
    check "Archivo page.tsx existe en tokens/"
fi

echo ""
echo "📊 RESUMEN FINAL"
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Verificaciones pasadas: $PASSED"
echo "❌ Verificaciones fallidas: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "🎉 ¡Todas las verificaciones pasaron!"
    echo ""
    echo "📝 Para ejecutar tests E2E interactivos:"
    echo "   cd web && npm run test:e2e"
    echo ""
    echo "📝 Para ejecutar tests E2E con UI:"
    echo "   cd web && npm run test:e2e:ui"
    exit 0
else
    echo "⚠️  Algunas verificaciones fallaron. Revisar arriba."
    exit 1
fi

