-- Create invitations table for employee provisioning
CREATE TABLE public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  job_title TEXT,
  employment_type TEXT DEFAULT 'EMPLOYEE',
  manager_id UUID REFERENCES public.profiles(id),
  start_date DATE,
  end_date DATE,
  initial_roles app_role[] DEFAULT '{}',
  access_profile TEXT,
  justification TEXT,
  invited_by UUID NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on invitations
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for invitations
CREATE POLICY "HR and admins can view invitations"
ON public.invitations FOR SELECT
USING (
  is_admin(auth.uid()) OR 
  has_role(auth.uid(), 'HIRING_MANAGER')
);

CREATE POLICY "HR and admins can create invitations"
ON public.invitations FOR INSERT
WITH CHECK (
  is_admin(auth.uid()) OR 
  has_role(auth.uid(), 'HIRING_MANAGER')
);

CREATE POLICY "HR and admins can update invitations"
ON public.invitations FOR UPDATE
USING (
  is_admin(auth.uid()) OR 
  has_role(auth.uid(), 'HIRING_MANAGER')
);

-- Add new employee management permissions
INSERT INTO public.permissions (code, name, description, category, risk_level, requires_justification, requires_approval) VALUES
('employee.view', 'View Employees', 'View employee profiles and details', 'User Administration', 'NORMAL', false, false),
('employee.create', 'Create Employee', 'Create new employee records', 'User Administration', 'ELEVATED', true, false),
('employee.update', 'Update Employee', 'Update employee information', 'User Administration', 'NORMAL', false, false),
('employee.invite', 'Send Invitations', 'Send invitations to new employees', 'User Administration', 'ELEVATED', true, false),
('employee.suspend', 'Suspend Employee', 'Suspend employee access', 'User Administration', 'ELEVATED', true, false),
('employee.terminate', 'Terminate Employee', 'Terminate employee access permanently', 'User Administration', 'DANGEROUS', true, true),
('role.assign_basic', 'Assign Basic Roles', 'Assign non-privileged roles to users', 'User Administration', 'ELEVATED', true, false),
('role.assign_privileged', 'Assign Privileged Roles', 'Assign privileged roles (Custody, Compliance, Finance, Admin)', 'User Administration', 'DANGEROUS', true, true),
('invitation.view', 'View Invitations', 'View pending invitations', 'User Administration', 'NORMAL', false, false),
('invitation.cancel', 'Cancel Invitations', 'Cancel pending invitations', 'User Administration', 'NORMAL', false, false)
ON CONFLICT (code) DO NOTHING;

-- Create function to check if a user can assign a specific role
CREATE OR REPLACE FUNCTION public.can_assign_role(_assigner_id UUID, _target_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN has_role(_assigner_id, 'SUPER_ADMIN') THEN true
    WHEN has_role(_assigner_id, 'HIRING_MANAGER') THEN 
      _target_role IN ('TOKENIZATION_MANAGER', 'VALUATION_OFFICER', 'AUDITOR', 'HIRING_MANAGER')
    ELSE false
  END
$$;

-- Create function to check if a user can manage employees
CREATE OR REPLACE FUNCTION public.can_manage_employees(_user_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role IN ('SUPER_ADMIN', 'HIRING_MANAGER')
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;