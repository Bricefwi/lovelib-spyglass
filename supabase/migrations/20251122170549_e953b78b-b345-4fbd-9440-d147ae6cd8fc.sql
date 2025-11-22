-- ========================================
-- CORRECTION CRITIQUE: RLS sur audit_reports
-- ========================================
-- Les clients doivent voir UNIQUEMENT leurs rapports via created_by

-- Supprimer l'ancienne politique permissive
DROP POLICY IF EXISTS "Users can view their own audit reports" ON audit_reports;

-- ✅ Nouvelle politique restrictive: clients voient uniquement leurs rapports
CREATE POLICY "Users can view their own audit reports" 
ON audit_reports 
FOR SELECT 
USING (
  -- Admin peut tout voir
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Client voit uniquement ses rapports (via created_by)
  (auth.uid() = created_by)
  OR
  -- Client voit les rapports liés à ses audits (via pre_audit_id)
  EXISTS (
    SELECT 1 FROM pre_audits
    WHERE pre_audits.id = audit_reports.pre_audit_id
    AND pre_audits.created_by = auth.uid()
  )
);

-- ========================================
-- CORRECTION CRITIQUE: RLS sur audit_results
-- ========================================
-- Les clients doivent pouvoir voir les résultats de LEURS audits

-- Ajouter politique pour que les clients voient leurs résultats
CREATE POLICY "Users can view their own audit results" 
ON audit_results 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR
  EXISTS (
    SELECT 1 FROM pre_audits
    WHERE pre_audits.id = audit_results.pre_audit_id
    AND pre_audits.created_by = auth.uid()
  )
);

-- ========================================
-- CORRECTION CRITIQUE: RLS sur audit_steps
-- ========================================
-- Les clients doivent voir les étapes de LEURS audits

CREATE POLICY "Users can view their own audit steps" 
ON audit_steps 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR
  EXISTS (
    SELECT 1 FROM pre_audits
    WHERE pre_audits.id = audit_steps.pre_audit_id
    AND pre_audits.created_by = auth.uid()
  )
);

-- ========================================
-- CORRECTION CRITIQUE: RLS sur companies
-- ========================================
-- Les clients doivent voir UNIQUEMENT les entreprises liées à leurs audits

DROP POLICY IF EXISTS "Users can view their companies" ON companies;

CREATE POLICY "Users can view their companies" 
ON companies 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR
  -- Entreprise liée au profil de l'utilisateur
  id IN (SELECT company_id FROM profiles WHERE user_id = auth.uid())
  OR
  -- Entreprise liée aux audits de l'utilisateur
  id IN (SELECT company_id FROM pre_audits WHERE created_by = auth.uid())
);

-- ========================================
-- Commentaires de sécurité
-- ========================================
COMMENT ON POLICY "Users can view their own audit reports" ON audit_reports IS 
'Clients peuvent voir leurs rapports via created_by OU via leurs pre_audits. Admins voient tout.';

COMMENT ON POLICY "Users can view their own audit results" ON audit_results IS 
'Clients peuvent voir les résultats de leurs audits uniquement.';

COMMENT ON POLICY "Users can view their own audit steps" ON audit_steps IS 
'Clients peuvent voir les étapes de leurs audits uniquement.';

COMMENT ON POLICY "Users can view their companies" ON companies IS 
'Clients voient uniquement les entreprises liées à leur profil ou à leurs audits.';