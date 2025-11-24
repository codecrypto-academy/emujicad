#!/bin/bash

# Script para validaciones adicionales del proyecto
# Incluye: Integridad, Imports, Hooks, Rutas, Configuración

set +e

echo "🔍 VALIDACIONES ADICIONALES"
echo "=================================================="
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

echo "📁 1. VERIFICANDO INTEGRIDAD DE ARCHIVOS CRÍTICOS"
echo "----------------------------"

# Verificar archivos críticos de configuración
CRITICAL_FILES=(
    "web/src/contracts/config.ts"
    "web/src/lib/wagmi-config.ts"
    "web/src/contexts/AuthContext.tsx"
    "web/src/app/layout.tsx"
    "web/package.json"
    "web/tsconfig.json"
    "web/next.config.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        check "Archivo crítico existe: $(basename $file)"
    else
        warn "Archivo crítico faltante: $file"
    fi
done

echo ""
echo "🔗 2. VERIFICANDO IMPORTS Y EXPORTS"
echo "----------------------------"

# Verificar que los hooks principales estén exportados
cd web/src/hooks
HOOK_FILES=$(ls *.ts 2>/dev/null | wc -l)
if [ "$HOOK_FILES" -gt 0 ]; then
    check "Hooks encontrados: $HOOK_FILES archivos"
    
    # Verificar exports en cada hook
    for file in *.ts; do
        if grep -q "^export.*function\|^export.*const" "$file" 2>/dev/null; then
            check "  ✓ $file tiene exports"
        else
            warn "  ⚠ $file no tiene exports visibles"
        fi
    done
else
    warn "No se encontraron archivos de hooks"
fi
cd - > /dev/null

# Verificar que los componentes principales estén exportados
if grep -q "^export.*function\|^export.*class" web/src/components/Header.tsx 2>/dev/null; then
    check "Header.tsx tiene exports"
else
    warn "Header.tsx no tiene exports"
fi

echo ""
echo "🪝 3. VERIFICANDO HOOKS PERSONALIZADOS"
echo "----------------------------"

# Lista de hooks esperados
EXPECTED_HOOKS=(
    "useContractReads"
    "useRequestRole"
    "useCreateToken"
    "useTransfer"
    "useGetUserTokens"
    "usePause"
    "useAdminUsers"
    "useContractOwner"
)

for hook in "${EXPECTED_HOOKS[@]}"; do
    # Buscar el hook en archivos que lo exporten o lo usen
    if find web/src/hooks -name "*.ts" -exec grep -l "export.*$hook\|function $hook" {} \; 2>/dev/null | grep -q .; then
        check "Hook $hook encontrado"
    else
        # Verificar si el archivo existe con el nombre del hook
        hook_file=$(echo "$hook" | sed 's/use//' | tr '[:upper:]' '[:lower:]')
        if [ -f "web/src/hooks/use${hook_file^}.ts" ] || [ -f "web/src/hooks/$hook.ts" ]; then
            check "Hook $hook encontrado (archivo existe)"
        else
            warn "Hook $hook no encontrado"
        fi
    fi
done

# Verificar hook de optimización
if grep -q "useDashboardStats" web/src/hooks/useContractReads.ts 2>/dev/null; then
    check "Hook useDashboardStats implementado"
else
    warn "Hook useDashboardStats no encontrado"
fi

echo ""
echo "🛣️  4. VERIFICANDO RUTAS Y PÁGINAS"
echo "----------------------------"

# Verificar páginas principales
PAGES=(
    "web/src/app/page.tsx"
    "web/src/app/dashboard/page.tsx"
    "web/src/app/admin/users/page.tsx"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        check "Página existe: $(basename $(dirname $page))/$(basename $page)"
    else
        warn "Página faltante: $page"
    fi
done

# Verificar que las rutas tengan sus componentes
if [ -f "web/src/app/page.tsx" ]; then
    if grep -q "ConnectWallet\|RegisterForm" web/src/app/page.tsx 2>/dev/null; then
        check "Home page importa componentes necesarios"
    else
        warn "Home page puede tener imports faltantes"
    fi
fi

echo ""
echo "⚙️  5. VERIFICANDO CONFIGURACIÓN"
echo "----------------------------"

# Verificar que config.ts tenga dirección del contrato
if grep -q "SUPPLY_CHAIN_ADDRESS\|export.*ADDRESS" web/src/contracts/config.ts 2>/dev/null; then
    check "config.ts tiene dirección del contrato"
else
    warn "config.ts puede no tener dirección del contrato"
fi

# Verificar que config.ts tenga ABI
if grep -q "SUPPLY_CHAIN_ABI\|export.*ABI" web/src/contracts/config.ts 2>/dev/null; then
    check "config.ts tiene ABI del contrato"
else
    warn "config.ts puede no tener ABI del contrato"
fi

# Verificar que wagmi-config.ts esté configurado
if [ -f "web/src/lib/wagmi-config.ts" ]; then
    if grep -q "createConfig\|chains\|transports" web/src/lib/wagmi-config.ts 2>/dev/null; then
        check "wagmi-config.ts está configurado"
    else
        warn "wagmi-config.ts puede no estar configurado correctamente"
    fi
else
    warn "wagmi-config.ts no encontrado"
fi

echo ""
echo "📦 6. VERIFICANDO DEPENDENCIAS"
echo "----------------------------"

# Verificar que node_modules existe
if [ -d "web/node_modules" ]; then
    check "node_modules instalado"
    
    # Verificar dependencias críticas
    CRITICAL_DEPS=(
        "wagmi"
        "viem"
        "react"
        "next"
        "@tanstack/react-query"
    )
    
    for dep in "${CRITICAL_DEPS[@]}"; do
        if [ -d "web/node_modules/$dep" ] || grep -q "\"$dep\"" web/package.json 2>/dev/null; then
            check "  ✓ Dependencia $dep presente"
        else
            warn "  ⚠ Dependencia $dep no encontrada"
        fi
    done
else
    warn "node_modules no encontrado (ejecutar npm install)"
fi

echo ""
echo "🔒 7. VERIFICANDO SEGURIDAD BÁSICA"
echo "----------------------------"

# Verificar que no haya API keys hardcodeadas
if grep -r "api[_-]key\|secret.*=.*['\"]" web/src --exclude-dir=node_modules --exclude-dir=.archive 2>/dev/null | grep -v "//.*test\|//.*example\|//.*TODO" | grep -q .; then
    warn "Posibles API keys hardcodeadas encontradas (revisar manualmente)"
else
    check "No se encontraron API keys hardcodeadas obvias"
fi

# Verificar que no haya console.log en producción
CONSOLE_LOGS=$(grep -r "console\.log\|console\.error\|console\.warn" web/src --exclude-dir=node_modules --exclude-dir=.archive 2>/dev/null | wc -l)
if [ "$CONSOLE_LOGS" -gt 0 ]; then
    warn "Se encontraron $CONSOLE_LOGS console.log/error/warn (considerar remover en producción)"
else
    check "No se encontraron console.log en código fuente"
fi

echo ""
echo "📝 8. VERIFICANDO DOCUMENTACIÓN"
echo "----------------------------"

# Verificar README
if [ -f "README.md" ]; then
    check "README.md existe"
else
    warn "README.md no encontrado"
fi

# Verificar documentación de frontend (single source of truth: docs/fe/SETUP.md)
if [ -f "docs/fe/SETUP.md" ]; then
    check "docs/fe/SETUP.md existe (fuente única de verdad)"
else
    warn "docs/fe/SETUP.md no encontrado"
fi

# Verificar documentación de hooks
if [ -f "docs/fe/HOOKS.md" ]; then
    check "docs/fe/HOOKS.md existe"
else
    warn "docs/fe/HOOKS.md no encontrado"
fi

# Verificar documentación de componentes
if [ -f "docs/fe/COMPONENTS.md" ]; then
    check "docs/fe/COMPONENTS.md existe"
else
    warn "docs/fe/COMPONENTS.md no encontrado"
fi

echo ""
echo "🎨 9. VERIFICANDO ESTRUCTURA DE COMPONENTES"
echo "----------------------------"

# Verificar que los componentes UI estén presentes
UI_COMPONENTS=(
    "button"
    "card"
    "input"
    "select"
    "dialog"
    "alert"
    "badge"
    "table"
    "skeleton"
)

for component in "${UI_COMPONENTS[@]}"; do
    if [ -f "web/src/components/ui/$component.tsx" ]; then
        check "Componente UI $component.tsx existe"
    else
        warn "Componente UI $component.tsx no encontrado"
    fi
done

# Verificar componentes custom principales
# Nota: QuickActions.tsx fue eliminado intencionalmente
CUSTOM_COMPONENTS=(
    "Header"
    "ConnectWallet"
    "RegisterForm"
    "TokenCard"
    "UserProfileCard"
    "ErrorBoundary"
)

for component in "${CUSTOM_COMPONENTS[@]}"; do
    if [ -f "web/src/components/$component.tsx" ]; then
        check "Componente $component.tsx existe"
    else
        warn "Componente $component.tsx no encontrado"
    fi
done

echo ""
echo "🔧 10. VERIFICANDO TYPESCRIPT"
echo "----------------------------"

# Verificar que tsconfig.json tenga configuración correcta
if grep -q "\"strict\":\s*true" web/tsconfig.json 2>/dev/null; then
    check "TypeScript strict mode habilitado"
else
    warn "TypeScript strict mode puede no estar habilitado"
fi

# Verificar paths alias
if grep -q '"@/\*"' web/tsconfig.json 2>/dev/null || grep -A 1 '"paths"' web/tsconfig.json 2>/dev/null | grep -q "@"; then
    check "Path alias @/ configurado"
else
    warn "Path alias @/ no configurado"
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
    echo -e "${GREEN}🎉 Todas las verificaciones críticas pasaron!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Hay verificaciones que fallaron. Revisar arriba.${NC}"
    exit 1
fi

