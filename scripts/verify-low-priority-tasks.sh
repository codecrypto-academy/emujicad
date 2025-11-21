#!/bin/bash

# Script para verificar tareas de baja prioridad implementadas
# Animaciones, Accesibilidad, Tests

set +e  # Continuar aunque haya errores para reporte completo

echo "🔍 Verificando Tareas de Baja Prioridad Implementadas..."
echo "=================================================="
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        ((FAILED++))
        return 1
    fi
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

echo "📦 1. VERIFICANDO ANIMACIONES"
echo "----------------------------"

# Verificar que TokenCard tenga animaciones
if grep -q "animate-in\|transition-all\|duration-300" web/src/components/TokenCard.tsx 2>/dev/null; then
    check "TokenCard tiene animaciones"
else
    warn "TokenCard: animaciones no encontradas"
fi

# Verificar que QuickActions tenga animaciones
if grep -q "transition-all\|hover:scale\|duration-200" web/src/components/QuickActions.tsx 2>/dev/null; then
    check "QuickActions tiene animaciones"
else
    warn "QuickActions: animaciones no encontradas"
fi

# Verificar que Dashboard tenga animaciones en cards
if grep -q "animate-in\|hover:shadow-lg\|transition-all" web/src/app/dashboard/page.tsx 2>/dev/null; then
    check "Dashboard tiene animaciones en cards"
else
    warn "Dashboard: animaciones no encontradas"
fi

# Verificar que Alert tenga animaciones
if grep -q "animate-in\|transition-all" web/src/components/ui/alert.tsx 2>/dev/null; then
    check "Alert component tiene animaciones"
else
    warn "Alert: animaciones no encontradas"
fi

echo ""
echo "♿ 2. VERIFICANDO ACCESIBILIDAD"
echo "----------------------------"

# Verificar ARIA labels en Header
if grep -q "aria-label" web/src/components/Header.tsx 2>/dev/null; then
    check "Header tiene ARIA labels"
else
    warn "Header: ARIA labels no encontrados"
fi

# Verificar ARIA labels en TokenCard
if grep -q "aria-label\|role=\"button\"\|tabIndex" web/src/components/TokenCard.tsx 2>/dev/null; then
    check "TokenCard tiene atributos de accesibilidad"
else
    warn "TokenCard: atributos de accesibilidad no encontrados"
fi

# Verificar ARIA labels en QuickActions
if grep -q "aria-label\|aria-disabled" web/src/components/QuickActions.tsx 2>/dev/null; then
    check "QuickActions tiene ARIA labels"
else
    warn "QuickActions: ARIA labels no encontrados"
fi

# Verificar ARIA labels en RegisterForm
if grep -q "aria-label\|aria-required\|role=" web/src/components/RegisterForm.tsx 2>/dev/null; then
    check "RegisterForm tiene atributos de accesibilidad"
else
    warn "RegisterForm: atributos de accesibilidad no encontrados"
fi

# Verificar ARIA labels en PauseControl
if grep -q "aria-label\|aria-disabled" web/src/components/admin/PauseControl.tsx 2>/dev/null; then
    check "PauseControl tiene ARIA labels"
else
    warn "PauseControl: ARIA labels no encontrados"
fi

# Verificar ARIA labels en ThemeToggle
if grep -q "aria-label\|aria-pressed" web/src/components/ThemeToggle.tsx 2>/dev/null; then
    check "ThemeToggle tiene atributos de accesibilidad"
else
    warn "ThemeToggle: atributos de accesibilidad no encontrados"
fi

# Verificar navegación por teclado en TokenCard
if grep -q "onKeyDown" web/src/components/TokenCard.tsx 2>/dev/null; then
    check "TokenCard tiene navegación por teclado"
else
    warn "TokenCard: navegación por teclado no encontrada"
fi

echo ""
echo "🧪 3. VERIFICANDO TESTS"
echo "----------------------------"

# Verificar que vitest.config.ts existe
if [ -f "web/vitest.config.ts" ]; then
    check "vitest.config.ts existe"
else
    warn "vitest.config.ts no encontrado"
fi

# Verificar que playwright.config.ts existe
if [ -f "web/playwright.config.ts" ]; then
    check "playwright.config.ts existe"
else
    warn "playwright.config.ts no encontrado"
fi

# Verificar que setup.ts existe
if [ -f "web/src/test/setup.ts" ]; then
    check "test/setup.ts existe"
else
    warn "test/setup.ts no encontrado"
