import { Role } from "./tokenization";

// ============================================
// AUDIT LOG TYPES
// ============================================

export type AuditEntityType =
  | "PROJECT"
  | "TOKEN"
  | "WALLET"
  | "ESCROW"
  | "INVESTOR"
  | "REPORT"
  | "TAX_PROFILE"
  | "CHECK"
  | "PAYMENT_CHANNEL"
  | "CONTRACT"
  | "BATCH"
  | "BUSINESS"
  | "WORK_ORDER"
  | "CONTRACT_CALL"
  | "MULTI_SIGN_TX"
  | "HOLDER_AUTH";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW"
  | "EXPORT"
  | "LIFECYCLE_TRANSITION"
  | "MINT"
  | "BURN"
  | "FREEZE"
  | "UNFREEZE"
  | "CLAWBACK"
  | "DISTRIBUTE"
  | "TRANSFER"
  | "SIGN"
  | "APPROVE"
  | "REJECT"
  | "LOCK"
  | "UNLOCK"
  | "AUTHORIZE"
  | "REVOKE"
  | "CALL"
  | "SUBMIT"
  | "EXECUTE"
  | "ASSIGN"
  | "COMPLETE"
  | "PAY"
  | "CANCEL"
  | "CONNECT"
  | "DISCONNECT";

export type AuditSource = "UI" | "API" | "WEBHOOK" | "BATCH_JOB" | "LLM_AGENT";
export type AuditSeverity = "INFO" | "WARN" | "HIGH";
export type AuditClassification = "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

export interface UnifiedAuditEntry {
  id: string;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  action: AuditAction;
  actorUserId: string;
  actorName: string;
  actorRole: Role;
  sourceIp?: string;
  userAgent?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  xrplTxHash?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  
  // Extended fields for multi-tenant tracking
  source?: AuditSource;
  severity?: AuditSeverity;
  classification?: AuditClassification;
  walletAddress?: string;
  linkedBusinessId?: string;
  linkedWorkOrderId?: string;
  linkedWalletId?: string;
  linkedInvestorId?: string;
  linkedContractId?: string;
  requestId?: string;
  traceId?: string;
}

// ============================================
// TRANSACTION LEDGER TYPES
// ============================================

export type LedgerEntryType =
  | "PAYMENT"
  | "PAYOUT"
  | "FEE"
  | "REFUND"
  | "REVERSAL"
  | "ESCROW_LOCK"
  | "ESCROW_RELEASE"
  | "TOKEN_DISTRIBUTION"
  | "TOKEN_BUYBACK"
  | "MINT"
  | "BURN"
  | "TRANSFER"
  | "CLAWBACK"
  | "WORK_ORDER_PAYMENT"
  | "PLATFORM_FEE"
  | "BUSINESS_PAYOUT";

export type LedgerRail = "XRPL" | "STRIPE" | "PAYPAL" | "ACH" | "WIRE" | "INTERNAL" | "ACCOUNTABUL_MANUAL";

export type LedgerStatus = "PENDING" | "SETTLED" | "FAILED" | "REVERSED" | "INITIATED" | "REFUNDED" | "DISPUTED";

export type PayerOfRecord = "STRIPE_PLATFORM" | "ACCOUNTABUL" | "BUSINESS" | "VENDOR" | "PLATFORM";

export type EarningCategory = 
  | "CONTRACTOR_COMP" 
  | "VENDOR_PAYOUT" 
  | "TIP" 
  | "BOUNTY" 
  | "REFERRAL_REWARD" 
  | "MEMBERSHIP" 
  | "WORK_ORDER"
  | "OTHER";

export type LedgerEntityType = "PLATFORM" | "USER" | "BUSINESS" | "ESCROW" | "WALLET";

export type TaxCategory =
  | "NONEMPLOYEE_COMP"
  | "PRIZES_AWARDS_OTHER_INCOME"
  | "RENT"
  | "PROCESSOR_REPORTED"
  | "NOT_TAXABLE"
  | "CAPITAL_GAIN"
  | "DIVIDEND";

export interface TransactionLedgerEntry {
  id: string;
  entryType: LedgerEntryType;
  amount: number;
  currency: string;
  rail: LedgerRail;
  status: LedgerStatus;
  payerEntityType: LedgerEntityType;
  payerEntityId: string;
  payerName: string;
  payeeEntityType: LedgerEntityType;
  payeeEntityId: string;
  payeeName: string;
  projectId?: string;
  projectName?: string;
  tokenId?: string;
  escrowId?: string;
  invoiceId?: string;
  xrplTxHash?: string;
  processorRef?: string;
  memo?: string;
  taxCategory?: TaxCategory;
  effectiveAt: string;
  createdAt: string;
  
