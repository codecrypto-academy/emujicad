# 🎨 Componentes del Frontend

> Documentación de todos los componentes React implementados en el proyecto

---

## 📦 Componentes Implementados

### ✅ Componentes Personalizados (12 totales)

#### **1. ConnectWallet.tsx**
**Ubicación**: `web/src/components/ConnectWallet.tsx`

Componente para conexión/desconexión con MetaMask.

**Características**:
- Conexión con MetaMask usando wagmi
- Muestra dirección acortada (0x1234...5678)
- Botón de desconexión
- Estados de carga (connecting, isPending)
- Previene doble popup de MetaMask
- Cierra diálogo automáticamente al conectar
- Integración con Shadcn UI Button

**Uso**:
```tsx
import { ConnectWallet } from '@/components/ConnectWallet'

export default function Page() {
  return <ConnectWallet />
}
```

---

#### **2. Header.tsx** ✨ NUEVO
**Ubicación**: `web/src/components/Header.tsx`  
**Líneas**: 194

Componente unificado de navegación y branding para todas las páginas.

**Características**:
- Layout de dos filas: (1) Branding + Acciones, (2) Dirección + Rol/Estado
- Branding: "📦 Supply Chain Tracker" con ancho fijo (w-80)
- Botones condicionales según página:
  - En home: "Manage Users" (solo admin)
  - En admin: "← Home" (volver)
- Información de usuario:
  - Dirección truncada con copy-to-clipboard
  - Badge de rol (Producer, Factory, Retailer, Consumer)
  - Badge de estado (Pending, Approved, Rejected, Canceled)
  - User ID badge para no-admin
- Botones Dashboard y My Tokens para usuarios aprobados
- Theme toggle integrado (solo admin y aprobados)
- Dark mode completo con estilos profesionales
- Fixed widths para consistencia (w-80, w-60, w-36, w-24)

**Props**: Ninguno (usa hooks internos)

**Uso**:
```tsx
import { Header } from '@/components/Header'

export default function Page() {
  return (
    <>
      <Header />
      {/* Contenido de la página */}
    </>
  )
}
```

---

#### **3. ThemeToggle.tsx** ✨ NUEVO
**Ubicación**: `web/src/components/ThemeToggle.tsx`  
**Líneas**: 46

Toggle para cambiar entre modo claro y oscuro.

**Características**:
- Estado persistente en localStorage
- Default: modo claro (sin detección de sistema)
- Iconos: 🌙 (light mode) / ☀️ (dark mode)
- Actualiza documentElement.classList
- Botón circular compacto (w-10 h-10)
- Transiciones suaves

**Uso**:
```tsx
import { ThemeToggle } from '@/components/ThemeToggle'

<ThemeToggle />
```

---

#### **4. RegisterForm.tsx** ✨ NUEVO
**Ubicación**: `web/src/components/RegisterForm.tsx`

Formulario de registro de usuarios con selección de rol.

**Características**:
- Select con 4 roles: Producer, Factory, Retailer, Consumer
- Validación de rol seleccionado
- Manejo de errores específicos:
  - InvalidAddress (owner no puede registrarse)
  - ExistingUserWithApprovedRole
  - UserWithExistingRole
  - InvalidRole
- Estados de carga (isPending)
- Mensajes de éxito/error
- Oculto para usuarios admin
- Integración con useRequestRole hook

**Props**: Ninguno

**Uso**:
```tsx
import { RegisterForm } from '@/components/RegisterForm'

<RegisterForm />
```

---

#### **5. ChangeRoleDialog.tsx** ✨ NUEVO
**Ubicación**: `web/src/components/ChangeRoleDialog.tsx`

Diálogo modal para cambiar el rol de un usuario.

**Características**:
- Dialog con select de 4 roles
- Validación de nuevo rol
- Confirmación antes de cambiar
- Estados de carga
- Cierre automático al completar
- Integración con Shadcn Dialog

**Props**:
```tsx
interface ChangeRoleDialogProps {
  userAddress: string
  currentRole: string
}
```

**Uso**:
```tsx
import { ChangeRoleDialog } from '@/components/ChangeRoleDialog'

<ChangeRoleDialog 
  userAddress="0x123..."
  currentRole="Producer"
/>
```

---

#### **6. UserManagementTable.tsx** ✨ NUEVO (Admin)
**Ubicación**: `web/src/components/admin/UserManagementTable.tsx`

Componente completo de gestión de usuarios con tabla, filtros y acciones.

