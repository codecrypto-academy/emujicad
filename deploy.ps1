################################################################################
# Supply Chain Tracker - Deployment Automation Script (PowerShell)
################################################################################
# 
# Description: Script to automate deployment of Anvil + Smart Contract + Frontend
# Author: Supply Chain Tracker Team
# Date: November 18, 2025
# Last Updated: November 28, 2025
# Version: 2.1.0 (PowerShell)
# Platform: Windows 10/11
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
#   - Pre-start verification and dependency installation
#   - Environment variable configuration
#   - Automatic mode support (--yes, --auto, -y)
#
# Usage:
#   .\deploy.ps1 start           - Start entire stack (Anvil + Contract + Frontend)
#   .\deploy.ps1 stop            - Stop all services
#   .\deploy.ps1 restart         - Restart entire stack
#   .\deploy.ps1 status          - Show service status
#   .\deploy.ps1 metamask        - Show MetaMask configuration instructions
#   .\deploy.ps1 clean           - Clean Anvil persistent state
#   .\deploy.ps1 setup           - Verify requirements and install missing dependencies
#   .\deploy.ps1 env             - Configure environment variables (.env.local)
#   .\deploy.ps1 frontend start  - Start only frontend
#   .\deploy.ps1 frontend stop   - Stop only frontend
#   .\deploy.ps1 frontend restart - Restart only frontend
#   .\deploy.ps1 help            - Show complete help
#
################################################################################

# Configure execution policy if needed (first time only)
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# ============================================================================
# CONFIGURATION
# ============================================================================

# Project directories
$PROJECT_ROOT = $PSScriptRoot
$SC_DIR = Join-Path $PROJECT_ROOT "sc"
$WEB_DIR = Join-Path $PROJECT_ROOT "web"
$LOGS_DIR = Join-Path $PROJECT_ROOT "logs"

# Process files
$ANVIL_PID_FILE = Join-Path $LOGS_DIR "anvil.pid"
$FRONTEND_PID_FILE = Join-Path $LOGS_DIR "frontend.pid"
$ANVIL_LOG_FILE = Join-Path $LOGS_DIR "anvil.log"
$FRONTEND_LOG_FILE = Join-Path $LOGS_DIR "frontend.log"
$DEPLOY_LOG_FILE = Join-Path $LOGS_DIR "deploy.log"
$INSTALL_LOG_FILE = Join-Path $LOGS_DIR "install.log"
$ANVIL_STATE_FILE = Join-Path $LOGS_DIR "anvil_state.json"

# Global variable for automatic mode
$script:AUTO_INSTALL = $false

# Network configuration
$ANVIL_PORT = 8545
$ANVIL_CHAIN_ID = 31337
$ANVIL_HOST = "127.0.0.1"
$FRONTEND_PORT = 3000

# Anvil account (Account #0)
$DEPLOYER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
$DEPLOYER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Frontend configuration files
$CONFIG_FILE = Join-Path $WEB_DIR "src\contracts\config.ts"
$ABI_FILE = Join-Path $WEB_DIR "src\contracts\SupplyChain.json"
$ABI_SOURCE = Join-Path $SC_DIR "out\SupplyChain.sol\SupplyChain.json"
$ENV_FILE = Join-Path $WEB_DIR ".env.local"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Print-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Print-Step {
    param([string]$Message)
    Write-Host "-> $Message" -ForegroundColor Magenta
}

# Function to create logs directory if it doesn't exist
function Ensure-LogsDir {
    if (-not (Test-Path $LOGS_DIR)) {
        New-Item -ItemType Directory -Path $LOGS_DIR -Force | Out-Null
        Print-Success "Logs directory created: $LOGS_DIR"
    }
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection) {
            return $true
        }
        return $false
    }
    catch {
        return $false
    }
}

# Function to get PID of a process on a port
function Get-PidByPort {
    param([int]$Port)
    
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($connection) {
            return $connection.OwningProcess
        }
        return $null
    }
    catch {
        return $null
    }
}

# Function to wait for a port to be in use (service started)
function Wait-ForPort {
    param(
        [int]$Port,
        [int]$Timeout = 30
    )
    
    Print-Step "Waiting for port $Port to be in use (service started)..."
    
    $elapsed = 0
    while ($elapsed -lt $Timeout) {
        if (Test-Port -Port $Port) {
            Print-Success "Port $Port is in use (service started)"
            return $true
        }
        Start-Sleep -Seconds 1
        $elapsed++
    }
    
    Print-Error "Timeout waiting for port $Port (service did not start)"
    return $false
}

# ============================================================================
# FUNCTION: CHECK SYSTEM TOOLS (Windows)
# ============================================================================

function Test-SystemTools {
    $missingTools = @()
    
    # In Windows, most tools come preinstalled or are available via PowerShell
    # Check for essential commands
    
    # curl - Usually available in Windows 10/11
    try {
        $null = Get-Command curl -ErrorAction Stop
    }
    catch {
        $missingTools += "curl"
    }
    
    # Get-NetTCPConnection is native to PowerShell, always available
    
    if ($missingTools.Count -eq 0) {
        return $true
    }
    else {
        return $false, $missingTools
    }
}

function Install-WingetPackage {
    param(
        [string]$Name,
        [string]$Id
    )
    
    # Check if winget is available
    if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
        Print-Error "winget is not available. Cannot install $Name automatically."
        return $false
    }
    
    $autoMode = $script:AUTO_INSTALL
    
    if (-not $autoMode) {
        Write-Host ""
        $response = Read-Host "Do you want to install $Name automatically via winget? (Y/n)"
        if ($response -match '^[Nn]$') {
            Print-Info "Installation cancelled."
            return $false
        }
    }
    
    Print-Step "Installing $Name ($Id) via winget..."
    
    try {
        $processInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processInfo.FileName = "winget"
        $processInfo.Arguments = "install -e --id $Id --accept-source-agreements --accept-package-agreements"
        $processInfo.UseShellExecute = $false
        $processInfo.RedirectStandardOutput = $true
        $processInfo.RedirectStandardError = $true
        
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processInfo
        $process.Start() | Out-Null
        $process.WaitForExit()
        
        if ($process.ExitCode -eq 0) {
            Print-Success "$Name installed successfully"
            Print-Info "You may need to restart your terminal for changes to take effect."
            return $true
        }
        else {
            Print-Error "Failed to install $Name (Exit code: $($process.ExitCode))"
            return $false
        }
    }
    catch {
        Print-Error "Error running winget: $($_.Exception.Message)"
        return $false
    }
}

# ============================================================================
# FUNCTION: CHECK PROJECT DEPENDENCIES
# ============================================================================

function Test-ProjectDependencies {
    $missingDeps = @()
    
    # Check frontend dependencies
    if (-not (Test-Path (Join-Path $WEB_DIR "node_modules"))) {
        $missingDeps += "frontend"
    }
    
    # Check smart contract dependencies
    if (-not (Test-Path (Join-Path $SC_DIR "lib")) -or -not (Test-Path (Join-Path $SC_DIR "lib\forge-std"))) {
        $missingDeps += "smart-contract"
    }
    
    if ($missingDeps.Count -eq 0) {
        return $true
    }
    else {
        return $false, $missingDeps
    }
}

# ============================================================================
# FUNCTION: INSTALL PROJECT DEPENDENCIES
# ============================================================================

