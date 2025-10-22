-- Add admin role and permissions for patrice.simion@gmail.com
-- First, add the admin role to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'patrice.simion@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Then, add to admins table with super_admin privileges
INSERT INTO public.admins (user_id, super_admin, permissions)
SELECT id, true, '{"all": true}'::jsonb
FROM auth.users
WHERE email = 'patrice.simion@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET super_admin = true,
    permissions = '{"all": true}'::jsonb;