# 🧭 Guía de Navegación - Páginas de Tokens

> **📋 Esta guía explica cómo navegar entre las páginas de tokens. Para el estado completo del proyecto, consulta [PROJECT_STATUS.md](./PROJECT_STATUS.md)**  
> **📚 Para detalles de implementación de las páginas, consulta [PAGES_DETAILS.md](./PAGES_DETAILS.md)**  
> **📚 Para documentación completa de componentes, consulta [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md)**

**Última actualización**: 26 de Noviembre, 2025

## 📍 Flujo de Navegación Completo

### **Paso 1: Ir a la Lista de Tokens**

1. **Desde el Header**: Haz clic en el botón **"My Tokens"** en la barra superior
2. **Desde el Dashboard**: Haz clic en el botón **"My Tokens"** en el dashboard
3. **URL directa**: `http://localhost:3000/tokens` (o tu IP si accedes desde otro dispositivo)

**Resultado**: Verás una lista de todas tus tarjetas de tokens (TokenCard o TokenCardModern)

---

### **Paso 2: Ver Detalles de un Token**

**Opción A: Desde la Lista de Tokens**
1. En la página `/tokens`, verás tarjetas de tokens
2. **Haz clic en cualquier tarjeta de token** (la tarjeta completa es clickeable)
3. Serás redirigido a `/tokens/[id]` (ejemplo: `/tokens/1`)

**Opción B: URL Directa**
- Escribe en el navegador: `http://localhost:3000/tokens/1` (reemplaza `1` con el ID del token que quieres ver)
- También puedes usar tu IP si accedes desde otro dispositivo

**Resultado**: Verás la página de detalles del token con:
- ✅ Información completa del token
- ✅ Historial de transferencias
- ✅ Estadísticas
- ✅ Trazabilidad end-to-end con árbol interactivo (si es Finished Product)

