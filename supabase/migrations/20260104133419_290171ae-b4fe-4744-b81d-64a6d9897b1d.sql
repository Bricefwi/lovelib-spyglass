-- Add follow-up conversation support to pre_audits
ALTER TABLE public.pre_audits 
ADD COLUMN IF NOT EXISTS follow_up_messages_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS follow_up_token TEXT,
ADD COLUMN IF NOT EXISTS follow_up_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS conversation_history JSONB DEFAULT '[]'::jsonb;

-- Create index for follow_up_token lookup
CREATE INDEX IF NOT EXISTS idx_pre_audits_follow_up_token ON public.pre_audits(follow_up_token) WHERE follow_up_token IS NOT NULL;

-- Function to get follow-up message limit by plan
CREATE OR REPLACE FUNCTION get_follow_up_limit(plan_tier TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE 
    WHEN plan_tier = 'enterprise' THEN 30
    WHEN plan_tier = 'agency' THEN 15
    WHEN plan_tier = 'pro' THEN 5
    ELSE 3  -- freemium/discovery
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;