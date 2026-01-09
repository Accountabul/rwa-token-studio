-- Phase 1: Multi-Role Approval System Database Infrastructure

-- 1.1 Create pending_approvals table for all high-risk operations
CREATE TABLE public.pending_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL, -- TRANSFER, CLAWBACK, FREEZE, SIGN_TX, WALLET_PROVISION, etc.
  entity_type TEXT NOT NULL, -- WALLET, TOKEN, ESCROW, etc.
  entity_id TEXT NOT NULL,
  entity_name TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_by_name TEXT NOT NULL,
  requested_by_role TEXT NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'EXECUTED', 'CANCELLED')),
  required_approvers INTEGER NOT NULL DEFAULT 2,
  current_approvals INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  executed_at TIMESTAMPTZ,
  executed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Create approval_signatures table for individual approvals
CREATE TABLE public.approval_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_id UUID NOT NULL REFERENCES public.pending_approvals(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approver_name TEXT NOT NULL,
  approver_role TEXT NOT NULL,
  approved BOOLEAN NOT NULL, -- true = approve, false = reject
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE (approval_id, approver_id) -- One vote per user per approval
);

-- 1.3 Enable RLS on both tables
ALTER TABLE public.pending_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_signatures ENABLE ROW LEVEL SECURITY;

-- 1.4 Create helper function for approval permissions
CREATE OR REPLACE FUNCTION public.can_approve(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role IN ('SUPER_ADMIN', 'CUSTODY_OFFICER', 'COMPLIANCE_OFFICER')
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 1.5 RLS Policies for pending_approvals

-- SELECT: Users who can approve can view pending approvals
CREATE POLICY "Approvers can view pending approvals"
ON public.pending_approvals FOR SELECT TO authenticated
USING (public.can_approve(auth.uid()) OR requested_by = auth.uid());

-- INSERT: Users with wallet/token management roles can create approval requests
CREATE POLICY "Authorized users can create approval requests"
ON public.pending_approvals FOR INSERT TO authenticated
WITH CHECK (
  public.has_wallet_role(auth.uid()) OR public.can_approve(auth.uid())
);

-- UPDATE: Only for status changes by approvers (not the requestor)
CREATE POLICY "Approvers can update approval status"
ON public.pending_approvals FOR UPDATE TO authenticated
USING (
  public.can_approve(auth.uid()) 
  AND requested_by != auth.uid() -- Cannot approve own request
);

-- DELETE: Only SUPER_ADMIN can delete (for cleanup)
CREATE POLICY "Super admin can delete approvals"
ON public.pending_approvals FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- 1.6 RLS Policies for approval_signatures

-- SELECT: Same users who can view approvals
CREATE POLICY "Approvers can view signatures"
ON public.approval_signatures FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.pending_approvals pa
    WHERE pa.id = approval_id
    AND (public.can_approve(auth.uid()) OR pa.requested_by = auth.uid())
  )
);

-- INSERT: Approvers can sign (but not their own requests)
CREATE POLICY "Approvers can sign approvals"
ON public.approval_signatures FOR INSERT TO authenticated
WITH CHECK (
  public.can_approve(auth.uid())
  AND approver_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.pending_approvals pa
    WHERE pa.id = approval_id AND pa.requested_by = auth.uid()
  )
);

-- No UPDATE or DELETE on signatures (immutable)

-- 1.7 Trigger function to update approval count and status
CREATE OR REPLACE FUNCTION public.update_approval_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_required INTEGER;
  v_current INTEGER;
  v_rejected INTEGER;
BEGIN
  -- Get the required approvers count
  SELECT required_approvers INTO v_required
  FROM public.pending_approvals
  WHERE id = NEW.approval_id;

  -- Count current approvals
  SELECT COUNT(*) INTO v_current
  FROM public.approval_signatures
  WHERE approval_id = NEW.approval_id AND approved = true;

  -- Count rejections
  SELECT COUNT(*) INTO v_rejected
  FROM public.approval_signatures
  WHERE approval_id = NEW.approval_id AND approved = false;

  -- Update the pending_approvals record
  UPDATE public.pending_approvals
  SET current_approvals = v_current,
      status = CASE
        WHEN v_rejected > 0 THEN 'REJECTED'
        WHEN v_current >= v_required THEN 'APPROVED'
        ELSE 'PENDING'
      END,
      rejection_reason = CASE
        WHEN v_rejected > 0 THEN NEW.notes
        ELSE rejection_reason
      END
  WHERE id = NEW.approval_id AND status = 'PENDING';

  RETURN NEW;
END;
$$;

-- 1.8 Create trigger
CREATE TRIGGER on_signature_added
AFTER INSERT ON public.approval_signatures
FOR EACH ROW
EXECUTE FUNCTION public.update_approval_status();

-- 1.9 Trigger to auto-expire pending approvals
CREATE OR REPLACE FUNCTION public.check_approval_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'PENDING' AND NEW.expires_at < now() THEN
    NEW.status := 'EXPIRED';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_expiry_on_update
BEFORE UPDATE ON public.pending_approvals
FOR EACH ROW
EXECUTE FUNCTION public.check_approval_expiry();

-- 1.10 Create indexes for performance
CREATE INDEX idx_pending_approvals_status ON public.pending_approvals(status);
CREATE INDEX idx_pending_approvals_requested_by ON public.pending_approvals(requested_by);
CREATE INDEX idx_pending_approvals_expires_at ON public.pending_approvals(expires_at) WHERE status = 'PENDING';
CREATE INDEX idx_approval_signatures_approval_id ON public.approval_signatures(approval_id);