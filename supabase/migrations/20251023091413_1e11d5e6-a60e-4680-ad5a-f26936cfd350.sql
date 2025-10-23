-- Enrichir la table companies existante
ALTER TABLE companies 
  ADD COLUMN IF NOT EXISTS marketing_channels JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ia_usage JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS size_estimate TEXT,
  ADD COLUMN IF NOT EXISTS revenue_estimate TEXT,
  ADD COLUMN IF NOT EXISTS employee_count INTEGER;

-- Table company_audits (relation entre company et audit)
CREATE TABLE IF NOT EXISTS company_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID,
  pre_audit_id UUID REFERENCES pre_audits(id) ON DELETE CASCADE,
  audit_result_id UUID REFERENCES audit_results(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(pre_audit_id)
);

-- Table messages (pour le support/communication)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID,
  audit_id UUID REFERENCES audit_results(id) ON DELETE CASCADE,
  sender_email TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_company_audits_pre_audit ON company_audits(pre_audit_id);
CREATE INDEX IF NOT EXISTS idx_company_audits_company ON company_audits(company_id);
CREATE INDEX IF NOT EXISTS idx_messages_company ON messages(company_id);

-- RLS policies
ALTER TABLE company_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Company_audits: public read
CREATE POLICY company_audits_public_select ON company_audits FOR SELECT USING (true);
CREATE POLICY company_audits_public_insert ON company_audits FOR INSERT WITH CHECK (true);

-- Messages: public insert
CREATE POLICY messages_public_insert ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY messages_public_select ON messages FOR SELECT USING (true);