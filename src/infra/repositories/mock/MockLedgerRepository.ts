import {
  ILedgerRepository,
  ExtendedLedgerEntry,
  RecordLedgerEventParams,
  LedgerEventFilters,
  LedgerEventListResult,
  LedgerTotals,
} from "@/domain/interfaces/ILedgerRepository";
import { mockLedgerEntries } from "@/data/mockReportsLogs";
import { LedgerEntityType } from "@/types/reportsAndLogs";

/**
 * Mock implementation of ILedgerRepository
 * Uses existing mockLedgerEntries data for backward compatibility
 */
export class MockLedgerRepository implements ILedgerRepository {
  private entries: ExtendedLedgerEntry[];

  constructor() {
    // Convert existing mock entries to extended format
    this.entries = mockLedgerEntries.map(entry => ({
      ...entry,
      // Derive new fields from existing data where possible
      grossAmount: entry.amount,
      feesAmount: 0,
      netAmount: entry.amount,
      direction: this.deriveDirection(entry.entryType),
    }));
  }

  private deriveDirection(entryType: string): "IN" | "OUT" {
    const outTypes = ["PAYOUT", "REFUND", "TOKEN_DISTRIBUTION", "ESCROW_LOCK"];
    return outTypes.includes(entryType) ? "OUT" : "IN";
  }

  async recordEvent(params: RecordLedgerEventParams): Promise<ExtendedLedgerEntry> {
    const newEntry: ExtendedLedgerEntry = {
      id: `led-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      entryType: params.entryType,
      amount: params.amount,
      currency: params.currency,
      rail: params.rail as any, // Handle extended rail types
      status: params.status as any, // Handle extended status types
      payerEntityType: params.payerEntityType as LedgerEntityType,
      payerEntityId: params.payerEntityId,
      payerName: params.payerName,
      payeeEntityType: params.payeeEntityType as LedgerEntityType,
      payeeEntityId: params.payeeEntityId,
      payeeName: params.payeeName,
      projectId: params.projectId,
      projectName: params.projectName,
      tokenId: params.tokenId,
      escrowId: params.escrowId,
      invoiceId: params.invoiceId,
      xrplTxHash: params.xrplTxHash,
      processorRef: params.processorRef,
      memo: params.memo,
      taxCategory: params.taxCategory,
      effectiveAt: params.effectiveAt ?? new Date().toISOString(),
      createdAt: new Date().toISOString(),
      // New PRD fields
      grossAmount: params.grossAmount ?? params.amount,
      feesAmount: params.feesAmount ?? 0,
      netAmount: params.netAmount ?? params.amount,
      payerOfRecord: params.payerOfRecord,
      earningCategory: params.earningCategory,
      evidenceUri: params.evidenceUri,
      auditEventId: params.auditEventId,
      direction: params.direction ?? this.deriveDirection(params.entryType),
    };

    this.entries.unshift(newEntry);
    return newEntry;
  }

  async listEvents(filters: LedgerEventFilters): Promise<LedgerEventListResult> {
    let filtered = [...this.entries];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.payerName.toLowerCase().includes(searchLower) ||
        entry.payeeName.toLowerCase().includes(searchLower) ||
        entry.memo?.toLowerCase().includes(searchLower) ||
        entry.xrplTxHash?.toLowerCase().includes(searchLower) ||
        entry.processorRef?.toLowerCase().includes(searchLower)
      );
    }

    // Apply rail filter
    if (filters.rail && filters.rail !== "all") {
      filtered = filtered.filter(entry => entry.rail === filters.rail);
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter(entry => entry.status === filters.status);
    }

    // Apply entry type filter
    if (filters.entryType && filters.entryType !== "all") {
      filtered = filtered.filter(entry => entry.entryType === filters.entryType);
    }

    // Apply payer of record filter
    if (filters.payerOfRecord && filters.payerOfRecord !== "all") {
      filtered = filtered.filter(entry => entry.payerOfRecord === filters.payerOfRecord);
    }

    // Apply earning category filter
    if (filters.earningCategory && filters.earningCategory !== "all") {
      filtered = filtered.filter(entry => entry.earningCategory === filters.earningCategory);
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(entry => new Date(entry.effectiveAt) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(entry => new Date(entry.effectiveAt) <= toDate);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.effectiveAt).getTime() - new Date(a.effectiveAt).getTime());

    // Apply pagination
    const total = filtered.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 50;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      entries: paginated,
      total,
      hasMore: offset + paginated.length < total,
    };
  }

  async getEvent(ledgerEventId: string): Promise<ExtendedLedgerEntry | null> {
    return this.entries.find(entry => entry.id === ledgerEventId) ?? null;
  }

  async getTotals(filters?: LedgerEventFilters): Promise<LedgerTotals> {
    let filtered = [...this.entries];

    // Apply same filters as listEvents for consistency
    if (filters?.rail && filters.rail !== "all") {
      filtered = filtered.filter(entry => entry.rail === filters.rail);
    }

    // Only count USD amounts
    const usdEntries = filtered.filter(e => e.currency === "USD");

    return {
      settled: usdEntries.filter(e => e.status === "SETTLED").reduce((sum, e) => sum + e.amount, 0),
      pending: usdEntries.filter(e => e.status === "PENDING").reduce((sum, e) => sum + e.amount, 0),
      failed: usdEntries.filter(e => e.status === "FAILED").reduce((sum, e) => sum + e.amount, 0),
      disputed: usdEntries.filter(e => (e.status as string) === "DISPUTED").reduce((sum, e) => sum + e.amount, 0),
    };
  }

  async getEventsByAuditId(auditEventId: string): Promise<ExtendedLedgerEntry[]> {
    return this.entries.filter(entry => entry.auditEventId === auditEventId);
  }
}

// Singleton instance
export const mockLedgerRepository = new MockLedgerRepository();
