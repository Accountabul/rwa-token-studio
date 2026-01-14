import { Role } from "./tokenization";
import { WalletRole, XRPLNetwork } from "./token";
import { BatchableTxType } from "./batchTransaction";

/**
 * Key storage type for wallet custody
 * - LEGACY_DB: Seed stored encrypted in database (deprecated)
 * - VAULT: Key stored in HashiCorp Vault or similar
 * - HSM: Key stored in Hardware Security Module
 * - EXTERNAL: Key managed by external custody provider
 */
export type KeyStorageType = "LEGACY_DB" | "VAULT" | "HSM" | "EXTERNAL";

/**
 * Vault key reference for non-legacy wallets
 */
export interface VaultKeyReference {
  provider: "hashicorp" | "aws_kms" | "gcp_kms" | "hsm" | "mock";
  keyPath: string;
  keyVersion?: string;
  network: XRPLNetwork;
  createdAt: string;
}

/**
 * Request to sign a transaction via the signing service
 */
export interface SigningRequest {
  walletId: string;
  txType: BatchableTxType | string;
  unsignedTxBlob: string;
  unsignedTxHash: string;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: Role;
  amount?: number;
  currency?: string;
  destination?: string;
  destinationName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response from the signing service
 */
export interface SigningResponse {
  success: boolean;
  signedTxBlob?: string;
  txHash?: string;
  error?: string;
  errorCode?: SigningErrorCode;
  auditLogId: string;
  policyApplied?: string;
}

/**
 * Error codes from signing service
 */
export type SigningErrorCode =
  | "WALLET_NOT_FOUND"
  | "WALLET_SUSPENDED"
  | "WALLET_ARCHIVED"
  | "POLICY_VIOLATION"
  | "RATE_LIMIT_EXCEEDED"
  | "AMOUNT_LIMIT_EXCEEDED"
  | "TX_TYPE_NOT_ALLOWED"
  | "NETWORK_MISMATCH"
  | "MULTI_SIGN_REQUIRED"
  | "VAULT_ERROR"
  | "LEGACY_MAINNET_BLOCKED"
  | "INTERNAL_ERROR";

/**
 * Signing policy configuration
 */
export interface SigningPolicy {
  id: string;
  policyName: string;
  description?: string;
  walletRoles: WalletRole[];
  network: XRPLNetwork;
  allowedTxTypes: string[];
  maxAmountXrp?: number;
  maxDailyTxs?: number;
  requiresMultiSign: boolean;
  minSigners: number;
  rateLimitPerMinute: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Signing audit log entry
 */
export interface SigningAuditEntry {
  id: string;
  walletId: string;
  walletAddress: string;
  txType: string;
  txHash?: string;
  unsignedTxHash: string;
  keyStorageType: KeyStorageType;
  policyId?: string;
  policyName?: string;
  requestedBy: string;
  requestedByName?: string;
  requestedByRole?: string;
  amount?: number;
  currency?: string;
  destination?: string;
  destinationName?: string;
  status: SigningAuditStatus;
  rejectionReason?: string;
  errorMessage?: string;
  network: XRPLNetwork;
  signedAt: string;
  submittedAt?: string;
  confirmedAt?: string;
  metadata?: Record<string, unknown>;
}

export type SigningAuditStatus =
  | "PENDING"
  | "SIGNED"
  | "REJECTED"
  | "FAILED"
  | "SUBMITTED"
  | "CONFIRMED";

/**
 * Labels for key storage types
 */
export const keyStorageTypeLabel: Record<KeyStorageType, string> = {
  LEGACY_DB: "Legacy (Database)",
  VAULT: "Vault",
  HSM: "Hardware Security Module",
  EXTERNAL: "External Custody",
};

/**
 * Descriptions for key storage types
 */
export const keyStorageTypeDescription: Record<KeyStorageType, string> = {
  LEGACY_DB: "Private key stored encrypted in database. Migration required.",
  VAULT: "Private key secured in HashiCorp Vault or cloud KMS.",
  HSM: "Private key stored in dedicated hardware security module.",
  EXTERNAL: "Private key managed by external custody provider.",
};

/**
 * Security level indicators
 */
export const keyStorageSecurityLevel: Record<KeyStorageType, "low" | "medium" | "high" | "critical"> = {
  LEGACY_DB: "low",
  VAULT: "high",
  HSM: "critical",
  EXTERNAL: "high",
};

/**
 * Check if wallet requires migration
 */
export function requiresMigration(keyStorageType: KeyStorageType): boolean {
  return keyStorageType === "LEGACY_DB";
}

/**
 * Check if key storage type supports mainnet
 */
export function supportsMainnet(keyStorageType: KeyStorageType): boolean {
  return keyStorageType !== "LEGACY_DB";
}
