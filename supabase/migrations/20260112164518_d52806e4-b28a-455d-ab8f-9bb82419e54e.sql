-- ============================================================================
-- ENTERPRISE USER MANAGEMENT - PERMISSION SYSTEM
-- ============================================================================

-- 1. Create permissions registry table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'NORMAL' CHECK (risk_level IN ('NORMAL', 'ELEVATED', 'DANGEROUS')),
  requires_justification BOOLEAN NOT NULL DEFAULT false,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create role → permission mapping table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- 3. Extend profiles with employee/lifecycle fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'EMPLOYEE' CHECK (employment_type IN ('EMPLOYEE', 'CONTRACTOR', 'AGENT')),
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('INVITED', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'LOCKED')),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- 4. Create access requests table for approval workflows
CREATE TABLE public.access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requested_role app_role,
  requested_permission_id UUID REFERENCES public.permissions(id),
  justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED', 'EXPIRED', 'CANCELLED')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  CONSTRAINT request_has_target CHECK (requested_role IS NOT NULL OR requested_permission_id IS NOT NULL)
);

-- 5. Create access audit log table
CREATE TABLE public.access_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN (
    'ROLE_ASSIGNED', 'ROLE_REVOKED', 'ROLE_EXPIRED',
    'PERMISSION_GRANTED', 'PERMISSION_REVOKED',
    'STATUS_CHANGED', 'USER_SUSPENDED', 'USER_TERMINATED', 'USER_ACTIVATED',
    'ACCESS_REQUEST_CREATED', 'ACCESS_REQUEST_APPROVED', 'ACCESS_REQUEST_DENIED',
    'PASSWORD_RESET', 'SESSION_REVOKED', 'PROFILE_UPDATED'
  )),
  role app_role,
  permission_code TEXT,
  previous_value TEXT,
  new_value TEXT,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_audit_log ENABLE ROW LEVEL SECURITY;

-- Permissions table - all authenticated users can view
CREATE POLICY "Authenticated users can view permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

-- Role permissions - all authenticated users can view
CREATE POLICY "Authenticated users can view role permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Admins can manage permissions tables
CREATE POLICY "Admins can insert permissions"
  ON public.permissions FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update permissions"
  ON public.permissions FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete permissions"
  ON public.permissions FOR DELETE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert role permissions"
  ON public.role_permissions FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update role permissions"
  ON public.role_permissions FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete role permissions"
  ON public.role_permissions FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Access requests - users can view their own, admins can view all
CREATE POLICY "Users can view own access requests"
  ON public.access_requests FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create access requests"
  ON public.access_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update access requests"
  ON public.access_requests FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Access audit log - users can view their own history, admins can view all
CREATE POLICY "Users can view own access audit"
  ON public.access_audit_log FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert access audit"
  ON public.access_audit_log FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- ============================================================================
-- SEED PERMISSION DATA
-- ============================================================================

-- Insert permission registry based on entity/action matrix
INSERT INTO public.permissions (code, name, description, category, risk_level, requires_justification, requires_approval) VALUES
-- Asset & Token Operations
('project.view', 'View Projects', 'View tokenization project details', 'Asset & Token Operations', 'NORMAL', false, false),
('project.view_list', 'List Projects', 'View project listing', 'Asset & Token Operations', 'NORMAL', false, false),
('project.create', 'Create Projects', 'Create new tokenization projects', 'Asset & Token Operations', 'NORMAL', false, false),
('project.update', 'Update Projects', 'Modify project details', 'Asset & Token Operations', 'NORMAL', false, false),
('project.delete', 'Delete Projects', 'Remove projects from system', 'Asset & Token Operations', 'ELEVATED', true, false),
('project.approve', 'Approve Projects', 'Approve project submissions', 'Asset & Token Operations', 'ELEVATED', false, false),

