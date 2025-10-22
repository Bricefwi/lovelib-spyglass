-- Ajouts non destructifs pour le blog
DO $$ 
BEGIN
  -- Ajout colonne sources si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_articles' 
    AND column_name = 'sources'
  ) THEN
    ALTER TABLE public.blog_articles ADD COLUMN sources JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Ajout colonne chart_spec si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_articles' 
    AND column_name = 'chart_spec'
  ) THEN
    ALTER TABLE public.blog_articles ADD COLUMN chart_spec JSONB DEFAULT NULL;
  END IF;

  -- Ajout colonne reliability_score si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_articles' 
    AND column_name = 'reliability_score'
  ) THEN
    ALTER TABLE public.blog_articles ADD COLUMN reliability_score NUMERIC DEFAULT 0.0;
  END IF;
END $$;