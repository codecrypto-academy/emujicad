# 📄 Contenido de las Páginas - Estado de Implementación

> **📋 Para el estado completo del proyecto, consulta [PROJECT_STATUS.md](./PROJECT_STATUS.md)**  
> **📚 Para documentación completa de hooks, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)**  
> **📚 Para documentación completa de componentes, consulta [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md)**

**Última actualización**: 26 de Noviembre, 2025  
**Estado**: ✅ Todas las páginas están completadas (9/9 - 100%)

---

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

## 🔄 Flujo de Navegación

> **📚 Para guía completa de navegación paso a paso con ejemplos prácticos, consulta [NAVEGACION_GUIA.md](./NAVEGACION_GUIA.md)**

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

## ⚠️ Consideraciones

### Estado de Implementación
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

> **📋 Para el estado completo del proyecto, consulta [PROJECT_STATUS.md](./PROJECT_STATUS.md)**  
> **📚 Para documentación completa de hooks, consulta [docs/fe/HOOKS.md](./docs/fe/HOOKS.md)**  
> **📚 Para documentación completa de componentes, consulta [docs/fe/COMPONENTS.md](./docs/fe/COMPONENTS.md)**

