import SupplyChainArtifact from './SupplyChain.json'

// Dirección del contrato deployado en Anvil (reemplazar con la dirección real después del deploy)
export const SUPPLY_CHAIN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`

// ABI del contrato
export const SUPPLY_CHAIN_ABI = SupplyChainArtifact.abi

// Tipos de datos del contrato
export enum UserRole {
  Producer = 0,
  Manufacturer = 1,
  Distributor = 2,
  Retailer = 3,
}

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Suspended = 3,
}

export enum TokenType {
  RowMaterial = 0,
  FinishedProduct = 1,
}

export enum TransferStatus {
  Pending = 0,
  Accepted = 1,
  Rejected = 2,
  Cancelled = 3,
}

export enum PauseRole {
  None = 0,
  Pauser = 1,
}
