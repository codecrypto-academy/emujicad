# 📊 Análisis y Propuesta: deploy.ps1 (PowerShell para Windows)

**Fecha**: 28 de Noviembre, 2025  
**Objetivo**: Asegurar que `deploy.ps1` tenga funcionalidad equivalente a `deploy.sh` y cubra los 42 casos de uso documentados.

---

## 🔍 Análisis Comparativo

### ✅ Funcionalidades Implementadas en deploy.ps1

1. ✅ **Funciones básicas de impresión** (Print-Header, Print-Success, etc.)
2. ✅ **Gestión de logs** (Ensure-LogsDir)
3. ✅ **Verificación de puertos** (Test-Port, Get-PidByPort, Wait-ForPort)
4. ✅ **Iniciar Anvil** (Start-AnvilService) - Con persistencia de estado
5. ✅ **Desplegar contrato** (Deploy-Contract)
6. ✅ **Actualizar configuración frontend** (Update-FrontendConfig)
7. ✅ **Iniciar frontend** (Start-FrontendService)
8. ✅ **Detener servicios** (Stop-Services)
9. ✅ **Mostrar estado** (Show-Status)
10. ✅ **Instrucciones MetaMask** (Show-MetamaskInstructions)
11. ✅ **Gestión solo frontend** (Start-FrontendOnly, Stop-FrontendOnly, Restart-FrontendOnly)
12. ✅ **Detener solo Anvil** (Stop-AnvilOnly)
13. ✅ **Limpiar estado** (Clean-AnvilState)
14. ✅ **Iniciar todo** (Start-All)
15. ✅ **Ayuda** (Show-Help)
16. ✅ **Comandos básicos**: start, stop, restart, status, metamask, clean, frontend, help

### ❌ Funcionalidades Faltantes en deploy.ps1

1. ❌ **pre_start_check()** - Verificación pre-inicio automática
2. ❌ **setup command** - Verificar e instalar dependencias
3. ❌ **env command** - Configurar variables de entorno (.env.local)
4. ❌ **Soporte para flags** --yes, --auto, -y (modo automático)
5. ❌ **check_system_tools()** - Verificar herramientas del sistema (Windows)
6. ❌ **install_system_tools()** - Instalar herramientas faltantes (Windows)
7. ❌ **check_project_dependencies()** - Verificar dependencias del proyecto
8. ❌ **install_project_dependencies()** - Instalar dependencias faltantes
9. ❌ **setup_environment_variables()** - Configurar .env.local con todas las opciones
10. ❌ **Mensajes en inglés** - Actualmente están en español

---

## 📋 Casos de Uso Faltantes

### Comandos Básicos (Faltantes: 0)
- ✅ Todos implementados

### Comandos de Configuración (Faltantes: 5)
- ❌ `.\deploy.ps1 setup` - Modo interactivo
- ❌ `.\deploy.ps1 setup --yes` - Modo automático
- ❌ `.\deploy.ps1 setup --auto` - Modo automático (alternativa)
- ❌ `.\deploy.ps1 setup -y` - Modo automático (corto)
- ❌ `.\deploy.ps1 env` - Modo interactivo
- ❌ `.\deploy.ps1 environment` - Alias para env

### Variables de Entorno (Faltantes: 12)
- ❌ `.\deploy.ps1 env --modern-design true`
- ❌ `.\deploy.ps1 env --modern-design false`
- ❌ `.\deploy.ps1 env --debug-mode true`
- ❌ `.\deploy.ps1 env --debug-mode false`
- ❌ `.\deploy.ps1 env --debug-tokens true`
- ❌ `.\deploy.ps1 env --debug-tokens false`
- ❌ `.\deploy.ps1 env --all true false false`
- ❌ `.\deploy.ps1 env --all false true true`
- ❌ `.\deploy.ps1 env --modern-design true --debug-mode true --debug-tokens false` (múltiples)
- ❌ `.\deploy.ps1 env --yes`
- ❌ `.\deploy.ps1 env --auto`

### Flags Automáticos (Faltantes: 4)
- ❌ `.\deploy.ps1 start --yes`
- ❌ `.\deploy.ps1 start --auto`
- ❌ `.\deploy.ps1 start -y`
- ❌ `.\deploy.ps1 restart --yes`

### Casos de Error (Faltantes: 3)
- ❌ Manejo de valores inválidos en env
- ❌ Manejo de --all con valores faltantes
- ❌ Validación mejorada de directorio incorrecto

**Total de casos faltantes: ~24 casos de uso**

---

## 🎯 Propuesta de Implementación

### 1. Funciones de Verificación e Instalación

#### **Check-SystemTools** (Windows)
```powershell
# En Windows, las herramientas necesarias son:
# - Get-NetTCPConnection (nativo de PowerShell)
# - curl (puede necesitar instalación)
# - node, npm (requieren instalación manual)
# - forge, anvil (Foundry - requiere instalación manual)
```

**Nota**: En Windows, muchas herramientas vienen preinstaladas o se instalan manualmente. El script debe:
- Verificar que estén disponibles
- Mostrar instrucciones de instalación si faltan
- NO intentar instalar automáticamente (Windows requiere permisos de administrador y diferentes métodos)

