-- ============================================
-- BLOG AUTO-GENERATION CRON JOB
-- ============================================
-- Configure automatic blog article generation every 15 days

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to trigger the Edge Function
CREATE OR REPLACE FUNCTION trigger_blog_generation()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url TEXT;
  supabase_anon_key TEXT;
  response TEXT;
BEGIN
  -- Get the Supabase URL and anon key from environment
  edge_function_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/generate-blog-article';
  supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);

  -- Call the Edge Function using http extension
  SELECT content::text INTO response
  FROM http((
    'POST',
    edge_function_url,
    ARRAY[http_header('apikey', supabase_anon_key), http_header('Content-Type', 'application/json')],
    'application/json',
    '{"manual": false}'
  )::http_request);

  -- Log the result
  RAISE NOTICE 'Blog generation triggered: %', response;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to trigger blog generation: %', SQLERRM;
END;
$$;

-- Schedule the cron job to run every 15 days at 10:00 AM
-- This will generate 2 articles per month
SELECT cron.schedule(
  'generate-blog-article-biweekly',
  '0 10 1,15 * *', -- At 10:00 on day 1 and 15 of every month
  $$SELECT trigger_blog_generation()$$
);

-- Alternative: If pg_cron is not available, create a table to track generation
CREATE TABLE IF NOT EXISTS blog_generation_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_generated_at TIMESTAMPTZ DEFAULT now(),
  next_generation_at TIMESTAMPTZ DEFAULT now() + INTERVAL '15 days',
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert initial record
INSERT INTO blog_generation_schedule (last_generated_at, next_generation_at, status)
VALUES (now(), now() + INTERVAL '15 days', 'completed')
ON CONFLICT DO NOTHING;

-- Create a function to check if blog generation is due
CREATE OR REPLACE FUNCTION is_blog_generation_due()
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  last_schedule RECORD;
BEGIN
  SELECT * INTO last_schedule
  FROM blog_generation_schedule
  ORDER BY created_at DESC
  LIMIT 1;

  IF last_schedule IS NULL THEN
    RETURN true;
  END IF;

  RETURN now() >= last_schedule.next_generation_at;
END;
$$;

-- Create a trigger function to update next_generation_at after successful generation
CREATE OR REPLACE FUNCTION update_blog_schedule_after_generation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the schedule for next generation
  UPDATE blog_generation_schedule
  SET 
    last_generated_at = NEW.published_at,
    next_generation_at = NEW.published_at + INTERVAL '15 days',
    status = 'completed',
    updated_at = now()
  WHERE id = (SELECT id FROM blog_generation_schedule ORDER BY created_at DESC LIMIT 1);

  RETURN NEW;
END;
$$;

-- Create trigger on blog_articles table
DROP TRIGGER IF EXISTS after_blog_article_insert ON blog_articles;
CREATE TRIGGER after_blog_article_insert
AFTER INSERT ON blog_articles
FOR EACH ROW
EXECUTE FUNCTION update_blog_schedule_after_generation();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION trigger_blog_generation() TO authenticated;
GRANT EXECUTE ON FUNCTION is_blog_generation_due() TO authenticated;
GRANT SELECT, INSERT, UPDATE ON blog_generation_schedule TO authenticated;

-- Create a view for admin to monitor blog generation
CREATE OR REPLACE VIEW blog_generation_status AS
SELECT 
  bgs.id,
  bgs.last_generated_at,
  bgs.next_generation_at,
  bgs.status,
  bgs.error_message,
  CASE 
    WHEN now() >= bgs.next_generation_at THEN 'DUE'
    ELSE 'SCHEDULED'
  END as generation_status,
  EXTRACT(DAY FROM (bgs.next_generation_at - now())) as days_until_next,
  (SELECT COUNT(*) FROM blog_articles WHERE published_at >= bgs.last_generated_at) as articles_since_last
FROM blog_generation_schedule bgs
ORDER BY bgs.created_at DESC
LIMIT 1;

GRANT SELECT ON blog_generation_status TO authenticated;

-- Add comment
COMMENT ON TABLE blog_generation_schedule IS 'Tracks automatic blog article generation schedule (every 15 days)';
COMMENT ON FUNCTION trigger_blog_generation() IS 'Triggers the generate-blog-article Edge Function';
COMMENT ON FUNCTION is_blog_generation_due() IS 'Checks if a new blog article generation is due';
