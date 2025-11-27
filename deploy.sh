#!/bin/bash

################################################################################
# Supply Chain Tracker - Deployment Automation Script
################################################################################
# 
# Descripción: Script para automatizar deployment de Anvil + Smart Contract + Frontend
# Autor: Supply Chain Tracker Team
# Fecha: 18 Noviembre 2025
# Última actualización: 27 de Noviembre, 2025
# Versión: 2.1.0
#
# Funcionalidades:
#   - Iniciar/detener Anvil (blockchain local con persistencia de estado)
#   - Desplegar smart contract automáticamente
#   - Actualizar dirección del contrato y ABI en frontend
#   - Iniciar/detener servidor Next.js
#   - Gestión independiente del frontend (sin afectar Anvil/Contrato)
#   - Limpieza de estado persistente de Anvil
#   - Validar estados de servicios
#   - Instrucciones para MetaMask
#   - Detección inteligente de procesos en ejecución
#   - Logs organizados en directorio logs/
#
# Uso:
#   ./deploy.sh start           - Inicia todo el stack (Anvil + Contrato + Frontend)
#   ./deploy.sh stop            - Detiene todos los servicios
#   ./deploy.sh restart         - Reinicia todo el stack
#   ./deploy.sh status          - Muestra estado de servicios
#   ./deploy.sh metamask        - Muestra instrucciones para configurar MetaMask
#   ./deploy.sh clean           - Limpia estado persistente de Anvil
#   ./deploy.sh frontend start  - Inicia solo el frontend
#   ./deploy.sh frontend stop   - Detiene solo el frontend
#   ./deploy.sh frontend restart - Reinicia solo el frontend
#   ./deploy.sh help            - Muestra ayuda completa
#
################################################################################

set -e  # Exit on error

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorios del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SC_DIR="$PROJECT_ROOT/sc"
WEB_DIR="$PROJECT_ROOT/web"
LOGS_DIR="$PROJECT_ROOT/logs"

# Archivos de proceso
ANVIL_PID_FILE="$LOGS_DIR/anvil.pid"
FRONTEND_PID_FILE="$LOGS_DIR/frontend.pid"
ANVIL_LOG_FILE="$LOGS_DIR/anvil.log"
FRONTEND_LOG_FILE="$LOGS_DIR/frontend.log"
DEPLOY_LOG_FILE="$LOGS_DIR/deploy.log"
ANVIL_STATE_FILE="$LOGS_DIR/anvil_state.json"

# Configuración de red
ANVIL_PORT=8545
ANVIL_CHAIN_ID=31337
ANVIL_HOST="127.0.0.1"
FRONTEND_PORT=3000

# Cuenta de Anvil (Account #0)
DEPLOYER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
DEPLOYER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Archivos de configuración del frontend
CONFIG_FILE="$WEB_DIR/src/contracts/config.ts"
ABI_FILE="$WEB_DIR/src/contracts/SupplyChain.json"
ABI_SOURCE="$SC_DIR/out/SupplyChain.sol/SupplyChain.json"

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

# Función para imprimir mensajes con color
print_header() {
    echo -e "\n${CYAN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_step() {
    echo -e "${MAGENTA}➜${NC} $1"
}

# Función para crear directorio de logs si no existe
ensure_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        mkdir -p "$LOGS_DIR"
        print_success "Directorio de logs creado: $LOGS_DIR"
    fi
}

# ============================================================================
# FUNCIÓN: DETECTAR DISTRIBUCIÓN LINUX
# ============================================================================

detect_linux_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    elif [ -f /etc/lsb-release ]; then
        . /etc/lsb-release
        echo "$DISTRIB_ID" | tr '[:upper:]' '[:lower:]'
    elif [ -f /etc/debian_version ]; then
        echo "debian"
    elif [ -f /etc/redhat-release ]; then
        echo "rhel"
    else
        echo "unknown"
    fi
}

# ============================================================================
# FUNCIÓN: VERIFICAR HERRAMIENTAS DEL SISTEMA
# ============================================================================

check_system_tools() {
    local missing_tools=()
    local tools=("lsof" "netstat" "ss" "curl" "pgrep")
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" >/dev/null 2>&1; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -eq 0 ]; then
        return 0
    else
        echo "${missing_tools[@]}"
        return 1
    fi
}

# ============================================================================
# FUNCIÓN: INSTALAR HERRAMIENTAS FALTANTES
# ============================================================================

install_system_tools() {
    local tools=("$@")
    local auto_install=false
    
    # Verificar si se debe instalar automáticamente
    if [ "${AUTO_INSTALL:-false}" = "true" ]; then
        auto_install=true
    fi
    
    local distro=$(detect_linux_distro)
    local install_cmd=""
    local packages=()
    
    case "$distro" in
        ubuntu|debian)
            install_cmd="sudo apt-get update && sudo apt-get install -y"
            ;;
        fedora|rhel|centos)
            install_cmd="sudo dnf install -y"
            ;;
        arch|manjaro)
            install_cmd="sudo pacman -S --noconfirm"
            ;;
        opensuse*)
            install_cmd="sudo zypper install -y"
            ;;
        *)
            print_error "Distribución Linux no reconocida: $distro"
            print_info "Por favor instala manualmente: ${tools[*]}"
            return 1
            ;;
    esac
    
    # Mapear herramientas a nombres de paquetes
    for tool in "${tools[@]}"; do
        case "$tool" in
            lsof) packages+=("lsof") ;;
            netstat) packages+=("net-tools") ;;
            ss) packages+=("iproute2") ;;
            curl) packages+=("curl") ;;
            pgrep) 
                if [[ "$distro" == "arch" || "$distro" == "manjaro" ]]; then
                    packages+=("procps-ng")
                else
                    packages+=("procps")
                fi
                ;;
        esac
    done
    
    # Eliminar duplicados
    local unique_packages=($(printf "%s\n" "${packages[@]}" | sort -u))
    
    print_warning "Faltan las siguientes herramientas: ${tools[*]}"
    print_info "Se intentará instalar usando: $install_cmd"
    print_info "Paquetes a instalar: ${unique_packages[*]}"
    
    if [ "$auto_install" = false ]; then
        echo ""
        read -p "¿Deseas instalar estas herramientas ahora? (s/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            print_warning "Instalación cancelada. Por favor instala manualmente: ${tools[*]}"
            return 1
        fi
    else
        print_info "Modo automático: instalando herramientas sin confirmación..."
    fi
    
    print_step "Instalando herramientas del sistema..."
    
    # Registrar en log
    ensure_logs_dir
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Instalando herramientas del sistema: ${unique_packages[*]}" >> "$LOGS_DIR/install.log" 2>&1
    
    if eval "$install_cmd ${unique_packages[*]}" >> "$LOGS_DIR/install.log" 2>&1; then
        print_success "Herramientas instaladas correctamente"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Herramientas instaladas exitosamente" >> "$LOGS_DIR/install.log" 2>&1
        return 0
    else
        print_error "Error al instalar herramientas"
        print_info "Ver logs en: $LOGS_DIR/install.log"
        print_info "Puedes instalar manualmente: ${unique_packages[*]}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Fallo al instalar herramientas" >> "$LOGS_DIR/install.log" 2>&1
        return 1
    fi
}

# ============================================================================
# FUNCIÓN: VERIFICAR DEPENDENCIAS DEL PROYECTO
# ============================================================================

