-- ============================================================
-- Migration: Ajout Plan Profiles + Branding (Phase 1)
-- Date: 26 novembre 2025
-- Description: Support marque blanche + orchestration plan-aware
-- ============================================================

-- 1. Ajouter colonne branding à organizations
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT
'{
  "primary_color": "#d8232a",
  "logo_url": null,
  "company_name": "IMOTION",
  "accent_color": null,
  "footer_text": null
}'::jsonb;

COMMENT ON COLUMN organizations.branding IS 'Configuration marque blanche (logo, couleurs, nom)';

-- 2. Créer table plan_profiles (Grille tarifaire)
CREATE TABLE IF NOT EXISTS plan_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL UNIQUE, -- "starter", "agency", "enterprise", "one_shot"
  display_name TEXT NOT NULL,
  price_per_month DECIMAL(10, 2),
  annual_audits INTEGER,
  llm_budget_per_audit DECIMAL(10, 2),
  orchestration_time TEXT, -- "4h", "8-14h"
  report_pages TEXT, -- "30-40", "50-70", "80-120"
  scenarios_count INTEGER,
  infographics_count INTEGER,
  modules_config JSONB NOT NULL, -- Configuration des modules activés
  rédacteur_model TEXT, -- "gpt-4o", "gpt-4o-advanced", "gpt-4-turbo"
  rédacteur_temperature DECIMAL(3, 2),
  white_label BOOLEAN DEFAULT false,
  narrative_style TEXT, -- "concise", "balanced", "comprehensive"
  quality_level TEXT, -- "premium", "ultra_premium"
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE plan_profiles IS 'Profils de plans avec configuration orchestration par tier';

-- 3. Insérer les plans par défaut
INSERT INTO plan_profiles (
  tier,
  display_name,
  price_per_month,
  annual_audits,
  llm_budget_per_audit,
  orchestration_time,
  report_pages,
  scenarios_count,
  infographics_count,
  modules_config,
  rédacteur_model,
  rédacteur_temperature,
  white_label,
  narrative_style,
  quality_level
) VALUES
-- STARTER PLAN
(
  'starter',
  'Starter',
  149.00,
  60,
  3.40,
  '4h',
  '30-40',
  1,
  5,
  '{
    "scraping": true,
    "pestel": false,
    "porter_5_forces": false,
    "competitive_intel": false,
    "audit_marketing": "essential",
    "audit_commercial": "essential",
    "seo_sem": "quick_check",
    "content_marketing": false,
    "social_media": false,
    "email_marketing": false,
    "data_analytics": false,
    "pricing_intelligence": false
  }'::jsonb,
  'gpt-4o',
  0.35,
  false,
  'concise',
  'premium'
),
-- AGENCY PLAN
(
  'agency',
  'Agency',
  490.00,
  240,
  9.80,
  '8h',
  '50-70',
  3,
  12,
  '{
    "scraping": true,
    "pestel": true,
    "porter_5_forces": true,
    "competitive_intel": true,
    "audit_marketing": "deep",
    "audit_commercial": "deep",
    "seo_sem": "full_audit",
    "content_marketing": true,
    "social_media": true,
    "email_marketing": true,
    "data_analytics": true,
    "pricing_intelligence": false
  }'::jsonb,
  'gpt-4o-advanced',
  0.35,
  true,
  'balanced',
  'ultra_premium'
),
-- ENTERPRISE PLAN
(
  'enterprise',
  'Enterprise',
  2500.00,
  600,
  17.50,
  '8-14h',
  '80-120',
  7,
  20,
  '{
    "scraping": true,
    "pestel": true,
    "porter_5_forces": true,
    "competitive_intel": true,
    "audit_marketing": "ultra_deep",
    "audit_commercial": "ultra_deep",
    "seo_sem": "full_audit",
    "content_marketing": true,
    "social_media": true,
    "email_marketing": true,
    "data_analytics": true,
    "pricing_intelligence": true
  }'::jsonb,
  'gpt-4-turbo',
  0.30,
  true,
  'comprehensive',
  'ultra_premium'
),
-- ONE-SHOT PLAN
(
  'one_shot',
  'One-Shot',
  290.00,
  1,
  8.50,
  '6h',
  '45-60',
  3,
  10,
  '{
    "scraping": true,
    "pestel": true,
    "porter_5_forces": true,
    "competitive_intel": true,
    "audit_marketing": "deep",
    "audit_commercial": "deep",
    "seo_sem": "full_audit",
    "content_marketing": true,
    "social_media": true,
    "email_marketing": false,
    "data_analytics": false,
    "pricing_intelligence": false
  }'::jsonb,
  'gpt-4o-advanced',
  0.35,
  false,
  'balanced',
  'ultra_premium'
)
ON CONFLICT (tier) DO NOTHING;

-- 4. Modifier table pre_audits pour tracer le plan utilisé
ALTER TABLE pre_audits
ADD COLUMN IF NOT EXISTS plan_tier TEXT,
ADD COLUMN IF NOT EXISTS quality_level TEXT,
ADD COLUMN IF NOT EXISTS llm_budget_used DECIMAL(10, 2) DEFAULT 0;

COMMENT ON COLUMN pre_audits.plan_tier IS 'Tier du plan utilisé pour cet audit';
COMMENT ON COLUMN pre_audits.quality_level IS 'Niveau de qualité appliqué';
COMMENT ON COLUMN pre_audits.llm_budget_used IS 'Budget LLM réellement consommé';

-- 5. Créer bucket stockage logos (si n'existe pas)
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Politiques de sécurité storage
DO $$
BEGIN
  -- Policy pour upload
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Agency members upload logos'
  ) THEN
    CREATE POLICY "Agency members upload logos"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'agency-logos' AND
      auth.role() = 'authenticated'
    );
  END IF;

  -- Policy pour lecture publique
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Public access agency logos'
  ) THEN
    CREATE POLICY "Public access agency logos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'agency-logos');
  END IF;
END $$;

-- 7. Index pour performance
CREATE INDEX IF NOT EXISTS idx_pre_audits_plan_tier ON pre_audits(plan_tier);
CREATE INDEX IF NOT EXISTS idx_organizations_branding ON organizations USING GIN(branding);

-- 8. Fonction helper pour récupérer config plan
CREATE OR REPLACE FUNCTION get_plan_config(p_tier TEXT)
RETURNS TABLE (
  tier TEXT,
  display_name TEXT,
  modules_config JSONB,
  rédacteur_model TEXT,
  rédacteur_temperature DECIMAL,
  white_label BOOLEAN,
  narrative_style TEXT,
  quality_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pp.tier,
    pp.display_name,
    pp.modules_config,
    pp.rédacteur_model,
    pp.rédacteur_temperature,
    pp.white_label,
    pp.narrative_style,
    pp.quality_level
  FROM plan_profiles pp
  WHERE pp.tier = p_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_plan_config IS 'Récupère la configuration complète d''un plan par tier';

-- Fin de la migration
