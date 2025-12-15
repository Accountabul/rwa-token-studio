import { Role } from "./tokenization";
import { Token } from "./token";

// All possible token actions
export type TokenAction = 
  | "CREATED" 
  | "ISSUED" 
  | "MINTED" 
  | "BURNED" 
  | "FROZEN" 
  | "UNFROZEN"
  | "TRANSFER_DISABLED"
  | "TRANSFER_ENABLED"
  | "METADATA_UPDATED"
  | "SUPPLY_CHANGED"
  | "DISTRIBUTED"
  | "RETIRED";

// Audit log entry for every token action
export interface TokenAuditEntry {
  id: string;
  tokenId: string;
  action: TokenAction;
  performedBy: string;
  role: Role;
  timestamp: string;
  xrplTxHash?: string;
  beforeState?: Partial<Token>;
  afterState?: Partial<Token>;
  metadata?: Record<string, unknown>;
  description: string;
}

// Labels for audit actions
export const tokenActionLabel: Record<TokenAction, string> = {
  CREATED: "Token Created",
  ISSUED: "Token Issued",
  MINTED: "Supply Minted",
  BURNED: "Supply Burned",
  FROZEN: "Token Frozen",
  UNFROZEN: "Token Unfrozen",
  TRANSFER_DISABLED: "Transfers Disabled",
  TRANSFER_ENABLED: "Transfers Enabled",
  METADATA_UPDATED: "Metadata Updated",
  SUPPLY_CHANGED: "Supply Changed",
  DISTRIBUTED: "Tokens Distributed",
  RETIRED: "Token Retired",
};
