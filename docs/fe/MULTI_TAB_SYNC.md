# Sincronización de Sesión Multi-Pestaña

> **📋 Para el estado más actualizado del proyecto, consulta [PROJECT_STATUS.md](../../PROJECT_STATUS.md)**

> ⚠️ **ESTADO ACTUAL**: Implementación parcial (solo sincronización de desconexiones)  
> **Última actualización**: 26 de Noviembre, 2025 - Día 2 - Feature completa POSTPONED por problemas de race conditions

---

## 📋 Contenido

Este documento consolida toda la información sobre sincronización multi-pestaña:
1. **Descripción e Implementación** - Cómo funciona el sistema
2. **Guía de Pruebas** - Cómo testear la funcionalidad

---

## 📋 Descripción

El sistema implementa sincronización **parcial** de la sesión de MetaMask entre pestañas. Actualmente solo sincroniza **desconexiones**:

- ✅ **Sincronización de desconexiones**: Si un usuario se desconecta en una pestaña, todas las demás se desconectan automáticamente
- ⏸️ **Reconexión automática**: POSTPONED (causaba race conditions y bugs)
- ⏸️ **Sincronización de conexiones**: POSTPONED (requiere más diseño y testing)

---

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

---

## 🔄 Flujos de Sincronización

### 1. Conexión en Pestaña A

```
Pestaña A: Usuario conecta → localStorage actualizado
    ↓
Pestaña B: Detecta cambio → Se conecta automáticamente
Pestaña C: Detecta cambio → Se conecta automáticamente
```

**Resultado**: Todas las pestañas muestran la misma cuenta conectada

> **⚠️ NOTA**: La reconexión automática está POSTPONED. Actualmente, cada pestaña debe conectarse manualmente.

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

---

## 🎯 Casos de Uso

### Escenario 1: Abrir Nueva Pestaña

```
1. Usuario tiene sesión activa en Pestaña A
2. Usuario abre nueva Pestaña B
3. Pestaña B carga → Lee localStorage → Se conecta automáticamente
4. Resultado: Ambas pestañas muestran la misma cuenta
```

> **⚠️ NOTA**: Actualmente, la reconexión automática está POSTPONED. El usuario debe conectar manualmente en cada pestaña nueva.

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

---

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

---

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

---

## 📝 Código Relevante

### Web3Context.tsx

El componente `Web3Provider` implementa 5 efectos principales:

1. **Inicialización**: Carga la sesión desde localStorage al montar
2. **Persistencia**: Guarda la sesión cuando se conecta/desconecta
3. **Sincronización entre pestañas**: Escucha eventos de storage
4. **Detección de cambio de cuenta (pestaña actual)**: Actualiza localStorage
5. **Listener de eventos de MetaMask**: Responde a cambios en la wallet

---

## ⚠️ Estado de la Implementación

**Implementado (Día 2 - Versión Simplificada)**:
- ✅ Sincronización de desconexiones entre pestañas
- ✅ Persistencia de última dirección conectada en localStorage
- ✅ Detección de cambios de cuenta en MetaMask

**POSTPONED (Día 2 - Error 12)**:
- ⏸️ Reconexión automática cuando otra pestaña se conecta (causaba race conditions)
- ⏸️ Sincronización completa de estado entre pestañas
- ⏸️ Soporte para múltiples wallets (WalletConnect, Coinbase Wallet)
- ⏸️ Sincronización de estado de usuario (rol, status)
- ⏸️ Caché de datos del usuario entre pestañas
- ⏸️ Notificaciones visuales de cambios en otras pestañas

**Razón del POSTPONED**: La implementación completa causó múltiples bugs y estados inconsistentes. Se decidió priorizar estabilidad sobre features avanzadas. Ver `IA.md` - Error 12 para más detalles.

---

# 🧪 GUÍA DE PRUEBAS

## 📋 Objetivo

Verificar que la **sincronización de desconexiones** funciona correctamente entre pestañas. La reconexión automática está POSTPONED (ver `IA.md` - Error 12).

## ✅ Prerrequisitos

1. Anvil corriendo en el puerto 8545
2. Smart contract deployado
3. Frontend corriendo en el puerto 3000
4. MetaMask instalado y conectado a Anvil (Chain ID 31337)

## 🧪 Escenarios de Prueba

### Test 1: Conexión Inicial

