-- Migration: Add Conversational Audit & Identity Verification Columns
-- Date: 2026-01-04
-- Purpose: Enable conversational audit workflow with email verification and client brief

-- Add columns to pre_audits table
ALTER TABLE pre_audits
ADD COLUMN IF NOT EXISTS user_email TEXT,
ADD COLUMN IF NOT EXISTS user_name TEXT,
ADD COLUMN IF NOT EXISTS user_role TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS conversational_brief JSONB,
ADD COLUMN IF NOT EXISTS conversation_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS conversation_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS conversation_completed_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pre_audits_verification_token ON pre_audits(verification_token);
CREATE INDEX IF NOT EXISTS idx_pre_audits_user_email ON pre_audits(user_email);
CREATE INDEX IF NOT EXISTS idx_pre_audits_email_verified ON pre_audits(email_verified);
CREATE INDEX IF NOT EXISTS idx_pre_audits_conversation_completed ON pre_audits(conversation_completed);

-- Add comments for documentation
COMMENT ON COLUMN pre_audits.user_email IS 'Professional email address of the audit requester';
COMMENT ON COLUMN pre_audits.user_name IS 'Full name of the audit requester';
COMMENT ON COLUMN pre_audits.user_role IS 'Role/function of the requester in the company';
COMMENT ON COLUMN pre_audits.email_verified IS 'Whether the email has been verified via token';
COMMENT ON COLUMN pre_audits.verification_token IS 'Unique token for email verification (expires after 1 hour)';
COMMENT ON COLUMN pre_audits.verification_token_expires_at IS 'Expiration timestamp for verification token';
COMMENT ON COLUMN pre_audits.conversational_brief IS 'Structured JSON brief from conversation with Agent Alex';
COMMENT ON COLUMN pre_audits.conversation_completed IS 'Whether the conversation with Agent Alex is completed';
COMMENT ON COLUMN pre_audits.conversation_started_at IS 'Timestamp when conversation started';
COMMENT ON COLUMN pre_audits.conversation_completed_at IS 'Timestamp when conversation completed';
