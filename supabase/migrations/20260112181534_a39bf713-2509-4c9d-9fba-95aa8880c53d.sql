-- ============================================================================
-- ENTERPRISE ROLE CATALOG - Part 1: Add New Roles to Enum ONLY
-- ============================================================================
-- These must be committed before they can be used

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'SYSTEM_ADMIN';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'OPERATIONS_ADMIN';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'PROPERTY_OPERATIONS_MANAGER';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'INVESTOR_OPERATIONS';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'RISK_ANALYST';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ACCOUNTING_MANAGER';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'BACKEND_ENGINEER';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'PLATFORM_ENGINEER';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'SECURITY_ENGINEER';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'QA_TEST_ENGINEER';