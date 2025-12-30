-- Add new columns to wallets table for ultimate flexibility

-- Identity Layer
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS did_document TEXT;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS did_method TEXT DEFAULT 'none';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS verifiable_credentials TEXT[] DEFAULT '{}';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS vc_issuer_capable BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS kyc_binding_id UUID;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT false;

-- Capabilities Layer
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS can_issue_tokens BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS can_mint_nfts BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS can_clawback BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS can_freeze BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS can_create_escrows BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS can_manage_amm BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS can_create_channels BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS can_authorize_holders BOOLEAN DEFAULT false;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS requires_destination_tag BOOLEAN DEFAULT false;

-- Classification Layer
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS purpose_code TEXT DEFAULT 'GENERAL';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS business_unit TEXT;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS project_ids UUID[] DEFAULT '{}';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS asset_class TEXT;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS jurisdiction TEXT;

-- Metadata Layer
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS review_frequency TEXT DEFAULT 'QUARTERLY';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS risk_tier TEXT DEFAULT 'MEDIUM';
ALTER TABLE public.wallets ADD COLUMN IF NOT EXISTS external_ref_id TEXT;

-- Add RLS policy for UPDATE operations
CREATE POLICY "Allow public update on wallets" 
ON public.wallets FOR UPDATE 
USING (true) WITH CHECK (true);

-- Add RLS policy for INSERT operations (needed for provisioning)
CREATE POLICY "Allow public insert on wallets" 
ON public.wallets FOR INSERT 
WITH CHECK (true);

-- Add RLS policy for DELETE operations
CREATE POLICY "Allow public delete on wallets" 
ON public.wallets FOR DELETE 
USING (true);