**Características**:
- Integración de UserStatsCards en la parte superior
- Tabla con todos los usuarios del sistema
- Filtros por estado: All, Pending, Approved, Rejected, Canceled
- Búsqueda por dirección
- Acciones por usuario:
  - Aprobar (verde) - solo Pending
  - Rechazar (rojo) - solo Pending
  - Cancelar (gris) - solo Approved
  - Cambiar Rol (azul) - todos
- Auto-refresh después de cambios (hash-based)
- Badges de estado con colores
- Badges de rol
- Sin flickering (refetch inteligente)
- Responsive grid para stats (1/2/3/5 columnas)

**Props**: Ninguno

**Uso**:
```tsx
import { UserManagementTable } from '@/components/admin/UserManagementTable'

<UserManagementTable />
```

---

#### **7. UserStatsCards.tsx** ✨ NUEVO (Admin)
**Ubicación**: `web/src/components/admin/UserStatsCards.tsx`

Cards con estadísticas del sistema para el admin panel.

**Características**:
- 5 cards con contadores:
  - Total usuarios
  - Usuarios pendientes (amarillo)
  - Usuarios aprobados (verde)
  - Usuarios rechazados (rojo)
  - Usuarios cancelados (gris)
- Grid responsive: 1/2/3/5 columnas
- Iconos visuales (👥, ⏳, ✅, ❌, 🚫)
- Alineación vertical perfecta (pb-2, pt-0)
- Dark mode compatible

**Props**:
```tsx
interface UserStatsCardsProps {
  total: number
  pending: number
  approved: number
  rejected: number
  canceled: number
}
```

**Uso**:
```tsx
import { UserStatsCards } from '@/components/admin/UserStatsCards'

<UserStatsCards
  total={10}
  pending={3}
  approved={5}
  rejected={1}
  canceled={1}
/>
```

---

#### **8. TokenCard.tsx** ✨ NUEVO (Día 4)
**Ubicación**: `web/src/components/TokenCard.tsx`  
**Líneas**: 124

Componente reutilizable para mostrar información de un token.

**Características**:
- Muestra información completa del token (ID, nombre, tipo, supply, creador)
- Soporte para mostrar balance del usuario (opcional)
- Iconos diferentes para Raw Material (Package) vs Finished Product (Factory)
- Badge con ID del token
- Muestra parent token si es un producto derivado
- Fecha de creación formateada
- Features truncadas con line-clamp
- Estados de carga con Skeleton
- Hover effects (shadow, scale)
- Click handler opcional para navegación
- Dark mode compatible

**Props**:
```tsx
interface TokenCardProps {
  tokenId?: bigint
  showBalance?: boolean  // Mostrar balance del usuario
  onClick?: () => void    // Handler para click en la card
}
```

**Uso**:
```tsx
import { TokenCard } from '@/components/TokenCard'

// Card básica
<TokenCard tokenId={1n} />

// Con balance del usuario
<TokenCard tokenId={1n} showBalance={true} />

// Con click handler
<TokenCard 
  tokenId={1n} 
  onClick={() => router.push(`/tokens/${1}`)} 
/>
```

**Hooks utilizados**:
- `useGetToken(tokenId)` - Obtiene datos del token
- `useGetTokenBalance(tokenId, address)` - Obtiene balance del usuario

---

#### **9. TokenCardModern.tsx** ✨ NUEVO (Día 6)
**Ubicación**: `web/src/components/TokenCardModern.tsx`  
**Líneas**: ~180

Versión moderna del TokenCard con diseño 2025 (glassmorphism, gradientes, animaciones).

**Características**:
- Glassmorphism con `backdrop-blur-xl` y bordes semitransparentes
- Gradientes azul-púrpura en títulos y elementos
- Animaciones suaves y efectos hover mejorados
- Bordes redondeados (`rounded-2xl`, `rounded-3xl`)
- Sombras modernas (`shadow-lg`, `shadow-2xl`)
- Misma funcionalidad que TokenCard (balance, onClick, etc.)
- Diseño minimalista y elegante

**Props**: Mismas que `TokenCard.tsx`
```tsx
interface TokenCardModernProps {
  tokenId?: bigint
  showBalance?: boolean
  onClick?: () => void
}
```

**Uso**:
```tsx
import { TokenCardModern } from '@/components/TokenCardModern'

<TokenCardModern 
  tokenId={1n} 
  showBalance={true}
  onClick={() => router.push(`/tokens/${1}`)} 
/>
```

