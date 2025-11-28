#!/bin/bash

################################################################################
# Supply Chain Tracker - Deployment Automation Script
################################################################################
# 
# Description: Script to automate deployment of Anvil + Smart Contract + Frontend
# Author: Supply Chain Tracker Team
# Date: November 18, 2025
# Last Updated: November 28, 2025
# Version: 2.1.0
#
# Features:
#   - Start/stop Anvil (local blockchain with state persistence)
#   - Deploy smart contract automatically
#   - Update contract address and ABI in frontend
#   - Start/stop Next.js server
#   - Independent frontend management (without affecting Anvil/Contract)
#   - Clean Anvil persistent state
#   - Validate service states
#   - MetaMask instructions
#   - Intelligent detection of running processes
#   - Logs organized in logs/ directory
#
# Usage:
#   ./deploy.sh start           - Start entire stack (Anvil + Contract + Frontend)
#   ./deploy.sh stop            - Stop all services
#   ./deploy.sh restart         - Restart entire stack
#   ./deploy.sh status          - Show service status
#   ./deploy.sh metamask        - Show MetaMask configuration instructions
#   ./deploy.sh clean           - Clean Anvil persistent state
#   ./deploy.sh frontend start  - Start only frontend
#   ./deploy.sh frontend stop   - Stop only frontend
#   ./deploy.sh frontend restart - Restart only frontend
#   ./deploy.sh help            - Show complete help
#
################################################################################

set -e  # Exit on error

# ============================================================================
# CONFIGURATION
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project directories
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SC_DIR="$PROJECT_ROOT/sc"
WEB_DIR="$PROJECT_ROOT/web"
LOGS_DIR="$PROJECT_ROOT/logs"

# Process files
ANVIL_PID_FILE="$LOGS_DIR/anvil.pid"
FRONTEND_PID_FILE="$LOGS_DIR/frontend.pid"
ANVIL_LOG_FILE="$LOGS_DIR/anvil.log"
FRONTEND_LOG_FILE="$LOGS_DIR/frontend.log"
DEPLOY_LOG_FILE="$LOGS_DIR/deploy.log"
ANVIL_STATE_FILE="$LOGS_DIR/anvil_state.json"

# Network configuration
ANVIL_PORT=8545
ANVIL_CHAIN_ID=31337
ANVIL_HOST="127.0.0.1"
FRONTEND_PORT=3000

# Anvil account (Account #0)
DEPLOYER_PRIVATE_KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
DEPLOYER_ADDRESS="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Frontend configuration files
CONFIG_FILE="$WEB_DIR/src/contracts/config.ts"
ABI_FILE="$WEB_DIR/src/contracts/SupplyChain.json"
ABI_SOURCE="$SC_DIR/out/SupplyChain.sol/SupplyChain.json"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

# Function to print messages with color
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

# Function to create logs directory if it doesn't exist
ensure_logs_dir() {
    if [ ! -d "$LOGS_DIR" ]; then
        mkdir -p "$LOGS_DIR"
        print_success "Logs directory created: $LOGS_DIR"
    fi
}

# ============================================================================
# FUNCTION: DETECT OPERATING SYSTEM
# ============================================================================

detect_os() {
    # Detect macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
        return 0
    fi
    
    # Detect Linux
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
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
            echo "linux-unknown"
        fi
        return 0
    fi
    
    # Unrecognized system
    echo "unknown"
    return 1
}

# Legacy function for compatibility (now calls detect_os)
detect_linux_distro() {
    local os=$(detect_os)
    if [ "$os" = "macos" ]; then
        echo "macos"
    else
        echo "$os"
    fi
}

# ============================================================================
# FUNCTION: CHECK SYSTEM TOOLS
# ============================================================================

