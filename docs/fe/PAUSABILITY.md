# ⏸️ Sistema de Pausabilidad - Frontend

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**

Documentación completa del sistema de pausabilidad integrado en el frontend

---

## 📋 Resumen

El sistema de pausabilidad permite al administrador pausar y reanudar el contrato inteligente. Cuando el contrato está pausado, todas las funciones críticas se deshabilitan automáticamente en el frontend, proporcionando una experiencia de usuario clara y segura.

**Implementado**: Día 4 (21 de Noviembre, 2025)

---

## 🎯 Funcionalidad

### Estado del Contrato

El contrato puede estar en dos estados:
- **Activo**: Todas las funciones están disponibles
- **Pausado**: Funciones críticas deshabilitadas

### Funciones Afectadas cuando está Pausado

Cuando el contrato está pausado, se deshabilitan:

1. **Solicitud de roles** (`requestRole`)
2. **Cambio de roles** (`changeRole`)
3. **Creación de tokens** (`createToken`)
4. **Transferencias** (`transfer`)
5. **Aceptar transferencias** (`acceptTransfer`)
6. **Rechazar transferencias** (`rejectTransfer`)
7. **Cancelar transferencias** (`cancelTransfer`)
8. **Cambio de estado de usuarios** (solo admin puede ver, pero no cambiar)

---

## 🪝 Hooks

### `useIsPaused()`

Hook para leer el estado de pausa del contrato.

```typescript
import { useIsPaused } from '@/hooks/usePause'

function Component() {
  const { data: isPaused, isLoading } = useIsPaused()
  
  // isPaused = true | false | undefined
  // Auto-refresh cada 5 segundos
}
```

**Retorna**:
```typescript
{
  data: boolean | undefined
  isLoading: boolean
  error: Error | null
}
```

### `usePause()`

Hook para pausar el contrato (solo admin).

```typescript
import { usePause } from '@/hooks/usePause'

function PauseButton() {
  const { pause, isPending, isConfirming, isSuccess, error } = usePause()
  
  return (
    <button 
      onClick={() => pause()}
      disabled={isPending || isConfirming}
    >
      {isPending ? 'Confirming...' : 'Pause Contract'}
    </button>
  )
}
```

**Estados**:
- `isPending`: Esperando confirmación en MetaMask
- `isConfirming`: Transacción enviada, esperando confirmación blockchain
- `isSuccess`: Transacción confirmada exitosamente
- `error`: Error si algo falló

### `useUnpause()`

Hook para reanudar el contrato (solo admin).

```typescript
import { useUnpause } from '@/hooks/usePause'

function UnpauseButton() {
  const { unpause, isPending, isConfirming, isSuccess, error } = useUnpause()
  
  return (
    <button 
      onClick={() => unpause()}
      disabled={isPending || isConfirming}
    >
      {isPending ? 'Confirming...' : 'Unpause Contract'}
    </button>
  )
}
```

---

## 🎨 Componentes

### `PauseControl.tsx`

Componente principal para que el administrador controle el estado de pausa.

**Ubicación**: `web/src/components/admin/PauseControl.tsx`

**Características**:
- Muestra estado actual (Pausado/Activo) con colores visuales
- Botón para pausar con confirmación (requiere escribir "PAUSAR")
- Botón para reanudar con confirmación
- Dialogs de confirmación para ambas acciones
- Alert con lista de funciones deshabilitadas cuando está pausado
- Estados de carga durante transacciones
- Manejo de errores con alerts
- Mensajes de éxito

**Uso**:
```tsx
import { PauseControl } from '@/components/admin/PauseControl'

{isAdmin && <PauseControl />}
```

**Validación de seguridad**:
- Requiere escribir "PAUSAR" para confirmar pausa
- Dialog de confirmación para ambas acciones
- Solo accesible por administrador

---

## 🔧 Integración en Componentes

### `Header.tsx`

Muestra un badge visual cuando el contrato está pausado.

```tsx
import { useIsPaused } from '@/hooks/usePause'

function Header() {
  const { data: isPaused } = useIsPaused()
  
  return (
    <header>
      <h1>Supply Chain Tracker</h1>
      {isPaused && (
        <Badge variant="destructive">Contract Paused</Badge>
      )}
    </header>
  )
}
```

