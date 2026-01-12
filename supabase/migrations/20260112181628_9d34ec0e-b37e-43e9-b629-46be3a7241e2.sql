-- ============================================================================
-- ENTERPRISE ROLE CATALOG - Part 2: Tables, Policies, and Data
-- ============================================================================

-- Role Catalog Table
CREATE TABLE public.role_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code app_role UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ADMINISTRATION', 'TOKENIZATION', 'COMPLIANCE', 'FINANCE', 'ENGINEERING')),
  purpose TEXT NOT NULL,
  backend_access TEXT[] DEFAULT '{}',
  restrictions TEXT[] DEFAULT '{}',
  is_privileged BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT false,
  default_expiration_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_catalog ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view role catalog (it's reference data)
CREATE POLICY "Authenticated users can view role catalog"
ON public.role_catalog FOR SELECT
USING (true);

-- Only super admin can modify role catalog
CREATE POLICY "Super admin can manage role catalog"
ON public.role_catalog FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Role Requests Table
CREATE TABLE public.role_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by UUID NOT NULL REFERENCES public.profiles(id),
  role_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ADMINISTRATION', 'TOKENIZATION', 'COMPLIANCE', 'FINANCE', 'ENGINEERING')),
  purpose TEXT NOT NULL,
  backend_access TEXT[] DEFAULT '{}',
  restrictions TEXT[] DEFAULT '{}',
  justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_role app_role,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own role requests
CREATE POLICY "Users can view own role requests"
ON public.role_requests FOR SELECT
USING (requested_by = auth.uid() OR is_admin(auth.uid()) OR has_role(auth.uid(), 'SYSTEM_ADMIN'));

-- HR and admins can create role requests
CREATE POLICY "HR and admins can create role requests"
ON public.role_requests FOR INSERT
WITH CHECK (
  is_admin(auth.uid()) OR 
  has_role(auth.uid(), 'SYSTEM_ADMIN') OR 
  has_role(auth.uid(), 'HIRING_MANAGER')
);

-- Only super admin and system admin can update role requests
CREATE POLICY "Admins can update role requests"
ON public.role_requests FOR UPDATE
USING (is_admin(auth.uid()) OR has_role(auth.uid(), 'SYSTEM_ADMIN'));

-- Update can_assign_role Function for New Role Hierarchy
CREATE OR REPLACE FUNCTION public.can_assign_role(_assigner_id UUID, _target_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN has_role(_assigner_id, 'SUPER_ADMIN') THEN true
    WHEN has_role(_assigner_id, 'SYSTEM_ADMIN') THEN 
      _target_role NOT IN ('SUPER_ADMIN')
    WHEN has_role(_assigner_id, 'HIRING_MANAGER') THEN 
      _target_role IN (
        'TOKENIZATION_MANAGER', 
        'VALUATION_OFFICER', 
        'PROPERTY_OPERATIONS_MANAGER',
        'INVESTOR_OPERATIONS',
        'OPERATIONS_ADMIN',
        'RISK_ANALYST',
        'AUDITOR', 
        'ACCOUNTING_MANAGER',
        'BACKEND_ENGINEER',
        'PLATFORM_ENGINEER',
        'SECURITY_ENGINEER',
        'QA_TEST_ENGINEER',
        'HIRING_MANAGER'
      )
    ELSE false
  END
$$;

-- Add is_system_admin Helper Function
CREATE OR REPLACE FUNCTION public.is_system_admin(_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(_user_id, 'SUPER_ADMIN') OR has_role(_user_id, 'SYSTEM_ADMIN')
$$;