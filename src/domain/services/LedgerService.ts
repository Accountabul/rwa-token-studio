import {
  ILedgerRepository,
  ExtendedLedgerEntry,
  RecordLedgerEventParams,
  LedgerEventFilters,
  LedgerEventListResult,
  LedgerTotals,
} from "@/domain/interfaces/ILedgerRepository";
import { mockLedgerRepository } from "@/infra/repositories/mock/MockLedgerRepository";
import { auditService } from "./AuditService";
import { Role } from "@/types/tokenization";

/**
 * Ledger Service - orchestrates ledger operations
 * Uses repository pattern for data access (mock by default, Supabase when enabled)
 */
export class LedgerService {
  private repository: ILedgerRepository;

  constructor(repository?: ILedgerRepository) {
    this.repository = repository ?? mockLedgerRepository;
  }

  /**
   * Record a new ledger event (append-only)
   * Optionally creates linked audit event
   */
  async recordLedgerEvent(
    params: RecordLedgerEventParams,
    options?: {
      createAuditEvent?: boolean;
      actorUserId?: string;
      actorName?: string;
      actorRole?: Role;
    }
  ): Promise<ExtendedLedgerEntry> {
    let auditEventId: string | undefined;

    // Create linked audit event if requested
    if (options?.createAuditEvent && options.actorUserId && options.actorName && options.actorRole) {
      const auditEntry = await auditService.writeEvent({
        entityType: "BATCH", // Using BATCH as closest match for ledger entries
        entityId: `ledger-${Date.now()}`,
        entityName: `${params.entryType} - ${params.payeeName}`,
        action: "CREATE",
        actorUserId: options.actorUserId,
        actorName: options.actorName,
        actorRole: options.actorRole,
        metadata: {
          entryType: params.entryType,
          amount: params.amount,
          currency: params.currency,
          rail: params.rail,
        },
      });
      auditEventId = auditEntry.id;
    }

    return this.repository.recordEvent({
      ...params,
      auditEventId: auditEventId ?? params.auditEventId,
    });
  }

  /**
   * List ledger events with optional filters
   */
  async listLedgerEvents(filters: LedgerEventFilters = {}): Promise<LedgerEventListResult> {
    return this.repository.listEvents(filters);
  }

  /**
   * Get a single ledger event by ID
   */
  async getLedgerEvent(ledgerEventId: string): Promise<ExtendedLedgerEntry | null> {
    return this.repository.getEvent(ledgerEventId);
  }

  /**
   * Get ledger totals for summary cards
   */
  async getLedgerTotals(filters?: LedgerEventFilters): Promise<LedgerTotals> {
    return this.repository.getTotals(filters);
  }

  /**
   * Get ledger events linked to a specific audit event
   */
  async getLedgerEventsByAuditId(auditEventId: string): Promise<ExtendedLedgerEntry[]> {
    return this.repository.getEventsByAuditId(auditEventId);
  }

  /**
   * Record a manual payout (requires evidence)
   */
  async recordManualPayout(
    params: Omit<RecordLedgerEventParams, 'rail'> & {
      evidenceUri: string;
      actorUserId: string;
      actorName: string;
      actorRole: Role;
    }
  ): Promise<ExtendedLedgerEntry> {
    if (!params.evidenceUri) {
      throw new Error("Evidence URI is required for manual payouts");
    }

    // Create audit event for manual payout
    const auditEntry = await auditService.writeEvent({
      entityType: "BATCH",
      entityId: `manual-payout-${Date.now()}`,
      entityName: `Manual Payout to ${params.payeeName}`,
      action: "CREATE",
      actorUserId: params.actorUserId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      severity: "WARN", // Manual payouts are noteworthy
      classification: "CONFIDENTIAL",
      metadata: {
        amount: params.amount,
        currency: params.currency,
        payeeId: params.payeeEntityId,
        payeeName: params.payeeName,
        evidenceUri: params.evidenceUri,
      },
    });

    return this.repository.recordEvent({
      ...params,
      rail: "ACCOUNTABUL_MANUAL" as any,
      auditEventId: auditEntry.id,
    });
  }

  /**
   * Reconcile Stripe transactions for a day
   * Compares internal ledger with Stripe records
   */
  async reconcileStripeDay(date: string): Promise<{
    matched: number;
    mismatched: number;
    missingInternal: number;
    missingExternal: number;
    issues: Array<{ type: string; description: string; transactionId?: string }>;
  }> {
    // Mock reconciliation result
    // In real implementation, would compare Stripe API data with ledger entries
    return {
      matched: 45,
      mismatched: 2,
      missingInternal: 1,
      missingExternal: 0,
      issues: [
        {
          type: "AMOUNT_MISMATCH",
          description: "Amount differs between Stripe and internal ledger",
          transactionId: "led-mock-001",
        },
        {
          type: "MISSING_INTERNAL",
          description: "Stripe transaction not found in internal ledger",
          transactionId: "pi_stripe_123",
        },
      ],
    };
  }
}

// Default singleton instance using mock repository
export const ledgerService = new LedgerService();
