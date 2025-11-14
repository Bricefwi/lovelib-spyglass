-- Créer le profil manquant pour l'utilisateur admin
INSERT INTO public.profiles (
  user_id,
  email,
  firstname,
  lastname,
  role,
  trust_score,
  free_audits_used,
  account_status
) VALUES (
  'ef1dc8d9-2b26-4738-815b-eb257a40727a',
  'patrice.simion@gmail.com',
  'Patrice',
  'Simion',
  'admin',
  100,
  0,
  'active'
) ON CONFLICT (user_id) DO NOTHING;

-- Ajuster la politique RLS sur companies pour permettre la création via service_role
DROP POLICY IF EXISTS "Anyone can create companies" ON public.companies;
DROP POLICY IF EXISTS "Authenticated users or service can create companies" ON public.companies;

-- Nouvelle politique : service_role ou utilisateurs authentifiés peuvent créer
CREATE POLICY "Service role and authenticated users can create companies"
ON public.companies
FOR INSERT
TO public
WITH CHECK (
  (auth.jwt() ->> 'role'::text) = 'service_role'::text 
  OR auth.role() = 'authenticated'
);