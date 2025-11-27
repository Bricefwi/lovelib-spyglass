-- Ajouter les colonnes pour gérer les plans d'abonnement dans la table profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_tier TEXT CHECK (plan_tier IN ('starter', 'agency', 'enterprise', 'one_shot')),
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due'));

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_profiles_plan_tier ON public.profiles(plan_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- Commentaires pour documentation
COMMENT ON COLUMN public.profiles.plan_tier IS 'Type de plan d''abonnement: starter, agency, enterprise, ou one_shot';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Statut de l''abonnement: active, inactive, cancelled, past_due';