function Install-ProjectDependencies {
    param([string[]]$Dependencies)
    
    $autoInstall = $script:AUTO_INSTALL
    
    foreach ($dep in $Dependencies) {
        switch ($dep) {
            "frontend" {
                # Check that npm is available
                $npmPath = Get-Command npm -ErrorAction SilentlyContinue
                if (-not $npmPath) {
                    Print-Error "npm is not installed. Cannot install frontend dependencies."
                    Print-Info "Install Node.js and npm first."
                    return $false
                }
                
                Print-Step "Installing frontend dependencies..."
                Print-Info "This may take several minutes..."
                
                Push-Location $WEB_DIR
                
                # Log start
                Ensure-LogsDir
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] Starting frontend dependencies installation..." -Encoding UTF8
                
                try {
                    # Install with progress
                    $installOutput = & npm install --progress=true 2>&1
                    $installOutput | Add-Content -Path $INSTALL_LOG_FILE -Encoding UTF8
                    
                    if ($LASTEXITCODE -eq 0) {
                        Print-Success "Frontend dependencies installed"
                        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                        Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] Frontend dependencies installed successfully" -Encoding UTF8
                    }
                    else {
                        Print-Error "Error installing frontend dependencies"
                        Print-Info "Check logs at: $INSTALL_LOG_FILE"
                        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                        Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] ERROR: Failed to install frontend dependencies (code: $LASTEXITCODE)" -Encoding UTF8
                        Pop-Location
                        return $false
                    }
                }
                catch {
                    Print-Error "Error installing frontend dependencies: $($_.Exception.Message)"
                    Print-Info "Check logs at: $INSTALL_LOG_FILE"
                    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] ERROR: Failed to install frontend dependencies" -Encoding UTF8
                    Pop-Location
                    return $false
                }
                
                Pop-Location
            }
            "smart-contract" {
                # Check that forge is available
                $forgePath = Get-Command forge -ErrorAction SilentlyContinue
                if (-not $forgePath) {
                    Print-Error "forge is not installed. Cannot install smart contract dependencies."
                    Print-Info "Install Foundry first: https://book.getfoundry.sh/getting-started/installation"
                    return $false
                }
                
                Print-Step "Installing smart contract dependencies..."
                Print-Info "Installing forge-std and other dependencies..."
                
                Push-Location $SC_DIR
                
                # Log start
                Ensure-LogsDir
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] Starting smart contract dependencies installation..." -Encoding UTF8
                
                try {
                    # Install dependencies
                    $installOutput = & forge install 2>&1
                    $installOutput | Add-Content -Path $INSTALL_LOG_FILE -Encoding UTF8
                    
                    if ($LASTEXITCODE -eq 0) {
                        Print-Success "Smart contract dependencies installed"
                        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                        Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] Smart contract dependencies installed successfully" -Encoding UTF8
                    }
                    else {
                        Print-Error "Error installing smart contract dependencies"
                        Print-Info "Check logs at: $INSTALL_LOG_FILE"
                        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                        Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] ERROR: Failed to install smart contract dependencies (code: $LASTEXITCODE)" -Encoding UTF8
                        Pop-Location
                        return $false
                    }
                }
                catch {
                    Print-Error "Error installing smart contract dependencies: $($_.Exception.Message)"
                    Print-Info "Check logs at: $INSTALL_LOG_FILE"
                    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                    Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] ERROR: Failed to install smart contract dependencies" -Encoding UTF8
                    Pop-Location
                    return $false
                }
                
                Pop-Location
            }
        }
    }
    
    return $true
}

# ============================================================================
# FUNCTION: SETUP ENVIRONMENT VARIABLES
# ============================================================================

function Set-EnvironmentVariables {
    param(
        [string]$ModernDesign = "",
        [string]$DebugMode = "",
        [string]$DebugTokens = "",
        [switch]$All,
        [string[]]$RemainingArgs = @()
    )
    
    $autoMode = $script:AUTO_INSTALL
    $useParams = $false
    $allParams = $false
    
    # Parse remaining arguments for --modern-design, --debug-mode, --debug-tokens, --all
    $i = 0
    while ($i -lt $RemainingArgs.Count) {
        switch ($RemainingArgs[$i]) {
            "--modern-design" {
                if ($i + 1 -lt $RemainingArgs.Count) {
                    $ModernDesign = $RemainingArgs[$i + 1]
                    $useParams = $true
                    $i += 2
                }
                else {
                    Print-Error "Missing value for --modern-design"
                    return $false
                }
            }
            "--debug-mode" {
                if ($i + 1 -lt $RemainingArgs.Count) {
                    $DebugMode = $RemainingArgs[$i + 1]
                    $useParams = $true
                    $i += 2
                }
                else {
                    Print-Error "Missing value for --debug-mode"
                    return $false
                }
            }
            "--debug-tokens" {
                if ($i + 1 -lt $RemainingArgs.Count) {
                    $DebugTokens = $RemainingArgs[$i + 1]
                    $useParams = $true
                    $i += 2
                }
                else {
                    Print-Error "Missing value for --debug-tokens"
                    return $false
                }
            }
            "--all" {
                if ($i + 3 -lt $RemainingArgs.Count) {
                    $ModernDesign = $RemainingArgs[$i + 1]
                    $DebugMode = $RemainingArgs[$i + 2]
                    $DebugTokens = $RemainingArgs[$i + 3]
                    $useParams = $true
                    $allParams = $true
                    $i += 4
                }
                else {
                    Print-Error "Incorrect usage of --all. Must be: --all <modern-design> <debug-mode> <debug-tokens>"
                    return $false
                }
            }
            default {
                $i++
            }
        }
    }
    
    # If parameters were passed, validate them
    if ($useParams) {
        # Validate MODERN_DESIGN
        if ($ModernDesign -and $ModernDesign -notmatch '^(true|false)$') {
            Print-Error "Invalid value for --modern-design: $ModernDesign (must be 'true' or 'false')"
            return $false
        }
        
        # Validate DEBUG_MODE
        if ($DebugMode -and $DebugMode -notmatch '^(true|false)$') {
            Print-Error "Invalid value for --debug-mode: $DebugMode (must be 'true' or 'false')"
            return $false
        }
        
        # Validate DEBUG_TOKENS
        if ($DebugTokens -and $DebugTokens -notmatch '^(true|false)$') {
            Print-Error "Invalid value for --debug-tokens: $DebugTokens (must be 'true' or 'false')"
            return $false
        }
        
        # If --all was used, verify all values are present
        if ($allParams) {
            if (-not $ModernDesign -or -not $DebugMode -or -not $DebugTokens) {
                Print-Error "Incorrect usage of --all. Must be: --all <modern-design> <debug-mode> <debug-tokens>"
                return $false
            }
        }
    }
    
    # Check if file already exists
    if (Test-Path $ENV_FILE) {
        if (-not $useParams -and -not $autoMode) {
            Print-Info ".env.local file already exists"
            $response = Read-Host "Do you want to update the configuration? (y/N)"
            if ($response -notmatch '^[Yy]$') {
                return $true
            }
        }
        elseif ($autoMode) {
            Print-Warning ".env.local file already exists. Will be overwritten with default values."
        }
        else {
            Print-Warning ".env.local file already exists. Will be overwritten."
        }
    }
    
    # If no parameters were passed and not in automatic mode, ask interactively
    if (-not $useParams -and -not $autoMode) {
        Print-Header "Environment Variables Configuration"
        
        # Modern Design
        Write-Host ""
        Write-Host "Do you want to enable modern design 2025? (glassmorphism, gradients)"
        $response = Read-Host "(Y/n)"
        if ($response -notmatch '^[Nn]$') {
            $ModernDesign = "true"
        }
        else {
            $ModernDesign = "false"
        }
        
        # Debug Mode
        Write-Host ""
        Write-Host "Do you want to enable debug mode? (additional console logs)"
        $response = Read-Host "(y/N)"
        if ($response -match '^[Yy]$') {
            $DebugMode = "true"
        }
        else {
            $DebugMode = "false"
        }
        
        # Debug Tokens
        Write-Host ""
        Write-Host "Do you want to enable token debug? (additional token information)"
        $response = Read-Host "(y/N)"
        if ($response -match '^[Yy]$') {
            $DebugTokens = "true"
        }
        else {
            $DebugTokens = "false"
        }
    }
    else {
        # Use default values if not provided
        # MODERN_DESIGN is always true by default (modern mode enabled)
        if (-not $ModernDesign) { $ModernDesign = "true" }
        if (-not $DebugMode) { $DebugMode = "false" }
        if (-not $DebugTokens) { $DebugTokens = "false" }
    }
    
    # Create .env.local file
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $envContent = @"
# Supply Chain Tracker - Environment Variables
# Generated automatically by deploy.ps1
# Last updated: $timestamp

# Modern Design 2025 (glassmorphism, gradients, animations)
# Options: true | false
NEXT_PUBLIC_MODERN_DESIGN=$ModernDesign

# Debug Mode (additional console logs)
# Options: true | false
NEXT_PUBLIC_DEBUG_MODE=$DebugMode

# Debug Tokens (additional token information)
# Options: true | false
NEXT_PUBLIC_DEBUG_TOKENS=$DebugTokens
"@
    
    $envContent | Out-File -FilePath $ENV_FILE -Encoding UTF8
    
    Print-Success ".env.local file created/updated at: $ENV_FILE"
    Print-Info "Configured values:"
    Print-Info "  - NEXT_PUBLIC_MODERN_DESIGN=$ModernDesign"
    Print-Info "  - NEXT_PUBLIC_DEBUG_MODE=$DebugMode"
    Print-Info "  - NEXT_PUBLIC_DEBUG_TOKENS=$DebugTokens"
    
    # Log to file
    Ensure-LogsDir
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $INSTALL_LOG_FILE -Value "[$timestamp] Environment variables configured: MODERN_DESIGN=$ModernDesign, DEBUG_MODE=$DebugMode, DEBUG_TOKENS=$DebugTokens" -Encoding UTF8
    
    return $true
}

