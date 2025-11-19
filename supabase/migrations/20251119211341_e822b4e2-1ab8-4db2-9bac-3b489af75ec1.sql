-- ============================================================
-- SÉCURISATION RLS : company_verification_logs & audit_access_control
-- ============================================================

-- 1. S'assurer que RLS est actif (redondant mais sûr)
ALTER TABLE public.company_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_access_control ENABLE ROW LEVEL SECURITY;

-- 2. Politiques INSERT pour company_verification_logs
-- Permet aux utilisateurs authentifiés de créer leurs propres logs
DROP POLICY IF EXISTS "Users can create verification logs" ON public.company_verification_logs;
CREATE POLICY "Users can create verification logs"
ON public.company_verification_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Permet aussi au service role (Edge Functions) de créer des logs
DROP POLICY IF EXISTS "Service role can insert verification logs" ON public.company_verification_logs;
CREATE POLICY "Service role can insert verification logs"
ON public.company_verification_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Politiques INSERT pour audit_access_control
-- BLOQUE toute insertion côté client (seul le service role doit écrire ici)
DROP POLICY IF EXISTS "Prevent client insert on access control" ON public.audit_access_control;
CREATE POLICY "Prevent client insert on access control"
ON public.audit_access_control
FOR INSERT
TO authenticated
WITH CHECK (false);

-- Permet au service role d'insérer (Edge Functions uniquement)
DROP POLICY IF EXISTS "Service role can insert access control" ON public.audit_access_control;
CREATE POLICY "Service role can insert access control"
ON public.audit_access_control
FOR INSERT
TO service_role
WITH CHECK (true);

-- ============================================================
-- Note : Les politiques SELECT existantes utilisent déjà has_role()
-- donc pas de risque de récursion infinie.
-- ============================================================