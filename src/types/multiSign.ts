import { Role } from "./tokenization";

// Signer in a multi-sign configuration
export interface MultiSignSigner {
  id: string;
  address: string;
  name: string;
  weight: number;
  role?: string;
  addedAt: string;
}

// Multi-sign configuration for a wallet
export interface MultiSignConfig {
  quorum: number;
  totalWeight: number;
  signers: MultiSignSigner[];
  lastUpdatedAt: string;
}

// Transaction types that can require multi-sign
export type MultiSignTxType = 
  | "TOKEN_ISSUANCE"
  | "TOKEN_MINT"
  | "TOKEN_BURN"
  | "TOKEN_FREEZE"
  | "ESCROW_CREATE"
  | "ESCROW_FINISH"
  | "ESCROW_CANCEL"
  | "CLAWBACK"
  | "PAYMENT"
  | "SIGNER_LIST_UPDATE"
  | "OTHER";

// Signature on a pending transaction
export interface MultiSignSignature {
  signerId: string;
  signerAddress: string;
  signerName: string;
  weight: number;
  signedAt: string;
}

// Pending transaction awaiting signatures
export interface PendingMultiSignTx {
  id: string;
  txType: MultiSignTxType;
  description: string;
  
  // Signing requirements
  requiredWeight: number;
  currentWeight: number;
  signatures: MultiSignSignature[];
  
  // Transaction details
  amount?: number;
  amountCurrency?: string;
  destination?: string;
  destinationName?: string;
  
  // Metadata
  createdAt: string;
  expiresAt: string;
  createdBy: string;
  
  // Status
  status: "PENDING" | "READY" | "EXECUTED" | "EXPIRED" | "REJECTED";
  
  // XRPL reference
  walletId: string;
  txBlob?: string;
  executedTxHash?: string;
}

// Labels
export const multiSignTxTypeLabel: Record<MultiSignTxType, string> = {
  TOKEN_ISSUANCE: "Token Issuance",
  TOKEN_MINT: "Token Mint",
  TOKEN_BURN: "Token Burn",
  TOKEN_FREEZE: "Token Freeze",
  ESCROW_CREATE: "Create Escrow",
  ESCROW_FINISH: "Complete Escrow",
  ESCROW_CANCEL: "Cancel Escrow",
  CLAWBACK: "Clawback",
  PAYMENT: "Payment",
  SIGNER_LIST_UPDATE: "Update Signers",
  OTHER: "Other",
};

// Role permissions for multi-sign actions
export const multiSignPermissions: Record<string, Role[]> = {
  viewPendingTx: ["SUPER_ADMIN", "TOKENIZATION_MANAGER", "COMPLIANCE_OFFICER", "CUSTODY_OFFICER"],
  signTransaction: ["SUPER_ADMIN", "CUSTODY_OFFICER"],
  rejectTransaction: ["SUPER_ADMIN", "CUSTODY_OFFICER", "COMPLIANCE_OFFICER"],
  updateSignerList: ["SUPER_ADMIN"],
};