check_system_tools() {
    local missing_tools=()
    local os=$(detect_os)
    local tools=("lsof" "netstat" "curl" "pgrep")
    
    # ss is only available on Linux, not on macOS
    if [ "$os" != "macos" ]; then
        tools+=("ss")
    fi
    
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
# FUNCTION: INSTALL MISSING TOOLS
# ============================================================================

install_system_tools() {
    local tools=("$@")
    local auto_install=false
    
    # Check if should install automatically
    if [ "${AUTO_INSTALL:-false}" = "true" ]; then
        auto_install=true
    fi
    
    local os=$(detect_os)
    local install_cmd=""
    local packages=()
    
    case "$os" in
        macos)
            # Check if Homebrew is installed
            if ! command -v brew >/dev/null 2>&1; then
                print_error "Homebrew is not installed on macOS"
                print_info "Install Homebrew first with:"
                print_info "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                print_info "Then run this script again."
                return 1
            fi
            install_cmd="brew install"
            ;;
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
            print_error "Unrecognized operating system: $os"
            print_info "Please install manually: ${tools[*]}"
            return 1
            ;;
    esac
    
    # Map tools to package names
    for tool in "${tools[@]}"; do
        case "$tool" in
            lsof)
                if [ "$os" = "macos" ]; then
                    # lsof comes preinstalled on macOS
                    print_info "lsof is already available on macOS"
                else
                    packages+=("lsof")
                fi
                ;;
            netstat)
                if [ "$os" = "macos" ]; then
                    # netstat comes preinstalled on macOS
                    print_info "netstat is already available on macOS"
                else
                    packages+=("net-tools")
                fi
                ;;
            ss)
                if [ "$os" = "macos" ]; then
                    # ss is not available on macOS, use netstat as alternative
                    print_info "ss is not available on macOS, using netstat as alternative"
                else
                    packages+=("iproute2")
                fi
                ;;
            curl)
                if [ "$os" = "macos" ]; then
                    # curl comes preinstalled on macOS
                    print_info "curl is already available on macOS"
                else
                    packages+=("curl")
                fi
                ;;
            pgrep)
                if [ "$os" = "macos" ]; then
                    # pgrep comes preinstalled on macOS
                    print_info "pgrep is already available on macOS"
                elif [[ "$os" == "arch" || "$os" == "manjaro" ]]; then
                    packages+=("procps-ng")
                else
                    packages+=("procps")
                fi
                ;;
        esac
    done
    
    # Remove duplicates and empty entries
    local unique_packages=($(printf "%s\n" "${packages[@]}" | grep -v '^$' | sort -u))
    
    # If no packages to install (all come preinstalled on macOS)
    if [ ${#unique_packages[@]} -eq 0 ]; then
        print_success "All tools are available (preinstalled on macOS)"
        return 0
    fi
    
    print_warning "Missing tools: ${tools[*]}"
    print_info "Will attempt to install using: $install_cmd"
    print_info "Packages to install: ${unique_packages[*]}"
    
    if [ "$auto_install" = false ]; then
        echo ""
        read -p "Do you want to install these tools now? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warning "Installation cancelled. Please install manually: ${tools[*]}"
            return 1
        fi
    else
        print_info "Automatic mode: installing tools without confirmation..."
    fi
    
    print_step "Installing system tools..."
    
    # Log to file
    ensure_logs_dir
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Installing system tools: ${unique_packages[*]}" >> "$LOGS_DIR/install.log" 2>&1
    
    if eval "$install_cmd ${unique_packages[*]}" >> "$LOGS_DIR/install.log" 2>&1; then
        print_success "Tools installed successfully"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Tools installed successfully" >> "$LOGS_DIR/install.log" 2>&1
        return 0
    else
        print_error "Error installing tools"
        print_info "Check logs at: $LOGS_DIR/install.log"
        print_info "You can install manually: ${unique_packages[*]}"
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to install tools" >> "$LOGS_DIR/install.log" 2>&1
        return 1
    fi
}

# ============================================================================
# FUNCTION: CHECK PROJECT DEPENDENCIES
# ============================================================================

check_project_dependencies() {
    local missing_deps=()
    
    # Check frontend dependencies
    if [ ! -d "$WEB_DIR/node_modules" ]; then
        missing_deps+=("frontend")
    fi
    
    # Check smart contract dependencies
    # Check that lib/ exists AND forge-std is inside
    if [ ! -d "$SC_DIR/lib" ] || [ ! -d "$SC_DIR/lib/forge-std" ]; then
        missing_deps+=("smart-contract")
    fi
    
    if [ ${#missing_deps[@]} -eq 0 ]; then
        return 0
    else
        # Print missing dependencies
        echo "${missing_deps[@]}"
        return 1
    fi
}

# ============================================================================
# FUNCTION: INSTALL PROJECT DEPENDENCIES
# ============================================================================

install_project_dependencies() {
    local deps=("$@")
    local auto_install=false
    
    # Check if should install automatically
    if [ "${AUTO_INSTALL:-false}" = "true" ]; then
        auto_install=true
    fi
    
    for dep in "${deps[@]}"; do
        case "$dep" in
            frontend)
                # Check that npm is available
                if ! command -v npm >/dev/null 2>&1; then
                    print_error "npm is not installed. Cannot install frontend dependencies."
                    print_info "Install Node.js and npm first."
                    return 1
                fi
                
                print_step "Installing frontend dependencies..."
                print_info "This may take several minutes..."
                
                cd "$WEB_DIR"
                
                # Log start
                ensure_logs_dir
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting frontend dependencies installation..." >> "$LOGS_DIR/install.log" 2>&1
                
                # Install with timeout (30 minutes = 1800 seconds)
                # timeout may not be available on macOS, use if available
                local timeout_cmd=""
                if command -v timeout >/dev/null 2>&1; then
                    timeout_cmd="timeout 1800"
                elif command -v gtimeout >/dev/null 2>&1; then
                    # macOS with Homebrew coreutils
                    timeout_cmd="gtimeout 1800"
                fi
                
                if [ -n "$timeout_cmd" ]; then
                    # With timeout
                    if $timeout_cmd npm install --progress=true 2>&1 | tee -a "$LOGS_DIR/install.log" | while IFS= read -r line; do
                        # Show real-time progress
                        if [[ "$line" =~ (^[0-9]+/[0-9]+|^added|^removed|^changed|^audited) ]]; then
                            echo -ne "\r${BLUE}ℹ${NC} $line"
                        fi
                    done; then
                        echo "" # New line after progress
                        print_success "Frontend dependencies installed"
                        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Frontend dependencies installed successfully" >> "$LOGS_DIR/install.log" 2>&1
                    else
                        local exit_code=${PIPESTATUS[0]}
                        echo "" # New line
                        if [ $exit_code -eq 124 ]; then
                            print_error "Timeout: Frontend dependencies installation exceeded 30 minutes"
                        else
                            print_error "Error installing frontend dependencies"
                        fi
                        print_info "Check logs at: $LOGS_DIR/install.log"
                        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to install frontend dependencies (code: $exit_code)" >> "$LOGS_DIR/install.log" 2>&1
                        cd "$PROJECT_ROOT"
                        return 1
                    fi
                else
                    # Without timeout (macOS without coreutils)
                    print_info "Note: timeout not available, installation without time limit"
                    if npm install --progress=true 2>&1 | tee -a "$LOGS_DIR/install.log" | while IFS= read -r line; do
                        # Show real-time progress
                        if [[ "$line" =~ (^[0-9]+/[0-9]+|^added|^removed|^changed|^audited) ]]; then
                            echo -ne "\r${BLUE}ℹ${NC} $line"
                        fi
                    done; then
                        echo "" # New line after progress
                        print_success "Frontend dependencies installed"
                        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Frontend dependencies installed successfully" >> "$LOGS_DIR/install.log" 2>&1
                    else
                        local exit_code=${PIPESTATUS[0]}
                        echo "" # New line
                        print_error "Error installing frontend dependencies"
                        print_info "Check logs at: $LOGS_DIR/install.log"
                        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to install frontend dependencies (code: $exit_code)" >> "$LOGS_DIR/install.log" 2>&1
                        cd "$PROJECT_ROOT"
                        return 1
                    fi
                fi
                cd "$PROJECT_ROOT"
                ;;
            smart-contract)
                # Check that forge is available
                if ! command -v forge >/dev/null 2>&1; then
                    print_error "forge is not installed. Cannot install smart contract dependencies."
                    print_info "Install Foundry first: curl -L https://foundry.paradigm.xyz | bash && foundryup"
                    return 1
                fi
                
                print_step "Installing smart contract dependencies..."
                print_info "Installing forge-std and other dependencies..."
                
                cd "$SC_DIR"
                
                # Log start
                ensure_logs_dir
                echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting smart contract dependencies installation..." >> "$LOGS_DIR/install.log" 2>&1
                
                # Install with timeout (10 minutes = 600 seconds) if available
                local timeout_cmd=""
                if command -v timeout >/dev/null 2>&1; then
                    timeout_cmd="timeout 600"
                elif command -v gtimeout >/dev/null 2>&1; then
                    # macOS with Homebrew coreutils (gtimeout)
                    timeout_cmd="gtimeout 600"
                fi
                
                if [ -n "$timeout_cmd" ]; then
                    # With timeout
                    if $timeout_cmd forge install 2>&1 | tee -a "$LOGS_DIR/install.log" | while IFS= read -r line; do
                        # Show progress
                        if [[ "$line" =~ (Installing|Installed|Cloning|Updating) ]]; then
                            echo -ne "\r${BLUE}ℹ${NC} $line"
                        fi
                    done; then
                        echo "" # New line after progress
                        print_success "Smart contract dependencies installed"
                        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Smart contract dependencies installed successfully" >> "$LOGS_DIR/install.log" 2>&1
                    else
                        local exit_code=${PIPESTATUS[0]}
                        echo "" # New line
                        if [ $exit_code -eq 124 ]; then
                            print_error "Timeout: Smart contract dependencies installation exceeded 10 minutes"
                        else
                            print_error "Error installing smart contract dependencies"
                        fi
                        print_info "Check logs at: $LOGS_DIR/install.log"
                        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to install smart contract dependencies (code: $exit_code)" >> "$LOGS_DIR/install.log" 2>&1
                        cd "$PROJECT_ROOT"
                        return 1
                    fi
                else
                    # Without timeout (macOS without coreutils)
                    print_info "Note: timeout not available, installation without time limit"
                    if forge install 2>&1 | tee -a "$LOGS_DIR/install.log" | while IFS= read -r line; do
                        # Show progress
                        if [[ "$line" =~ (Installing|Installed|Cloning|Updating) ]]; then
                            echo -ne "\r${BLUE}ℹ${NC} $line"
                        fi
                    done; then
                        echo "" # New line after progress
                        print_success "Smart contract dependencies installed"
                        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Smart contract dependencies installed successfully" >> "$LOGS_DIR/install.log" 2>&1
                    else
                        local exit_code=${PIPESTATUS[0]}
                        echo "" # New line
                        print_error "Error installing smart contract dependencies"
                        print_info "Check logs at: $LOGS_DIR/install.log"
                        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: Failed to install smart contract dependencies (code: $exit_code)" >> "$LOGS_DIR/install.log" 2>&1
                        cd "$PROJECT_ROOT"
                        return 1
                    fi
                fi
                cd "$PROJECT_ROOT"
                ;;
        esac
    done
    
    return 0
}

# ============================================================================
# FUNCTION: SETUP ENVIRONMENT VARIABLES
# ============================================================================

setup_environment_variables() {
    local env_file="$WEB_DIR/.env.local"
    local MODERN_DESIGN=""
    local DEBUG_MODE=""
    local DEBUG_TOKENS=""
    local auto_mode=false
    
    # Check if in automatic mode
    if [ "${AUTO_INSTALL:-false}" = "true" ]; then
        auto_mode=true
        # Default values in automatic mode
        MODERN_DESIGN="true"
        DEBUG_MODE="false"
        DEBUG_TOKENS="false"
        print_info "Automatic mode: using default values"
        print_info "  - NEXT_PUBLIC_MODERN_DESIGN=true (modern mode enabled)"
        print_info "  - NEXT_PUBLIC_DEBUG_MODE=false"
        print_info "  - NEXT_PUBLIC_DEBUG_TOKENS=false"
    fi
    
    # Parse arguments
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
    
    # If parameters were passed, validate them
    if [ "$use_params" = true ]; then
        # Validate MODERN_DESIGN
        if [ -n "$MODERN_DESIGN" ]; then
            if [[ ! "$MODERN_DESIGN" =~ ^(true|false)$ ]]; then
                print_error "Invalid value for --modern-design: $MODERN_DESIGN (must be 'true' or 'false')"
                return 1
            fi
        fi
        
        # Validate DEBUG_MODE
        if [ -n "$DEBUG_MODE" ]; then
            if [[ ! "$DEBUG_MODE" =~ ^(true|false)$ ]]; then
                print_error "Invalid value for --debug-mode: $DEBUG_MODE (must be 'true' or 'false')"
                return 1
            fi
        fi
        
        # Validate DEBUG_TOKENS
        if [ -n "$DEBUG_TOKENS" ]; then
            if [[ ! "$DEBUG_TOKENS" =~ ^(true|false)$ ]]; then
                print_error "Invalid value for --debug-tokens: $DEBUG_TOKENS (must be 'true' or 'false')"
                return 1
            fi
        fi
        
        # If --all was used, verify all values are present
        if [ "$all_params" = true ]; then
            if [ -z "$MODERN_DESIGN" ] || [ -z "$DEBUG_MODE" ] || [ -z "$DEBUG_TOKENS" ]; then
                print_error "Incorrect usage of --all. Must be: --all <modern-design> <debug-mode> <debug-tokens>"
                return 1
            fi
        fi
    fi
    
    # Check if file already exists
    if [ -f "$env_file" ]; then
        if [ "$use_params" = false ] && [ "$auto_mode" = false ]; then
            print_info ".env.local file already exists"
            read -p "Do you want to update the configuration? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                return 0
            fi
        elif [ "$auto_mode" = true ]; then
            print_warning ".env.local file already exists. Will be overwritten with default values."
        else
            print_warning ".env.local file already exists. Will be overwritten."
        fi
    fi
    
    # If no parameters were passed and not in automatic mode, ask interactively
    if [ "$use_params" = false ] && [ "$auto_mode" = false ]; then
        print_header "Environment Variables Configuration"
        
        # Modern Design
        echo ""
        echo "Do you want to enable modern design 2025? (glassmorphism, gradients)"
        read -p "(Y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            MODERN_DESIGN="true"
        else
            MODERN_DESIGN="false"
        fi
        
        # Debug Mode
        echo ""
        echo "Do you want to enable debug mode? (additional console logs)"
        read -p "(y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            DEBUG_MODE="true"
        else
            DEBUG_MODE="false"
        fi
        
        # Debug Tokens
        echo ""
        echo "Do you want to enable token debug? (additional token information)"
        read -p "(y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            DEBUG_TOKENS="true"
        else
            DEBUG_TOKENS="false"
        fi
    else
        # Use default values if not provided
        # MODERN_DESIGN is always true by default (modern mode enabled)
        MODERN_DESIGN=${MODERN_DESIGN:-"true"}
        DEBUG_MODE=${DEBUG_MODE:-"false"}
        DEBUG_TOKENS=${DEBUG_TOKENS:-"false"}
    fi
    
    # Create .env.local file
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
    
    print_success ".env.local file created/updated at: $env_file"
    print_info "Configured values:"
    print_info "  - NEXT_PUBLIC_MODERN_DESIGN=$MODERN_DESIGN"
    print_info "  - NEXT_PUBLIC_DEBUG_MODE=$DEBUG_MODE"
    print_info "  - NEXT_PUBLIC_DEBUG_TOKENS=$DEBUG_TOKENS"
    
    # Log to file
    ensure_logs_dir
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Environment variables configured: MODERN_DESIGN=$MODERN_DESIGN, DEBUG_MODE=$DEBUG_MODE, DEBUG_TOKENS=$DEBUG_TOKENS" >> "$LOGS_DIR/install.log" 2>&1
    
    return 0
}

# ============================================================================
# FUNCTION: COMPLETE PRE-START VERIFICATION
# ============================================================================

pre_start_check() {
    ensure_logs_dir  # Ensure logs/ exists for installation logs
    
    print_header "Pre-Start Verification"
    
    local errors=0
    local warnings=0
    local auto_mode=false
    
    # Check if in automatic mode
    if [ "${AUTO_INSTALL:-false}" = "true" ]; then
        auto_mode=true
        print_info "Automatic mode enabled: installations without confirmation"
        print_info "Default values that will be used:"
        print_info "  - System tools: will be installed automatically"
        print_info "  - Project dependencies: will be installed automatically"
        print_info "  - Environment variables: MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false"
    fi
    
    # 1. Check system tools
    print_step "Checking system tools..."
    local missing_tools=$(check_system_tools)
    if [ $? -ne 0 ]; then
        print_warning "Missing tools: $missing_tools"
        if install_system_tools $missing_tools; then
            print_success "Tools installed successfully"
        else
            print_error "Could not install tools. Aborting."
            errors=$((errors + 1))
        fi
    else
        print_success "All system tools are installed"
    fi
    
    # 2. Check basic requirements
    print_step "Checking basic requirements..."
    local os=$(detect_os)
    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed"
        print_info "Install Node.js v18+ from: https://nodejs.org/"
        if [ "$os" = "macos" ]; then
            print_info "  macOS: brew install node"
            print_info "  Or download from: https://nodejs.org/"
        else
            print_info "  Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
            print_info "  Fedora/RHEL: sudo dnf install -y nodejs npm"
            print_info "  Arch/Manjaro: sudo pacman -S nodejs npm"
        fi
        errors=$((errors + 1))
    else
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 18 ]; then
            print_error "Node.js version $node_version is too old. v18+ required"
            errors=$((errors + 1))
        else
            print_success "Node.js $(node --version) installed"
        fi
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed"
        errors=$((errors + 1))
    else
        print_success "npm $(npm --version) installed"
    fi
    
    if ! command -v forge >/dev/null 2>&1; then
        print_error "Foundry (forge) is not installed"
        if [ "$os" = "macos" ]; then
            print_info "Install Foundry with:"
            print_info "  curl -L https://foundry.paradigm.xyz | bash"
            print_info "  foundryup"
            print_info "Or using Homebrew: brew install foundry"
        else
            print_info "Install Foundry with: curl -L https://foundry.paradigm.xyz | bash && foundryup"
        fi
        errors=$((errors + 1))
    else
        print_success "Foundry installed"
    fi
    
    if ! command -v anvil >/dev/null 2>&1; then
        print_error "Foundry (anvil) is not installed"
        if [ "$os" = "macos" ]; then
            print_info "Run: foundryup"
            print_info "Or using Homebrew: brew install foundry"
        else
            print_info "Run: foundryup"
        fi
        errors=$((errors + 1))
    else
        print_success "Anvil installed"
    fi
    
    # If there are critical errors, abort
    if [ $errors -gt 0 ]; then
        print_error "❌ Found $errors critical error(s). Aborting."
        print_info "Fix the errors before continuing."
        return 1
    fi
    
    # 3. Check project dependencies
    print_step "Checking project dependencies..."
    # Check dependencies directly (more reliable than using function with $())
    local missing_deps=()
    
    # Check frontend dependencies
    if [ ! -d "$WEB_DIR/node_modules" ]; then
        missing_deps+=("frontend")
    fi
    
    # Check smart contract dependencies
    if [ ! -d "$SC_DIR/lib" ] || [ ! -d "$SC_DIR/lib/forge-std" ]; then
        missing_deps+=("smart-contract")
    fi
    
    # If there are missing dependencies, process them
    if [ ${#missing_deps[@]} -ne 0 ]; then
        local missing_deps_str="${missing_deps[*]}"
        print_warning "Missing dependencies: $missing_deps_str"
        
        if [ "$auto_mode" = false ]; then
            echo ""
            read -p "Do you want to install missing dependencies now? (Y/n): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Nn]$ ]]; then
                print_warning "Installation cancelled. You must install manually:"
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
                    print_error "Error installing dependencies. Aborting."
                    errors=$((errors + 1))
                fi
            fi
        else
            # Automatic mode: install without asking
            print_info "Automatic mode: installing dependencies without confirmation..."
            if ! install_project_dependencies $missing_deps; then
                print_error "Error installing dependencies. Aborting."
                errors=$((errors + 1))
            fi
        fi
    else
        print_success "All project dependencies are installed"
    fi
    
    # If there are errors after trying to install, abort
    if [ $errors -gt 0 ]; then
        print_error "❌ Found $errors error(s). Aborting."
        return 1
    fi
    
    # 4. Configure environment variables (optional, not critical)
    if [ ! -f "$WEB_DIR/.env.local" ]; then
        print_step "Environment variables configuration..."
        if [ "$auto_mode" = false ]; then
            echo ""
            read -p "Do you want to configure environment variables now? (Y/n): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Nn]$ ]]; then
                setup_environment_variables
            else
                print_info "You can configure them later with: ./deploy.sh env"
            fi
        else
            # Automatic mode: configure with default values
            print_info "Automatic mode: configuring environment variables with default values..."
            setup_environment_variables
        fi
    else
        print_success ".env.local file found"
    fi
    
    # Summary
    echo ""
    if [ $errors -eq 0 ]; then
        if [ $warnings -eq 0 ]; then
            print_success "✅ All verifications passed successfully"
        else
            print_warning "⚠️  Verification completed with $warnings warning(s)"
        fi
        return 0
    else
        print_error "❌ Found $errors error(s). Aborting."
        return 1
    fi
}

# Function to check if a port is in use
check_port() {
    local port=$1
    local os=$(detect_os)
    
    # Check both IPv4 and IPv6 using multiple methods
    # Method 1: lsof (works on Linux and macOS)
    if lsof -i :$port -t >/dev/null 2>&1; then
        return 0  # Port in use
    fi
    
    # Method 2: netstat (works on Linux and macOS, but with different syntax)
    if [ "$os" = "macos" ]; then
        # macOS: netstat doesn't have -p, use -an
        if netstat -an 2>/dev/null | grep -q "\.$port " || netstat -an 2>/dev/null | grep -q ":$port "; then
            return 0  # Port in use
        fi
    else
        # Linux: netstat with -p
        if netstat -tlnp 2>/dev/null | grep -q ":$port "; then
            return 0  # Port in use
        fi
        # Method 3: ss (only on Linux, modern alternative)
        if ss -tlnp 2>/dev/null | grep -q ":$port "; then
            return 0  # Port in use
        fi
    fi
    
    return 1  # Port free
}

# Function to get PID of a process on a port
get_pid_by_port() {
    local port=$1
    # Get PID for both IPv4 and IPv6
    lsof -ti :$port 2>/dev/null | head -n 1 || echo ""
}

# Function to wait for a port to be in use (service started)
wait_for_port() {
    local port=$1
    local timeout=${2:-30}
    local elapsed=0
    
    print_step "Waiting for port $port to be in use (service started)..."
    
    while [ $elapsed -lt $timeout ]; do
        if check_port $port; then
            print_success "Port $port is in use (service started)"
            return 0
        fi
        sleep 1
        elapsed=$((elapsed + 1))
    done
    
    print_error "Timeout waiting for port $port (service did not start)"
    return 1
}

# ============================================================================
# FUNCTION: START ANVIL
# ============================================================================

start_anvil() {
    print_header "STEP 1: Start Anvil (Local Blockchain)"
    
    # Check if Anvil is already running
    local existing_anvil_pid=$(pgrep -f "anvil.*--port $ANVIL_PORT" | head -n 1)
    if [ -n "$existing_anvil_pid" ]; then
        print_warning "Anvil is already running on port $ANVIL_PORT (PID: $existing_anvil_pid)"
        echo "$existing_anvil_pid" > "$ANVIL_PID_FILE"
        return 0
    fi
    
    print_step "Starting Anvil on $ANVIL_HOST:$ANVIL_PORT with Chain ID $ANVIL_CHAIN_ID..."
    
    # Check and show persistence state
    local state_exists=false
    local state_size=""
    if [ -f "$ANVIL_STATE_FILE" ]; then
        state_exists=true
        state_size=$(du -h "$ANVIL_STATE_FILE" 2>/dev/null | cut -f1)
        print_success "✅ Persistent state found: $ANVIL_STATE_FILE"
        print_info "   📊 Size: $state_size"
        print_info "   🔄 Anvil will restore previous state (tokens, transfers, users)"
    else
        print_info "ℹ️  Starting with clean blockchain (no previous state)"
        print_info "   📝 State will be saved to: $ANVIL_STATE_FILE"
    fi
    
    # Start Anvil in background with nohup and state persistence
    cd "$SC_DIR"
    print_step "Starting Anvil with state persistence enabled..."
    nohup anvil \
        --host "$ANVIL_HOST" \
        --port "$ANVIL_PORT" \
        --chain-id "$ANVIL_CHAIN_ID" \
        --state "$ANVIL_STATE_FILE" \
        --accounts 15 \
        > "$ANVIL_LOG_FILE" 2>&1 &
    
    local anvil_pid=$!
    echo "$anvil_pid" > "$ANVIL_PID_FILE"
    
    print_info "Anvil started with PID: $anvil_pid"
    print_info "Logs: $ANVIL_LOG_FILE"
    
    # Wait for Anvil to be ready
    if wait_for_port $ANVIL_PORT 10; then
        # Validate that Anvil is running with persistence
        sleep 1
        if pgrep -f "anvil.*--state.*$ANVIL_STATE_FILE" > /dev/null; then
            print_success "Anvil started successfully"
            print_success "✅ State persistence: ENABLED"
            print_info "   📁 State file: $ANVIL_STATE_FILE"
            if [ "$state_exists" = true ]; then
                print_info "   ✅ Previous state restored ($state_size)"
            else
                print_info "   📝 New state will be saved automatically"
            fi
        else
            print_warning "Anvil started, but could not verify --state flag"
            print_info "Verify manually: ps aux | grep anvil | grep --state"
        fi
        
        # Show available accounts
        print_info "Deployer account: $DEPLOYER_ADDRESS"
        print_info "Initial balance: 10,000 ETH"
        
        return 0
    else
        print_error "Anvil could not start correctly"
        return 1
    fi
}

# ============================================================================
# FUNCTION: DEPLOY SMART CONTRACT
# ============================================================================

deploy_contract() {
    print_header "STEP 2: Deploy Smart Contract"
    
    if ! check_port $ANVIL_PORT; then
        print_error "Anvil is not running. Start Anvil first."
        return 1
    fi
    
    # Check if contract is already deployed and Anvil is still running
    local contract_address_file="$LOGS_DIR/contract_address.txt"
    if [ -f "$contract_address_file" ]; then
        local existing_contract=$(cat "$contract_address_file")
        if [ -n "$existing_contract" ]; then
            # Check if contract is still accessible (Anvil didn't restart)
            local rpc_check=$(curl -s -X POST \
                -H "Content-Type: application/json" \
                --data '{"jsonrpc":"2.0","method":"eth_getCode","params":["'$existing_contract'","latest"],"id":1}' \
                "http://$ANVIL_HOST:$ANVIL_PORT" 2>/dev/null)
            
            # If contract has code (not "0x"), it's deployed
            if echo "$rpc_check" | grep -q '"result":"0x[0-9a-f]\{10,\}"'; then
                print_warning "Contract already deployed at: $existing_contract"
                print_info "Anvil did not restart, using existing contract"
                print_info "To redeploy, run: ./deploy.sh restart"
                return 0
            else
                print_warning "Previous contract not found (Anvil restarted)"
                print_info "Deploying new contract..."
            fi
        fi
    fi
    
    # Ensure contract is compiled before deploying (to have updated ABI)
    print_step "Compiling contract to ensure updated ABI..."
    cd "$SC_DIR"
    if ! forge build --force > /dev/null 2>&1; then
        print_error "Error compiling contract"
        return 1
    fi
    print_success "Contract compiled successfully"
    
    print_step "Deploying SupplyChain.sol to Anvil..."
    
    # Execute deployment script
    local deploy_output=$(PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY forge script \
        script/SupplyChainDeploy.s.sol:SupplyChainDeployScript \
        --rpc-url "http://$ANVIL_HOST:$ANVIL_PORT" \
        --broadcast \
        2>&1)
    
    echo "$deploy_output" > "$DEPLOY_LOG_FILE"
    
    # Extract contract address from output
    local contract_address=$(echo "$deploy_output" | grep -oP 'Contract Address: \K0x[a-fA-F0-9]{40}' | head -1)
    
    if [ -z "$contract_address" ]; then
        # Try to extract in another way
        contract_address=$(echo "$deploy_output" | grep -oP 'deployed at: \K0x[a-fA-F0-9]{40}' | head -1)
    fi
    
    if [ -z "$contract_address" ]; then
        print_error "Could not get contract address"
        print_info "Check logs at: $DEPLOY_LOG_FILE"
        return 1
    fi
    
    print_success "Contract deployed successfully"
    print_info "Address: $contract_address"
    print_info "Owner: $DEPLOYER_ADDRESS"
    print_info "Logs: $DEPLOY_LOG_FILE"
    
    # Save address for next step
    echo "$contract_address" > "$LOGS_DIR/contract_address.txt"
    
    return 0
}

# ============================================================================
# FUNCTION: UPDATE FRONTEND CONFIGURATION
# ============================================================================

update_frontend_config() {
    print_header "STEP 3: Update Frontend Configuration"
    
    local contract_address_file="$LOGS_DIR/contract_address.txt"
    
    if [ ! -f "$contract_address_file" ]; then
        print_error "Contract address file not found"
        return 1
    fi
    
    local contract_address=$(cat "$contract_address_file")
    
    if [ -z "$contract_address" ]; then
        print_error "Contract address is empty"
        return 1
    fi
    
    # ============================================================
    # 3.1: Update contract ABI
    # ============================================================
    print_step "Updating contract ABI..."
    
    if [ ! -f "$ABI_SOURCE" ]; then
        print_error "Source ABI not found: $ABI_SOURCE"
        print_info "Make sure the contract is compiled (forge build)"
        return 1
    fi
    
    # Make backup of existing ABI
    if [ -f "$ABI_FILE" ]; then
        cp "$ABI_FILE" "$ABI_FILE.backup"
        print_info "ABI backup created: $ABI_FILE.backup"
    fi
    
    # Copy updated ABI
    cp "$ABI_SOURCE" "$ABI_FILE"
    
    if [ -f "$ABI_FILE" ]; then
        print_success "ABI updated successfully"
        print_info "ABI copied from: $ABI_SOURCE"
    else
        print_error "Could not copy ABI"
        return 1
    fi
    
    # ============================================================
    # 3.2: Update contract address
    # ============================================================
    print_step "Updating $CONFIG_FILE with address: $contract_address"
    
    # Verify file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found: $CONFIG_FILE"
        return 1
    fi
    
    # Make backup of original file
    cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
    print_info "Backup created: $CONFIG_FILE.backup"
    
    # Update address using sed (compatible with Linux and macOS)
    local os=$(detect_os)
    if [ "$os" = "macos" ]; then
        # macOS requires empty string after -i
        sed -i '' "s/export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]\{40\}'/export const SUPPLY_CHAIN_ADDRESS = '$contract_address'/" "$CONFIG_FILE"
    else
        # Linux
        sed -i "s/export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]\{40\}'/export const SUPPLY_CHAIN_ADDRESS = '$contract_address'/" "$CONFIG_FILE"
    fi
    
    # Verify it was updated correctly
    if grep -q "$contract_address" "$CONFIG_FILE"; then
        print_success "Configuration updated successfully"
        print_info "New address: $contract_address"
        print_info "ABI updated from latest compilation"
        return 0
    else
        print_error "Could not update configuration"
        # Restore backups
        if [ -f "$CONFIG_FILE.backup" ]; then
        mv "$CONFIG_FILE.backup" "$CONFIG_FILE"
        fi
        if [ -f "$ABI_FILE.backup" ]; then
            mv "$ABI_FILE.backup" "$ABI_FILE"
        fi
        print_info "Configuration restored from backups"
        return 1
    fi
}

# ============================================================================
# FUNCTION: START FRONTEND
# ============================================================================

start_frontend() {
    print_header "STEP 4: Start Frontend (Next.js)"
    
    # Check if frontend is already running (search by port first, then by process)
    local existing_frontend_pid=$(get_pid_by_port $FRONTEND_PORT)
    if [ -z "$existing_frontend_pid" ]; then
        # If no process on port, search by name
        existing_frontend_pid=$(pgrep -f "next-server" 2>/dev/null | head -n 1)
    fi
    if [ -z "$existing_frontend_pid" ]; then
        existing_frontend_pid=$(pgrep -f "npm.*run dev" 2>/dev/null | head -n 1)
    fi
    
    if [ -n "$existing_frontend_pid" ] && kill -0 "$existing_frontend_pid" 2>/dev/null; then
        print_warning "Frontend is already running on port $FRONTEND_PORT (PID: $existing_frontend_pid)"
        echo "$existing_frontend_pid" > "$FRONTEND_PID_FILE"
        return 0
    fi
    
    print_step "Starting Next.js server on port $FRONTEND_PORT..."
    
    cd "$WEB_DIR"
    
    # Start Next.js in background with nohup
    nohup npm run dev > "$FRONTEND_LOG_FILE" 2>&1 &
    
    local frontend_pid=$!
    echo "$frontend_pid" > "$FRONTEND_PID_FILE"
    
    print_info "Frontend started with PID: $frontend_pid"
    print_info "Logs: $FRONTEND_LOG_FILE"
    
    # Wait for frontend to be ready
    if wait_for_port $FRONTEND_PORT 30; then
        print_success "Frontend started successfully"
        print_info "URL: http://localhost:$FRONTEND_PORT"
        return 0
    else
        print_error "Frontend could not start correctly"
        return 1
    fi
}

# ============================================================================
# FUNCTION: STOP SERVICES
# ============================================================================

stop_services() {
    print_header "Stopping Services"
    
    local stopped_count=0
    
    # Stop Frontend - Find all related processes
    local frontend_pids=""
    
    # Search by PID file
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local file_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$file_pid" 2>/dev/null; then
            frontend_pids="$frontend_pids $file_pid"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Search by port
    local port_pid=$(get_pid_by_port $FRONTEND_PORT)
    if [ -n "$port_pid" ]; then
        frontend_pids="$frontend_pids $port_pid"
    fi
    
    # Search by process name
    local process_pids=$(pgrep -f "next-server" 2>/dev/null || true)
    if [ -n "$process_pids" ]; then
        frontend_pids="$frontend_pids $process_pids"
    fi
    
    local npm_pids=$(pgrep -f "npm.*run dev" 2>/dev/null || true)
    if [ -n "$npm_pids" ]; then
        frontend_pids="$frontend_pids $npm_pids"
    fi
    
    # Remove duplicates and spaces
    frontend_pids=$(echo $frontend_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    if [ -n "$frontend_pids" ]; then
        print_step "Stopping Frontend (PIDs: $frontend_pids)..."
        for pid in $frontend_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done
            sleep 2
            
        # Force if still running
        for pid in $frontend_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
            
            print_success "Frontend stopped"
            stopped_count=$((stopped_count + 1))
    else
        print_info "Frontend is not running"
    fi
    
    # Stop Anvil - Find all related processes
    local anvil_pids=""
    
    # Search by PID file
    if [ -f "$ANVIL_PID_FILE" ]; then
        local file_pid=$(cat "$ANVIL_PID_FILE")
        if kill -0 "$file_pid" 2>/dev/null; then
            anvil_pids="$anvil_pids $file_pid"
        fi
        rm -f "$ANVIL_PID_FILE"
    fi
    
    # Search by port
    local port_pid=$(get_pid_by_port $ANVIL_PORT)
    if [ -n "$port_pid" ]; then
        anvil_pids="$anvil_pids $port_pid"
    fi
    
    # Search by process name
    local process_pids=$(pgrep -f "anvil.*--port $ANVIL_PORT" 2>/dev/null || true)
    if [ -n "$process_pids" ]; then
        anvil_pids="$anvil_pids $process_pids"
    fi
    
    # Remove duplicates and spaces
    anvil_pids=$(echo $anvil_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    if [ -n "$anvil_pids" ]; then
        print_step "Stopping Anvil (PIDs: $anvil_pids)..."
        for pid in $anvil_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done
            sleep 2
            
        # Force if still running
        for pid in $anvil_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
            
            print_success "Anvil stopped"
            stopped_count=$((stopped_count + 1))
    else
        print_info "Anvil is not running"
    fi
    
    if [ $stopped_count -eq 0 ]; then
        print_warning "No services are running"
    else
        print_success "Stopped $stopped_count service(s)"
    fi
}

# ============================================================================
# FUNCTION: SHOW STATUS
# ============================================================================

show_status() {
    print_header "Service Status"
    
    # Anvil status
    echo -e "${CYAN}Anvil (Local Blockchain):${NC}"
    local anvil_pid=$(pgrep -f "anvil.*--port $ANVIL_PORT" | head -n 1)
    if [ -n "$anvil_pid" ]; then
        print_success "RUNNING (PID: $anvil_pid, Port: $ANVIL_PORT)"
        print_info "RPC URL: http://$ANVIL_HOST:$ANVIL_PORT"
        print_info "Chain ID: $ANVIL_CHAIN_ID"
    else
        print_error "STOPPED"
    fi
    
    echo ""
    
    # Frontend status
    echo -e "${CYAN}Frontend (Next.js):${NC}"
    local frontend_pid=$(pgrep -f "next-server" 2>/dev/null || pgrep -f "npm.*run dev" 2>/dev/null | head -n 1)
    if [ -n "$frontend_pid" ]; then
        print_success "RUNNING (PID: $frontend_pid, Port: $FRONTEND_PORT)"
        print_info "URL: http://localhost:$FRONTEND_PORT"
    else
        print_error "STOPPED"
    fi
    
    echo ""
    
    # Contract information
    echo -e "${CYAN}Smart Contract:${NC}"
    if [ -f "$LOGS_DIR/contract_address.txt" ]; then
        local contract_address=$(cat "$LOGS_DIR/contract_address.txt")
        print_info "Address: $contract_address"
        print_info "Owner: $DEPLOYER_ADDRESS"
    else
        print_warning "Not deployed"
    fi
    
    echo ""
    
    # Log files
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
# FUNCTION: SHOW METAMASK INSTRUCTIONS
# ============================================================================

show_metamask_instructions() {
    print_header "MetaMask Configuration"
    
    echo -e "${YELLOW}📝 METAMASK CONFIGURATION INSTRUCTIONS${NC}\n"
    
    echo -e "${CYAN}1. Add Anvil Local Network:${NC}"
    echo "   • Open MetaMask → Network selector (top left)"
    echo "   • Click 'Add network' → 'Add a network manually'"
    echo "   • Fill in the following data:"
    echo ""
    echo -e "     ${GREEN}Network Name:${NC}     Anvil Local"
    echo -e "     ${GREEN}RPC URL:${NC}          http://$ANVIL_HOST:$ANVIL_PORT"
    echo -e "     ${GREEN}Chain ID:${NC}         $ANVIL_CHAIN_ID"
    echo -e "     ${GREEN}Currency Symbol:${NC}  ETH"
    echo ""
    echo "   • Click 'Save'"
    echo ""
    
    echo -e "${CYAN}2. Import Anvil Account (Owner):${NC}"
    echo "   • Open MetaMask → Account icon (top right)"
    echo "   • Click 'Import Account'"
    echo "   • Select 'Private Key'"
    echo "   • Paste the following private key:"
    echo ""
    echo -e "     ${GREEN}$DEPLOYER_PRIVATE_KEY${NC}"
    echo ""
    echo "   • Click 'Import'"
    echo ""
    echo -e "   ${YELLOW}⚠ IMPORTANT:${NC} This private key is ONLY for local development."
    echo "   NEVER use on mainnet or with real funds."
    echo ""
    
    echo -e "${CYAN}3. Verify Configuration:${NC}"
    echo "   • The imported account should have address: $DEPLOYER_ADDRESS"
    echo "   • Balance should be ~10,000 ETH"
    echo "   • Network should be on 'Anvil Local'"
    echo ""
    
    echo -e "${CYAN}4. Connect to DApp:${NC}"
    echo "   • Open http://localhost:$FRONTEND_PORT"
    echo "   • Click 'Connect MetaMask'"
    echo "   • Authorize connection in MetaMask"
    echo "   • Done! You should see your address and contract statistics"
    echo ""
    
    echo -e "${CYAN}5. Additional Accounts (Optional):${NC}"
    echo "   To test transfers between users, you can import more accounts:"
    echo ""
    echo -e "   ${YELLOW}Account #1:${NC} 0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    echo -e "   ${YELLOW}Private Key:${NC} 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    echo ""
    echo -e "   ${YELLOW}Account #2:${NC} 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    echo -e "   ${YELLOW}Private Key:${NC} 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    echo ""
}

# ============================================================================
# FUNCTION: FRONTEND ONLY MANAGEMENT
# ============================================================================

start_frontend_only() {
    ensure_logs_dir
    
    print_header "🚀 Start Frontend Only"
    
    # Verify Anvil is running
    if ! check_port $ANVIL_PORT; then
        print_error "Anvil is not running. Start Anvil first with: ./deploy.sh start"
        return 1
    fi
    
    # Verify contract is deployed
    local contract_address_file="$LOGS_DIR/contract_address.txt"
    if [ ! -f "$contract_address_file" ]; then
        print_error "Contract is not deployed. Run: ./deploy.sh start"
        return 1
    fi
    
    # Start frontend
    if ! start_frontend; then
        print_error "Could not start frontend"
        return 1
    fi
    
    print_success "Frontend started successfully"
    print_info "URL: http://localhost:$FRONTEND_PORT"
    print_info "Anvil and contract continue running"
}

stop_frontend_only() {
    print_header "🛑 Stop Frontend Only"
    
    local stopped=false
    
    # Stop Frontend - Find all related processes
    local frontend_pids=""
    
    # Search by PID file
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local file_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$file_pid" 2>/dev/null; then
            frontend_pids="$frontend_pids $file_pid"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Search by port
    local port_pid=$(get_pid_by_port $FRONTEND_PORT)
    if [ -n "$port_pid" ]; then
        frontend_pids="$frontend_pids $port_pid"
    fi
    
    # Search by process name
    local process_pids=$(pgrep -f "next-server" 2>/dev/null || true)
    if [ -n "$process_pids" ]; then
        frontend_pids="$frontend_pids $process_pids"
    fi
    
    local npm_pids=$(pgrep -f "npm.*run dev" 2>/dev/null || true)
    if [ -n "$npm_pids" ]; then
        frontend_pids="$frontend_pids $npm_pids"
    fi
    
    # Remove duplicates and spaces
    frontend_pids=$(echo $frontend_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    if [ -n "$frontend_pids" ]; then
        print_step "Stopping Frontend (PIDs: $frontend_pids)..."
        for pid in $frontend_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done
        sleep 2
        
        # Force if still running
        for pid in $frontend_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        
        print_success "Frontend stopped"
        stopped=true
    else
        print_info "Frontend is not running"
    fi
    
    if [ "$stopped" = true ]; then
        print_info "Anvil and contract continue running"
        print_info "To restart frontend: ./deploy.sh frontend start"
    fi
}

restart_frontend_only() {
    print_header "🔄 Restart Frontend Only"
    
    stop_frontend_only
    sleep 2
    start_frontend_only
}

# ============================================================================
# FUNCTION: STOP ANVIL ONLY
# ============================================================================

stop_anvil_only() {
    # Find all Anvil processes
    local anvil_pids=""
    
    # Search by PID file
    if [ -f "$ANVIL_PID_FILE" ]; then
        local file_pid=$(cat "$ANVIL_PID_FILE")
        if kill -0 "$file_pid" 2>/dev/null; then
            anvil_pids="$anvil_pids $file_pid"
        fi
        rm -f "$ANVIL_PID_FILE"
    fi
    
    # Search by port
    local port_pid=$(get_pid_by_port $ANVIL_PORT)
    if [ -n "$port_pid" ]; then
        anvil_pids="$anvil_pids $port_pid"
    fi
    
    # Search by process name
    local process_pids=$(pgrep -f "anvil.*--port $ANVIL_PORT" 2>/dev/null || true)
    if [ -n "$process_pids" ]; then
        anvil_pids="$anvil_pids $process_pids"
    fi
    
    # Remove duplicates and spaces
    anvil_pids=$(echo $anvil_pids | tr ' ' '\n' | sort -u | tr '\n' ' ')
    
    if [ -n "$anvil_pids" ]; then
        print_step "Stopping Anvil (PIDs: $anvil_pids)..."
        for pid in $anvil_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done
        sleep 2
        
        # Force if still running
        for pid in $anvil_pids; do
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null || true
            fi
        done
        
        # Verify it stopped
        sleep 1
        if check_port $ANVIL_PORT; then
            print_error "Could not stop Anvil completely"
            return 1
        else
            print_success "Anvil stopped successfully"
            return 0
        fi
    else
        print_info "Anvil is not running"
        return 0
    fi
}

# ============================================================================
# FUNCTION: CLEAN ANVIL STATE
# ============================================================================

clean_anvil_state() {
    print_header "🧹 Clean Anvil Persistent State"
    
    local anvil_running=false
    
    # Check if Anvil is running
    if check_port $ANVIL_PORT; then
        anvil_running=true
        print_warning "Anvil is running on port $ANVIL_PORT"
        print_warning "To clean state, Anvil must be stopped"
        echo ""
        read -p "Do you want to stop Anvil now? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_step "Stopping Anvil..."
            if ! stop_anvil_only; then
                print_error "Could not stop Anvil. Operation cancelled."
                return 1
            fi
            sleep 1
            anvil_running=false
        else
            print_info "Operation cancelled. State will not be cleaned while Anvil is running."
            return 0
        fi
    fi
    
    # Verify again that Anvil is not running
    if check_port $ANVIL_PORT; then
        print_error "Anvil is still running. Cannot clean state."
        return 1
    fi
    
    # Clean state
    if [ -f "$ANVIL_STATE_FILE" ]; then
        local state_size=$(du -h "$ANVIL_STATE_FILE" | cut -f1)
        print_warning "Deleting Anvil persistent state (size: $state_size)"
        print_warning "This will delete all local blockchain data (tokens, transfers, users)"
        echo ""
        read -p "Are you sure you want to delete the state? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -f "$ANVIL_STATE_FILE"
            print_success "Persistent state deleted"
            print_info "Anvil will start with a clean blockchain on next start"
            return 0
        else
            print_info "Operation cancelled. State was not deleted."
            return 0
        fi
    else
        print_info "No persistent state to delete"
        print_info "Anvil will start with a clean blockchain on next start"
        return 0
    fi
}

# ============================================================================
# FUNCTION: START (START EVERYTHING)
# ============================================================================

start_all() {
    ensure_logs_dir
    
    # NEW: Pre-start verification
    if ! pre_start_check; then
        print_error "Pre-start verification failed. Fix errors before continuing."
        print_info "You can run './deploy.sh setup' to verify and install dependencies"
        exit 1
    fi
    
    print_header "🚀 Starting Supply Chain Tracker"
    
    # Step 1: Start Anvil
    if ! start_anvil; then
        print_error "Could not start Anvil"
        exit 1
    fi
    
    sleep 2
    
    # Step 2: Deploy contract
    if ! deploy_contract; then
        print_error "Could not deploy contract"
        exit 1
    fi
    
    sleep 1
    
    # Step 3: Update configuration
    if ! update_frontend_config; then
        print_error "Could not update configuration"
        exit 1
    fi
    
    sleep 1
    
    # Step 4: Start frontend
    if ! start_frontend; then
        print_error "Could not start frontend"
        exit 1
    fi
    
    # Show summary
    print_header "✅ Deployment Completed"
    
    echo -e "${GREEN}All services are running correctly:${NC}\n"
    echo -e "  ${CYAN}Anvil:${NC}    http://$ANVIL_HOST:$ANVIL_PORT"
    echo -e "  ${CYAN}Frontend:${NC} http://localhost:$FRONTEND_PORT"
    echo -e "  ${CYAN}Contract:${NC} $(cat $LOGS_DIR/contract_address.txt)"
    echo ""
    
    # Show MetaMask instructions
    show_metamask_instructions
    
    print_info "To view status: ./deploy.sh status"
    print_info "To stop everything: ./deploy.sh stop"
}

# ============================================================================
# FUNCTION: HELP
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
    
    echo -e "${YELLOW}USAGE:${NC}"
    echo "  ./deploy.sh [command] [options]"
    echo ""
    
    echo -e "${YELLOW}MAIN COMMANDS:${NC}"
    echo -e "  ${GREEN}start${NC}           Start entire stack (Anvil + Deploy + Frontend)"
    echo -e "  ${GREEN}stop${NC}            Stop all services"
    echo -e "  ${GREEN}restart${NC}         Restart all services"
    echo -e "  ${GREEN}status${NC}          Show service status"
    echo -e "  ${GREEN}metamask${NC}        Show MetaMask configuration instructions"
    echo -e "  ${GREEN}clean${NC}           Clean Anvil persistent state (requires Anvil stopped)"
    echo ""
    
    echo -e "${YELLOW}CONFIGURATION COMMANDS:${NC}"
    echo -e "  ${GREEN}setup${NC}           Verify requirements and install missing dependencies"
    echo -e "  ${GREEN}env${NC}             Configure environment variables (.env.local)"
    echo ""
    
    echo -e "${YELLOW}FRONTEND COMMANDS (without affecting Anvil/Contract):${NC}"
    echo -e "  ${GREEN}frontend start${NC}  Start only frontend (requires Anvil running)"
    echo -e "  ${GREEN}frontend stop${NC}   Stop only frontend"
    echo -e "  ${GREEN}frontend restart${NC} Restart only frontend"
    echo ""
    
    echo -e "${YELLOW}OPTIONS:${NC}"
    echo -e "  ${GREEN}--yes${NC}, ${GREEN}--auto${NC}, ${GREEN}-y${NC}  Automatic mode (no confirmations)"
    echo ""
    
    echo -e "${YELLOW}EXAMPLES:${NC}"
    echo "  # First time - Complete setup"
    echo "  ./deploy.sh setup"
    echo "  ./deploy.sh env"
    echo "  ./deploy.sh start"
    echo ""
    echo "  # Automatic mode (no prompts)"
    echo "  ./deploy.sh setup --yes"
    echo "  ./deploy.sh start --auto"
    echo ""
    echo "  # Configure environment variables interactively"
    echo "  ./deploy.sh env"
    echo ""
    echo "  # Configure variables with parameters"
    echo "  ./deploy.sh env --modern-design true --debug-mode false"
    echo "  ./deploy.sh env --all true false false"
    echo ""
    echo "  # Start everything"
    echo "  ./deploy.sh start"
    echo ""
    echo "  # Stop only frontend (Anvil and contract continue running)"
    echo "  ./deploy.sh frontend stop"
    echo ""
    echo "  # Restart only frontend after changes"
    echo "  ./deploy.sh frontend restart"
    echo ""
    echo "  # View status"
    echo "  ./deploy.sh status"
    echo ""
    echo "  # Stop everything"
    echo "  ./deploy.sh stop"
    echo ""
    
    echo -e "${YELLOW}NOTE:${NC} Anvil now persists state between restarts."
    echo -e "      Use ${GREEN}./deploy.sh clean${NC} to clean the state."
    echo -e "      If Anvil is running, it will ask if you want to stop it first."
    echo ""
    
    echo -e "  ${GREEN}help${NC}             Show this help"
    echo ""
    
    echo -e "${YELLOW}LOGS:${NC}"
    echo "  Logs are saved in: $LOGS_DIR"
    echo "  • anvil.log     - Anvil logs"
    echo "  • frontend.log  - Frontend logs"
    echo "  • deploy.log    - Deployment logs"
    echo "  • install.log   - Dependency installation logs"
    echo ""
    
    echo -e "${YELLOW}PORTS:${NC}"
    echo "  • Anvil:    $ANVIL_PORT"
    echo "  • Frontend: $FRONTEND_PORT"
    echo ""
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    # Verify we are in the correct directory
    if [ ! -d "$SC_DIR" ] || [ ! -d "$WEB_DIR" ]; then
        print_error "This script must be run from the project root"
        print_info "Current directory: $PROJECT_ROOT"
        exit 1
    fi
    
    # Check automatic mode flags
    local auto_flag=false
    for arg in "$@"; do
        if [[ "$arg" == "--yes" || "$arg" == "--auto" || "$arg" == "-y" ]]; then
            auto_flag=true
            export AUTO_INSTALL=true
            break
        fi
    done
    
    # Process command
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
            shift  # Remove 'env' or 'environment'
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
                    print_error "Invalid frontend command: ${2:-}"
                    echo ""
                    echo "Available commands:"
                    echo "  ./deploy.sh frontend start    - Start only frontend"
                    echo "  ./deploy.sh frontend stop     - Stop only frontend"
                    echo "  ./deploy.sh frontend restart  - Restart only frontend"
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
            print_error "Invalid command: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Execute main with all arguments
main "$@"
