import { 
  TransactionLedgerEntry, 
  LedgerRail, 
  LedgerStatus, 
  LedgerEntryType, 
  TaxCategory,
  PayerOfRecord,
  EarningCategory,
} from "@/types/reportsAndLogs";

/**
 * Extended rail types including manual payouts
 */
export type ExtendedLedgerRail = LedgerRail;

/**
 * Extended status types per PRD
 */
export type ExtendedLedgerStatus = LedgerStatus;

/**
 * Extended ledger entry with new PRD fields (all new fields optional for backward compatibility)
 * Now extends TransactionLedgerEntry which already includes the extended fields
 */
export interface ExtendedLedgerEntry extends TransactionLedgerEntry {
  // Additional fields beyond TransactionLedgerEntry (if any)
}

/**
 * Parameters for recording a new ledger event
 */
export interface RecordLedgerEventParams {
  entryType: LedgerEntryType;
  amount: number;
  currency: string;
  rail: ExtendedLedgerRail;
  status: ExtendedLedgerStatus;
  payerEntityType: string;
  payerEntityId: string;
  payerName: string;
  payeeEntityType: string;
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
  effectiveAt?: string;
  // Extended fields
  grossAmount?: number;
  feesAmount?: number;
  netAmount?: number;
  payerOfRecord?: PayerOfRecord;
  earningCategory?: EarningCategory;
  evidenceUri?: string;
  auditEventId?: string;
  direction?: "IN" | "OUT";
  // Multi-tenant linking
  linkedBusinessId?: string;
  linkedWorkOrderId?: string;
  linkedWalletId?: string;
  linkedInvestorId?: string;
  linkedContractId?: string;
  signerAddresses?: string[];
}

/**
 * Filters for listing ledger events
 */
export interface LedgerEventFilters {
  search?: string;
  rail?: ExtendedLedgerRail | "all";
  status?: ExtendedLedgerStatus | "all";
  entryType?: LedgerEntryType | "all";
  payerOfRecord?: PayerOfRecord | "all";
  earningCategory?: EarningCategory | "all";
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Result of listing ledger events
 */
export interface LedgerEventListResult {
  entries: ExtendedLedgerEntry[];
  total: number;
  hasMore: boolean;
}

/**
 * Ledger totals for summary display
 */
export interface LedgerTotals {
  settled: number;
  pending: number;
  failed: number;
  disputed: number;
}

/**
 * Repository interface for ledger operations
 * Implementations: MockLedgerRepository, SupabaseLedgerRepository
 */
export interface ILedgerRepository {
  /**
   * Record a new ledger event (append-only)
   */
  recordEvent(params: RecordLedgerEventParams): Promise<ExtendedLedgerEntry>;

  /**
   * List ledger events with optional filters
   */
  listEvents(filters: LedgerEventFilters): Promise<LedgerEventListResult>;

  /**
   * Get a single ledger event by ID
   */
  getEvent(ledgerEventId: string): Promise<ExtendedLedgerEntry | null>;

  /**
   * Get ledger totals for summary cards
   */
  getTotals(filters?: LedgerEventFilters): Promise<LedgerTotals>;

  /**
   * Get ledger events linked to a specific audit event
   */
  getEventsByAuditId(auditEventId: string): Promise<ExtendedLedgerEntry[]>;
}
