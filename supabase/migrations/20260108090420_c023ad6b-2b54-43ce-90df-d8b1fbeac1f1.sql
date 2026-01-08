-- Seed SUPER_ADMIN role for jibreelm96@gmail.com (first user)
INSERT INTO public.user_roles (user_id, role, notes)
VALUES (
  '7a86bea0-7e4b-4baa-b42b-e3b739bb1b8c',
  'SUPER_ADMIN',
  'Bootstrap admin - organization founder'
)
ON CONFLICT (user_id, role) DO NOTHING;