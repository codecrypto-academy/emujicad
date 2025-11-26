# 📄 Guía Completa de Páginas Frontend - Supply Chain Tracker

> **📋 Para el estado completo del proyecto, consulta [PROJECT_STATUS.md](./PROJECT_STATUS.md)**  
> **📚 Para documentación completa de hooks, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)**  
> **📚 Para documentación completa de componentes, consulta [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md)**

**Última actualización**: 26 de Noviembre, 2025  
**Estado**: ✅ Todas las páginas están completadas (9/9 - 100%)

---

## 📋 Contenido

Esta guía consolida toda la información sobre las páginas frontend:
1. **Contenido de las Páginas** - Detalles de implementación
2. **Guía de Navegación** - Cómo navegar entre páginas paso a paso

---

# 1️⃣ CONTENIDO DE LAS PÁGINAS

## 1. `/tokens/[id]` - Página de Detalles del Token

### 🎯 Propósito
Mostrar información completa y detallada de un token específico, incluyendo su historial de transferencias y trazabilidad completa.

### 📋 Contenido Implementado

> **Nota**: Este documento describe el contenido implementado en las páginas. Para ver el código fuente, consulta `web/src/app/tokens/[id]/page.tsx`.

#### **Sección 1: Información Principal del Token**
- **Header con nombre del token** (grande y destacado)
- **Badge del tipo**: Raw Material / Finished Product
- **Token ID**: `#123`
- **Total Supply**: Cantidad total creada
- **Mi Balance**: Balance del usuario actual (si tiene)
- **Fecha de creación**: Formato legible
- **Creator**: Dirección del creador (con AddressDisplay)
- **Parent Token**: Si es Finished Product, mostrar:
  - ID del token padre
  - Nombre del token padre
  - Link para ver detalles del token padre
- **Features**: Metadatos JSON parseados y mostrados de forma legible

#### **Sección 2: Trazabilidad Completa** (Solo para Finished Product)
- **Árbol de trazabilidad**:
  ```
  Raw Material Token #1 (madera)
    └── Finished Product Token #2 (lapices) ← Token actual
  ```
- **Historial de transformación**: Mostrar cómo se creó este producto desde la materia prima
- **Información del parent token**: Link para ver detalles del token padre

#### **Sección 3: Historial de Transferencias**
- **Tabla de transferencias** relacionadas con este token:
  - ID de transferencia
  - From (remitente)
  - To (destinatario)
  - Amount (cantidad transferida)
  - Status (Pending, Accepted, Rejected, Cancelled)
  - Date (fecha de creación)
  - Acciones (si aplica)
- **Filtros**:
  - Por estado (All, Pending, Accepted, Rejected, Cancelled)
  - Por dirección (From/To)
- **Estadísticas**:
  - Total de transferencias
  - Transferencias aceptadas
  - Transferencias pendientes
  - Total de tokens transferidos

#### **Sección 4: Distribución de Tokens**
- **Lista de usuarios con balance** de este token:
  - Dirección del usuario
  - Balance actual
  - Porcentaje del total supply
- **Gráfico de distribución** (opcional, con librería de gráficos):
  - Pie chart o bar chart mostrando distribución

#### **Sección 5: Acciones**
- **Botón "Transfer Tokens"**: Link a `/tokens/[id]/transfer`
- **Botón "Back to Tokens"**: Volver a `/tokens`
- **Botón "View Parent Token"**: Si tiene parent, ver detalles del token padre

### 🎨 Diseño
- Usar el mismo diseño moderno (glassmorphism) que las otras páginas
- Layout en columnas: información principal a la izquierda, historial a la derecha
- Responsive: en móvil, todo en una columna

---

## 2. `/tokens/[id]/transfer` - Página de Transferencia desde Detalles

### 🎯 Propósito
Formulario de transferencia pre-rellenado con el token seleccionado, permitiendo transferir directamente desde la página de detalles.