('token.view', 'View Tokens', 'View token details', 'Asset & Token Operations', 'NORMAL', false, false),
('token.view_list', 'List Tokens', 'View token registry', 'Asset & Token Operations', 'NORMAL', false, false),
('token.create', 'Create Tokens', 'Create new token definitions', 'Asset & Token Operations', 'ELEVATED', true, false),
('token.update', 'Update Tokens', 'Modify token properties', 'Asset & Token Operations', 'ELEVATED', true, false),
('token.mint', 'Mint Tokens', 'Issue new token supply', 'Asset & Token Operations', 'DANGEROUS', true, true),
('token.burn', 'Burn Tokens', 'Destroy token supply', 'Asset & Token Operations', 'DANGEROUS', true, true),
('token.freeze', 'Freeze Tokens', 'Freeze token transfers', 'Asset & Token Operations', 'DANGEROUS', true, true),
('token.unfreeze', 'Unfreeze Tokens', 'Restore token transfers', 'Asset & Token Operations', 'DANGEROUS', true, true),
('token.clawback', 'Clawback Tokens', 'Forcibly retrieve tokens', 'Asset & Token Operations', 'DANGEROUS', true, true),
('token.distribute', 'Distribute Tokens', 'Send tokens to holders', 'Asset & Token Operations', 'ELEVATED', true, false),
('token.retire', 'Retire Tokens', 'Permanently deactivate tokens', 'Asset & Token Operations', 'DANGEROUS', true, true),

('contract.view', 'View Contracts', 'View smart contract details', 'Asset & Token Operations', 'NORMAL', false, false),
('contract.view_list', 'List Contracts', 'View contract registry', 'Asset & Token Operations', 'NORMAL', false, false),
('contract.create', 'Create Contracts', 'Deploy new contracts', 'Asset & Token Operations', 'ELEVATED', true, false),
('contract.execute', 'Execute Contracts', 'Call contract functions', 'Asset & Token Operations', 'DANGEROUS', true, true),

('batch.view', 'View Batches', 'View batch transaction details', 'Asset & Token Operations', 'NORMAL', false, false),
('batch.view_list', 'List Batches', 'View batch listing', 'Asset & Token Operations', 'NORMAL', false, false),
('batch.create', 'Create Batches', 'Create batch transactions', 'Asset & Token Operations', 'ELEVATED', true, false),
('batch.execute', 'Execute Batches', 'Execute batch transactions', 'Asset & Token Operations', 'DANGEROUS', true, true),

-- Payments & Liquidity
('escrow.view', 'View Escrows', 'View escrow details', 'Payments & Liquidity', 'NORMAL', false, false),
('escrow.view_list', 'List Escrows', 'View escrow listing', 'Payments & Liquidity', 'NORMAL', false, false),
('escrow.create', 'Create Escrows', 'Create new escrows', 'Payments & Liquidity', 'ELEVATED', true, false),
('escrow.cancel', 'Cancel Escrows', 'Cancel active escrows', 'Payments & Liquidity', 'ELEVATED', true, false),
('escrow.complete', 'Complete Escrows', 'Release escrow funds', 'Payments & Liquidity', 'DANGEROUS', true, true),

('channel.view', 'View Channels', 'View payment channel details', 'Payments & Liquidity', 'NORMAL', false, false),
('channel.view_list', 'List Channels', 'View channel listing', 'Payments & Liquidity', 'NORMAL', false, false),
('channel.create', 'Create Channels', 'Open payment channels', 'Payments & Liquidity', 'ELEVATED', true, false),

('amm.view', 'View AMM Pools', 'View liquidity pool details', 'Payments & Liquidity', 'NORMAL', false, false),
('amm.view_list', 'List AMM Pools', 'View pool listing', 'Payments & Liquidity', 'NORMAL', false, false),
('amm.create', 'Create AMM Pools', 'Create new liquidity pools', 'Payments & Liquidity', 'ELEVATED', true, false),

-- Custody & Wallets
('wallet.view', 'View Wallets', 'View wallet details', 'Custody & Wallets', 'NORMAL', false, false),
('wallet.view_list', 'List Wallets', 'View wallet registry', 'Custody & Wallets', 'NORMAL', false, false),
('wallet.create', 'Create Wallets', 'Provision new wallets', 'Custody & Wallets', 'ELEVATED', true, false),
('wallet.update', 'Update Wallets', 'Modify wallet settings', 'Custody & Wallets', 'ELEVATED', true, false),
('wallet.delete', 'Delete Wallets', 'Remove wallets', 'Custody & Wallets', 'DANGEROUS', true, true),
('wallet.sign', 'Sign Transactions', 'Sign wallet transactions', 'Custody & Wallets', 'DANGEROUS', true, true),
('wallet.freeze', 'Freeze Wallets', 'Freeze wallet operations', 'Custody & Wallets', 'DANGEROUS', true, true),