**Activación**: Se usa automáticamente cuando `NEXT_PUBLIC_MODERN_DESIGN=true` en páginas que lo soportan.

---

#### **10. UserProfileCard.tsx** ✨ NUEVO (Día 4)
**Ubicación**: `web/src/components/UserProfileCard.tsx`  
**Líneas**: 170

Componente para mostrar el perfil del usuario conectado.

**Características**:
- Muestra User ID, Address, Role y Status
- Badges de estado con iconos (Approved, Pending, Rejected, Canceled)
- Colores por rol (Producer=azul, Factory=purple, Retailer=naranja, Consumer=verde)
- Mensajes informativos según estado
- Estados de carga con Skeleton
- Manejo de usuarios no registrados
- Dark mode compatible

**Props**: Ninguno (usa `useAccount` internamente)

**Uso**:
```tsx
import { UserProfileCard } from '@/components/UserProfileCard'

<UserProfileCard />
```

**Hooks utilizados**:
- `useAccount()` - Obtiene address conectada
- `useUserInfo(address)` - Obtiene información del usuario

---

#### **10. QuickActions.tsx** ✨ NUEVO (Día 4)
**Ubicación**: `web/src/components/QuickActions.tsx`  
**Líneas**: 154

Componente con botones de acciones rápidas para usuarios aprobados.

**Características**:
- Botones condicionales según rol:
  - Producer: "Create Raw Material"
  - Factory: "Create Product"
  - Todos: "My Tokens", "Transfers"
- Validación de estado (solo usuarios aprobados)
- Deshabilitación cuando el contrato está pausado
- Alert informativo cuando está pausado
- Estados de carga con Skeleton
- Manejo de usuarios no registrados/no aprobados
- Dark mode compatible

**Props**: Ninguno (usa hooks internos)

**Uso**:
```tsx
import { QuickActions } from '@/components/QuickActions'

<QuickActions />
```

**Hooks utilizados**:
- `useAccount()` - Obtiene address conectada
- `useUserInfo(address)` - Obtiene información del usuario
- `useIsPaused()` - Verifica si el contrato está pausado

---

#### **11. PauseControl.tsx** ✨ NUEVO (Día 4 - Admin)
**Ubicación**: `web/src/components/admin/PauseControl.tsx`  
**Líneas**: 279

Componente para que el administrador pause/reanude el contrato.

**Características**:
- Muestra estado actual del contrato (Pausado/Activo)
- Botón para pausar con confirmación (requiere escribir "PAUSAR")
- Botón para reanudar con confirmación
- Dialog de confirmación para ambas acciones
- Alert con lista de funciones deshabilitadas cuando está pausado
- Estados de carga durante transacciones
- Manejo de errores con alerts
- Mensajes de éxito
- Colores visuales (rojo=pausado, verde=activo)
- Dark mode compatible

**Props**: Ninguno

**Uso**:
```tsx
import { PauseControl } from '@/components/admin/PauseControl'

// Solo visible para admin
{isAdmin && <PauseControl />}
```

**Hooks utilizados**:
- `useIsPaused()` - Lee estado de pausa
- `usePause()` - Hook para pausar
- `useUnpause()` - Hook para reanudar

**Validación de seguridad**:
- Requiere escribir "PAUSAR" para confirmar pausa
- Dialog de confirmación para ambas acciones
- Solo accesible por administrador

---

### ✅ Componentes Shadcn UI (10 totales)

Todos ubicados en `web/src/components/ui/`

#### 1. **button.tsx**
Botón base con variantes (default, destructive, outline, secondary, ghost, link)

```tsx
import { Button } from "@/components/ui/button"

<Button>Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="lg">Large</Button>
```

#### 2. **card.tsx**
Contenedor con header, contenido y footer

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

#### 3. **input.tsx**
Campo de entrada de texto

```tsx
import { Input } from "@/components/ui/input"

<Input type="text" placeholder="Enter text..." />
<Input type="number" placeholder="Amount" />
```

#### 4. **label.tsx**
Etiqueta para formularios

```tsx
import { Label } from "@/components/ui/label"

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

#### 5. **select.tsx**
Selector dropdown

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="producer">Producer</SelectItem>
    <SelectItem value="factory">Factory</SelectItem>
    <SelectItem value="retailer">Retailer</SelectItem>
    <SelectItem value="consumer">Consumer</SelectItem>
  </SelectContent>
</Select>
```

#### 6. **table.tsx**
Tabla con header, body, footer