# ============================================================================
# FUNCTION: PRE-START CHECK
# ============================================================================

function Start-PreStartCheck {
    Ensure-LogsDir
    
    Print-Header "Pre-Start Verification"
    
    $errors = 0
    $warnings = 0
    $autoMode = $script:AUTO_INSTALL
    
    # Check if in automatic mode
    if ($autoMode) {
        Print-Info "Automatic mode enabled: installations without confirmation"
        Print-Info "Default values that will be used:"
        Print-Info "  - System tools: will be verified (instructions shown if missing)"
        Print-Info "  - Project dependencies: will be installed automatically"
        Print-Info "  - Environment variables: MODERN_DESIGN=true, DEBUG_MODE=false, DEBUG_TOKENS=false"
    }
    
    # 1. Check system tools (Windows - most are preinstalled)
    Print-Step "Checking system tools..."
    $toolsResult = Test-SystemTools
    if ($toolsResult -is [array] -and -not $toolsResult[0]) {
        $missingTools = $toolsResult[1]
        Print-Warning "Missing tools: $($missingTools -join ', ')"
        Print-Info "On Windows, these tools may need manual installation:"
        Print-Info "  - curl: Usually preinstalled in Windows 10/11"
        Print-Info "  - Get-NetTCPConnection: Native PowerShell cmdlet (always available)"
        Print-Info "If curl is missing, install it manually or use PowerShell's Invoke-WebRequest"
    }
    else {
        Print-Success "All system tools are available"
    }
    
    # 2. Check basic requirements
    Print-Step "Checking basic requirements..."
    
    # Check Node.js
    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    
    # Check if node is in standard directories but not in PATH
    if (-not $nodePath) {
        $commonNodePaths = @(
            "C:\Program Files\nodejs\node.exe",
            "C:\Program Files (x86)\nodejs\node.exe"
        )
        
        foreach ($path in $commonNodePaths) {
            if (Test-Path $path) {
                $nodeDir = Split-Path $path -Parent
                $env:Path = "$env:Path;$nodeDir"
                Print-Info "Node.js detected at $path and added to PATH."
                $nodePath = $path
                break
            }
        }
    }

    if (-not $nodePath) {
        Print-Error "Node.js is not installed"
        
        # Try to install via winget
        if (Install-WingetPackage -Name "Node.js LTS" -Id "OpenJS.NodeJS.LTS") {
            # Refresh path to detect new installation (limited scope, might not work without restart)
            $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
            if (Get-Command node -ErrorAction SilentlyContinue) {
                Print-Success "Node.js detected after installation"
            }
            else {
                Print-Warning "Node.js installed but not detected. Please restart your terminal."
            }
        }
        else {
            Print-Info "Install Node.js v18+ from: https://nodejs.org/"
            Print-Info "  Or using winget manually: winget install OpenJS.NodeJS.LTS"
            $errors++
        }
    }
    else {
        $nodeVersion = (node --version) -replace 'v', ''
        $nodeMajorVersion = [int]($nodeVersion -split '\.')[0]
        if ($nodeMajorVersion -lt 18) {
            Print-Error "Node.js version $nodeVersion is too old. v18+ required"
            $errors++
        }
        else {
            Print-Success "Node.js $(node --version) installed"
        }
    }
    
    # Check npm
    $npmPath = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $npmPath) {
        Print-Error "npm is not installed"
        $errors++
    }
    else {
        Print-Success "npm $(npm --version) installed"
    }
    
    # Check Foundry (forge)
    $forgePath = Get-Command forge -ErrorAction SilentlyContinue
    
    # Check if forge is in the user's .foundry directory
    if (-not $forgePath) {
        $userFoundryPath = Join-Path $env:USERPROFILE ".foundry\bin\forge.exe"
        if (Test-Path $userFoundryPath) {
            # Add to PATH temporarily for this session
            $foundryBinDir = Join-Path $env:USERPROFILE ".foundry\bin"
            $env:Path = "$env:Path;$foundryBinDir"
            Print-Info "Foundry detected at $userFoundryPath and added to PATH."
            $forgePath = $userFoundryPath
        }
    }
    
    if (-not $forgePath) {
        Print-Error "Foundry (forge) is not installed"
        
        # We don't try winget for Foundry as it is often broken/missing
        # Instead we give clear instructions
        Print-Info "Automatic installation for Foundry is not available via winget."
        Print-Info "Please install Foundry manually:"
        Print-Info "  1. If you have Git Bash, run: curl -L https://foundry.paradigm.xyz | bash"
        Print-Info "  2. Or visit: https://book.getfoundry.sh/getting-started/installation"
        $errors++
    }
    else {
        Print-Success "Foundry installed"
    }
    
    # Check Anvil
    $anvilPath = Get-Command anvil -ErrorAction SilentlyContinue
    
    # Check if anvil is in the user's .foundry directory
    if (-not $anvilPath) {
        $userAnvilPath = Join-Path $env:USERPROFILE ".foundry\bin\anvil.exe"
        if (Test-Path $userAnvilPath) {
            # PATH should have been updated by forge check, but just in case
            if ($env:Path -notlike "*$env:USERPROFILE\.foundry\bin*") {
                $foundryBinDir = Join-Path $env:USERPROFILE ".foundry\bin"
                $env:Path = "$env:Path;$foundryBinDir"
            }
            Print-Info "Anvil detected at $userAnvilPath."
            $anvilPath = $userAnvilPath
        }
    }

    if (-not $anvilPath) {
        Print-Error "Foundry (anvil) is not installed"
        Print-Info "It should be installed with Foundry."
        Print-Info "Run 'foundryup' if available, or reinstall Foundry."
        $errors++
    }
    else {
        Print-Success "Anvil installed"
    }
    
    # If there are critical errors, abort
    if ($errors -gt 0) {
        Print-Error "[ERROR] Found $errors critical error(s). Aborting."
        Print-Info "Fix the errors before continuing."
        return $false
    }
    
    # 3. Check project dependencies
    Print-Step "Checking project dependencies..."
    $depsResult = Test-ProjectDependencies
    if ($depsResult -is [array] -and -not $depsResult[0]) {
        $missingDeps = $depsResult[1]
        $missingDepsStr = $missingDeps -join ', '
        Print-Warning "Missing dependencies: $missingDepsStr"
        
        if (-not $autoMode) {
            Write-Host ""
            $response = Read-Host "Do you want to install missing dependencies now? (Y/n)"
            if ($response -match '^[Nn]$') {
                Print-Warning "Installation cancelled. You must install manually:"
                foreach ($dep in $missingDeps) {
                    switch ($dep) {
                        "frontend" {
                            Print-Info "  - Frontend: cd web && npm install"
                        }
                        "smart-contract" {
                            Print-Info "  - Smart Contract: cd sc && forge install"
                        }
                    }
                }
                $errors++
            }
            else {
                if (-not (Install-ProjectDependencies -Dependencies $missingDeps)) {
                    Print-Error "Error installing dependencies. Aborting."
                    $errors++
                }
            }
        }
        else {
            # Automatic mode: install without asking
            Print-Info "Automatic mode: installing dependencies without confirmation..."
            if (-not (Install-ProjectDependencies -Dependencies $missingDeps)) {
                Print-Error "Error installing dependencies. Aborting."
                $errors++
            }
        }
    }
    else {
        Print-Success "All project dependencies are installed"
    }
    
    # If there are errors after trying to install, abort
    if ($errors -gt 0) {
        Print-Error "[ERROR] Found $errors error(s). Aborting."
        return $false
    }
    
    # 4. Configure environment variables (optional, not critical)
    if (-not (Test-Path $ENV_FILE)) {
        Print-Step "Environment variables configuration..."
        if (-not $autoMode) {
            Write-Host ""
            $response = Read-Host "Do you want to configure environment variables now? (Y/n)"
            if ($response -notmatch '^[Nn]$') {
                Set-EnvironmentVariables | Out-Null
            }
            else {
                Print-Info "You can configure them later with: .\deploy.ps1 env"
            }
        }
        else {
            # Automatic mode: configure with default values
            Print-Info "Automatic mode: configuring environment variables with default values..."
            Set-EnvironmentVariables | Out-Null
        }
    }
    else {
        Print-Success ".env.local file found"
    }
    
    # Summary
    Write-Host ""
    if ($errors -eq 0) {
        if ($warnings -eq 0) {
            Print-Success "All verifications passed successfully"
        }
        else {
            Print-Warning "Verification completed with $warnings warning(s)"
        }
        return $true
    }
    else {
        Print-Error "[ERROR] Found $errors error(s). Aborting."
        return $false
    }
}

