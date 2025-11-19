-- Add audit_logs column to pre_audits table for storing agent execution history
ALTER TABLE public.pre_audits 
ADD COLUMN IF NOT EXISTS audit_logs JSONB;