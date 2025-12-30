-- Create wallets table for storing provisioned XRPL wallets
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ISSUER', 'TREASURY', 'ESCROW', 'OPS', 'TEST')),
  network TEXT NOT NULL DEFAULT 'testnet' CHECK (network IN ('mainnet', 'testnet', 'devnet')),
  status TEXT NOT NULL DEFAULT 'PROVISIONING' CHECK (status IN ('PROVISIONING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED')),
  xrpl_address TEXT NOT NULL UNIQUE,
  public_key TEXT,
  encrypted_seed TEXT,
  multi_sign_enabled BOOLEAN NOT NULL DEFAULT false,
  multi_sign_quorum INTEGER,
  multi_sign_signers INTEGER,
  multi_sign_config_id UUID,
  permission_dex_status TEXT NOT NULL DEFAULT 'NOT_LINKED' CHECK (permission_dex_status IN ('NOT_LINKED', 'PENDING', 'APPROVED', 'REJECTED')),
  is_authorized BOOLEAN NOT NULL DEFAULT false,
  balance DECIMAL(20, 6),
  created_by TEXT NOT NULL,
  created_by_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  funded_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- For now, allow authenticated users to read wallets (will be refined with roles later)
CREATE POLICY "Authenticated users can view wallets"
ON public.wallets
FOR SELECT
TO authenticated
USING (true);

-- Only allow inserts via backend (edge function)
-- No direct insert policy for regular users

-- Create index on xrpl_address for fast lookups
CREATE INDEX idx_wallets_xrpl_address ON public.wallets(xrpl_address);
CREATE INDEX idx_wallets_status ON public.wallets(status);
CREATE INDEX idx_wallets_network ON public.wallets(network);