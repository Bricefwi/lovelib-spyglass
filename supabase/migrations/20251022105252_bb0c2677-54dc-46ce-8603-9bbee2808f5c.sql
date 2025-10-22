-- ARTICLES
CREATE TABLE IF NOT EXISTS blog_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_md TEXT NOT NULL,
  cover_url TEXT,
  cover_credit TEXT,
  category TEXT CHECK (category IN ('articles','etudes-de-cas','cas-clients','infographies','chiffres-cles')),
  sources JSONB DEFAULT '[]'::jsonb,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  author_name TEXT DEFAULT 'Équipe IMOTION',
  author_role TEXT DEFAULT 'Consultant'
);

-- TAGS
CREATE TABLE IF NOT EXISTS blog_tags (
  id SERIAL PRIMARY KEY,
  tag TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS blog_article_tags (
  article_id UUID REFERENCES blog_articles(id) ON DELETE CASCADE,
  tag_id INT REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY(article_id, tag_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_articles(published_at);

-- RLS (lecture publique si published_at non null)
ALTER TABLE blog_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY blog_read_published ON blog_articles
  FOR SELECT USING (published_at IS NOT NULL);

ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY blog_tags_read ON blog_tags
  FOR SELECT USING (true);

ALTER TABLE blog_article_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY blog_article_tags_read ON blog_article_tags
  FOR SELECT USING (true);

-- Trigger pour updated_at
CREATE TRIGGER update_blog_articles_updated_at
  BEFORE UPDATE ON blog_articles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();