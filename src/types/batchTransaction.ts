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

// All verified mainnet-enabled XRPL transaction types for batching
export type BatchableTxType = 
  // Account Management (5 types)
  | "AccountDelete"
  | "AccountSet"
  | "SetRegularKey"
  | "SignerListSet"
  | "DepositPreauth"
  
  // Payments (1 type)
  | "Payment"
  
  // Trust Lines (1 type)
  | "TrustSet"
  
  // DEX (2 types)
  | "OfferCreate"
  | "OfferCancel"
  
  // AMM (4 types - enabled subset)
  | "AMMBid"
  | "AMMDeposit"
  | "AMMWithdraw"
  | "AMMVote"
  
  // Escrow (3 types)
  | "EscrowCreate"
  | "EscrowFinish"
  | "EscrowCancel"
  
  // Checks (3 types)
  | "CheckCreate"
  | "CheckCash"
  | "CheckCancel"
  
  // Payment Channels (3 types)
  | "PaymentChannelCreate"
  | "PaymentChannelClaim"
  | "PaymentChannelFund"
  
  // NFTokens (5 types)
  | "NFTokenMint"
  | "NFTokenBurn"
  | "NFTokenCreateOffer"
  | "NFTokenAcceptOffer"
  | "NFTokenCancelOffer"
  
  // Tickets (1 type)
  | "TicketCreate"
  
  // Platform Custom (1 type)
  | "ContractCall";

// Transaction Categories for UI grouping
export type TxCategory = 
  | "ACCOUNT"
  | "PAYMENTS"
  | "TRUST"
  | "DEX"
  | "AMM"
  | "ESCROW"
  | "CHECKS"
  | "PAYMENT_CHANNELS"
  | "NFTOKEN"
  | "TICKETS"
  | "CUSTOM";

export const categoryLabels: Record<TxCategory, string> = {
  ACCOUNT: "Account",
  PAYMENTS: "Payments",
  TRUST: "Trust Lines",
  DEX: "DEX / Offers",
  AMM: "AMM",
  ESCROW: "Escrow",
  CHECKS: "Checks",
  PAYMENT_CHANNELS: "Payment Channels",
  NFTOKEN: "NFTokens",
  TICKETS: "Tickets",
  CUSTOM: "Custom",
};

export const categoryDescriptions: Record<TxCategory, string> = {
  ACCOUNT: "Manage account settings, keys, and signers",
  PAYMENTS: "Send XRP, IOUs, or tokens",
  TRUST: "Create or modify trust lines",
  DEX: "Create and cancel DEX offers",
  AMM: "Automated Market Maker operations",
  ESCROW: "Time-locked and conditional escrows",
  CHECKS: "Pull-based payment instruments",
  PAYMENT_CHANNELS: "Off-ledger payment channels",
  NFTOKEN: "Non-fungible token operations",
  TICKETS: "Pre-authorized transaction sequences",
  CUSTOM: "Platform-specific transactions",
};

export const txTypeToCategory: Record<BatchableTxType, TxCategory> = {
  // Account
  AccountDelete: "ACCOUNT",
  AccountSet: "ACCOUNT",
  SetRegularKey: "ACCOUNT",
  SignerListSet: "ACCOUNT",
  DepositPreauth: "ACCOUNT",
  // Payments
  Payment: "PAYMENTS",
  // Trust
  TrustSet: "TRUST",
  // DEX
  OfferCreate: "DEX",
  OfferCancel: "DEX",
  // AMM
  AMMBid: "AMM",
  AMMDeposit: "AMM",
  AMMWithdraw: "AMM",
  AMMVote: "AMM",
  // Escrow
  EscrowCreate: "ESCROW",
  EscrowFinish: "ESCROW",
  EscrowCancel: "ESCROW",
  // Checks
  CheckCreate: "CHECKS",
  CheckCash: "CHECKS",
  CheckCancel: "CHECKS",
  // Payment Channels
  PaymentChannelCreate: "PAYMENT_CHANNELS",
  PaymentChannelClaim: "PAYMENT_CHANNELS",
  PaymentChannelFund: "PAYMENT_CHANNELS",
  // NFToken
  NFTokenMint: "NFTOKEN",
  NFTokenBurn: "NFTOKEN",
  NFTokenCreateOffer: "NFTOKEN",
  NFTokenAcceptOffer: "NFTOKEN",
  NFTokenCancelOffer: "NFTOKEN",
  // Tickets
  TicketCreate: "TICKETS",
  // Custom
  ContractCall: "CUSTOM",
};

