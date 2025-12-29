import { TaxProfile, TaxFormStatus, EntityLegalType } from "@/types/reportsAndLogs";

/**
 * Payee type classification
 */
export type PayeeType = "INDIVIDUAL" | "BUSINESS";

/**
 * Payee category for reporting
 */
export type PayeeCategory = "WORKER" | "VENDOR" | "USER";

/**
 * Tax form types
 */
export type TaxFormType = "W9" | "W8BEN" | "W8BENE" | "OTHER";

/**
 * Extended tax profile with new PRD fields (all new fields optional for backward compatibility)
 */
export interface ExtendedTaxProfile extends TaxProfile {
  payeeType?: PayeeType;
  payeeCategory?: PayeeCategory;
  countryCode?: string;
  restrictedAccess?: boolean;
}

/**
 * Tax form submission record
 */
export interface TaxFormSubmission {
  submissionId: string;
  payeeId: string;
  formType: TaxFormType;
  status: TaxFormStatus;
  receivedAt: string;
  verifiedAt?: string;
  fileUri?: string;
  validationFlags?: Record<string, unknown>;
}

/**
 * Payout summary for a payee by year
 */
export interface PayoutSummary {
  payeeId: string;
  payeeName: string;
  taxYear: number;
  totalPayments: number;
  byEarningCategory: Record<string, number>;
  byRail: Record<string, number>;
  byPayerOfRecord: Record<string, number>;
  formRequired: TaxFormType | null;
  formStatus: TaxFormStatus;
}

/**
 * Tax package preview result
 */
export interface TaxPackagePreview {
  taxYear: number;
  totalPayees: number;
  eligibleFor1099: number;
  missingForms: number;
  issues: TaxPackageIssue[];
  payeeSummaries: PayoutSummary[];
}

/**
 * Issue found during tax package preview
 */
export interface TaxPackageIssue {
  payeeId: string;
  payeeName: string;
  issueType: "MISSING_FORM" | "UNKNOWN_RESIDENCY" | "INVALID_TIN" | "THRESHOLD_MET";
  description: string;
  severity: "ERROR" | "WARNING";
}

/**
 * Filters for listing payees
 */
export interface PayeeFilters {
  search?: string;
  w9Status?: TaxFormStatus | "all";
  w8Status?: TaxFormStatus | "all";
  entityType?: EntityLegalType | "all";
  payeeCategory?: PayeeCategory | "all";
  isUsPerson?: boolean | null;
  minPaymentsYTD?: number;
  limit?: number;
  offset?: number;
}

/**
 * Result of listing payees
 */
export interface PayeeListResult {
  profiles: ExtendedTaxProfile[];
  total: number;
  hasMore: boolean;
}

/**
 * Payee statistics
 */
export interface PayeeStats {
  total: number;
  verified: number;
  missing: number;
  withholding: number;
  over600: number;
}

/**
 * Repository interface for tax operations
 * Implementations: MockTaxRepository, SupabaseTaxRepository
 */
export interface ITaxRepository {
  /**
   * List payees with optional filters
   */
  listPayees(filters: PayeeFilters): Promise<PayeeListResult>;

  /**
   * Get a single payee profile by ID
   */
  getPayeeProfile(payeeId: string): Promise<ExtendedTaxProfile | null>;

  /**
   * Update a payee profile (upsert)
   */
  upsertPayeeProfile(profile: Partial<ExtendedTaxProfile> & { userId: string }): Promise<ExtendedTaxProfile>;

  /**
   * Get payee statistics
   */
  getPayeeStats(): Promise<PayeeStats>;

  /**
   * Submit/update tax form status
   */
  submitTaxFormStatus(
    payeeId: string,
    formType: TaxFormType,
    status: TaxFormStatus,
    fileUri?: string
  ): Promise<TaxFormSubmission>;

  /**
   * Get tax form submissions for a payee
   */
  getTaxFormSubmissions(payeeId: string): Promise<TaxFormSubmission[]>;

  /**
   * Get payout summaries by tax year
   */
  getPayoutSummariesByYear(taxYear: number): Promise<PayoutSummary[]>;

  /**
   * Preview tax package for a year
   */
  previewTaxPackage(taxYear: number): Promise<TaxPackagePreview>;
}
