# 🪟 Guía de Uso - deploy.ps1 (Windows 10/11)

> **Script PowerShell para automatizar deployment de Anvil + Smart Contract + Frontend**

**Versión**: 2.0.0 (PowerShell)  
**Plataforma**: Windows 10/11  
**Última actualización**: 26 de Noviembre, 2025

---

## 📋 Requisitos Previos

### 1. PowerShell
- **Windows 10/11**: PowerShell 5.1+ viene preinstalado
- Verificar versión: `$PSVersionTable.PSVersion`
- Si necesitas PowerShell 7+: Descargar desde [PowerShell GitHub](https://github.com/PowerShell/PowerShell/releases)

### 2. Foundry (Anvil y Forge)
- Instalar desde: https://book.getfoundry.sh/getting-started/installation
- Verificar instalación:
  ```powershell
  anvil --version
  forge --version
  ```

### 3. Node.js y npm
- Instalar desde: https://nodejs.org/
- Verificar instalación:
  ```powershell
  node --version
  npm --version
  ```

---

## 🔧 Configuración Inicial (Solo Primera Vez)

### Configurar Política de Ejecución

PowerShell por defecto bloquea la ejecución de scripts. Configura la política una sola vez:

```powershell
# Abrir PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Explicación**:
- `RemoteSigned`: Permite ejecutar scripts locales firmados o no firmados
- `CurrentUser`: Solo afecta al usuario actual (más seguro)

**Alternativa** (si no quieres cambiar la política):
```powershell
# Ejecutar script con bypass temporal
powershell -ExecutionPolicy Bypass -File .\deploy.ps1 start
```

---

## 🚀 Uso del Script

### Comandos Principales

```powershell
# Iniciar todo el stack (Anvil + Contrato + Frontend)
.\deploy.ps1 start

# Detener todos los servicios
.\deploy.ps1 stop

# Reiniciar todo el stack
.\deploy.ps1 restart

# Ver estado de servicios
.\deploy.ps1 status

# Mostrar instrucciones de MetaMask
.\deploy.ps1 metamask

# Limpiar estado persistente de Anvil
.\deploy.ps1 clean
```

### Comandos de Frontend (Sin Afectar Anvil/Contrato)

```powershell
# Iniciar solo el frontend (requiere Anvil corriendo)
.\deploy.ps1 frontend start

# Detener solo el frontend
.\deploy.ps1 frontend stop

# Reiniciar solo el frontend
.\deploy.ps1 frontend restart
```

### Ayuda

```powershell
.\deploy.ps1 help
# o
.\deploy.ps1 --help
```

---

## 📝 Ejemplos de Uso

### Escenario 1: Primera Ejecución

```powershell
# 1. Configurar política (solo primera vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 2. Iniciar todo
.\deploy.ps1 start

# 3. Verificar estado
.\deploy.ps1 status

# 4. Abrir navegador en http://localhost:3000
```

### Escenario 2: Desarrollo Frontend (Anvil ya corriendo)

```powershell
# 1. Hacer cambios en el frontend

# 2. Reiniciar solo el frontend (Anvil y contrato siguen corriendo)
.\deploy.ps1 frontend restart

# 3. Los cambios se reflejan sin perder el estado de Anvil
```

### Escenario 3: Limpiar Estado de Anvil

```powershell
# 1. Detener Anvil primero
.\deploy.ps1 stop

# 2. Limpiar estado
.\deploy.ps1 clean

# 3. Reiniciar con blockchain limpia
.\deploy.ps1 start
```

---

## 🔍 Verificación de Funcionamiento

### 1. Verificar que los Servicios Están Corriendo

```powershell
.\deploy.ps1 status
```

**Salida esperada**:
```
═══════════════════════════════════════════════════════════
  Estado de Servicios
═══════════════════════════════════════════════════════════

Anvil (Blockchain Local):
✓ CORRIENDO (PID: 12345, Puerto: 8545)
ℹ RPC URL: http://127.0.0.1:8545
ℹ Chain ID: 31337

Frontend (Next.js):
✓ CORRIENDO (PID: 67890, Puerto: 3000)
ℹ URL: http://localhost:3000

Smart Contract:
ℹ Dirección: 0x...
ℹ Owner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### 2. Verificar Logs

Los logs se guardan en `logs/`:
- `logs/anvil.log` - Logs de Anvil
- `logs/frontend.log` - Logs del frontend
- `logs/deploy.log` - Logs del deployment

```powershell
# Ver últimos logs de Anvil
Get-Content logs\anvil.log -Tail 20

# Ver últimos logs del frontend
Get-Content logs\frontend.log -Tail 20
```

### 3. Verificar Puertos

```powershell
# Verificar puerto de Anvil (8545)
Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue

# Verificar puerto del frontend (3000)
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

---

## ⚠️ Solución de Problemas

### Error: "No se puede cargar el archivo porque la ejecución de scripts está deshabilitada"

**Solución**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Anvil no está instalado o no está en el PATH"

**Solución**:
1. Instalar Foundry: https://book.getfoundry.sh/getting-started/installation
2. Verificar que `anvil` esté en el PATH:
   ```powershell
   Get-Command anvil
   ```
3. Si no está, agregar Foundry al PATH manualmente

### Error: "npm no está instalado o no está en el PATH"

**Solución**:
1. Instalar Node.js: https://nodejs.org/
2. Verificar que `npm` esté en el PATH:
   ```powershell
   Get-Command npm
   ```

### Error: "Puerto 8545 ya está en uso"

**Solución**:
```powershell
# Ver qué proceso está usando el puerto
Get-NetTCPConnection -LocalPort 8545 | Select-Object OwningProcess

# Detener el proceso manualmente
Stop-Process -Id <PID> -Force

# O usar el script
.\deploy.ps1 stop
```

### Error: "Puerto 3000 ya está en uso"

**Solución**:
```powershell
# Ver qué proceso está usando el puerto
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess

# Detener el proceso manualmente
Stop-Process -Id <PID> -Force

# O usar el script
.\deploy.ps1 frontend stop
```

### El Frontend No Inicia

**Verificar**:
1. Anvil está corriendo: `.\deploy.ps1 status`
2. Contrato está desplegado: Verificar `logs/contract_address.txt`
3. Ver logs del frontend: `Get-Content logs\frontend.log -Tail 50`

### Anvil No Inicia

**Verificar**:
1. Foundry está instalado: `anvil --version`
2. Puerto 8545 está libre: `Get-NetTCPConnection -LocalPort 8545`
3. Ver logs de Anvil: `Get-Content logs\anvil.log -Tail 50`

---

## 🔄 Diferencias con deploy.sh (Linux/Mac)

| Característica | deploy.sh (Linux/Mac) | deploy.ps1 (Windows) |
|----------------|----------------------|---------------------|
| **Ejecución** | `./deploy.sh start` | `.\deploy.ps1 start` |
| **Verificación de puertos** | `lsof`, `netstat` | `Get-NetTCPConnection` |
| **Gestión de procesos** | `pgrep`, `kill` | `Get-Process`, `Stop-Process` |
| **Paths** | `/path/to/file` | `\path\to\file` o `Join-Path` |
| **Colores** | Códigos ANSI | `Write-Host -ForegroundColor` |
| **Background processes** | `nohup` | `ProcessStartInfo` |

**Funcionalidad**: ✅ **100% equivalente** - Todas las funciones del script bash están implementadas en PowerShell.

---

## 📚 Referencias

- **Foundry**: https://book.getfoundry.sh/
- **PowerShell**: https://docs.microsoft.com/powershell/
- **Node.js**: https://nodejs.org/
- **MetaMask**: https://metamask.io/

---

## ✅ Checklist de Verificación

Antes de usar el script, verifica:

- [ ] PowerShell 5.1+ instalado (`$PSVersionTable.PSVersion`)
- [ ] Foundry instalado (`anvil --version`, `forge --version`)
- [ ] Node.js y npm instalados (`node --version`, `npm --version`)
- [ ] Política de ejecución configurada (`Set-ExecutionPolicy`)
- [ ] Estás en la raíz del proyecto (donde está `deploy.ps1`)
- [ ] Directorios `sc/` y `web/` existen

---

**Última actualización**: 26 de Noviembre, 2025  
**Script original**: `deploy.sh` (Linux/Mac)  
**Script convertido**: `deploy.ps1` (Windows 10/11)