#### **Check-ProjectDependencies**
```powershell
function Check-ProjectDependencies {
    $missingDeps = @()
    
    # Check frontend dependencies
    if (-not (Test-Path (Join-Path $WEB_DIR "node_modules"))) {
        $missingDeps += "frontend"
    }
    
    # Check smart contract dependencies
    if (-not (Test-Path (Join-Path $SC_DIR "lib\forge-std"))) {
        $missingDeps += "smart-contract"
    }
    
    return $missingDeps
}
```

#### **Install-ProjectDependencies**
```powershell
function Install-ProjectDependencies {
    param([string[]]$Dependencies)
    
    foreach ($dep in $Dependencies) {
        switch ($dep) {
            "frontend" {
                # cd web && npm install
            }
            "smart-contract" {
                # cd sc && forge install
            }
        }
    }
}
```

### 2. Función Pre-Start-Check

```powershell
function Start-PreStartCheck {
    # 1. Verificar herramientas del sistema (mostrar instrucciones si faltan)
    # 2. Verificar Node.js, npm, Foundry (mostrar instrucciones si faltan)
    # 3. Verificar dependencias del proyecto (instalar si faltan)
    # 4. Verificar variables de entorno (configurar si faltan)
}
```

### 3. Función Setup-EnvironmentVariables

```powershell
function Set-EnvironmentVariables {
    param(
        [string]$ModernDesign = "",
        [string]$DebugMode = "",
        [string]$DebugTokens = "",
        [switch]$All,
        [switch]$Auto
    )
    
    # Implementar todos los modos:
    # - Interactivo
    # - Parámetros individuales
    # - --all con 3 valores
    # - Múltiples parámetros combinados
    # - Modo automático (--yes, --auto)
}
```

### 4. Soporte para Flags Automáticos

```powershell
# En función Main:
$script:AUTO_INSTALL = $false

# Detectar flags
foreach ($arg in $args) {
    if ($arg -in @("--yes", "--auto", "-y")) {
        $script:AUTO_INSTALL = $true
        break
    }
}
```

### 5. Traducción de Mensajes

Todos los mensajes deben estar en inglés para consistencia con `deploy.sh`:
- "Iniciar" → "Start"
- "Detener" → "Stop"
- "Estado" → "Status"
- etc.

---

## 📝 Plan de Implementación

### Fase 1: Funciones Base
1. ✅ Traducir todos los mensajes al inglés
2. ✅ Implementar Check-SystemTools (Windows)
3. ✅ Implementar Check-ProjectDependencies
4. ✅ Implementar Install-ProjectDependencies

### Fase 2: Comandos de Configuración
5. ✅ Implementar Start-PreStartCheck
6. ✅ Implementar Set-EnvironmentVariables (con todos los modos)
7. ✅ Agregar comando `setup` al switch principal
8. ✅ Agregar comando `env` al switch principal

### Fase 3: Flags y Modo Automático
9. ✅ Implementar detección de flags --yes, --auto, -y
10. ✅ Integrar modo automático en todas las funciones
11. ✅ Agregar soporte para flags en start y restart

### Fase 4: Validación y Pruebas
12. ✅ Validar todos los 42 casos de uso
13. ✅ Verificar manejo de errores
14. ✅ Actualizar documentación

---

## 🔧 Consideraciones Específicas de Windows

### 1. Instalación de Herramientas
- **Node.js/npm**: Requiere descarga manual o uso de Chocolatey/Winget
- **Foundry**: Requiere instalación manual desde foundry.paradigm.xyz
- **curl**: Viene preinstalado en Windows 10/11
- **Get-NetTCPConnection**: Nativo de PowerShell

### 2. Permisos
- El script NO debe requerir permisos de administrador para ejecutarse
- Las instalaciones manuales pueden requerir permisos elevados (mostrar instrucciones)

### 3. Paths
- Usar `Join-Path` para construir rutas (ya implementado ✅)
- Usar backslashes `\` en rutas de Windows

### 4. Procesos
- Usar `Get-Process` y `Stop-Process` (ya implementado ✅)
- Usar `Get-NetTCPConnection` para verificar puertos (ya implementado ✅)

---

## ✅ Resultado Esperado

Después de la implementación, `deploy.ps1` debe:

1. ✅ Tener funcionalidad equivalente a `deploy.sh`
2. ✅ Cubrir los 42 casos de uso documentados
3. ✅ Funcionar correctamente en Windows 10/11
4. ✅ Tener todos los mensajes en inglés
5. ✅ Soportar modo automático (--yes, --auto, -y)
6. ✅ Verificar e instalar dependencias automáticamente
7. ✅ Configurar variables de entorno con todos los modos
8. ✅ Ser completamente operativo después de clonar el proyecto

---

## 📊 Métricas

- **Líneas actuales**: 1,349
- **Líneas estimadas después**: ~2,200-2,500
- **Funciones nuevas**: ~8-10
- **Casos de uso cubiertos**: 42/42 (100%)

---

**Estado**: Listo para implementación