check_project_dependencies() {
    local missing_deps=()
    
    # Verificar dependencias del frontend
    if [ ! -d "$WEB_DIR/node_modules" ]; then
        missing_deps+=("frontend")
    fi
    
    # Verificar dependencias del smart contract
    # Verificar que lib/ existe Y que forge-std está dentro
    if [ ! -d "$SC_DIR/lib" ] || [ ! -d "$SC_DIR/lib/forge-std" ]; then
        missing_deps+=("smart-contract")
    fi
    
    if [ ${#missing_deps[@]} -eq 0 ]; then
        return 0
    else
        echo "${missing_deps[@]}"
        return 1
    fi
}

# ============================================================================
# FUNCIÓN: INSTALAR DEPENDENCIAS DEL PROYECTO
# ============================================================================

install_project_dependencies() {
    local deps=("$@")
    local auto_install=false
    
    # Verificar si se debe instalar automáticamente
    if [ "${AUTO_INSTALL:-false}" = "true" ]; then
        auto_install=true
    fi
    
    for dep in "${deps[@]}"; do
        case "$dep" in
            frontend)
                # Verificar que npm está disponible
                if ! command -v npm >/dev/null 2>&1; then
                    print_error "npm no está instalado. No se pueden instalar dependencias del frontend."
                    print_info "Instala Node.js y npm primero."
                    return 1
                fi
                
                print_step "Instalando dependencias del frontend..."
                print_info "Esto puede tardar varios minutos..."
                
                cd "$WEB_DIR"
                
                # Registrar inicio en log
                ensure_logs_dir
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando instalación de dependencias del frontend..." >> "$LOGS_DIR/install.log" 2>&1
                
                # Instalar con timeout (30 minutos = 1800 segundos)
                if timeout 1800 npm install --progress=true 2>&1 | tee -a "$LOGS_DIR/install.log" | while IFS= read -r line; do
                    # Mostrar progreso en tiempo real
                    if [[ "$line" =~ (^[0-9]+/[0-9]+|^added|^removed|^changed|^audited) ]]; then
                        echo -ne "\r${BLUE}ℹ${NC} $line"
                    fi
                done; then
                    echo "" # Nueva línea después del progreso
                    print_success "Dependencias del frontend instaladas"
                    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dependencias del frontend instaladas exitosamente" >> "$LOGS_DIR/install.log" 2>&1
                else
                    local exit_code=${PIPESTATUS[0]}
                    echo "" # Nueva línea
                    if [ $exit_code -eq 124 ]; then
                        print_error "Timeout: La instalación de dependencias del frontend excedió 30 minutos"
                    else
                        print_error "Error al instalar dependencias del frontend"
                    fi
                    print_info "Ver logs en: $LOGS_DIR/install.log"
                    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Fallo al instalar dependencias del frontend (código: $exit_code)" >> "$LOGS_DIR/install.log" 2>&1
                    cd "$PROJECT_ROOT"
                    return 1
                fi
                cd "$PROJECT_ROOT"
                ;;
            smart-contract)
                # Verificar que forge está disponible
                if ! command -v forge >/dev/null 2>&1; then
                    print_error "forge no está instalado. No se pueden instalar dependencias del smart contract."
                    print_info "Instala Foundry primero: curl -L https://foundry.paradigm.xyz | bash && foundryup"
                    return 1
                fi
                
                print_step "Instalando dependencias del smart contract..."
                print_info "Instalando forge-std y otras dependencias..."
                
                cd "$SC_DIR"
                
                # Registrar inicio en log
                ensure_logs_dir
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] Iniciando instalación de dependencias del smart contract..." >> "$LOGS_DIR/install.log" 2>&1
                
                # Instalar con timeout (10 minutos = 600 segundos)
                if timeout 600 forge install 2>&1 | tee -a "$LOGS_DIR/install.log" | while IFS= read -r line; do
                    # Mostrar progreso
                    if [[ "$line" =~ (Installing|Installed|Cloning|Updating) ]]; then
                        echo -ne "\r${BLUE}ℹ${NC} $line"
                    fi
                done; then
                    echo "" # Nueva línea después del progreso
                    print_success "Dependencias del smart contract instaladas"
                    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dependencias del smart contract instaladas exitosamente" >> "$LOGS_DIR/install.log" 2>&1
                else
                    local exit_code=${PIPESTATUS[0]}
                    echo "" # Nueva línea
                    if [ $exit_code -eq 124 ]; then
                        print_error "Timeout: La instalación de dependencias del smart contract excedió 10 minutos"
                    else
                        print_error "Error al instalar dependencias del smart contract"
                    fi
                    print_info "Ver logs en: $LOGS_DIR/install.log"
                    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Fallo al instalar dependencias del smart contract (código: $exit_code)" >> "$LOGS_DIR/install.log" 2>&1
                    cd "$PROJECT_ROOT"
                    return 1
                fi
                cd "$PROJECT_ROOT"
                ;;
        esac
    done
    
    return 0
}

# ============================================================================
# FUNCIÓN: CONFIGURAR VARIABLES DE ENTORNO
# ============================================================================

setup_environment_variables() {
    local env_file="$WEB_DIR/.env.local"
    local MODERN_DESIGN=""
    local DEBUG_MODE=""
    local DEBUG_TOKENS=""
    local auto_mode=false
    
    # Verificar si está en modo automático
    if [ "${AUTO_INSTALL:-false}" = "true" ]; then
        auto_mode=true
        # Valores por defecto en modo automático
        MODERN_DESIGN="true"
        DEBUG_MODE="false"
        DEBUG_TOKENS="false"
        print_info "Modo automático: usando valores por defecto"
        print_info "  - NEXT_PUBLIC_MODERN_DESIGN=true"
        print_info "  - NEXT_PUBLIC_DEBUG_MODE=false"
        print_info "  - NEXT_PUBLIC_DEBUG_TOKENS=false"
    fi
    
    # Parsear argumentos
    local use_params=false
    local all_params=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --modern-design)
                MODERN_DESIGN="$2"
                use_params=true
                shift 2
                ;;
            --debug-mode)
                DEBUG_MODE="$2"
                use_params=true
                shift 2
                ;;
            --debug-tokens)
                DEBUG_TOKENS="$2"
                use_params=true
                shift 2
                ;;
            --all)
                MODERN_DESIGN="$2"
                DEBUG_MODE="$3"
                DEBUG_TOKENS="$4"
                use_params=true
                all_params=true
                shift 4
                ;;
            *)
                shift
                ;;
        esac
    done
    
    # Si se pasaron parámetros, validarlos
    if [ "$use_params" = true ]; then
        # Validar MODERN_DESIGN
        if [ -n "$MODERN_DESIGN" ]; then
            if [[ ! "$MODERN_DESIGN" =~ ^(true|false)$ ]]; then
                print_error "Valor inválido para --modern-design: $MODERN_DESIGN (debe ser 'true' o 'false')"
                return 1
            fi
        fi
        
        # Validar DEBUG_MODE
        if [ -n "$DEBUG_MODE" ]; then
            if [[ ! "$DEBUG_MODE" =~ ^(true|false)$ ]]; then
                print_error "Valor inválido para --debug-mode: $DEBUG_MODE (debe ser 'true' o 'false')"
                return 1
            fi
        fi
        
        # Validar DEBUG_TOKENS
        if [ -n "$DEBUG_TOKENS" ]; then
            if [[ ! "$DEBUG_TOKENS" =~ ^(true|false)$ ]]; then
                print_error "Valor inválido para --debug-tokens: $DEBUG_TOKENS (debe ser 'true' o 'false')"
                return 1
            fi
        fi
        
        # Si se usó --all, verificar que todos los valores estén presentes
        if [ "$all_params" = true ]; then
            if [ -z "$MODERN_DESIGN" ] || [ -z "$DEBUG_MODE" ] || [ -z "$DEBUG_TOKENS" ]; then
                print_error "Uso incorrecto de --all. Debe ser: --all <modern-design> <debug-mode> <debug-tokens>"
                return 1
            fi
        fi
    fi
    
    # Verificar si ya existe el archivo
    if [ -f "$env_file" ]; then
        if [ "$use_params" = false ] && [ "$auto_mode" = false ]; then
            print_info "Archivo .env.local ya existe"
            read -p "¿Deseas actualizar la configuración? (s/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Ss]$ ]]; then
                return 0
            fi
        elif [ "$auto_mode" = true ]; then
            print_warning "Archivo .env.local ya existe. Se sobrescribirá con valores por defecto."
        else
            print_warning "Archivo .env.local ya existe. Se sobrescribirá."
        fi
    fi
    
    # Si no se pasaron parámetros y no está en modo automático, preguntar interactivamente
    if [ "$use_params" = false ] && [ "$auto_mode" = false ]; then
        print_header "Configuración de Variables de Entorno"
        
        # Modern Design
        echo ""
        echo "¿Deseas activar el diseño moderno 2025? (glassmorphism, gradientes)"
        read -p "(S/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            MODERN_DESIGN="true"
        else
            MODERN_DESIGN="false"
        fi
        
        # Debug Mode
        echo ""
        echo "¿Deseas activar el modo debug? (logs adicionales en consola)"
        read -p "(s/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            DEBUG_MODE="true"
        else
            DEBUG_MODE="false"
        fi
        
        # Debug Tokens
        echo ""
        echo "¿Deseas activar el debug de tokens? (información adicional de tokens)"
        read -p "(s/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            DEBUG_TOKENS="true"
        else
            DEBUG_TOKENS="false"
        fi
    else
        # Usar valores por defecto si no se proporcionaron
        MODERN_DESIGN=${MODERN_DESIGN:-"true"}
        DEBUG_MODE=${DEBUG_MODE:-"false"}
        DEBUG_TOKENS=${DEBUG_TOKENS:-"false"}
    fi
    
    # Crear archivo .env.local
    cat > "$env_file" << EOF
