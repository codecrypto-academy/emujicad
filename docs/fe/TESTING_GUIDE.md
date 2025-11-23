# 🧪 Guía de Pruebas - Funcionalidades Existentes

> **Fecha**: 22 de Noviembre, 2025  
> **Propósito**: Verificar que todas las funcionalidades implementadas funcionan correctamente

---

## 📋 Checklist de Pruebas

### 1. ✅ Creación de Tokens (`/tokens/create`)

#### 1.1. Crear Raw Material Token (Producer)
- [ ] Conectar wallet como Producer aprobado
- [ ] Navegar a `/tokens/create?type=raw` o hacer clic en "Create Raw Material"
- [ ] Verificar que el formulario muestra:
  - Campo "Name" (texto)
  - Campo "Total Supply" (número)
  - Campo "Features" (JSON, opcional)
  - NO debe mostrar "Parent Token" (solo para Finished Product)
- [ ] Llenar formulario:
  - Name: "Plátano" (con acento para probar búsqueda)
  - Total Supply: 100
  - Features: `{"color": "yellow", "origin": "Ecuador"}`
- [ ] Hacer clic en "Create Token"
- [ ] Confirmar transacción en MetaMask
- [ ] Verificar:
  - Mensaje de éxito aparece
  - Redirección a `/tokens` (o permanece en la página)
  - Token aparece en la lista de tokens

#### 1.2. Crear Finished Product Token (Factory)
- [ ] Conectar wallet como Factory aprobado
- [ ] Asegurarse de tener balance de un Raw Material token
- [ ] Navegar a `/tokens/create?type=product`
- [ ] Verificar que el formulario muestra:
  - Campo "Parent Token" (select con tokens Raw Material disponibles)
  - Campo "Parent Amount" (número)
- [ ] Seleccionar un Parent Token del dropdown
- [ ] Verificar que aparece el balance disponible
- [ ] Llenar formulario:
  - Name: "Banana Chips"
  - Total Supply: 50
  - Parent Token: [Seleccionar token anterior]
  - Parent Amount: 25 (menor o igual al balance)
  - Features: `{"process": "fried", "packaging": "bag"}`
- [ ] Hacer clic en "Create Token"
- [ ] Confirmar transacción en MetaMask
- [ ] Verificar:
  - Mensaje de éxito
  - Token creado exitosamente
  - Balance del parent token se redujo

#### 1.3. Validación de Balance Insuficiente
- [ ] Como Factory, intentar crear Finished Product
- [ ] Seleccionar un Parent Token con balance 0
- [ ] Verificar:
  - El campo "Parent Amount" está deshabilitado
  - El botón "Create Token" está deshabilitado
  - Mensaje indica balance insuficiente
- [ ] Intentar ingresar un amount mayor al balance disponible
- [ ] Verificar:
  - El input no permite valores mayores al balance
  - El botón permanece deshabilitado

#### 1.4. Validación de Contrato Pausado
- [ ] Como Admin, pausar el contrato
- [ ] Como Producer/Factory, intentar crear token
- [ ] Verificar:
  - Mensaje de alerta indica que el contrato está pausado
  - El formulario está deshabilitado
  - No se puede enviar la transacción

#### 1.5. Validación de Permisos
- [ ] Como Retailer/Consumer, intentar acceder a `/tokens/create`
- [ ] Verificar:
  - Redirección automática o mensaje de acceso denegado
  - No se puede crear tokens (solo Producer/Factory)

---

### 2. ✅ Visualización de Tokens (`/tokens`)

#### 2.1. Lista de Tokens Propios
- [ ] Conectar wallet con tokens creados/recibidos
- [ ] Navegar a `/tokens`
- [ ] Verificar:
  - Se muestran SOLO los tokens que el usuario posee (balance > 0)
  - Cada token muestra:
    - Nombre
    - Tipo (Raw Material / Finished Product)
    - Balance del usuario
    - ID del token
  - Los tokens se muestran en formato de grid (cards)

#### 2.2. Filtros por Tipo (Según Rol)
- [ ] Como Producer:
  - Verificar que NO aparece el filtro de tipo
  - Solo se muestran Raw Material tokens
- [ ] Como Factory:
  - Verificar que SÍ aparece el filtro de tipo
  - Probar filtros:
    - "All Types" → muestra todos los tokens
    - "Raw Material" → solo Raw Material
    - "Finished Product" → solo Finished Product
- [ ] Como Retailer/Consumer:
  - Verificar que NO aparece el filtro de tipo
  - Solo se muestran Finished Product tokens

#### 2.3. Búsqueda por Nombre
- [ ] En la página `/tokens`, usar el campo de búsqueda
- [ ] Buscar "plátano" (con acento)
- [ ] Verificar:
  - Encuentra tokens con nombre "Plátano" (normalización de acentos)
