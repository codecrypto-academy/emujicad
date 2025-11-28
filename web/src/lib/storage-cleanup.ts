/**
 * Utilidades para limpiar localStorage cuando no hay conexión activa
 * o cuando se cierra la última pestaña del frontend
 */

/**
 * Obtiene todas las claves de localStorage relacionadas con la aplicación
 */
function getAppStorageKeys(): string[] {
  if (typeof window === 'undefined') return []
  
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    
    // Identificar claves de la aplicación:
    // - userInfo_* (información de usuarios)
    // - lastConnectedAddress (dirección conectada)
    // - theme_* (preferencias de tema)
    if (
      key.startsWith('userInfo_') ||
      key === 'lastConnectedAddress' ||
      key.startsWith('theme_')
    ) {
      keys.push(key)
    }
  }
  
  return keys
}

/**
 * Limpia todo el localStorage relacionado con la aplicación
 */
export function clearAppStorage(): void {
  if (typeof window === 'undefined') return
  
  const keys = getAppStorageKeys()
  console.log('🧹 [StorageCleanup] Limpiando localStorage:', keys)
  
  keys.forEach(key => {
    localStorage.removeItem(key)
  })
  
  // También limpiar sessionStorage por si acaso
  sessionStorage.clear()
  
  console.log('✅ [StorageCleanup] localStorage limpiado completamente')
}

/**
 * Verifica si hay una conexión activa de MetaMask
 */
export async function hasActiveConnection(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    return Array.isArray(accounts) && accounts.length > 0
  } catch (error) {
    return false
  }
}

/**
 * Inicializa el sistema de limpieza automática de localStorage
 * Se ejecuta cuando:
 * 1. No hay conexión activa de MetaMask al cargar la página
 * 2. Se cierra la última pestaña del frontend (sin conexión activa)
 * 3. El usuario desconecta MetaMask completamente
 */
