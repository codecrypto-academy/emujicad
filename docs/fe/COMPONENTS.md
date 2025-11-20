# 🎨 Componentes del Frontend

> Documentación de todos los componentes React implementados en el proyecto

---

## 📦 Componentes Implementados

### ✅ Componentes Personalizados (7 totales)

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

### ✅ Componentes Shadcn UI (9 totales)

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

---

---

## ❌ Componentes Pendientes

### **TokenCard.tsx**
**Propósito**: Tarjeta para mostrar información de un token

**Props esperados**:
```tsx
interface TokenCardProps {
  tokenId: number
  name: string
  totalSupply: number
  balance: number
  creator: string
  features: string // JSON
  parentId?: number
}
```

**Funcionalidad esperada**:
- Mostrar información del token
- Badge para tipo (RawMaterial, FinishedProduct)
- Botón "Transfer" si el usuario tiene balance
- Link a detalles del token

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
├── Header.tsx                 ✅ IMPLEMENTADO
├── ThemeToggle.tsx            ✅ IMPLEMENTADO
├── RegisterForm.tsx           ✅ IMPLEMENTADO
├── ChangeRoleDialog.tsx       ✅ IMPLEMENTADO
├── admin/
│   ├── UserManagementTable.tsx  ✅ IMPLEMENTADO
│   └── UserStatsCards.tsx       ✅ IMPLEMENTADO
├── ui/                        ✅ 9 componentes Shadcn
│   ├── button.tsx            ✅
│   ├── card.tsx              ✅
│   ├── input.tsx             ✅
│   ├── label.tsx             ✅
│   ├── select.tsx            ✅
│   ├── table.tsx             ✅
│   ├── badge.tsx             ✅
│   ├── dialog.tsx            ✅
│   └── alert.tsx             ✅
├── TokenCard.tsx              ❌ PENDIENTE
└── TransferList.tsx           ❌ PENDIENTE
```

**Total**: 16 componentes (9 Shadcn + 7 personalizados)
- ✅ Implementados: 14 componentes
- ❌ Pendientes: 2 componentes

---

## 🎯 Próximos Pasos

1. **Implementar TokenCard.tsx** - Tarjetas de tokens (para página /tokens)
2. **Implementar TransferList.tsx** - Lista de transferencias (para página /transfers)

Estos componentes se usarán en las páginas que faltan por implementar.

---

**Última actualización**: 20 de Noviembre 2025