export const batchableTxTypeLabels: Record<BatchableTxType, string> = {
  // Account
  AccountDelete: "Delete Account",
  AccountSet: "Account Settings",
  SetRegularKey: "Set Regular Key",
  SignerListSet: "Set Signer List",
  DepositPreauth: "Deposit Preauth",
  // Payments
  Payment: "Payment",
  // Trust
  TrustSet: "Trust Line",
  // DEX
  OfferCreate: "Create Offer",
  OfferCancel: "Cancel Offer",
  // AMM
  AMMBid: "AMM Bid",
  AMMDeposit: "AMM Deposit",
  AMMWithdraw: "AMM Withdraw",
  AMMVote: "AMM Vote",
  // Escrow
  EscrowCreate: "Create Escrow",
  EscrowFinish: "Finish Escrow",
  EscrowCancel: "Cancel Escrow",
  // Checks
  CheckCreate: "Create Check",
  CheckCash: "Cash Check",
  CheckCancel: "Cancel Check",
  // Payment Channels
  PaymentChannelCreate: "Create Channel",
  PaymentChannelClaim: "Claim Channel",
  PaymentChannelFund: "Fund Channel",
  // NFToken
  NFTokenMint: "Mint NFT",
  NFTokenBurn: "Burn NFT",
  NFTokenCreateOffer: "Create NFT Offer",
  NFTokenAcceptOffer: "Accept NFT Offer",
  NFTokenCancelOffer: "Cancel NFT Offer",
  // Tickets
  TicketCreate: "Create Tickets",
  // Custom
  ContractCall: "Call Contract",
};

export const batchableTxTypeDescriptions: Record<BatchableTxType, string> = {
  // Account
  AccountDelete: "Delete account and transfer remaining XRP",
  AccountSet: "Modify account flags, domain, email hash, etc.",
  SetRegularKey: "Set or remove a regular key pair",
  SignerListSet: "Configure multi-signature settings",
  DepositPreauth: "Preauthorize deposits from specific accounts",
  // Payments
  Payment: "Send XRP, IOU, or MPT to a destination",
  // Trust
  TrustSet: "Create or modify a trust line",
  // DEX
  OfferCreate: "Create a DEX order",
  OfferCancel: "Cancel an existing DEX order",
  // AMM
  AMMBid: "Bid on AMM auction slot",
  AMMDeposit: "Deposit assets into an AMM pool",
  AMMWithdraw: "Withdraw assets from an AMM pool",
  AMMVote: "Vote on AMM trading fee",
  // Escrow
  EscrowCreate: "Create a time-locked escrow",
  EscrowFinish: "Complete an escrow release",
  EscrowCancel: "Cancel an escrow",
  // Checks
  CheckCreate: "Create a pull-based check",
  CheckCash: "Cash a received check",
  CheckCancel: "Cancel an issued check",
  // Payment Channels
  PaymentChannelCreate: "Open a payment channel",
  PaymentChannelClaim: "Claim from a payment channel",
  PaymentChannelFund: "Add funds to a payment channel",
  // NFToken
  NFTokenMint: "Mint a new NFT",
  NFTokenBurn: "Burn an owned NFT",
  NFTokenCreateOffer: "Create an NFT buy/sell offer",
  NFTokenAcceptOffer: "Accept an NFT offer",
  NFTokenCancelOffer: "Cancel an NFT offer",
  // Tickets
  TicketCreate: "Create tickets for future transactions",
  // Custom
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

// Helper to get all transaction types for a category
export function getTxTypesForCategory(category: TxCategory): BatchableTxType[] {
  return (Object.entries(txTypeToCategory) as [BatchableTxType, TxCategory][])
    .filter(([_, cat]) => cat === category)
    .map(([txType]) => txType);
}

// Get all categories in display order
export function getOrderedCategories(): TxCategory[] {
  return [
    "ACCOUNT",
    "PAYMENTS",
    "TRUST",
    "DEX",
    "AMM",
    "ESCROW",
    "CHECKS",
    "PAYMENT_CHANNELS",
    "NFTOKEN",
    "TICKETS",
    "CUSTOM",
  ];
}
