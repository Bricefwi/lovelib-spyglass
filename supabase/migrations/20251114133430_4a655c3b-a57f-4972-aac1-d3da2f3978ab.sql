-- Create table for AI news reports
CREATE TABLE IF NOT EXISTS public.ai_news_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  summary TEXT NOT NULL,
  top_news JSONB NOT NULL DEFAULT '[]'::jsonb,
  trends JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  html_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_news_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone to read reports (public data)
CREATE POLICY "Anyone can view AI news reports"
  ON public.ai_news_reports
  FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update reports
CREATE POLICY "Admins can insert AI news reports"
  ON public.ai_news_reports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update AI news reports"
  ON public.ai_news_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Index for faster date queries
CREATE INDEX idx_ai_news_reports_date ON public.ai_news_reports(date DESC);

-- Trigger for updated_at
CREATE TRIGGER update_ai_news_reports_updated_at
  BEFORE UPDATE ON public.ai_news_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();