# ============================================================================
# FUNCTION: START ANVIL
# ============================================================================

function Start-AnvilService {
    Print-Header "STEP 1: Start Anvil (Local Blockchain)"
    
    # Check if Anvil is already running
    $existingAnvilPid = Get-PidByPort -Port $ANVIL_PORT
    if ($existingAnvilPid) {
        Print-Warning "Anvil is already running on port $ANVIL_PORT (PID: $existingAnvilPid)"
        $existingAnvilPid | Out-File -FilePath $ANVIL_PID_FILE -Encoding ASCII
        return $true
    }
    
    # Also check by process name
    $anvilProcesses = Get-Process -Name "anvil" -ErrorAction SilentlyContinue
    if ($anvilProcesses) {
        $pid = $anvilProcesses[0].Id
        Print-Warning "Anvil is already running (PID: $pid)"
        $pid | Out-File -FilePath $ANVIL_PID_FILE -Encoding ASCII
        return $true
    }
    
    Print-Step "Starting Anvil on ${ANVIL_HOST}:${ANVIL_PORT} with Chain ID $ANVIL_CHAIN_ID..."
    
    # Check and show persistence state
    $stateExists = Test-Path $ANVIL_STATE_FILE
    $stateSize = ""
    if ($stateExists) {
        $stateSizeBytes = (Get-Item $ANVIL_STATE_FILE).Length
        $stateSize = "{0:N2} KB" -f ($stateSizeBytes / 1KB)
        Print-Success "[OK] Persistent state found: $ANVIL_STATE_FILE"
        Print-Info "   Size: $stateSize"
        Print-Info "   Anvil will restore previous state (tokens, transfers, users)"
    }
    else {
        Print-Info "Starting with clean blockchain (no previous state)"
        Print-Info "   State will be saved to: $ANVIL_STATE_FILE"
    }
    
    # Verify that anvil is installed
    $anvilPath = Get-Command anvil -ErrorAction SilentlyContinue
    if (-not $anvilPath) {
        Print-Error "Anvil is not installed or not in PATH"
        Print-Info "Install Foundry: https://book.getfoundry.sh/getting-started/installation"
        return $false
    }
    
    # Start Anvil in a new visible window (more reliable on Windows)
    Print-Step "Starting Anvil in a new window..."
    
    $anvilArgs = "--host $ANVIL_HOST --port $ANVIL_PORT --chain-id $ANVIL_CHAIN_ID --state $ANVIL_STATE_FILE --accounts 15"
    $command = "Write-Host '=== ANVIL LOCAL BLOCKCHAIN ===' -ForegroundColor Cyan; Write-Host 'Do not close this window!' -ForegroundColor Yellow; cd '$SC_DIR'; anvil $anvilArgs"
    
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "$command"
        
        Print-Success "Anvil started in a new window"
        Print-Info "Please keep the Anvil window open."
        
        # Wait for Anvil to be ready
        if (Wait-ForPort -Port $ANVIL_PORT -Timeout 10) {
            return $true
        }
        else {
            Print-Error "Anvil did not start correctly (port not open)"
            return $false
        }
    }
    catch {
        Print-Error "Error starting Anvil: $($_.Exception.Message)"
        return $false
    }
}

# ============================================================================
# FUNCTION: DEPLOY SMART CONTRACT
# ============================================================================

function Deploy-Contract {
    Print-Header "STEP 2: Deploy Smart Contract"
    
    if (-not (Test-Port -Port $ANVIL_PORT)) {
        Print-Error "Anvil is not running. Start Anvil first."
        return $false
    }
    
    # Check if contract is already deployed and Anvil is still running
    $contractAddressFile = Join-Path $LOGS_DIR "contract_address.txt"
    if (Test-Path $contractAddressFile) {
        $existingContract = Get-Content $contractAddressFile -Raw | ForEach-Object { $_.Trim() }
        if ($existingContract) {
            # Check if contract is still accessible (Anvil didn't restart)
            try {
                $body = @{
                    jsonrpc = "2.0"
                    method = "eth_getCode"
                    params = @($existingContract, "latest")
                    id = 1
                } | ConvertTo-Json
                
                $response = Invoke-RestMethod -Uri "http://${ANVIL_HOST}:${ANVIL_PORT}" `
                    -Method Post `
                    -ContentType "application/json" `
                    -Body $body `
                    -ErrorAction SilentlyContinue
                
                # If contract has code (not "0x"), it's deployed
                if ($response.result -and $response.result -ne "0x" -and $response.result.Length -gt 10) {
                    Print-Warning "Contract already deployed at: $existingContract"
                    Print-Info "Anvil did not restart, using existing contract"
                    Print-Info "To redeploy, run: .\deploy.ps1 restart"
                    return $true
                }
                else {
                    Print-Warning "Previous contract not found (Anvil restarted)"
                    Print-Info "Deploying new contract..."
                }
            }
            catch {
                Print-Warning "Could not verify existing contract, deploying new..."
            }
        }
    }
    
    # Ensure contract is compiled before deploying
    Print-Step "Compiling contract to ensure updated ABI..."
    Push-Location $SC_DIR
    
    $forgeBuild = & forge build --force 2>&1
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Error compiling contract"
        Pop-Location
        return $false
    }
    Print-Success "Contract compiled successfully"
    
    Print-Step "Deploying SupplyChain.sol to Anvil..."
    
    # Execute deployment script
    $env:PRIVATE_KEY = $DEPLOYER_PRIVATE_KEY
    $deployOutput = & forge script `
        script/SupplyChainDeploy.s.sol:SupplyChainDeployScript `
        --rpc-url "http://${ANVIL_HOST}:${ANVIL_PORT}" `
        --broadcast 2>&1
    
    $deployOutput | Out-File -FilePath $DEPLOY_LOG_FILE -Encoding UTF8
    
    # Convert output to single string for regex matching
    # IMPORTANT: If $deployOutput is an array, -match returns matches but doesn't set $matches variable
    $deployOutputString = $deployOutput -join "`n"
    
    # Extract contract address from output
    $contractAddress = $null
    
    # 1. Try "Contract Address: 0x..."
    if ($deployOutputString -match 'Contract Address:\s*(0x[a-fA-F0-9]{40})') {
        $contractAddress = $matches[1]
    }
    
    # 2. Try "deployed at: 0x..." (This is what appears in your logs: "SupplyChain deployed at: 0x...")
    if (-not $contractAddress) {
        if ($deployOutputString -match 'deployed at:\s*(0x[a-fA-F0-9]{40})') {
            $contractAddress = $matches[1]
        }
    }
    
    # 3. Fallback: Search for any 42-character address
    if (-not $contractAddress) {
        $allMatches = [regex]::Matches($deployOutputString, '\b(0x[a-fA-F0-9]{40})\b')
        if ($allMatches.Count -gt 0) {
            foreach ($match in $allMatches) {
                if ($match.Value -ne $DEPLOYER_ADDRESS) {
                    $contractAddress = $match.Value
                    break
                }
            }
        }
    }
    
    if (-not $contractAddress) {
        Print-Error "Could not get contract address"
        Print-Info "Check logs at: $DEPLOY_LOG_FILE"
        Pop-Location
        return $false
    }
    
    Print-Success "Contract deployed successfully"
    Print-Info "Address: $contractAddress"
    Print-Info "Owner: $DEPLOYER_ADDRESS"
    Print-Info "Logs: $DEPLOY_LOG_FILE"
    
    # Save address for next step
    $contractAddress | Out-File -FilePath $contractAddressFile -Encoding ASCII -NoNewline
    
    Pop-Location
    return $true
}