### 📋 Contenido Implementado

> **Nota**: Este documento describe el contenido implementado en las páginas. Para ver el código fuente, consulta `web/src/app/tokens/[id]/transfer/page.tsx`.

#### **Sección 1: Información del Token a Transferir**
- **Card con resumen del token**:
  - Nombre del token
  - Token ID
  - Tipo (Raw Material / Finished Product)
  - **Mi balance disponible**: Destacado en grande
  - Total Supply
  - Link "Ver detalles completos" → `/tokens/[id]`

#### **Sección 2: Formulario de Transferencia**
Similar a `CreateTransferForm` pero con:
- **Token ID**: Pre-seleccionado y bloqueado (no editable)
- **Token Name**: Mostrado para referencia (solo lectura)
- **Amount**: Campo editable con validaciones:
  - No puede ser 0
  - No puede ser negativo
  - No puede exceder el balance disponible
  - Mostrar: "Balance disponible: X tokens"
- **Recipient**: Dropdown con usuarios disponibles según rol:
  - Producer → Solo Factory aprobados
  - Factory → Solo Retailer aprobados
  - Retailer → Solo Consumer aprobados
  - Consumer → No puede transferir (mostrar mensaje)

#### **Sección 3: Resumen de la Transferencia**
Antes de enviar, mostrar:
- **Token**: Nombre e ID
- **Cantidad**: X tokens
- **Destinatario**: Dirección y rol
- **Balance después**: "Tu balance será: X tokens"

#### **Sección 4: Acciones**
- **Botón "Transfer"**: Enviar transferencia
- **Botón "Cancel"**: Volver a `/tokens/[id]`
- **Botón "Back to Details"**: Volver a `/tokens/[id]`

### 🎨 Diseño
- Formulario centrado con card
- Validaciones en tiempo real
- Mensajes de error claros
- Loading states durante la transacción
- Success message con link a la transferencia creada

### ⚠️ Validaciones Especiales
- Verificar que el usuario tiene balance suficiente
- Verificar que el contrato no está pausado
- Verificar que el usuario está aprobado
- Verificar que el destinatario es válido según el rol

---

## 📊 Datos Necesarios

### Para `/tokens/[id]`:
- ✅ `useGetToken(tokenId)` - Información del token
- ✅ `useGetTokenBalance(tokenId, address)` - Balance del usuario
- ✅ `useGetAllTransfers()` - Todas las transferencias (filtrar por tokenId)
- ✅ `useGetToken(parentTokenId)` - Información del token padre (si aplica)
- ✅ `useTokenTraceability(tokenId)` - Trazabilidad end-to-end con árbol jerárquico

> **📚 Ver documentación completa de hooks**: [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)

### Para `/tokens/[id]/transfer`:
- ✅ `useGetToken(tokenId)` - Información del token
- ✅ `useGetTokenBalance(tokenId, address)` - Balance del usuario
- ✅ `useGetAllUsers()` - Usuarios disponibles según rol (filtrado en el componente)
- ✅ `useTransfer()` - Hook para crear transferencia
- ✅ `useIsPaused()` - Verificar si el contrato está pausado

> **📚 Ver documentación completa de hooks**: [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)

---

## ⚠️ Estado de Implementación

Estas páginas **están implementadas y funcionando** (completadas el 23 de Noviembre, 2025 - Día 8):
- ✅ `/tokens/[id]` - Página de detalles con trazabilidad end-to-end completa
- ✅ `/tokens/[id]/transfer` - Formulario de transferencia desde detalles

**Funcionalidad**:
- ✅ Links desde las tarjetas de tokens (`/tokens`) a `/tokens/[id]`
- ✅ Botón "Transfer Tokens" en la página de detalles que lleva a `/tokens/[id]/transfer`
- ✅ Funcionalidad existente en `/tokens` y `/transfers` mantenida

