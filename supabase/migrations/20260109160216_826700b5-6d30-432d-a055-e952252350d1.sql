-- Phase 1: Secure Wallets Table

-- 1.1 Create helper function for wallet role checks
CREATE OR REPLACE FUNCTION public.has_wallet_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
      AND role IN ('SUPER_ADMIN', 'CUSTODY_OFFICER')
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- 1.2 Drop all insecure public policies on wallets table
DROP POLICY IF EXISTS "Allow public delete on wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public insert on wallets" ON public.wallets;
DROP POLICY IF EXISTS "Allow public update on wallets" ON public.wallets;
DROP POLICY IF EXISTS "Authenticated users can view wallets" ON public.wallets;
DROP POLICY IF EXISTS "Public read access for wallets" ON public.wallets;

-- 1.3 Create secure RLS policies for wallets

-- SELECT: Only authorized roles can view wallets
CREATE POLICY "Authorized roles can view wallets"
ON public.wallets FOR SELECT TO authenticated
USING (public.has_wallet_role(auth.uid()));

-- INSERT: Only SUPER_ADMIN and CUSTODY_OFFICER can create wallets
CREATE POLICY "Authorized roles can create wallets"
ON public.wallets FOR INSERT TO authenticated
WITH CHECK (public.has_wallet_role(auth.uid()));

-- UPDATE: Only SUPER_ADMIN and CUSTODY_OFFICER can update wallets
CREATE POLICY "Authorized roles can update wallets"
ON public.wallets FOR UPDATE TO authenticated
USING (public.has_wallet_role(auth.uid()))
WITH CHECK (public.has_wallet_role(auth.uid()));

-- DELETE: Only SUPER_ADMIN can delete wallets
CREATE POLICY "Super admin can delete wallets"
ON public.wallets FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));