# Supply Chain Tracker - Environment Variables
# Generated automatically by deploy.sh
# Last updated: $(date '+%Y-%m-%d %H:%M:%S')

# Modern Design 2025 (glassmorphism, gradients, animations)
# Options: true | false
NEXT_PUBLIC_MODERN_DESIGN=$MODERN_DESIGN

# Debug Mode (additional console logs)
# Options: true | false
NEXT_PUBLIC_DEBUG_MODE=$DEBUG_MODE

# Debug Tokens (additional token information)
# Options: true | false
NEXT_PUBLIC_DEBUG_TOKENS=$DEBUG_TOKENS
EOF
    
    print_success "Archivo .env.local creado/actualizado en: $env_file"
    print_info "Valores configurados:"
    print_info "  - NEXT_PUBLIC_MODERN_DESIGN=$MODERN_DESIGN"
    print_info "  - NEXT_PUBLIC_DEBUG_MODE=$DEBUG_MODE"
    print_info "  - NEXT_PUBLIC_DEBUG_TOKENS=$DEBUG_TOKENS"
    
    # Registrar en log
    ensure_logs_dir
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Variables de entorno configuradas: MODERN_DESIGN=$MODERN_DESIGN, DEBUG_MODE=$DEBUG_MODE, DEBUG_TOKENS=$DEBUG_TOKENS" >> "$LOGS_DIR/install.log" 2>&1
    
    return 0
}

# ============================================================================
# FUNCIÓN: VERIFICACIÓN COMPLETA PRE-START
# ============================================================================

pre_start_check() {
    ensure_logs_dir  # Asegurar que logs/ existe para los logs de instalación
    
    print_header "Verificación Pre-Inicio"
    
    local errors=0
    local warnings=0
    local auto_mode=false
    
    # Verificar si está en modo automático
    if [ "${AUTO_INSTALL:-false}" = "true" ]; then
        auto_mode=true
        print_info "Modo automático activado: instalaciones sin confirmación"
        print_info "Valores por defecto que se usarán:"
        print_info "  - Herramientas del sistema: se instalarán automáticamente"
        print_info "  - Dependencias del proyecto: se instalarán automáticamente"
        print_info "  - Variables de entorno: MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false"
    fi
    
    # 1. Verificar herramientas del sistema
    print_step "Verificando herramientas del sistema..."
    local missing_tools=$(check_system_tools)
    if [ $? -ne 0 ]; then
        print_warning "Faltan herramientas: $missing_tools"
        if install_system_tools $missing_tools; then
            print_success "Herramientas instaladas correctamente"
        else
            print_error "No se pudieron instalar las herramientas. Abortando."
            errors=$((errors + 1))
        fi
    else
        print_success "Todas las herramientas del sistema están instaladas"
    fi
    
    # 2. Verificar requisitos básicos
    print_step "Verificando requisitos básicos..."
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js no está instalado"
        print_info "Instala Node.js v18+ desde: https://nodejs.org/"
        print_info "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
        print_info "  Fedora/RHEL: sudo dnf install -y nodejs npm"
        print_info "  Arch/Manjaro: sudo pacman -S nodejs npm"
        errors=$((errors + 1))
    else
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 18 ]; then
            print_error "Node.js versión $node_version es muy antigua. Se requiere v18+"
            errors=$((errors + 1))
        else
            print_success "Node.js $(node --version) instalado"
        fi
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm no está instalado"
        errors=$((errors + 1))
    else
        print_success "npm $(npm --version) instalado"
    fi
    
    if ! command -v forge >/dev/null 2>&1; then
        print_error "Foundry (forge) no está instalado"
        print_info "Instala Foundry con: curl -L https://foundry.paradigm.xyz | bash && foundryup"
        errors=$((errors + 1))
    else
        print_success "Foundry instalado"
    fi
    
    if ! command -v anvil >/dev/null 2>&1; then
        print_error "Foundry (anvil) no está instalado"
        print_info "Ejecuta: foundryup"
        errors=$((errors + 1))
    else
        print_success "Anvil instalado"
    fi
    
    # Si hay errores críticos, abortar
    if [ $errors -gt 0 ]; then
        print_error "❌ Se encontraron $errors error(es) crítico(s). Abortando."
        print_info "Corrige los errores antes de continuar."
        return 1
    fi
    
    # 3. Verificar dependencias del proyecto
    print_step "Verificando dependencias del proyecto..."
    local missing_deps=$(check_project_dependencies)
    if [ $? -ne 0 ]; then
        print_warning "Faltan dependencias: $missing_deps"
        
        if [ "$auto_mode" = false ]; then
            echo ""
            read -p "¿Deseas instalar las dependencias faltantes ahora? (S/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Nn]$ ]]; then
                print_warning "Instalación cancelada. Debes instalar manualmente:"
                for dep in $missing_deps; do
                    case "$dep" in
                        frontend)
                            print_info "  - Frontend: cd web && npm install"
                            ;;
                        smart-contract)
                            print_info "  - Smart Contract: cd sc && forge install"
                            ;;
                    esac
                done
                errors=$((errors + 1))
            else
                if ! install_project_dependencies $missing_deps; then
                    print_error "Error al instalar dependencias. Abortando."
                    errors=$((errors + 1))
                fi
            fi
        else
            # Modo automático: instalar sin preguntar
            print_info "Modo automático: instalando dependencias sin confirmación..."
            if ! install_project_dependencies $missing_deps; then
                print_error "Error al instalar dependencias. Abortando."
                errors=$((errors + 1))
            fi
        fi
    else
        print_success "Todas las dependencias del proyecto están instaladas"
    fi
    
    # Si hay errores después de intentar instalar, abortar
    if [ $errors -gt 0 ]; then
        print_error "❌ Se encontraron $errors error(es). Abortando."
        return 1
    fi
    
    # 4. Configurar variables de entorno (opcional, no crítico)
    if [ ! -f "$WEB_DIR/.env.local" ]; then
        print_step "Configuración de variables de entorno..."
        if [ "$auto_mode" = false ]; then
            echo ""
            read -p "¿Deseas configurar las variables de entorno ahora? (S/n): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                setup_environment_variables
            else
                print_info "Puedes configurarlas después con: ./deploy.sh env"
            fi
        else
            # Modo automático: configurar con valores por defecto
            print_info "Modo automático: configurando variables de entorno con valores por defecto..."
            setup_environment_variables
        fi
    else
        print_success "Archivo .env.local encontrado"
    fi
    
    # Resumen
    echo ""
    if [ $errors -eq 0 ]; then
        if [ $warnings -eq 0 ]; then
            print_success "✅ Todas las verificaciones pasaron correctamente"
        else
            print_warning "⚠️  Verificación completada con $warnings advertencia(s)"
        fi
        return 0
    else
        print_error "❌ Se encontraron $errors error(es). Abortando."
        return 1
    fi
}

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    # Verificar tanto IPv4 como IPv6 usando múltiples métodos
    # Método 1: lsof (funciona para IPv4 y algunos casos IPv6)
    if lsof -i :$port -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    fi
    # Método 2: netstat (detecta IPv6 mejor)
    if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
        return 0  # Puerto en uso
    fi
    # Método 3: ss (alternativa moderna)
    if ss -tlnp 2>/dev/null | grep -q ":$port "; then
        return 0  # Puerto en uso
    fi
    return 1  # Puerto libre
}

