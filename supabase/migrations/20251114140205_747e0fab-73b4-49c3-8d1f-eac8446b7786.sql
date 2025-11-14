-- Fix overly permissive RLS policies on agent orchestration tables
-- Replace public read access with admin-only or user-scoped access

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view orchestration status" ON agent_orchestrations;
DROP POLICY IF EXISTS "Anyone can view phase status" ON agent_phases;
DROP POLICY IF EXISTS "Anyone can view agent results" ON agent_results;

-- agent_orchestrations: Users can view their own orchestrations via pre_audits
CREATE POLICY "Users can view their own orchestrations"
ON agent_orchestrations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM pre_audits
    WHERE pre_audits.id = agent_orchestrations.pre_audit_id
    AND (pre_audits.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- agent_phases: Users can view phases for their orchestrations
CREATE POLICY "Users can view their phases"
ON agent_phases
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agent_orchestrations ao
    JOIN pre_audits pa ON pa.id = ao.pre_audit_id
    WHERE ao.id = agent_phases.orchestration_id
    AND (pa.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- agent_results: Users can view results for their phases
CREATE POLICY "Users can view their results"
ON agent_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM agent_phases ap
    JOIN agent_orchestrations ao ON ao.id = ap.orchestration_id
    JOIN pre_audits pa ON pa.id = ao.pre_audit_id
    WHERE ap.id = agent_results.phase_id
    AND (pa.created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);