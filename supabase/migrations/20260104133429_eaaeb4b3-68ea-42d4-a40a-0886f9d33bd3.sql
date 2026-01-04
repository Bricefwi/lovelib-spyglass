-- Fix security warning: Set search_path for function
DROP FUNCTION IF EXISTS get_follow_up_limit(TEXT);

CREATE OR REPLACE FUNCTION public.get_follow_up_limit(plan_tier TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE 
    WHEN plan_tier = 'enterprise' THEN 30
    WHEN plan_tier = 'agency' THEN 15
    WHEN plan_tier = 'pro' THEN 5
    ELSE 3
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;