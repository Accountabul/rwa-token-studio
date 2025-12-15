import { Role } from "./tokenization";

export type KBCategory = 
  | "projects_assets"
  | "asset_classification"
  | "xls89_metadata"
  | "investor_compliance"
  | "permissiondex"
  | "token_registry"
  | "xrpl_explorer"
  | "portfolio_holdings"
  | "system_roles";

export const kbCategoryLabel: Record<KBCategory, string> = {
  projects_assets: "Projects & Assets",
  asset_classification: "Asset Classification",
  xls89_metadata: "XLS-89 Metadata",
  investor_compliance: "Investor & Compliance",
  permissiondex: "PermissionDEX",
  token_registry: "Token Registry",
  xrpl_explorer: "XRPL Explorer",
  portfolio_holdings: "Portfolio & Holdings",
  system_roles: "System Roles & Permissions",
};

export const kbCategoryDescription: Record<KBCategory, string> = {
  projects_assets: "Defines how Accountabul interprets tokenized projects",
  asset_classification: "Defines what type of asset is being tokenized",
  xls89_metadata: "Defines every metadata key used in XRPL MPTs per XLS-0089",
  investor_compliance: "Defines investor-level concepts and compliance rules",
  permissiondex: "Defines wallet-level permissioning via PermissionDEX",
  token_registry: "Defines token standards, lifecycle, and management on XRPL",
  xrpl_explorer: "Defines XRPL explorer integration and on-chain verification",
  portfolio_holdings: "Defines investor portfolio metrics and asset holdings",
  system_roles: "Defines human roles, AI agents, access controls, and audit criteria for compliance review",
};

export type KBEntryStatus = "draft" | "published";
export type KBProposalStatus = "pending" | "approved" | "rejected";

export interface KBVersion {
  id: string;
  version: number;
  title: string;
  key: string;
  definition: string;
  allowedValues?: string[];
  usageContext?: string;
  publishedAt: Date;
  publishedBy: string;
}

export interface KBProposal {
  id: string;
  entryId: string | null; // null for new entries
  proposedTitle: string;
  proposedKey: string;
  proposedDefinition: string;
  proposedAllowedValues?: string[];
  proposedUsageContext?: string;
  rationale: string;
  status: KBProposalStatus;
  proposedBy: string;
  proposedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

export interface KBEntry {
  id: string;
  category: KBCategory;
  key: string;
  title: string;
  definition: string;
  allowedValues?: string[];
  usageContext?: string;
  currentVersion: number;
  versions: KBVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export function canPublishKB(role: Role): boolean {
  return role === "SUPER_ADMIN";
}

export function canProposeKB(_role: Role): boolean {
  return true; // All staff can propose
}

export function canEditKBDirectly(role: Role): boolean {
  return role === "SUPER_ADMIN";
}
