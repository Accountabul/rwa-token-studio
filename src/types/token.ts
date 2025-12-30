import { Role } from "./tokenization";

// Token standards supported on XRPL
export type TokenStandard = "IOU" | "MPT" | "NFT";

// Wallet role classification
export type WalletRole = "ISSUER" | "TREASURY" | "ESCROW" | "OPS" | "TEST";

// Wallet status for provisioning workflow
export type WalletStatus = "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

// XRPL Network
export type XRPLNetwork = "mainnet" | "testnet" | "devnet";

// Token lifecycle status
export type TokenStatus = "DRAFT" | "ISSUED" | "FROZEN" | "RETIRED";

// PermissionDEX status for wallets
export type WalletPermissionStatus = "NOT_LINKED" | "PENDING" | "APPROVED" | "REJECTED";

// Standard-specific property interfaces
export interface IOUProperties {
  currencyCode: string;
  trustlineAuthRequired: boolean;
  freezeEnabled: boolean;
  ripplingAllowed: boolean;
}

export interface MPTProperties {
  maxSupply: number;
  transferFee?: number;
  clawbackEnabled: boolean;
  escrowEnabled: boolean;
  xls89Metadata: string;
}

export interface NFTProperties {
  taxon: number;
  transferFee?: number;
  burnable: boolean;
  onlyXRP: boolean;
  metadataUri: string;
}

// Compliance configuration
export interface TokenCompliance {
  jurisdictions: string[];
  kycRequired: boolean;
  accreditationRequired: boolean;
  permissionDexEnforced: boolean;
  lockupPeriod?: string;
  transferRestrictions?: string;
}

// Core Token interface
export interface Token {
  id: string;
  standard: TokenStandard;
  name: string;
  symbol: string;
  description: string;
  decimals?: number;
  
  // Issuing wallet
  issuerWalletId: string;
  issuerWalletAddress: string;
  
  // Supply tracking
  maxSupply?: number;
  totalIssued: number;
  circulatingSupply: number;
  inEscrow: number;
  heldByIssuer: number;
  
  // Standard-specific properties
  properties: IOUProperties | MPTProperties | NFTProperties;
  
  // Compliance settings
  compliance: TokenCompliance;
  
  // Status & metadata
  status: TokenStatus;
  createdAt: string;
  issuedAt?: string;
  xrplTxHash?: string;
  
  // Link to source project (optional)
  sourceProjectId?: string;
  
  // Asset classification
  assetClass?: string;
  assetSubclass?: string;
}

// Issuing wallet
export interface IssuingWallet {
  id: string;
  name: string;
  
  // XRPL identity
  xrplAddress: string;
  publicKey?: string;
  
  // Classification
  role: WalletRole;
  network: XRPLNetwork;
  status: WalletStatus;
  
  // Multi-sig configuration
  multiSignEnabled: boolean;
  multiSignQuorum?: number;
  multiSignSigners?: number;
  multiSignConfigId?: string;
  
  // PermissionDEX integration
  permissionDexStatus: WalletPermissionStatus;
  isAuthorized: boolean;
  
  // Custody tracking
  encryptedSeedRef?: string;
  vaultKeyId?: string;
  
  // Provisioning metadata
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  lastSyncedAt?: string;
  fundedAt?: string;
  balance?: number;
}

// Labels
export const tokenStandardLabel: Record<TokenStandard, string> = {
  IOU: "Issued Currency (IOU)",
  MPT: "Multi-Purpose Token (MPT)",
  NFT: "Non-Fungible Token (NFT)",
};

export const tokenStatusLabel: Record<TokenStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  FROZEN: "Frozen",
  RETIRED: "Retired",
};

export const walletPermissionLabel: Record<WalletPermissionStatus, string> = {
  NOT_LINKED: "Not Linked",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Wallet role labels for UI
export const walletRoleLabel: Record<WalletRole, string> = {
  ISSUER: "Issuer",
  TREASURY: "Treasury",
  ESCROW: "Escrow",
  OPS: "Operations",
  TEST: "Test",
};

// Wallet status labels for UI
export const walletStatusLabel: Record<WalletStatus, string> = {
  PROVISIONING: "Provisioning",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

// Role permissions for token actions
export const tokenPermissions: Record<string, Role[]> = {
  viewTokens: ["SUPER_ADMIN", "TOKENIZATION_MANAGER", "COMPLIANCE_OFFICER", "CUSTODY_OFFICER", "VALUATION_OFFICER"],
  createDraft: ["SUPER_ADMIN", "TOKENIZATION_MANAGER"],
  issueToken: ["SUPER_ADMIN"],
  mintBurn: ["SUPER_ADMIN", "TOKENIZATION_MANAGER"],
  freezeUnfreeze: ["SUPER_ADMIN", "COMPLIANCE_OFFICER"],
  authorizeWallet: ["SUPER_ADMIN", "CUSTODY_OFFICER"],
  distribute: ["SUPER_ADMIN", "TOKENIZATION_MANAGER", "CUSTODY_OFFICER"],
  viewAuditLog: ["SUPER_ADMIN", "TOKENIZATION_MANAGER", "COMPLIANCE_OFFICER", "CUSTODY_OFFICER", "VALUATION_OFFICER"],
  exportAuditLog: ["SUPER_ADMIN", "COMPLIANCE_OFFICER"],
};