- [ ] Buscar "banana" (sin acento)
- [ ] Verificar:
  - También encuentra "Plátano" (búsqueda flexible)
- [ ] Buscar un nombre que no existe
- [ ] Verificar:
  - Muestra mensaje "No tokens found"
  - Muestra sugerencia de ajustar filtros

#### 2.4. Paginación
- [ ] Crear más de 12 tokens (o tener más de 12)
- [ ] Navegar a `/tokens`
- [ ] Verificar:
  - Se muestran máximo 12 tokens por página
  - Aparecen controles de paginación (Previous/Next + números)
- [ ] Probar:
  - Clic en "Next" → muestra siguiente página
  - Clic en número de página → salta a esa página
  - Clic en "Previous" → vuelve a página anterior
  - Los filtros y búsqueda se mantienen al cambiar de página

#### 2.5. Estado Vacío
- [ ] Conectar wallet sin tokens
- [ ] Navegar a `/tokens`
- [ ] Verificar:
  - Mensaje "No tokens found"
  - Botón "Create First Token" (si es Producer/Factory aprobado)
  - O mensaje indicando que no hay tokens

#### 2.6. Click en Token Card
- [ ] Hacer clic en una TokenCard
- [ ] Verificar:
  - Redirección a `/tokens/[id]` (si está implementado)
  - O comportamiento esperado

---

### 3. ✅ Dashboard (`/dashboard`)

#### 3.1. Visualización de Perfil
- [ ] Conectar wallet
- [ ] Navegar a `/dashboard`
- [ ] Verificar:
  - Se muestra UserProfileCard con:
    - Dirección del wallet
    - Rol del usuario (Producer/Factory/Retailer/Consumer)
    - Estado (Approved/Pending/Rejected)
    - ID de usuario

#### 3.2. Estadísticas de Tokens por Tipo
- [ ] Como usuario con tokens (no admin)
- [ ] Verificar:
  - Tabla "Token Statistics" muestra:
    - Row Material: cantidad de tokens y balance total
    - Finished Product: cantidad de tokens y balance total
  - Solo muestra tipos que tienen tokens (balance > 0)

#### 3.3. Lista de Tokens Propios
- [ ] Verificar:
  - Sección "My Tokens" muestra tokens del usuario
  - Máximo 6 tokens visibles
  - Botón "View All" redirige a `/tokens`
  - Cada token es clickeable

#### 3.4. Acciones Rápidas
- [ ] Como Producer aprobado:
  - Verificar botón "Create Raw Material"
  - Verificar que redirige a `/tokens/create?type=raw`
- [ ] Como Factory aprobado:
  - Verificar botón "Create Product"
  - Verificar que redirige a `/tokens/create?type=product`
- [ ] Como Retailer/Consumer:
  - Verificar que NO aparecen botones de creación

#### 3.5. Panel de Admin
- [ ] Como Admin, navegar a `/dashboard`
- [ ] Verificar:
  - Se muestran estadísticas globales:
    - Total Tokens
    - Total Users
    - Total Transfers
  - Control de pausa (PauseControl)
  - Botón "Manage Users" redirige a `/admin/users`

---

### 4. ✅ Validaciones y Edge Cases

#### 4.1. Redirecciones
- [ ] Usuario no conectado intenta acceder a `/tokens` → redirige a `/`
- [ ] Usuario no aprobado intenta acceder a `/tokens` → redirige a `/`
- [ ] Admin intenta acceder a `/tokens` → redirige a `/dashboard`
- [ ] Usuario aprobado en `/` → redirige a `/dashboard`

#### 4.2. Estados de Carga
- [ ] Verificar skeleton loaders durante carga de datos
- [ ] Verificar que no hay flickering al refrescar datos
- [ ] Verificar mensajes de error si falla la carga

#### 4.3. Diseño Moderno
- [ ] Verificar que el diseño moderno está activo (si `NEXT_PUBLIC_MODERN_DESIGN=true`)
- [ ] Verificar glassmorphism en cards
- [ ] Verificar gradientes y animaciones
- [ ] Verificar que funciona en modo claro y oscuro

---

## 🐛 Problemas Conocidos a Verificar

1. **Búsqueda con acentos**: Ya implementado ✅
2. **Filtros condicionales por rol**: Ya implementado ✅
3. **Validación de balance en tiempo real**: Ya implementado ✅
4. **Refresco automático después de crear token**: Verificar que funciona

---

## 📝 Notas de Pruebas

- **Fecha de prueba**: _______________
- **Wallet usada**: _______________
- **Rol probado**: _______________
- **Problemas encontrados**: _______________
- **Comentarios**: _______________

---

## ✅ Resultado Final

- [ ] Todas las pruebas pasaron
- [ ] Se encontraron problemas (ver sección de problemas)
- [ ] Se necesita revisión adicional

