import { 
  IssuingWallet, 
  WalletRole, 
  XRPLNetwork, 
  PurposeCode, 
  RiskTier, 
  ReviewFrequency,
  DIDMethod,
  VerifiableCredentialType,
} from "@/types/token";
import { KeyStorageType } from "@/types/custody";
import { supabase } from "@/integrations/supabase/client";

export interface ProvisionWalletParams {
  name: string;
  role: WalletRole;
  network: XRPLNetwork;
  enableMultiSig: boolean;
  autoFund: boolean;
  createdBy: string;
  createdByName: string;
  // Key storage configuration
  keyStorageType?: KeyStorageType;
  // Extended fields
  description?: string;
  tags?: string[];
  purposeCode?: PurposeCode;
  riskTier?: RiskTier;
  reviewFrequency?: ReviewFrequency;
  businessUnit?: string;
  jurisdiction?: string;
  assetClass?: string;
  contactEmail?: string;
  contactPhone?: string;
  externalRefId?: string;
  // Identity
  didMethod?: DIDMethod;
  verifiableCredentials?: VerifiableCredentialType[];
  vcIssuerCapable?: boolean;
  // Capabilities
  canIssueTokens?: boolean;
  canMintNfts?: boolean;
  canClawback?: boolean;
  canFreeze?: boolean;
  canCreateEscrows?: boolean;
  canManageAmm?: boolean;
  canCreateChannels?: boolean;
  canAuthorizeHolders?: boolean;
  requiresDestinationTag?: boolean;
  // Multi-sig
  multiSignQuorum?: number;
  multiSignSigners?: number;
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
  keyStorageType?: KeyStorageType;
  vaultKeyRef?: string;
}

export interface UpdateWalletParams {
  name?: string;
  description?: string;
  role?: WalletRole;
  purposeCode?: PurposeCode;
  riskTier?: RiskTier;
  reviewFrequency?: ReviewFrequency;
  businessUnit?: string;
  jurisdiction?: string;
  assetClass?: string;
  contactEmail?: string;
  contactPhone?: string;
  externalRefId?: string;
  tags?: string[];
  // Identity
  didMethod?: DIDMethod;
  verifiableCredentials?: VerifiableCredentialType[];
  vcIssuerCapable?: boolean;
  // Capabilities
  canIssueTokens?: boolean;
  canMintNfts?: boolean;
  canClawback?: boolean;
  canFreeze?: boolean;
  canCreateEscrows?: boolean;
  canManageAmm?: boolean;
  canCreateChannels?: boolean;
  canAuthorizeHolders?: boolean;
  requiresDestinationTag?: boolean;
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
    keyStorageType: 'LEGACY_DB', // New wallets from current edge function are legacy until vault integration
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
 * Update an existing wallet
 */
export async function updateWallet(walletId: string, updates: UpdateWalletParams): Promise<IssuingWallet> {
  // Convert camelCase to snake_case for database
  const dbUpdates: Record<string, unknown> = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.role !== undefined) dbUpdates.role = updates.role;
  if (updates.purposeCode !== undefined) dbUpdates.purpose_code = updates.purposeCode;
  if (updates.riskTier !== undefined) dbUpdates.risk_tier = updates.riskTier;
  if (updates.reviewFrequency !== undefined) dbUpdates.review_frequency = updates.reviewFrequency;
  if (updates.businessUnit !== undefined) dbUpdates.business_unit = updates.businessUnit;
  if (updates.jurisdiction !== undefined) dbUpdates.jurisdiction = updates.jurisdiction;
  if (updates.assetClass !== undefined) dbUpdates.asset_class = updates.assetClass;
  if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail;
  if (updates.contactPhone !== undefined) dbUpdates.contact_phone = updates.contactPhone;
  if (updates.externalRefId !== undefined) dbUpdates.external_ref_id = updates.externalRefId;
  if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
  // Identity
  if (updates.didMethod !== undefined) dbUpdates.did_method = updates.didMethod;
  if (updates.verifiableCredentials !== undefined) dbUpdates.verifiable_credentials = updates.verifiableCredentials;
  if (updates.vcIssuerCapable !== undefined) dbUpdates.vc_issuer_capable = updates.vcIssuerCapable;
  // Capabilities
  if (updates.canIssueTokens !== undefined) dbUpdates.can_issue_tokens = updates.canIssueTokens;
  if (updates.canMintNfts !== undefined) dbUpdates.can_mint_nfts = updates.canMintNfts;
  if (updates.canClawback !== undefined) dbUpdates.can_clawback = updates.canClawback;
  if (updates.canFreeze !== undefined) dbUpdates.can_freeze = updates.canFreeze;
  if (updates.canCreateEscrows !== undefined) dbUpdates.can_create_escrows = updates.canCreateEscrows;
  if (updates.canManageAmm !== undefined) dbUpdates.can_manage_amm = updates.canManageAmm;
  if (updates.canCreateChannels !== undefined) dbUpdates.can_create_channels = updates.canCreateChannels;
  if (updates.canAuthorizeHolders !== undefined) dbUpdates.can_authorize_holders = updates.canAuthorizeHolders;
  if (updates.requiresDestinationTag !== undefined) dbUpdates.requires_destination_tag = updates.requiresDestinationTag;

