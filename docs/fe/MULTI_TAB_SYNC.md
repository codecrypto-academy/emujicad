# Sincronización de Sesión Multi-Pestaña

## 📋 Descripción

El sistema implementa sincronización automática de la sesión de MetaMask entre todas las pestañas abiertas de la aplicación. Esto garantiza que:

- **Una sola conexión activa**: Todas las pestañas comparten la misma cuenta conectada
- **Sincronización en tiempo real**: Los cambios en una pestaña se reflejan inmediatamente en las demás
- **Seguridad mejorada**: Evita múltiples conexiones simultáneas a diferentes cuentas

## 🔧 Implementación

### Tecnologías Utilizadas

1. **localStorage**: Para persistir la sesión entre pestañas
2. **StorageEvent API**: Para detectar cambios en localStorage desde otras pestañas
3. **MetaMask Events**: Para detectar cambios de cuenta/desconexión desde la wallet

### Claves de Storage

```typescript
const STORAGE_KEY = 'lastConnectedAddress'           // Dirección de la cuenta conectada
const SESSION_STORAGE_KEY = 'wallet_connection_session'  // Timestamp de última actualización
```

## 🔄 Flujos de Sincronización

### 1. Conexión en Pestaña A

```
Pestaña A: Usuario conecta → localStorage actualizado
    ↓
Pestaña B: Detecta cambio → Se conecta automáticamente
Pestaña C: Detecta cambio → Se conecta automáticamente
```

**Resultado**: Todas las pestañas muestran la misma cuenta conectada

### 2. Desconexión en Pestaña B

```
Pestaña B: Usuario desconecta → localStorage limpiado
    ↓
Pestaña A: Detecta cambio → Se desconecta automáticamente
Pestaña C: Detecta cambio → Se desconecta automáticamente
```

**Resultado**: Todas las pestañas vuelven al estado "No conectado"

### 3. Cambio de Cuenta en MetaMask

```
MetaMask: Usuario cambia cuenta → Evento accountsChanged
    ↓
Todas las pestañas: Detectan cambio → Actualizan localStorage → Se reconectan
```

**Resultado**: Todas las pestañas sincronizan con la nueva cuenta

### 4. Cambio de Cuenta en Otra Pestaña

```
Pestaña A: Usuario cambia cuenta en MetaMask → localStorage actualizado
    ↓
Pestaña B: Detecta cambio → Se desconecta → Se reconecta con nueva cuenta
Pestaña C: Detecta cambio → Se desconecta → Se reconecta con nueva cuenta
```

**Resultado**: Todas las pestañas sincronizan con la nueva cuenta

## 🎯 Casos de Uso

### Escenario 1: Abrir Nueva Pestaña

```
1. Usuario tiene sesión activa en Pestaña A
2. Usuario abre nueva Pestaña B
3. Pestaña B carga → Lee localStorage → Se conecta automáticamente
4. Resultado: Ambas pestañas muestran la misma cuenta
```

### Escenario 2: Cerrar Todas las Pestañas

```
1. Usuario cierra todas las pestañas
2. localStorage mantiene la sesión
3. Usuario reabre la aplicación → Se conecta automáticamente
4. Resultado: Sesión persistida sin necesidad de reconectar
```

### Escenario 3: Cambio de Red

```
1. Usuario cambia de red en MetaMask
2. Evento chainChanged → window.location.reload()
3. Todas las pestañas se recargan
4. Resultado: Sincronización completa con la nueva red
```

## 🛡️ Seguridad

### Ventajas

- ✅ **Una sola conexión activa**: Evita múltiples solicitudes de firma
- ✅ **Sincronización automática**: Reduce confusión del usuario
- ✅ **Persistencia segura**: Solo almacena la dirección pública (no claves privadas)
- ✅ **Detección de cambios**: Responde inmediatamente a cambios en MetaMask

### Consideraciones

- 🔒 Solo se almacena la dirección pública (address)
- 🔒 Las claves privadas permanecen en MetaMask
- 🔒 La aplicación solicita permisos solo cuando es necesario

## 🔍 Debugging

### Logs en Consola

El sistema emite logs detallados para facilitar el debugging:

```javascript
// Inicialización
🔄 Restored session from localStorage: 0x123...

// Persistencia
✅ Session persisted to localStorage: 0x123...
❌ Session cleared from localStorage

// Sincronización entre pestañas
📡 Storage change detected: { key: 'lastConnectedAddress', newValue: '0x123...', oldValue: null }
🔗 New connection detected in another tab, syncing...
❌ Disconnection detected in another tab, syncing...
🔄 Account change detected in another tab, syncing...

// Eventos de MetaMask
🔄 MetaMask accounts changed: ['0x123...']
🔄 Account switched in MetaMask, updating all tabs...
⛓️ Chain changed, reloading...
❌ Disconnected from MetaMask
```

### Verificar Estado en DevTools

```javascript
// Consola del navegador
localStorage.getItem('lastConnectedAddress')
localStorage.getItem('wallet_connection_session')
```

## 📝 Código Relevante

### Web3Context.tsx

El componente `Web3Provider` implementa 5 efectos principales:

1. **Inicialización**: Carga la sesión desde localStorage al montar
2. **Persistencia**: Guarda la sesión cuando se conecta/desconecta
3. **Sincronización entre pestañas**: Escucha eventos de storage
4. **Detección de cambio de cuenta (pestaña actual)**: Actualiza localStorage
5. **Listener de eventos de MetaMask**: Responde a cambios en la wallet

## 🚀 Próximas Mejoras

- [ ] Soporte para múltiples wallets (WalletConnect, Coinbase Wallet)
- [ ] Sincronización de estado de usuario (rol, status)
- [ ] Caché de datos del usuario entre pestañas
- [ ] Notificaciones visuales de cambios en otras pestañas

## 📚 Referencias

- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [StorageEvent](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent)
- [MetaMask Events](https://docs.metamask.io/wallet/reference/provider-api/#events)
- [wagmi Documentation](https://wagmi.sh/react/getting-started)
