import {
  ITaxRepository,
  ExtendedTaxProfile,
  PayeeFilters,
  PayeeListResult,
  PayeeStats,
  TaxFormSubmission,
  TaxFormType,
  PayoutSummary,
  TaxPackagePreview,
  TaxPackageIssue,
} from "@/domain/interfaces/ITaxRepository";
import { mockTaxProfiles } from "@/data/mockReportsLogs";
import { TaxFormStatus } from "@/types/reportsAndLogs";

/**
 * Mock implementation of ITaxRepository
 * Uses existing mockTaxProfiles data for backward compatibility
 */
export class MockTaxRepository implements ITaxRepository {
  private profiles: ExtendedTaxProfile[];
  private formSubmissions: TaxFormSubmission[] = [];

  constructor() {
    // Convert existing mock profiles to extended format
    this.profiles = mockTaxProfiles.map(profile => ({
      ...profile,
      // Derive new fields from existing data
      payeeType: this.derivePayeeType(profile.entityType),
      payeeCategory: "USER" as const,
      countryCode: profile.addressJson.country === "USA" ? "US" : profile.addressJson.country,
      restrictedAccess: true,
    }));
  }

  private derivePayeeType(entityType: string): "INDIVIDUAL" | "BUSINESS" {
    return entityType === "INDIVIDUAL" ? "INDIVIDUAL" : "BUSINESS";
  }

