/**
 * Shared Types
 * 
 * Centralized type definitions for the application.
 * This prevents type duplication and ensures consistency.
 */

/**
 * UserInfo type - matches the structure returned by getUserInfo contract function
 * 
 * The contract returns a tuple: (uint256 id, address userAddress, uint8 role, uint8 status, uint256 registrationDate)
 * Which is decoded by wagmi into this structure.
 */
export type UserInfo = {
  id: bigint
  userAddress: string
  role: bigint
  status: bigint
  registrationDate: bigint
}

/**
 * Token data structure returned by getToken contract function
 */
export type TokenData = {
  id: bigint
  name: string
  tokenType: bigint
  totalSupply: bigint
  creator: string
  parentToken: bigint
  createdAt: bigint
  features: string
}

/**
 * Transfer data structure (for future use)
 */
export type TransferData = {
  id: bigint
  from: string
  to: string
  tokenId: bigint
  amount: bigint
  status: bigint
  createdAt: bigint
}