  const { data, error } = await supabase
    .from('wallets')
    .update(dbUpdates)
    .eq('id', walletId)
    .select()
    .single();

  if (error) {
    console.error('[updateWallet] Error:', error);
    throw new Error(error.message);
  }

  return mapRowToWallet(data);
}

/**
 * Fetch all wallets from the database
 * Uses wallets_safe view to exclude sensitive fields (encrypted_seed, contact PII)
 */
export async function fetchWallets(): Promise<IssuingWallet[]> {
  // Query the secure view that excludes encrypted_seed and contact PII
  const { data, error } = await supabase
    .from('wallets_safe' as 'wallets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[fetchWallets] Error:', error);
    throw new Error(error.message);
  }

  return (data || []).map(mapRowToWallet);
}

/**
 * Fetch a single wallet by ID
 * Uses wallets_safe view to exclude sensitive fields (encrypted_seed, contact PII)
 */
export async function fetchWalletById(walletId: string): Promise<IssuingWallet | null> {
  // Query the secure view that excludes encrypted_seed and contact PII
  const { data, error } = await supabase
    .from('wallets_safe' as 'wallets')
    .select('*')
    .eq('id', walletId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('[fetchWalletById] Error:', error);
    throw new Error(error.message);
  }

  return data ? mapRowToWallet(data) : null;
}

/**
 * Map database row to IssuingWallet type
 */
function mapRowToWallet(row: Record<string, unknown>): IssuingWallet {
  return {
    id: row.id as string,
    name: row.name as string,
    xrplAddress: row.xrpl_address as string,
    role: row.role as WalletRole,
    network: row.network as XRPLNetwork,
    status: row.status as "PROVISIONING" | "ACTIVE" | "SUSPENDED" | "ARCHIVED",
    multiSignEnabled: row.multi_sign_enabled as boolean,
    multiSignQuorum: (row.multi_sign_quorum as number) || undefined,
    multiSignSigners: (row.multi_sign_signers as number) || undefined,
    multiSignConfigId: (row.multi_sign_config_id as string) || undefined,
    permissionDexStatus: row.permission_dex_status as "NOT_LINKED" | "PENDING" | "APPROVED" | "REJECTED",
    isAuthorized: row.is_authorized as boolean,
    // Custody Layer (NEW)
    keyStorageType: (row.key_storage_type as KeyStorageType) || 'LEGACY_DB',
    vaultKeyRef: (row.vault_key_ref as string) || undefined,
    legacySeedArchivedAt: (row.legacy_seed_archived_at as string) || undefined,
    // Provisioning metadata
    balance: row.balance ? Number(row.balance) : undefined,
    createdBy: row.created_by as string,
    createdByName: (row.created_by_name as string) || undefined,
    createdAt: row.created_at as string,
    fundedAt: (row.funded_at as string) || undefined,
    lastSyncedAt: (row.last_synced_at as string) || undefined,
    // Identity Layer
    didDocument: (row.did_document as string) || undefined,
    didMethod: (row.did_method as DIDMethod) || undefined,
    verifiableCredentials: (row.verifiable_credentials as VerifiableCredentialType[]) || undefined,
    vcIssuerCapable: (row.vc_issuer_capable as boolean) || undefined,
    kycBindingId: (row.kyc_binding_id as string) || undefined,
    identityVerified: (row.identity_verified as boolean) || undefined,
    // Capabilities Layer
    canIssueTokens: (row.can_issue_tokens as boolean) || undefined,
    canMintNfts: (row.can_mint_nfts as boolean) || undefined,
    canClawback: (row.can_clawback as boolean) || undefined,
    canFreeze: (row.can_freeze as boolean) || undefined,
    canCreateEscrows: (row.can_create_escrows as boolean) || undefined,
    canManageAmm: (row.can_manage_amm as boolean) || undefined,
    canCreateChannels: (row.can_create_channels as boolean) || undefined,
    canAuthorizeHolders: (row.can_authorize_holders as boolean) || undefined,
    requiresDestinationTag: (row.requires_destination_tag as boolean) || undefined,
    // Classification Layer
    tags: (row.tags as string[]) || undefined,
    purposeCode: (row.purpose_code as PurposeCode) || undefined,
    businessUnit: (row.business_unit as string) || undefined,
    projectIds: (row.project_ids as string[]) || undefined,
    assetClass: (row.asset_class as string) || undefined,
    jurisdiction: (row.jurisdiction as string) || undefined,
    // Metadata Layer
    description: (row.description as string) || undefined,
    contactEmail: (row.contact_email as string) || undefined,
    contactPhone: (row.contact_phone as string) || undefined,
    expirationDate: (row.expiration_date as string) || undefined,
    reviewFrequency: (row.review_frequency as ReviewFrequency) || undefined,
    riskTier: (row.risk_tier as RiskTier) || undefined,
    externalRefId: (row.external_ref_id as string) || undefined,
  };
}
