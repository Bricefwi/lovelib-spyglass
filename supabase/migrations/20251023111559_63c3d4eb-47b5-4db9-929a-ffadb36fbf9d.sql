-- Ajouter les colonnes manquantes à companies si elles n'existent pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='companies' AND column_name='financials') THEN
    ALTER TABLE public.companies ADD COLUMN financials jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Modifier pre_audits pour avoir les nouvelles colonnes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pre_audits' AND column_name='timeline') THEN
    ALTER TABLE public.pre_audits ADD COLUMN timeline jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pre_audits' AND column_name='sources_raw') THEN
    ALTER TABLE public.pre_audits ADD COLUMN sources_raw jsonb DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='pre_audits' AND column_name='created_by') THEN
    ALTER TABLE public.pre_audits ADD COLUMN created_by uuid;
  END IF;
END $$;

-- Table audit_reports (rapports HTML)
CREATE TABLE IF NOT EXISTS public.audit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_audit_id uuid REFERENCES public.pre_audits(id) ON DELETE CASCADE,
  title text,
  html text,
  created_at timestamptz DEFAULT now()
);

-- RLS pour audit_reports
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_reports_read ON public.audit_reports;
CREATE POLICY audit_reports_read ON public.audit_reports FOR SELECT USING (true);
DROP POLICY IF EXISTS audit_reports_insert ON public.audit_reports;
CREATE POLICY audit_reports_insert ON public.audit_reports FOR INSERT WITH CHECK (true);

-- Mise à jour des policies pre_audits
DROP POLICY IF EXISTS preaudits_update ON public.pre_audits;
CREATE POLICY preaudits_update ON public.pre_audits FOR UPDATE USING (true);