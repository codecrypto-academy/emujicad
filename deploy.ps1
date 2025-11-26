################################################################################
# Supply Chain Tracker - Deployment Automation Script (PowerShell)
################################################################################
# 
# Descripción: Script para automatizar deployment de Anvil + Smart Contract + Frontend
# Autor: Supply Chain Tracker Team
# Fecha: 18 Noviembre 2025
# Última actualización: 26 de Noviembre, 2025
# Versión: 2.0.0 (PowerShell)
# Plataforma: Windows 10/11
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
#   .\deploy.ps1 start           - Inicia todo el stack (Anvil + Contrato + Frontend)
#   .\deploy.ps1 stop            - Detiene todos los servicios
#   .\deploy.ps1 restart         - Reinicia todo el stack
#   .\deploy.ps1 status          - Muestra estado de servicios
#   .\deploy.ps1 metamask        - Muestra instrucciones para configurar MetaMask
#   .\deploy.ps1 clean           - Limpia estado persistente de Anvil
#   .\deploy.ps1 frontend start  - Inicia solo el frontend
#   .\deploy.ps1 frontend stop   - Detiene solo el frontend
#   .\deploy.ps1 frontend restart - Reinicia solo el frontend
#   .\deploy.ps1 help            - Muestra ayuda completa
#
################################################################################

# Configurar política de ejecución si es necesario (solo primera vez)
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# ============================================================================
# CONFIGURACIÓN
# ============================================================================

# Directorios del proyecto
$PROJECT_ROOT = $PSScriptRoot
$SC_DIR = Join-Path $PROJECT_ROOT "sc"
$WEB_DIR = Join-Path $PROJECT_ROOT "web"
$LOGS_DIR = Join-Path $PROJECT_ROOT "logs"

# Archivos de proceso
$ANVIL_PID_FILE = Join-Path $LOGS_DIR "anvil.pid"
$FRONTEND_PID_FILE = Join-Path $LOGS_DIR "frontend.pid"
$ANVIL_LOG_FILE = Join-Path $LOGS_DIR "anvil.log"
$FRONTEND_LOG_FILE = Join-Path $LOGS_DIR "frontend.log"
$DEPLOY_LOG_FILE = Join-Path $LOGS_DIR "deploy.log"
$ANVIL_STATE_FILE = Join-Path $LOGS_DIR "anvil_state.json"

# Configuración de red
$ANVIL_PORT = 8545
$ANVIL_CHAIN_ID = 31337
$ANVIL_HOST = "127.0.0.1"
$FRONTEND_PORT = 3000

# Cuenta de Anvil (Account #0)
$DEPLOYER_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
$DEPLOYER_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

# Archivos de configuración del frontend
$CONFIG_FILE = Join-Path $WEB_DIR "src\contracts\config.ts"
$ABI_FILE = Join-Path $WEB_DIR "src\contracts\SupplyChain.json"
$ABI_SOURCE = Join-Path $SC_DIR "out\SupplyChain.sol\SupplyChain.json"

# ============================================================================
# FUNCIONES AUXILIARES
# ============================================================================

function Print-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Message" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor Blue
}

function Print-Step {
    param([string]$Message)
    Write-Host "➜ $Message" -ForegroundColor Magenta
}

# Función para crear directorio de logs si no existe
function Ensure-LogsDir {
    if (-not (Test-Path $LOGS_DIR)) {
        New-Item -ItemType Directory -Path $LOGS_DIR -Force | Out-Null
        Print-Success "Directorio de logs creado: $LOGS_DIR"
    }
}

# Función para verificar si un puerto está en uso
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

# Función para obtener PID de un proceso en un puerto
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

# Función para esperar a que un puerto esté en uso (servicio iniciado)
function Wait-ForPort {
    param(
        [int]$Port,
        [int]$Timeout = 30
    )
    
    Print-Step "Esperando a que el puerto $Port esté en uso (servicio iniciado)..."
    
    $elapsed = 0
    while ($elapsed -lt $Timeout) {
        if (Test-Port -Port $Port) {
            Print-Success "Puerto $Port está en uso (servicio iniciado)"
            return $true
        }
        Start-Sleep -Seconds 1
        $elapsed++
    }
    
    Print-Error "Timeout esperando al puerto $Port (servicio no inició)"
    return $false
}

# ============================================================================
# FUNCIÓN: INICIAR ANVIL
# ============================================================================

