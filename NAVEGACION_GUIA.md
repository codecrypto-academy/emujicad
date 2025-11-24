# 🧭 Guía de Navegación - Páginas de Tokens

> **📋 Esta guía explica cómo navegar entre las páginas de tokens. Para el estado completo del proyecto, consulta [PROJECT_STATUS.md](../PROJECT_STATUS.md)**

## 📍 Flujo de Navegación Completo

### **Paso 1: Ir a la Lista de Tokens**

1. **Desde el Header**: Haz clic en el botón **"My Tokens"** en la barra superior
2. **Desde el Dashboard**: Haz clic en el botón **"My Tokens"** en el dashboard
3. **URL directa**: `http://localhost:3000/tokens` (o tu IP: `http://192.168.178.107:3000/tokens`)

**Resultado**: Verás una lista de todas tus tarjetas de tokens (TokenCard o TokenCardModern)

---

### **Paso 2: Ver Detalles de un Token**

**Opción A: Desde la Lista de Tokens**
1. En la página `/tokens`, verás tarjetas de tokens
2. **Haz clic en cualquier tarjeta de token** (la tarjeta completa es clickeable)
3. Serás redirigido a `/tokens/[id]` (ejemplo: `/tokens/1`)

**Opción B: URL Directa**
- Escribe en el navegador: `http://localhost:3000/tokens/1` (reemplaza `1` con el ID del token que quieres ver)

**Resultado**: Verás la página de detalles del token con:
- ✅ Información completa del token
- ✅ Historial de transferencias
- ✅ Estadísticas
- ✅ Trazabilidad (si es Finished Product)

---

### **Paso 3: Transferir Tokens desde Detalles**

**Desde la Página de Detalles (`/tokens/[id]`)**:
1. En la parte superior derecha, verás un botón azul **"Transfer Tokens"**
2. **Haz clic en ese botón**
3. Serás redirigido a `/tokens/[id]/transfer` (ejemplo: `/tokens/1/transfer`)

**Resultado**: Verás el formulario de transferencia con:
- ✅ Token pre-seleccionado (no editable)
- ✅ Campo de cantidad
- ✅ Selector de destinatario
- ✅ Resumen antes de enviar

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

**Solución**: 
- Verifica tu balance en la página de detalles
- Si eres Consumer, solo puedes recibir transferencias
- Si el contrato está pausado, espera a que se reactive

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

**Solución**:
- Verifica que el token ID sea correcto
- Asegúrate de que el contrato esté desplegado
- Verifica que MetaMask esté conectado

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

2. **Sección de Trazabilidad**:
   - ✅ **Visible**: Solo para Finished Products con parent token
   - ❌ **Oculta**: Para Raw Materials (no tienen parent)

3. **Historial de Transferencias**:
   - ✅ **Visible**: Siempre (puede estar vacío)
   - 📊 **Filtros**: Dropdown arriba a la derecha de la tabla

---

## 🔗 URLs de Ejemplo

### **Lista de Tokens**:
```
http://localhost:3000/tokens
http://192.168.178.107:3000/tokens
```

### **Detalles del Token #1**:
```
http://localhost:3000/tokens/1
http://192.168.178.107:3000/tokens/1
```

### **Transferir Token #1**:
```
http://localhost:3000/tokens/1/transfer
http://192.168.178.107:3000/tokens/1/transfer
```

---

## 💡 Tips de Navegación

1. **Usa el botón "Back" del navegador**: Funciona normalmente
2. **Mantén abierta la consola**: Para ver errores si algo no funciona
3. **Verifica tu conexión**: Asegúrate de que MetaMask esté conectado
4. **Recarga si es necesario**: Si algo no carga, recarga la página (F5)

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

