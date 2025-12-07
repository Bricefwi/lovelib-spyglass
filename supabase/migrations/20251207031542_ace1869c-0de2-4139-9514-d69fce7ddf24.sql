-- Ajout des colonnes Business pour Marque Blanche et Abonnements
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'discovery',
ADD COLUMN IF NOT EXISTS branding_config JSONB DEFAULT '{"primary_color": "#d8232a", "logo_url": null, "company_name": "IMOTION"}'::jsonb;

-- Index pour optimiser les requêtes par plan
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);

-- Commentaires pour documentation
COMMENT ON COLUMN profiles.subscription_plan IS 'Plan d''abonnement: discovery, pro, agency, enterprise';
COMMENT ON COLUMN profiles.branding_config IS 'Configuration marque blanche: primary_color, logo_url, company_name';