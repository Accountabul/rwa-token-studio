import { ReportDefinition, ReportRun, ReportType, ReportOutputFormat } from "@/types/reportsAndLogs";
import { Role } from "@/types/tokenization";

/**
 * Extended report run with new PRD fields
 */
export interface ExtendedReportRun extends ReportRun {
  exportReason?: string;
  auditEventId?: string;
}

/**
 * Report template (saved filter configuration)
 */
export interface ReportTemplate {
  templateId: string;
  reportType: ReportType;
  name: string;
  description?: string;
  ownerUserId: string;
  ownerName: string;
  parameters: Record<string, unknown>;
  createdAt: string;
  lastRunAt?: string;
}

/**
 * Parameters for running a report
 */
export interface RunReportParams {
  reportType: ReportType;
  templateId?: string;
  parameters: Record<string, unknown>;
  outputFormat: ReportOutputFormat;
  generatedBy: string;
  generatedByName: string;
  exportReason?: string;
}

/**
 * Parameters for saving a report template
 */
export interface SaveTemplateParams {
  reportType: ReportType;
  name: string;
  description?: string;
  ownerUserId: string;
  ownerName: string;
  parameters: Record<string, unknown>;
}

/**
 * Filters for listing report runs
 */
export interface ReportRunFilters {
  reportType?: ReportType | "all";
  status?: "RUNNING" | "COMPLETED" | "FAILED" | "all";
  generatedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

/**
 * Result of listing report runs
 */
export interface ReportRunListResult {
  runs: ExtendedReportRun[];
  total: number;
  hasMore: boolean;
}

/**
 * Repository interface for reports operations
 * Implementations: MockReportsRepository, SupabaseReportsRepository
 */
export interface IReportsRepository {
  /**
   * Get available report definitions for a role
   */
  getAvailableReports(role: Role): ReportDefinition[];

  /**
   * Save a report template
   */
  saveTemplate(params: SaveTemplateParams): Promise<ReportTemplate>;

  /**
   * List saved templates for a user
   */
  listTemplates(userId: string): Promise<ReportTemplate[]>;

  /**
   * Get a template by ID
   */
  getTemplate(templateId: string): Promise<ReportTemplate | null>;

  /**
   * Delete a template
   */
  deleteTemplate(templateId: string): Promise<void>;

  /**
   * Run a report
   */
  runReport(params: RunReportParams): Promise<ExtendedReportRun>;

  /**
   * Get report run history
   */
  listReportRuns(filters: ReportRunFilters): Promise<ReportRunListResult>;

  /**
   * Get a specific report run
   */
  getReportRun(runId: string): Promise<ExtendedReportRun | null>;

  /**
   * Export report data (returns file URI)
   */
  exportReport(runId: string, format: ReportOutputFormat): Promise<string>;
}