  async listPayees(filters: PayeeFilters): Promise<PayeeListResult> {
    let filtered = [...this.profiles];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.userName.toLowerCase().includes(searchLower) ||
        profile.legalName.toLowerCase().includes(searchLower)
      );
    }

    // Apply W-9 status filter
    if (filters.w9Status && filters.w9Status !== "all") {
      filtered = filtered.filter(profile => profile.w9Status === filters.w9Status);
    }

    // Apply W-8 status filter
    if (filters.w8Status && filters.w8Status !== "all") {
      filtered = filtered.filter(profile => profile.w8Status === filters.w8Status);
    }

    // Apply entity type filter
    if (filters.entityType && filters.entityType !== "all") {
      filtered = filtered.filter(profile => profile.entityType === filters.entityType);
    }

    // Apply payee category filter
    if (filters.payeeCategory && filters.payeeCategory !== "all") {
      filtered = filtered.filter(profile => profile.payeeCategory === filters.payeeCategory);
    }

    // Apply US person filter
    if (filters.isUsPerson !== null && filters.isUsPerson !== undefined) {
      filtered = filtered.filter(profile => profile.isUsPerson === filters.isUsPerson);
    }

    // Apply minimum payments filter
    if (filters.minPaymentsYTD !== undefined) {
      filtered = filtered.filter(profile => profile.totalPaymentsYTD >= filters.minPaymentsYTD!);
    }

    // Apply pagination
    const total = filtered.length;
    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 50;
    const paginated = filtered.slice(offset, offset + limit);

    return {
      profiles: paginated,
      total,
      hasMore: offset + paginated.length < total,
    };
  }

  async getPayeeProfile(payeeId: string): Promise<ExtendedTaxProfile | null> {
    return this.profiles.find(profile => profile.userId === payeeId) ?? null;
  }

  async upsertPayeeProfile(profile: Partial<ExtendedTaxProfile> & { userId: string }): Promise<ExtendedTaxProfile> {
    const existingIndex = this.profiles.findIndex(p => p.userId === profile.userId);
    
    if (existingIndex >= 0) {
      // Update existing
      this.profiles[existingIndex] = {
        ...this.profiles[existingIndex],
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      return this.profiles[existingIndex];
    } else {
      // Create new (would need full required fields in real implementation)
      const newProfile: ExtendedTaxProfile = {
        userId: profile.userId,
        userName: profile.userName ?? "Unknown",
        legalName: profile.legalName ?? "Unknown",
        entityType: profile.entityType ?? "INDIVIDUAL",
        isUsPerson: profile.isUsPerson ?? true,
        addressJson: profile.addressJson ?? { country: "USA" },
        w9Status: profile.w9Status ?? "MISSING",
        w8Status: profile.w8Status ?? "MISSING",
        backupWithholdingRequired: profile.backupWithholdingRequired ?? false,
        totalPaymentsYTD: profile.totalPaymentsYTD ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...profile,
      };
      this.profiles.push(newProfile);
      return newProfile;
    }
  }

  async getPayeeStats(): Promise<PayeeStats> {
    return {
      total: this.profiles.length,
      verified: this.profiles.filter(p => p.w9Status === "VERIFIED" || p.w8Status === "VERIFIED").length,
      missing: this.profiles.filter(p => p.w9Status === "MISSING" && p.w8Status === "MISSING").length,
      withholding: this.profiles.filter(p => p.backupWithholdingRequired).length,
      over600: this.profiles.filter(p => p.totalPaymentsYTD >= 600).length,
    };
  }

  async submitTaxFormStatus(
    payeeId: string,
    formType: TaxFormType,
    status: TaxFormStatus,
    fileUri?: string
  ): Promise<TaxFormSubmission> {
    const submission: TaxFormSubmission = {
      submissionId: `sub-${Date.now()}`,
      payeeId,
      formType,
      status,
      receivedAt: new Date().toISOString(),
      verifiedAt: status === "VERIFIED" ? new Date().toISOString() : undefined,
      fileUri,
    };

    this.formSubmissions.push(submission);

    // Update the profile's form status
    const profile = this.profiles.find(p => p.userId === payeeId);
    if (profile) {
      if (formType === "W9") {
        profile.w9Status = status;
      } else {
        profile.w8Status = status;
      }
      profile.updatedAt = new Date().toISOString();
    }

    return submission;
  }

  async getTaxFormSubmissions(payeeId: string): Promise<TaxFormSubmission[]> {
    return this.formSubmissions.filter(sub => sub.payeeId === payeeId);
  }

  async getPayoutSummariesByYear(taxYear: number): Promise<PayoutSummary[]> {
    // Generate mock payout summaries from profiles
    return this.profiles.map(profile => ({
      payeeId: profile.userId,
      payeeName: profile.userName,
      taxYear,
      totalPayments: profile.totalPaymentsYTD,
      byEarningCategory: { CONTRACTOR_COMP: profile.totalPaymentsYTD },
      byRail: { STRIPE: profile.totalPaymentsYTD * 0.7, ACH: profile.totalPaymentsYTD * 0.3 },
      byPayerOfRecord: { ACCOUNTABUL: profile.totalPaymentsYTD },
      formRequired: profile.isUsPerson ? "W9" : "W8BEN",
      formStatus: profile.isUsPerson ? profile.w9Status : profile.w8Status,
    }));
  }

  async previewTaxPackage(taxYear: number): Promise<TaxPackagePreview> {
    const summaries = await this.getPayoutSummariesByYear(taxYear);
    const issues: TaxPackageIssue[] = [];

    // Check for issues
    for (const summary of summaries) {
      const profile = this.profiles.find(p => p.userId === summary.payeeId);
      if (!profile) continue;

      if (summary.totalPayments >= 600 && summary.formStatus === "MISSING") {
        issues.push({
          payeeId: summary.payeeId,
          payeeName: summary.payeeName,
          issueType: "MISSING_FORM",
          description: `Missing ${summary.formRequired} form for payee with $${summary.totalPayments.toLocaleString()} in payments`,
          severity: "ERROR",
        });
      }

      if (!profile.countryCode) {
        issues.push({
          payeeId: summary.payeeId,
          payeeName: summary.payeeName,
          issueType: "UNKNOWN_RESIDENCY",
          description: "Country of residence not confirmed",
          severity: "WARNING",
        });
      }
    }

    return {
      taxYear,
      totalPayees: summaries.length,
      eligibleFor1099: summaries.filter(s => s.totalPayments >= 600).length,
      missingForms: issues.filter(i => i.issueType === "MISSING_FORM").length,
      issues,
      payeeSummaries: summaries,
    };
  }
}

// Singleton instance
export const mockTaxRepository = new MockTaxRepository();
