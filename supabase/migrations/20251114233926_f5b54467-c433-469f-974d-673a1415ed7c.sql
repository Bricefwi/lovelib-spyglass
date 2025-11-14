-- ============================================================================
-- SÉCURITÉ CRITIQUE : Corrections des vulnérabilités identifiées
-- ============================================================================

-- 1. Restreindre la politique RLS sur companies
-- Actuellement, "anyone can create" est trop permissif
DROP POLICY IF EXISTS "Anyone can create companies" ON public.companies;

-- Nouvelle politique : Seuls les utilisateurs authentifiés OU service_role
CREATE POLICY "Authenticated users or service can create companies"
ON public.companies
FOR INSERT
TO authenticated, service_role
WITH CHECK (
  -- Vérifie que l'utilisateur est authentifié ou que c'est le service role
  auth.role() = 'authenticated' OR auth.role() = 'service_role'
);

-- 2. Créer les tables de logging manquantes pour la sécurité

-- Table pour les logs de vérification SIRET
CREATE TABLE IF NOT EXISTS public.company_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  siret TEXT NOT NULL,
  verification_result TEXT NOT NULL, -- 'success', 'invalid_format', 'not_found', 'api_error'
  legal_name TEXT,
  verification_method TEXT DEFAULT 'api_recherche_entreprise',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_verification_logs_user_id ON company_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created_at ON company_verification_logs(created_at);

-- RLS sur company_verification_logs
ALTER TABLE public.company_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification logs"
ON public.company_verification_logs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification logs"
ON public.company_verification_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert verification logs"
ON public.company_verification_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Table pour les contrôles d'accès aux audits (rate limiting, etc.)
CREATE TABLE IF NOT EXISTS public.audit_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  allowed BOOLEAN NOT NULL,
  denial_reason TEXT, -- 'email_not_confirmed', 'free_audits_exhausted', etc.
  free_audits_remaining INTEGER,
  trust_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour le rate limiting (10 tentatives/heure par IP)
CREATE INDEX IF NOT EXISTS idx_access_control_ip_created ON audit_access_control(ip_address, created_at);
CREATE INDEX IF NOT EXISTS idx_access_control_user_created ON audit_access_control(user_id, created_at);

-- RLS sur audit_access_control
ALTER TABLE public.audit_access_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access logs"
ON public.audit_access_control
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all access logs"
ON public.audit_access_control
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert access logs"
ON public.audit_access_control
FOR INSERT
TO service_role
WITH CHECK (true);

-- 3. Amélioration de la sécurité des profils
-- Ajouter une contrainte pour empêcher les trust_score invalides
ALTER TABLE public.profiles 
ADD CONSTRAINT trust_score_valid_range 
CHECK (trust_score >= 0 AND trust_score <= 100);

-- 4. Audit trail : Trigger pour logger les modifications de profils sensibles
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Logger seulement les changements de colonnes sensibles
  IF OLD.trust_score IS DISTINCT FROM NEW.trust_score OR
     OLD.account_status IS DISTINCT FROM NEW.account_status OR
     OLD.blocked_until IS DISTINCT FROM NEW.blocked_until THEN
    
    INSERT INTO admin_activity_logs (
      admin_id,
      action,
      target_user_id,
      details,
      created_at
    ) VALUES (
      auth.uid(),
      'profile_security_change',
      NEW.user_id,
      jsonb_build_object(
        'old_trust_score', OLD.trust_score,
        'new_trust_score', NEW.trust_score,
        'old_status', OLD.account_status,
        'new_status', NEW.account_status
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;