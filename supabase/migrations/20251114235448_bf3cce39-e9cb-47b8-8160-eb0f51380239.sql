-- ============================================================================
-- MIGRATION SÉCURITÉ CRITIQUE - Suite audit IMOTION
-- ============================================================================
-- Corrections des politiques RLS et ajout des contrôles manquants
-- ============================================================================

-- 1. CORRECTION RLS sur profiles - Ajouter SELECT policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. Restreindre UPDATE sur profiles - Empêcher modification des champs sensibles
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update own profile basic fields"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND
  -- Vérifier que les champs sensibles ne sont pas modifiés par l'utilisateur
  (free_audits_used IS NOT DISTINCT FROM (SELECT free_audits_used FROM profiles WHERE user_id = auth.uid())) AND
  (trust_score IS NOT DISTINCT FROM (SELECT trust_score FROM profiles WHERE user_id = auth.uid())) AND
  (account_status IS NOT DISTINCT FROM (SELECT account_status FROM profiles WHERE user_id = auth.uid()))
);

-- 3. CORRECTION RLS sur companies - Ajouter SELECT policy
DROP POLICY IF EXISTS "Companies viewable by associated clients" ON public.companies;
DROP POLICY IF EXISTS "Users can view their companies" ON public.companies;
CREATE POLICY "Users can view their companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  -- Via profile company_id ou via pre_audits created_by
  id IN (
    SELECT company_id FROM profiles WHERE user_id = auth.uid()
  ) OR id IN (
    SELECT company_id FROM pre_audits WHERE created_by = auth.uid()
  )
);

-- 4. SÉCURISER company_verification_logs - Pas d'INSERT direct par users
DROP POLICY IF EXISTS "Service role can insert verification logs" ON public.company_verification_logs;
DROP POLICY IF EXISTS "Users can view their own verification logs" ON public.company_verification_logs;

CREATE POLICY "Users can view their verification logs"
ON public.company_verification_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Pas de policy INSERT pour users - seulement via service_role

-- 5. SÉCURISER audit_access_control - Pas d'INSERT direct par users
DROP POLICY IF EXISTS "Service role can insert access logs" ON public.audit_access_control;
DROP POLICY IF EXISTS "Users can view their own access logs" ON public.audit_access_control;

CREATE POLICY "Users can view their access logs"
ON public.audit_access_control
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Pas de policy INSERT pour users - seulement via service_role

-- 6. Ajouter table pour rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL, -- 'validate_siret', 'preaudit', etc.
  identifier text NOT NULL, -- user_id ou ip_address
  identifier_type text NOT NULL, -- 'user' ou 'ip'
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(resource_type, identifier, identifier_type)
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON public.rate_limits(resource_type, identifier, identifier_type, window_start);

-- RLS sur rate_limits (lecture admin seulement)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Fonction pour vérifier et incrémenter rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_resource_type text,
  p_identifier text,
  p_identifier_type text,
  p_max_requests integer,
  p_window_minutes integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_count integer;
  v_window_start timestamptz;
  v_allowed boolean;
BEGIN
  -- Nettoyer les anciennes entrées
  DELETE FROM rate_limits 
  WHERE window_start < now() - (p_window_minutes || ' minutes')::interval;
  
  -- Vérifier le compteur actuel
  SELECT request_count, window_start INTO v_current_count, v_window_start
  FROM rate_limits
  WHERE resource_type = p_resource_type
    AND identifier = p_identifier
    AND identifier_type = p_identifier_type
    AND window_start > now() - (p_window_minutes || ' minutes')::interval;
  
  IF v_current_count IS NULL THEN
    -- Première requête dans cette fenêtre
    INSERT INTO rate_limits (resource_type, identifier, identifier_type, request_count, window_start)
    VALUES (p_resource_type, p_identifier, p_identifier_type, 1, now())
    ON CONFLICT (resource_type, identifier, identifier_type)
    DO UPDATE SET request_count = 1, window_start = now();
    
    v_allowed := true;
    v_current_count := 1;
  ELSIF v_current_count >= p_max_requests THEN
    -- Limite atteinte
    v_allowed := false;
  ELSE
    -- Incrémenter le compteur
    UPDATE rate_limits
    SET request_count = request_count + 1
    WHERE resource_type = p_resource_type
      AND identifier = p_identifier
      AND identifier_type = p_identifier_type;
    
    v_allowed := true;
    v_current_count := v_current_count + 1;
  END IF;
  
  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_current_count,
    'max_requests', p_max_requests,
    'window_minutes', p_window_minutes
  );
END;
$$;

-- 8. Fonction sécurisée pour incrémenter free_audits_used
CREATE OR REPLACE FUNCTION public.increment_free_audits_used(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que c'est bien l'utilisateur qui appelle pour lui-même
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: can only increment own audit count';
  END IF;
  
  UPDATE profiles
  SET free_audits_used = free_audits_used + 1,
      last_audit_at = now()
  WHERE user_id = p_user_id;
END;
$$;