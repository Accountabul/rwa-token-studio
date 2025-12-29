import { UnifiedAuditEntry, AuditEntityType, AuditAction } from "@/types/reportsAndLogs";
import { Role } from "@/types/tokenization";

/**
 * Audit event source - where the event originated
 */
export type AuditSource = "UI" | "API" | "WEBHOOK" | "BATCH_JOB" | "LLM_AGENT";

/**
 * Audit event severity level
 */
export type AuditSeverity = "INFO" | "WARN" | "HIGH";

/**
 * Audit event classification for access control
 */
export type AuditClassification = "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";

/**
 * Extended audit entry with new PRD fields (all new fields optional for backward compatibility)
 */
export interface ExtendedAuditEntry extends UnifiedAuditEntry {
  source?: AuditSource;
  requestId?: string;
  traceId?: string;
  severity?: AuditSeverity;
  classification?: AuditClassification;
  exportReason?: string;
}

/**
 * Parameters for creating a new audit event
 */
export interface CreateAuditEventParams {
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
  source?: AuditSource;
  requestId?: string;
  traceId?: string;
  severity?: AuditSeverity;
  classification?: AuditClassification;
  exportReason?: string;
  // Multi-tenant linking fields
  walletAddress?: string;
  linkedBusinessId?: string;
  linkedWorkOrderId?: string;
  linkedWalletId?: string;
  linkedInvestorId?: string;
  linkedContractId?: string;
}

/**
 * Filters for listing audit events
 */
export interface AuditEventFilters {
  search?: string;
  entityType?: AuditEntityType | "all";
  action?: AuditAction | "all";
  severity?: AuditSeverity | "all";
  classification?: AuditClassification | "all";
  actorRole?: Role | "all";
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Result of listing audit events
 */
export interface AuditEventListResult {
  entries: ExtendedAuditEntry[];
  total: number;
  hasMore: boolean;
}

/**
 * Repository interface for audit operations
 * Implementations: MockAuditRepository, SupabaseAuditRepository
 */
export interface IAuditRepository {
  /**
   * Write a new audit event (append-only)
   */
  writeEvent(params: CreateAuditEventParams): Promise<ExtendedAuditEntry>;

  /**
   * List audit events with optional filters
   */
  listEvents(filters: AuditEventFilters): Promise<AuditEventListResult>;

  /**
   * Get a single audit event by ID
   */
  getEvent(eventId: string): Promise<ExtendedAuditEntry | null>;

  /**
   * Get audit events for a specific entity
   */
  getEventsByEntity(entityType: AuditEntityType, entityId: string): Promise<ExtendedAuditEntry[]>;
}
