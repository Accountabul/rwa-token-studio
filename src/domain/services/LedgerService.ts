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

  /**
   * Record a work order payment with full linking
   */
  async recordWorkOrderPayment(params: {
    workOrderId: string;
    workOrderTitle: string;
    businessId: string;
    businessName: string;
    assigneeId: string;
    assigneeName: string;
    amount: number;
    currency: string;
    rail: "XRPL" | "STRIPE" | "ACH" | "WIRE" | "PAYPAL";
    processorRef?: string;
    xrplTxHash?: string;
    earningCategory?: string;
    actorUserId: string;
    actorName: string;
    actorRole: Role;
  }): Promise<ExtendedLedgerEntry> {
    // Create audit event
    const auditEntry = await auditService.logWorkOrderEvent(
      params.workOrderId,
      params.workOrderTitle,
      params.businessId,
      "PAY",
      params.actorUserId,
      params.actorName,
      params.actorRole,
      { amount: params.amount, rail: params.rail }
    );

    return this.repository.recordEvent({
      entryType: "PAYOUT",
      amount: params.amount,
      grossAmount: params.amount,
      feesAmount: params.amount * 0.025, // 2.5% platform fee
      netAmount: params.amount * 0.975,
      currency: params.currency,
      rail: params.rail,
      status: "SETTLED",
      payerEntityType: "BUSINESS",
      payerEntityId: params.businessId,
      payerName: params.businessName,
      payeeEntityType: "USER",
      payeeEntityId: params.assigneeId,
      payeeName: params.assigneeName,
      linkedBusinessId: params.businessId,
      linkedWorkOrderId: params.workOrderId,
      earningCategory: (params.earningCategory as any) ?? "WORK_ORDER",
      payerOfRecord: "PLATFORM",
      xrplTxHash: params.xrplTxHash,
      processorRef: params.processorRef,
      auditEventId: auditEntry.id,
      memo: `Work order payment: ${params.workOrderTitle}`,
    });
  }

  /**
   * Record a token distribution to an investor
   */
  async recordTokenDistribution(params: {
    tokenId: string;
    tokenName: string;
    investorId: string;
    investorName: string;
    walletAddress: string;
    amount: number;
    xrplTxHash: string;
    actorUserId: string;
    actorName: string;
    actorRole: Role;
  }): Promise<ExtendedLedgerEntry> {
    // Create audit event
    const auditEntry = await auditService.logTokenOperation(
      "DISTRIBUTE",
      params.tokenId,
      params.tokenName,
      params.investorId,
      params.walletAddress,
      params.amount,
      params.actorUserId,
      params.actorName,
      params.actorRole,
      params.xrplTxHash
    );

    return this.repository.recordEvent({
      entryType: "TOKEN_DISTRIBUTION",
      amount: params.amount,
      grossAmount: params.amount,
      feesAmount: 0,
      netAmount: params.amount,
      currency: params.tokenName,
      rail: "XRPL",
      status: "SETTLED",
      payerEntityType: "WALLET",
      payerEntityId: "treasury",
      payerName: "Platform Treasury",
      payeeEntityType: "USER",
      payeeEntityId: params.investorId,
      payeeName: params.investorName,
      tokenId: params.tokenId,
      xrplTxHash: params.xrplTxHash,
      auditEventId: auditEntry.id,
      memo: `Token distribution: ${params.amount} ${params.tokenName}`,
    });
  }

  /**
   * Record an escrow operation (lock, release, cancel)
   */
  async recordEscrowOperation(params: {
    escrowId: string;
    operationType: "LOCK" | "RELEASE" | "CANCEL";
    amount: number;
    currency: string;
    senderWalletAddress: string;
    receiverWalletAddress?: string;
    xrplTxHash: string;
    actorUserId: string;
    actorName: string;
    actorRole: Role;
  }): Promise<ExtendedLedgerEntry> {
    const entryTypeMap = {
      LOCK: "ESCROW_LOCK" as const,
      RELEASE: "ESCROW_RELEASE" as const,
      CANCEL: "ESCROW_RELEASE" as const,
    };

    const auditEntry = await auditService.writeEvent({
      entityType: "ESCROW",
      entityId: params.escrowId,
      entityName: `Escrow ${params.escrowId}`,
      action: "LIFECYCLE_TRANSITION",
      actorUserId: params.actorUserId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      xrplTxHash: params.xrplTxHash,
      metadata: { operationType: params.operationType, amount: params.amount },
    });

    return this.repository.recordEvent({
      entryType: entryTypeMap[params.operationType],
      amount: params.amount,
      grossAmount: params.amount,
      feesAmount: 0,
      netAmount: params.amount,
      currency: params.currency,
      rail: "XRPL",
      status: "SETTLED",
      payerEntityType: params.operationType === "LOCK" ? "WALLET" : "ESCROW",
      payerEntityId: params.operationType === "LOCK" ? "sender-wallet" : params.escrowId,
      payerName: params.operationType === "LOCK" ? "Sender Wallet" : `Escrow ${params.escrowId}`,
      payeeEntityType: params.operationType === "LOCK" ? "ESCROW" : "WALLET",
      payeeEntityId: params.operationType === "LOCK" ? params.escrowId : "receiver-wallet",
      payeeName: params.operationType === "LOCK" ? `Escrow ${params.escrowId}` : "Receiver Wallet",
      escrowId: params.escrowId,
      xrplTxHash: params.xrplTxHash,
      auditEventId: auditEntry.id,
      memo: `Escrow ${params.operationType.toLowerCase()}: ${params.amount} ${params.currency}`,
    });
  }

  /**
   * Record a contract fee collection
   */
  async recordContractFee(params: {
    contractId: string;
    contractName: string;
    feeType: "EXECUTION_FEE" | "PLATFORM_FEE" | "GAS_FEE";
    amount: number;
    currency: string;
    walletAddress: string;
    xrplTxHash?: string;
    actorUserId: string;
    actorName: string;
    actorRole: Role;
  }): Promise<ExtendedLedgerEntry> {
    const auditEntry = await auditService.logContractCall(
      params.contractId,
      params.contractName,
      `fee_${params.feeType.toLowerCase()}`,
      params.walletAddress,
      params.actorUserId,
      params.actorName,
      params.actorRole,
      params.xrplTxHash
    );

    return this.repository.recordEvent({
      entryType: "FEE",
      amount: params.amount,
      grossAmount: params.amount,
      feesAmount: 0,
      netAmount: params.amount,
      currency: params.currency,
      rail: params.xrplTxHash ? "XRPL" : "INTERNAL",
      status: "SETTLED",
      payerEntityType: "USER",
      payerEntityId: "caller",
      payerName: "Contract Caller",
      payeeEntityType: "PLATFORM",
      payeeEntityId: "platform",
      payeeName: "Platform",
      linkedContractId: params.contractId,
      xrplTxHash: params.xrplTxHash,
      auditEventId: auditEntry.id,
      memo: `Contract fee (${params.feeType}): ${params.contractName}`,
    });
  }
}

// Default singleton instance using mock repository
export const ledgerService = new LedgerService();
