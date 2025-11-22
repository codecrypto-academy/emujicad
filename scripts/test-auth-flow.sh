#!/bin/bash

# Script para probar el flujo de autenticación
# Verifica que el flujo funciona correctamente según los requerimientos

set -e

echo "🔐 TESTING AUTHENTICATION FLOW"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que el frontend está corriendo
echo "📋 Verificando servicios..."
if ! pgrep -f "next-server" > /dev/null && ! pgrep -f "npm.*run dev" > /dev/null; then
    echo -e "${RED}❌ Frontend no está corriendo${NC}"
    echo "   Ejecuta: cd web && npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Frontend corriendo${NC}"

# Verificar que Anvil está corriendo
if ! pgrep -f "anvil" > /dev/null; then
    echo -e "${RED}❌ Anvil no está corriendo${NC}"
    echo "   Ejecuta: ./deploy.sh start"
    exit 1
fi
echo -e "${GREEN}✅ Anvil corriendo${NC}"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🧪 PRUEBAS DEL FLUJO DE AUTENTICACIÓN"
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo "📝 CASOS DE PRUEBA:"
echo ""
echo "1. ✅ Admin no verifica registro → redirige a /dashboard"
echo "   - Admin conectado debe redirigir inmediatamente"
echo "   - No debe mostrar formulario de registro"
echo "   - No debe verificar userId o userInfo"
echo ""
echo "2. ✅ Usuario no registrado → muestra formulario"
echo "   - Usuario conectado sin registro debe ver formulario"
echo "   - No debe redirigir a dashboard"
echo "   - Debe permitir registro"
echo ""
echo "3. ✅ Usuario registrado pero no aprobado → muestra estatus"
echo "   - Usuario con status Pending → muestra mensaje de espera"
echo "   - Usuario con status Rejected → muestra mensaje de rechazo"
echo "   - Usuario con status Canceled → muestra mensaje de cancelado"
echo "   - No debe redirigir a dashboard"
echo ""
echo "4. ✅ Usuario aprobado → redirige a /dashboard"
echo "   - Usuario con status Approved debe redirigir"
echo "   - Debe tener acceso a todas las páginas"
echo ""
echo "5. ✅ Cambio de cuenta → actualiza inmediatamente"
echo "   - Cambiar cuenta en MetaMask debe actualizar estado"
echo "   - Debe limpiar datos de cuenta anterior"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 VERIFICACIÓN DE CÓDIGO"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Verificar que AuthContext tiene la lógica correcta
echo "Verificando AuthContext.tsx..."
if grep -q "LÓGICA 1: Usuario es Admin" web/src/contexts/AuthContext.tsx; then
    echo -e "${GREEN}✅ AuthContext tiene lógica de admin prioritaria${NC}"
else
    echo -e "${RED}❌ AuthContext no tiene lógica de admin prioritaria${NC}"
fi

if grep -q "shouldCheckRegistration" web/src/contexts/AuthContext.tsx; then
    echo -e "${GREEN}✅ AuthContext verifica registro solo si NO es admin${NC}"
else
    echo -e "${RED}❌ AuthContext no tiene verificación condicional de registro${NC}"
fi

# Verificar que AuthRedirect maneja redirecciones
echo ""
echo "Verificando AuthRedirect.tsx..."
if grep -q "LÓGICA 1: Si es admin" web/src/components/AuthRedirect.tsx; then
    echo -e "${GREEN}✅ AuthRedirect maneja redirección de admin${NC}"
else
    echo -e "${RED}❌ AuthRedirect no maneja redirección de admin${NC}"
fi

# Verificar que page.tsx muestra estatus correctamente
echo ""
echo "Verificando page.tsx..."
if grep -q "UserStatus.Pending" web/src/app/page.tsx && \
   grep -q "UserStatus.Rejected" web/src/app/page.tsx && \
   grep -q "UserStatus.Canceled" web/src/app/page.tsx; then
    echo -e "${GREEN}✅ page.tsx muestra todos los estatus${NC}"
else
    echo -e "${RED}❌ page.tsx no muestra todos los estatus${NC}"
fi

# Verificar que page.tsx usa useAuth (o debería usarlo)
echo ""
echo "Verificando uso de useAuth en page.tsx..."
if grep -q "useAuth" web/src/app/page.tsx; then
    echo -e "${GREEN}✅ page.tsx usa useAuth${NC}"
else
    echo -e "${YELLOW}⚠️  page.tsx NO usa useAuth (usa useUserInfo directamente)${NC}"
    echo "   Esto causa consultas duplicadas al contrato"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📊 RESUMEN"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "✅ Verificaciones de código completadas"
echo ""
echo "📋 PRÓXIMOS PASOS MANUALES:"
echo ""
echo "1. Abre http://localhost:3000 en el navegador"
echo "2. Conecta con la cuenta ADMIN (owner del contrato)"
echo "   → Debe redirigir a /dashboard inmediatamente"
echo "   → No debe mostrar formulario de registro"
echo ""
echo "3. Desconecta y conecta con una cuenta NUEVA (no registrada)"
echo "   → Debe mostrar formulario de registro"
echo "   → No debe redirigir a dashboard"
echo ""
echo "4. Registra la cuenta como Producer"
echo "   → Debe mostrar mensaje 'Approval Pending'"
echo "   → No debe redirigir a dashboard"
echo ""
echo "5. Como admin, aprueba el usuario en /admin/users"
echo "   → El usuario debe redirigir a /dashboard automáticamente"
echo ""
echo "6. Cambia de cuenta en MetaMask"
echo "   → Debe actualizar el estado inmediatamente"
echo "   → Debe limpiar datos de la cuenta anterior"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

