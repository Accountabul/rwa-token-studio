-- Phase 1: Create secure wallets_safe view excluding sensitive fields
CREATE OR REPLACE VIEW public.wallets_safe
WITH (security_invoker=on) AS
SELECT 
  id, name, role, network, status, xrpl_address, public_key,
  multi_sign_enabled, multi_sign_quorum, multi_sign_signers, multi_sign_config_id,
  permission_dex_status, is_authorized, balance,
  tags, purpose_code, business_unit, asset_class, jurisdiction, description,
  review_frequency, risk_tier, external_ref_id, expiration_date, project_ids,
  requires_destination_tag, can_authorize_holders, can_create_channels,
  can_manage_amm, can_create_escrows, can_freeze, can_clawback,
  can_mint_nfts, can_issue_tokens, identity_verified, kyc_binding_id,
  vc_issuer_capable, last_synced_at, funded_at, created_at, created_by, created_by_name,
  did_document, did_method, verifiable_credentials
FROM public.wallets;

-- Phase 1: Restrict direct wallet table access (must use wallets_safe view)
DROP POLICY IF EXISTS "Authorized roles can view wallets" ON public.wallets;
CREATE POLICY "No direct wallet SELECT - use wallets_safe view"
ON public.wallets FOR SELECT
USING (false);

-- Phase 2: Restrict role_catalog visibility to admins and hiring managers only
DROP POLICY IF EXISTS "Authenticated users can view role catalog" ON public.role_catalog;
CREATE POLICY "Admins and hiring managers can view role catalog"
ON public.role_catalog FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  has_role(auth.uid(), 'HIRING_MANAGER') OR 
  has_role(auth.uid(), 'SYSTEM_ADMIN')
);

-- Phase 2: Restrict permissions table visibility to admins only
DROP POLICY IF EXISTS "Authenticated users can view permissions" ON public.permissions;
CREATE POLICY "Only admins can view permissions"
ON public.permissions FOR SELECT
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'SYSTEM_ADMIN'));

-- Phase 2: Restrict role_permissions table visibility to admins only
DROP POLICY IF EXISTS "Authenticated users can view role permissions" ON public.role_permissions;
CREATE POLICY "Only admins can view role permissions"
ON public.role_permissions FOR SELECT
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'SYSTEM_ADMIN'));

-- Phase 3: Fix notification INSERT policy - only service role can insert
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications;
CREATE POLICY "Only service role can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Phase 3: Restrict audit log access to security roles only
DROP POLICY IF EXISTS "Users can view own access audit" ON public.access_audit_log;
CREATE POLICY "Only security roles can view audit logs"
ON public.access_audit_log FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  has_role(auth.uid(), 'COMPLIANCE_OFFICER') OR 
  has_role(auth.uid(), 'AUDITOR') OR
  has_role(auth.uid(), 'SECURITY_ENGINEER')
);

-- Phase 5: Create sanitized pending_approvals_status view (hides sensitive payload)
CREATE OR REPLACE VIEW public.pending_approvals_status
WITH (security_invoker=on) AS
SELECT 
  id, action_type, entity_type, entity_id, entity_name,
  requested_by, requested_by_name, requested_by_role,
  status, rejection_reason, created_at, requested_at,
  current_approvals, required_approvers, expires_at, executed_at, executed_by
FROM public.pending_approvals;