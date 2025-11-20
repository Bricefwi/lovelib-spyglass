-- ============================================
-- SECURITY FIX: Add SET search_path to functions
-- ============================================
-- Fixes potential privilege escalation via search_path manipulation
-- in SECURITY DEFINER functions

-- Fix 1: calculate_trust_score
CREATE OR REPLACE FUNCTION public.calculate_trust_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed search_path
AS $function$
DECLARE
  score INTEGER := 50;
BEGIN
  IF NEW.company_siret IS NOT NULL AND NEW.verification_method = 'api_recherche_entreprise' THEN
    score := score + 30;
  END IF;

  IF NEW.professional_email IS NOT NULL THEN
    score := score + 10;
  END IF;

  IF NEW.professional_phone IS NOT NULL THEN
    score := score + 5;
  END IF;

  IF NEW.verification_document_url IS NOT NULL THEN
    score := score + 15;
  END IF;

  IF NEW.company_website IS NOT NULL THEN
    score := score + 5;
  END IF;

  IF score > 100 THEN
    score := 100;
  END IF;

  NEW.trust_score := score;
  RETURN NEW;
END;
$function$;

-- Fix 2: update_last_audit_at
CREATE OR REPLACE FUNCTION public.update_last_audit_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed search_path
AS $function$
BEGIN
  UPDATE public.profiles
  SET last_audit_at = NEW.created_at
  WHERE user_id = NEW.created_by;
  RETURN NEW;
END;
$function$;

-- Fix 3: init_profile
CREATE OR REPLACE FUNCTION public.init_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed search_path
AS $function$
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
$function$;

-- Fix 4: log_profile_changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ✅ Fixed search_path
AS $function$
BEGIN
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
$function$;

-- Fix 5: increment_free_audits
CREATE OR REPLACE FUNCTION public.increment_free_audits()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public  -- ✅ Fixed search_path
AS $function$
BEGIN
  UPDATE public.profiles
  SET 
    free_audits_used = free_audits_used + 1,
    last_audit_at = now()
  WHERE user_id = NEW.created_by;
  RETURN NEW;
END;
$function$;

-- Fix 6: check_free_audits_remaining
CREATE OR REPLACE FUNCTION public.check_free_audits_remaining()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public  -- ✅ Fixed search_path
AS $function$
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
$function$;

-- Fix 7: touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public  -- ✅ Fixed search_path
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix 8: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public  -- ✅ Fixed search_path
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Verification query
SELECT 
  p.proname as function_name,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_type,
  CASE 
    WHEN pg_get_functiondef(p.oid) LIKE '%SET search_path%' THEN '✅ Fixed'
    ELSE '⚠️ Not Fixed'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'calculate_trust_score',
    'update_last_audit_at',
    'init_profile',
    'log_profile_changes',
    'increment_free_audits',
    'check_free_audits_remaining',
    'touch_updated_at',
    'update_updated_at_column'
  )
ORDER BY p.proname;