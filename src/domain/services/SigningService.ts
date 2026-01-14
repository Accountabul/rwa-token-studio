import { supabase } from "@/integrations/supabase/client";
import { SigningRequest, SigningResponse, SigningAuditEntry } from "@/types/custody";
import { XRPLNetwork } from "@/types/token";

/**
 * Client-side service for transaction signing operations
 * Routes all signing requests through the sign-transaction edge function
 */
export class SigningService {
  /**
   * Sign a transaction via the secure signing service
   * @param request - The signing request containing wallet, tx type, and unsigned blob
   * @returns SigningResponse with signed blob or error
   */
  async signTransaction(request: SigningRequest): Promise<SigningResponse> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return {
        success: false,
        error: "Authentication required",
        errorCode: "INTERNAL_ERROR",
        auditLogId: "",
      };
    }

    const { data, error } = await supabase.functions.invoke("sign-transaction", {
      body: request,
    });

    if (error) {
      console.error("[SigningService] Edge function error:", error);
      return {
        success: false,
        error: error.message || "Signing service unavailable",
        errorCode: "INTERNAL_ERROR",
        auditLogId: "",
      };
    }

    return data as SigningResponse;
  }

  /**
   * Submit a signed transaction to the XRPL network
   * @param signedTxBlob - The signed transaction blob
   * @param network - Target XRPL network
   * @returns Submission result with tx hash and status
   */
  async submitSignedTransaction(
    signedTxBlob: string,
    network: XRPLNetwork
  ): Promise<{
    success: boolean;
    txHash?: string;
    resultCode?: string;
    error?: string;
  }> {
    // In production, this would submit to XRPL via edge function
    // For now, return mock success
    console.log("[SigningService] Would submit to", network, ":", signedTxBlob.substring(0, 20) + "...");
    
    return {
      success: true,
      txHash: `MOCK_${Date.now().toString(16).toUpperCase()}`,
      resultCode: "tesSUCCESS",
    };
  }

  /**
   * Get signing audit history for a wallet
   * @param walletId - The wallet ID to query
   * @param limit - Max number of records to return
   */
  async getSigningHistory(
    walletId: string,
    limit: number = 50
  ): Promise<SigningAuditEntry[]> {
    const { data, error } = await supabase
      .from("signing_audit_log")
      .select("*")
      .eq("wallet_id", walletId)
      .order("signed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[SigningService] Error fetching signing history:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      walletId: row.wallet_id || "",
      walletAddress: row.wallet_address,
      txType: row.tx_type,
      txHash: row.tx_hash || undefined,
      unsignedTxHash: row.unsigned_tx_hash,
      keyStorageType: row.key_storage_type as SigningAuditEntry["keyStorageType"],
      policyId: row.policy_id || undefined,
      policyName: row.policy_name || undefined,
      requestedBy: row.requested_by,
      requestedByName: row.requested_by_name || undefined,
      requestedByRole: row.requested_by_role || undefined,
      amount: row.amount ? Number(row.amount) : undefined,
      currency: row.currency || undefined,
      destination: row.destination || undefined,
      destinationName: row.destination_name || undefined,
      status: row.status as SigningAuditEntry["status"],
      rejectionReason: row.rejection_reason || undefined,
      errorMessage: row.error_message || undefined,
      network: row.network as XRPLNetwork,
      signedAt: row.signed_at || new Date().toISOString(),
      submittedAt: row.submitted_at || undefined,
      confirmedAt: row.confirmed_at || undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
    }));
  }

  /**
   * Get recent signing activity across all wallets (for admins)
   * @param limit - Max number of records
   */
  async getRecentSigningActivity(limit: number = 100): Promise<SigningAuditEntry[]> {
    const { data, error } = await supabase
      .from("signing_audit_log")
      .select("*")
      .order("signed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[SigningService] Error fetching recent activity:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      walletId: row.wallet_id || "",
      walletAddress: row.wallet_address,
      txType: row.tx_type,
      txHash: row.tx_hash || undefined,
      unsignedTxHash: row.unsigned_tx_hash,
      keyStorageType: row.key_storage_type as SigningAuditEntry["keyStorageType"],
      policyId: row.policy_id || undefined,
      policyName: row.policy_name || undefined,
      requestedBy: row.requested_by,
      requestedByName: row.requested_by_name || undefined,
      requestedByRole: row.requested_by_role || undefined,
      amount: row.amount ? Number(row.amount) : undefined,
      currency: row.currency || undefined,
      destination: row.destination || undefined,
      destinationName: row.destination_name || undefined,
      status: row.status as SigningAuditEntry["status"],
      rejectionReason: row.rejection_reason || undefined,
      errorMessage: row.error_message || undefined,
      network: row.network as XRPLNetwork,
      signedAt: row.signed_at || new Date().toISOString(),
      submittedAt: row.submitted_at || undefined,
      confirmedAt: row.confirmed_at || undefined,
      metadata: row.metadata as Record<string, unknown> | undefined,
    }));
  }
}

// Default singleton instance
export const signingService = new SigningService();
