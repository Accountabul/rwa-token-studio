export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";
export type AccreditationStatus = "ACCREDITED" | "NON_ACCREDITED" | "N_A";
export type PermissionDexStatus = "NOT_LINKED" | "PENDING" | "APPROVED" | "REJECTED";
export type ApplicationStatus =
  | "APPLIED"
  | "KYC_REQUIRED"
  | "KYC_APPROVED"
  | "PD_REQUIRED"
  | "READY_FOR_FUNDING"
  | "FUNDED"
  | "TOKENS_ISSUED";

export interface Investor {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  kycStatus: KycStatus;
  accreditationStatus: AccreditationStatus;
}

export interface InvestorWallet {
  id: string;
  investorId: string;
  xrplAddress: string;
  permissionDexStatus: PermissionDexStatus;
  createdAt: string;
  lastSyncAt: string | null;
}

export interface InvestorApplication {
  id: string;
  investorId: string;
  projectId: string;
  projectName: string;
  walletId: string;
  requestedAllocation: number;
  approvedAllocation: number | null;
  status: ApplicationStatus;
  createdAt: string;
}

export const kycStatusLabel: Record<KycStatus, string> = {
  PENDING: "KYC Pending",
  APPROVED: "KYC Approved",
  REJECTED: "KYC Rejected",
};

export const accreditationLabel: Record<AccreditationStatus, string> = {
  ACCREDITED: "Accredited",
  NON_ACCREDITED: "Non-Accredited",
  N_A: "N/A",
};

export const permissionDexLabel: Record<PermissionDexStatus, string> = {
  NOT_LINKED: "Not Linked",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  KYC_REQUIRED: "KYC Required",
  KYC_APPROVED: "KYC Approved",
  PD_REQUIRED: "PermissionDEX Required",
  READY_FOR_FUNDING: "Ready for Funding",
  FUNDED: "Funded",
  TOKENS_ISSUED: "Tokens Issued",
};

export const canParticipate = (
  investor: Investor,
  wallet: InvestorWallet
): boolean => {
  return (
    investor.kycStatus === "APPROVED" &&
    wallet.permissionDexStatus === "APPROVED"
  );
};

export const getBlockedReason = (
  investor: Investor,
  wallet: InvestorWallet
): string | null => {
  if (investor.kycStatus !== "APPROVED") {
    return `KYC status is ${kycStatusLabel[investor.kycStatus]}`;
  }
  if (wallet.permissionDexStatus !== "APPROVED") {
    return `Wallet PermissionDEX status is ${permissionDexLabel[wallet.permissionDexStatus]}`;
  }
  return null;
};