export function initStorageCleanup(): () => void {
  if (typeof window === 'undefined') {
    return () => {} // No-op en servidor
  }
  
  let cleanupTimer: NodeJS.Timeout | null = null
  
  // Función para limpiar si no hay conexión activa
  const cleanupIfNoConnection = async () => {
    const hasConnection = await hasActiveConnection()
    const hasStoredAddress = localStorage.getItem('lastConnectedAddress')
    
    // Si no hay conexión activa Y no hay dirección guardada, limpiar todo
    if (!hasConnection && !hasStoredAddress) {
      console.log('🧹 [StorageCleanup] No hay conexión activa ni dirección guardada, limpiando localStorage')
      clearAppStorage()
      return true
    }
    
    return false
  }
  
  // Verificar al cargar la página (después de un pequeño delay para que wagmi inicialice)
  setTimeout(() => {
    cleanupIfNoConnection()
  }, 1000)
  
  // Verificar periódicamente (cada 10 segundos) si no hay conexión
  const checkInterval = setInterval(async () => {
    await cleanupIfNoConnection()
  }, 10000)
  
  // Usar sessionStorage para rastrear si hay otras pestañas
  const TAB_ID = `tab_${Date.now()}_${Math.random()}`
  const TABS_KEY = 'app_active_tabs'
  
  // Registrar esta pestaña
  const registerTab = () => {
    try {
      const tabs = JSON.parse(sessionStorage.getItem(TABS_KEY) || '[]') as string[]
      if (!tabs.includes(TAB_ID)) {
        tabs.push(TAB_ID)
        sessionStorage.setItem(TABS_KEY, JSON.stringify(tabs))
      }
    } catch (error) {
      console.error('Error registering tab:', error)
    }
  }
  
  // Desregistrar esta pestaña
  const unregisterTab = () => {
    try {
      const tabs = JSON.parse(sessionStorage.getItem(TABS_KEY) || '[]') as string[]
      const filtered = tabs.filter(id => id !== TAB_ID)
      sessionStorage.setItem(TABS_KEY, JSON.stringify(filtered))
      return filtered.length === 0 // Retorna true si esta era la última pestaña
    } catch (error) {
      console.error('Error unregistering tab:', error)
      return true // En caso de error, asumir que es la última
    }
  }
  
  // Limpiar pestañas antiguas (más de 1 minuto sin actualizar)
  const cleanupOldTabs = () => {
    try {
      const tabs = JSON.parse(sessionStorage.getItem(TABS_KEY) || '[]') as string[]
      // Las pestañas se identifican por timestamp, así que podemos limpiar las muy antiguas
      // Por ahora, simplemente mantenemos todas
      sessionStorage.setItem(TABS_KEY, JSON.stringify(tabs))
    } catch (error) {
      // Ignorar errores
    }
  }
  
  // Registrar esta pestaña al cargar
  registerTab()
  cleanupOldTabs()
  
  // Actualizar registro periódicamente (cada 5 segundos)
  const updateInterval = setInterval(() => {
    registerTab()
    cleanupOldTabs()
  }, 5000)
  
  // Detectar cierre de pestaña/ventana
  const handleBeforeUnload = () => {
    const isLastTab = unregisterTab()
    const hasStoredAddress = localStorage.getItem('lastConnectedAddress')
    
    // Si es la última pestaña Y no hay dirección guardada, limpiar todo
    // Nota: No podemos hacer async aquí, así que solo marcamos para limpiar
    if (isLastTab && !hasStoredAddress) {
      // Usar sendBeacon para limpiar de forma síncrona si es posible
      try {
        clearAppStorage()
        console.log('🧹 [StorageCleanup] Última pestaña cerrada, localStorage limpiado')
      } catch (error) {
        console.error('Error cleaning up on beforeunload:', error)
      }
    }
  }
  
  // Detectar cuando la página se descarga (cierre de pestaña)
  const handlePageHide = async () => {
    const isLastTab = unregisterTab()
    const hasConnection = await hasActiveConnection()
    const hasStoredAddress = localStorage.getItem('lastConnectedAddress')
    
    // Si es la última pestaña Y no hay conexión activa, limpiar
    if (isLastTab && !hasConnection && !hasStoredAddress) {
      console.log('🧹 [StorageCleanup] Última pestaña cerrada sin conexión, limpiando localStorage')
      clearAppStorage()
    }
  }
  
  // Detectar cuando la pestaña se oculta (puede ser cierre)
  const handleVisibilityChange = async () => {
    if (document.visibilityState === 'hidden') {
      // Esperar un momento para ver si realmente se está cerrando
      if (cleanupTimer) clearTimeout(cleanupTimer)
      
      cleanupTimer = setTimeout(async () => {
        // Si después de 2 segundos la pestaña sigue oculta, verificar
        if (document.visibilityState === 'hidden') {
          const hasConnection = await hasActiveConnection()
          const hasStoredAddress = localStorage.getItem('lastConnectedAddress')
          
          // Si no hay conexión y no hay dirección guardada, podría estar cerrando
          // Pero no limpiar aquí porque podría ser solo un cambio de pestaña
          if (!hasConnection && !hasStoredAddress) {
            // Verificar si hay otras pestañas
            try {
              const tabs = JSON.parse(sessionStorage.getItem(TABS_KEY) || '[]') as string[]
              if (tabs.length <= 1) {
                // Solo esta pestaña, podría estar cerrando
                console.log('🧹 [StorageCleanup] Pestaña oculta sin conexión y sin otras pestañas')
                // No limpiar aquí, esperar a pagehide o beforeunload
              }
            } catch (error) {
              // Ignorar errores
            }
          }
        }
      }, 2000)
    } else {
      // Pestaña visible de nuevo, cancelar timer
      if (cleanupTimer) {
        clearTimeout(cleanupTimer)
        cleanupTimer = null
      }
      // Re-registrar la pestaña
      registerTab()
    }
  }
  
  // Agregar event listeners
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('pagehide', handlePageHide)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Cleanup function
  return () => {
    clearInterval(checkInterval)
    clearInterval(updateInterval)
    if (cleanupTimer) clearTimeout(cleanupTimer)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    window.removeEventListener('pagehide', handlePageHide)
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    unregisterTab()
  }
}