function Start-AnvilService {
    Print-Header "PASO 1: Iniciar Anvil (Blockchain Local)"
    
    # Verificar si Anvil ya está corriendo
    $existingAnvilPid = Get-PidByPort -Port $ANVIL_PORT
    if ($existingAnvilPid) {
        Print-Warning "Anvil ya está corriendo en puerto $ANVIL_PORT (PID: $existingAnvilPid)"
        $existingAnvilPid | Out-File -FilePath $ANVIL_PID_FILE -Encoding ASCII
        return $true
    }
    
    # Verificar también por nombre de proceso
    $anvilProcesses = Get-Process -Name "anvil" -ErrorAction SilentlyContinue
    if ($anvilProcesses) {
        $pid = $anvilProcesses[0].Id
        Print-Warning "Anvil ya está corriendo (PID: $pid)"
        $pid | Out-File -FilePath $ANVIL_PID_FILE -Encoding ASCII
        return $true
    }
    
    Print-Step "Iniciando Anvil en ${ANVIL_HOST}:${ANVIL_PORT} con Chain ID $ANVIL_CHAIN_ID..."
    
    # Verificar y mostrar estado de persistencia
    $stateExists = Test-Path $ANVIL_STATE_FILE
    $stateSize = ""
    if ($stateExists) {
        $stateSizeBytes = (Get-Item $ANVIL_STATE_FILE).Length
        $stateSize = "{0:N2} KB" -f ($stateSizeBytes / 1KB)
        Print-Success "✅ Estado persistente encontrado: $ANVIL_STATE_FILE"
        Print-Info "   📊 Tamaño: $stateSize"
        Print-Info "   🔄 Anvil restaurará el estado anterior (tokens, transferencias, usuarios)"
    }
    else {
        Print-Info "ℹ️  Iniciando con blockchain limpia (sin estado previo)"
        Print-Info "   📝 El estado se guardará en: $ANVIL_STATE_FILE"
    }
    
    # Verificar que anvil esté instalado
    $anvilPath = Get-Command anvil -ErrorAction SilentlyContinue
    if (-not $anvilPath) {
        Print-Error "Anvil no está instalado o no está en el PATH"
        Print-Info "Instala Foundry: https://book.getfoundry.sh/getting-started/installation"
        return $false
    }
    
    # Iniciar Anvil en background con persistencia de estado
    Push-Location $SC_DIR
    Print-Step "Iniciando Anvil con persistencia de estado habilitada..."
    
    $anvilArgs = @(
        "--host", $ANVIL_HOST,
        "--port", $ANVIL_PORT.ToString(),
        "--chain-id", $ANVIL_CHAIN_ID.ToString(),
        "--state", $ANVIL_STATE_FILE,
        "--accounts", "15"
    )
    
    # Iniciar proceso en background y redirigir output a log file
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "anvil"
    $processInfo.Arguments = $anvilArgs -join " "
    $processInfo.WorkingDirectory = $SC_DIR
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.CreateNoWindow = $true
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    
    # Crear archivo de log vacío
    "" | Out-File -FilePath $ANVIL_LOG_FILE -Encoding UTF8
    
    # Configurar event handlers para capturar output
    $stdoutBuilder = New-Object System.Text.StringBuilder
    $stderrBuilder = New-Object System.Text.StringBuilder
    
    $outputHandler = {
        if (-not [string]::IsNullOrEmpty($EventArgs.Data)) {
            [void]$stdoutBuilder.AppendLine($EventArgs.Data)
            Add-Content -Path $ANVIL_LOG_FILE -Value $EventArgs.Data -Encoding UTF8
        }
    }
    
    $errorHandler = {
        if (-not [string]::IsNullOrEmpty($EventArgs.Data)) {
            [void]$stderrBuilder.AppendLine($EventArgs.Data)
            Add-Content -Path $ANVIL_LOG_FILE -Value $EventArgs.Data -Encoding UTF8
        }
    }
    
    $process.add_OutputDataReceived($outputHandler)
    $process.add_ErrorDataReceived($errorHandler)
    
    try {
        $process.Start() | Out-Null
        $process.BeginOutputReadLine()
        $process.BeginErrorReadLine()
        
        $process.Id | Out-File -FilePath $ANVIL_PID_FILE -Encoding ASCII
        
        Print-Info "Anvil iniciado con PID: $($process.Id)"
        Print-Info "Logs: $ANVIL_LOG_FILE"
        
        # Esperar a que Anvil esté listo
        if (Wait-ForPort -Port $ANVIL_PORT -Timeout 10) {
            Start-Sleep -Seconds 1
            
            # Verificar que Anvil está corriendo
            if (Test-Port -Port $ANVIL_PORT) {
                Print-Success "Anvil iniciado correctamente"
                Print-Success "✅ Persistencia de estado: HABILITADA"
                Print-Info "   📁 Archivo de estado: $ANVIL_STATE_FILE"
                if ($stateExists) {
                    Print-Info "   ✅ Estado anterior restaurado ($stateSize)"
                }
                else {
                    Print-Info "   📝 Nuevo estado se guardará automáticamente"
                }
            }
            
            # Mostrar cuentas disponibles
            Print-Info "Cuenta deployer: $DEPLOYER_ADDRESS"
            Print-Info "Balance inicial: 10,000 ETH"
            
            Pop-Location
            return $true
        }
        else {
            Print-Error "Anvil no pudo iniciar correctamente"
            if (-not $process.HasExited) {
                $process.Kill()
            }
            Pop-Location
            return $false
        }
    }
    catch {
        Print-Error "Error al iniciar Anvil: $($_.Exception.Message)"
        Pop-Location
        return $false
    }
}

# ============================================================================
# FUNCIÓN: DESPLEGAR SMART CONTRACT
# ============================================================================

