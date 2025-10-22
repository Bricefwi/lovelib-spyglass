-- 1) Table pré-audit (brut consolidé)
CREATE TABLE IF NOT EXISTS public.pre_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  domain TEXT GENERATED ALWAYS AS (regexp_replace(url, '^https?://([^/]+).*$', '\1')) STORED,
  company_guess TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | collecting | consolidated | failed
  raw_sources JSONB DEFAULT '{}'::jsonb,  -- dumps par source (site, pplx, gemini, openai)
  consolidated JSONB,                     -- profil fusionné
  confidence NUMERIC,                     -- 0..1
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Table résultats d'audit (rapport rédigé)
CREATE TABLE IF NOT EXISTS public.audit_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_audit_id UUID REFERENCES public.pre_audits(id) ON DELETE CASCADE,
  summary TEXT,            -- résumé court
  report_md TEXT,          -- rapport complet en Markdown
  report_pdf_url TEXT,     -- URL vers PDF généré
  scores JSONB,            -- {maturite, marketing, sales, data, ia, tech}
  scenarios JSONB,         -- 4 parcours : ambitieux, raisonnable, opportuniste, mix
  kpis JSONB,              -- KPIs clés extraits
  sources JSONB,           -- liste de sources citées (url + fiabilité)
  confidence NUMERIC,      -- 0..1
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Table des sources unitaires (traçabilité fine)
CREATE TABLE IF NOT EXISTS public.audit_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_audit_id UUID REFERENCES public.pre_audits(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,        -- site|perplexity|gemini|openai
  query TEXT,
  url TEXT,
  snippet TEXT,
  reliability NUMERIC,           -- 0..1
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pre_audits_touch ON public.pre_audits;
CREATE TRIGGER trg_pre_audits_touch
BEFORE UPDATE ON public.pre_audits
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- RLS
ALTER TABLE public.pre_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_sources ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (accès public pour ce cas d'usage)
DROP POLICY IF EXISTS pre_audits_public_select ON public.pre_audits;
CREATE POLICY pre_audits_public_select ON public.pre_audits
  FOR SELECT USING (true);

DROP POLICY IF EXISTS pre_audits_public_insert ON public.pre_audits;
CREATE POLICY pre_audits_public_insert ON public.pre_audits
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS pre_audits_public_update ON public.pre_audits;
CREATE POLICY pre_audits_public_update ON public.pre_audits
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS audit_results_public_select ON public.audit_results;
CREATE POLICY audit_results_public_select ON public.audit_results
  FOR SELECT USING (true);

DROP POLICY IF EXISTS audit_results_public_insert ON public.audit_results;
CREATE POLICY audit_results_public_insert ON public.audit_results
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS audit_sources_public_select ON public.audit_sources;
CREATE POLICY audit_sources_public_select ON public.audit_sources
  FOR SELECT USING (true);

DROP POLICY IF EXISTS audit_sources_public_insert ON public.audit_sources;
CREATE POLICY audit_sources_public_insert ON public.audit_sources
  FOR INSERT WITH CHECK (true);