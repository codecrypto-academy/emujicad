/**
 * Shared Types
 * 
 * Centralized type definitions for the application.
 * This prevents type duplication and ensures consistency.
 */

/**
 * UserInfo type - matches the structure returned by getUserInfo contract function
 * 
 * The contract returns a struct User with: (uint256 id, address userAddress, UserRole role, UserStatus status)
 * Which is decoded by wagmi into this structure.
 * 
 * NOTE: The contract struct User does NOT include registrationDate, only these 4 fields.
 */
export type UserInfo = {
  id: bigint
  userAddress: string
  role: bigint
  status: bigint
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

