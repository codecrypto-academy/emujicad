import SupplyChainArtifact from './SupplyChain.json'

/**
 * Configuración del Smart Contract Supply Chain
 * 
 * IMPORTANTE:
 * - La dirección del contrato se actualiza automáticamente por deploy.sh
 * - El owner/admin se lee dinámicamente del contrato (no hardcoded)
 * - Usar hook useContractOwner() para obtener la dirección del admin
 */

// Dirección del contrato deployado en Anvil
// ⚠️ ACTUALIZADO AUTOMÁTICAMENTE por deploy.sh - NO MODIFICAR MANUALMENTE
export const SUPPLY_CHAIN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as `0x${string}`

// ABI del contrato (generado por Foundry)
export const SUPPLY_CHAIN_ABI = SupplyChainArtifact.abi

/**
 * Configuración de red Anvil (Blockchain local)
 * Chain ID: 31337 (estándar de Anvil)
 * RPC URL: http://127.0.0.1:8545
 */
export const ANVIL_CHAIN_ID = 31337
export const ANVIL_RPC_URL = 'http://127.0.0.1:8545'

// Tipos de datos del contrato (deben coincidir con el smart contract)
export enum UserRole {
  Producer = 0,   // Productor de materias primas
  Factory = 1,    // Fábrica que transforma materias primas
  Retailer = 2,   // Minorista que distribuye productos
  Consumer = 3,   // Consumidor final
}

export enum UserStatus {
  Pending = 0,    // Pendiente de aprobación
  Approved = 1,   // Aprobado por admin
  Rejected = 2,   // Rechazado por admin
  Canceled = 3,   // Cancelado
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
