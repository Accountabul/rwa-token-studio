import { Role } from "./tokenization";
import { KeyStorageType } from "./custody";

// Token standards supported on XRPL
export type TokenStandard = "IOU" | "MPT" | "NFT";

// Wallet role classification - Extended for ultimate flexibility
export type WalletRole = 
  | "ISSUER" 
  | "TREASURY" 
  | "ESCROW" 
  | "OPS" 
  | "TEST"
  | "CUSTODY"
  | "SETTLEMENT"
  | "BRIDGE"
  | "ORACLE"
  | "COMPLIANCE"
  | "COLD_STORAGE"
  | "HOT_WALLET";

// Wallet status for provisioning workflow
export type WalletStatus = "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED";

// XRPL Network
export type XRPLNetwork = "mainnet" | "testnet" | "devnet";

// Token lifecycle status
export type TokenStatus = "DRAFT" | "ISSUED" | "FROZEN" | "RETIRED";

// PermissionDEX status for wallets
export type WalletPermissionStatus = "NOT_LINKED" | "PENDING" | "APPROVED" | "REJECTED";

// DID Method types
export type DIDMethod = "none" | "xrpl" | "web" | "key";

// Purpose codes for wallet classification
export type PurposeCode = 
  | "GENERAL"
  | "TOKEN_ISSUANCE"
  | "NFT_MINTING"
  | "ESCROW_MANAGEMENT"
  | "LIQUIDITY_PROVISION"
  | "CUSTODY_OPERATIONS"
  | "CROSS_BORDER"
  | "COMPLIANCE_HOLD"
  | "DEVELOPMENT"
  | "TESTING";

// Risk tier classification
export type RiskTier = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

// Review frequency for wallet audits
export type ReviewFrequency = "MONTHLY" | "QUARTERLY" | "ANNUALLY" | "NEVER";

// Verifiable credential types
export type VerifiableCredentialType = 
  | "KYC"
  | "ACCREDITATION"
  | "COMPLIANCE"
  | "INSTITUTION"
  | "AML_VERIFIED"
  | "QUALIFIED_INVESTOR"
  | "AUTHORIZED_PARTICIPANT";

// Wallet capabilities interface
export interface WalletCapabilities {
  canIssueTokens: boolean;
  canMintNfts: boolean;
  canClawback: boolean;
  canFreeze: boolean;
  canCreateEscrows: boolean;
  canManageAmm: boolean;
  canCreateChannels: boolean;
  canAuthorizeHolders: boolean;
  requiresDestinationTag: boolean;
}

// Wallet identity layer
export interface WalletIdentity {
  didDocument?: string;
  didMethod: DIDMethod;
  verifiableCredentials: VerifiableCredentialType[];
  vcIssuerCapable: boolean;
  kycBindingId?: string;
  identityVerified: boolean;
}

// Wallet metadata layer
export interface WalletMetadata {
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  expirationDate?: string;
  reviewFrequency: ReviewFrequency;
  riskTier: RiskTier;
  externalRefId?: string;
}

// Wallet classification layer
export interface WalletClassification {
  tags: string[];
  purposeCode: PurposeCode;
  businessUnit?: string;
  projectIds: string[];
  assetClass?: string;
  jurisdiction?: string;
}

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

// Issuing wallet - Enhanced with full flexibility
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
  
  // Custody Layer (NEW - Phase 0)
  keyStorageType: KeyStorageType;
  vaultKeyRef?: string;
  legacySeedArchivedAt?: string;
  
  // Provisioning metadata
  createdBy: string;
  createdByName?: string;
  createdAt: string;
  lastSyncedAt?: string;
  fundedAt?: string;
  balance?: number;
  
  // Identity Layer
  didDocument?: string;
  didMethod?: DIDMethod;
  verifiableCredentials?: VerifiableCredentialType[];
  vcIssuerCapable?: boolean;
  kycBindingId?: string;
  identityVerified?: boolean;
  
  // Capabilities Layer
  canIssueTokens?: boolean;
  canMintNfts?: boolean;
  canClawback?: boolean;
  canFreeze?: boolean;
  canCreateEscrows?: boolean;
  canManageAmm?: boolean;
  canCreateChannels?: boolean;
  canAuthorizeHolders?: boolean;
  requiresDestinationTag?: boolean;
  
  // Classification Layer
  tags?: string[];
  purposeCode?: PurposeCode;
  businessUnit?: string;
  projectIds?: string[];
  assetClass?: string;
  jurisdiction?: string;
  
  // Metadata Layer
  description?: string;
  contactEmail?: string;
  contactPhone?: string;
  expirationDate?: string;
  reviewFrequency?: ReviewFrequency;
  riskTier?: RiskTier;
  externalRefId?: string;
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

