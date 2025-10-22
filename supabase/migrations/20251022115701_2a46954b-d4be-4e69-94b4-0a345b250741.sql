-- Table FAQ avec seed
CREATE TABLE IF NOT EXISTS public.faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer_html TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  order_index INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_faq_order ON public.faq_entries(order_index);

ALTER TABLE public.faq_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faq_public_read" ON public.faq_entries FOR SELECT USING (true);

-- Seed 10 FAQ techniques
INSERT INTO public.faq_entries(question, answer_html, tags, order_index) VALUES
('Comment calculez-vous le CAC par canal ?',
 '<p><strong>Formule</strong> : CAC_canal = Dépenses_canal / Conversions_attribuées (période). Indiquez la période et n conversions.</p>',
 '{CAC,Attribution}', 1),
('Quelle formule LTV utilisez-vous ?',
 '<p><code>LTV = ARPA × (1/churn_mensuel) × marge</code>. Exemple : 79€ × (1/0,03) × 0,80 = 2 107€.</p>',
 '{LTV,Finance}', 2),
('Qu''est-ce que le score RICE ?',
 '<p><code>RICE = (Reach × Impact × Confidence) / Effort</code>. Sert à prioriser les initiatives.</p>',
 '{Priorisation,Roadmap}', 3),
('Pipeline coverage idéal ?',
 '<p>Règle : 3× à 4× la cible trimestrielle selon cycle et win rate.</p>',
 '{Pipeline,Forecast}', 4),
('Win rate acceptable par segment ?',
 '<p>Mid-market : 20–30%. Enterprise : 10–20%.</p>',
 '{WinRate}', 5),
('Fenêtre d''attribution recommandée ?',
 '<p>30 à 90 jours. Multi-touch si volume suffisant, sinon last-touch ajusté.</p>',
 '{Attribution}', 6),
('Comment valider un forecast ?',
 '<p>Backtest 4 trimestres, Brier score + MAE, Monte Carlo 90j (1 000 tirages).</p>',
 '{Forecast}', 7),
('Seuil d''alerte churn mensuel ?',
 '<p>>3–5% : alerte forte. <2% : acceptable. <1% : performant.</p>',
 '{Churn}', 8),
('Ratio LTV:CAC à viser ?',
 '<p>≥ 3,0 en cible. <2,0 : inefficience ; >5,0 : sous-investissement possible.</p>',
 '{LTV,CAC}', 9),
('Relier KPI et budget marketing ?',
 '<p>Vérifier la contrainte <code>CAC × volume</code> ≤ budget mensuel alloué.</p>',
 '{Budget,KPI}', 10);

-- Ajouter colonne tags à blog_articles si pas présente
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blog_articles' 
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.blog_articles ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Ajouter tags aux articles existants basés sur la catégorie
UPDATE public.blog_articles
SET tags = CASE category
  WHEN 'analyse' THEN ARRAY['Marketing', 'Automation', 'ROI']
  WHEN 'strategie' THEN ARRAY['Sales', 'Outbound', 'PME']
  WHEN 'performance' THEN ARRAY['ROI', 'Finance', 'Marketing']
  ELSE ARRAY['Marketing']
END
WHERE tags = '{}' OR tags IS NULL;