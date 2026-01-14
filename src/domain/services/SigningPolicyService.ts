import { supabase } from "@/integrations/supabase/client";
import { SigningPolicy } from "@/types/custody";
import { WalletRole, XRPLNetwork } from "@/types/token";

/**
 * Service for managing signing policies
 */
export class SigningPolicyService {
  /**
   * Fetch all signing policies
   */
  async getPolicies(): Promise<SigningPolicy[]> {
    const { data, error } = await supabase
      .from("signing_policies")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[SigningPolicyService] Error fetching policies:", error);
      throw new Error("Failed to fetch signing policies");
    }

    return (data || []).map(this.mapRowToPolicy);
  }

  /**
   * Fetch a single policy by ID
   */
  async getPolicy(id: string): Promise<SigningPolicy | null> {
    const { data, error } = await supabase
      .from("signing_policies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      console.error("[SigningPolicyService] Error fetching policy:", error);
      throw new Error("Failed to fetch signing policy");
    }

    return this.mapRowToPolicy(data);
  }

  /**
   * Create a new signing policy
   */
  async createPolicy(policy: Omit<SigningPolicy, "id" | "createdAt" | "updatedAt">): Promise<SigningPolicy> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from("signing_policies")
      .insert({
        policy_name: policy.policyName,
        description: policy.description,
        wallet_roles: policy.walletRoles,
        network: policy.network,
        allowed_tx_types: policy.allowedTxTypes,
        max_amount_xrp: policy.maxAmountXrp,
        max_daily_txs: policy.maxDailyTxs,
        requires_multi_sign: policy.requiresMultiSign,
        min_signers: policy.minSigners,
        rate_limit_per_minute: policy.rateLimitPerMinute,
        is_active: policy.isActive,
        created_by: userData?.user?.id,
      })
      .select()
      .single();

    if (error) {
      console.error("[SigningPolicyService] Error creating policy:", error);
      throw new Error("Failed to create signing policy");
    }

    return this.mapRowToPolicy(data);
  }

  /**
   * Update an existing signing policy
   */
  async updatePolicy(id: string, updates: Partial<SigningPolicy>): Promise<SigningPolicy> {
    const { data: userData } = await supabase.auth.getUser();

    const updatePayload: Record<string, unknown> = {
      updated_by: userData?.user?.id,
    };

    if (updates.policyName !== undefined) updatePayload.policy_name = updates.policyName;
    if (updates.description !== undefined) updatePayload.description = updates.description;
    if (updates.walletRoles !== undefined) updatePayload.wallet_roles = updates.walletRoles;
    if (updates.network !== undefined) updatePayload.network = updates.network;
    if (updates.allowedTxTypes !== undefined) updatePayload.allowed_tx_types = updates.allowedTxTypes;
    if (updates.maxAmountXrp !== undefined) updatePayload.max_amount_xrp = updates.maxAmountXrp;
    if (updates.maxDailyTxs !== undefined) updatePayload.max_daily_txs = updates.maxDailyTxs;
    if (updates.requiresMultiSign !== undefined) updatePayload.requires_multi_sign = updates.requiresMultiSign;
    if (updates.minSigners !== undefined) updatePayload.min_signers = updates.minSigners;
    if (updates.rateLimitPerMinute !== undefined) updatePayload.rate_limit_per_minute = updates.rateLimitPerMinute;
    if (updates.isActive !== undefined) updatePayload.is_active = updates.isActive;

    const { data, error } = await supabase
      .from("signing_policies")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[SigningPolicyService] Error updating policy:", error);
      throw new Error("Failed to update signing policy");
    }

    return this.mapRowToPolicy(data);
  }

  /**
   * Delete a signing policy
   */
  async deletePolicy(id: string): Promise<void> {
    const { error } = await supabase
      .from("signing_policies")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("[SigningPolicyService] Error deleting policy:", error);
      throw new Error("Failed to delete signing policy");
    }
  }

  /**
   * Toggle policy active status
   */
  async togglePolicyActive(id: string, isActive: boolean): Promise<void> {
    await this.updatePolicy(id, { isActive });
  }

  private mapRowToPolicy(row: Record<string, unknown>): SigningPolicy {
    return {
      id: row.id as string,
      policyName: row.policy_name as string,
      description: (row.description as string) || undefined,
      walletRoles: (row.wallet_roles as WalletRole[]) || [],
      network: row.network as XRPLNetwork,
      allowedTxTypes: (row.allowed_tx_types as string[]) || [],
      maxAmountXrp: row.max_amount_xrp as number | undefined,
      maxDailyTxs: row.max_daily_txs as number | undefined,
      requiresMultiSign: (row.requires_multi_sign as boolean) || false,
      minSigners: (row.min_signers as number) || 1,
      rateLimitPerMinute: (row.rate_limit_per_minute as number) || 60,
      isActive: (row.is_active as boolean) ?? true,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }
}

export const signingPolicyService = new SigningPolicyService();
