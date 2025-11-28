/**
 * Utilidades para formatear errores de transacciones de manera amigable para el usuario
 */

/**
 * Formatea un error de transacción en un mensaje amigable para el usuario
 * @param error - El error de la transacción
 * @param context - Contexto de la acción (opcional, para personalizar el mensaje)
 * @returns Objeto con el mensaje amigable y si el error fue cancelado por el usuario
 */
export function formatTransactionError(
  error: unknown,
  context?: {
    action?: string // Ej: "change role", "register", "transfer", etc.
    walletName?: string // Nombre de la wallet (MetaMask, etc.)
  }
): {
  friendlyMessage: string
  isUserCancelled: boolean
  technicalDetails?: string // Solo para desarrollo
} {
  const errorAny = error as any
  const errorCode = errorAny?.cause?.cause?.code || errorAny?.code
  const errorName = errorAny?.cause?.cause?.name || errorAny?.name || ''
  const errorMsg = errorAny?.message || String(error) || ''
  const errorStr = errorMsg.toLowerCase()
  const errorNameStr = errorName.toLowerCase()
  
  // Detectar si el usuario canceló la transacción
  const isUserCancelled = 
    errorCode === 4001 ||
    errorNameStr.includes('userrejected') ||
    errorStr.includes('user rejected') ||
    errorStr.includes('user denied') ||
    errorStr.includes('user cancelled') ||
    errorStr.includes('transaction cancelled') ||
    errorStr.includes('cancelled by user') ||
    errorStr.includes('denied transaction signature')
  
  if (isUserCancelled) {
    const walletName = context?.walletName || 'your wallet'
    const action = context?.action || 'the transaction'
    return {
      friendlyMessage: `⚠️ Transaction Cancelled\n\nYou cancelled ${action} in ${walletName}. No changes were made.`,
      isUserCancelled: true,
    }
  }
  
  // Errores del contrato - mensajes amigables
  if (errorStr.includes('invalidaddress')) {
    return {
      friendlyMessage: '❌ Invalid Address\n\nThe address provided is not valid. Please check and try again.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('existinguserwithapprovedrole')) {
    return {
      friendlyMessage: '❌ Already Approved\n\nYou already have an approved role. You cannot request a new role.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('userwithexistingrole')) {
    return {
      friendlyMessage: '❌ Same Role\n\nYou are already requesting this role. Please select a different role.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('invalidrole')) {
    return {
      friendlyMessage: '❌ Invalid Role\n\nThe selected role is not valid. Please select a valid role.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('contractpaused')) {
    return {
      friendlyMessage: '⚠️ Contract Paused\n\nThe contract is currently paused. Please wait for the administrator to resume it.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('usercanceled')) {
    return {
      friendlyMessage: '❌ User Canceled\n\nYour account has been canceled. Please contact the administrator.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('insufficientbalance')) {
    return {
      friendlyMessage: '❌ Insufficient Balance\n\nYou do not have enough balance to complete this transaction.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('tokendoesnotexist')) {
    return {
      friendlyMessage: '❌ Token Not Found\n\nThe token you are trying to use does not exist.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('transferdoesnotexist')) {
    return {
      friendlyMessage: '❌ Transfer Not Found\n\nThe transfer you are trying to access does not exist.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('execution reverted') || errorStr.includes('reverted')) {
    // Intentar extraer el mensaje de revert si está disponible
    const revertMatch = errorStr.match(/execution reverted[:\s]+(.+)/i)
    if (revertMatch && revertMatch[1]) {
      const revertMsg = revertMatch[1].trim()
      return {
        friendlyMessage: `❌ Transaction Failed\n\n${revertMsg}`,
        isUserCancelled: false,
      }
    }
    return {
      friendlyMessage: '❌ Transaction Failed\n\nThe transaction was rejected by the contract. Please check your inputs and try again.',
      isUserCancelled: false,
    }
  }
  
  if (errorStr.includes('dropped') || (errorStr.includes('rejected') && !isUserCancelled)) {
    return {
      friendlyMessage: '❌ Transaction Rejected\n\nThe transaction was rejected. Please try again.',
      isUserCancelled: false,
    }
  }
  
  // Error genérico
  return {
    friendlyMessage: '❌ Transaction Error\n\nAn unexpected error occurred. Please try again or contact support if the problem persists.',
    isUserCancelled: false,
    technicalDetails: process.env.NODE_ENV === 'development' ? errorMsg : undefined,
  }
}

/**
 * Obtiene el nombre de la wallet conectada
 * @param connector - El conector de wagmi (opcional)
 * @returns El nombre de la wallet (MetaMask, etc.) o 'your wallet' como fallback
 */
export function getWalletName(connector?: { id?: string; name?: string } | null): string {
  if (typeof window === 'undefined') return 'your wallet'
  
  // Si tenemos un conector, verificar si es MetaMask
  if (connector) {
    // Si el conector es 'injected' y MetaMask está instalado, mostrar MetaMask
    if (connector.id === 'injected' && window.ethereum?.isMetaMask) {
      return 'MetaMask'
    }
    
    // Si el nombre del conector es MetaMask, usarlo
    if (connector.name === 'MetaMask' || connector.name?.includes('MetaMask')) {
      return 'MetaMask'
    }
    
    // Si el conector tiene un nombre válido y no es "Injected", usarlo
    if (connector.name && connector.name !== 'Injected') {
      return connector.name
    }
  }
  
  // Fallback: verificar directamente si MetaMask está instalado
  if (window.ethereum?.isMetaMask) {
    return 'MetaMask'
  }
  
  // Último fallback
  return 'your wallet'
}

