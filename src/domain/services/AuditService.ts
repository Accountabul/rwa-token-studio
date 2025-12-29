import { 
  IAuditRepository, 
  ExtendedAuditEntry, 
  CreateAuditEventParams,
  AuditEventFilters,
  AuditEventListResult,
} from "@/domain/interfaces/IAuditRepository";
import { mockAuditRepository } from "@/infra/repositories/mock/MockAuditRepository";
import { AuditEntityType } from "@/types/reportsAndLogs";

/**
 * Audit Service - orchestrates audit operations
 * Uses repository pattern for data access (mock by default, Supabase when enabled)
 */
export class AuditService {
  private repository: IAuditRepository;

  constructor(repository?: IAuditRepository) {
    this.repository = repository ?? mockAuditRepository;
  }

  /**
   * Write a new audit event (append-only)
   * All sensitive operations should call this method
   */
  async writeEvent(params: CreateAuditEventParams): Promise<ExtendedAuditEntry> {
    // Add request metadata if available
    const enrichedParams: CreateAuditEventParams = {
      ...params,
      requestId: params.requestId ?? crypto.randomUUID(),
      traceId: params.traceId ?? crypto.randomUUID(),
    };

    return this.repository.writeEvent(enrichedParams);
  }

  /**
   * List audit events with optional filters
   */
  async listEvents(filters: AuditEventFilters = {}): Promise<AuditEventListResult> {
    return this.repository.listEvents(filters);
  }

  /**
   * Get a single audit event by ID
   */
  async getEvent(eventId: string): Promise<ExtendedAuditEntry | null> {
    return this.repository.getEvent(eventId);
  }

  /**
   * Get audit events for a specific entity
   */
  async getEventsByEntity(entityType: AuditEntityType, entityId: string): Promise<ExtendedAuditEntry[]> {
    return this.repository.getEventsByEntity(entityType, entityId);
  }

  /**
   * Log an export action with reason (creates RESTRICTED classification event)
   */
  async logExport(
    params: Omit<CreateAuditEventParams, 'action' | 'classification' | 'severity'> & {
      exportReason: string;
      rowCount: number;
      filters: Record<string, unknown>;
    }
  ): Promise<ExtendedAuditEntry> {
    return this.writeEvent({
      ...params,
      action: "EXPORT",
      classification: "RESTRICTED",
      severity: "INFO",
      metadata: {
        ...params.metadata,
        rowCount: params.rowCount,
        filters: params.filters,
        exportReason: params.exportReason,
      },
    });
  }

  /**
   * Log a tax profile access (creates RESTRICTED classification event)
   */
  async logTaxProfileAccess(
    actorUserId: string,
    actorName: string,
    actorRole: CreateAuditEventParams['actorRole'],
    payeeId: string,
    payeeName: string,
    fieldsAccessed: string[]
  ): Promise<ExtendedAuditEntry> {
    return this.writeEvent({
      entityType: "TAX_PROFILE",
      entityId: payeeId,
      entityName: payeeName,
      action: "VIEW",
      actorUserId,
      actorName,
      actorRole,
      classification: "RESTRICTED",
      severity: "INFO",
      metadata: {
        sensitiveFieldsAccessed: fieldsAccessed,
      },
    });
  }
}

// Default singleton instance using mock repository
export const auditService = new AuditService();
