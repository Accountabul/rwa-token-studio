import { 
  IAuditRepository, 
  ExtendedAuditEntry, 
  CreateAuditEventParams, 
  AuditEventFilters,
  AuditEventListResult 
} from "@/domain/interfaces/IAuditRepository";
import { mockAuditEntries } from "@/data/mockReportsLogs";
import { AuditEntityType } from "@/types/reportsAndLogs";

/**
 * Mock implementation of IAuditRepository
 * Uses existing mockAuditEntries data for backward compatibility
 */
export class MockAuditRepository implements IAuditRepository {
  private entries: ExtendedAuditEntry[];

  constructor() {
    // Convert existing mock entries to extended format (add default values for new fields)
    this.entries = mockAuditEntries.map(entry => ({
      ...entry,
      source: "UI" as const,
      severity: "INFO" as const,
      classification: "INTERNAL" as const,
    }));
  }

  async writeEvent(params: CreateAuditEventParams): Promise<ExtendedAuditEntry> {
    const newEntry: ExtendedAuditEntry = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      entityType: params.entityType,
      entityId: params.entityId,
      entityName: params.entityName,
      action: params.action,
      actorUserId: params.actorUserId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      sourceIp: params.sourceIp,
      userAgent: params.userAgent,
      beforeState: params.beforeState,
      afterState: params.afterState,
      xrplTxHash: params.xrplTxHash,
      metadata: params.metadata,
      createdAt: new Date().toISOString(),
      // New PRD fields
      source: params.source ?? "UI",
      requestId: params.requestId,
      traceId: params.traceId,
      severity: params.severity ?? "INFO",
      classification: params.classification ?? "INTERNAL",
      exportReason: params.exportReason,
    };

    // Prepend to maintain reverse chronological order
    this.entries.unshift(newEntry);
    return newEntry;
  }

  async listEvents(filters: AuditEventFilters): Promise<AuditEventListResult> {
    let filtered = [...this.entries];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.entityName?.toLowerCase().includes(searchLower) ||
        entry.actorName.toLowerCase().includes(searchLower) ||
        entry.entityId.toLowerCase().includes(searchLower) ||
        entry.xrplTxHash?.toLowerCase().includes(searchLower)
      );
    }

    // Apply entity type filter
    if (filters.entityType && filters.entityType !== "all") {
      filtered = filtered.filter(entry => entry.entityType === filters.entityType);
    }

    // Apply action filter
    if (filters.action && filters.action !== "all") {
      filtered = filtered.filter(entry => entry.action === filters.action);
    }

    // Apply severity filter
    if (filters.severity && filters.severity !== "all") {
      filtered = filtered.filter(entry => entry.severity === filters.severity);
    }

    // Apply classification filter
    if (filters.classification && filters.classification !== "all") {
      filtered = filtered.filter(entry => entry.classification === filters.classification);
    }

    // Apply actor role filter
    if (filters.actorRole && filters.actorRole !== "all") {
      filtered = filtered.filter(entry => entry.actorRole === filters.actorRole);
    }

    // Apply date filters
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(entry => new Date(entry.createdAt) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(entry => new Date(entry.createdAt) <= toDate);
    }

    // Sort by date descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

  async getEvent(eventId: string): Promise<ExtendedAuditEntry | null> {
    return this.entries.find(entry => entry.id === eventId) ?? null;
  }

  async getEventsByEntity(entityType: AuditEntityType, entityId: string): Promise<ExtendedAuditEntry[]> {
    return this.entries.filter(
      entry => entry.entityType === entityType && entry.entityId === entityId
    );
  }
}

// Singleton instance for use across the app
export const mockAuditRepository = new MockAuditRepository();
