-- Créer l'enum pour les statuts d'audit
DO $$ BEGIN
  CREATE TYPE audit_status AS ENUM (
    'new',
    'collecting',
    'ai_running',
    'consolidating',
    'pre_report_ready',
    'sent',
    'needs_review',
    'error'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Ajouter les colonnes de statut et métadonnées aux pré-audits
ALTER TABLE public.pre_audits
  ADD COLUMN IF NOT EXISTS last_step TEXT,
  ADD COLUMN IF NOT EXISTS report_html_url TEXT;

-- Créer la table des étapes (timeline)
CREATE TABLE IF NOT EXISTS public.audit_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_audit_id UUID NOT NULL REFERENCES public.pre_audits(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','running','done','error')),
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_audit_steps_pre ON public.audit_steps(pre_audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_steps_status ON public.audit_steps(status);

-- Activer RLS sur audit_steps
ALTER TABLE public.audit_steps ENABLE ROW LEVEL SECURITY;

-- Politique RLS pour lecture publique des étapes
DO $$ BEGIN
  CREATE POLICY audit_steps_public_select 
    ON public.audit_steps 
    FOR SELECT 
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Politique RLS pour insertion publique des étapes
DO $$ BEGIN
  CREATE POLICY audit_steps_public_insert 
    ON public.audit_steps 
    FOR INSERT 
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Créer une vue pratique pour le dashboard admin
CREATE OR REPLACE VIEW public.v_admin_audits AS
SELECT
  pa.id,
  pa.url,
  pa.domain,
  pa.company_guess,
  pa.status,
  pa.confidence,
  pa.last_step,
  pa.report_html_url,
  pa.created_at,
  pa.updated_at,
  COUNT(s.id) FILTER (WHERE s.status='done') AS steps_done,
  COUNT(s.id) AS total_steps
FROM pre_audits pa
LEFT JOIN audit_steps s ON s.pre_audit_id = pa.id
GROUP BY pa.id;