# Función para obtener PID de un proceso en un puerto
get_pid_by_port() {
    local port=$1
    # Obtener PID tanto de IPv4 como IPv6
    lsof -ti :$port 2>/dev/null | head -n 1 || echo ""
}

# Función para esperar a que un puerto esté en uso (servicio iniciado)
wait_for_port() {
    local port=$1
    local timeout=${2:-30}
    local elapsed=0
    
    print_step "Esperando a que el puerto $port esté en uso (servicio iniciado)..."
    
    while [ $elapsed -lt $timeout ]; do
        if check_port $port; then
            print_success "Puerto $port está en uso (servicio iniciado)"
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    print_error "Timeout esperando al puerto $port (servicio no inició)"
    return 1
}

# ============================================================================
# FUNCIÓN: INICIAR ANVIL
# ============================================================================

start_anvil() {
    print_header "PASO 1: Iniciar Anvil (Blockchain Local)"
    
    # Verificar si Anvil ya está corriendo
    local existing_anvil_pid=$(pgrep -f "anvil.*--port $ANVIL_PORT" | head -n 1)
    if [ -n "$existing_anvil_pid" ]; then
        print_warning "Anvil ya está corriendo en puerto $ANVIL_PORT (PID: $existing_anvil_pid)"
        echo "$existing_anvil_pid" > "$ANVIL_PID_FILE"
        return 0
    fi
    
    print_step "Iniciando Anvil en $ANVIL_HOST:$ANVIL_PORT con Chain ID $ANVIL_CHAIN_ID..."
    
    # Verificar y mostrar estado de persistencia
    local state_exists=false
    local state_size=""
    if [ -f "$ANVIL_STATE_FILE" ]; then
        state_exists=true
        state_size=$(du -h "$ANVIL_STATE_FILE" 2>/dev/null | cut -f1)
        print_success "✅ Estado persistente encontrado: $ANVIL_STATE_FILE"
        print_info "   📊 Tamaño: $state_size"
        print_info "   🔄 Anvil restaurará el estado anterior (tokens, transferencias, usuarios)"
    else
        print_info "ℹ️  Iniciando con blockchain limpia (sin estado previo)"
        print_info "   📝 El estado se guardará en: $ANVIL_STATE_FILE"
    fi
    
    # Iniciar Anvil en background con nohup y persistencia de estado
    cd "$SC_DIR"
    print_step "Iniciando Anvil con persistencia de estado habilitada..."
    nohup anvil \
        --host "$ANVIL_HOST" \
        --port "$ANVIL_PORT" \
        --chain-id "$ANVIL_CHAIN_ID" \
        --state "$ANVIL_STATE_FILE" \
        --accounts 15 \
        > "$ANVIL_LOG_FILE" 2>&1 &
    
    local anvil_pid=$!
    echo "$anvil_pid" > "$ANVIL_PID_FILE"
    
    print_info "Anvil iniciado con PID: $anvil_pid"
    print_info "Logs: $ANVIL_LOG_FILE"
    
    # Esperar a que Anvil esté listo
    if wait_for_port $ANVIL_PORT 10; then
        # Validar que Anvil está corriendo con persistencia
        sleep 1
        if pgrep -f "anvil.*--state.*$ANVIL_STATE_FILE" > /dev/null; then
            print_success "Anvil iniciado correctamente"
            print_success "✅ Persistencia de estado: HABILITADA"
            print_info "   📁 Archivo de estado: $ANVIL_STATE_FILE"
            if [ "$state_exists" = true ]; then
                print_info "   ✅ Estado anterior restaurado ($state_size)"
            else
                print_info "   📝 Nuevo estado se guardará automáticamente"
            fi
        else
            print_warning "Anvil iniciado, pero no se pudo verificar el flag --state"
            print_info "Verifica manualmente: ps aux | grep anvil | grep --state"
        fi
        
        # Mostrar cuentas disponibles
        print_info "Cuenta deployer: $DEPLOYER_ADDRESS"
        print_info "Balance inicial: 10,000 ETH"
        
        return 0
    else
        print_error "Anvil no pudo iniciar correctamente"
        return 1
    fi
}

# ============================================================================
# FUNCIÓN: DESPLEGAR SMART CONTRACT
# ============================================================================