> **📚 Ver detalles completos**: [PAGES_DETAILS.md](./PAGES_DETAILS.md#1-tokensid---página-de-detalles-del-token)

---

### **Paso 3: Transferir Tokens desde Detalles**

**Desde la Página de Detalles (`/tokens/[id]`)**:
1. En la parte superior derecha, verás un botón azul **"Transfer Tokens"**
2. **Haz clic en ese botón**
3. Serás redirigido a `/tokens/[id]/transfer` (ejemplo: `/tokens/1/transfer`)

**Resultado**: Verás el formulario de transferencia con:
- ✅ Token pre-seleccionado (no editable)
- ✅ Campo de cantidad con validaciones
- ✅ Selector de destinatario (filtrado por rol)
- ✅ Resumen antes de enviar
- ✅ Validación de balance disponible

> **📚 Ver detalles completos**: [PAGES_DETAILS.md](./PAGES_DETAILS.md#2-tokensidtransfer---página-de-transferencia-desde-detalles)

---

### **Paso 4: Volver Atrás**

**Desde la Página de Detalles**:
- Botón **"Back to Tokens"** (arriba a la izquierda) → Vuelve a `/tokens`

**Desde la Página de Transferencia**:
- Botón **"Cancel"** o **"Back to Token Details"** → Vuelve a `/tokens/[id]`

---

## 🎯 Ejemplo Práctico Completo

### **Escenario: Ver detalles del Token #2 y transferirlo**

1. **Ir a My Tokens**:
   ```
   Click en "My Tokens" (Header o Dashboard)
   → Llegas a: /tokens
   ```

2. **Ver Detalles del Token #2**:
   ```
   Click en la tarjeta del Token #2
   → Llegas a: /tokens/2
   ```

3. **Transferir Tokens**:
   ```
   Click en "Transfer Tokens" (botón azul arriba a la derecha)
   → Llegas a: /tokens/2/transfer
   ```

4. **Completar Formulario**:
   ```
   - Ingresa cantidad (ej: 100)
   - Selecciona destinatario del dropdown
   - Revisa el resumen
   - Click en "Transfer Tokens"
   ```

5. **Resultado**:
   ```
   → Transferencia creada
   → Redirección automática a /tokens/2 (detalles)
   → Puedes ver la nueva transferencia en el historial
   ```

---

## 🔍 ¿Cómo Identificar las Tarjetas Clickeables?

### **En la Página `/tokens`**:

Las tarjetas de tokens tienen estas características:
- ✅ **Hover effect**: Al pasar el mouse, se elevan ligeramente
- ✅ **Cursor pointer**: El cursor cambia a "mano" al pasar sobre ellas
- ✅ **Sombra aumentada**: Al hacer hover, la sombra se hace más grande
- ✅ **Toda la tarjeta es clickeable**: No solo el título, toda la tarjeta

### **Ejemplo Visual**:
```
┌─────────────────────────────────┐
│  📦 Token Name                  │  ← Click aquí
│  #123                           │
│  Raw Material                   │
│  Balance: 1000                  │
│  Total Supply: 5000             │
│  Creator: 0x1234...             │
└─────────────────────────────────┘
```

---

## 🚨 Problemas Comunes y Soluciones

### **Problema 1: "No veo el botón Transfer Tokens"**

**Causas posibles**:
- ❌ No tienes balance del token (balance = 0)
- ❌ Tu rol no permite transferir (Consumer no puede transferir)
- ❌ El contrato está pausado
- ❌ Tu usuario no está aprobado

**Solución**: 
- Verifica tu balance en la página de detalles
- Si eres Consumer, solo puedes recibir transferencias
- Si el contrato está pausado, espera a que se reactive
- Verifica tu estado de usuario en el dashboard

> **📚 Ver validaciones de transferencia**: [docs/fe/TRANSFER_PERMISSIONS.md](./docs/fe/TRANSFER_PERMISSIONS.md)

---

### **Problema 2: "No puedo hacer clic en las tarjetas"**

**Causas posibles**:
- ❌ JavaScript deshabilitado
- ❌ Error en la consola del navegador

**Solución**:
- Abre la consola del navegador (F12)
- Busca errores en rojo
- Recarga la página (Ctrl+R o Cmd+R)

---

### **Problema 3: "La página de detalles no carga"**

**Causas posibles**:
- ❌ Token ID inválido
- ❌ Token no existe
- ❌ Error de conexión con el contrato
- ❌ Anvil no está corriendo

**Solución**:
- Verifica que el token ID sea correcto
- Asegúrate de que el contrato esté desplegado (`./deploy.sh status`)
- Verifica que MetaMask esté conectado
- Verifica que Anvil esté corriendo (`./deploy.sh status`)

> **📚 Ver troubleshooting completo**: [docs/common/DOCUMENTATION.md - Troubleshooting](./docs/common/DOCUMENTATION.md#-troubleshooting)

---

## 📱 Navegación desde Diferentes Páginas

### **Desde Dashboard**:
```
Dashboard → Click "My Tokens" → /tokens → Click tarjeta → /tokens/[id]
```

### **Desde Header**:
```
Header → Click "My Tokens" → /tokens → Click tarjeta → /tokens/[id]
```

### **Desde Transfers**:
```
Transfers → Ver transferencia → Click en Token ID (si está linkeado) → /tokens/[id]
```

---

## 🎨 Indicadores Visuales

### **En la Página de Detalles (`/tokens/[id]`)**:

1. **Botón "Transfer Tokens"** (arriba a la derecha):
   - ✅ **Visible**: Si tienes balance > 0 y puedes transferir
   - ❌ **Oculto**: Si no tienes balance o no puedes transferir

2. **Sección de Trazabilidad End-to-End**:
   - ✅ **Visible**: Solo para Finished Products con parent token
   - ❌ **Oculta**: Para Raw Materials (no tienen parent)
   - 🌳 **Características**: Árbol interactivo con expand/collapse, filtrado por dirección, resaltado de nodos

> **📚 Ver detalles de trazabilidad**: [PAGES_DETAILS.md](./PAGES_DETAILS.md#sección-2-trazabilidad-completa-solo-para-finished-product)

3. **Historial de Transferencias**:
   - ✅ **Visible**: Siempre (puede estar vacío)
   - 📊 **Filtros**: Por estado (All, Pending, Accepted, Rejected, Cancelled) y por dirección (From/To)
   - 📈 **Estadísticas**: Total de transferencias, aceptadas, pendientes, total de tokens transferidos

---

## 🔗 URLs de Ejemplo

### **Lista de Tokens**:
```
http://localhost:3000/tokens
```

### **Detalles del Token #1**:
```
http://localhost:3000/tokens/1
```

### **Transferir Token #1**:
```
http://localhost:3000/tokens/1/transfer
```

**Nota**: Si accedes desde otro dispositivo en la misma red, reemplaza `localhost` con la IP de tu máquina (ej: `http://192.168.1.100:3000/tokens`). Para verificar tu IP, ejecuta `ip addr` (Linux) o `ipconfig` (Windows).

---

## 💡 Tips de Navegación

1. **Usa el botón "Back" del navegador**: Funciona normalmente
2. **Mantén abierta la consola**: Para ver errores si algo no funciona (F12)
3. **Verifica tu conexión**: Asegúrate de que MetaMask esté conectado y en la red correcta (Anvil Local)
4. **Recarga si es necesario**: Si algo no carga, recarga la página (F5 o Ctrl+R)
5. **Usa los botones de navegación**: Los botones "Back to Tokens" y "Back to Token Details" son más confiables que el botón del navegador
6. **Verifica el estado del sistema**: Usa `./deploy.sh status` para verificar que todos los servicios estén corriendo

> **📚 Ver guía de troubleshooting**: [QUICKSTART.md - Troubleshooting Rápido](./QUICKSTART.md#-troubleshooting-rápido)

---

## 🎯 Prueba Rápida (2 minutos)

1. ✅ Ve a `/tokens`
2. ✅ Haz clic en la primera tarjeta de token
3. ✅ Verifica que llegaste a `/tokens/[id]`
4. ✅ Si tienes balance, haz clic en "Transfer Tokens"
5. ✅ Verifica que llegaste a `/tokens/[id]/transfer`
6. ✅ Haz clic en "Back to Token Details"
7. ✅ Verifica que volviste a `/tokens/[id]`
8. ✅ Haz clic en "Back to Tokens"
9. ✅ Verifica que volviste a `/tokens`

Si todos estos pasos funcionan, ¡la navegación está perfecta! 🎉

---

> **📋 Para el estado completo del proyecto, consulta [PROJECT_STATUS.md](./PROJECT_STATUS.md)**  
> **📚 Para detalles de implementación, consulta [PAGES_DETAILS.md](./PAGES_DETAILS.md)**  
> **📚 Para documentación de componentes, consulta [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md)**  
> **📚 Para guía rápida de inicio, consulta [QUICKSTART.md](./QUICKSTART.md)**