> **📚 Ver estado completo**: [PROJECT_STATUS.md](./PROJECT_STATUS.md) | [QUICKSTART.md](./QUICKSTART.md)

---

## 📝 Checklist de Implementación

### `/tokens/[id]`: ✅ COMPLETADO (23 de Noviembre, 2025 - Día 8)
- [x] Crear estructura de página
- [x] Implementar sección de información principal
- [x] Implementar sección de trazabilidad end-to-end (árbol interactivo)
- [x] Implementar tabla de historial de transferencias
- [x] Implementar estadísticas de transferencias
- [x] Agregar botones de acción
- [x] Agregar links desde `/tokens` (token cards)
- [x] Testing y validación

**Características implementadas**:
- ✅ Visualización de árbol de trazabilidad con expand/collapse
- ✅ Filtrado por dirección en el árbol
- ✅ Resaltado de nodos según el rol del usuario actual
- ✅ Muestra creación, envío, recepción y aceptación/rechazo de transferencias
- ✅ Información del token en la línea superior de cada nodo
- ✅ Formato optimizado (todo en una línea para ahorrar espacio vertical)
- ✅ Hook `useTokenTraceability` para trazabilidad end-to-end completa

> **📚 Ver implementación**: `web/src/app/tokens/[id]/page.tsx` | [docs/fe/HOOKS.md - useTokenTraceability](./docs/fe/HOOKS.md#23-usetokentraceabilitytokenid-bigint--undefined)

### `/tokens/[id]/transfer`: ✅ COMPLETADO (23 de Noviembre, 2025 - Día 8)
- [x] Crear estructura de página
- [x] Implementar card de información del token
- [x] Implementar formulario de transferencia
- [x] Agregar validaciones específicas
- [x] Implementar resumen antes de enviar
- [x] Agregar botones de acción
- [x] Agregar link desde `/tokens/[id]`
- [x] Testing y validación

> **📚 Ver implementación**: `web/src/app/tokens/[id]/transfer/page.tsx` | [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md)

---

# 2️⃣ GUÍA DE NAVEGACIÓN

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

---

### **Paso 4: Volver Atrás**

**Desde la Página de Detalles**:
- Botón **"Back to Tokens"** (arriba a la izquierda) → Vuelve a `/tokens`

**Desde la Página de Transferencia**:
- Botón **"Cancel"** o **"Back to Token Details"** → Vuelve a `/tokens/[id]`

---

## 🔄 Flujo de Navegación Visual

```
/tokens (lista de tokens)
  └── Click en token card
      └── /tokens/[id] (detalles)
          ├── Click "Transfer Tokens"
          │   └── /tokens/[id]/transfer (formulario)
          │       ├── Submit → Crear transferencia → Redirección a /tokens/[id]
          │       └── Cancel/Back → Volver a /tokens/[id]
          └── Click "View Parent Token" (si aplica)
              └── /tokens/[parentId] (detalles del parent)
```

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

## 🎯 Valor Agregado

### ¿Por qué implementar estas páginas?

1. **Mejor UX**: 
   - Los usuarios pueden ver detalles completos sin tener que buscar en la lista
   - Transferencia directa desde los detalles es más intuitiva

2. **Trazabilidad Completa**:
   - Ver el historial completo de un token específico
   - Entender la cadena de suministro de un producto

3. **Información Centralizada**:
   - Todo sobre un token en un solo lugar
   - Distribución de tokens entre usuarios

4. **Cumplimiento con README.md**:
   - 100% de las páginas requeridas implementadas
   - Mejor evaluación del proyecto

---

> **📋 Para el estado completo del proyecto, consulta [PROJECT_STATUS.md](./PROJECT_STATUS.md)**  
> **📚 Para documentación completa de hooks, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)**  
> **📚 Para documentación completa de componentes, consulta [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md)**  
> **📚 Para guía rápida de inicio, consulta [QUICKSTART.md](./QUICKSTART.md)**

---

**Última actualización**: 26 de Noviembre, 2025

