-- Phase 0: Custodial Wallet Security Lockdown

-- Add key storage type enum concept via text column with check
ALTER TABLE public.wallets 
  ADD COLUMN IF NOT EXISTS key_storage_type TEXT DEFAULT 'LEGACY_DB' 
    CHECK (key_storage_type IN ('LEGACY_DB', 'VAULT', 'HSM', 'EXTERNAL'));

-- Add vault key reference column
ALTER TABLE public.wallets 
  ADD COLUMN IF NOT EXISTS vault_key_ref TEXT;

-- Add legacy seed archival tracking
ALTER TABLE public.wallets 
  ADD COLUMN IF NOT EXISTS legacy_seed_archived_at TIMESTAMPTZ;

-- Mark all existing wallets as LEGACY_DB
UPDATE public.wallets SET key_storage_type = 'LEGACY_DB' WHERE key_storage_type IS NULL;

-- Create signing policies table
CREATE TABLE IF NOT EXISTS public.signing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL UNIQUE,
  description TEXT,
  wallet_roles TEXT[] NOT NULL DEFAULT '{}',
  network TEXT NOT NULL CHECK (network IN ('testnet', 'mainnet', 'devnet')),
  allowed_tx_types TEXT[] NOT NULL DEFAULT '{}',
  max_amount_xrp NUMERIC,
  max_daily_txs INTEGER,
  requires_multi_sign BOOLEAN DEFAULT false,
  min_signers INTEGER DEFAULT 1,
  rate_limit_per_minute INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS on signing_policies
ALTER TABLE public.signing_policies ENABLE ROW LEVEL SECURITY;

-- Only admins can manage signing policies
CREATE POLICY "Admins can view signing policies"
  ON public.signing_policies FOR SELECT
  USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'CUSTODY_OFFICER'::app_role));

CREATE POLICY "Admins can create signing policies"
  ON public.signing_policies FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update signing policies"
  ON public.signing_policies FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete signing policies"
  ON public.signing_policies FOR DELETE
  USING (is_admin(auth.uid()));

-- Create signing audit log table
CREATE TABLE IF NOT EXISTS public.signing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id),
  wallet_address TEXT NOT NULL,
  tx_type TEXT NOT NULL,
  tx_hash TEXT,
  unsigned_tx_hash TEXT NOT NULL,
  key_storage_type TEXT NOT NULL,
  policy_id UUID REFERENCES public.signing_policies(id),
  policy_name TEXT,
  requested_by UUID NOT NULL,
  requested_by_name TEXT,
  requested_by_role TEXT,
  amount NUMERIC,
  currency TEXT,
  destination TEXT,
  destination_name TEXT,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'SIGNED', 'REJECTED', 'FAILED', 'SUBMITTED', 'CONFIRMED')),
  rejection_reason TEXT,
  error_message TEXT,
  network TEXT NOT NULL,
  signed_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on signing_audit_log
ALTER TABLE public.signing_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies - security/compliance can view, only service role can insert
CREATE POLICY "Security roles can view signing audit"
  ON public.signing_audit_log FOR SELECT
  USING (
    is_admin(auth.uid()) 
    OR has_role(auth.uid(), 'COMPLIANCE_OFFICER'::app_role) 
    OR has_role(auth.uid(), 'AUDITOR'::app_role)
    OR has_role(auth.uid(), 'CUSTODY_OFFICER'::app_role)
    OR has_role(auth.uid(), 'SECURITY_ENGINEER'::app_role)
  );

CREATE POLICY "Service role can insert signing audit"
  ON public.signing_audit_log FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signing_audit_wallet ON public.signing_audit_log(wallet_id);
CREATE INDEX IF NOT EXISTS idx_signing_audit_time ON public.signing_audit_log(signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_signing_audit_status ON public.signing_audit_log(status);
CREATE INDEX IF NOT EXISTS idx_signing_audit_tx_hash ON public.signing_audit_log(tx_hash);
CREATE INDEX IF NOT EXISTS idx_wallets_key_storage ON public.wallets(key_storage_type);

-- Update wallets_safe view to include custody columns
DROP VIEW IF EXISTS public.wallets_safe;
CREATE VIEW public.wallets_safe AS
SELECT 
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
  -- Custody columns (NEW)
  key_storage_type,
  vault_key_ref,
  legacy_seed_archived_at
  -- NEVER include: encrypted_seed, contact_email, contact_phone
FROM public.wallets;

-- RLS for wallets_safe view (inherited from underlying table, but view has its own)
GRANT SELECT ON public.wallets_safe TO authenticated;

-- Insert default signing policies
INSERT INTO public.signing_policies (policy_name, description, wallet_roles, network, allowed_tx_types, max_amount_xrp, requires_multi_sign, min_signers)
VALUES 
  ('testnet_default', 'Default policy for testnet wallets', ARRAY['ISSUER', 'ESCROW', 'OPERATIONAL', 'VAULT', 'OMNIBUS'], 'testnet', 
   ARRAY['PAYMENT', 'ESCROW_CREATE', 'ESCROW_FINISH', 'ESCROW_CANCEL', 'TRUST_SET', 'OFFER_CREATE', 'OFFER_CANCEL'], 
   100000, false, 1),
  ('mainnet_operational', 'Operational wallet policy for mainnet', ARRAY['OPERATIONAL'], 'mainnet',
   ARRAY['PAYMENT', 'TRUST_SET'],
   10000, false, 1),
  ('mainnet_treasury', 'Treasury wallet policy requiring multi-sig', ARRAY['VAULT', 'ISSUER'], 'mainnet',
   ARRAY['PAYMENT', 'ESCROW_CREATE', 'ESCROW_FINISH', 'TOKEN_MINT', 'TOKEN_BURN'],
   NULL, true, 2),
  ('mainnet_escrow', 'Escrow operations on mainnet', ARRAY['ESCROW'], 'mainnet',
   ARRAY['ESCROW_CREATE', 'ESCROW_FINISH', 'ESCROW_CANCEL'],
   NULL, true, 2)
ON CONFLICT (policy_name) DO NOTHING;

-- Create function to get applicable signing policy
CREATE OR REPLACE FUNCTION public.get_signing_policy(
  p_wallet_role TEXT,
  p_network TEXT,
  p_tx_type TEXT
) RETURNS TABLE (
  policy_id UUID,
  policy_name TEXT,
  max_amount_xrp NUMERIC,
  requires_multi_sign BOOLEAN,
  min_signers INTEGER,
  rate_limit_per_minute INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.policy_name,
    sp.max_amount_xrp,
    sp.requires_multi_sign,
    sp.min_signers,
    sp.rate_limit_per_minute
  FROM signing_policies sp
  WHERE sp.is_active = true
    AND sp.network = p_network
    AND p_wallet_role = ANY(sp.wallet_roles)
    AND p_tx_type = ANY(sp.allowed_tx_types)
  LIMIT 1;
END;
$$;

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION public.check_signing_rate_limit(
  p_wallet_id UUID,
  p_limit_per_minute INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM signing_audit_log
  WHERE wallet_id = p_wallet_id
    AND signed_at > NOW() - INTERVAL '1 minute'
    AND status IN ('SIGNED', 'SUBMITTED', 'CONFIRMED');
  
  RETURN recent_count < p_limit_per_minute;
END;
$$;