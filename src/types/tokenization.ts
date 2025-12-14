export type Role =
  | "SUPER_ADMIN"
  | "TOKENIZATION_MANAGER"
  | "COMPLIANCE_OFFICER"
  | "CUSTODY_OFFICER"
  | "VALUATION_OFFICER";

export type ProjectStatus =
  | "INTAKE_PENDING"
  | "INTAKE_COMPLETE"
  | "METADATA_DRAFT"
  | "METADATA_APPROVED"
  | "COMPLIANCE_APPROVED"
  | "CUSTODY_READY"
  | "MINTED";

export interface TokenizationProject {
  id: string;
  name: string;
  assetId: string;
  issuerName: string;
  jurisdiction: string;
  assetClass: string;
  assetSubclass: string;
  valuationUsd: number;
  valuationDate: string;
  status: ProjectStatus;
  createdAt: string;
  xls89Metadata: string;
  // Human-friendly fields
  propertyAddress: string;
  ownerName: string;
  propertyNickname?: string;
}

export const statusLabel: Record<ProjectStatus, string> = {
  INTAKE_PENDING: "Intake Pending",
  INTAKE_COMPLETE: "Intake Complete",
  METADATA_DRAFT: "Metadata Draft",
  METADATA_APPROVED: "Metadata Approved",
  COMPLIANCE_APPROVED: "Compliance Approved",
  CUSTODY_READY: "Custody Ready",
  MINTED: "Minted on XRPL",
};

export const statusOrder: ProjectStatus[] = [
  "INTAKE_PENDING",
  "INTAKE_COMPLETE",
  "METADATA_DRAFT",
  "METADATA_APPROVED",
  "COMPLIANCE_APPROVED",
  "CUSTODY_READY",
  "MINTED",
];

export const roleLabel: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  TOKENIZATION_MANAGER: "Tokenization Manager",
  COMPLIANCE_OFFICER: "Compliance Officer",
  CUSTODY_OFFICER: "Custody Officer",
  VALUATION_OFFICER: "Valuation/Appraisal Officer",
};
