-- Migration pour système multi-agent
-- Créé le: 2025-10-29

-- Table pour les orchestrations multi-agent
CREATE TABLE IF NOT EXISTS public.agent_orchestrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pre_audit_id UUID REFERENCES public.pre_audits(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  n8n_execution_id TEXT,
  phases JSONB DEFAULT '[]'::jsonb,
  current_phase TEXT,
  progress INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les phases d'agent
CREATE TABLE IF NOT EXISTS public.agent_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orchestration_id UUID REFERENCES public.agent_orchestrations(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  phase_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  agents JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table pour les résultats d'agents individuels
CREATE TABLE IF NOT EXISTS public.agent_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID REFERENCES public.agent_phases(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  input JSONB,
  output JSONB,
  confidence NUMERIC,
  sources JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_orchestrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read/write for now (can be restricted later)
CREATE POLICY "agent_orchestrations_public_select" ON public.agent_orchestrations FOR SELECT USING (true);
CREATE POLICY "agent_orchestrations_public_insert" ON public.agent_orchestrations FOR INSERT WITH CHECK (true);
CREATE POLICY "agent_orchestrations_public_update" ON public.agent_orchestrations FOR UPDATE USING (true);

CREATE POLICY "agent_phases_public_select" ON public.agent_phases FOR SELECT USING (true);
CREATE POLICY "agent_phases_public_insert" ON public.agent_phases FOR INSERT WITH CHECK (true);
CREATE POLICY "agent_phases_public_update" ON public.agent_phases FOR UPDATE USING (true);

CREATE POLICY "agent_results_public_select" ON public.agent_results FOR SELECT USING (true);
CREATE POLICY "agent_results_public_insert" ON public.agent_results FOR INSERT WITH CHECK (true);
CREATE POLICY "agent_results_public_update" ON public.agent_results FOR UPDATE USING (true);

-- Indexes for performance
CREATE INDEX idx_agent_orchestrations_pre_audit ON public.agent_orchestrations(pre_audit_id);
CREATE INDEX idx_agent_orchestrations_status ON public.agent_orchestrations(status);
CREATE INDEX idx_agent_phases_orchestration ON public.agent_phases(orchestration_id);
CREATE INDEX idx_agent_results_phase ON public.agent_results(phase_id);

-- Trigger for updated_at
CREATE TRIGGER update_agent_orchestrations_updated_at
  BEFORE UPDATE ON public.agent_orchestrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();