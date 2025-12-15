export type PaymentChannelStatus = "OPEN" | "PENDING_CLOSE" | "CLOSED";

export interface PaymentChannel {
  id: string;
  channelId: string;
  sender: string;
  senderName?: string;
  destination: string;
  destinationName?: string;
  amount: number;
  balance: number;
  settleDelay: number;
  expiration?: string;
  cancelAfter?: string;
  status: PaymentChannelStatus;
  createTxHash: string;
  closeTxHash?: string;
  createdAt: string;
  closedAt?: string;
  network: "mainnet" | "testnet" | "devnet";
  publicKey?: string;
}

export interface ChannelClaim {
  id: string;
  channelId: string;
  amount: number;
  signature: string;
  redeemed: boolean;
  redeemedAt?: string;
  createdAt: string;
}