  // Extended fields for multi-tenant tracking
  direction?: "IN" | "OUT";
  grossAmount?: number;
  feesAmount?: number;
  netAmount?: number;
  payerOfRecord?: PayerOfRecord;
  earningCategory?: EarningCategory;
  evidenceUri?: string;
  auditEventId?: string;
  linkedBusinessId?: string;
  linkedWorkOrderId?: string;
  linkedWalletId?: string;
  linkedInvestorId?: string;
  linkedContractId?: string;
  signerAddresses?: string[];
}

// ============================================
// TAX PROFILE TYPES
// ============================================

export type EntityLegalType =
  | "INDIVIDUAL"
  | "LLC"
  | "C_CORP"
  | "S_CORP"
  | "PARTNERSHIP"
  | "FOREIGN_ENTITY"
  | "TRUST";

export type TaxFormStatus = "MISSING" | "COLLECTED" | "VERIFIED" | "REJECTED" | "EXPIRED";

export type PayeeType = "INDIVIDUAL" | "BUSINESS";
export type PayeeCategory = "WORKER" | "VENDOR" | "BUSINESS_OWNER" | "USER";

export interface TaxProfile {
  userId: string;
  userName: string;
  legalName: string;
  entityType: EntityLegalType;
  isUsPerson: boolean;
  addressJson: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country: string;
  };
  tinLast4?: string;
  w9Status: TaxFormStatus;
  w8Status: TaxFormStatus;
  backupWithholdingRequired: boolean;
  backupWithholdingReason?: string;
  totalPaymentsYTD: number;
  createdAt: string;
  updatedAt: string;
  
  // Extended fields for multi-tenant tracking
  payeeType?: PayeeType;
  payeeCategory?: PayeeCategory;
  countryCode?: string;
  primaryWalletAddress?: string;
  linkedBusinessId?: string;
  restrictedAccess?: boolean;
}

// ============================================
// REPORT TYPES
// ============================================

export type ReportType =
  | "TOKENIZATION_PIPELINE"
  | "COMPLIANCE_ACTIVITY"
  | "MINTING_ACTIVITY"
  | "ESCROW_STATUS"
  | "WALLET_ADMIN"
  | "FINANCIAL_SUMMARY"
  | "EXCEPTIONS"
  | "1099_NEC"
  | "1099_MISC"
  | "1099_K_RECONCILIATION"
  | "MISSING_FORMS"
  | "PAYOUT_SUMMARY";

export type ReportOutputFormat = "CSV" | "JSON" | "PDF";

export interface ReportDefinition {
  type: ReportType;
  name: string;
  description: string;
  category: "INTERNAL" | "EXTERNAL" | "TAX";
  requiredRoles: Role[];
}

export interface ReportRun {
  id: string;
  reportType: ReportType;
  reportName: string;
  params: Record<string, unknown>;
  generatedBy: string;
  generatedByName: string;
  generatedAt: string;
  outputFormat: ReportOutputFormat;
  fileUri?: string;
  rowCount: number;
  checksum?: string;
  status: "RUNNING" | "COMPLETED" | "FAILED";
}

// ============================================
// DASHBOARD METRICS
// ============================================

export interface ReportsDashboardMetrics {
  openIssues: {
    failedTransactions: number;
    pendingApprovals: number;
    missingTaxForms: number;
  };
  activity: {
    last24h: number;
    last7d: number;
  };
  pipeline: {
    intakePending: number;
    intakeComplete: number;
    metadataDraft: number;
    metadataApproved: number;
    complianceApproved: number;
    custodyReady: number;
    minted: number;
  };
  finance: {
    payoutsMonthToDate: number;
    reversals: number;
    escrowBalances: number;
  };
  compliance: {
    lockEvents: number;
    freezeEvents: number;
    clawbackEvents: number;
  };
}

// ============================================
// ROLE PERMISSIONS
// ============================================

export interface RolePermissions {
  viewAuditLogs: boolean;
  viewLedger: boolean;
  viewTaxProfiles: boolean;
  viewTaxIds: boolean;
  runReports: boolean;
  exportReports: boolean;
  exportTaxData: boolean;
}

