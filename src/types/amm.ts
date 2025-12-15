export interface AMMAsset {
  currency: string;
  issuer?: string;
  amount: number;
}

export interface AMMPool {
  id: string;
  poolId: string;
  asset1: AMMAsset;
  asset2: AMMAsset;
  lpTokenId: string;
  lpTokenSupply: number;
  tradingFee: number;
  totalValueLockedUsd: number;
  volume24hUsd: number;
  apy: number;
  createdAt: string;
  createTxHash: string;
  network: "mainnet" | "testnet" | "devnet";
}

export interface LPPosition {
  id: string;
  poolId: string;
  investorId: string;
  lpTokenBalance: number;
  sharePercentage: number;
  asset1Amount: number;
  asset2Amount: number;
  valueUsd: number;
  entryValueUsd: number;
  pnlUsd: number;
  acquiredAt: string;
}

export type AMMOperationType = "DEPOSIT" | "WITHDRAW" | "VOTE" | "BID";

export interface AMMTransaction {
  id: string;
  poolId: string;
  type: AMMOperationType;
  actor: string;
  asset1Delta: number;
  asset2Delta: number;
  lpTokenDelta: number;
  txHash: string;
  timestamp: string;
}
