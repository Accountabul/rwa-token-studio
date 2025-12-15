import { Role } from "./tokenization";

export type BatchAtomicityMode = 
  | "ALL_OR_NOTHING"
  | "UNTIL_FAILURE"
  | "ONLY_ONE"
  | "INDEPENDENT";

export const atomicityModeLabels: Record<BatchAtomicityMode, string> = {
  ALL_OR_NOTHING: "All or Nothing",
  UNTIL_FAILURE: "Until Failure",
  ONLY_ONE: "Only One",
  INDEPENDENT: "Independent",
};

export const atomicityModeDescriptions: Record<BatchAtomicityMode, string> = {
  ALL_OR_NOTHING: "All transactions must succeed, or all are rolled back",
  UNTIL_FAILURE: "Execute transactions in order until one fails, then stop",
  ONLY_ONE: "Only the first successful transaction is applied",
  INDEPENDENT: "Each transaction runs independently regardless of others",
};

export type BatchableTxType = 
  | "Payment"
  | "TrustSet"
  | "OfferCreate"
  | "OfferCancel"
  | "EscrowCreate"
  | "EscrowFinish"
  | "EscrowCancel"
  | "CheckCreate"
  | "CheckCash"
  | "CheckCancel"
  | "NFTokenMint"
  | "NFTokenBurn"
  | "NFTokenCreateOffer"
  | "MPTokenAuthorize"
  | "MPTokenIssuanceCreate"
  | "ContractCall";

export const batchableTxTypeLabels: Record<BatchableTxType, string> = {
  Payment: "Payment",
  TrustSet: "Trust Line",
  OfferCreate: "Create Offer",
  OfferCancel: "Cancel Offer",
  EscrowCreate: "Create Escrow",
  EscrowFinish: "Finish Escrow",
  EscrowCancel: "Cancel Escrow",
  CheckCreate: "Create Check",
  CheckCash: "Cash Check",
  CheckCancel: "Cancel Check",
  NFTokenMint: "Mint NFT",
  NFTokenBurn: "Burn NFT",
  NFTokenCreateOffer: "Create NFT Offer",
  MPTokenAuthorize: "Authorize MPT Holder",
  MPTokenIssuanceCreate: "Create MPT Issuance",
  ContractCall: "Call Contract",
};

export const batchableTxTypeDescriptions: Record<BatchableTxType, string> = {
  Payment: "Send XRP, IOU, or MPT to a destination",
  TrustSet: "Create or modify a trust line",
  OfferCreate: "Create a DEX order",
  OfferCancel: "Cancel an existing DEX order",
  EscrowCreate: "Create a time-locked escrow",
  EscrowFinish: "Complete an escrow release",
  EscrowCancel: "Cancel an escrow",
  CheckCreate: "Create a pull-based check",
  CheckCash: "Cash a received check",
  CheckCancel: "Cancel an issued check",
  NFTokenMint: "Mint a new NFT",
  NFTokenBurn: "Burn an owned NFT",
  NFTokenCreateOffer: "Create an NFT buy/sell offer",
  MPTokenAuthorize: "Authorize a holder for MPT",
  MPTokenIssuanceCreate: "Create a new MPT issuance",
  ContractCall: "Execute a smart contract function",
};

export type BatchTxStatus = "PENDING" | "SUCCESS" | "FAILED" | "SKIPPED";

export interface BatchTransaction {
  id: string;
  order: number;
  txType: BatchableTxType;
  params: Record<string, any>;
  status: BatchTxStatus;
  resultMessage?: string;
  innerTxHash?: string;
}

export type BatchStatus = "DRAFT" | "READY" | "SUBMITTED" | "COMPLETED" | "PARTIAL" | "FAILED";

export interface TransactionBatch {
  id: string;
  name: string;
  description?: string;
  atomicityMode: BatchAtomicityMode;
  
  transactions: BatchTransaction[];
  
  status: BatchStatus;
  
  outerTxHash?: string;
  successCount: number;
  failedCount: number;
  
  createdAt: string;
  submittedAt?: string;
  completedAt?: string;
  createdBy: string;
  
  network: "mainnet" | "testnet" | "devnet";
}

export function canCreateBatch(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "CUSTODY_OFFICER" || role === "TOKENIZATION_MANAGER";
}

export function canSubmitBatch(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "CUSTODY_OFFICER";
}

export function canDeleteBatch(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "CUSTODY_OFFICER";
}
