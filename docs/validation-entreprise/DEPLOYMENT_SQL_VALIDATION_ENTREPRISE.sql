-- ============================================================================
-- DÉPLOIEMENT : SYSTÈME DE VALIDATION D'ENTREPRISE IMOTION MANUS IA 2.0
-- ============================================================================
-- Date : 2025-01-14
-- Objectif : Ajouter la validation d'entreprise avec SIRET/SIREN + anti-abus
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : MODIFICATION TABLE PROFILES
-- ============================================================================

-- Ajouter colonnes entreprise
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_siret VARCHAR(14);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_siren VARCHAR(9);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_legal_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_legal_form VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_website TEXT;

-- Ajouter colonnes utilisateur
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_first_name VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_last_name VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS professional_phone VARCHAR(20);

-- Ajouter colonnes de vérification
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS legitimacy_verified_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_document_url TEXT;

-- Ajouter colonnes anti-abus
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS max_free_audits INTEGER DEFAULT 3;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS free_audits_used INTEGER DEFAULT 0;

-- ============================================================================
-- ÉTAPE 2 : CRÉER INDEX POUR PERFORMANCES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_siret ON profiles(company_siret);
CREATE INDEX IF NOT EXISTS idx_profiles_siren ON profiles(company_siren);
CREATE INDEX IF NOT EXISTS idx_profiles_trust_score ON profiles(trust_score);
CREATE INDEX IF NOT EXISTS idx_profiles_free_audits ON profiles(free_audits_used);

-- ============================================================================
-- ÉTAPE 3 : AJOUTER CONTRAINTES DE VALIDATION
-- ============================================================================

-- SIRET unique (une entreprise = un compte)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_siret'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT unique_siret UNIQUE (company_siret);
  END IF;
END $$;

-- SIRET valide (14 chiffres)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_siret'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_siret 
      CHECK (company_siret IS NULL OR company_siret ~ '^[0-9]{14}$');
  END IF;
END $$;

-- SIREN valide (9 chiffres)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_siren'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_siren 
      CHECK (company_siren IS NULL OR company_siren ~ '^[0-9]{9}$');
  END IF;
END $$;

-- Trust score entre 0 et 100
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_trust_score'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT valid_trust_score 
      CHECK (trust_score >= 0 AND trust_score <= 100);
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 4 : CRÉER TABLE COMPANY_VERIFICATION_LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS company_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  siret VARCHAR(14),
  verification_type VARCHAR(50), -- 'insee_api', 'email_domain', 'manual_document', 'admin_approval'
  verification_status VARCHAR(20), -- 'pending', 'success', 'failed', 'rejected', 'warning'
  verification_data JSONB, -- Réponse API INSEE ou autres données
  verified_by UUID REFERENCES auth.users(id), -- Admin qui a validé manuellement
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_verification_logs_user ON company_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_siret ON company_verification_logs(siret);
CREATE INDEX IF NOT EXISTS idx_verification_logs_status ON company_verification_logs(verification_status);
CREATE INDEX IF NOT EXISTS idx_verification_logs_created ON company_verification_logs(created_at DESC);

-- Commentaires pour documentation
COMMENT ON TABLE company_verification_logs IS 'Logs de toutes les tentatives de vérification d''entreprise (API INSEE, email, documents)';
COMMENT ON COLUMN company_verification_logs.verification_type IS 'Type de vérification : insee_api, email_domain, manual_document, admin_approval';
COMMENT ON COLUMN company_verification_logs.verification_status IS 'Statut : pending, success, failed, rejected, warning';
COMMENT ON COLUMN company_verification_logs.verification_data IS 'Données JSON retournées par l''API INSEE ou autres sources';

-- ============================================================================
-- ÉTAPE 5 : CRÉER TABLE AUDIT_ACCESS_CONTROL
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_access_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  audit_id UUID REFERENCES pre_audits(id) ON DELETE CASCADE,
  access_granted BOOLEAN DEFAULT FALSE,
  access_reason VARCHAR(100), -- 'free_trial', 'paid', 'admin_override', 'denied'
  denial_reason VARCHAR(100), -- 'email_not_confirmed', 'company_info_missing', 'free_audits_exhausted', etc.
  ip_address INET,
  user_agent TEXT,
  trust_score_at_access INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour détection d'abus et analytics