('multisign.view', 'View Multi-Sign', 'View pending signatures', 'Custody & Wallets', 'NORMAL', false, false),
('multisign.sign', 'Sign Multi-Sign', 'Add signature to transaction', 'Custody & Wallets', 'DANGEROUS', true, true),
('multisign.execute', 'Execute Multi-Sign', 'Execute signed transaction', 'Custody & Wallets', 'DANGEROUS', true, true),

-- Compliance & Verification
('check.view', 'View Checks', 'View compliance check details', 'Compliance & Verification', 'NORMAL', false, false),
('check.view_list', 'List Checks', 'View check listing', 'Compliance & Verification', 'NORMAL', false, false),
('check.create', 'Create Checks', 'Create new checks', 'Compliance & Verification', 'NORMAL', false, false),
('check.approve', 'Approve Checks', 'Approve compliance checks', 'Compliance & Verification', 'ELEVATED', false, false),

('investor.view', 'View Investors', 'View investor profiles', 'Compliance & Verification', 'NORMAL', false, false),
('investor.view_list', 'List Investors', 'View investor listing', 'Compliance & Verification', 'NORMAL', false, false),
('investor.create', 'Create Investors', 'Onboard new investors', 'Compliance & Verification', 'NORMAL', false, false),
('investor.update', 'Update Investors', 'Modify investor data', 'Compliance & Verification', 'NORMAL', false, false),
('investor.approve', 'Approve Investors', 'Approve investor KYC', 'Compliance & Verification', 'ELEVATED', true, false),

-- Reporting & Oversight
('report.view', 'View Reports', 'View reports and logs', 'Reporting & Oversight', 'NORMAL', false, false),
('report.export', 'Export Reports', 'Export report data', 'Reporting & Oversight', 'ELEVATED', true, false),

('audit.view', 'View Audit Logs', 'View audit trail', 'Reporting & Oversight', 'NORMAL', false, false),
('audit.export', 'Export Audit Logs', 'Export audit data', 'Reporting & Oversight', 'ELEVATED', true, false),

('ledger.view', 'View Ledger', 'View ledger entries', 'Reporting & Oversight', 'NORMAL', false, false),
('tax.view', 'View Tax Profiles', 'View tax information', 'Reporting & Oversight', 'ELEVATED', false, false),

-- Knowledge & Support
('kb.view', 'View Knowledge Base', 'Read documentation', 'Knowledge & Support', 'NORMAL', false, false),
('kb.view_list', 'List Knowledge Base', 'Browse documentation', 'Knowledge & Support', 'NORMAL', false, false),
('kb.create', 'Create KB Articles', 'Write documentation', 'Knowledge & Support', 'NORMAL', false, false),
('kb.update', 'Update KB Articles', 'Edit documentation', 'Knowledge & Support', 'NORMAL', false, false),
('kb.approve', 'Approve KB Articles', 'Publish documentation', 'Knowledge & Support', 'NORMAL', false, false),

-- User Administration
('user.view', 'View Users', 'View user profiles', 'User Administration', 'NORMAL', false, false),
('user.view_list', 'List Users', 'View user listing', 'User Administration', 'NORMAL', false, false),
('user.create', 'Create Users', 'Provision new users', 'User Administration', 'ELEVATED', true, false),
('user.update', 'Update Users', 'Modify user profiles', 'User Administration', 'ELEVATED', true, false),
('user.suspend', 'Suspend Users', 'Temporarily disable users', 'User Administration', 'DANGEROUS', true, true),
('user.terminate', 'Terminate Users', 'Permanently disable users', 'User Administration', 'DANGEROUS', true, true),
('user.assign_role', 'Assign Roles', 'Grant roles to users', 'User Administration', 'DANGEROUS', true, true),
('user.revoke_role', 'Revoke Roles', 'Remove roles from users', 'User Administration', 'DANGEROUS', true, true);

