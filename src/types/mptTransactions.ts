import { Role } from "./tokenization";

export type MPTTransactionType =
  | "MPTokenIssuanceCreate"
  | "MPTokenAuthorize"
  | "MPTokenIssuanceDestroy"
  | "MPTokenIssuanceSet"
  | "Payment"
  | "Clawback";

export interface MPTTransaction {
  id: string;
  type: MPTTransactionType;
  txHash: string;
  timestamp: string;
  actor: string;
  actorRole: Role;
  details: {
    destination?: string;
    amount?: number;
    reason?: string;
    lockType?: "global" | "individual";
    isLocked?: boolean;
  };
}

export interface AuthorizedHolder {
  id: string;
  address: string;
  authorizedAt: string;
  authorizedBy: string;
  status: "AUTHORIZED" | "REVOKED";
  revokedAt?: string;
}

export interface TokenDistribution {
  id: string;
  destination: string;
  amount: number;
  memo?: string;
  txHash: string;
  timestamp: string;
  distributedBy: string;
}

export interface TokenBalance {
  totalIssued: number;
  circulating: number;
  locked: number;
  escrowed: number;
}
