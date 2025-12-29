/**
 * Generic payment rail adapter interface
 * Implementations: StripeAdapter, ManualPayoutAdapter, XRPLAdapter
 */

/**
 * Charge creation parameters
 */
export interface ChargeParams {
  amount: number;
  currency: string;
  payerId: string;
  payerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
}

/**
 * Charge result
 */
export interface ChargeResult {
  chargeId: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  amount: number;
  currency: string;
  processorRef: string;
  createdAt: string;
  failureReason?: string;
}

/**
 * Refund result
 */
export interface RefundResult {
  refundId: string;
  chargeId: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED";
  amount: number;
  processorRef: string;
  createdAt: string;
  failureReason?: string;
}

/**
 * Payout creation parameters
 */
export interface PayoutParams {
  amount: number;
  currency: string;
  payeeId: string;
  payeeName: string;
  payeeEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
  // For manual payouts
  evidenceUri?: string;
}

/**
 * Payout result
 */
export interface PayoutResult {
  payoutId: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  amount: number;
  currency: string;
  processorRef: string;
  createdAt: string;
  arrivalDate?: string;
  failureReason?: string;
}

/**
 * Transaction status
 */
export interface TransactionStatus {
  transactionId: string;
  type: "CHARGE" | "REFUND" | "PAYOUT";
  status: string;
  amount: number;
  currency: string;
  processorRef: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Transaction filters
 */
export interface TransactionFilters {
  type?: "CHARGE" | "REFUND" | "PAYOUT" | "all";
  status?: string | "all";
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  startingAfter?: string;
}

/**
 * Webhook ingestion result
 */
export interface WebhookResult {
  processed: boolean;
  eventId: string;
  eventType: string;
  ledgerEventId?: string;
  auditEventId?: string;
  error?: string;
}

/**
 * Payment rail adapter interface
 * Each rail (Stripe, Manual, XRPL) implements this interface
 */
export interface IPaymentsRailAdapter {
  /**
   * Rail identifier
   */
  readonly railId: string;

  /**
   * Create a charge (collect payment)
   */
  createCharge(params: ChargeParams): Promise<ChargeResult>;

  /**
   * Refund a charge (partial or full)
   */
  refundCharge(chargeId: string, amount?: number): Promise<RefundResult>;

  /**
   * Create a payout (send money)
   */
  createPayout(params: PayoutParams): Promise<PayoutResult>;

  /**
   * Get transaction status
   */
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;

  /**
   * List transactions
   */
  listTransactions(filters: TransactionFilters): Promise<TransactionStatus[]>;

  /**
   * Ingest webhook payload (for Stripe, etc.)
   * Returns normalized result with ledger/audit event IDs
   */
  webhookIngest(payload: unknown, signature?: string): Promise<WebhookResult>;
}