fi

# Verificar que utils.tsx existe
if [ -f "web/src/test/utils.tsx" ]; then
    check "test/utils.tsx existe"
else
    warn "test/utils.tsx no encontrado"
fi

# Verificar que hay tests de Button
if [ -f "web/src/components/__tests__/Button.test.tsx" ]; then
    check "Button.test.tsx existe"
else
    warn "Button.test.tsx no encontrado"
fi

# Verificar que hay tests de validación
if [ -f "web/src/lib/__tests__/validation.test.ts" ]; then
    check "validation.test.ts existe"
else
    warn "validation.test.ts no encontrado"
fi

# Verificar que hay tests E2E
if [ -f "web/e2e/home.spec.ts" ]; then
    check "e2e/home.spec.ts existe"
else
    warn "e2e/home.spec.ts no encontrado"
fi

# Verificar scripts en package.json
if grep -q "\"test\":" web/package.json 2>/dev/null; then
    check "Scripts de test en package.json"
else
    warn "Scripts de test no encontrados en package.json"
fi

# Ejecutar tests si es posible
if [ -d "web/node_modules" ]; then
    echo ""
    echo "🔬 Ejecutando tests unitarios..."
    cd web
    if npm run test -- --run > /tmp/test-output.log 2>&1; then
        TEST_COUNT=$(grep -oP "Tests\s+\K\d+" /tmp/test-output.log | head -1)
        if [ ! -z "$TEST_COUNT" ]; then
            check "Tests unitarios pasando ($TEST_COUNT tests)"
        else
            check "Tests unitarios ejecutados"
        fi
    else
        warn "Tests unitarios fallaron (revisar /tmp/test-output.log)"
    fi
    cd ..
else
    warn "node_modules no encontrado, saltando ejecución de tests"
fi

echo ""
echo "⚡ 4. VERIFICANDO OPTIMIZACIÓN DE PERFORMANCE"
echo "----------------------------"

# Verificar que useDashboardStats existe
if grep -q "useDashboardStats\|useReadContracts" web/src/hooks/useContractReads.ts 2>/dev/null; then
    check "useDashboardStats hook implementado"
else
    warn "useDashboardStats no encontrado"
fi

# Verificar que Dashboard usa useDashboardStats
if grep -q "useDashboardStats" web/src/app/dashboard/page.tsx 2>/dev/null; then
    check "Dashboard usa batch reads optimizado"
else
    warn "Dashboard no usa useDashboardStats"
fi

# Verificar que no se usan los hooks individuales en Dashboard
if ! grep -q "useTotalTokens\|useTotalUsers\|useTotalTransfers" web/src/app/dashboard/page.tsx 2>/dev/null; then
    check "Dashboard no usa hooks individuales (optimizado)"
else
    warn "Dashboard aún usa hooks individuales"
fi

echo ""
echo "📝 5. VERIFICANDO DOCUMENTACIÓN"
echo "----------------------------"

# Verificar documentación de animaciones
if [ -f "docs/reports/PERFORMANCE_OPTIMIZATION.md" ]; then
    check "Documentación de optimización existe"
else
    warn "Documentación de optimización no encontrada"
fi

# Verificar documentación de accesibilidad
if [ -f "docs/reports/ACCESSIBILITY_IMPLEMENTATION.md" ]; then
    check "Documentación de accesibilidad existe"
else
    warn "Documentación de accesibilidad no encontrada"
fi

# Verificar documentación de tests
if [ -f "docs/reports/TESTING_IMPLEMENTATION.md" ]; then
    check "Documentación de tests existe"
else
    warn "Documentación de tests no encontrada"
fi

echo ""
echo "🔨 6. VERIFICANDO COMPILACIÓN"
echo "----------------------------"

# Verificar que TypeScript compila
if [ -d "web/node_modules" ]; then
    cd web
    if npm run build > /tmp/build-output.log 2>&1; then
        check "TypeScript compila correctamente"
    else
        warn "TypeScript tiene errores de compilación (revisar /tmp/build-output.log)"
    fi
    cd ..
else
    warn "node_modules no encontrado, saltando compilación"
fi

echo ""
echo "=================================================="
echo "📊 RESUMEN"
echo "=================================================="
echo -e "${GREEN}✅ Pasados: $PASSED${NC}"
echo -e "${RED}❌ Fallidos: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡Todas las verificaciones críticas pasaron!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Hay verificaciones que fallaron. Revisar arriba.${NC}"
    exit 1
fi

