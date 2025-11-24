# 📄 Contenido de las Páginas Pendientes

## 1. `/tokens/[id]` - Página de Detalles del Token

### 🎯 Propósito
Mostrar información completa y detallada de un token específico, incluyendo su historial de transferencias y trazabilidad completa.

### 📋 Contenido Propuesto

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

### 📋 Contenido Propuesto

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

```
/tokens (lista de tokens)
  └── Click en token card
      └── /tokens/[id] (detalles)
          ├── Click "Transfer Tokens"
          │   └── /tokens/[id]/transfer (formulario)
          │       ├── Submit → Crear transferencia
          │       └── Cancel → Volver a /tokens/[id]
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
- ⚠️ **NUEVO**: Hook para obtener todos los usuarios con balance de un token (o filtrar transferencias)

### Para `/tokens/[id]/transfer`:
- ✅ `useGetToken(tokenId)` - Información del token
- ✅ `useGetTokenBalance(tokenId, address)` - Balance del usuario
- ✅ `useUsersByRole(userRole)` - Usuarios disponibles según rol
- ✅ `useTransfer()` - Hook para crear transferencia
- ✅ `useIsPaused()` - Verificar si el contrato está pausado

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

### Opcional vs Requerido
Según `PROJECT_STATUS.md`, estas páginas son **opcionales** porque:
- Los detalles se muestran en las tarjetas de `/tokens`
- Las transferencias se hacen desde `/transfers`

Sin embargo, según `README.md`, estas páginas **están listadas como requeridas**.

### Recomendación
- **Implementar ambas páginas** para cumplir 100% con el README.md
- **Mantener la funcionalidad existente** en `/tokens` y `/transfers`
- **Agregar links** desde las tarjetas de tokens a `/tokens/[id]`
- **Agregar botón "Transfer"** en la página de detalles que lleve a `/tokens/[id]/transfer`

---

## 📝 Checklist de Implementación

### `/tokens/[id]`:
- [ ] Crear estructura de página
- [ ] Implementar sección de información principal
- [ ] Implementar sección de trazabilidad (solo Finished Product)
- [ ] Implementar tabla de historial de transferencias
- [ ] Implementar sección de distribución de tokens
- [ ] Agregar botones de acción
- [ ] Agregar links desde `/tokens` (token cards)
- [ ] Testing y validación

### `/tokens/[id]/transfer`:
- [ ] Crear estructura de página
- [ ] Implementar card de información del token
- [ ] Implementar formulario de transferencia
- [ ] Agregar validaciones específicas
- [ ] Implementar resumen antes de enviar
- [ ] Agregar botones de acción
- [ ] Agregar link desde `/tokens/[id]`
- [ ] Testing y validación

