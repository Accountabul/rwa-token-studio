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

  /**
   * Log a business lifecycle event
   */
  async logBusinessEvent(
    businessId: string,
    businessName: string,
    action: "CREATE" | "UPDATE" | "DELETE" | "LIFECYCLE_TRANSITION",
    actorUserId: string,
    actorName: string,
    actorRole: CreateAuditEventParams['actorRole'],
    metadata?: Record<string, unknown>
  ): Promise<ExtendedAuditEntry> {
    return this.writeEvent({
      entityType: "BUSINESS",
      entityId: businessId,
      entityName: businessName,
      action,
      actorUserId,
      actorName,
      actorRole,
      linkedBusinessId: businessId,
      metadata,
    });
  }

  /**
   * Log a work order lifecycle event
   */
  async logWorkOrderEvent(
    workOrderId: string,
    workOrderTitle: string,
    businessId: string,
    action: "CREATE" | "ASSIGN" | "COMPLETE" | "PAY" | "CANCEL",
    actorUserId: string,
    actorName: string,
    actorRole: CreateAuditEventParams['actorRole'],
    metadata?: Record<string, unknown>
  ): Promise<ExtendedAuditEntry> {
    return this.writeEvent({
      entityType: "WORK_ORDER",
      entityId: workOrderId,
      entityName: workOrderTitle,
      action,
      actorUserId,
      actorName,
      actorRole,
      linkedBusinessId: businessId,
      linkedWorkOrderId: workOrderId,
      metadata,
    });
  }

  /**
   * Log a smart contract call
   */
  async logContractCall(
    contractId: string,
    contractName: string,
    functionName: string,
    callerWalletAddress: string,
    actorUserId: string,
    actorName: string,
    actorRole: CreateAuditEventParams['actorRole'],
    xrplTxHash?: string
  ): Promise<ExtendedAuditEntry> {
    return this.writeEvent({
      entityType: "CONTRACT_CALL",
      entityId: contractId,
      entityName: contractName,
      action: "CALL",
      actorUserId,
      actorName,
      actorRole,
      linkedContractId: contractId,
      walletAddress: callerWalletAddress,
      xrplTxHash,
      metadata: { functionName },
    });
  }

  /**
   * Log a token operation (mint, distribute, clawback, etc.)
   */
  async logTokenOperation(
    operationType: "MINT" | "DISTRIBUTE" | "CLAWBACK" | "TRANSFER" | "FREEZE" | "UNFREEZE",
    tokenId: string,
    tokenName: string,
    investorId: string | undefined,
    walletAddress: string,
    amount: number,
    actorUserId: string,
    actorName: string,
    actorRole: CreateAuditEventParams['actorRole'],
    xrplTxHash?: string
  ): Promise<ExtendedAuditEntry> {
    return this.writeEvent({
      entityType: "TOKEN",
      entityId: tokenId,
      entityName: tokenName,
      action: operationType,
      actorUserId,
      actorName,
      actorRole,
      linkedInvestorId: investorId,
      walletAddress,
      xrplTxHash,
      metadata: { amount },
    });
  }

  /**
   * Log a multi-sign transaction execution
   */
  async logMultiSignExecution(
    transactionId: string,
    walletId: string,
    signerAddresses: string[],
    actorUserId: string,
    actorName: string,
    actorRole: CreateAuditEventParams['actorRole'],
    xrplTxHash?: string
  ): Promise<ExtendedAuditEntry> {
    return this.writeEvent({
      entityType: "MULTI_SIGN_TX",
      entityId: transactionId,
      entityName: `Multi-Sig Transaction ${transactionId}`,
      action: "EXECUTE",
      actorUserId,
      actorName,
      actorRole,
      severity: "HIGH",
      classification: "RESTRICTED",
      linkedWalletId: walletId,
      xrplTxHash,
      metadata: { signers: signerAddresses, quorum: `${Math.ceil(signerAddresses.length * 0.67)}/${signerAddresses.length}` },
    });
  }

  /**
   * Log user wallet activity (connect, disconnect, authorize, sign)
   */
  async logUserWalletActivity(
    investorId: string,
    investorName: string,
    walletAddress: string,
    action: "CONNECT" | "DISCONNECT" | "AUTHORIZE" | "SIGN",
    actorUserId: string,
    actorName: string,
    actorRole: CreateAuditEventParams['actorRole'],
    xrplTxHash?: string
  ): Promise<ExtendedAuditEntry> {
    return this.writeEvent({
      entityType: "INVESTOR",
      entityId: investorId,
      entityName: investorName,
      action,
      actorUserId,
      actorName,
      actorRole,
      linkedInvestorId: investorId,
      walletAddress,
      xrplTxHash,
      metadata: { walletAddress },
    });
  }
}

// Default singleton instance using mock repository
export const auditService = new AuditService();
