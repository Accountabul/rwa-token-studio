import { SigningErrorCode } from "@/types/custody";

/**
 * Human-readable error messages for signing error codes
 */
export const signingErrorMessages: Record<SigningErrorCode, string> = {
  WALLET_NOT_FOUND: "The selected wallet was not found or has been removed.",
  WALLET_SUSPENDED: "This wallet is suspended and cannot sign transactions. Contact an administrator.",
  WALLET_ARCHIVED: "This wallet is archived. Please use an active wallet.",
  POLICY_VIOLATION: "This transaction violates the signing policy. Check amount limits and permissions.",
  RATE_LIMIT_EXCEEDED: "Too many signing requests. Please wait a moment and try again.",
  AMOUNT_LIMIT_EXCEEDED: "Transaction amount exceeds the maximum allowed by the signing policy.",
  TX_TYPE_NOT_ALLOWED: "This transaction type is not allowed for this wallet role.",
  NETWORK_MISMATCH: "Wallet network does not match the target network for this transaction.",
  MULTI_SIGN_REQUIRED: "This transaction requires multiple signatures. It has been queued for approval.",
  VAULT_ERROR: "Key storage service error. Please try again or contact support.",
  LEGACY_MAINNET_BLOCKED: "Legacy wallets cannot sign mainnet transactions. Migrate to vault storage first.",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again.",
};

/**
 * Get a user-friendly error message for a signing error code
 */
export function getSigningErrorMessage(code: SigningErrorCode | undefined): string {
  if (!code) {
    return "An unknown error occurred during signing.";
  }
  return signingErrorMessages[code] || `Signing failed: ${code}`;
}

/**
 * Determine if an error is recoverable (user can retry)
 */
export function isRecoverableError(code: SigningErrorCode): boolean {
  const recoverableCodes: SigningErrorCode[] = [
    "RATE_LIMIT_EXCEEDED",
    "VAULT_ERROR",
    "INTERNAL_ERROR",
  ];
  return recoverableCodes.includes(code);
}

/**
 * Determine if an error requires admin intervention
 */
export function requiresAdminAction(code: SigningErrorCode): boolean {
  const adminRequiredCodes: SigningErrorCode[] = [
    "WALLET_SUSPENDED",
    "WALLET_ARCHIVED",
    "POLICY_VIOLATION",
    "LEGACY_MAINNET_BLOCKED",
  ];
  return adminRequiredCodes.includes(code);
}

/**
 * Get suggested action for an error
 */
export function getSuggestedAction(code: SigningErrorCode): string {
  switch (code) {
    case "WALLET_NOT_FOUND":
      return "Select a different wallet or refresh the wallet list.";
    case "WALLET_SUSPENDED":
      return "Contact a Custody Officer to reactivate the wallet.";
    case "WALLET_ARCHIVED":
      return "Select an active wallet to proceed.";
    case "POLICY_VIOLATION":
      return "Review the signing policy or request a policy exception.";
    case "RATE_LIMIT_EXCEEDED":
      return "Wait 60 seconds before trying again.";
    case "AMOUNT_LIMIT_EXCEEDED":
      return "Reduce the transaction amount or request a higher limit.";
    case "TX_TYPE_NOT_ALLOWED":
      return "Use a wallet with the appropriate role for this transaction type.";
    case "NETWORK_MISMATCH":
      return "Select a wallet on the correct network.";
    case "MULTI_SIGN_REQUIRED":
      return "The transaction has been queued for multi-signature approval.";
    case "VAULT_ERROR":
      return "Try again in a few moments. If the issue persists, contact support.";
    case "LEGACY_MAINNET_BLOCKED":
      return "Migrate this wallet to vault storage before signing mainnet transactions.";
    case "INTERNAL_ERROR":
      return "Try again. If the issue persists, contact support.";
    default:
      return "Contact support for assistance.";
  }
}