deploy_contract() {
    print_header "PASO 2: Desplegar Smart Contract"
    
    if ! check_port $ANVIL_PORT; then
        print_error "Anvil no está corriendo. Inicia Anvil primero."
        return 1
    fi
    
    # Verificar si ya hay un contrato desplegado y Anvil sigue corriendo
    local contract_address_file="$LOGS_DIR/contract_address.txt"
    if [ -f "$contract_address_file" ]; then
        local existing_contract=$(cat "$contract_address_file")
        if [ -n "$existing_contract" ]; then
            # Verificar si el contrato sigue accesible (Anvil no se reinició)
            local rpc_check=$(curl -s -X POST \
                -H "Content-Type: application/json" \
                --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["'$existing_contract'","latest"],"id":1}' \
                "http://$ANVIL_HOST:$ANVIL_PORT" 2>/dev/null)
            
            # Si el contrato tiene código (no es "0x"), está desplegado
            if echo "$rpc_check" | grep -q '"result":"0x[0-9a-f]\{10,\}"'; then
                print_warning "Contrato ya desplegado en: $existing_contract"
                print_info "Anvil no se reinició, usando contrato existente"
                print_info "Para redesplegar, ejecuta: ./deploy.sh restart"
                return 0
            else
                print_warning "Contrato anterior no encontrado (Anvil reiniciado)"
                print_info "Desplegando nuevo contrato..."
            fi
        fi
    fi
    
    # Asegurar que el contrato esté compilado antes de desplegar (para tener ABI actualizado)
    print_step "Compilando contrato para asegurar ABI actualizado..."
    cd "$SC_DIR"
    if ! forge build --force > /dev/null 2>&1; then
        print_error "Error al compilar el contrato"
        return 1
    fi
    print_success "Contrato compilado correctamente"
    
    print_step "Desplegando SupplyChain.sol en Anvil..."
    
    # Ejecutar script de deployment
    local deploy_output=$(PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY forge script \
        script/SupplyChainDeploy.s.sol:SupplyChainDeployScript \
        --rpc-url "http://$ANVIL_HOST:$ANVIL_PORT" \
        --broadcast \
        2>&1)
    
    echo "$deploy_output" > "$DEPLOY_LOG_FILE"
    
    # Extraer dirección del contrato del output
    local contract_address=$(echo "$deploy_output" | grep -oP 'Contract Address: \K0x[a-fA-F0-9]{40}' | head -1)
    
    if [ -z "$contract_address" ]; then
        # Intentar extraer de otra forma
        contract_address=$(echo "$deploy_output" | grep -oP 'deployed at: \K0x[a-fA-F0-9]{40}' | head -1)
    fi
    
    if [ -z "$contract_address" ]; then
        print_error "No se pudo obtener la dirección del contrato"
        print_info "Ver logs en: $DEPLOY_LOG_FILE"
        return 1
    fi
    
    print_success "Contrato desplegado exitosamente"
    print_info "Dirección: $contract_address"
    print_info "Owner: $DEPLOYER_ADDRESS"
    print_info "Logs: $DEPLOY_LOG_FILE"
    
    # Guardar dirección para el siguiente paso
    echo "$contract_address" > "$LOGS_DIR/contract_address.txt"
    
    return 0
}

# ============================================================================
# FUNCIÓN: ACTUALIZAR CONFIGURACIÓN DEL FRONTEND
# ============================================================================

update_frontend_config() {
    print_header "PASO 3: Actualizar Configuración del Frontend"
    
    local contract_address_file="$LOGS_DIR/contract_address.txt"
    
    if [ ! -f "$contract_address_file" ]; then
        print_error "Archivo de dirección del contrato no encontrado"
        return 1
    fi
    
    local contract_address=$(cat "$contract_address_file")
    
    if [ -z "$contract_address" ]; then
        print_error "Dirección del contrato vacía"
        return 1
    fi
    
    # ============================================================
    # 3.1: Actualizar ABI del contrato
    # ============================================================
    print_step "Actualizando ABI del contrato..."
    
    if [ ! -f "$ABI_SOURCE" ]; then
        print_error "ABI fuente no encontrado: $ABI_SOURCE"
        print_info "Asegúrate de que el contrato esté compilado (forge build)"
        return 1
    fi
    
    # Hacer backup del ABI existente
    if [ -f "$ABI_FILE" ]; then
        cp "$ABI_FILE" "$ABI_FILE.backup"
        print_info "Backup del ABI creado: $ABI_FILE.backup"
    fi
    
    # Copiar ABI actualizado
    cp "$ABI_SOURCE" "$ABI_FILE"
    
    if [ -f "$ABI_FILE" ]; then
        print_success "ABI actualizado correctamente"
        print_info "ABI copiado desde: $ABI_SOURCE"
    else
        print_error "No se pudo copiar el ABI"
        return 1
    fi
    
    # ============================================================
    # 3.2: Actualizar dirección del contrato
    # ============================================================
    print_step "Actualizando $CONFIG_FILE con dirección: $contract_address"
    
    # Verificar que el archivo existe
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Archivo de configuración no encontrado: $CONFIG_FILE"
        return 1
    fi
    
    # Hacer backup del archivo original
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
    print_info "Backup creado: $CONFIG_FILE.backup"
    
    # Actualizar dirección usando sed
    sed -i "s/export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]\{40\}'/export const SUPPLY_CHAIN_ADDRESS = '$contract_address'/" "$CONFIG_FILE"
    
    # Verificar que se actualizó correctamente
    if grep -q "$contract_address" "$CONFIG_FILE"; then
        print_success "Configuración actualizada correctamente"
        print_info "Nueva dirección: $contract_address"
        print_info "ABI actualizado desde la última compilación"
        return 0
    else
        print_error "No se pudo actualizar la configuración"
        # Restaurar backups
        if [ -f "$CONFIG_FILE.backup" ]; then
        mv "$CONFIG_FILE.backup" "$CONFIG_FILE"
        fi
        if [ -f "$ABI_FILE.backup" ]; then
            mv "$ABI_FILE.backup" "$ABI_FILE"
        fi
        print_info "Configuración restaurada desde backups"
        return 1
    fi
}

# ============================================================================
# FUNCIÓN: INICIAR FRONTEND
# ============================================================================

start_frontend() {
    print_header "PASO 4: Iniciar Frontend (Next.js)"
    
    # Verificar si frontend ya está corriendo (buscar por puerto primero, luego por proceso)
    local existing_frontend_pid=$(get_pid_by_port $FRONTEND_PORT)
    if [ -z "$existing_frontend_pid" ]; then
        # Si no hay proceso en el puerto, buscar por nombre
        existing_frontend_pid=$(pgrep -f "next-server" 2>/dev/null | head -n 1)
    fi
    if [ -z "$existing_frontend_pid" ]; then
        existing_frontend_pid=$(pgrep -f "npm.*run dev" 2>/dev/null | head -n 1)
    fi
    
    if [ -n "$existing_frontend_pid" ] && kill -0 "$existing_frontend_pid" 2>/dev/null; then
        print_warning "Frontend ya está corriendo en puerto $FRONTEND_PORT (PID: $existing_frontend_pid)"
        echo "$existing_frontend_pid" > "$FRONTEND_PID_FILE"
        return 0
    fi
    
    print_step "Iniciando servidor Next.js en puerto $FRONTEND_PORT..."
    
    cd "$WEB_DIR"
    
    # Iniciar Next.js en background con nohup
    nohup npm run dev > "$FRONTEND_LOG_FILE" 2>&1 &
    
    local frontend_pid=$!
    echo "$frontend_pid" > "$FRONTEND_PID_FILE"
    
    print_info "Frontend iniciado con PID: $frontend_pid"
    print_info "Logs: $FRONTEND_LOG_FILE"
    
    # Esperar a que el frontend esté listo
    if wait_for_port $FRONTEND_PORT 30; then
        print_success "Frontend iniciado correctamente"
        print_info "URL: http://localhost:$FRONTEND_PORT"
        return 0
    else
        print_error "Frontend no pudo iniciar correctamente"
        return 1
    fi
}

# ============================================================================
# FUNCIÓN: DETENER SERVICIOS
# ============================================================================