```tsx
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Token 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

#### 7. **badge.tsx**
Badge/etiqueta para estados

```tsx
import { Badge } from "@/components/ui/badge"

<Badge>Default</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="secondary">Secondary</Badge>
```

#### 8. **dialog.tsx**
Modal/diálogo

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div>Content</div>
    <DialogFooter>
      <Button>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### 9. **alert.tsx**
Alertas/notificaciones

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

<Alert>
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    Your transaction is pending confirmation.
  </AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
</Alert>
```

#### 10. **skeleton.tsx** ✨ NUEVO (Día 4)
Placeholder de carga animado

```tsx
import { Skeleton } from "@/components/ui/skeleton"

<Skeleton className="h-4 w-full" />
<Skeleton className="h-6 w-3/4" />
```

---

---

## ❌ Componentes Pendientes

### **TransferList.tsx**
**Propósito**: Lista de transferencias pendientes/completadas

**Props esperados**:
```tsx
interface TransferListProps {
  transfers: Transfer[]
  showActions?: boolean // Mostrar botones Accept/Reject
}
```

**Funcionalidad esperada**:
- Tabla con transferencias
- Estados: Pending, Accepted, Rejected
- Botones Accept/Reject para pendientes
- Filtros por estado
- Paginación si hay muchas

---

## 📁 Estructura de Componentes

```
web/src/components/
├── ConnectWallet.tsx          ✅ IMPLEMENTADO
├── Header.tsx                 ✅ IMPLEMENTADO (Día 4: badge pausa)
├── ThemeToggle.tsx            ✅ IMPLEMENTADO (Día 4: persistencia)
├── RegisterForm.tsx           ✅ IMPLEMENTADO (Día 4: validación pausa)
├── ChangeRoleDialog.tsx       ✅ IMPLEMENTADO (Día 4: validación pausa)
├── TokenCard.tsx              ✅ IMPLEMENTADO (Día 4)
├── TokenCardModern.tsx         ✅ IMPLEMENTADO (Día 6 - Diseño Moderno 2025)
├── UserProfileCard.tsx        ✅ IMPLEMENTADO (Día 4)
├── QuickActions.tsx            ✅ IMPLEMENTADO (Día 4)
├── admin/
│   ├── UserManagementTable.tsx  ✅ IMPLEMENTADO (Día 4: validación pausa)
│   ├── UserStatsCards.tsx       ✅ IMPLEMENTADO
│   └── PauseControl.tsx         ✅ IMPLEMENTADO (Día 4)
├── ui/                        ✅ 10 componentes Shadcn
│   ├── button.tsx            ✅
│   ├── card.tsx              ✅
│   ├── input.tsx             ✅
│   ├── label.tsx             ✅
│   ├── select.tsx            ✅
│   ├── table.tsx             ✅
│   ├── badge.tsx             ✅
│   ├── dialog.tsx            ✅
│   ├── alert.tsx             ✅
│   └── skeleton.tsx          ✅ (Día 4)
└── TransferList.tsx           ❌ PENDIENTE
```

**Total**: 21 componentes (10 Shadcn + 11 personalizados)
- ✅ Implementados: 20 componentes
- ❌ Pendientes: 1 componente (TransferList.tsx)

---

## 🎯 Próximos Pasos

1. **Implementar TransferList.tsx** - Lista de transferencias (para página /transfers)

Este componente se usará en la página `/transfers` que falta por implementar.

---

## 📝 Notas de Actualización (Día 4)

### Componentes Nuevos:
- ✅ **TokenCard.tsx** - Tarjeta reutilizable para tokens
- ✅ **TokenCardModern.tsx** - Versión moderna 2025 con glassmorphism (Día 6)
- ✅ **UserProfileCard.tsx** - Perfil de usuario
- ✅ **QuickActions.tsx** - Acciones rápidas con validación de pausa
- ✅ **PauseControl.tsx** - Control de pausa para admin

### Componentes Mejorados:
- ✅ **Header.tsx** - Agregado badge de "Contract Pausado"
- ✅ **ThemeToggle.tsx** - Persistencia de tema por usuario (localStorage)
- ✅ **RegisterForm.tsx** - Validación cuando el contrato está pausado
- ✅ **ChangeRoleDialog.tsx** - Validación de pausa y estados de usuario
- ✅ **UserManagementTable.tsx** - Deshabilitación de acciones cuando está pausado

### Componentes Shadcn Agregados:
- ✅ **skeleton.tsx** - Para estados de carga

---

**Última actualización**: 21 de Noviembre 2025 (Día 4)