**Pasos:**
1. Abre la aplicación en una pestaña (Pestaña A)
2. Verifica que muestra "Conectar Wallet"
3. Haz clic en "Conectar Wallet" y conecta con MetaMask
4. Verifica que la sesión se guarda

**Resultado esperado:**
- ✅ La cuenta se muestra correctamente
- ✅ El localStorage contiene `lastConnectedAddress`
- ✅ Logs en consola: `✅ Session persisted to localStorage: 0x...`

---

### Test 2: Nueva Pestaña con Sesión Activa

> ⚠️ **NOTA**: La reconexión automática está POSTPONED. Este test describe el comportamiento esperado si se implementara en el futuro.

**Pasos:**
1. Con la sesión activa en Pestaña A
2. Abre una nueva pestaña (Pestaña B) en la misma URL
3. Observa el comportamiento

**Resultado esperado (si estuviera implementado):**
- ⏸️ Pestaña B mostraría la cuenta conectada automáticamente
- ⏸️ NO solicitaría nueva conexión a MetaMask
- ⏸️ Ambas pestañas mostrarían la misma cuenta

**Resultado actual (POSTPONED):**
- ✅ Pestaña B muestra "Conectar Wallet" (reconexión automática no implementada)
- ✅ El usuario debe conectar manualmente en cada pestaña nueva

---

### Test 3: Desconexión desde Pestaña A

**Pasos:**
1. Con Pestaña A y Pestaña B abiertas y conectadas
2. En Pestaña A, haz clic en "Desconectar"
3. Observa ambas pestañas

**Resultado esperado:**
- ✅ Pestaña A muestra "Conectar Wallet"
- ✅ Pestaña B se desconecta automáticamente (sin recargar)
- ✅ localStorage limpio (`lastConnectedAddress` eliminado)
- ✅ Logs en consola de Pestaña B: `❌ Disconnection detected in another tab, syncing...`

---

### Test 4: Reconexión desde Pestaña B

> ⚠️ **NOTA**: La reconexión automática está POSTPONED. Este test describe el comportamiento esperado si se implementara en el futuro.

**Pasos:**
1. Con ambas pestañas desconectadas
2. En Pestaña B, haz clic en "Conectar Wallet" y conecta
3. Observa Pestaña A

**Resultado esperado (si estuviera implementado):**
- ⏸️ Pestaña B mostraría la cuenta conectada
- ⏸️ Pestaña A se conectaría automáticamente (sin recargar)

**Resultado actual (POSTPONED):**
- ✅ Pestaña B muestra la cuenta conectada
- ✅ Pestaña A permanece desconectada (reconexión automática no implementada)
- ✅ El usuario debe conectar manualmente en cada pestaña
- ✅ Ambas pestañas muestran la misma cuenta
- ✅ Logs en consola de Pestaña A: `🔗 New connection detected in another tab, syncing...`

---

### Test 5: Cambio de Cuenta en MetaMask

**Pasos:**
1. Con ambas pestañas conectadas con Cuenta 1
2. Abre MetaMask y cambia a Cuenta 2
3. Observa ambas pestañas

**Resultado esperado:**
- ✅ Ambas pestañas detectan el cambio
- ✅ Ambas pestañas actualizan a Cuenta 2
- ✅ localStorage actualizado con la nueva cuenta
- ✅ Logs en consola: `🔄 MetaMask accounts changed: ['0x...']`
- ✅ Logs en consola: `🔄 Account switched in MetaMask, updating all tabs...`

---

### Test 6: Múltiples Pestañas (3+)

**Pasos:**
1. Abre 4 pestañas (A, B, C, D)
2. Conecta en Pestaña A
3. Desconecta en Pestaña C
4. Reconecta en Pestaña D

**Resultado esperado:**
- ✅ Todas las pestañas se sincronizan correctamente
- ✅ Ninguna pestaña solicita múltiples conexiones
- ✅ Todas muestran el mismo estado en todo momento

---

### Test 7: Cerrar y Reabrir Navegador

**Pasos:**
1. Conecta MetaMask
2. Cierra completamente el navegador
3. Reabre el navegador y abre la aplicación

**Resultado esperado:**
- ✅ La aplicación intenta reconectar automáticamente
- ✅ Si MetaMask permite, la sesión se restaura
- ✅ Logs en consola: `🔄 Restored session from localStorage: 0x...`

---

### Test 8: Cambio de Red en MetaMask