### `RegisterForm.tsx`

Oculta el formulario y muestra un alert cuando está pausado.

```tsx
import { useIsPaused } from '@/hooks/usePause'

function RegisterForm() {
  const { data: isPaused } = useIsPaused()
  
  if (isPaused) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          El contrato está pausado. No puedes solicitar un rol en este momento.
        </AlertDescription>
      </Alert>
    )
  }
  
  // ... formulario normal
}
```

### `ChangeRoleDialog.tsx`

Lógica compleja para permitir/denegar cambios según estado y pausa.

```tsx
import { useIsPaused } from '@/hooks/usePause'

function ChangeRoleDialog({ userStatus }: { userStatus: UserStatus }) {
  const { data: isPaused } = useIsPaused()
  
  // Cancelados: nunca pueden cambiar
  if (userStatus === UserStatus.Canceled) {
    return <Alert>No puedes cambiar tu rol. Contacta al administrador.</Alert>
  }
  
  // Pausado + Pending/Rejected: no pueden cambiar
  if (isPaused && (userStatus === UserStatus.Pending || userStatus === UserStatus.Rejected)) {
    return <Alert>El contrato está pausado. No puedes cambiar tu rol.</Alert>
  }
  
  // No pausado + Rejected: pueden cambiar
  // No pausado + Pending: pueden cambiar (self-management)
  // ... formulario normal
}
```

**Lógica de validación**:
- **Cancelados**: Nunca pueden cambiar rol (solo admin puede reactivar)
- **Pausado + Pending/Rejected**: No pueden cambiar
- **No pausado + Rejected**: Pueden cambiar
- **No pausado + Pending**: Pueden cambiar (self-management)

### `QuickActions.tsx`

Deshabilita botones de creación y transferencias cuando está pausado.

```tsx
import { useIsPaused } from '@/hooks/usePause'

function QuickActions() {
  const { data: isPaused } = useIsPaused()
  
  return (
    <Card>
      {isPaused && (
        <Alert>
          ⚠️ Contrato Pausado: No puedes crear tokens ni hacer transferencias.
        </Alert>
      )}
      <Button 
        onClick={() => router.push('/tokens/create')}
        disabled={isPaused}
      >
        Create Token
      </Button>
      <Button 
        onClick={() => router.push('/transfers')}
        disabled={isPaused}
      >
        Transfers
      </Button>
    </Card>
  )
}
```

### `UserManagementTable.tsx`

Deshabilita acciones de cambio de estado cuando está pausado (solo admin).

```tsx
import { useIsPaused } from '@/hooks/usePause'

function UserManagementTable() {
  const { data: isPaused } = useIsPaused()
  
  return (
    <>
      {isPaused && (
        <Alert>
          El contrato está pausado. No puedes cambiar el estado de los usuarios.
        </Alert>
      )}
      <Button
        onClick={() => changeStatus(userAddress, UserStatus.Approved)}
        disabled={isPaused}
      >
        Approve
      </Button>
      {/* ... otros botones */}
    </>
  )
}
```

### `Dashboard Page`

Deshabilita el botón "Create Token" cuando está pausado.

```tsx
import { useIsPaused } from '@/hooks/usePause'

export default function DashboardPage() {
  const { data: isPaused } = useIsPaused()
  
  return (
    <div>
      {isPaused && (
        <Alert>
          El contrato está pausado. No puedes crear tokens.
        </Alert>
      )}
      <Link href="/tokens/create">
        <Button disabled={isPaused}>
          Create Token
        </Button>
      </Link>
    </div>
  )
}
```

---

## 🎨 UI/UX

### Indicadores Visuales

1. **Badge en Header**: Muestra "Contract Paused" cuando está pausado
2. **Alert en Componentes**: Mensajes informativos en cada componente afectado
3. **Botones Deshabilitados**: Botones grises con `disabled={true}`
4. **PauseControl Card**: Card con colores (rojo=pausado, verde=activo)

### Mensajes Informativos

Todos los componentes muestran mensajes claros cuando está pausado:

