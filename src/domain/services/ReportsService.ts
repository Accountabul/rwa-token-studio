import {
  IReportsRepository,
  ExtendedReportRun,
  ReportTemplate,
  RunReportParams,
  SaveTemplateParams,
  ReportRunFilters,
  ReportRunListResult,
} from "@/domain/interfaces/IReportsRepository";
import { mockReportsRepository } from "@/infra/repositories/mock/MockReportsRepository";
import { auditService } from "./AuditService";
import { ReportDefinition, ReportOutputFormat } from "@/types/reportsAndLogs";
import { Role } from "@/types/tokenization";

/**
 * Reports Service - orchestrates report operations
 * All exports are logged with reason for compliance
 */
export class ReportsService {
  private repository: IReportsRepository;

  constructor(repository?: IReportsRepository) {
    this.repository = repository ?? mockReportsRepository;
  }

  /**
   * Get available report definitions for a role
   */
  getAvailableReports(role: Role): ReportDefinition[] {
    return this.repository.getAvailableReports(role);
  }

  /**
   * Save a report template
   */
  async saveTemplate(
    params: SaveTemplateParams,
    actor: { userId: string; name: string; role: Role }
  ): Promise<ReportTemplate> {
    const template = await this.repository.saveTemplate(params);

    // Log template creation
    await auditService.writeEvent({
      entityType: "REPORT",
      entityId: template.templateId,
      entityName: template.name,
      action: "CREATE",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      afterState: {
        reportType: template.reportType,
        parameters: template.parameters,
      },
    });

    return template;
  }

  /**
   * List saved templates for a user
   */
  async listTemplates(userId: string): Promise<ReportTemplate[]> {
    return this.repository.listTemplates(userId);
  }

  /**
   * Get a template by ID
   */
  async getTemplate(templateId: string): Promise<ReportTemplate | null> {
    return this.repository.getTemplate(templateId);
  }

  /**
   * Delete a template
   */
  async deleteTemplate(
    templateId: string,
    actor: { userId: string; name: string; role: Role }
  ): Promise<void> {
    const template = await this.repository.getTemplate(templateId);

    await this.repository.deleteTemplate(templateId);

    if (template) {
      // Log template deletion
      await auditService.writeEvent({
        entityType: "REPORT",
        entityId: templateId,
        entityName: template.name,
        action: "DELETE",
        actorUserId: actor.userId,
        actorName: actor.name,
        actorRole: actor.role,
        beforeState: {
          reportType: template.reportType,
          parameters: template.parameters,
        },
      });
    }
  }

  /**
   * Run a report (generates data)
   */
  async runReport(
    params: RunReportParams,
    actor: { userId: string; name: string; role: Role }
  ): Promise<ExtendedReportRun> {
    const run = await this.repository.runReport(params);

    // Log report generation
    await auditService.writeEvent({
      entityType: "REPORT",
      entityId: run.id,
      entityName: run.reportName,
      action: "CREATE",
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      metadata: {
        reportType: run.reportType,
        outputFormat: run.outputFormat,
        rowCount: run.rowCount,
        parameters: run.params,
      },
    });

    return run;
  }

  /**
   * Get report run history
   */
  async listReportRuns(filters: ReportRunFilters = {}): Promise<ReportRunListResult> {
    return this.repository.listReportRuns(filters);
  }

  /**
   * Get a specific report run
   */
  async getReportRun(runId: string): Promise<ExtendedReportRun | null> {
    return this.repository.getReportRun(runId);
  }

  /**
   * Export report data with required reason
   * Creates RESTRICTED classification audit event
   */
  async exportReport(
    runId: string,
    format: ReportOutputFormat,
    exportReason: string,
    actor: { userId: string; name: string; role: Role }
  ): Promise<string> {
    if (!exportReason || exportReason.trim().length < 10) {
      throw new Error("Export reason must be at least 10 characters");
    }

    const run = await this.repository.getReportRun(runId);
    if (!run) {
      throw new Error(`Report run ${runId} not found`);
    }

    const fileUri = await this.repository.exportReport(runId, format);

    // Log export with reason (RESTRICTED classification)
    await auditService.logExport({
      entityType: "REPORT",
      entityId: runId,
      entityName: run.reportName,
      actorUserId: actor.userId,
      actorName: actor.name,
      actorRole: actor.role,
      exportReason,
      rowCount: run.rowCount,
      filters: run.params,
      metadata: {
        format,
        fileUri,
      },
    });

    return fileUri;
  }
}

// Default singleton instance using mock repository
export const reportsService = new ReportsService();
