#!/bin/bash

################################################################################
# Supply Chain Tracker - Deployment Automation Script
################################################################################
# 
# Descripción: Script para automatizar deployment de Anvil + Smart Contract + Frontend
# Autor: Supply Chain Tracker Team
# Fecha: 18 Noviembre 2025
# Versión: 1.0.0
#
# Funcionalidades:
#   - Iniciar/detener Anvil (blockchain local)
#   - Desplegar smart contract automáticamente
#   - Actualizar dirección del contrato en frontend
#   - Iniciar/detener servidor Next.js
#   - Validar estados de servicios
#   - Instrucciones para MetaMask
#
# Uso:
#   ./deploy.sh start   - Inicia todo el stack
#   ./deploy.sh stop    - Detiene todo el stack
#   ./deploy.sh status  - Muestra estado de servicios
#   ./deploy.sh restart - Reinicia todo el stack
#   ./deploy.sh help    - Muestra ayuda
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

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    # Verificar tanto IPv4 como IPv6
    if lsof -i :$port -t >/dev/null 2>&1; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
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
    
    # Iniciar Anvil en background con nohup
    cd "$SC_DIR"
    nohup anvil \
        --host "$ANVIL_HOST" \
        --port "$ANVIL_PORT" \
        --chain-id "$ANVIL_CHAIN_ID" \
        > "$ANVIL_LOG_FILE" 2>&1 &
    
    local anvil_pid=$!
    echo "$anvil_pid" > "$ANVIL_PID_FILE"
    
    print_info "Anvil iniciado con PID: $anvil_pid"
    print_info "Logs: $ANVIL_LOG_FILE"
    
    # Esperar a que Anvil esté listo
    if wait_for_port $ANVIL_PORT 10; then
        print_success "Anvil iniciado correctamente"
        
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
# FUNCIÓN: START (INICIAR TODO)
# ============================================================================

start_all() {
    ensure_logs_dir
    
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
    echo "  ./deploy.sh [comando]"
    echo ""
    
    echo -e "${YELLOW}COMANDOS:${NC}"
    echo -e "  ${GREEN}start${NC}           Inicia todo el stack (Anvil + Deploy + Frontend)"
    echo -e "  ${GREEN}stop${NC}            Detiene todos los servicios"
    echo -e "  ${GREEN}restart${NC}         Reinicia todos los servicios"
    echo -e "  ${GREEN}status${NC}          Muestra el estado de los servicios"
    echo -e "  ${GREEN}metamask${NC}        Muestra instrucciones para configurar MetaMask"
    echo ""
    echo -e "${YELLOW}COMANDOS DE FRONTEND (sin afectar Anvil/Contrato):${NC}"
    echo -e "  ${GREEN}frontend start${NC}  Inicia solo el frontend (requiere Anvil corriendo)"
    echo -e "  ${GREEN}frontend stop${NC}   Detiene solo el frontend"
    echo -e "  ${GREEN}frontend restart${NC} Reinicia solo el frontend"
    echo ""
    echo -e "  ${GREEN}help${NC}             Muestra esta ayuda"
    echo ""
    
    echo -e "${YELLOW}EJEMPLOS:${NC}"
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
    
    echo -e "${YELLOW}LOGS:${NC}"
    echo "  Los logs se guardan en: $LOGS_DIR"
    echo "  • anvil.log     - Logs de Anvil"
    echo "  • frontend.log  - Logs del frontend"
    echo "  • deploy.log    - Logs del deployment"
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