stop_services() {
    print_header "Deteniendo Servicios"
    
    local stopped_count=0
    
    # Detener Frontend - Buscar todos los procesos relacionados
    local frontend_pids=""
    
    # Buscar por PID file
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local file_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$file_pid" 2>/dev/null; then
            frontend_pids="$frontend_pids $file_pid"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Buscar por puerto
    local port_pid=$(get_pid_by_port $FRONTEND_PORT)
    if [ -n "$port_pid" ]; then
        frontend_pids="$frontend_pids $port_pid"
    fi
    
    # Buscar por nombre de proceso
    local process_pids=$(pgrep -f "next-server" 2>/dev/null || true)
    if [ -n "$process_pids" ]; then
        frontend_pids="$frontend_pids $process_pids"
    fi
    
    local npm_pids=$(pgrep -f "npm.*run dev" 2>/dev/null || true)
    if [ -n "$npm_pids" ]; then
        frontend_pids="$frontend_pids $npm_pids"
    fi
    
    # Eliminar duplicados y espacios
    frontend_pids=$(echo $frontend_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    if [ -n "$frontend_pids" ]; then
        print_step "Deteniendo Frontend (PIDs: $frontend_pids)..."
        for pid in $frontend_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done
            sleep 2
            
        # Forzar si siguen corriendo
        for pid in $frontend_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
            
            print_success "Frontend detenido"
            stopped_count=$((stopped_count + 1))
    else
        print_info "Frontend no está corriendo"
    fi
    
    # Detener Anvil - Buscar todos los procesos relacionados
    local anvil_pids=""
    
    # Buscar por PID file
    if [ -f "$ANVIL_PID_FILE" ]; then
        local file_pid=$(cat "$ANVIL_PID_FILE")
        if kill -0 "$file_pid" 2>/dev/null; then
            anvil_pids="$anvil_pids $file_pid"
        fi
        rm -f "$ANVIL_PID_FILE"
    fi
    
    # Buscar por puerto
    local port_pid=$(get_pid_by_port $ANVIL_PORT)
    if [ -n "$port_pid" ]; then
        anvil_pids="$anvil_pids $port_pid"
    fi
    
    # Buscar por nombre de proceso
    local process_pids=$(pgrep -f "anvil.*--port $ANVIL_PORT" 2>/dev/null || true)
    if [ -n "$process_pids" ]; then
        anvil_pids="$anvil_pids $process_pids"
    fi
    
    # Eliminar duplicados y espacios
    anvil_pids=$(echo $anvil_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    if [ -n "$anvil_pids" ]; then
        print_step "Deteniendo Anvil (PIDs: $anvil_pids)..."
        for pid in $anvil_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done
            sleep 2
            
        # Forzar si siguen corriendo
        for pid in $anvil_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
            
            print_success "Anvil detenido"
            stopped_count=$((stopped_count + 1))
    else
        print_info "Anvil no está corriendo"
    fi
    
    if [ $stopped_count -eq 0 ]; then
        print_warning "No hay servicios corriendo"
    else
        print_success "Se detuvieron $stopped_count servicio(s)"
    fi
}

# ============================================================================
# FUNCIÓN: MOSTRAR ESTADO
# ============================================================================

show_status() {
    print_header "Estado de Servicios"
    
    # Estado de Anvil
    echo -e "${CYAN}Anvil (Blockchain Local):${NC}"
    local anvil_pid=$(pgrep -f "anvil.*--port $ANVIL_PORT" | head -n 1)
    if [ -n "$anvil_pid" ]; then
        print_success "CORRIENDO (PID: $anvil_pid, Puerto: $ANVIL_PORT)"
        print_info "RPC URL: http://$ANVIL_HOST:$ANVIL_PORT"
        print_info "Chain ID: $ANVIL_CHAIN_ID"
    else
        print_error "DETENIDO"
    fi
    
    echo ""
    
    # Estado del Frontend
    echo -e "${CYAN}Frontend (Next.js):${NC}"
    local frontend_pid=$(pgrep -f "next-server" 2>/dev/null || pgrep -f "npm.*run dev" 2>/dev/null | head -n 1)
    if [ -n "$frontend_pid" ]; then
        print_success "CORRIENDO (PID: $frontend_pid, Puerto: $FRONTEND_PORT)"
        print_info "URL: http://localhost:$FRONTEND_PORT"
    else
        print_error "DETENIDO"
    fi
    
    echo ""
    
    # Información del contrato
    echo -e "${CYAN}Smart Contract:${NC}"
    if [ -f "$LOGS_DIR/contract_address.txt" ]; then
        local contract_address=$(cat "$LOGS_DIR/contract_address.txt")
        print_info "Dirección: $contract_address"
        print_info "Owner: $DEPLOYER_ADDRESS"
    else
        print_warning "No desplegado"
    fi
    
    echo ""
    
    # Archivos de log
    echo -e "${CYAN}Logs:${NC}"
    if [ -f "$ANVIL_LOG_FILE" ]; then
        print_info "Anvil: $ANVIL_LOG_FILE"
    fi
    if [ -f "$FRONTEND_LOG_FILE" ]; then
        print_info "Frontend: $FRONTEND_LOG_FILE"
    fi
    if [ -f "$DEPLOY_LOG_FILE" ]; then
        print_info "Deploy: $DEPLOY_LOG_FILE"
    fi
}

# ============================================================================
# FUNCIÓN: MOSTRAR INSTRUCCIONES DE METAMASK
# ============================================================================

show_metamask_instructions() {
    print_header "Configuración de MetaMask"
    
    echo -e "${YELLOW}📝 INSTRUCCIONES PARA CONFIGURAR METAMASK${NC}\n"
    
    echo -e "${CYAN}1. Agregar Red Anvil Local:${NC}"
    echo "   • Abrir MetaMask → Selector de red (arriba izquierda)"
    echo "   • Clic en 'Add network' → 'Add a network manually'"
    echo "   • Completar los siguientes datos:"
    echo ""
    echo -e "     ${GREEN}Network Name:${NC}     Anvil Local"
    echo -e "     ${GREEN}RPC URL:${NC}          http://$ANVIL_HOST:$ANVIL_PORT"
    echo -e "     ${GREEN}Chain ID:${NC}         $ANVIL_CHAIN_ID"
    echo -e "     ${GREEN}Currency Symbol:${NC}  ETH"
    echo ""
    echo "   • Clic en 'Save'"
    echo ""
    
    echo -e "${CYAN}2. Importar Cuenta de Anvil (Owner):${NC}"
    echo "   • Abrir MetaMask → Icono de cuenta (arriba derecha)"
    echo "   • Clic en 'Import Account'"
    echo "   • Seleccionar 'Private Key'"
    echo "   • Pegar el siguiente private key:"
    echo ""
    echo -e "     ${GREEN}$DEPLOYER_PRIVATE_KEY${NC}"
    echo ""
    echo "   • Clic en 'Import'"
    echo ""
    echo -e "   ${YELLOW}⚠ IMPORTANTE:${NC} Este private key es SOLO para desarrollo local."
    echo "   NUNCA usar en mainnet o con fondos reales."
    echo ""
    
    echo -e "${CYAN}3. Verificar Configuración:${NC}"
    echo "   • La cuenta importada debe tener dirección: $DEPLOYER_ADDRESS"
    echo "   • El balance debe ser ~10,000 ETH"
    echo "   • La red debe estar en 'Anvil Local'"
    echo ""
    
    echo -e "${CYAN}4. Conectar a la DApp:${NC}"
    echo "   • Abrir http://localhost:$FRONTEND_PORT"
    echo "   • Clic en 'Conectar MetaMask'"
    echo "   • Autorizar la conexión en MetaMask"
    echo "   • ¡Listo! Deberías ver tu dirección y las estadísticas del contrato"
    echo ""
    
    echo -e "${CYAN}5. Cuentas Adicionales (Opcional):${NC}"
    echo "   Para probar transferencias entre usuarios, puedes importar más cuentas:"
    echo ""
    echo -e "   ${YELLOW}Cuenta #1:${NC} 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    echo -e "   ${YELLOW}Private Key:${NC} 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    echo ""
    echo -e "   ${YELLOW}Cuenta #2:${NC} 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    echo -e "   ${YELLOW}Private Key:${NC} 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    echo ""
}

# ============================================================================
# FUNCIÓN: GESTIÓN SOLO DEL FRONTEND
# ============================================================================

start_frontend_only() {
    ensure_logs_dir
    
    print_header "🚀 Iniciar Solo Frontend"
    
    # Verificar que Anvil esté corriendo
    if ! check_port $ANVIL_PORT; then
        print_error "Anvil no está corriendo. Inicia Anvil primero con: ./deploy.sh start"
        return 1
    fi
    
    # Verificar que el contrato esté desplegado
    local contract_address_file="$LOGS_DIR/contract_address.txt"
    if [ ! -f "$contract_address_file" ]; then
        print_error "Contrato no está desplegado. Ejecuta: ./deploy.sh start"
        return 1
    fi
    
    # Iniciar frontend
    if ! start_frontend; then
        print_error "No se pudo iniciar el frontend"
        return 1
    fi
    
    print_success "Frontend iniciado correctamente"
    print_info "URL: http://localhost:$FRONTEND_PORT"
    print_info "Anvil y contrato siguen corriendo"
}

stop_frontend_only() {
    print_header "🛑 Detener Solo Frontend"
    
    local stopped=false
    
    # Detener Frontend - Buscar todos los procesos relacionados
    local frontend_pids=""
    
    # Buscar por PID file
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local file_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$file_pid" 2>/dev/null; then
            frontend_pids="$frontend_pids $file_pid"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Buscar por puerto
    local port_pid=$(get_pid_by_port $FRONTEND_PORT)
    if [ -n "$port_pid" ]; then
        frontend_pids="$frontend_pids $port_pid"
    fi
    
    # Buscar por nombre de proceso
    local process_pids=$(pgrep -f "next-server" 2>/dev/null || true)
    if [ -n "$process_pids" ]; then
        frontend_pids="$frontend_pids $process_pids"
    fi
    
    local npm_pids=$(pgrep -f "npm.*run dev" 2>/dev/null || true)
    if [ -n "$npm_pids" ]; then
        frontend_pids="$frontend_pids $npm_pids"
    fi
    
    # Eliminar duplicados y espacios
    frontend_pids=$(echo $frontend_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    if [ -n "$frontend_pids" ]; then
        print_step "Deteniendo Frontend (PIDs: $frontend_pids)..."
        for pid in $frontend_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done
        sleep 2
        
        # Forzar si siguen corriendo
        for pid in $frontend_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        
        print_success "Frontend detenido"
        stopped=true
    else
        print_info "Frontend no está corriendo"
    fi
    
    if [ "$stopped" = true ]; then
        print_info "Anvil y contrato siguen corriendo"
        print_info "Para reiniciar frontend: ./deploy.sh frontend start"
    fi
}

restart_frontend_only() {
    print_header "🔄 Reiniciar Solo Frontend"
    
    stop_frontend_only
    sleep 2
    start_frontend_only
}

# ============================================================================
# FUNCIÓN: DETENER SOLO ANVIL
# ============================================================================

stop_anvil_only() {
    # Buscar todos los procesos de Anvil
    local anvil_pids=""
    
    # Buscar por PID file
    if [ -f "$ANVIL_PID_FILE" ]; then
        local file_pid=$(cat "$ANVIL_PID_FILE")
        if kill -0 "$file_pid" 2>/dev/null; then
            anvil_pids="$anvil_pids $file_pid"
        fi
        rm -f "$ANVIL_PID_FILE"
    fi
    
    # Buscar por puerto
    local port_pid=$(get_pid_by_port $ANVIL_PORT)
    if [ -n "$port_pid" ]; then
        anvil_pids="$anvil_pids $port_pid"
    fi
    
    # Buscar por nombre de proceso
    local process_pids=$(pgrep -f "anvil.*--port $ANVIL_PORT" 2>/dev/null || true)
    if [ -n "$process_pids" ]; then
        anvil_pids="$anvil_pids $process_pids"
    fi
    
    # Eliminar duplicados y espacios
    anvil_pids=$(echo $anvil_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    if [ -n "$anvil_pids" ]; then
        print_step "Deteniendo Anvil (PIDs: $anvil_pids)..."
        for pid in $anvil_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done
        sleep 2
        
        # Forzar si siguen corriendo
        for pid in $anvil_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        
        # Verificar que se detuvo
        sleep 1
        if check_port $ANVIL_PORT; then
            print_error "No se pudo detener Anvil completamente"
            return 1
        else
            print_success "Anvil detenido correctamente"
            return 0
        fi
    else
        print_info "Anvil no está corriendo"
        return 0
    fi
}

# ============================================================================
# FUNCIÓN: LIMPIAR ESTADO DE ANVIL
# ============================================================================

clean_anvil_state() {
    print_header "🧹 Limpiar Estado Persistente de Anvil"
    
    local anvil_running=false
    
    # Verificar si Anvil está corriendo
    if check_port $ANVIL_PORT; then
        anvil_running=true
        print_warning "Anvil está corriendo en puerto $ANVIL_PORT"
        print_warning "Para limpiar el estado, Anvil debe estar detenido"
        echo ""
        read -p "¿Deseas detener Anvil ahora? (s/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            print_step "Deteniendo Anvil..."
            if ! stop_anvil_only; then
                print_error "No se pudo detener Anvil. Operación cancelada."
                return 1
            fi
            sleep 1
            anvil_running=false
        else
            print_info "Operación cancelada. El estado no se limpiará mientras Anvil esté corriendo."
            return 0
        fi
    fi
    
    # Verificar nuevamente que Anvil no esté corriendo
    if check_port $ANVIL_PORT; then
        print_error "Anvil sigue corriendo. No se puede limpiar el estado."
        return 1
    fi
    
    # Limpiar el estado
    if [ -f "$ANVIL_STATE_FILE" ]; then
        local state_size=$(du -h "$ANVIL_STATE_FILE" | cut -f1)
        print_warning "Eliminando estado persistente de Anvil (tamaño: $state_size)"
        print_warning "Esto eliminará todos los datos de la blockchain local (tokens, transferencias, usuarios)"
        echo ""
        read -p "¿Estás seguro de que deseas eliminar el estado? (s/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            rm -f "$ANVIL_STATE_FILE"
            print_success "Estado persistente eliminado"
            print_info "Anvil iniciará con una blockchain limpia en el próximo start"
            return 0
        else
            print_info "Operación cancelada. El estado no se eliminó."
            return 0
        fi
    else
        print_info "No hay estado persistente para eliminar"
        print_info "Anvil iniciará con una blockchain limpia en el próximo start"
        return 0
    fi
}

# ============================================================================
# FUNCIÓN: START (INICIAR TODO)
# ============================================================================

start_all() {
    ensure_logs_dir
    
    # NUEVO: Verificación pre-start
    if ! pre_start_check; then
        print_error "Verificación pre-inicio falló. Corrige los errores antes de continuar."
        print_info "Puedes ejecutar './deploy.sh setup' para verificar e instalar dependencias"
        exit 1
    fi
    
    print_header "🚀 Iniciando Supply Chain Tracker"
    
    # Paso 1: Iniciar Anvil
    if ! start_anvil; then
        print_error "No se pudo iniciar Anvil"
        exit 1
    fi
    
    sleep 2
    
    # Paso 2: Desplegar contrato
    if ! deploy_contract; then
        print_error "No se pudo desplegar el contrato"
        exit 1
    fi
    
    sleep 1
    
    # Paso 3: Actualizar configuración
    if ! update_frontend_config; then
        print_error "No se pudo actualizar la configuración"
        exit 1
    fi
    
    sleep 1
    
    # Paso 4: Iniciar frontend
    if ! start_frontend; then
        print_error "No se pudo iniciar el frontend"
        exit 1
    fi
    
    # Mostrar resumen
    print_header "✅ Deployment Completado"
    
    echo -e "${GREEN}Todos los servicios están corriendo correctamente:${NC}\n"
    echo -e "  ${CYAN}Anvil:${NC}    http://$ANVIL_HOST:$ANVIL_PORT"
    echo -e "  ${CYAN}Frontend:${NC} http://localhost:$FRONTEND_PORT"
    echo -e "  ${CYAN}Contract:${NC} $(cat $LOGS_DIR/contract_address.txt)"
    echo ""
    
    # Mostrar instrucciones de MetaMask
    show_metamask_instructions
    
    print_info "Para ver el estado: ./deploy.sh status"
    print_info "Para detener todo: ./deploy.sh stop"
}

# ============================================================================
# FUNCIÓN: HELP
# ============================================================================

show_help() {
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        Supply Chain Tracker - Deployment Script              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo -e "${YELLOW}USO:${NC}"
    echo "  ./deploy.sh [comando] [opciones]"
    echo ""
    
    echo -e "${YELLOW}COMANDOS PRINCIPALES:${NC}"
    echo -e "  ${GREEN}start${NC}           Inicia todo el stack (Anvil + Deploy + Frontend)"
    echo -e "  ${GREEN}stop${NC}            Detiene todos los servicios"
    echo -e "  ${GREEN}restart${NC}         Reinicia todos los servicios"
    echo -e "  ${GREEN}status${NC}          Muestra el estado de los servicios"
    echo -e "  ${GREEN}metamask${NC}        Muestra instrucciones para configurar MetaMask"
    echo -e "  ${GREEN}clean${NC}           Limpia el estado persistente de Anvil (requiere Anvil detenido)"
    echo ""
    
    echo -e "${YELLOW}COMANDOS DE CONFIGURACIÓN:${NC}"
    echo -e "  ${GREEN}setup${NC}           Verifica requisitos e instala dependencias faltantes"
    echo -e "  ${GREEN}env${NC}             Configura variables de entorno (.env.local)"
    echo ""
    
    echo -e "${YELLOW}COMANDOS DE FRONTEND (sin afectar Anvil/Contrato):${NC}"
    echo -e "  ${GREEN}frontend start${NC}  Inicia solo el frontend (requiere Anvil corriendo)"
    echo -e "  ${GREEN}frontend stop${NC}   Detiene solo el frontend"
    echo -e "  ${GREEN}frontend restart${NC} Reinicia solo el frontend"
    echo ""
    
    echo -e "${YELLOW}OPCIONES:${NC}"
    echo -e "  ${GREEN}--yes${NC}, ${GREEN}--auto${NC}, ${GREEN}-y${NC}  Modo automático (sin confirmaciones)"
    echo ""
    
    echo -e "${YELLOW}EJEMPLOS:${NC}"
    echo "  # Primera vez - Setup completo"
    echo "  ./deploy.sh setup"
    echo "  ./deploy.sh env"
    echo "  ./deploy.sh start"
    echo ""
    echo "  # Modo automático (sin preguntar)"
    echo "  ./deploy.sh setup --yes"
    echo "  ./deploy.sh start --auto"
    echo ""
    echo "  # Configurar variables de entorno interactivamente"
    echo "  ./deploy.sh env"
    echo ""
    echo "  # Configurar variables con parámetros"
    echo "  ./deploy.sh env --modern-design true --debug-mode false"
    echo "  ./deploy.sh env --all true false false"
    echo ""
    echo "  # Iniciar todo"
    echo "  ./deploy.sh start"
    echo ""
    echo "  # Detener solo el frontend (Anvil y contrato siguen corriendo)"
    echo "  ./deploy.sh frontend stop"
    echo ""
    echo "  # Reiniciar solo el frontend después de cambios"
    echo "  ./deploy.sh frontend restart"
    echo ""
    echo "  # Ver estado"
    echo "  ./deploy.sh status"
    echo ""
    echo "  # Detener todo"
    echo "  ./deploy.sh stop"
    echo ""
    
    echo -e "${YELLOW}NOTA:${NC} Anvil ahora persiste el estado entre reinicios."
    echo -e "      Usa ${GREEN}./deploy.sh clean${NC} para limpiar el estado."
    echo -e "      Si Anvil está corriendo, te preguntará si deseas detenerlo primero."
    echo ""
    
    echo -e "  ${GREEN}help${NC}             Muestra esta ayuda"
    echo ""
    
    echo -e "${YELLOW}LOGS:${NC}"
    echo "  Los logs se guardan en: $LOGS_DIR"
    echo "  • anvil.log     - Logs de Anvil"
    echo "  • frontend.log  - Logs del frontend"
    echo "  • deploy.log    - Logs del deployment"
    echo "  • install.log   - Logs de instalación de dependencias"
    echo ""
    
    echo -e "${YELLOW}PUERTOS:${NC}"
    echo "  • Anvil:    $ANVIL_PORT"
    echo "  • Frontend: $FRONTEND_PORT"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Verificar que estamos en el directorio correcto
    if [ ! -d "$SC_DIR" ] || [ ! -d "$WEB_DIR" ]; then
        print_error "Este script debe ejecutarse desde la raíz del proyecto"
        print_info "Directorio actual: $PROJECT_ROOT"
        exit 1
    fi
    
    # Verificar flags de modo automático
    local auto_flag=false
    for arg in "$@"; do
        if [[ "$arg" == "--yes" || "$arg" == "--auto" || "$arg" == "-y" ]]; then
            auto_flag=true
            export AUTO_INSTALL=true
            break
        fi
    done
    
    # Procesar comando
    case "${1:-}" in
        start)
            start_all
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            sleep 2
            start_all
            ;;
        setup)
            pre_start_check
            ;;
        env|environment)
            shift  # Remover 'env' o 'environment'
            setup_environment_variables "$@"
            ;;
        frontend)
            case "${2:-}" in
                start)
                    start_frontend_only
                    ;;
                stop)
                    stop_frontend_only
                    ;;
                restart)
                    restart_frontend_only
                    ;;
                *)
                    print_error "Comando de frontend inválido: ${2:-}"
                    echo ""
                    echo "Comandos disponibles:"
                    echo "  ./deploy.sh frontend start    - Iniciar solo frontend"
                    echo "  ./deploy.sh frontend stop     - Detener solo frontend"
                    echo "  ./deploy.sh frontend restart  - Reiniciar solo frontend"
                    exit 1
                    ;;
            esac
            ;;
        status)
            show_status
            ;;
        metamask)
            show_metamask_instructions
            ;;
        clean|reset)
            clean_anvil_state
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Comando inválido: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar main con todos los argumentos
main "$@"
