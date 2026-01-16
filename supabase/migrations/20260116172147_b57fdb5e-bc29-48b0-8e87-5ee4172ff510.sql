-- Fix wallets_safe view to use SECURITY INVOKER instead of SECURITY DEFINER
-- This ensures the view respects the calling user's permissions

-- Drop and recreate the view with security_invoker option
DROP VIEW IF EXISTS public.wallets_safe;

CREATE VIEW public.wallets_safe 
WITH (security_invoker = on)
AS SELECT 
    id,
    name,
    xrpl_address,
    public_key,
    role,
    network,
    status,
    balance,
    is_authorized,
    permission_dex_status,
    multi_sign_enabled,
    multi_sign_quorum,
    multi_sign_signers,
    multi_sign_config_id,
    can_issue_tokens,
    can_freeze,
    can_clawback,
    can_authorize_holders,
    can_create_escrows,
    can_create_channels,
    can_manage_amm,
    can_mint_nfts,
    requires_destination_tag,
    identity_verified,
    kyc_binding_id,
    vc_issuer_capable,
    did_method,
    did_document,
    verifiable_credentials,
    tags,
    description,
    purpose_code,
    business_unit,
    asset_class,
    jurisdiction,
    risk_tier,
    review_frequency,
    external_ref_id,
    expiration_date,
    project_ids,
    created_at,
    created_by,
    created_by_name,
    funded_at,
    last_synced_at,
    key_storage_type,
    vault_key_ref,
    legacy_seed_archived_at
FROM public.wallets;

-- Update the RLS policy on wallets table to allow SELECT via the safe view
-- The current policy blocks all SELECT which would also block the invoker view
DROP POLICY IF EXISTS "No direct wallet SELECT - use wallets_safe view" ON public.wallets;

-- Create a policy that allows authorized roles to SELECT (the view will now respect this)
CREATE POLICY "Authorized roles can view wallets via safe view"
ON public.wallets
FOR SELECT
USING (has_wallet_role(auth.uid()) OR is_admin(auth.uid()));

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.wallets_safe TO authenticated;