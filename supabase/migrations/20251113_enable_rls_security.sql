-- Migration: Activation RLS et Sécurisation des Tables
-- Date: 2025-11-13
-- Description: Active Row Level Security sur toutes les tables sensibles et crée les politiques d'accès

-- ============================================================================
-- 1. ACTIVATION DE RLS SUR TOUTES LES TABLES
-- ============================================================================

-- Tables principales
ALTER TABLE IF EXISTS pre_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agent_orchestrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. SUPPRESSION DES ANCIENNES POLITIQUES (si elles existent)
-- ============================================================================

DROP POLICY IF EXISTS "Admins can view all pre_audits" ON pre_audits;
DROP POLICY IF EXISTS "Admins can insert pre_audits" ON pre_audits;
DROP POLICY IF EXISTS "Admins can update pre_audits" ON pre_audits;
DROP POLICY IF EXISTS "Admins can delete pre_audits" ON pre_audits;

DROP POLICY IF EXISTS "Admins can view all audit_reports" ON audit_reports;
DROP POLICY IF EXISTS "Admins can insert audit_reports" ON audit_reports;
DROP POLICY IF EXISTS "Admins can update audit_reports" ON audit_reports;

DROP POLICY IF EXISTS "Admins can view all audit_steps" ON audit_steps;
DROP POLICY IF EXISTS "Service role can manage audit_steps" ON audit_steps;

DROP POLICY IF EXISTS "Admins can view all orchestrations" ON agent_orchestrations;
DROP POLICY IF EXISTS "Service role can manage orchestrations" ON agent_orchestrations;

DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- ============================================================================
-- 3. FONCTION HELPER POUR VÉRIFIER SI L'UTILISATEUR EST ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. POLITIQUES RLS POUR pre_audits
-- ============================================================================

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all pre_audits"
  ON pre_audits
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Les admins peuvent créer des audits
CREATE POLICY "Admins can insert pre_audits"
  ON pre_audits
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Les admins peuvent modifier des audits
CREATE POLICY "Admins can update pre_audits"
  ON pre_audits
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Les admins peuvent supprimer des audits
CREATE POLICY "Admins can delete pre_audits"
  ON pre_audits
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Service role peut tout faire (pour les Edge Functions)
CREATE POLICY "Service role can manage pre_audits"
  ON pre_audits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. POLITIQUES RLS POUR audit_reports
-- ============================================================================

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all audit_reports"
  ON audit_reports
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Les admins peuvent créer des rapports
CREATE POLICY "Admins can insert audit_reports"
  ON audit_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Les admins peuvent modifier des rapports
CREATE POLICY "Admins can update audit_reports"
  ON audit_reports
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Service role peut tout faire
CREATE POLICY "Service role can manage audit_reports"
  ON audit_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Accès public en lecture pour les rapports (via lien direct)
CREATE POLICY "Public can view audit_reports by ID"
  ON audit_reports
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================================================
-- 6. POLITIQUES RLS POUR audit_steps
-- ============================================================================

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all audit_steps"
  ON audit_steps
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Service role peut tout faire
CREATE POLICY "Service role can manage audit_steps"
  ON audit_steps
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 7. POLITIQUES RLS POUR agent_orchestrations
-- ============================================================================

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all orchestrations"
  ON agent_orchestrations
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Service role peut tout faire
CREATE POLICY "Service role can manage orchestrations"
  ON agent_orchestrations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 8. POLITIQUES RLS POUR companies
-- ============================================================================

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all companies"
  ON companies
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Les admins peuvent gérer les entreprises
CREATE POLICY "Admins can manage companies"
  ON companies
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Service role peut tout faire
CREATE POLICY "Service role can manage companies"
  ON companies
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 9. POLITIQUES RLS POUR user_roles
-- ============================================================================

-- Les utilisateurs peuvent voir leur propre rôle
CREATE POLICY "Users can view their own role"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Les admins peuvent voir tous les rôles
CREATE POLICY "Admins can view all roles"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Les admins peuvent gérer les rôles
CREATE POLICY "Admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Service role peut tout faire
CREATE POLICY "Service role can manage roles"
  ON user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 10. COMMENTAIRES POUR DOCUMENTATION
-- ============================================================================

COMMENT ON FUNCTION is_admin() IS 'Vérifie si l''utilisateur connecté a le rôle admin';

COMMENT ON POLICY "Admins can view all pre_audits" ON pre_audits IS 'Seuls les admins peuvent consulter tous les pré-audits';
COMMENT ON POLICY "Service role can manage pre_audits" ON pre_audits IS 'Le service role (Edge Functions) peut gérer les pré-audits';

COMMENT ON POLICY "Public can view audit_reports by ID" ON audit_reports IS 'Les rapports sont accessibles publiquement via leur ID (lien direct)';

-- ============================================================================
-- 11. GRANTS POUR SERVICE ROLE
-- ============================================================================

GRANT ALL ON pre_audits TO service_role;
GRANT ALL ON audit_reports TO service_role;
GRANT ALL ON audit_steps TO service_role;
GRANT ALL ON agent_orchestrations TO service_role;
GRANT ALL ON companies TO service_role;
GRANT ALL ON user_roles TO service_role;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
