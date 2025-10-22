-- Normaliser les articles existants
UPDATE public.blog_articles
SET published_at = COALESCE(published_at, NOW()),
    category = CASE
      WHEN LOWER(category) IN ('articles','etudes-de-cas','cas-clients','infographies','chiffres-cles')
      THEN LOWER(category)
      ELSE 'articles'
    END
WHERE published_at IS NULL 
   OR category IS NULL 
   OR category NOT IN ('articles','etudes-de-cas','cas-clients','infographies','chiffres-cles');