-- ============================================================================
-- SEED ROLE → PERMISSION MAPPINGS (Only valid roles in app_role enum)
-- ============================================================================

-- SUPER_ADMIN gets all permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'SUPER_ADMIN'::app_role, id FROM public.permissions;

-- TOKENIZATION_MANAGER
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'TOKENIZATION_MANAGER'::app_role, id FROM public.permissions 
WHERE code IN (
  'project.view', 'project.view_list', 'project.create', 'project.update', 'project.approve',
  'token.view', 'token.view_list', 'token.create', 'token.update', 'token.distribute',
  'contract.view', 'contract.view_list', 'contract.create',
  'batch.view', 'batch.view_list', 'batch.create',
  'investor.view', 'investor.view_list',
  'report.view',
  'kb.view', 'kb.view_list', 'kb.create', 'kb.update'
);

-- CUSTODY_OFFICER
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'CUSTODY_OFFICER'::app_role, id FROM public.permissions 
WHERE code IN (
  'token.view', 'token.view_list', 'token.freeze', 'token.unfreeze', 'token.clawback',
  'escrow.view', 'escrow.view_list', 'escrow.create', 'escrow.complete',
  'channel.view', 'channel.view_list', 'channel.create',
  'amm.view', 'amm.view_list', 'amm.create',
  'wallet.view', 'wallet.view_list', 'wallet.create', 'wallet.update', 'wallet.sign', 'wallet.freeze',
  'multisign.view', 'multisign.sign', 'multisign.execute',
  'report.view',
  'kb.view', 'kb.view_list'
);

-- COMPLIANCE_OFFICER
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'COMPLIANCE_OFFICER'::app_role, id FROM public.permissions 
WHERE code IN (
  'project.view', 'project.view_list', 'project.approve',
  'token.view', 'token.view_list',
  'check.view', 'check.view_list', 'check.create', 'check.approve',
  'investor.view', 'investor.view_list', 'investor.create', 'investor.update', 'investor.approve',
  'report.view', 'report.export',
  'audit.view', 'audit.export',
  'kb.view', 'kb.view_list', 'kb.create', 'kb.update', 'kb.approve'
);

-- FINANCE_OFFICER
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'FINANCE_OFFICER'::app_role, id FROM public.permissions 
WHERE code IN (
  'escrow.view', 'escrow.view_list',
  'channel.view', 'channel.view_list',
  'amm.view', 'amm.view_list',
  'report.view', 'report.export',
  'ledger.view',
  'tax.view',
  'kb.view', 'kb.view_list'
);

-- AUDITOR (read-only)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'AUDITOR'::app_role, id FROM public.permissions 
WHERE code IN (
  'project.view', 'project.view_list',
  'token.view', 'token.view_list',
  'escrow.view', 'escrow.view_list',
  'wallet.view', 'wallet.view_list',
  'check.view', 'check.view_list',
  'investor.view', 'investor.view_list',
  'report.view', 'report.export',
  'audit.view', 'audit.export',
  'ledger.view',
  'kb.view', 'kb.view_list'
);

-- VALUATION_OFFICER (view only for token assets)
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'VALUATION_OFFICER'::app_role, id FROM public.permissions 
WHERE code IN (
  'project.view', 'project.view_list',
  'token.view', 'token.view_list',
  'report.view',
  'kb.view', 'kb.view_list'
);

-- Create indexes for performance
CREATE INDEX idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX idx_role_permissions_permission ON public.role_permissions(permission_id);
CREATE INDEX idx_access_requests_user ON public.access_requests(user_id);
CREATE INDEX idx_access_requests_status ON public.access_requests(status);
CREATE INDEX idx_access_audit_user ON public.access_audit_log(user_id);
CREATE INDEX idx_access_audit_action ON public.access_audit_log(action);
CREATE INDEX idx_access_audit_created ON public.access_audit_log(created_at DESC);
CREATE INDEX idx_profiles_status ON public.profiles(status);
CREATE INDEX idx_profiles_department ON public.profiles(department);