// Wallet role labels for UI - Extended
export const walletRoleLabel: Record<WalletRole, string> = {
  ISSUER: "Issuer",
  TREASURY: "Treasury",
  ESCROW: "Escrow",
  OPS: "Operations",
  TEST: "Test",
  CUSTODY: "Custody",
  SETTLEMENT: "Settlement",
  BRIDGE: "Bridge",
  ORACLE: "Oracle",
  COMPLIANCE: "Compliance",
  COLD_STORAGE: "Cold Storage",
  HOT_WALLET: "Hot Wallet",
};

// Wallet role descriptions
export const walletRoleDescription: Record<WalletRole, string> = {
  ISSUER: "Issues tokens and manages supply",
  TREASURY: "Holds reserves and manages liquidity",
  ESCROW: "Holds funds in escrow arrangements",
  OPS: "Day-to-day operational transactions",
  TEST: "Testing and development purposes",
  CUSTODY: "Secure custody of client assets",
  SETTLEMENT: "Handles settlement and clearing",
  BRIDGE: "Cross-chain bridge operations",
  ORACLE: "Price feeds and external data",
  COMPLIANCE: "Compliance and regulatory holds",
  COLD_STORAGE: "Long-term cold storage",
  HOT_WALLET: "Active trading and liquidity",
};

// Wallet status labels for UI
export const walletStatusLabel: Record<WalletStatus, string> = {
  PROVISIONING: "Provisioning",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  ARCHIVED: "Archived",
};

// Purpose code labels
export const purposeCodeLabel: Record<PurposeCode, string> = {
  GENERAL: "General Purpose",
  TOKEN_ISSUANCE: "Token Issuance",
  NFT_MINTING: "NFT Minting",
  ESCROW_MANAGEMENT: "Escrow Management",
  LIQUIDITY_PROVISION: "Liquidity Provision",
  CUSTODY_OPERATIONS: "Custody Operations",
  CROSS_BORDER: "Cross-Border Payments",
  COMPLIANCE_HOLD: "Compliance Hold",
  DEVELOPMENT: "Development",
  TESTING: "Testing",
};

// Risk tier labels
export const riskTierLabel: Record<RiskTier, string> = {
  LOW: "Low Risk",
  MEDIUM: "Medium Risk",
  HIGH: "High Risk",
  CRITICAL: "Critical",
};

// Review frequency labels
export const reviewFrequencyLabel: Record<ReviewFrequency, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  ANNUALLY: "Annually",
  NEVER: "Never",
};

// DID method labels
export const didMethodLabel: Record<DIDMethod, string> = {
  none: "None",
  xrpl: "XRPL DID",
  web: "Web DID",
  key: "Key DID",
};

// Verifiable credential labels
export const vcTypeLabel: Record<VerifiableCredentialType, string> = {
  KYC: "KYC Verified",
  ACCREDITATION: "Accredited Investor",
  COMPLIANCE: "Compliance Certified",
  INSTITUTION: "Institutional",
  AML_VERIFIED: "AML Verified",
  QUALIFIED_INVESTOR: "Qualified Investor",
  AUTHORIZED_PARTICIPANT: "Authorized Participant",
};

// Role-based default capabilities
export const roleDefaultCapabilities: Record<WalletRole, Partial<WalletCapabilities>> = {
  ISSUER: {
    canIssueTokens: true,
    canFreeze: true,
    canClawback: true,
    canAuthorizeHolders: true,
  },
  TREASURY: {
    canCreateEscrows: true,
    canManageAmm: true,
    canCreateChannels: true,
  },
  ESCROW: {
    canCreateEscrows: true,
  },
  OPS: {
    canCreateChannels: true,
  },
  TEST: {},
  CUSTODY: {
    canCreateEscrows: true,
    requiresDestinationTag: true,
  },
  SETTLEMENT: {
    canCreateChannels: true,
    canCreateEscrows: true,
  },
  BRIDGE: {
    canCreateEscrows: true,
    canCreateChannels: true,
  },
  ORACLE: {},
  COMPLIANCE: {
    canFreeze: true,
    canClawback: true,
  },
  COLD_STORAGE: {
    requiresDestinationTag: true,
  },
  HOT_WALLET: {
    canCreateChannels: true,
    canManageAmm: true,
  },
};

// Role permissions for token actions - Re-exported from centralized permissions
export { tokenPermissions } from "@/permissions";
