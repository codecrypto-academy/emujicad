# 🎨 Componentes del Frontend

> Documentación de todos los componentes React implementados en el proyecto

---

## 📦 Componentes Implementados

### ✅ Componente Personalizado

#### **ConnectWallet.tsx**
**Ubicación**: `web/src/components/ConnectWallet.tsx`

Componente para conexión/desconexión con MetaMask.

**Características**:
- Conexión con MetaMask usando wagmi
- Muestra dirección acortada (0x1234...5678)
- Botón de desconexión
- Estados de carga (connecting)
- Integración con Shadcn UI Button

**Uso**:
```tsx
import { ConnectWallet } from '@/components/ConnectWallet'

export default function Page() {
  return <ConnectWallet />
}
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

## ❌ Componentes Faltantes (según README.md)

### **Headers.tsx**
**Propósito**: Navegación principal de la aplicación

**Funcionalidad esperada**:
- Logo de la aplicación
- Menú de navegación (Dashboard, Tokens, Transfers, Admin)
- ConnectWallet integrado
- Indicador de red (Anvil Local)
- Responsive para móvil

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

### **UserTable.tsx**
**Propósito**: Tabla de usuarios para panel de admin

**Props esperados**:
```tsx
interface UserTableProps {
  users: User[]
  onApprove: (address: string) => void
  onReject: (address: string) => void
}
```

**Funcionalidad esperada**:
- Tabla con usuarios registrados
- Columnas: Address, Role, Status, Date
- Botones Approve/Reject para usuarios Pending
- Badge de estados (Pending, Approved, Rejected)
- Búsqueda por address

---

## 📁 Estructura de Componentes

```
web/src/components/
├── ConnectWallet.tsx          ✅ IMPLEMENTADO
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
├── Headers.tsx                ❌ FALTA
├── TokenCard.tsx              ❌ FALTA
├── TransferList.tsx           ❌ FALTA
└── UserTable.tsx              ❌ FALTA
```

---

## 🎯 Próximos Pasos

1. **Implementar Headers.tsx** - Navegación principal
2. **Implementar TokenCard.tsx** - Tarjetas de tokens
3. **Implementar TransferList.tsx** - Lista de transferencias
4. **Implementar UserTable.tsx** - Tabla admin de usuarios

Estos componentes se usarán en las páginas que faltan por implementar.

---

**Última actualización**: 19 de Noviembre 2025
