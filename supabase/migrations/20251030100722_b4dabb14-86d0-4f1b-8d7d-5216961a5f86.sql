-- Ajouter les colonnes manquantes à la table audit_reports
ALTER TABLE audit_reports 
ADD COLUMN IF NOT EXISTS report_type TEXT,
ADD COLUMN IF NOT EXISTS content JSONB,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Ajouter la colonne results à agent_orchestrations
ALTER TABLE agent_orchestrations
ADD COLUMN IF NOT EXISTS results JSONB DEFAULT '{}'::jsonb;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_audit_reports_pre_audit_id ON audit_reports(pre_audit_id);
CREATE INDEX IF NOT EXISTS idx_audit_reports_status ON audit_reports(status);