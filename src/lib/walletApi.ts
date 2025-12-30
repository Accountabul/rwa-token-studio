import { IssuingWallet, WalletRole, XRPLNetwork } from "@/types/token";
import { supabase } from "@/integrations/supabase/client";

export interface ProvisionWalletParams {
  name: string;
  role: WalletRole;
  network: XRPLNetwork;
  enableMultiSig: boolean;
  autoFund: boolean;
  createdBy: string;
  createdByName: string;
}

interface ProvisionWalletResponse {
  id: string;
  name: string;
  role: WalletRole;
  network: XRPLNetwork;
  status: string;
  xrplAddress: string;
  multiSignEnabled: boolean;
  permissionDexStatus: string;
  isAuthorized: boolean;
  balance: number;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  fundedAt: string | null;
  lastSyncedAt: string;
}

/**
 * Provision a new XRPL wallet via backend edge function
 */
export async function provisionWallet(params: ProvisionWalletParams): Promise<IssuingWallet> {
  const { data, error } = await supabase.functions.invoke<ProvisionWalletResponse>('provision-wallet', {
    body: params,
  });

  if (error) {
    console.error('[provisionWallet] Error:', error);
    throw new Error(error.message || 'Failed to provision wallet');
  }

  if (!data) {
    throw new Error('No data returned from provision-wallet');
  }

  // Map response to IssuingWallet type
  const wallet: IssuingWallet = {
    id: data.id,
    name: data.name,
    xrplAddress: data.xrplAddress,
    role: data.role,
    network: data.network,
    status: data.status as "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED",
    multiSignEnabled: data.multiSignEnabled,
    permissionDexStatus: data.permissionDexStatus as "NOT_LINKED" | "PENDING" | "APPROVED" | "REJECTED",
    isAuthorized: data.isAuthorized,
    balance: data.balance,
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    createdAt: data.createdAt,
    fundedAt: data.fundedAt || undefined,
    lastSyncedAt: data.lastSyncedAt,
  };

  return wallet;
}

/**
 * Fetch all wallets from the database
 */
export async function fetchWallets(): Promise<IssuingWallet[]> {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[fetchWallets] Error:', error);
    throw new Error(error.message);
  }

  return (data || []).map((row): IssuingWallet => ({
    id: row.id,
    name: row.name,
    xrplAddress: row.xrpl_address,
    role: row.role as WalletRole,
    network: row.network as XRPLNetwork,
    status: row.status as "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED",
    multiSignEnabled: row.multi_sign_enabled,
    multiSignQuorum: row.multi_sign_quorum || undefined,
    multiSignSigners: row.multi_sign_signers || undefined,
    multiSignConfigId: row.multi_sign_config_id || undefined,
    permissionDexStatus: row.permission_dex_status as "NOT_LINKED" | "PENDING" | "APPROVED" | "REJECTED",
    isAuthorized: row.is_authorized,
    balance: row.balance ? Number(row.balance) : undefined,
    createdBy: row.created_by,
    createdByName: row.created_by_name || undefined,
    createdAt: row.created_at,
    fundedAt: row.funded_at || undefined,
    lastSyncedAt: row.last_synced_at || undefined,
  }));
}