# ============================================================================
# FUNCTION: UPDATE FRONTEND CONFIGURATION
# ============================================================================

function Update-FrontendConfig {
    Print-Header "STEP 3: Update Frontend Configuration"
    
    $contractAddressFile = Join-Path $LOGS_DIR "contract_address.txt"
    
    if (-not (Test-Path $contractAddressFile)) {
        Print-Error "Contract address file not found"
        return $false
    }
    
    $contractAddress = Get-Content $contractAddressFile -Raw | ForEach-Object { $_.Trim() }
    
    if (-not $contractAddress) {
        Print-Error "Contract address is empty"
        return $false
    }
    
    # ============================================================
    # 3.1: Update contract ABI
    # ============================================================
    Print-Step "Updating contract ABI..."
    
    if (-not (Test-Path $ABI_SOURCE)) {
        Print-Error "Source ABI not found: $ABI_SOURCE"
        Print-Info "Make sure the contract is compiled (forge build)"
        return $false
    }
    
    # Make backup of existing ABI
    if (Test-Path $ABI_FILE) {
        Copy-Item $ABI_FILE "$ABI_FILE.backup" -Force
        Print-Info "ABI backup created: $ABI_FILE.backup"
    }
    
    # Create directory if it doesn't exist
    $abiDir = Split-Path $ABI_FILE -Parent
    if (-not (Test-Path $abiDir)) {
        New-Item -ItemType Directory -Path $abiDir -Force | Out-Null
    }
    
    # Copy updated ABI
    Copy-Item $ABI_SOURCE $ABI_FILE -Force
    
    if (Test-Path $ABI_FILE) {
        Print-Success "ABI updated successfully"
        Print-Info "ABI copied from: $ABI_SOURCE"
    }
    else {
        Print-Error "Could not copy ABI"
        return $false
    }
    
    # ============================================================
    # 3.2: Update contract address
    # ============================================================
    Print-Step "Updating $CONFIG_FILE with address: $contractAddress"
    
    # Verify file exists
    if (-not (Test-Path $CONFIG_FILE)) {
        Print-Error "Configuration file not found: $CONFIG_FILE"
        return $false
    }
    
    # Make backup of original file
    Copy-Item $CONFIG_FILE "$CONFIG_FILE.backup" -Force
    Print-Info "Backup created: $CONFIG_FILE.backup"
    
    # Update address using regex
    $configContent = Get-Content $CONFIG_FILE -Raw -Encoding UTF8
    $pattern = "export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]{40}'"
    $replacement = "export const SUPPLY_CHAIN_ADDRESS = '$contractAddress'"
    
    $configContent = $configContent -replace $pattern, $replacement
    
    # Save updated file
    $configContent | Out-File -FilePath $CONFIG_FILE -Encoding UTF8 -NoNewline
    
    # Verify it was updated correctly
    if ((Get-Content $CONFIG_FILE -Raw) -match [regex]::Escape($contractAddress)) {
        Print-Success "Configuration updated successfully"
        Print-Info "New address: $contractAddress"
        Print-Info "ABI updated from latest compilation"
        return $true
    }
    else {
        Print-Error "Could not update configuration"
        # Restore backups
        if (Test-Path "$CONFIG_FILE.backup") {
            Move-Item "$CONFIG_FILE.backup" $CONFIG_FILE -Force
        }
        if (Test-Path "$ABI_FILE.backup") {
            Move-Item "$ABI_FILE.backup" $ABI_FILE -Force
        }
        Print-Info "Configuration restored from backups"
        return $false
    }
}

# ============================================================================
# FUNCTION: START FRONTEND
# ============================================================================

function Start-FrontendService {
    Print-Header "STEP 4: Start Frontend (Next.js)"
    
    # Check if frontend is already running
    $existingFrontendPid = Get-PidByPort -Port $FRONTEND_PORT
    if ($existingFrontendPid) {
        Print-Warning "Frontend is already running on port $FRONTEND_PORT (PID: $existingFrontendPid)"
        $existingFrontendPid | Out-File -FilePath $FRONTEND_PID_FILE -Encoding ASCII
        return $true
    }
    
    # Search by process name (node)
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        # Check if any is using the frontend port
        foreach ($nodeProc in $nodeProcesses) {
            $procPort = Get-NetTCPConnection -OwningProcess $nodeProc.Id -ErrorAction SilentlyContinue | 
                Where-Object { $_.LocalPort -eq $FRONTEND_PORT }
            if ($procPort) {
                Print-Warning "Frontend is already running (PID: $($nodeProc.Id))"
                $nodeProc.Id | Out-File -FilePath $FRONTEND_PID_FILE -Encoding ASCII
                Pop-Location
                return $true
            }
        }
    }
    
    Print-Step "Starting Next.js server on port $FRONTEND_PORT..."
    
    Push-Location $WEB_DIR
    
    # Verify that npm is installed
    $npmPath = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $npmPath) {
        Print-Error "npm is not installed or not in PATH"
        Pop-Location
        return $false
    }
    
    # Create empty log file
    "" | Out-File -FilePath $FRONTEND_LOG_FILE -Encoding UTF8
    
    # Determine npm executable
    $npmExecutable = "npm"
    if ($IsWindows -or $env:OS -like "*Windows*") {
        # On Windows with UseShellExecute=false, we need the .cmd file
        $npmCommand = Get-Command npm -ErrorAction SilentlyContinue
        if ($npmCommand) {
            # Try to find npm.cmd in the same directory
            $npmDir = Split-Path $npmCommand.Source -Parent
            $npmCmdPath = Join-Path $npmDir "npm.cmd"
            if (Test-Path $npmCmdPath) {
                $npmExecutable = $npmCmdPath
            }
            else {
                # Fallback to just npm.cmd hoping it is in PATH
                $npmExecutable = "npm.cmd"
            }
        }
        else {
             $npmExecutable = "npm.cmd"
        }
    }

    # Start Next.js in a new visible window (more reliable on Windows)
    Print-Step "Starting Next.js server in a new window..."
    
    $command = "Write-Host '=== NEXT.JS FRONTEND ===' -ForegroundColor Cyan; Write-Host 'Do not close this window!' -ForegroundColor Yellow; cd '$WEB_DIR'; npm run dev"
    
    try {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "$command"
        
        Print-Success "Frontend process started in a new window"
        Print-Info "Please keep the Frontend window open."
        
        # Wait for frontend to be ready
        if (Wait-ForPort -Port $FRONTEND_PORT -Timeout 60) {
            Print-Success "Frontend started successfully"
            Print-Info "URL: http://localhost:$FRONTEND_PORT"
            Pop-Location
            return $true
        }
        else {
            # Check if port is in use anyway
            if (Test-Port -Port $FRONTEND_PORT) {
                Print-Success "Frontend is running (detected on port $FRONTEND_PORT)"
                Print-Info "URL: http://localhost:$FRONTEND_PORT"
                Pop-Location
                return $true
            }
            
            Print-Error "Frontend could not start correctly or timed out"
            Pop-Location
            return $false
        }
    }
    catch {
        Print-Error "Error starting Frontend: $($_.Exception.Message)"
        Pop-Location
        return $false
    }
}

# ============================================================================
# FUNCTION: STOP SERVICES
# ============================================================================

