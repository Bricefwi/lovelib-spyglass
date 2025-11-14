-- Add company and onboarding columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_siret TEXT,
ADD COLUMN IF NOT EXISTS company_siren TEXT,
ADD COLUMN IF NOT EXISTS company_legal_name TEXT,
ADD COLUMN IF NOT EXISTS company_address TEXT,
ADD COLUMN IF NOT EXISTS company_legal_form TEXT,
ADD COLUMN IF NOT EXISTS company_creation_date DATE,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS professional_email TEXT,
ADD COLUMN IF NOT EXISTS professional_phone TEXT,
ADD COLUMN IF NOT EXISTS verification_document_url TEXT,
ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'api_recherche_entreprise',
ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS free_audits_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS blocked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_audit_at TIMESTAMP WITH TIME ZONE;

-- Add index on company_siret for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company_siret ON public.profiles(company_siret);

-- Add index on account_status
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);

-- Create function to automatically update last_audit_at when a pre_audit is created
CREATE OR REPLACE FUNCTION update_last_audit_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_audit_at = NEW.created_at
  WHERE user_id = NEW.created_by;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_audit_at
DROP TRIGGER IF EXISTS trigger_update_last_audit_at ON public.pre_audits;
CREATE TRIGGER trigger_update_last_audit_at
  AFTER INSERT ON public.pre_audits
  FOR EACH ROW
  EXECUTE FUNCTION update_last_audit_at();

-- Create function to calculate trust score based on verification data
CREATE OR REPLACE FUNCTION calculate_trust_score()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 50; -- Base score
BEGIN
  -- SIRET validé via API (+30 points)
  IF NEW.company_siret IS NOT NULL AND NEW.verification_method = 'api_recherche_entreprise' THEN
    score := score + 30;
  END IF;

  -- Email professionnel (+10 points)
  IF NEW.professional_email IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- Téléphone professionnel (+5 points)
  IF NEW.professional_phone IS NOT NULL THEN
    score := score + 5;
  END IF;

  -- Document justificatif (+15 points)
  IF NEW.verification_document_url IS NOT NULL THEN
    score := score + 15;
  END IF;

  -- Site web (+5 points)
  IF NEW.company_website IS NOT NULL THEN
    score := score + 5;
  END IF;

  -- Cap le score à 100
  IF score > 100 THEN
    score := 100;
  END IF;

  NEW.trust_score := score;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate trust score
DROP TRIGGER IF EXISTS trigger_calculate_trust_score ON public.profiles;
CREATE TRIGGER trigger_calculate_trust_score
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_trust_score();

-- Comment on columns
COMMENT ON COLUMN public.profiles.trust_score IS 'Score de confiance calculé automatiquement (0-100). Basé sur: SIRET validé (+30), email pro (+10), téléphone (+5), document (+15), site web (+5)';
COMMENT ON COLUMN public.profiles.free_audits_used IS 'Nombre d audits gratuits utilisés (max 3)';
COMMENT ON COLUMN public.profiles.account_status IS 'Statut du compte: pending, active, rejected';
COMMENT ON COLUMN public.profiles.blocked_until IS 'Date jusqu à laquelle le compte est bloqué (NULL = non bloqué)';
