-- ============================================================
-- TABLE PRE_AUDITS : Ajout colonnes MANUS IA 2.0
-- ============================================================

-- Ajouter les colonnes manquantes pour MANUS IA 2.0
ALTER TABLE public.pre_audits 
ADD COLUMN IF NOT EXISTS company_siret TEXT,
ADD COLUMN IF NOT EXISTS current_phase TEXT DEFAULT 'PHASE_0_INIT';

-- Index pour performance sur les recherches par SIRET
CREATE INDEX IF NOT EXISTS idx_pre_audits_siret ON public.pre_audits(company_siret);
CREATE INDEX IF NOT EXISTS idx_pre_audits_current_phase ON public.pre_audits(current_phase);

-- Renommer 'consolidated' en 'consolidated_report' pour plus de clarté (optionnel, garde la compatibilité)
-- Note: on garde 'consolidated' tel quel pour ne pas casser l'existant
-- et on considère 'confidence' comme 'quality_score'

-- ============================================================
-- RLS POLICIES : Alignement avec MANUS IA 2.0
-- ============================================================

-- 1. Politique de lecture : utilisateur propriétaire OU admin
DROP POLICY IF EXISTS "Users can view their own pre_audits" ON public.pre_audits;
CREATE POLICY "Users can view their own pre_audits"
ON public.pre_audits
FOR SELECT
TO authenticated
USING (
  auth.uid() = created_by 
  OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- 2. Politique d'insertion : utilisateur propriétaire uniquement
DROP POLICY IF EXISTS "Users can create their own pre_audits" ON public.pre_audits;
CREATE POLICY "Users can create their own pre_audits"
ON public.pre_audits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- 3. Politique de mise à jour : Service role (Edge Functions) + Admin
DROP POLICY IF EXISTS "Service role and admins can update pre_audits" ON public.pre_audits;
CREATE POLICY "Service role and admins can update pre_audits"
ON public.pre_audits
FOR UPDATE
TO service_role, authenticated
USING (
  (auth.jwt() ->> 'role')::text = 'service_role'
  OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- ============================================================
-- Note : Les policies admin existantes restent actives
-- ============================================================