function Stop-Services {
    Print-Header "Stopping Services"
    
    $stoppedCount = 0
    
    # Stop Frontend
    $frontendPids = @()
    
    # Search by PID file
    if (Test-Path $FRONTEND_PID_FILE) {
        $filePid = Get-Content $FRONTEND_PID_FILE -Raw | ForEach-Object { [int]$_.Trim() }
        if (Get-Process -Id $filePid -ErrorAction SilentlyContinue) {
            $frontendPids += $filePid
        }
        Remove-Item $FRONTEND_PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Search by port
    $portPid = Get-PidByPort -Port $FRONTEND_PORT
    if ($portPid) {
        $frontendPids += $portPid
    }
    
    # Search by process name (node on frontend port)
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($nodeProc in $nodeProcesses) {
        $procPort = Get-NetTCPConnection -OwningProcess $nodeProc.Id -ErrorAction SilentlyContinue | 
            Where-Object { $_.LocalPort -eq $FRONTEND_PORT }
        if ($procPort) {
            $frontendPids += $nodeProc.Id
        }
    }
    
    # Remove duplicates
    $frontendPids = $frontendPids | Select-Object -Unique
    
    if ($frontendPids.Count -gt 0) {
        Print-Step "Stopping Frontend (PIDs: $($frontendPids -join ', '))..."
        foreach ($procId in $frontendPids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Process already terminated
            }
        }
        Start-Sleep -Seconds 2
        
        # Force if still running
        foreach ($procId in $frontendPids) {
            if (Get-Process -Id $procId -ErrorAction SilentlyContinue) {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
        
        Print-Success "Frontend stopped"
        $stoppedCount++
    }
    else {
        Print-Info "Frontend is not running"
    }
    
    # Stop Anvil
    $anvilPids = @()
    
    # Search by PID file
    if (Test-Path $ANVIL_PID_FILE) {
        $filePid = Get-Content $ANVIL_PID_FILE -Raw | ForEach-Object { [int]$_.Trim() }
        if (Get-Process -Id $filePid -ErrorAction SilentlyContinue) {
            $anvilPids += $filePid
        }
        Remove-Item $ANVIL_PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Search by port
    $portPid = Get-PidByPort -Port $ANVIL_PORT
    if ($portPid) {
        $anvilPids += $portPid
    }
    
    # Search by process name
    $anvilProcesses = Get-Process -Name "anvil" -ErrorAction SilentlyContinue
    if ($anvilProcesses) {
        foreach ($proc in $anvilProcesses) {
            $anvilPids += $proc.Id
        }
    }
    
    # Remove duplicates
    $anvilPids = $anvilPids | Select-Object -Unique
    
    if ($anvilPids.Count -gt 0) {
        Print-Step "Stopping Anvil (PIDs: $($anvilPids -join ', '))..."
        foreach ($procId in $anvilPids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Process already terminated
            }
        }
        Start-Sleep -Seconds 2
        
        # Force if still running
        foreach ($procId in $anvilPids) {
            if (Get-Process -Id $procId -ErrorAction SilentlyContinue) {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
        
        Print-Success "Anvil stopped"
        $stoppedCount++
    }
    else {
        Print-Info "Anvil is not running"
    }
    
    if ($stoppedCount -eq 0) {
        Print-Warning "No services are running"
    }
    else {
        Print-Success "Stopped $stoppedCount service(s)"
    }
}

# ============================================================================
# FUNCTION: SHOW STATUS
# ============================================================================

function Show-Status {
    Print-Header "Service Status"
    
    # Anvil status
    Write-Host "Anvil (Local Blockchain):" -ForegroundColor Cyan
    $anvilPid = Get-PidByPort -Port $ANVIL_PORT
    if (-not $anvilPid) {
        $anvilProcess = Get-Process -Name "anvil" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($anvilProcess) {
            $anvilPid = $anvilProcess.Id
        }
    }
    
    if ($anvilPid) {
        Print-Success "RUNNING (PID: $anvilPid, Port: $ANVIL_PORT)"
        Print-Info "RPC URL: http://${ANVIL_HOST}:${ANVIL_PORT}"
        Print-Info "Chain ID: $ANVIL_CHAIN_ID"
    }
    else {
        Print-Error "STOPPED"
    }
    
    Write-Host ""
    
    # Frontend status
    Write-Host "Frontend (Next.js):" -ForegroundColor Cyan
    $frontendPid = Get-PidByPort -Port $FRONTEND_PORT
    if ($frontendPid) {
        Print-Success "RUNNING (PID: $frontendPid, Port: $FRONTEND_PORT)"
        Print-Info "URL: http://localhost:$FRONTEND_PORT"
    }
    else {
        Print-Error "STOPPED"
    }
    
    Write-Host ""
    
    # Contract information
    Write-Host "Smart Contract:" -ForegroundColor Cyan
    $contractAddressFile = Join-Path $LOGS_DIR "contract_address.txt"
    if (Test-Path $contractAddressFile) {
        $contractAddress = Get-Content $contractAddressFile -Raw | ForEach-Object { $_.Trim() }
        Print-Info "Address: $contractAddress"
        Print-Info "Owner: $DEPLOYER_ADDRESS"
    }
    else {
        Print-Warning "Not deployed"
    }
    
    Write-Host ""
    
    # Log files
    Write-Host "Logs:" -ForegroundColor Cyan
    if (Test-Path $ANVIL_LOG_FILE) {
        Print-Info "Anvil: $ANVIL_LOG_FILE"
    }
    if (Test-Path $FRONTEND_LOG_FILE) {
        Print-Info "Frontend: $FRONTEND_LOG_FILE"
    }
    if (Test-Path $DEPLOY_LOG_FILE) {
        Print-Info "Deploy: $DEPLOY_LOG_FILE"
    }
    if (Test-Path $INSTALL_LOG_FILE) {
        Print-Info "Install: $INSTALL_LOG_FILE"
    }
}

# ============================================================================
# FUNCTION: SHOW METAMASK INSTRUCTIONS
# ============================================================================

function Show-MetamaskInstructions {
    Print-Header "MetaMask Configuration"
    
    Write-Host "METAMASK CONFIGURATION INSTRUCTIONS" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. Add Anvil Local Network:" -ForegroundColor Cyan
    Write-Host "   • Open MetaMask → Network selector (top left)"
    Write-Host "   • Click 'Add network' → 'Add a network manually'"
    Write-Host "   • Fill in the following data:"
    Write-Host ""
    Write-Host "     Network Name:     Anvil Local" -ForegroundColor Green
    Write-Host "     RPC URL:          http://${ANVIL_HOST}:${ANVIL_PORT}"
    Write-Host "     Chain ID:         $ANVIL_CHAIN_ID"
    Write-Host "     Currency Symbol:  ETH"
    Write-Host ""
    Write-Host "   • Click 'Save'"
    Write-Host ""
    
    Write-Host "2. Import Anvil Account (Owner):" -ForegroundColor Cyan
    Write-Host "   • Open MetaMask → Account icon (top right)"
    Write-Host "   • Click 'Import Account'"
    Write-Host "   • Select 'Private Key'"
    Write-Host "   • Paste the following private key:"
    Write-Host ""
    Write-Host "     $DEPLOYER_PRIVATE_KEY" -ForegroundColor Green
    Write-Host ""
    Write-Host "   • Click 'Import'"
    Write-Host ""
    Write-Host "   [WARNING] IMPORTANT: This private key is ONLY for local development." -ForegroundColor Yellow
    Write-Host "   NEVER use on mainnet or with real funds."
    Write-Host ""
    
    Write-Host "3. Verify Configuration:" -ForegroundColor Cyan
    Write-Host "   • The imported account should have address: $DEPLOYER_ADDRESS"
    Write-Host "   • Balance should be ~10,000 ETH"
    Write-Host "   • Network should be on 'Anvil Local'"
    Write-Host ""
    
    Write-Host "4. Connect to DApp:" -ForegroundColor Cyan
    Write-Host "   • Open http://localhost:$FRONTEND_PORT"
    Write-Host "   • Click 'Connect MetaMask'"
    Write-Host "   • Authorize connection in MetaMask"
    Write-Host "   • Done! You should see your address and contract statistics"
    Write-Host ""
    
    Write-Host "5. Additional Accounts (Optional):" -ForegroundColor Cyan
    Write-Host "   To test transfers between users, you can import more accounts:"
    Write-Host ""
    Write-Host "   Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor Yellow
    Write-Host "   Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    Write-Host ""
    Write-Host "   Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" -ForegroundColor Yellow
    Write-Host "   Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    Write-Host ""
}

# ============================================================================
# FUNCTION: FRONTEND ONLY MANAGEMENT
# ============================================================================

function Start-FrontendOnly {
    Ensure-LogsDir
    
    Print-Header "Start Frontend Only"
    
    # Verify Anvil is running
    if (-not (Test-Port -Port $ANVIL_PORT)) {
        Print-Error "Anvil is not running. Start Anvil first with: .\deploy.ps1 start"
        return $false
    }
    
    # Verify contract is deployed
    $contractAddressFile = Join-Path $LOGS_DIR "contract_address.txt"
    if (-not (Test-Path $contractAddressFile)) {
        Print-Error "Contract is not deployed. Run: .\deploy.ps1 start"
        return $false
    }
    
    # Start frontend
    if (-not (Start-FrontendService)) {
        Print-Error "Could not start frontend"
        return $false
    }
    
    Print-Success "Frontend started successfully"
    Print-Info "URL: http://localhost:$FRONTEND_PORT"
    Print-Info "Anvil and contract continue running"
    return $true
}

function Stop-FrontendOnly {
    Print-Header "Stop Frontend Only"
    
    $stopped = $false
    
    # Stop Frontend
    $frontendPids = @()
    
    # Search by PID file
    if (Test-Path $FRONTEND_PID_FILE) {
        $filePid = Get-Content $FRONTEND_PID_FILE -Raw | ForEach-Object { [int]$_.Trim() }
        if (Get-Process -Id $filePid -ErrorAction SilentlyContinue) {
            $frontendPids += $filePid
        }
        Remove-Item $FRONTEND_PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Search by port
    $portPid = Get-PidByPort -Port $FRONTEND_PORT
    if ($portPid) {
        $frontendPids += $portPid
    }
    
    # Search by process name (node on frontend port)
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($nodeProc in $nodeProcesses) {
        $procPort = Get-NetTCPConnection -OwningProcess $nodeProc.Id -ErrorAction SilentlyContinue | 
            Where-Object { $_.LocalPort -eq $FRONTEND_PORT }
        if ($procPort) {
            $frontendPids += $nodeProc.Id
        }
    }
    
    # Remove duplicates
    $frontendPids = $frontendPids | Select-Object -Unique
    
    if ($frontendPids.Count -gt 0) {
        Print-Step "Stopping Frontend (PIDs: $($frontendPids -join ', '))..."
        foreach ($procId in $frontendPids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Process already terminated
            }
        }
        Start-Sleep -Seconds 2
        
        # Force if still running
        foreach ($procId in $frontendPids) {
            if (Get-Process -Id $procId -ErrorAction SilentlyContinue) {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
        
        Print-Success "Frontend stopped"
        $stopped = $true
    }
    else {
        Print-Info "Frontend is not running"
    }
    
    if ($stopped) {
        Print-Info "Anvil and contract continue running"
        Print-Info "To restart frontend: .\deploy.ps1 frontend start"
    }
}

function Restart-FrontendOnly {
    Print-Header "Restart Frontend Only"
    
    Stop-FrontendOnly
    Start-Sleep -Seconds 2
    Start-FrontendOnly
}

# ============================================================================
# FUNCTION: STOP ANVIL ONLY
# ============================================================================

function Stop-AnvilOnly {
    $anvilPids = @()
    
    # Search by PID file
    if (Test-Path $ANVIL_PID_FILE) {
        $filePid = Get-Content $ANVIL_PID_FILE -Raw | ForEach-Object { [int]$_.Trim() }
        if (Get-Process -Id $filePid -ErrorAction SilentlyContinue) {
            $anvilPids += $filePid
        }
        Remove-Item $ANVIL_PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Search by port
    $portPid = Get-PidByPort -Port $ANVIL_PORT
    if ($portPid) {
        $anvilPids += $portPid
    }
    
    # Search by process name
    $anvilProcesses = Get-Process -Name "anvil" -ErrorAction SilentlyContinue
    if ($anvilProcesses) {
        foreach ($proc in $anvilProcesses) {
            $anvilPids += $proc.Id
        }
    }
    
    # Remove duplicates
    $anvilPids = $anvilPids | Select-Object -Unique
    
    if ($anvilPids.Count -gt 0) {
        Print-Step "Stopping Anvil (PIDs: $($anvilPids -join ', '))..."
        foreach ($procId in $anvilPids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Process already terminated
            }
        }
        Start-Sleep -Seconds 2
        
        # Force if still running
        foreach ($procId in $anvilPids) {
            if (Get-Process -Id $procId -ErrorAction SilentlyContinue) {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
        
        # Verify it stopped
        Start-Sleep -Seconds 1
        if (Test-Port -Port $ANVIL_PORT) {
            Print-Error "Could not stop Anvil completely"
            return $false
        }
        else {
            Print-Success "Anvil stopped successfully"
            return $true
        }
    }
    else {
        Print-Info "Anvil is not running"
        return $true
    }
}

# ============================================================================
# FUNCTION: CLEAN ANVIL STATE
# ============================================================================

function Clean-AnvilState {
    Print-Header "Clean Anvil Persistent State"
    
    $anvilRunning = Test-Port -Port $ANVIL_PORT
    
    # Check if Anvil is running
    if ($anvilRunning) {
        Print-Warning "Anvil is running on port $ANVIL_PORT"
        Print-Warning "To clean state, Anvil must be stopped"
        Write-Host ""
        $response = Read-Host "Do you want to stop Anvil now? (y/N)"
        if ($response -match '^[Yy]$') {
            Print-Step "Stopping Anvil..."
            if (-not (Stop-AnvilOnly)) {
                Print-Error "Could not stop Anvil. Operation cancelled."
                return $false
            }
            Start-Sleep -Seconds 1
            $anvilRunning = $false
        }
        else {
            Print-Info "Operation cancelled. State will not be cleaned while Anvil is running."
            return $true
        }
    }
    
    # Verify again that Anvil is not running
    if (Test-Port -Port $ANVIL_PORT) {
        Print-Error "Anvil is still running. Cannot clean state."
        return $false
    }
    
    # Clean state
    if (Test-Path $ANVIL_STATE_FILE) {
        $stateSize = (Get-Item $ANVIL_STATE_FILE).Length / 1KB
        $stateSizeFormatted = "{0:N2} KB" -f $stateSize
        Print-Warning "Deleting Anvil persistent state (size: $stateSizeFormatted)"
        Print-Warning "This will delete all local blockchain data (tokens, transfers, users)"
        Write-Host ""
        $response = Read-Host "Are you sure you want to delete the state? (y/N)"
        if ($response -match '^[Yy]$') {
            Remove-Item $ANVIL_STATE_FILE -Force
            Print-Success "Persistent state deleted"
            Print-Info "Anvil will start with a clean blockchain on next start"
            return $true
        }
        else {
            Print-Info "Operation cancelled. State was not deleted."
            return $true
        }
    }
    else {
        Print-Info "No persistent state to delete"
        Print-Info "Anvil will start with a clean blockchain on next start"
        return $true
    }
}

# ============================================================================
# FUNCTION: START (START EVERYTHING)
# ============================================================================

function Start-All {
    Ensure-LogsDir
    
    # NEW: Pre-start verification
    if (-not (Start-PreStartCheck)) {
        Print-Error "Pre-start verification failed. Fix errors before continuing."
        Print-Info "You can run '.\deploy.ps1 setup' to verify and install dependencies"
        exit 1
    }
    
    Print-Header "Starting Supply Chain Tracker"
    
    # Step 1: Start Anvil
    if (-not (Start-AnvilService)) {
        Print-Error "Could not start Anvil"
        exit 1
    }
    
    Start-Sleep -Seconds 2
    
    # Step 2: Deploy contract
    if (-not (Deploy-Contract)) {
        Print-Error "Could not deploy contract"
        exit 1
    }
    
    Start-Sleep -Seconds 1
    
    # Step 3: Update configuration
    if (-not (Update-FrontendConfig)) {
        Print-Error "Could not update configuration"
        exit 1
    }
    
    Start-Sleep -Seconds 1
    
    # Step 4: Start frontend
    if (-not (Start-FrontendService)) {
        Print-Error "Could not start frontend"
        exit 1
    }
    
    # Show summary
    Print-Header "Deployment Completed"
    
    Write-Host "All services are running correctly:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Anvil:    http://${ANVIL_HOST}:${ANVIL_PORT}" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
    $contractAddress = Get-Content (Join-Path $LOGS_DIR "contract_address.txt") -Raw | ForEach-Object { $_.Trim() }
    Write-Host "  Contract: $contractAddress" -ForegroundColor Cyan
    Write-Host ""
    
    # Show MetaMask instructions
    Show-MetamaskInstructions
    
    Print-Info "To view status: .\deploy.ps1 status"
    Print-Info "To stop everything: .\deploy.ps1 stop"
}

# ============================================================================
# FUNCTION: HELP
# ============================================================================

function Show-Help {
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host "                                                               " -ForegroundColor Cyan
    Write-Host "        Supply Chain Tracker - Deployment Script              " -ForegroundColor Cyan
    Write-Host "                                                               " -ForegroundColor Cyan
    Write-Host "=================================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 [command] [options]"
    Write-Host ""
    
    Write-Host "MAIN COMMANDS:" -ForegroundColor Yellow
    Write-Host '  start           Start entire stack (Anvil, Deploy, Frontend)' -ForegroundColor Green
    Write-Host "  stop            Stop all services" -ForegroundColor Green
    Write-Host "  restart         Restart all services" -ForegroundColor Green
    Write-Host "  status          Show service status" -ForegroundColor Green
    Write-Host "  metamask        Show MetaMask configuration instructions" -ForegroundColor Green
    Write-Host '  clean           Clean Anvil persistent state (requires Anvil stopped)' -ForegroundColor Green
    Write-Host ""
    
    Write-Host "CONFIGURATION COMMANDS:" -ForegroundColor Yellow
    Write-Host "  setup           Verify requirements and install missing dependencies" -ForegroundColor Green
    Write-Host '  env             Configure environment variables (.env.local)' -ForegroundColor Green
    Write-Host ""
    
    Write-Host 'FRONTEND COMMANDS (without affecting Anvil/Contract):' -ForegroundColor Yellow
    Write-Host '  frontend start  Start only frontend (requires Anvil running)' -ForegroundColor Green
    Write-Host "  frontend stop   Stop only frontend" -ForegroundColor Green
    Write-Host "  frontend restart Restart only frontend" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host '  --yes, --auto, -y  Automatic mode (no confirmations)' -ForegroundColor Green
    Write-Host ""
    
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  # First time - Complete setup"
    Write-Host "  .\deploy.ps1 setup"
    Write-Host "  .\deploy.ps1 env"
    Write-Host "  .\deploy.ps1 start"
    Write-Host ""
    Write-Host "  # Automatic mode (no prompts)"
    Write-Host "  .\deploy.ps1 setup --yes"
    Write-Host "  .\deploy.ps1 start --auto"
    Write-Host ""
    Write-Host "  # Configure environment variables interactively"
    Write-Host "  .\deploy.ps1 env"
    Write-Host ""
    Write-Host "  # Configure variables with parameters"
    Write-Host "  .\deploy.ps1 env --modern-design true --debug-mode false"
    Write-Host "  .\deploy.ps1 env --all true false false"
    Write-Host ""
    Write-Host "  # Start everything"
    Write-Host "  .\deploy.ps1 start"
    Write-Host ""
    Write-Host '  # Stop only frontend (Anvil and contract continue running)'
    Write-Host "  .\deploy.ps1 frontend stop"
    Write-Host ""
    Write-Host "  # Restart only frontend after changes"
    Write-Host "  .\deploy.ps1 frontend restart"
    Write-Host ""
    Write-Host "  # View status"
    Write-Host "  .\deploy.ps1 status"
    Write-Host ""
    Write-Host "  # Stop everything"
    Write-Host "  .\deploy.ps1 stop"
    Write-Host ""
    
    Write-Host "NOTE: Anvil now persists state between restarts." -ForegroundColor Yellow
    Write-Host "      Use .\deploy.ps1 clean to clean the state." -ForegroundColor Yellow
    Write-Host "      If Anvil is running, it will ask if you want to stop it first." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "  help            Show this help" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "LOGS:" -ForegroundColor Yellow
    Write-Host "  Logs are saved in: $LOGS_DIR"
    Write-Host "  • anvil.log     - Anvil logs"
    Write-Host "  • frontend.log  - Frontend logs"
    Write-Host "  • deploy.log    - Deployment logs"
    Write-Host "  • install.log   - Dependency installation logs"
    Write-Host ""
    
    Write-Host "PORTS:" -ForegroundColor Yellow
    Write-Host "  • Anvil:    $ANVIL_PORT"
    Write-Host "  • Frontend: $FRONTEND_PORT"
    Write-Host ""
}

# ============================================================================
# MAIN
# ============================================================================

function Main {
    # Verify we are in the correct directory
    if (-not (Test-Path $SC_DIR) -or -not (Test-Path $WEB_DIR)) {
        Print-Error "This script must be run from the project root"
        Print-Info "Current directory: $PROJECT_ROOT"
        exit 1
    }
    
    # Get script arguments (passed from command line)
    $scriptArgs = $args
    
    # Check automatic mode flags
    $script:AUTO_INSTALL = $false
    foreach ($arg in $scriptArgs) {
        if ($arg -in @("--yes", "--auto", "-y")) {
            $script:AUTO_INSTALL = $true
            break
        }
    }
    
    # Process command (filter out flags)
    $filteredArgs = $scriptArgs | Where-Object { $_ -notin @("--yes", "--auto", "-y") }
    $command = if ($filteredArgs.Count -gt 0) { $filteredArgs[0] } else { "" }
    $subCommand = if ($filteredArgs.Count -gt 1) { $filteredArgs[1] } else { "" }
    # For env command, remainingArgs should be all args after "env"
    # For frontend command, remainingArgs should be all args after "frontend"
    if ($command -in @("env", "environment")) {
        $remainingArgs = if ($filteredArgs.Count -gt 1) { $filteredArgs[1..($filteredArgs.Count-1)] } else { @() }
    }
    elseif ($command -eq "frontend") {
        $remainingArgs = if ($filteredArgs.Count -gt 2) { $filteredArgs[2..($filteredArgs.Count-1)] } else { @() }
    }
    else {
        $remainingArgs = @()
    }
    
    # Handle help commands first (before switch to avoid default case)
    if ($command -eq "" -or $command -in @("help", "--help", "-h")) {
        Show-Help
        return
    }
    
    switch ($command.ToLower()) {
        "start" {
            Start-All
        }
        "stop" {
            Stop-Services
        }
        "restart" {
            Stop-Services
            Start-Sleep -Seconds 2
            Start-All
        }
        "setup" {
            Start-PreStartCheck | Out-Null
        }
        { $_ -in "env", "environment" } {
            Set-EnvironmentVariables -RemainingArgs $remainingArgs
        }
        "frontend" {
            switch ($subCommand.ToLower()) {
                "start" {
                    Start-FrontendOnly
                }
                "stop" {
                    Stop-FrontendOnly
                }
                "restart" {
                    Restart-FrontendOnly
                }
                default {
                    Print-Error "Invalid frontend command: $subCommand"
                    Write-Host ""
                    Write-Host "Available commands:"
                    Write-Host "  .\deploy.ps1 frontend start    - Start only frontend"
                    Write-Host "  .\deploy.ps1 frontend stop     - Stop only frontend"
                    Write-Host "  .\deploy.ps1 frontend restart  - Restart only frontend"
                    exit 1
                }
            }
        }
        "status" {
            Show-Status
        }
        "metamask" {
            Show-MetamaskInstructions
        }
        { $_ -in "clean", "reset" } {
            Clean-AnvilState
        }
        default {
            Print-Error "Invalid command: $command"
            Write-Host ""
            Show-Help
            exit 1
        }
    }
}

# Execute main with all arguments
Main $args
