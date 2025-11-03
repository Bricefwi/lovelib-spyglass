-- Allow public read access to orchestrations for status tracking
-- Users need to see the progress of their audits

-- Add SELECT policy for agent_orchestrations (read-only for tracking)
CREATE POLICY "Anyone can view orchestration status"
  ON public.agent_orchestrations FOR SELECT
  USING (true);

-- Add SELECT policy for agent_phases (read-only for tracking)
CREATE POLICY "Anyone can view phase status"
  ON public.agent_phases FOR SELECT
  USING (true);

-- Add SELECT policy for agent_results (read-only for tracking)
CREATE POLICY "Anyone can view agent results"
  ON public.agent_results FOR SELECT
  USING (true);

-- Keep write restrictions to service role only (already in place)