- **RegisterForm**: "El contrato está pausado. No puedes solicitar un rol en este momento."
- **ChangeRoleDialog**: "El contrato está pausado. No puedes cambiar tu rol."
- **QuickActions**: "⚠️ Contrato Pausado: No puedes crear tokens ni hacer transferencias."
- **UserManagementTable**: "El contrato está pausado. No puedes cambiar el estado de los usuarios."
- **Dashboard**: "El contrato está pausado. No puedes crear tokens."

---

## 🔒 Seguridad

### Validaciones

1. **Solo Admin puede pausar/reanudar**:
   - `PauseControl` solo se muestra si `isAdmin === true`
   - El contrato valida permisos en blockchain

2. **Confirmación de Pausa**:
   - Requiere escribir "PAUSAR" para confirmar
   - Dialog de confirmación con advertencias

3. **Validación en Frontend y Backend**:
   - Frontend deshabilita UI
   - Backend rechaza transacciones con `whenNotPaused` modifier

---

## 📊 Flujo de Usuario

### Para Administrador:

1. **Pausar Contrato**:
   - Abre Dashboard
   - Ve `PauseControl` component
   - Click en "Pausar Contrato"
   - Escribe "PAUSAR" en el dialog
   - Confirma en MetaMask
   - Espera confirmación blockchain
   - Badge "Contract Paused" aparece en Header

2. **Reanudar Contrato**:
   - Abre Dashboard
   - Ve `PauseControl` component (ahora muestra estado pausado)
   - Click en "Reanudar Contrato"
   - Confirma en dialog
   - Confirma en MetaMask
   - Espera confirmación blockchain
   - Badge desaparece, funciones se habilitan

### Para Usuarios Regulares:

1. **Cuando el contrato está pausado**:
   - Ven badge "Contract Paused" en Header
   - Botones de acciones críticas están deshabilitados
   - Alerts informativos en cada componente
   - No pueden realizar acciones bloqueadas

2. **Cuando el contrato está activo**:
   - Todo funciona normalmente
   - No hay indicadores de pausa

---

## 🧪 Testing

### Casos de Prueba

1. **Admin puede pausar**:
   - Conectar como admin
   - Pausar contrato
   - Verificar que badge aparece
   - Verificar que funciones se deshabilitan

2. **Admin puede reanudar**:
   - Con contrato pausado
   - Reanudar contrato
   - Verificar que badge desaparece
   - Verificar que funciones se habilitan

3. **Usuarios no pueden pausar**:
   - Conectar como usuario regular
   - Verificar que `PauseControl` no aparece

4. **Funciones se deshabilitan cuando está pausado**:
   - Pausar contrato como admin
   - Conectar como usuario regular
   - Verificar que botones están deshabilitados
   - Verificar que alerts aparecen

5. **Confirmación de pausa funciona**:
   - Intentar pausar sin escribir "PAUSAR"
   - Verificar que botón está deshabilitado
   - Escribir "PAUSAR"
   - Verificar que botón se habilita

---

## 📝 Notas de Implementación

### Auto-refresh

`useIsPaused` tiene `refetchInterval: 5000` para actualizar el estado cada 5 segundos. Esto asegura que todos los componentes se actualicen automáticamente cuando el contrato cambia de estado.

### Optimización

- `useIsPaused` se llama una vez por componente
- React Query cachea el resultado
- Múltiples componentes comparten el mismo estado

### Consistencia

Todos los componentes que usan `useIsPaused` deben:
1. Deshabilitar acciones cuando `isPaused === true`
2. Mostrar mensajes informativos
3. Mantener consistencia visual (alerts, badges, etc.)

---

## 🔗 Referencias

- **Hooks**: [HOOKS.md](./HOOKS.md#archivo-usepausets--nuevo-día-4---3-hooks)
- **Componentes**: [COMPONENTS.md](./COMPONENTS.md#11-pausecontroltsx--nuevo-día-4---admin)
- **Smart Contract**: [docs/sc/API_REFERENCE.md](../sc/API_REFERENCE.md) - Funciones `pause()`, `unpause()`, `isPaused()`
- **Resumen Día 4**: [docs/reports/SUMMARY_DAY4.md](../reports/SUMMARY_DAY4.md)

---

**Última actualización**: 21 de Noviembre 2025 (Día 4)