export const rolePermissionsMatrix: Record<Role, RolePermissions> = {
  SUPER_ADMIN: {
    viewAuditLogs: true,
    viewLedger: true,
    viewTaxProfiles: true,
    viewTaxIds: true,
    runReports: true,
    exportReports: true,
    exportTaxData: true,
  },
  FINANCE_OFFICER: {
    viewAuditLogs: true,
    viewLedger: true,
    viewTaxProfiles: true,
    viewTaxIds: true,
    runReports: true,
    exportReports: true,
    exportTaxData: true,
  },
  COMPLIANCE_OFFICER: {
    viewAuditLogs: true,
    viewLedger: false,
    viewTaxProfiles: false,
    viewTaxIds: false,
    runReports: true,
    exportReports: true,
    exportTaxData: false,
  },
  AUDITOR: {
    viewAuditLogs: true,
    viewLedger: true,
    viewTaxProfiles: false,
    viewTaxIds: false,
    runReports: false,
    exportReports: true,
    exportTaxData: false,
  },
  TOKENIZATION_MANAGER: {
    viewAuditLogs: true,
    viewLedger: false,
    viewTaxProfiles: false,
    viewTaxIds: false,
    runReports: true,
    exportReports: true,
    exportTaxData: false,
  },
  CUSTODY_OFFICER: {
    viewAuditLogs: true,
    viewLedger: false,
    viewTaxProfiles: false,
    viewTaxIds: false,
    runReports: false,
    exportReports: false,
    exportTaxData: false,
  },
  VALUATION_OFFICER: {
    viewAuditLogs: false,
    viewLedger: false,
    viewTaxProfiles: false,
    viewTaxIds: false,
    runReports: false,
    exportReports: false,
    exportTaxData: false,
  },
};

// ============================================
// REPORT DEFINITIONS
// ============================================

export const reportDefinitions: ReportDefinition[] = [
  {
    type: "TOKENIZATION_PIPELINE",
    name: "Tokenization Pipeline",
    description: "Projects by lifecycle stage with counts and status",
    category: "INTERNAL",
    requiredRoles: ["SUPER_ADMIN", "TOKENIZATION_MANAGER", "COMPLIANCE_OFFICER"],
  },
  {
    type: "COMPLIANCE_ACTIVITY",
    name: "Compliance Activity",
    description: "Locks, freezes, clawbacks with timestamps and actors",
    category: "INTERNAL",
    requiredRoles: ["SUPER_ADMIN", "COMPLIANCE_OFFICER"],
  },
  {
    type: "MINTING_ACTIVITY",
    name: "Minting Activity",
    description: "Mint attempts, successes, failures by period",
    category: "INTERNAL",
    requiredRoles: ["SUPER_ADMIN", "TOKENIZATION_MANAGER"],
  },
  {
    type: "ESCROW_STATUS",
    name: "Escrow Status",
    description: "Open escrows, expirations, completions, cancellations",
    category: "INTERNAL",
    requiredRoles: ["SUPER_ADMIN", "FINANCE_OFFICER", "CUSTODY_OFFICER"],
  },
  {
    type: "WALLET_ADMIN",
    name: "Wallet Administration",
    description: "Signer changes, permission changes, wallet events",
    category: "INTERNAL",
    requiredRoles: ["SUPER_ADMIN", "CUSTODY_OFFICER"],
  },
  {
    type: "FINANCIAL_SUMMARY",
    name: "Financial Summary",
    description: "Payouts, refunds, fees by period",
    category: "INTERNAL",
    requiredRoles: ["SUPER_ADMIN", "FINANCE_OFFICER"],
  },
  {
    type: "EXCEPTIONS",
    name: "Exceptions Report",
    description: "Failed transactions, validation errors, anomalies",
    category: "INTERNAL",
    requiredRoles: ["SUPER_ADMIN", "FINANCE_OFFICER", "COMPLIANCE_OFFICER"],
  },
  {
    type: "PAYOUT_SUMMARY",
    name: "Payout Summary",
    description: "All payouts with processor references and status",
    category: "INTERNAL",
    requiredRoles: ["SUPER_ADMIN", "FINANCE_OFFICER"],
  },
  {
    type: "1099_NEC",
    name: "1099-NEC Dataset",
    description: "Non-employee compensation for $600+ payees",
    category: "TAX",
    requiredRoles: ["SUPER_ADMIN", "FINANCE_OFFICER"],
  },
  {
    type: "1099_MISC",
    name: "1099-MISC Dataset",
    description: "Prizes, awards, rent, and other income",
    category: "TAX",
    requiredRoles: ["SUPER_ADMIN", "FINANCE_OFFICER"],
  },
  {
    type: "1099_K_RECONCILIATION",
    name: "1099-K Reconciliation",
    description: "Processor-reported vs platform records",
    category: "TAX",
    requiredRoles: ["SUPER_ADMIN", "FINANCE_OFFICER"],
  },
  {
    type: "MISSING_FORMS",
    name: "Missing Tax Forms",
    description: "Payees requiring W-9/W-8 collection",
    category: "TAX",
    requiredRoles: ["SUPER_ADMIN", "FINANCE_OFFICER"],
  },
];