**Pasos:**
1. Con ambas pestañas conectadas
2. Cambia la red en MetaMask (de Anvil a otra)
3. Observa ambas pestañas

**Resultado esperado:**
- ✅ Ambas pestañas se recargan automáticamente
- ✅ Logs en consola: `⛓️ Chain changed, reloading...`

---

### Test 9: Desconexión desde MetaMask

**Pasos:**
1. Con ambas pestañas conectadas
2. Abre MetaMask y desconecta la aplicación manualmente
3. Observa ambas pestañas

**Resultado esperado:**
- ✅ Ambas pestañas se desconectan automáticamente
- ✅ localStorage limpio
- ✅ Logs en consola: `❌ No accounts, clearing localStorage and disconnecting`

---

## 🔍 Debugging

### Ver Estado en Consola

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ver dirección guardada
localStorage.getItem('lastConnectedAddress')

// Ver timestamp de sesión
localStorage.getItem('wallet_connection_session')

// Limpiar sesión manualmente
localStorage.clear()
```

### Logs Esperados

Durante el uso normal, deberías ver logs como:

```
🔄 Restored session from localStorage: 0x123...
✅ Session persisted to localStorage: 0x123...
📡 Storage change detected: { key: 'lastConnectedAddress', newValue: '0x456...', oldValue: '0x123...' }
🔗 New connection detected in another tab, syncing...
❌ Disconnection detected in another tab, syncing...
🔄 MetaMask accounts changed: ['0x789...']
```

---

## 📊 Checklist de Validación

Marca cada prueba al completarla:

- [ ] Test 1: Conexión Inicial
- [ ] Test 2: Nueva Pestaña con Sesión Activa
- [ ] Test 3: Desconexión desde Pestaña A
- [ ] Test 4: Reconexión desde Pestaña B
- [ ] Test 5: Cambio de Cuenta en MetaMask
- [ ] Test 6: Múltiples Pestañas (3+)
- [ ] Test 7: Cerrar y Reabrir Navegador
- [ ] Test 8: Cambio de Red en MetaMask
- [ ] Test 9: Desconexión desde MetaMask

---

## ✅ Criterios de Éxito

La implementación es exitosa si:

1. ✅ Todas las pestañas se sincronizan automáticamente (desconexiones)
2. ✅ No se solicitan múltiples conexiones a MetaMask
3. ✅ La sesión persiste al cerrar y reabrir el navegador
4. ✅ Los cambios de cuenta/red se detectan correctamente
5. ✅ No hay errores en la consola del navegador
6. ✅ La experiencia de usuario es fluida y sin interrupciones

---

## 🐛 Problemas Comunes

### Problema: Las pestañas no se sincronizan

**Solución:**
1. Verifica que localStorage esté habilitado en tu navegador
2. Abre la consola y busca mensajes de error
3. Verifica que el evento `storage` esté funcionando:
   ```javascript
   window.addEventListener('storage', (e) => console.log('Storage event:', e))
   ```

### Problema: MetaMask solicita múltiples conexiones

**Solución:**
1. Limpia localStorage: `localStorage.clear()`
2. Recarga todas las pestañas
3. Conecta nuevamente desde una sola pestaña

### Problema: La sesión no persiste al recargar

**Solución:**
1. Verifica que localStorage contenga la dirección:
   ```javascript
   localStorage.getItem('lastConnectedAddress')
   ```
2. Verifica que MetaMask esté conectado a la aplicación
3. Revisa los logs de inicialización en consola

---

## 📝 Notas Adicionales

- El evento `storage` solo se dispara en pestañas diferentes a la que hizo el cambio
- La pestaña que realiza el cambio actualiza su estado directamente
- localStorage es específico por dominio/origen
- La sincronización funciona incluso con 10+ pestañas abiertas

---

## 🎯 Próximos Pasos

Después de validar todos los tests:

1. Documenta cualquier comportamiento inesperado
2. Reporta bugs encontrados
3. Sugiere mejoras en la UX
4. Continúa con el desarrollo del Admin Panel

---

## 📚 Referencias

- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [StorageEvent](https://developer.mozilla.org/en-US/docs/Web/API/StorageEvent)
- [MetaMask Events](https://docs.metamask.io/wallet/reference/provider-api/#events)
- [wagmi Documentation](https://wagmi.sh/react/getting-started)

---

**Última actualización**: 26 de Noviembre, 2025
