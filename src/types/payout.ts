/**
 * Payout Workflow Types
 * Supports the full manual payout request lifecycle with approval workflow
 */

import { Role } from "@/types/tokenization";
import { EarningCategory } from "@/types/reportsAndLogs";

// ============= Payee Types =============

export type PayeeType = "VENDOR" | "CONTRACTOR" | "EMPLOYEE" | "ENTITY";
export type PayeeStatus = "ACTIVE" | "INACTIVE";
export type PayeeVerificationStatus = "VERIFIED" | "UNVERIFIED" | "PENDING";

export interface Payee {
  id: string;
  name: string;
  dba?: string; // "Doing Business As" name
  type: PayeeType;
  status: PayeeStatus;
  verificationStatus: PayeeVerificationStatus;
  email?: string;
  vendorId?: string;
  entityAlias?: string;
  defaultCurrency?: string;
  defaultWalletAddress?: string;
  mailingAddress?: PayeeMailingAddress;
  linkedBusinessId?: string;
  linkedInvestorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayeeMailingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PayeeFilters {
  query?: string;
  type?: PayeeType | "all";
  status?: PayeeStatus | "all";
  verificationStatus?: PayeeVerificationStatus | "all";
  limit?: number;
  offset?: number;
}

export interface PayeeListResult {
  payees: Payee[];
  total: number;
  hasMore: boolean;
}

// ============= Payout Request Types =============

export type PayoutRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "PAID"
  | "VOIDED"
  | "CANCELLED";

export type PaymentMethod = "RECORD_ONLY" | "SEND_CHECK" | "CRYPTO_PAYOUT";

export type PayoutCurrency =
  | "USD"
  | "EUR"
  | "GBP"
  // Stablecoins
  | "RLUSD"
  | "USDC"
  | "USDT"
  | "XRP";

export const FIAT_CURRENCIES: PayoutCurrency[] = ["USD", "EUR", "GBP"];
export const STABLECOIN_CURRENCIES: PayoutCurrency[] = ["RLUSD", "USDC", "USDT", "XRP"];
export const ALL_PAYOUT_CURRENCIES: PayoutCurrency[] = [...FIAT_CURRENCIES, ...STABLECOIN_CURRENCIES];

export function getCurrencySymbol(currency: PayoutCurrency): string {
  switch (currency) {
    case "USD":
    case "RLUSD":
    case "USDC":
    case "USDT":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "XRP":
      return "XRP ";
    default:
      return "";
  }
}

export function getCurrencyPrecision(currency: PayoutCurrency): number {
  switch (currency) {
    case "XRP":
      return 6;
    case "RLUSD":
    case "USDC":
    case "USDT":
      return 6; // Stablecoins often support higher precision
    default:
      return 2; // Fiat currencies
  }
}

export function isStablecoin(currency: PayoutCurrency): boolean {
  return STABLECOIN_CURRENCIES.includes(currency);
}

export interface PayoutRequest {
  id: string;
  // Requester info
  requesterId: string;
  requesterName: string;
  requesterRole: Role;
  // Payee info (snapshot at time of request)
  payeeId: string;
  payeeNameSnapshot: string;
  payeeTypeSnapshot: PayeeType;
  payeeVerificationStatus: PayeeVerificationStatus;
  // Payment details
  amount: number;
  currency: PayoutCurrency;
  paymentMethod: PaymentMethod;
  // Crypto-specific fields
  destinationWalletAddress?: string;
  // Check-specific fields
  checkDetails?: CheckRequestDetails;
  // Accounting
  earningCategory: EarningCategory;
  costCenter?: string;
  projectId?: string;
  referenceId?: string; // Invoice/PO number
  // Description
  memo: string;
  neededByDate?: string;
  paymentDate?: string; // Defaults to today
  // Workflow status
  status: PayoutRequestStatus;
  submittedAt?: string;
  reAuthVerifiedAt?: string;
  // Approval
  approverId?: string;
  approverName?: string;
  approverRole?: Role;
  approvedAt?: string;
  rejectionReason?: string;
  // Execution
  executedAt?: string;
  executedBy?: string;
  executedByName?: string;
  executionReference?: string;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// ============= Check Request Types =============

export type CheckDeliveryMethod = "STANDARD" | "EXPEDITED";

export interface CheckRequestDetails {
  mailingName: string;
  mailingAddress: PayeeMailingAddress;
  deliveryMethod: CheckDeliveryMethod;
  checkMemo?: string;
  neededByDate?: string;
}

// ============= Evidence Types =============

export type EvidenceType = "UPLOAD" | "LINK";

export interface EvidenceDocument {
  id: string;
  payoutRequestId: string;
  type: EvidenceType;
  // For links
  url?: string;
  // For uploads
  storageKey?: string;
  filename?: string;
  fileHash?: string;
  mimeType?: string;
  fileSize?: number;
  // Metadata
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}

// ============= Approval Event Types =============

export type PayoutApprovalAction =
  | "CREATE"
  | "SUBMIT"
  | "REAUTH"
  | "APPROVE"
  | "REJECT"
  | "MARK_PAID"
  | "VOID"
  | "CANCEL";

export interface PayoutApprovalEvent {
  id: string;
  payoutRequestId: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: PayoutApprovalAction;
  reason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ============= Request Creation Params =============

export interface CreatePayoutRequestParams {
  requesterId: string;
  requesterName: string;
  requesterRole: Role;
  payeeId: string;
  payeeNameSnapshot: string;
  payeeTypeSnapshot: PayeeType;
  payeeVerificationStatus: PayeeVerificationStatus;
  amount: number;
  currency: PayoutCurrency;
  paymentMethod: PaymentMethod;
  destinationWalletAddress?: string;
  checkDetails?: CheckRequestDetails;
  earningCategory: EarningCategory;
  costCenter?: string;
  projectId?: string;
  referenceId?: string;
  memo: string;
  neededByDate?: string;
  paymentDate?: string;
}

export interface CreateEvidenceParams {
  type: EvidenceType;
  url?: string;
  storageKey?: string;
  filename?: string;
  fileHash?: string;
  mimeType?: string;
  fileSize?: number;
  uploadedBy: string;
  uploadedByName: string;
}

export interface CreateApprovalEventParams {
  payoutRequestId: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: PayoutApprovalAction;
  reason?: string;
  metadata?: Record<string, unknown>;
}

// ============= Query/Filter Types =============

export interface PayoutRequestFilters {
  status?: PayoutRequestStatus | "all";
  paymentMethod?: PaymentMethod | "all";
  currency?: PayoutCurrency | "all";
  requesterId?: string;
  payeeId?: string;
  approverId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  limit?: number;
  offset?: number;
}

export interface PayoutRequestListResult {
  requests: PayoutRequest[];
  total: number;
  hasMore: boolean;
}

// ============= Re-auth Configuration =============

export interface ReAuthConfig {
  // Thresholds that trigger re-auth
  amountThreshold: number; // e.g., 10000
  requireForUnverifiedPayee: boolean;
  requireForStablecoin: boolean;
  requireForNewPayee: boolean;
  // Auth methods
  requirePassword: boolean;
  require2FA: boolean;
}

export const DEFAULT_REAUTH_CONFIG: ReAuthConfig = {
  amountThreshold: 10000,
  requireForUnverifiedPayee: true,
  requireForStablecoin: true,
  requireForNewPayee: true,
  requirePassword: true,
  require2FA: false,
};

// ============= RBAC for Payouts =============

export interface PayoutPermissions {
  canCreateRequest: boolean;
  canApproveRequest: boolean;
  canRejectRequest: boolean;
  canMarkPaid: boolean;
  canVoidRequest: boolean;
  canViewApprovalQueue: boolean;
  canCreatePayee: boolean;
  maxApprovalAmount?: number; // Undefined = unlimited
}

export const PAYOUT_ROLE_PERMISSIONS: Record<Role, PayoutPermissions> = {
  // Administration
  SUPER_ADMIN: {
    canCreateRequest: true,
    canApproveRequest: true,
    canRejectRequest: true,
    canMarkPaid: true,
    canVoidRequest: true,
    canViewApprovalQueue: true,
    canCreatePayee: true,
  },
  SYSTEM_ADMIN: {
    canCreateRequest: true,
    canApproveRequest: true,
    canRejectRequest: true,
    canMarkPaid: true,
    canVoidRequest: true,
    canViewApprovalQueue: true,
    canCreatePayee: true,
  },
  HIRING_MANAGER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  OPERATIONS_ADMIN: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  // Tokenization
  TOKENIZATION_MANAGER: {
    canCreateRequest: true,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  VALUATION_OFFICER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  PROPERTY_OPERATIONS_MANAGER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  INVESTOR_OPERATIONS: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  // Compliance
  COMPLIANCE_OFFICER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: true, // Read-only
    canCreatePayee: false,
  },
  RISK_ANALYST: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: true, // Read-only
    canCreatePayee: false,
  },
  AUDITOR: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: true, // Read-only
    canCreatePayee: false,
  },
  // Finance
  FINANCE_OFFICER: {
    canCreateRequest: true,
    canApproveRequest: true,
    canRejectRequest: true,
    canMarkPaid: true,
    canVoidRequest: true,
    canViewApprovalQueue: true,
    canCreatePayee: true,
  },
  ACCOUNTING_MANAGER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: true, // Read-only
    canCreatePayee: false,
  },
  CUSTODY_OFFICER: {
    canCreateRequest: true,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  // Engineering - no payout access
  BACKEND_ENGINEER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  PLATFORM_ENGINEER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  SECURITY_ENGINEER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  QA_TEST_ENGINEER: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
  // Field Operations - no payout access
  TECHNICIAN: {
    canCreateRequest: false,
    canApproveRequest: false,
    canRejectRequest: false,
    canMarkPaid: false,
    canVoidRequest: false,
    canViewApprovalQueue: false,
    canCreatePayee: false,
  },
};