function Deploy-Contract {
    Print-Header "PASO 2: Desplegar Smart Contract"
    
    if (-not (Test-Port -Port $ANVIL_PORT)) {
        Print-Error "Anvil no está corriendo. Inicia Anvil primero."
        return $false
    }
    
    # Verificar si ya hay un contrato desplegado y Anvil sigue corriendo
    $contractAddressFile = Join-Path $LOGS_DIR "contract_address.txt"
    if (Test-Path $contractAddressFile) {
        $existingContract = Get-Content $contractAddressFile -Raw | ForEach-Object { $_.Trim() }
        if ($existingContract) {
            # Verificar si el contrato sigue accesible (Anvil no se reinició)
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
                
                # Si el contrato tiene código (no es "0x"), está desplegado
                if ($response.result -and $response.result -ne "0x" -and $response.result.Length -gt 10) {
                    Print-Warning "Contrato ya desplegado en: $existingContract"
                    Print-Info "Anvil no se reinició, usando contrato existente"
                    Print-Info "Para redesplegar, ejecuta: .\deploy.ps1 restart"
                    return $true
                }
                else {
                    Print-Warning "Contrato anterior no encontrado (Anvil reiniciado)"
                    Print-Info "Desplegando nuevo contrato..."
                }
            }
            catch {
                Print-Warning "No se pudo verificar el contrato existente, desplegando nuevo..."
            }
        }
    }
    
    # Asegurar que el contrato esté compilado antes de desplegar
    Print-Step "Compilando contrato para asegurar ABI actualizado..."
    Push-Location $SC_DIR
    
    $forgeBuild = & forge build --force 2>&1
    if ($LASTEXITCODE -ne 0) {
        Print-Error "Error al compilar el contrato"
        Pop-Location
        return $false
    }
    Print-Success "Contrato compilado correctamente"
    
    Print-Step "Desplegando SupplyChain.sol en Anvil..."
    
    # Ejecutar script de deployment
    $env:PRIVATE_KEY = $DEPLOYER_PRIVATE_KEY
    $deployOutput = & forge script `
        script/SupplyChainDeploy.s.sol:SupplyChainDeployScript `
        --rpc-url "http://${ANVIL_HOST}:${ANVIL_PORT}" `
        --broadcast 2>&1
    
    $deployOutput | Out-File -FilePath $DEPLOY_LOG_FILE -Encoding UTF8
    
    # Extraer dirección del contrato del output
    $contractAddress = $null
    
    # Buscar patrón "Contract Address: 0x..."
    if ($deployOutput -match 'Contract Address:\s*(0x[a-fA-F0-9]{40})') {
        $contractAddress = $matches[1]
    }
    # Buscar patrón "deployed at: 0x..."
    elseif ($deployOutput -match 'deployed at:\s*(0x[a-fA-F0-9]{40})') {
        $contractAddress = $matches[1]
    }
    # Buscar cualquier dirección de 42 caracteres (0x + 40 hex)
    elseif ($deployOutput -match '\b(0x[a-fA-F0-9]{40})\b') {
        # Tomar la primera dirección que encuentre (probablemente la del contrato)
        $allMatches = [regex]::Matches($deployOutput, '\b(0x[a-fA-F0-9]{40})\b')
        if ($allMatches.Count -gt 0) {
            # Filtrar la dirección del deployer
            foreach ($match in $allMatches) {
                if ($match.Value -ne $DEPLOYER_ADDRESS) {
                    $contractAddress = $match.Value
                    break
                }
            }
        }
    }
    
    if (-not $contractAddress) {
        Print-Error "No se pudo obtener la dirección del contrato"
        Print-Info "Ver logs en: $DEPLOY_LOG_FILE"
        Pop-Location
        return $false
    }
    
    Print-Success "Contrato desplegado exitosamente"
    Print-Info "Dirección: $contractAddress"
    Print-Info "Owner: $DEPLOYER_ADDRESS"
    Print-Info "Logs: $DEPLOY_LOG_FILE"
    
    # Guardar dirección para el siguiente paso
    $contractAddress | Out-File -FilePath $contractAddressFile -Encoding ASCII -NoNewline
    
    Pop-Location
    return $true
}

# ============================================================================
# FUNCIÓN: ACTUALIZAR CONFIGURACIÓN DEL FRONTEND
# ============================================================================

function Update-FrontendConfig {
    Print-Header "PASO 3: Actualizar Configuración del Frontend"
    
    $contractAddressFile = Join-Path $LOGS_DIR "contract_address.txt"
    
    if (-not (Test-Path $contractAddressFile)) {
        Print-Error "Archivo de dirección del contrato no encontrado"
        return $false
    }
    
    $contractAddress = Get-Content $contractAddressFile -Raw | ForEach-Object { $_.Trim() }
    
    if (-not $contractAddress) {
        Print-Error "Dirección del contrato vacía"
        return $false
    }
    
    # ============================================================
    # 3.1: Actualizar ABI del contrato
    # ============================================================
    Print-Step "Actualizando ABI del contrato..."
    
    if (-not (Test-Path $ABI_SOURCE)) {
        Print-Error "ABI fuente no encontrado: $ABI_SOURCE"
        Print-Info "Asegúrate de que el contrato esté compilado (forge build)"
        return $false
    }
    
    # Hacer backup del ABI existente
    if (Test-Path $ABI_FILE) {
        Copy-Item $ABI_FILE "$ABI_FILE.backup" -Force
        Print-Info "Backup del ABI creado: $ABI_FILE.backup"
    }
    
    # Crear directorio si no existe
    $abiDir = Split-Path $ABI_FILE -Parent
    if (-not (Test-Path $abiDir)) {
        New-Item -ItemType Directory -Path $abiDir -Force | Out-Null
    }
    
    # Copiar ABI actualizado
    Copy-Item $ABI_SOURCE $ABI_FILE -Force
    
    if (Test-Path $ABI_FILE) {
        Print-Success "ABI actualizado correctamente"
        Print-Info "ABI copiado desde: $ABI_SOURCE"
    }
    else {
        Print-Error "No se pudo copiar el ABI"
        return $false
    }
    
    # ============================================================
    # 3.2: Actualizar dirección del contrato
    # ============================================================
    Print-Step "Actualizando $CONFIG_FILE con dirección: $contractAddress"
    
    # Verificar que el archivo existe
    if (-not (Test-Path $CONFIG_FILE)) {
        Print-Error "Archivo de configuración no encontrado: $CONFIG_FILE"
        return $false
    }
    
    # Hacer backup del archivo original
    Copy-Item $CONFIG_FILE "$CONFIG_FILE.backup" -Force
    Print-Info "Backup creado: $CONFIG_FILE.backup"
    
    # Actualizar dirección usando regex
    $configContent = Get-Content $CONFIG_FILE -Raw -Encoding UTF8
    $pattern = "export const SUPPLY_CHAIN_ADDRESS = '0x[a-fA-F0-9]{40}'"
    $replacement = "export const SUPPLY_CHAIN_ADDRESS = '$contractAddress'"
    
    $configContent = $configContent -replace $pattern, $replacement
    
    # Guardar archivo actualizado
    $configContent | Out-File -FilePath $CONFIG_FILE -Encoding UTF8 -NoNewline
    
    # Verificar que se actualizó correctamente
    if ((Get-Content $CONFIG_FILE -Raw) -match [regex]::Escape($contractAddress)) {
        Print-Success "Configuración actualizada correctamente"
        Print-Info "Nueva dirección: $contractAddress"
        Print-Info "ABI actualizado desde la última compilación"
        return $true
    }
    else {
        Print-Error "No se pudo actualizar la configuración"
        # Restaurar backups
        if (Test-Path "$CONFIG_FILE.backup") {
            Move-Item "$CONFIG_FILE.backup" $CONFIG_FILE -Force
        }
        if (Test-Path "$ABI_FILE.backup") {
            Move-Item "$ABI_FILE.backup" $ABI_FILE -Force
        }
        Print-Info "Configuración restaurada desde backups"
        return $false
    }
}

# ============================================================================
# FUNCIÓN: INICIAR FRONTEND
# ============================================================================

function Start-FrontendService {
    Print-Header "PASO 4: Iniciar Frontend (Next.js)"
    
    # Verificar si frontend ya está corriendo
    $existingFrontendPid = Get-PidByPort -Port $FRONTEND_PORT
    if ($existingFrontendPid) {
        Print-Warning "Frontend ya está corriendo en puerto $FRONTEND_PORT (PID: $existingFrontendPid)"
        $existingFrontendPid | Out-File -FilePath $FRONTEND_PID_FILE -Encoding ASCII
        return $true
    }
    
    # Buscar por nombre de proceso (node)
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        # Verificar si alguno está usando el puerto del frontend
        foreach ($nodeProc in $nodeProcesses) {
            $procPort = Get-NetTCPConnection -OwningProcess $nodeProc.Id -ErrorAction SilentlyContinue | 
                Where-Object { $_.LocalPort -eq $FRONTEND_PORT }
            if ($procPort) {
                Print-Warning "Frontend ya está corriendo (PID: $($nodeProc.Id))"
                $nodeProc.Id | Out-File -FilePath $FRONTEND_PID_FILE -Encoding ASCII
                Pop-Location
                return $true
            }
        }
    }
    
    Print-Step "Iniciando servidor Next.js en puerto $FRONTEND_PORT..."
    
    Push-Location $WEB_DIR
    
    # Verificar que npm esté instalado
    $npmPath = Get-Command npm -ErrorAction SilentlyContinue
    if (-not $npmPath) {
        Print-Error "npm no está instalado o no está en el PATH"
        Pop-Location
        return $false
    }
    
    # Crear archivo de log vacío
    "" | Out-File -FilePath $FRONTEND_LOG_FILE -Encoding UTF8
    
    # Iniciar Next.js en background usando Start-Process con redirección
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "npm"
    $processInfo.Arguments = "run dev"
    $processInfo.WorkingDirectory = $WEB_DIR
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.CreateNoWindow = $true
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    
    # Configurar event handlers para capturar output
    $outputHandler = {
        if (-not [string]::IsNullOrEmpty($EventArgs.Data)) {
            Add-Content -Path $FRONTEND_LOG_FILE -Value $EventArgs.Data -Encoding UTF8
        }
    }
    
    $errorHandler = {
        if (-not [string]::IsNullOrEmpty($EventArgs.Data)) {
            Add-Content -Path $FRONTEND_LOG_FILE -Value $EventArgs.Data -Encoding UTF8
        }
    }
    
    $process.add_OutputDataReceived($outputHandler)
    $process.add_ErrorDataReceived($errorHandler)
    
    try {
        $process.Start() | Out-Null
        $process.BeginOutputReadLine()
        $process.BeginErrorReadLine()
        
        $process.Id | Out-File -FilePath $FRONTEND_PID_FILE -Encoding ASCII
        
        Print-Info "Frontend iniciado con PID: $($process.Id)"
        Print-Info "Logs: $FRONTEND_LOG_FILE"
        
        # Esperar a que el frontend esté listo
        if (Wait-ForPort -Port $FRONTEND_PORT -Timeout 30) {
            Print-Success "Frontend iniciado correctamente"
            Print-Info "URL: http://localhost:$FRONTEND_PORT"
            Pop-Location
            return $true
        }
        else {
            Print-Error "Frontend no pudo iniciar correctamente"
            if (-not $process.HasExited) {
                $process.Kill()
            }
            Pop-Location
            return $false
        }
    }
    catch {
        Print-Error "Error al iniciar Frontend: $($_.Exception.Message)"
        Pop-Location
        return $false
    }
}

# ============================================================================
# FUNCIÓN: DETENER SERVICIOS
# ============================================================================

function Stop-Services {
    Print-Header "Deteniendo Servicios"
    
    $stoppedCount = 0
    
    # Detener Frontend
    $frontendPids = @()
    
    # Buscar por PID file
    if (Test-Path $FRONTEND_PID_FILE) {
        $filePid = Get-Content $FRONTEND_PID_FILE -Raw | ForEach-Object { [int]$_.Trim() }
        if (Get-Process -Id $filePid -ErrorAction SilentlyContinue) {
            $frontendPids += $filePid
        }
        Remove-Item $FRONTEND_PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Buscar por puerto
    $portPid = Get-PidByPort -Port $FRONTEND_PORT
    if ($portPid) {
        $frontendPids += $portPid
    }
    
    # Buscar por nombre de proceso (node en el puerto del frontend)
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($nodeProc in $nodeProcesses) {
        $procPort = Get-NetTCPConnection -OwningProcess $nodeProc.Id -ErrorAction SilentlyContinue | 
            Where-Object { $_.LocalPort -eq $FRONTEND_PORT }
        if ($procPort) {
            $frontendPids += $nodeProc.Id
        }
    }
    
    # Eliminar duplicados
    $frontendPids = $frontendPids | Select-Object -Unique
    
    if ($frontendPids.Count -gt 0) {
        Print-Step "Deteniendo Frontend (PIDs: $($frontendPids -join ', '))..."
        foreach ($pid in $frontendPids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Proceso ya terminado
            }
        }
        Start-Sleep -Seconds 2
        
        # Forzar si siguen corriendo
        foreach ($pid in $frontendPids) {
            if (Get-Process -Id $pid -ErrorAction SilentlyContinue) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        
        Print-Success "Frontend detenido"
        $stoppedCount++
    }
    else {
        Print-Info "Frontend no está corriendo"
    }
    
    # Detener Anvil
    $anvilPids = @()
    
    # Buscar por PID file
    if (Test-Path $ANVIL_PID_FILE) {
        $filePid = Get-Content $ANVIL_PID_FILE -Raw | ForEach-Object { [int]$_.Trim() }
        if (Get-Process -Id $filePid -ErrorAction SilentlyContinue) {
            $anvilPids += $filePid
        }
        Remove-Item $ANVIL_PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Buscar por puerto
    $portPid = Get-PidByPort -Port $ANVIL_PORT
    if ($portPid) {
        $anvilPids += $portPid
    }
    
    # Buscar por nombre de proceso
    $anvilProcesses = Get-Process -Name "anvil" -ErrorAction SilentlyContinue
    if ($anvilProcesses) {
        foreach ($proc in $anvilProcesses) {
            $anvilPids += $proc.Id
        }
    }
    
    # Eliminar duplicados
    $anvilPids = $anvilPids | Select-Object -Unique
    
    if ($anvilPids.Count -gt 0) {
        Print-Step "Deteniendo Anvil (PIDs: $($anvilPids -join ', '))..."
        foreach ($pid in $anvilPids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Proceso ya terminado
            }
        }
        Start-Sleep -Seconds 2
        
        # Forzar si siguen corriendo
        foreach ($pid in $anvilPids) {
            if (Get-Process -Id $pid -ErrorAction SilentlyContinue) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        
        Print-Success "Anvil detenido"
        $stoppedCount++
    }
    else {
        Print-Info "Anvil no está corriendo"
    }
    
    if ($stoppedCount -eq 0) {
        Print-Warning "No hay servicios corriendo"
    }
    else {
        Print-Success "Se detuvieron $stoppedCount servicio(s)"
    }
}

# ============================================================================
# FUNCIÓN: MOSTRAR ESTADO
# ============================================================================

function Show-Status {
    Print-Header "Estado de Servicios"
    
    # Estado de Anvil
    Write-Host "Anvil (Blockchain Local):" -ForegroundColor Cyan
    $anvilPid = Get-PidByPort -Port $ANVIL_PORT
    if (-not $anvilPid) {
        $anvilProcess = Get-Process -Name "anvil" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($anvilProcess) {
            $anvilPid = $anvilProcess.Id
        }
    }
    
    if ($anvilPid) {
        Print-Success "CORRIENDO (PID: $anvilPid, Puerto: $ANVIL_PORT)"
        Print-Info "RPC URL: http://${ANVIL_HOST}:${ANVIL_PORT}"
        Print-Info "Chain ID: $ANVIL_CHAIN_ID"
    }
    else {
        Print-Error "DETENIDO"
    }
    
    Write-Host ""
    
    # Estado del Frontend
    Write-Host "Frontend (Next.js):" -ForegroundColor Cyan
    $frontendPid = Get-PidByPort -Port $FRONTEND_PORT
    if ($frontendPid) {
        Print-Success "CORRIENDO (PID: $frontendPid, Puerto: $FRONTEND_PORT)"
        Print-Info "URL: http://localhost:$FRONTEND_PORT"
    }
    else {
        Print-Error "DETENIDO"
    }
    
    Write-Host ""
    
    # Información del contrato
    Write-Host "Smart Contract:" -ForegroundColor Cyan
    $contractAddressFile = Join-Path $LOGS_DIR "contract_address.txt"
    if (Test-Path $contractAddressFile) {
        $contractAddress = Get-Content $contractAddressFile -Raw | ForEach-Object { $_.Trim() }
        Print-Info "Dirección: $contractAddress"
        Print-Info "Owner: $DEPLOYER_ADDRESS"
    }
    else {
        Print-Warning "No desplegado"
    }
    
    Write-Host ""
    
    # Archivos de log
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
}

# ============================================================================
# FUNCIÓN: MOSTRAR INSTRUCCIONES DE METAMASK
# ============================================================================

function Show-MetamaskInstructions {
    Print-Header "Configuración de MetaMask"
    
    Write-Host "📝 INSTRUCCIONES PARA CONFIGURAR METAMASK" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "1. Agregar Red Anvil Local:" -ForegroundColor Cyan
    Write-Host "   • Abrir MetaMask → Selector de red (arriba izquierda)"
    Write-Host "   • Clic en 'Add network' → 'Add a network manually'"
    Write-Host "   • Completar los siguientes datos:"
    Write-Host ""
    Write-Host "     Network Name:     Anvil Local" -ForegroundColor Green
    Write-Host "     RPC URL:          http://${ANVIL_HOST}:${ANVIL_PORT}"
    Write-Host "     Chain ID:         $ANVIL_CHAIN_ID"
    Write-Host "     Currency Symbol:  ETH"
    Write-Host ""
    Write-Host "   • Clic en 'Save'"
    Write-Host ""
    
    Write-Host "2. Importar Cuenta de Anvil (Owner):" -ForegroundColor Cyan
    Write-Host "   • Abrir MetaMask → Icono de cuenta (arriba derecha)"
    Write-Host "   • Clic en 'Import Account'"
    Write-Host "   • Seleccionar 'Private Key'"
    Write-Host "   • Pegar el siguiente private key:"
    Write-Host ""
    Write-Host "     $DEPLOYER_PRIVATE_KEY" -ForegroundColor Green
    Write-Host ""
    Write-Host "   • Clic en 'Import'"
    Write-Host ""
    Write-Host "   ⚠ IMPORTANTE: Este private key es SOLO para desarrollo local." -ForegroundColor Yellow
    Write-Host "   NUNCA usar en mainnet o con fondos reales."
    Write-Host ""
    
    Write-Host "3. Verificar Configuración:" -ForegroundColor Cyan
    Write-Host "   • La cuenta importada debe tener dirección: $DEPLOYER_ADDRESS"
    Write-Host "   • El balance debe ser ~10,000 ETH"
    Write-Host "   • La red debe estar en 'Anvil Local'"
    Write-Host ""
    
    Write-Host "4. Conectar a la DApp:" -ForegroundColor Cyan
    Write-Host "   • Abrir http://localhost:$FRONTEND_PORT"
    Write-Host "   • Clic en 'Conectar MetaMask'"
    Write-Host "   • Autorizar la conexión en MetaMask"
    Write-Host "   • ¡Listo! Deberías ver tu dirección y las estadísticas del contrato"
    Write-Host ""
    
    Write-Host "5. Cuentas Adicionales (Opcional):" -ForegroundColor Cyan
    Write-Host "   Para probar transferencias entre usuarios, puedes importar más cuentas:"
    Write-Host ""
    Write-Host "   Cuenta #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor Yellow
    Write-Host "   Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    Write-Host ""
    Write-Host "   Cuenta #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" -ForegroundColor Yellow
    Write-Host "   Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
    Write-Host ""
}

# ============================================================================
# FUNCIÓN: GESTIÓN SOLO DEL FRONTEND
# ============================================================================

function Start-FrontendOnly {
    Ensure-LogsDir
    
    Print-Header "🚀 Iniciar Solo Frontend"
    
    # Verificar que Anvil esté corriendo
    if (-not (Test-Port -Port $ANVIL_PORT)) {
        Print-Error "Anvil no está corriendo. Inicia Anvil primero con: .\deploy.ps1 start"
        return $false
    }
    
    # Verificar que el contrato esté desplegado
    $contractAddressFile = Join-Path $LOGS_DIR "contract_address.txt"
    if (-not (Test-Path $contractAddressFile)) {
        Print-Error "Contrato no está desplegado. Ejecuta: .\deploy.ps1 start"
        return $false
    }
    
    # Iniciar frontend
    if (-not (Start-FrontendService)) {
        Print-Error "No se pudo iniciar el frontend"
        return $false
    }
    
    Print-Success "Frontend iniciado correctamente"
    Print-Info "URL: http://localhost:$FRONTEND_PORT"
    Print-Info "Anvil y contrato siguen corriendo"
    return $true
}

function Stop-FrontendOnly {
    Print-Header "🛑 Detener Solo Frontend"
    
    $stopped = $false
    
    # Detener Frontend
    $frontendPids = @()
    
    # Buscar por PID file
    if (Test-Path $FRONTEND_PID_FILE) {
        $filePid = Get-Content $FRONTEND_PID_FILE -Raw | ForEach-Object { [int]$_.Trim() }
        if (Get-Process -Id $filePid -ErrorAction SilentlyContinue) {
            $frontendPids += $filePid
        }
        Remove-Item $FRONTEND_PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Buscar por puerto
    $portPid = Get-PidByPort -Port $FRONTEND_PORT
    if ($portPid) {
        $frontendPids += $portPid
    }
    
    # Buscar por nombre de proceso (node en el puerto del frontend)
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    foreach ($nodeProc in $nodeProcesses) {
        $procPort = Get-NetTCPConnection -OwningProcess $nodeProc.Id -ErrorAction SilentlyContinue | 
            Where-Object { $_.LocalPort -eq $FRONTEND_PORT }
        if ($procPort) {
            $frontendPids += $nodeProc.Id
        }
    }
    
    # Eliminar duplicados
    $frontendPids = $frontendPids | Select-Object -Unique
    
    if ($frontendPids.Count -gt 0) {
        Print-Step "Deteniendo Frontend (PIDs: $($frontendPids -join ', '))..."
        foreach ($pid in $frontendPids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Proceso ya terminado
            }
        }
        Start-Sleep -Seconds 2
        
        # Forzar si siguen corriendo
        foreach ($pid in $frontendPids) {
            if (Get-Process -Id $pid -ErrorAction SilentlyContinue) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        
        Print-Success "Frontend detenido"
        $stopped = $true
    }
    else {
        Print-Info "Frontend no está corriendo"
    }
    
    if ($stopped) {
        Print-Info "Anvil y contrato siguen corriendo"
        Print-Info "Para reiniciar frontend: .\deploy.ps1 frontend start"
    }
}

function Restart-FrontendOnly {
    Print-Header "🔄 Reiniciar Solo Frontend"
    
    Stop-FrontendOnly
    Start-Sleep -Seconds 2
    Start-FrontendOnly
}

# ============================================================================
# FUNCIÓN: DETENER SOLO ANVIL
# ============================================================================

function Stop-AnvilOnly {
    $anvilPids = @()
    
    # Buscar por PID file
    if (Test-Path $ANVIL_PID_FILE) {
        $filePid = Get-Content $ANVIL_PID_FILE -Raw | ForEach-Object { [int]$_.Trim() }
        if (Get-Process -Id $filePid -ErrorAction SilentlyContinue) {
            $anvilPids += $filePid
        }
        Remove-Item $ANVIL_PID_FILE -Force -ErrorAction SilentlyContinue
    }
    
    # Buscar por puerto
    $portPid = Get-PidByPort -Port $ANVIL_PORT
    if ($portPid) {
        $anvilPids += $portPid
    }
    
    # Buscar por nombre de proceso
    $anvilProcesses = Get-Process -Name "anvil" -ErrorAction SilentlyContinue
    if ($anvilProcesses) {
        foreach ($proc in $anvilProcesses) {
            $anvilPids += $proc.Id
        }
    }
    
    # Eliminar duplicados
    $anvilPids = $anvilPids | Select-Object -Unique
    
    if ($anvilPids.Count -gt 0) {
        Print-Step "Deteniendo Anvil (PIDs: $($anvilPids -join ', '))..."
        foreach ($pid in $anvilPids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
            catch {
                # Proceso ya terminado
            }
        }
        Start-Sleep -Seconds 2
        
        # Forzar si siguen corriendo
        foreach ($pid in $anvilPids) {
            if (Get-Process -Id $pid -ErrorAction SilentlyContinue) {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        
        # Verificar que se detuvo
        Start-Sleep -Seconds 1
        if (Test-Port -Port $ANVIL_PORT) {
            Print-Error "No se pudo detener Anvil completamente"
            return $false
        }
        else {
            Print-Success "Anvil detenido correctamente"
            return $true
        }
    }
    else {
        Print-Info "Anvil no está corriendo"
        return $true
    }
}

# ============================================================================
# FUNCIÓN: LIMPIAR ESTADO DE ANVIL
# ============================================================================

function Clean-AnvilState {
    Print-Header "🧹 Limpiar Estado Persistente de Anvil"
    
    $anvilRunning = Test-Port -Port $ANVIL_PORT
    
    # Verificar si Anvil está corriendo
    if ($anvilRunning) {
        Print-Warning "Anvil está corriendo en puerto $ANVIL_PORT"
        Print-Warning "Para limpiar el estado, Anvil debe estar detenido"
        Write-Host ""
        $response = Read-Host "¿Deseas detener Anvil ahora? (s/N)"
        if ($response -eq "s" -or $response -eq "S") {
            Print-Step "Deteniendo Anvil..."
            if (-not (Stop-AnvilOnly)) {
                Print-Error "No se pudo detener Anvil. Operación cancelada."
                return $false
            }
            Start-Sleep -Seconds 1
            $anvilRunning = $false
        }
        else {
            Print-Info "Operación cancelada. El estado no se limpiará mientras Anvil esté corriendo."
            return $true
        }
    }
    
    # Verificar nuevamente que Anvil no esté corriendo
    if (Test-Port -Port $ANVIL_PORT) {
        Print-Error "Anvil sigue corriendo. No se puede limpiar el estado."
        return $false
    }
    
    # Limpiar el estado
    if (Test-Path $ANVIL_STATE_FILE) {
        $stateSize = (Get-Item $ANVIL_STATE_FILE).Length / 1KB
        $stateSizeFormatted = "{0:N2} KB" -f $stateSize
        Print-Warning "Eliminando estado persistente de Anvil (tamaño: $stateSizeFormatted)"
        Print-Warning "Esto eliminará todos los datos de la blockchain local (tokens, transferencias, usuarios)"
        Write-Host ""
        $response = Read-Host "¿Estás seguro de que deseas eliminar el estado? (s/N)"
        if ($response -eq "s" -or $response -eq "S") {
            Remove-Item $ANVIL_STATE_FILE -Force
            Print-Success "Estado persistente eliminado"
            Print-Info "Anvil iniciará con una blockchain limpia en el próximo start"
            return $true
        }
        else {
            Print-Info "Operación cancelada. El estado no se eliminó."
            return $true
        }
    }
    else {
        Print-Info "No hay estado persistente para eliminar"
        Print-Info "Anvil iniciará con una blockchain limpia en el próximo start"
        return $true
    }
}

# ============================================================================
# FUNCIÓN: START (INICIAR TODO)
# ============================================================================

function Start-All {
    Ensure-LogsDir
    
    Print-Header "🚀 Iniciando Supply Chain Tracker"
    
    # Paso 1: Iniciar Anvil
    if (-not (Start-AnvilService)) {
        Print-Error "No se pudo iniciar Anvil"
        exit 1
    }
    
    Start-Sleep -Seconds 2
    
    # Paso 2: Desplegar contrato
    if (-not (Deploy-Contract)) {
        Print-Error "No se pudo desplegar el contrato"
        exit 1
    }
    
    Start-Sleep -Seconds 1
    
    # Paso 3: Actualizar configuración
    if (-not (Update-FrontendConfig)) {
        Print-Error "No se pudo actualizar la configuración"
        exit 1
    }
    
    Start-Sleep -Seconds 1
    
    # Paso 4: Iniciar frontend
    if (-not (Start-FrontendService)) {
        Print-Error "No se pudo iniciar el frontend"
        exit 1
    }
    
    # Mostrar resumen
    Print-Header "✅ Deployment Completado"
    
    Write-Host "Todos los servicios están corriendo correctamente:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Anvil:    http://${ANVIL_HOST}:${ANVIL_PORT}" -ForegroundColor Cyan
    Write-Host "  Frontend: http://localhost:$FRONTEND_PORT" -ForegroundColor Cyan
    $contractAddress = Get-Content (Join-Path $LOGS_DIR "contract_address.txt") -Raw | ForEach-Object { $_.Trim() }
    Write-Host "  Contract: $contractAddress" -ForegroundColor Cyan
    Write-Host ""
    
    # Mostrar instrucciones de MetaMask
    Show-MetamaskInstructions
    
    Print-Info "Para ver el estado: .\deploy.ps1 status"
    Print-Info "Para detener todo: .\deploy.ps1 stop"
}

# ============================================================================
# FUNCIÓN: HELP
# ============================================================================

function Show-Help {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "║        Supply Chain Tracker - Deployment Script              ║" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "USO:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 [comando]"
    Write-Host ""
    
    Write-Host "COMANDOS:" -ForegroundColor Yellow
    Write-Host "  start           Inicia todo el stack (Anvil + Deploy + Frontend)" -ForegroundColor Green
    Write-Host "  stop            Detiene todos los servicios" -ForegroundColor Green
    Write-Host "  restart         Reinicia todos los servicios" -ForegroundColor Green
    Write-Host "  status          Muestra el estado de los servicios" -ForegroundColor Green
    Write-Host "  metamask        Muestra instrucciones para configurar MetaMask" -ForegroundColor Green
    Write-Host "  clean           Limpia el estado persistente de Anvil (requiere Anvil detenido)" -ForegroundColor Green
    Write-Host ""
    Write-Host "COMANDOS DE FRONTEND (sin afectar Anvil/Contrato):" -ForegroundColor Yellow
    Write-Host "  frontend start  Inicia solo el frontend (requiere Anvil corriendo)" -ForegroundColor Green
    Write-Host "  frontend stop   Detiene solo el frontend" -ForegroundColor Green
    Write-Host "  frontend restart Reinicia solo el frontend" -ForegroundColor Green
    Write-Host ""
    Write-Host "NOTA: Anvil ahora persiste el estado entre reinicios." -ForegroundColor Yellow
    Write-Host "      Usa .\deploy.ps1 clean para limpiar el estado." -ForegroundColor Yellow
    Write-Host "      Si Anvil está corriendo, te preguntará si deseas detenerlo primero." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  help            Muestra esta ayuda" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "EJEMPLOS:" -ForegroundColor Yellow
    Write-Host "  # Iniciar todo"
    Write-Host "  .\deploy.ps1 start"
    Write-Host ""
    Write-Host "  # Detener solo el frontend (Anvil y contrato siguen corriendo)"
    Write-Host "  .\deploy.ps1 frontend stop"
    Write-Host ""
    Write-Host "  # Reiniciar solo el frontend después de cambios"
    Write-Host "  .\deploy.ps1 frontend restart"
    Write-Host ""
    Write-Host "  # Ver estado"
    Write-Host "  .\deploy.ps1 status"
    Write-Host ""
    Write-Host "  # Detener todo"
    Write-Host "  .\deploy.ps1 stop"
    Write-Host ""
    
    Write-Host "LOGS:" -ForegroundColor Yellow
    Write-Host "  Los logs se guardan en: $LOGS_DIR"
    Write-Host "  • anvil.log     - Logs de Anvil"
    Write-Host "  • frontend.log  - Logs del frontend"
    Write-Host "  • deploy.log    - Logs del deployment"
    Write-Host ""
    
    Write-Host "PUERTOS:" -ForegroundColor Yellow
    Write-Host "  • Anvil:    $ANVIL_PORT"
    Write-Host "  • Frontend: $FRONTEND_PORT"
    Write-Host ""
}

# ============================================================================
# MAIN
# ============================================================================

function Main {
    param([string[]]$Args)
    
    # Verificar que estamos en el directorio correcto
    if (-not (Test-Path $SC_DIR) -or -not (Test-Path $WEB_DIR)) {
        Print-Error "Este script debe ejecutarse desde la raíz del proyecto"
        Print-Info "Directorio actual: $PROJECT_ROOT"
        exit 1
    }
    
    # Procesar comando
    $command = if ($Args.Count -gt 0) { $Args[0] } else { "" }
    $subCommand = if ($Args.Count -gt 1) { $Args[1] } else { "" }
    
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
                    Print-Error "Comando de frontend inválido: $subCommand"
                    Write-Host ""
                    Write-Host "Comandos disponibles:"
                    Write-Host "  .\deploy.ps1 frontend start    - Iniciar solo frontend"
                    Write-Host "  .\deploy.ps1 frontend stop     - Detener solo frontend"
                    Write-Host "  .\deploy.ps1 frontend restart  - Reiniciar solo frontend"
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
        { $_ -in "help", "--help", "-h" } {
            Show-Help
        }
        default {
            Print-Error "Comando inválido: $command"
            Write-Host ""
            Show-Help
            exit 1
        }
    }
}

# Ejecutar main con todos los argumentos
Main $args

