-- Add policy for public read access during development
-- This allows the internal admin tool to read wallets without auth
CREATE POLICY "Public read access for wallets"
ON public.wallets
FOR SELECT
TO anon
USING (true);