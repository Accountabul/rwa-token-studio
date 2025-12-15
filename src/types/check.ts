export type CheckStatus = "PENDING" | "CASHED" | "CANCELLED" | "EXPIRED";

export interface Check {
  id: string;
  checkId: string;
  sender: string;
  senderName?: string;
  destination: string;
  destinationName?: string;
  amount: number;
  currency: string;
  currencyIssuer?: string;
  expiration?: string;
  invoiceId?: string;
  status: CheckStatus;
  createTxHash: string;
  cashTxHash?: string;
  cancelTxHash?: string;
  createdAt: string;
  cashedAt?: string;
  cancelledAt?: string;
  network: "mainnet" | "testnet" | "devnet";
  linkedInvestorId?: string;
  linkedProjectId?: string;
}
