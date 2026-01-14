import { BatchableTxType } from "@/types/batchTransaction";
import { IssuingWallet, XRPLNetwork } from "@/types/token";

/**
 * Represents an unsigned XRPL transaction ready for signing
 */
export interface UnsignedTransaction {
  txBlob: string;
  txHash: string;
  txType: BatchableTxType;
  amount?: number;
  currency?: string;
  destination?: string;
  destinationName?: string;
  network: XRPLNetwork;
}

/**
 * Validation result for transaction parameters
 */
export interface TransactionValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Generate a mock transaction hash (SHA-512 first half simulation)
 * In production, this would use proper XRPL hashing
 */
export function hashUnsignedTransaction(txBlob: string): string {
  // Generate deterministic mock hash from blob
  let hash = 0;
  for (let i = 0; i < txBlob.length; i++) {
    const char = txBlob.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hexHash = Math.abs(hash).toString(16).toUpperCase().padStart(16, '0');
  return hexHash.repeat(4); // 64 char hash
}

/**
 * Build an unsigned XRPL transaction blob from parameters
 * NOTE: Phase 3 returns mock blobs. Real XRPL serialization comes in Phase 6.
 */
export function buildUnsignedTransaction(
  txType: BatchableTxType,
  params: Record<string, unknown>,
  sourceWallet: IssuingWallet
): UnsignedTransaction {
  // Build mock transaction object matching XRPL format
  const baseTx = {
    Account: sourceWallet.xrplAddress,
    TransactionType: txType,
    Fee: "12", // Standard fee in drops
    Sequence: 0, // Will be filled by XRPL
    ...params,
  };

  // Extract amount/currency/destination for signing service
  let amount: number | undefined;
  let currency: string | undefined;
  let destination: string | undefined;
  let destinationName: string | undefined;

  // Parse common fields
  if (params.Amount) {
    if (typeof params.Amount === "string") {
      amount = parseInt(params.Amount, 10) / 1_000_000; // Drops to XRP
      currency = "XRP";
    } else if (typeof params.Amount === "object" && params.Amount !== null) {
      const amtObj = params.Amount as { value?: string; currency?: string };
      amount = parseFloat(amtObj.value || "0");
      currency = amtObj.currency || "UNKNOWN";
    }
  }

  if (params.Destination) {
    destination = params.Destination as string;
    destinationName = (params.DestinationName as string) || undefined;
  }

  // Serialize to mock blob (in production, use xrpl-codec)
  const txBlob = `MOCK_${txType}_${JSON.stringify(baseTx).substring(0, 100)}`;
  const txHash = hashUnsignedTransaction(txBlob);

  return {
    txBlob,
    txHash,
    txType,
    amount,
    currency,
    destination,
    destinationName,
    network: sourceWallet.network,
  };
}

/**
 * Validate transaction parameters before signing
 */
export function validateTransactionParams(
  txType: BatchableTxType,
  params: Record<string, unknown>
): TransactionValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Common validations
  switch (txType) {
    case "Payment":
      if (!params.Destination) {
        errors.push("Destination address is required");
      }
      if (!params.Amount) {
        errors.push("Amount is required");
      }
      break;

    case "EscrowCreate":
      if (!params.Destination) {
        errors.push("Destination address is required");
      }
      if (!params.Amount) {
        errors.push("Escrow amount is required");
      }
      if (!params.FinishAfter && !params.CancelAfter) {
        warnings.push("Consider setting FinishAfter or CancelAfter conditions");
      }
      break;

    case "TrustSet":
      if (!params.LimitAmount) {
        errors.push("Trust limit amount is required");
      }
      break;

    case "OfferCreate":
      if (!params.TakerGets) {
        errors.push("TakerGets amount is required");
      }
      if (!params.TakerPays) {
        errors.push("TakerPays amount is required");
      }
      break;

    case "NFTokenMint":
      if (!params.URI) {
        warnings.push("Consider adding a URI to the NFT");
      }
      break;

    case "CheckCreate":
      if (!params.Destination) {
        errors.push("Check destination is required");
      }
      if (!params.SendMax) {
        errors.push("Check maximum amount is required");
      }
      break;

    case "PaymentChannelCreate":
      if (!params.Destination) {
        errors.push("Channel destination is required");
      }
      if (!params.Amount) {
        errors.push("Channel amount is required");
      }
      if (!params.SettleDelay) {
        errors.push("Settle delay is required");
      }
      break;

    default:
      // Other transaction types - basic validation passes
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Build multiple unsigned transactions for a batch
 */
export function buildBatchTransactions(
  transactions: Array<{ txType: BatchableTxType; params: Record<string, unknown> }>,
  sourceWallet: IssuingWallet
): UnsignedTransaction[] {
  return transactions.map(({ txType, params }) =>
    buildUnsignedTransaction(txType, params, sourceWallet)
  );
}

/**
 * Estimate total fees for a batch (in drops)
 */
export function estimateBatchFees(transactionCount: number): number {
  const baseFee = 12; // Standard XRPL fee in drops
  const batchOverhead = 10; // Additional overhead per tx in batch
  return transactionCount * (baseFee + batchOverhead);
}
