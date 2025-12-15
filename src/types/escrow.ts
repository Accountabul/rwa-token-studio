import { Role } from "./tokenization";

// Escrow status lifecycle
export type EscrowStatus = "ACTIVE" | "COMPLETED" | "CANCELLED" | "EXPIRED";

// Asset types that can be escrowed
export type EscrowAssetType = "XRP" | "IOU" | "MPT";

// Condition types for escrow release
export type EscrowConditionType = "TIME" | "CRYPTO" | "ORACLE" | "TIME_AND_CRYPTO";

// Escrow interface
export interface Escrow {
  id: string;
  escrowSequence?: number;
  
  // Asset details
  assetType: EscrowAssetType;
  tokenId?: string;
  tokenSymbol?: string;
  currencyCode?: string;
  amount: number;
  amountUsd?: number;
  
  // Parties
  senderAddress: string;
  senderName?: string;
  destinationAddress: string;
  destinationName?: string;
  
  // Conditions
  conditionType: EscrowConditionType;
  finishAfter?: string; // ISO date - earliest release time
  cancelAfter?: string; // ISO date - expiration time
  cryptoCondition?: string; // Crypto-condition hex
  oracleEndpoint?: string;
  
  // Status
  status: EscrowStatus;
  
  // Timestamps
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
  
  // XRPL transaction references
  createTxHash?: string;
  finishTxHash?: string;
  cancelTxHash?: string;
  
  // Links to other entities
  investorId?: string;
  projectId?: string;
  
  // Network
  network: "mainnet" | "testnet" | "devnet";
}

// Labels
export const escrowStatusLabel: Record<EscrowStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export const escrowAssetTypeLabel: Record<EscrowAssetType, string> = {
  XRP: "XRP",
  IOU: "Issued Currency (IOU)",
  MPT: "Multi-Purpose Token",
};

export const escrowConditionLabel: Record<EscrowConditionType, string> = {
  TIME: "Time-Lock",
  CRYPTO: "Crypto-Condition",
  ORACLE: "Oracle-Based",
  TIME_AND_CRYPTO: "Time + Crypto",
};

// Role permissions for escrow actions
export const escrowPermissions: Record<string, Role[]> = {
  viewEscrows: ["SUPER_ADMIN", "TOKENIZATION_MANAGER", "COMPLIANCE_OFFICER", "CUSTODY_OFFICER"],
  createEscrow: ["SUPER_ADMIN", "CUSTODY_OFFICER"],
  completeEscrow: ["SUPER_ADMIN", "CUSTODY_OFFICER"],
  cancelEscrow: ["SUPER_ADMIN", "CUSTODY_OFFICER", "COMPLIANCE_OFFICER"],
};
