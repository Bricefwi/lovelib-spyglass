-- Migration: Add Conversational Audit & Identity Verification Columns
-- Date: 2026-01-04
-- Description: Adds columns for email verification, conversational audit, and identity verification

-- Add new columns to pre_audits table
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pre_audits_verification_token ON pre_audits(verification_token);
CREATE INDEX IF NOT EXISTS idx_pre_audits_user_email ON pre_audits(user_email);
CREATE INDEX IF NOT EXISTS idx_pre_audits_email_verified ON pre_audits(email_verified);

-- Add comment for documentation
COMMENT ON COLUMN pre_audits.user_email IS 'Professional email address of the person requesting the audit';
COMMENT ON COLUMN pre_audits.user_name IS 'Full name of the person requesting the audit';
COMMENT ON COLUMN pre_audits.user_role IS 'Role/function of the person in the organization';
COMMENT ON COLUMN pre_audits.email_verified IS 'Whether the email has been verified via the verification link';
COMMENT ON COLUMN pre_audits.verification_token IS 'Unique token sent via email for identity verification';
COMMENT ON COLUMN pre_audits.verification_token_expires_at IS 'Expiration timestamp for the verification token (1 hour)';
COMMENT ON COLUMN pre_audits.conversational_brief IS 'JSON object containing the synthesized information from the conversational audit with Agent Alex';
COMMENT ON COLUMN pre_audits.conversation_completed IS 'Whether the conversational audit with Agent Alex has been completed';
COMMENT ON COLUMN pre_audits.conversation_started_at IS 'Timestamp when the conversation with Agent Alex started';
COMMENT ON COLUMN pre_audits.conversation_completed_at IS 'Timestamp when the conversation with Agent Alex was completed';
