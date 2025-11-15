-- ============================================================================
-- MIGRATION: Correctifs profiles, RLS et triggers audits
-- ============================================================================

-- 1. Trigger automatique création profil (CORRIGÉ avec bon enum)
CREATE OR REPLACE FUNCTION public.init_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    firstname, 
    lastname, 
    role, 
    trust_score, 
    free_audits_used, 
    account_status
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'firstname', ''),
    COALESCE(NEW.raw_user_meta_data->>'lastname', ''),
    'client'::app_role,
    50, 
    0, 
    'active'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_init_profile ON auth.users;
CREATE TRIGGER trg_init_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.init_profile();

-- 2. Politiques RLS profiles (SIMPLIFIÉES)
DROP POLICY IF EXISTS "Read and write own profile or service role" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile basic fields" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert on signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow profile insert on signup"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Triggers audits gratuits (CORRIGÉ avec pre_audits et created_by)
CREATE OR REPLACE FUNCTION public.check_free_audits_remaining()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = NEW.created_by 
    AND free_audits_used >= 3
  ) THEN
    RAISE EXCEPTION 'Limite atteinte : aucun audit gratuit restant';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_free_audits ON public.pre_audits;
CREATE TRIGGER trg_check_free_audits
BEFORE INSERT ON public.pre_audits
FOR EACH ROW
EXECUTE FUNCTION public.check_free_audits_remaining();

-- 4. Incrément automatique audits (CORRIGÉ avec pre_audits et created_by)
CREATE OR REPLACE FUNCTION public.increment_free_audits()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET 
    free_audits_used = free_audits_used + 1,
    last_audit_at = now()
  WHERE user_id = NEW.created_by;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_audits ON public.pre_audits;
CREATE TRIGGER trg_increment_audits
AFTER INSERT ON public.pre_audits
FOR EACH ROW
EXECUTE FUNCTION public.increment_free_audits();