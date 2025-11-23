import { useMemo } from 'react'
import { useGetAllUsers, UserRole } from './useAdminUsers'
import type { User } from './useAdminUsers'

/**
 * Hook para obtener usuarios filtrados por rol según el flujo de la cadena de suministro
 * 
 * Reglas de transferencia:
 * - Producer → solo puede transferir a Factory
 * - Factory → solo puede transferir a Retailer
 * - Retailer → solo puede transferir a Consumer
 * 
 * @param currentUserRole Rol del usuario actual (Producer, Factory, Retailer)
 * @returns Usuarios aprobados del rol objetivo, solo usuarios con status Approved
 */
export function useUsersByRole(currentUserRole?: bigint) {
  const { users, isLoading, error } = useGetAllUsers()

  // Determinar el rol objetivo según el rol actual
  const targetRole = useMemo(() => {
    console.log('[useUsersByRole] Determining target role:', {
      currentUserRole,
      currentUserRoleType: typeof currentUserRole,
      currentUserRoleNumber: currentUserRole !== undefined && currentUserRole !== null ? Number(currentUserRole) : 'undefined',
      UserRoleProducer: UserRole.Producer,
      UserRoleFactory: UserRole.Factory,
      UserRoleRetailer: UserRole.Retailer,
      UserRoleConsumer: UserRole.Consumer
    })
    
    // ⚠️ CRÍTICO: No usar !currentUserRole porque 0n (BigInt zero para Producer) es falsy
    // Debe verificar explícitamente undefined o null
    if (currentUserRole === undefined || currentUserRole === null) {
      console.log('[useUsersByRole] ⚠️ No currentUserRole provided (undefined/null)')
      return undefined
    }
    
    const roleNum = Number(currentUserRole)
    console.log('[useUsersByRole] Role number:', roleNum)
    
    // Producer (0) → Factory (1)
    if (roleNum === UserRole.Producer) {
      console.log('[useUsersByRole] ✅ Producer detected, target role: Factory (1)')
      return UserRole.Factory
    }
    
    // Factory (1) → Retailer (2)
    if (roleNum === UserRole.Factory) {
      console.log('[useUsersByRole] ✅ Factory detected, target role: Retailer (2)')
      return UserRole.Retailer
    }
    
    // Retailer (2) → Consumer (3)
    if (roleNum === UserRole.Retailer) {
      console.log('[useUsersByRole] ✅ Retailer detected, target role: Consumer (3)')
      return UserRole.Consumer
    }
    
    console.log('[useUsersByRole] ⚠️ Unknown role:', roleNum)
    return undefined
  }, [currentUserRole])

  // Filtrar usuarios por rol objetivo y status Approved
  const filteredUsers = useMemo(() => {
    console.log('[useUsersByRole] Filtering users:', {
      currentUserRole: currentUserRole ? Number(currentUserRole) : 'undefined',
      targetRole,
      totalUsers: users?.length || 0,
      users: users?.map(u => ({
        address: u.userAddress,
        role: Number(u.role),
        status: Number(u.status),
        roleName: ['Producer', 'Factory', 'Retailer', 'Consumer'][Number(u.role)] || 'Unknown',
        statusName: ['Pending', 'Approved', 'Rejected', 'Canceled'][Number(u.status)] || 'Unknown'
      })) || []
    })
    
    if (!targetRole) {
      console.log('[useUsersByRole] No target role determined')
      return []
    }
    
    if (!users || users.length === 0) {
      console.log('[useUsersByRole] No users available')
      return []
    }

    const filtered = users.filter((user: User) => {
      const userRole = Number(user.role)
      const userStatus = Number(user.status)
      
      // Solo usuarios con el rol objetivo y status Approved
      const matches = userRole === targetRole && userStatus === 1 // UserStatus.Approved = 1
      
      if (matches) {
        console.log('[useUsersByRole] ✅ Found matching user:', {
          address: user.userAddress,
          role: userRole,
          roleName: ['Producer', 'Factory', 'Retailer', 'Consumer'][userRole] || 'Unknown',
          status: userStatus,
          statusName: ['Pending', 'Approved', 'Rejected', 'Canceled'][userStatus] || 'Unknown',
          targetRole,
          targetRoleName: ['Producer', 'Factory', 'Retailer', 'Consumer'][targetRole] || 'Unknown'
        })
      }
      
      return matches
    })
    
    console.log('[useUsersByRole] Filter result:', {
      totalUsers: users.length,
      targetRole,
      targetRoleName: ['Producer', 'Factory', 'Retailer', 'Consumer'][targetRole] || 'Unknown',
      filteredCount: filtered.length,
      filteredUsers: filtered.map(u => ({
        address: u.userAddress,
        role: Number(u.role),
        status: Number(u.status)
      }))
    })
    
    return filtered
  }, [users, targetRole, currentUserRole])

  return {
    users: filteredUsers,
    isLoading,
    error,
    targetRole,
  }
}

