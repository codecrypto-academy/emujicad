# 🧪 Guía de Pruebas - Sincronización Multi-Pestaña

## 📋 Objetivo

Verificar que la sesión de MetaMask se sincroniza correctamente entre todas las pestañas abiertas de la aplicación.

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

**Pasos:**
1. Con la sesión activa en Pestaña A
2. Abre una nueva pestaña (Pestaña B) en la misma URL
3. Observa el comportamiento

**Resultado esperado:**
- ✅ Pestaña B muestra la cuenta conectada automáticamente
- ✅ NO solicita nueva conexión a MetaMask
- ✅ Ambas pestañas muestran la misma cuenta
- ✅ Logs en consola: `🔄 Restored session from localStorage: 0x...`

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

**Pasos:**
1. Con ambas pestañas desconectadas
2. En Pestaña B, haz clic en "Conectar Wallet" y conecta
3. Observa Pestaña A

**Resultado esperado:**
- ✅ Pestaña B muestra la cuenta conectada
- ✅ Pestaña A se conecta automáticamente (sin recargar)
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

## ✅ Criterios de Éxito

La implementación es exitosa si:

1. ✅ Todas las pestañas se sincronizan automáticamente
2. ✅ No se solicitan múltiples conexiones a MetaMask
3. ✅ La sesión persiste al cerrar y reabrir el navegador
4. ✅ Los cambios de cuenta/red se detectan correctamente
5. ✅ No hay errores en la consola del navegador
6. ✅ La experiencia de usuario es fluida y sin interrupciones

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

## 📝 Notas Adicionales

- El evento `storage` solo se dispara en pestañas diferentes a la que hizo el cambio
- La pestaña que realiza el cambio actualiza su estado directamente
- localStorage es específico por dominio/origen
- La sincronización funciona incluso con 10+ pestañas abiertas

## 🎯 Próximos Pasos

Después de validar todos los tests:

1. Documenta cualquier comportamiento inesperado
2. Reporta bugs encontrados
3. Sugiere mejoras en la UX
4. Continúa con el desarrollo del Admin Panel
