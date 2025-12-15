import { IssuingWallet } from "@/types/token";

export const mockWallets: IssuingWallet[] = [
  {
    id: "wallet-1",
    xrplAddress: "rAccountabulPrimary1234567890ABC",
    name: "Accountabul Primary Issuer",
    multiSignEnabled: false,
    permissionDexStatus: "APPROVED",
    isAuthorized: true,
    lastSyncedAt: "2024-01-10T14:30:00Z",
  },
  {
    id: "wallet-2",
    xrplAddress: "rAccountabulMultiSig9876543210XYZ",
    name: "Accountabul Multi-Sig Vault",
    multiSignEnabled: true,
    multiSignQuorum: 2,
    multiSignSigners: 3,
    permissionDexStatus: "APPROVED",
    isAuthorized: true,
    lastSyncedAt: "2024-01-12T09:15:00Z",
  },
  {
    id: "wallet-3",
    xrplAddress: "rPendingWallet5678901234567890DEF",
    name: "Secondary Issuer (Pending)",
    multiSignEnabled: false,
    permissionDexStatus: "PENDING",
    isAuthorized: false,
    lastSyncedAt: "2024-01-14T11:00:00Z",
  },
  {
    id: "wallet-4",
    xrplAddress: "rRejectedWallet1111222233334444GHI",
    name: "Test Wallet (Rejected)",
    multiSignEnabled: false,
    permissionDexStatus: "REJECTED",
    isAuthorized: false,
    lastSyncedAt: "2024-01-08T16:45:00Z",
  },
];
