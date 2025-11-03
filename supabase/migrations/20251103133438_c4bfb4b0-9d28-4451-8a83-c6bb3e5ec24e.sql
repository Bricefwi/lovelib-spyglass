-- Allow service role to write to orchestration tables
-- This is needed for n8n workflows to update progress

-- Add INSERT policy for agent_phases (service role)
CREATE POLICY "Service role can insert phases"
  ON public.agent_phases FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add UPDATE policy for agent_phases (service role)
CREATE POLICY "Service role can update phases"
  ON public.agent_phases FOR UPDATE
  TO service_role
  USING (true);

-- Add INSERT policy for agent_results (service role)
CREATE POLICY "Service role can insert results"
  ON public.agent_results FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Add UPDATE policy for agent_results (service role)
CREATE POLICY "Service role can update results"
  ON public.agent_results FOR UPDATE
  TO service_role
  USING (true);

-- Add UPDATE policy for agent_orchestrations (service role)
CREATE POLICY "Service role can update orchestrations"
  ON public.agent_orchestrations FOR UPDATE
  TO service_role
  USING (true);