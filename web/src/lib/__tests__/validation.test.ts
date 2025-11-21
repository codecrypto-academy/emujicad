import { describe, it, expect } from 'vitest'
import { 
  validateUserInfo, 
  validateUserInfoTuple,
  validateTokenData,
  validateTokenDataTuple,
  validateBigIntArray 
} from '@/lib/validation'

describe('validation', () => {
  describe('validateUserInfo', () => {
    it('validates correct user info', () => {
      const userInfo = {
        id: BigInt(1),
        userAddress: '0x1234567890123456789012345678901234567890',
        role: BigInt(0),
        status: BigInt(1),
        registrationDate: BigInt(1234567890),
      }
      
      const result = validateUserInfo(userInfo)
      expect(result).toEqual(userInfo)
    })

    it('returns null for invalid address', () => {
      const userInfo = {
        id: BigInt(1),
        userAddress: 'invalid-address',
        role: BigInt(0),
        status: BigInt(1),
        registrationDate: BigInt(1234567890),
      }
      
      const result = validateUserInfo(userInfo)
      expect(result).toBeNull()
    })

    it('returns null for invalid role', () => {
      const userInfo = {
        id: BigInt(1),
        userAddress: '0x1234567890123456789012345678901234567890',
        role: BigInt(999), // Invalid role
        status: BigInt(1),
        registrationDate: BigInt(1234567890),
      }
      
      const result = validateUserInfo(userInfo)
      expect(result).toBeNull()
    })
  })

  describe('validateUserInfoTuple', () => {
    it('validates correct tuple', () => {
      const tuple = [
        BigInt(1),
        '0x1234567890123456789012345678901234567890',
        BigInt(0),
        BigInt(1),
        BigInt(1234567890),
      ]
      
      const result = validateUserInfoTuple(tuple)
      expect(result).not.toBeNull()
      expect(result?.id).toBe(BigInt(1))
    })

    it('returns null for invalid tuple length', () => {
      const tuple = [BigInt(1), '0x1234']
      const result = validateUserInfoTuple(tuple)
      expect(result).toBeNull()
    })
  })

  describe('validateTokenData', () => {
    it('validates correct token data', () => {
      const tokenData = {
        id: BigInt(1),
        name: 'Test Token',
        tokenType: BigInt(0),
        totalSupply: BigInt(1000),
        creator: '0x1234567890123456789012345678901234567890',
        parentToken: BigInt(0),
        createdAt: BigInt(1234567890),
        features: 'Test features',
      }
      
      const result = validateTokenData(tokenData)
      expect(result).toEqual(tokenData)
    })

    it('returns null for invalid token type', () => {
      const tokenData = {
        id: BigInt(1),
        name: 'Test Token',
        tokenType: BigInt(999), // Invalid
        totalSupply: BigInt(1000),
        creator: '0x1234567890123456789012345678901234567890',
        parentToken: BigInt(0),
        createdAt: BigInt(1234567890),
        features: 'Test features',
      }
      
      const result = validateTokenData(tokenData)
      expect(result).toBeNull()
    })
  })

  describe('validateBigIntArray', () => {
    it('validates correct bigint array', () => {
      const array = [BigInt(1), BigInt(2), BigInt(3)]
      const result = validateBigIntArray(array)
      expect(result).toEqual(array)
    })

    it('returns null for non-array', () => {
      const result = validateBigIntArray('not an array')
      expect(result).toBeNull()
    })

    it('returns null for array with invalid values', () => {
      const array = [BigInt(1), 'invalid', BigInt(3)]
      const result = validateBigIntArray(array)
      expect(result).toBeNull()
    })
  })
})