CREATE INDEX IF NOT EXISTS idx_access_control_user ON audit_access_control(user_id);
CREATE INDEX IF NOT EXISTS idx_access_control_audit ON audit_access_control(audit_id);
CREATE INDEX IF NOT EXISTS idx_access_control_ip ON audit_access_control(ip_address);
CREATE INDEX IF NOT EXISTS idx_access_control_created ON audit_access_control(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_control_granted ON audit_access_control(access_granted);

-- Commentaires pour documentation
COMMENT ON TABLE audit_access_control IS 'Logs de tous les accès aux audits (autorisés et refusés) pour détection d''abus';
COMMENT ON COLUMN audit_access_control.access_reason IS 'Raison de l''accès : free_trial, paid, admin_override, denied';
COMMENT ON COLUMN audit_access_control.denial_reason IS 'Raison du refus si access_granted=false';
COMMENT ON COLUMN audit_access_control.trust_score_at_access IS 'Score de confiance au moment de la tentative d''accès';

-- ============================================================================
-- ÉTAPE 6 : ACTIVER ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE company_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_access_control ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ÉTAPE 7 : CRÉER POLITIQUES RLS
-- ============================================================================

-- Politiques pour company_verification_logs
DROP POLICY IF EXISTS "Users can view own verification logs" ON company_verification_logs;
CREATE POLICY "Users can view own verification logs"
  ON company_verification_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all verification logs" ON company_verification_logs;
CREATE POLICY "Admins can view all verification logs"
  ON company_verification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can insert verification logs" ON company_verification_logs;
CREATE POLICY "Service role can insert verification logs"
  ON company_verification_logs FOR INSERT
  WITH CHECK (true); -- Seulement via service_role_key

-- Politiques pour audit_access_control
DROP POLICY IF EXISTS "Users can view own access logs" ON audit_access_control;
CREATE POLICY "Users can view own access logs"
  ON audit_access_control FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all access logs" ON audit_access_control;
CREATE POLICY "Admins can view all access logs"
  ON audit_access_control FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Service role can insert access logs" ON audit_access_control;
CREATE POLICY "Service role can insert access logs"
  ON audit_access_control FOR INSERT
  WITH CHECK (true); -- Seulement via service_role_key

-- ============================================================================
-- ÉTAPE 8 : METTRE À JOUR LES PROFILS EXISTANTS
-- ============================================================================

-- Initialiser trust_score et audits gratuits pour les utilisateurs existants
UPDATE profiles 
SET 
  trust_score = COALESCE(trust_score, 50), -- Score par défaut
  max_free_audits = COALESCE(max_free_audits, 3),
  free_audits_used = COALESCE(free_audits_used, 0)
WHERE trust_score IS NULL OR max_free_audits IS NULL OR free_audits_used IS NULL;

-- ============================================================================
-- ÉTAPE 9 : CRÉER FONCTION POUR CALCULER LE TRUST SCORE
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_trust_score(user_profile profiles)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
  email_domain TEXT;
  website_domain TEXT;
BEGIN
  -- 1. SIRET validé via API INSEE (30 points)
  IF user_profile.company_verified_at IS NOT NULL THEN
    score := score + 30;
  END IF;

  -- 2. Email professionnel correspondant au domaine du site (40 points)
  IF user_profile.professional_email IS NOT NULL AND user_profile.company_website IS NOT NULL THEN
    email_domain := split_part(user_profile.professional_email, '@', 2);
    website_domain := regexp_replace(user_profile.company_website, '^https?://(www\.)?', '');
    website_domain := split_part(website_domain, '/', 1);
    
    IF email_domain = website_domain THEN
      score := score + 40;
    END IF;
  END IF;

  -- 3. Document justificatif uploadé (20 points)
  IF user_profile.verification_document_url IS NOT NULL THEN
    score := score + 20;
  END IF;

  -- 4. Téléphone professionnel renseigné (10 points)
  IF user_profile.professional_phone IS NOT NULL THEN
    score := score + 10;
  END IF;

  RETURN score;
END;
$$;

COMMENT ON FUNCTION calculate_trust_score IS 'Calcule le score de confiance basé sur les données de vérification (0-100)';

-- ============================================================================
-- ÉTAPE 10 : CRÉER TRIGGER POUR METTRE À JOUR LE TRUST SCORE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_trust_score_on_profile_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Recalculer le trust score automatiquement
  NEW.trust_score := calculate_trust_score(NEW);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_trust_score ON profiles;
CREATE TRIGGER trigger_update_trust_score
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_trust_score_on_profile_change();

-- ============================================================================
-- ÉTAPE 11 : CRÉER VUE POUR ADMIN (UTILISATEURS À MODÉRER)
-- ============================================================================

CREATE OR REPLACE VIEW admin_pending_verifications AS
SELECT 
  p.id,
  p.email,
  p.user_first_name,
  p.user_last_name,
  p.company_siret,
  p.company_legal_name,
  p.professional_email,
  p.trust_score,
  p.free_audits_used,
  p.verification_document_url,
  p.created_at,
  COUNT(cvl.id) AS verification_attempts,
  MAX(cvl.created_at) AS last_verification_attempt
FROM profiles p
LEFT JOIN company_verification_logs cvl ON cvl.user_id = p.id
WHERE 
  p.trust_score < 30 
  AND p.free_audits_used = 0
  AND p.company_siret IS NOT NULL
GROUP BY p.id
ORDER BY p.created_at DESC;

COMMENT ON VIEW admin_pending_verifications IS 'Vue pour admins : utilisateurs avec trust_score < 30 nécessitant une validation manuelle';

-- ============================================================================
-- ÉTAPE 12 : CRÉER FONCTION POUR APPROUVER UN UTILISATEUR (ADMIN)
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_approve_user(
  target_user_id UUID,
  admin_user_id UUID,
  approval_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Vérifier que l'utilisateur est admin
  SELECT role = 'admin' INTO is_admin
  FROM profiles
  WHERE id = admin_user_id;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Seuls les admins peuvent approuver des utilisateurs';
  END IF;

  -- Mettre à jour le profil
  UPDATE profiles
  SET 
    trust_score = 80,
    legitimacy_verified_at = NOW()
  WHERE id = target_user_id;

  -- Logger l'approbation
  INSERT INTO company_verification_logs (
    user_id,
    siret,
    verification_type,
    verification_status,
    verified_by,
    notes
  )
  SELECT 
    target_user_id,
    company_siret,
    'admin_approval',
    'success',
    admin_user_id,
    approval_notes
  FROM profiles
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION admin_approve_user IS 'Permet à un admin d''approuver manuellement un utilisateur (trust_score = 80)';

-- ============================================================================
-- ÉTAPE 13 : CRÉER FONCTION POUR REJETER UN UTILISATEUR (ADMIN)
-- ============================================================================

CREATE OR REPLACE FUNCTION admin_reject_user(
  target_user_id UUID,
  admin_user_id UUID,
  rejection_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Vérifier que l'utilisateur est admin
  SELECT role = 'admin' INTO is_admin
  FROM profiles
  WHERE id = admin_user_id;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Seuls les admins peuvent rejeter des utilisateurs';
  END IF;

  -- Mettre à jour le profil
  UPDATE profiles
  SET 
    trust_score = 0,
    max_free_audits = 0
  WHERE id = target_user_id;

  -- Logger le rejet
  INSERT INTO company_verification_logs (
    user_id,
    siret,
    verification_type,
    verification_status,
    verified_by,
    notes
  )
  SELECT 
    target_user_id,
    company_siret,
    'admin_approval',
    'rejected',
    admin_user_id,
    rejection_reason
  FROM profiles
  WHERE id = target_user_id;

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION admin_reject_user IS 'Permet à un admin de rejeter un utilisateur suspect (trust_score = 0, audits bloqués)';

-- ============================================================================
-- ÉTAPE 14 : CRÉER VUE ANALYTICS POUR ADMIN
-- ============================================================================

CREATE OR REPLACE VIEW admin_audit_analytics AS
SELECT 
  DATE(aac.created_at) AS date,
  COUNT(*) AS total_attempts,
  COUNT(*) FILTER (WHERE aac.access_granted = true) AS granted,
  COUNT(*) FILTER (WHERE aac.access_granted = false) AS denied,
  COUNT(DISTINCT aac.user_id) AS unique_users,
  COUNT(DISTINCT aac.ip_address) AS unique_ips,
  AVG(aac.trust_score_at_access) AS avg_trust_score,
  COUNT(*) FILTER (WHERE aac.denial_reason = 'email_not_confirmed') AS denied_email_not_confirmed,
  COUNT(*) FILTER (WHERE aac.denial_reason = 'company_info_missing') AS denied_company_info_missing,
  COUNT(*) FILTER (WHERE aac.denial_reason = 'free_audits_exhausted') AS denied_free_audits_exhausted,
  COUNT(*) FILTER (WHERE aac.denial_reason = 'low_trust_score') AS denied_low_trust_score,
  COUNT(*) FILTER (WHERE aac.denial_reason = 'rate_limit_exceeded') AS denied_rate_limit
FROM audit_access_control aac
GROUP BY DATE(aac.created_at)
ORDER BY date DESC;

COMMENT ON VIEW admin_audit_analytics IS 'Analytics quotidiens des tentatives d''accès aux audits (pour admin)';

-- ============================================================================
-- ÉTAPE 15 : INSÉRER DONNÉES DE TEST (OPTIONNEL)
-- ============================================================================

-- Créer un utilisateur de test avec trust_score élevé
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- Vérifier si l'utilisateur existe déjà
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test@imotion.fr';

  -- Si l'utilisateur existe, mettre à jour son profil
  IF test_user_id IS NOT NULL THEN
    UPDATE profiles
    SET 
      company_siret = '12345678901234',
      company_siren = '123456789',
      company_legal_name = 'IMOTION SAS',
      company_address = '123 Avenue des Champs-Élysées, 75008 Paris',
      company_legal_form = 'SAS',
      company_website = 'https://www.imotion.fr',
      user_role = 'Dirigeant',
      user_first_name = 'Patrice',
      user_last_name = 'Simion',
      professional_email = 'patrice.simion@imotion.fr',
      professional_phone = '+33612345678',
      email_verified_at = NOW(),
      company_verified_at = NOW(),
      legitimacy_verified_at = NOW(),
      trust_score = 90,
      max_free_audits = 3,
      free_audits_used = 0
    WHERE id = test_user_id;

    RAISE NOTICE 'Profil de test mis à jour : test@imotion.fr';
  ELSE
    RAISE NOTICE 'Utilisateur test@imotion.fr non trouvé. Créez-le via l''interface d''inscription.';
  END IF;
END $$;

-- ============================================================================
-- ÉTAPE 16 : VÉRIFICATION FINALE
-- ============================================================================

-- Vérifier que toutes les colonnes ont été ajoutées
DO $$
DECLARE
  missing_columns TEXT[];
BEGIN
  SELECT ARRAY_AGG(column_name)
  INTO missing_columns
  FROM (
    VALUES 
      ('company_siret'),
      ('company_siren'),
      ('company_legal_name'),
      ('trust_score'),
      ('max_free_audits'),
      ('free_audits_used')
  ) AS required(column_name)
  WHERE NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
      AND column_name = required.column_name
  );

  IF missing_columns IS NOT NULL THEN
    RAISE EXCEPTION 'Colonnes manquantes dans profiles: %', array_to_string(missing_columns, ', ');
  ELSE
    RAISE NOTICE '✅ Toutes les colonnes ont été ajoutées à la table profiles';
  END IF;
END $$;

-- Vérifier que les tables ont été créées
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'company_verification_logs') THEN
    RAISE EXCEPTION 'Table company_verification_logs non créée';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_access_control') THEN
    RAISE EXCEPTION 'Table audit_access_control non créée';
  END IF;

  RAISE NOTICE '✅ Toutes les tables ont été créées';
END $$;

-- Afficher un résumé
SELECT 
  'profiles' AS table_name,
  COUNT(*) AS total_users,
  COUNT(*) FILTER (WHERE company_siret IS NOT NULL) AS users_with_siret,
  AVG(trust_score) AS avg_trust_score,
  SUM(free_audits_used) AS total_audits_used
FROM profiles
UNION ALL
SELECT 
  'company_verification_logs',
  COUNT(*),
  NULL,
  NULL,
  NULL
FROM company_verification_logs
UNION ALL
SELECT 
  'audit_access_control',
  COUNT(*),
  NULL,
  NULL,
  NULL
FROM audit_access_control;

-- ============================================================================
-- FIN DU DÉPLOIEMENT
-- ============================================================================

RAISE NOTICE '✅ Déploiement terminé avec succès !';
RAISE NOTICE 'Prochaines étapes :';
RAISE NOTICE '1. Déployer les Edge Functions (validate-company-siret, check-audit-access)';
RAISE NOTICE '2. Ajouter le secret INSEE_API_TOKEN dans Supabase';
RAISE NOTICE '3. Activer la confirmation email dans Supabase Auth';
RAISE NOTICE '4. Modifier le frontend via Lovable (page onboarding, ProtectedRoute)';
