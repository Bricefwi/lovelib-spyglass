-- ============================================================
-- IMOTION Conseil - Schema v1.2.0
-- Tables, Relations, RLS, Triggers, Indexes
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE app_role AS ENUM ('admin', 'consultant', 'client');
CREATE TYPE mission_status AS ENUM ('initiated', 'in_audit', 'planning', 'execution', 'closed');
CREATE TYPE report_phase AS ENUM ('pre_audit', 'strategy', 'marketing', 'sales', 'synthesis', 'project');
CREATE TYPE report_status AS ENUM ('draft', 'in_progress', 'completed', 'archived');
CREATE TYPE crm_type AS ENUM ('hubspot', 'pipedrive', 'salesforce', 'other');

-- ============================================================
-- USERS & PROFILES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'client',
  company_id UUID,
  oauth_provider TEXT,
  oauth_uid TEXT,
  gdpr_consent BOOLEAN DEFAULT false,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(email)
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);

-- ============================================================
-- COMPANIES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  siren TEXT,
  siret TEXT,
  address TEXT,
  postal_code TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'FR',
  website TEXT,
  contact_main TEXT,
  email_contact TEXT,
  phone_contact TEXT,
  description TEXT,
  industry TEXT,
  employees INTEGER,
  socials JSONB DEFAULT '{}',
  tech_stack TEXT[] DEFAULT '{}',
  last_news JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_companies_name ON public.companies USING gin(name gin_trgm_ops);
CREATE INDEX idx_companies_siren ON public.companies(siren);
CREATE INDEX idx_companies_website ON public.companies(website);

-- ============================================================
-- CLIENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  position TEXT,
  department TEXT,
  objectives JSONB DEFAULT '{}',
  crm_connected BOOLEAN DEFAULT false,
  crm_type crm_type,
  allow_index BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_company_id ON public.clients(company_id);

-- ============================================================
-- ADMINS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  super_admin BOOLEAN DEFAULT false,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_admins_user_id ON public.admins(user_id);

-- ============================================================
-- MISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  blueprint JSONB NOT NULL DEFAULT '{}',
  status mission_status NOT NULL DEFAULT 'initiated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_missions_client_id ON public.missions(client_id);
CREATE INDEX idx_missions_status ON public.missions(status);

-- ============================================================
-- REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.missions(id) ON DELETE SET NULL,
  phase report_phase NOT NULL,
  intake JSONB DEFAULT '{}',
  scope JSONB DEFAULT '{}',
  scenarios JSONB DEFAULT '[]',
  marketing JSONB DEFAULT '{}',
  sales JSONB DEFAULT '{}',
  global_plan JSONB DEFAULT '{}',
  project JSONB DEFAULT '{}',
  status report_status NOT NULL DEFAULT 'draft',
  pdf_url TEXT,
  html_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_client_id ON public.reports(client_id);
CREATE INDEX idx_reports_mission_id ON public.reports(mission_id);
CREATE INDEX idx_reports_phase ON public.reports(phase);
CREATE INDEX idx_reports_status ON public.reports(status);

-- ============================================================
-- AUDITS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  marketing JSONB DEFAULT '{}',
  commercial JSONB DEFAULT '{}',
  completeness_score NUMERIC(3,2) DEFAULT 0 CHECK (completeness_score >= 0 AND completeness_score <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audits_mission_id ON public.audits(mission_id);

-- ============================================================
-- DEPT SYNTHESIS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.dept_synthesis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  department TEXT NOT NULL CHECK (department IN ('marketing', 'sales', 'cross')),
  synthesis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_dept_synthesis_mission_id ON public.dept_synthesis(mission_id);

-- ============================================================
-- DELTAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.deltas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  payload JSONB NOT NULL,
  delta_score NUMERIC(3,2) DEFAULT 0 CHECK (delta_score >= 0 AND delta_score <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_deltas_client_id ON public.deltas(client_id);

-- ============================================================
-- SEO INDEX (Public)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.seo_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  summary TEXT,
  keywords TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'fr',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_index_url ON public.seo_index(url);
CREATE INDEX idx_seo_index_keywords ON public.seo_index USING gin(keywords);

-- ============================================================
-- AUDIT LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id TEXT,
  agent_version TEXT,
  action TEXT NOT NULL,
  input_hash TEXT,
  output_hash TEXT,
  sources JSONB DEFAULT '[]',
  confidence NUMERIC(3,2),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- ============================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Allow insert on signup"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies viewable by associated clients"
ON public.companies FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.company_id = companies.id
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage companies"
ON public.companies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- Clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own client record"
ON public.clients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client record"
ON public.clients FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client record"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all clients"
ON public.clients FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- Missions
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their missions"
ON public.missions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = missions.client_id
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all missions"
ON public.missions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their reports"
ON public.reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = reports.client_id
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all reports"
ON public.reports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- Audits
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audits for their missions"
ON public.audits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.missions m
    JOIN public.clients c ON c.id = m.client_id
    WHERE m.id = audits.mission_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all audits"
ON public.audits FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- Dept Synthesis
ALTER TABLE public.dept_synthesis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view dept synthesis for their missions"
ON public.dept_synthesis FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.missions m
    JOIN public.clients c ON c.id = m.client_id
    WHERE m.id = dept_synthesis.mission_id
    AND c.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all dept synthesis"
ON public.dept_synthesis FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- Deltas
ALTER TABLE public.deltas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their deltas"
ON public.deltas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE clients.id = deltas.client_id
    AND clients.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all deltas"
ON public.deltas FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- SEO Index (public read, admin write)
ALTER TABLE public.seo_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SEO index publicly readable"
ON public.seo_index FOR SELECT
USING (true);

CREATE POLICY "Admins can manage SEO index"
ON public.seo_index FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
  )
);

-- ============================================================
-- TEST DATA (Optional)
-- ============================================================

-- Sample company
INSERT INTO public.companies (id, name, city, country, website, industry)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Enterprise SAS',
  'Paris',
  'FR',
  'https://www.demo-enterprise.com',
  'Technology'
) ON CONFLICT (id) DO NOTHING;