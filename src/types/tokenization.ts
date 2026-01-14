// ============================================================================
// ROLE DEFINITIONS - Enterprise Role Catalog
// ============================================================================

export type Role =
  // Administration & Internal Operations
  | "SUPER_ADMIN"
  | "SYSTEM_ADMIN"
  | "HIRING_MANAGER"
  | "OPERATIONS_ADMIN"
  // Tokenization Business
  | "TOKENIZATION_MANAGER"
  | "VALUATION_OFFICER"
  | "PROPERTY_OPERATIONS_MANAGER"
  | "INVESTOR_OPERATIONS"
  // Compliance, Risk & Oversight
  | "COMPLIANCE_OFFICER"
  | "RISK_ANALYST"
  | "AUDITOR"
  // Finance & Accounting
  | "FINANCE_OFFICER"
  | "ACCOUNTING_MANAGER"
  | "CUSTODY_OFFICER"
  // Engineering & Product
  | "BACKEND_ENGINEER"
  | "PLATFORM_ENGINEER"
  | "SECURITY_ENGINEER"
  | "QA_TEST_ENGINEER"
  // Field Operations
  | "TECHNICIAN";

// Role categories for grouping in UI
export type RoleCategory = "ADMINISTRATION" | "TOKENIZATION" | "COMPLIANCE" | "FINANCE" | "ENGINEERING";

export const ROLE_CATEGORIES: Record<RoleCategory, Role[]> = {
  ADMINISTRATION: ["SUPER_ADMIN", "SYSTEM_ADMIN", "HIRING_MANAGER", "OPERATIONS_ADMIN"],
  TOKENIZATION: ["TOKENIZATION_MANAGER", "VALUATION_OFFICER", "PROPERTY_OPERATIONS_MANAGER", "INVESTOR_OPERATIONS"],
  COMPLIANCE: ["COMPLIANCE_OFFICER", "RISK_ANALYST", "AUDITOR"],
  FINANCE: ["FINANCE_OFFICER", "ACCOUNTING_MANAGER", "CUSTODY_OFFICER"],
  ENGINEERING: ["BACKEND_ENGINEER", "PLATFORM_ENGINEER", "SECURITY_ENGINEER", "QA_TEST_ENGINEER"],
};

export const ROLE_CATEGORY_LABELS: Record<RoleCategory, string> = {
  ADMINISTRATION: "Administration & Internal Operations",
  TOKENIZATION: "Tokenization Business",
  COMPLIANCE: "Compliance, Risk & Oversight",
  FINANCE: "Finance & Accounting",
  ENGINEERING: "Engineering & Product",
};

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

export interface MPTConfig {
  assetScale: number; // 0-15
  maxSupply: number;
  transferFee: number; // 0-50000 (basis points, 0-50%)
  flags: {
    canLock: boolean;
    requireAuth: boolean;
    canEscrow: boolean;
    canTrade: boolean;
    canTransfer: boolean;
    canClawback: boolean;
  };
  computedFlagsValue: number;
}

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
  // Token Fractionalization (pre-minting)
  plannedTokenSupply?: number;
  // MPT Configuration (added after METADATA_DRAFT)
  mptConfig?: MPTConfig;
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

// Role labels for display
export const roleLabel: Record<Role, string> = {
  // Administration
  SUPER_ADMIN: "Super Administrator",
  SYSTEM_ADMIN: "System Administrator",
  HIRING_MANAGER: "Hiring Manager",
  OPERATIONS_ADMIN: "Operations Administrator",
  // Tokenization
  TOKENIZATION_MANAGER: "Tokenization Manager",
  VALUATION_OFFICER: "Valuation Officer",
  PROPERTY_OPERATIONS_MANAGER: "Property Operations Manager",
  INVESTOR_OPERATIONS: "Investor Operations",
  // Compliance
  COMPLIANCE_OFFICER: "Compliance Officer",
  RISK_ANALYST: "Risk Analyst",
  AUDITOR: "Auditor",
  // Finance
  FINANCE_OFFICER: "Finance Officer",
  ACCOUNTING_MANAGER: "Accounting Manager",
  CUSTODY_OFFICER: "Custody Officer",
  // Engineering
  BACKEND_ENGINEER: "Backend Engineer",
  PLATFORM_ENGINEER: "Platform Engineer",
  SECURITY_ENGINEER: "Security Engineer",
  QA_TEST_ENGINEER: "QA / Test Engineer",
  // Field Operations
  TECHNICIAN: "Technician",
};

// Privileged roles that require SUPER_ADMIN or SYSTEM_ADMIN to assign
export const PRIVILEGED_ROLES: Role[] = [
  "SUPER_ADMIN",
  "SYSTEM_ADMIN",
  "CUSTODY_OFFICER",
  "COMPLIANCE_OFFICER",
  "FINANCE_OFFICER",
];

// Basic roles that HIRING_MANAGER can assign
export const BASIC_ROLES: Role[] = [
  "TOKENIZATION_MANAGER",
  "VALUATION_OFFICER",
  "PROPERTY_OPERATIONS_MANAGER",
  "INVESTOR_OPERATIONS",
  "OPERATIONS_ADMIN",
  "RISK_ANALYST",
  "AUDITOR",
  "ACCOUNTING_MANAGER",
  "BACKEND_ENGINEER",
  "PLATFORM_ENGINEER",
  "SECURITY_ENGINEER",
  "QA_TEST_ENGINEER",
  "HIRING_MANAGER",
];

// All roles list for iteration
export const ALL_ROLES: Role[] = [...PRIVILEGED_ROLES, ...BASIC_ROLES.filter(r => !PRIVILEGED_ROLES.includes(r))];
