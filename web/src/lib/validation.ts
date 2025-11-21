/**
 * Data Validation Utilities
 * 
 * Robust validation functions for contract data structures.
 * These functions ensure type safety and prevent runtime errors.
 */

import { UserInfo, TokenData } from '@/types'

/**
 * Validates if a value is a valid bigint or can be converted to one
 */
function isValidBigInt(value: unknown): value is bigint {
  if (typeof value === 'bigint') return true
  if (typeof value === 'number' && Number.isInteger(value)) return true
  if (typeof value === 'string' && /^-?\d+$/.test(value)) return true
  return false
}

/**
 * Converts a value to bigint safely
 */
function toBigInt(value: unknown): bigint | null {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number' && Number.isInteger(value)) return BigInt(value)
  if (typeof value === 'string' && /^-?\d+$/.test(value)) return BigInt(value)
  return null
}

/**
 * Validates if a string is a valid Ethereum address
 */
function isValidAddress(value: unknown): value is string {
  if (typeof value !== 'string') return false
  // Ethereum address format: 0x followed by 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

/**
 * Validates UserInfo structure
 * 
 * @param data - The data to validate
 * @returns Validated UserInfo or null if invalid
 * 
 * @example
 * ```ts
 * const userInfo = validateUserInfo(rawData)
 * if (userInfo) {
 *   // Safe to use userInfo
 * }
 * ```
 */
export function validateUserInfo(data: unknown): UserInfo | null {
  // Check if data exists and is an object
  if (!data || typeof data !== 'object') {
    return null
  }

  const obj = data as Record<string, unknown>

  // Validate id (must be bigint or convertible to bigint)
  const id = toBigInt(obj.id)
  if (id === null || id < 0n) {
    return null
  }

  // Validate userAddress (must be valid Ethereum address)
  if (!isValidAddress(obj.userAddress)) {
    return null
  }

  // Validate role (must be bigint or convertible, and between 0-3)
  const role = toBigInt(obj.role)
  if (role === null || role < 0n || role > 3n) {
    return null
  }

  // Validate status (must be bigint or convertible, and between 0-3)
  const status = toBigInt(obj.status)
  if (status === null || status < 0n || status > 3n) {
    return null
  }

  // Validate registrationDate (must be bigint or convertible, and non-negative)
  const registrationDate = toBigInt(obj.registrationDate)
  if (registrationDate === null || registrationDate < 0n) {
    return null
  }

  // All validations passed, return validated UserInfo
  return {
    id,
    userAddress: obj.userAddress,
    role,
    status,
    registrationDate,
  }
}

/**
 * Validates if data is a valid UserInfo array (tuple from contract)
 * 
 * @param data - The data to validate (usually from useUserInfo hook)
 * @returns Validated UserInfo or null if invalid
 */
export function validateUserInfoTuple(data: unknown): UserInfo | null {
  // Check if it's an array (tuple from contract)
  if (!Array.isArray(data) || data.length < 5) {
    return null
  }

  // Try to construct UserInfo from tuple
  try {
    const [id, userAddress, role, status, registrationDate] = data

    return validateUserInfo({
      id,
      userAddress,
      role,
      status,
      registrationDate,
    })
  } catch {
    return null
  }
}

/**
 * Validates TokenData structure
 * 
 * @param data - The data to validate (can be array/tuple or object)
 * @returns Validated TokenData or null if invalid
 */
export function validateTokenData(data: unknown): TokenData | null {
  // Handle array/tuple format (from contract)
  if (Array.isArray(data)) {
    if (data.length < 8) return null
    const [id, name, tokenType, totalSupply, creator, parentToken, createdAt, features] = data
    return validateTokenData({ id, name, tokenType, totalSupply, creator, parentToken, createdAt, features })
  }
  
  // Handle object format
  if (typeof data !== 'object' || data === null) {
    return null
  }

  try {
    const { id, name, tokenType, totalSupply, creator, parentToken, createdAt, features } = data as Record<string, unknown>

    // Validate id
    const validId = toBigInt(id)
    if (validId === null || validId < 0n) return null

    // Validate name
    if (typeof name !== 'string') return null

    // Validate tokenType (0 or 1)
    const validTokenType = toBigInt(tokenType)
    if (validTokenType === null || (validTokenType !== 0n && validTokenType !== 1n)) return null

    // Validate totalSupply
    const validTotalSupply = toBigInt(totalSupply)
    if (validTotalSupply === null || validTotalSupply < 0n) return null

    // Validate creator address
    if (!isValidAddress(creator)) return null

    // Validate parentToken
    const validParentToken = toBigInt(parentToken)
    if (validParentToken === null || validParentToken < 0n) return null

    // Validate createdAt
    const validCreatedAt = toBigInt(createdAt)
    if (validCreatedAt === null || validCreatedAt < 0n) return null

    // Validate features (should be string, can be empty)
    if (typeof features !== 'string') return null

    return {
      id: validId,
      name,
      tokenType: validTokenType,
      totalSupply: validTotalSupply,
      creator,
      parentToken: validParentToken,
      createdAt: validCreatedAt,
      features,
    } as TokenData
  } catch {
    return null
  }
}

/**
 * Validates TokenData from a tuple/array (as returned by contract)
 * 
 * @param data - Array/tuple from contract
 * @returns Validated TokenData or null if invalid
 */
export function validateTokenDataTuple(data: unknown[] | undefined): TokenData | null {
  if (!Array.isArray(data) || data.length < 8) return null
  
  const [id, name, tokenType, totalSupply, creator, parentToken, createdAt, features] = data
  
  return validateTokenData({
    id,
    name,
    tokenType,
    totalSupply,
    creator,
    parentToken,
    createdAt,
    features,
  })
}

/**
 * Validates if a value is a valid bigint array (for token IDs)
 * 
 * @param data - The data to validate
 * @returns Array of bigint or null if invalid
 */
export function validateBigIntArray(data: unknown): bigint[] | null {
  if (!Array.isArray(data)) {
    return null
  }

  const result: bigint[] = []

  for (const item of data) {
    const bigIntValue = toBigInt(item)
    if (bigIntValue === null) {
      return null // If any item is invalid, return null
    }
    result.push(bigIntValue)
  }

  return result
}

/**
 * Type guard to check if data is UserInfo
 * 
 * @param data - The data to check
 * @returns True if data is valid UserInfo
 */
export function isUserInfo(data: unknown): data is UserInfo {
  return validateUserInfo(data) !== null
}

/**
 * Type guard to check if data is TokenData
 * 
 * @param data - The data to check
 * @returns True if data is valid TokenData
 */
export function isTokenData(data: unknown): data is TokenData {
  return validateTokenData(data) !== null
}

