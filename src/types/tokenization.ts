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

export type AssetClass = "rwa_re";

export type RealEstateSubclass =
  | "sfr"
  | "mfr"
  | "com_office"
  | "com_retail"
  | "com_industrial"
  | "com_mixed"
  | "hospitality"
  | "land"
  | "special";

export const assetClassLabel: Record<AssetClass, string> = {
  rwa_re: "Real Estate",
};

export const realEstateSubclassLabel: Record<RealEstateSubclass, string> = {
  sfr: "Single Family Residential",
  mfr: "Multi-Family Residential",
  com_office: "Commercial Office",
  com_retail: "Commercial Retail",
  com_industrial: "Industrial",
  com_mixed: "Mixed Use",
  hospitality: "Hospitality",
  land: "Land / Development",
  special: "Special Purpose",
};

export interface TokenizationProject {
  id: string;
  name: string;
  assetId: string;
  companyName: string; // Company/entity that holds the asset
  jurisdiction: string;
  assetClass: AssetClass;
  assetSubclass: RealEstateSubclass;
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
