-- Fix overly permissive RLS policies
-- This migration restricts public access to sensitive tables

-- 1. RESTRICT AGENT ORCHESTRATION TABLES (service role only)
-- Drop existing permissive policies
DROP POLICY IF EXISTS "agent_orchestrations_public_select" ON public.agent_orchestrations;
DROP POLICY IF EXISTS "agent_orchestrations_public_insert" ON public.agent_orchestrations;
DROP POLICY IF EXISTS "agent_orchestrations_public_update" ON public.agent_orchestrations;

DROP POLICY IF EXISTS "agent_phases_public_select" ON public.agent_phases;
DROP POLICY IF EXISTS "agent_phases_public_insert" ON public.agent_phases;
DROP POLICY IF EXISTS "agent_phases_public_update" ON public.agent_phases;

DROP POLICY IF EXISTS "agent_results_public_select" ON public.agent_results;
DROP POLICY IF EXISTS "agent_results_public_insert" ON public.agent_results;
DROP POLICY IF EXISTS "agent_results_public_update" ON public.agent_results;

-- Only allow service role access (edge functions)
CREATE POLICY "Service role can manage agent_orchestrations"
  ON public.agent_orchestrations FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage agent_phases"
  ON public.agent_phases FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage agent_results"
  ON public.agent_results FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 2. RESTRICT AUDIT REPORTS (add created_by tracking)
-- Add created_by column if not exists
ALTER TABLE public.audit_reports ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Drop existing permissive policies
DROP POLICY IF EXISTS "audit_reports_read" ON public.audit_reports;
DROP POLICY IF EXISTS "audit_reports_insert" ON public.audit_reports;

-- New restricted policies
CREATE POLICY "Users can view their own audit reports"
  ON public.audit_reports FOR SELECT
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert audit reports"
  ON public.audit_reports FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admins can manage all audit reports"
  ON public.audit_reports FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. RESTRICT PRE_AUDITS (add created_by if missing)
-- created_by already exists, just update policies
DROP POLICY IF EXISTS "pre_audits_public_select" ON public.pre_audits;
DROP POLICY IF EXISTS "pre_audits_public_insert" ON public.pre_audits;
DROP POLICY IF EXISTS "pre_audits_public_update" ON public.pre_audits;
DROP POLICY IF EXISTS "preaudits_update" ON public.pre_audits;

-- Allow users to view their own pre-audits
CREATE POLICY "Users can view their own pre_audits"
  ON public.pre_audits FOR SELECT
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Allow service role to insert (for public pre-audit form)
CREATE POLICY "Service role can insert pre_audits"
  ON public.pre_audits FOR INSERT
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Allow service role to update (for edge functions)
CREATE POLICY "Service role can update pre_audits"
  ON public.pre_audits FOR UPDATE
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Admins can manage all pre_audits"
  ON public.pre_audits FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. RESTRICT AUDIT RESULTS, SOURCES, STEPS (service role only)
DROP POLICY IF EXISTS "audit_results_public_select" ON public.audit_results;
DROP POLICY IF EXISTS "audit_results_public_insert" ON public.audit_results;

DROP POLICY IF EXISTS "audit_sources_public_select" ON public.audit_sources;
DROP POLICY IF EXISTS "audit_sources_public_insert" ON public.audit_sources;

DROP POLICY IF EXISTS "audit_steps_public_select" ON public.audit_steps;
DROP POLICY IF EXISTS "audit_steps_public_insert" ON public.audit_steps;

CREATE POLICY "Service role can manage audit_results"
  ON public.audit_results FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage audit_sources"
  ON public.audit_sources FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role can manage audit_steps"
  ON public.audit_steps FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 5. RESTRICT COMPANY_AUDITS (service role only)
DROP POLICY IF EXISTS "company_audits_public_select" ON public.company_audits;
DROP POLICY IF EXISTS "company_audits_public_insert" ON public.company_audits;

CREATE POLICY "Service role can manage company_audits"
  ON public.company_audits FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- 6. RESTRICT MESSAGES (allow public insert for contact form, but limit reads)
DROP POLICY IF EXISTS "messages_public_insert" ON public.messages;
DROP POLICY IF EXISTS "messages_public_select" ON public.messages;

-- Allow anyone to insert messages (contact form)
CREATE POLICY "Anyone can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

-- Only admins can read messages
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. FAQ entries remain public (read-only is fine)
-- No changes needed for faq_entries