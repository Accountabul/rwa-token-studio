-- =====================================================
-- Phase Transition Configuration Table
-- =====================================================
CREATE TABLE public.project_phase_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_status text NOT NULL,
  to_status text NOT NULL,
  required_roles text[] NOT NULL,
  required_approvals int DEFAULT 1,
  notify_roles text[] NOT NULL,
  notify_assignee boolean DEFAULT true,
  notify_all_users boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_status, to_status)
);

-- Enable RLS
ALTER TABLE public.project_phase_transitions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read transition rules
CREATE POLICY "Authenticated users can view transition rules"
ON public.project_phase_transitions FOR SELECT
TO authenticated USING (true);

-- Seed the transition rules
INSERT INTO public.project_phase_transitions (from_status, to_status, required_roles, required_approvals, notify_roles, notify_all_users, description) VALUES
('INTAKE_PENDING', 'INTAKE_COMPLETE', ARRAY['TOKENIZATION_MANAGER'], 1, ARRAY['VALUATION_OFFICER'], false, 'Complete initial intake'),
('INTAKE_COMPLETE', 'METADATA_DRAFT', ARRAY['TOKENIZATION_MANAGER'], 1, ARRAY['VALUATION_OFFICER'], false, 'Begin metadata drafting'),
('METADATA_DRAFT', 'METADATA_APPROVED', ARRAY['VALUATION_OFFICER', 'TOKENIZATION_MANAGER'], 1, ARRAY['COMPLIANCE_OFFICER'], false, 'Approve token metadata'),
('METADATA_APPROVED', 'COMPLIANCE_APPROVED', ARRAY['COMPLIANCE_OFFICER'], 1, ARRAY['CUSTODY_OFFICER', 'RISK_ANALYST'], false, 'Complete compliance review'),
('COMPLIANCE_APPROVED', 'CUSTODY_READY', ARRAY['CUSTODY_OFFICER'], 1, ARRAY['TOKENIZATION_MANAGER', 'FINANCE_OFFICER'], false, 'Prepare for custody'),
('CUSTODY_READY', 'MINTED', ARRAY['CUSTODY_OFFICER', 'SUPER_ADMIN'], 2, ARRAY[]::text[], true, 'Mint token and announce to all users');

-- =====================================================
-- Phase Transition Approvals Audit Log
-- =====================================================
CREATE TABLE public.project_phase_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  from_status text NOT NULL,
  to_status text NOT NULL,
  approved_by uuid NOT NULL,
  approved_by_name text NOT NULL,
  approved_by_role text NOT NULL,
  approved_at timestamptz DEFAULT now(),
  notes text,
  signature_hash text
);

-- Enable RLS
ALTER TABLE public.project_phase_approvals ENABLE ROW LEVEL SECURITY;

-- Policy: Authorized roles can view approvals
CREATE POLICY "Authorized users can view phase approvals"
ON public.project_phase_approvals FOR SELECT
TO authenticated
USING (
  is_admin(auth.uid()) 
  OR has_role(auth.uid(), 'AUDITOR'::app_role) 
  OR has_role(auth.uid(), 'TOKENIZATION_MANAGER'::app_role)
  OR has_role(auth.uid(), 'COMPLIANCE_OFFICER'::app_role)
  OR has_role(auth.uid(), 'CUSTODY_OFFICER'::app_role)
);

-- Policy: Authorized roles can insert approvals
CREATE POLICY "Authorized users can insert phase approvals"
ON public.project_phase_approvals FOR INSERT
TO authenticated
WITH CHECK (approved_by = auth.uid());

-- =====================================================
-- Tokenization Projects Table (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tokenization_projects (
  id text PRIMARY KEY,
  name text NOT NULL,
  asset_id text,
  company_name text,
  jurisdiction text,
  asset_class text,
  asset_subclass text,
  valuation_usd numeric,
  valuation_date date,
  status text NOT NULL DEFAULT 'INTAKE_PENDING',
  property_address text,
  owner_name text,
  property_nickname text,
  xls89_metadata jsonb,
  mpt_config jsonb,
  planned_token_supply integer,
  created_by uuid,
  assigned_to uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tokenization_projects ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view projects
CREATE POLICY "Authenticated users can view tokenization projects"
ON public.tokenization_projects FOR SELECT
TO authenticated USING (true);

-- Allow authorized roles to insert projects
CREATE POLICY "Authorized users can insert tokenization projects"
ON public.tokenization_projects FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'TOKENIZATION_MANAGER'::app_role)
  OR has_role(auth.uid(), 'SUPER_ADMIN'::app_role)
);

-- Allow authorized roles to update projects
CREATE POLICY "Authorized users can update tokenization projects"
ON public.tokenization_projects FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'TOKENIZATION_MANAGER'::app_role)
  OR has_role(auth.uid(), 'SUPER_ADMIN'::app_role)
  OR has_role(auth.uid(), 'VALUATION_OFFICER'::app_role)
  OR has_role(auth.uid(), 'COMPLIANCE_OFFICER'::app_role)
  OR has_role(auth.uid(), 'CUSTODY_OFFICER'::app_role)
);

-- Allow super admin to delete projects
CREATE POLICY "Super admin can delete tokenization projects"
ON public.tokenization_projects FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'SUPER_ADMIN'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_tokenization_projects_updated_at
BEFORE UPDATE ON public.tokenization_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();