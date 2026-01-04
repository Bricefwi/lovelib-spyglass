-- Migration: Add Conversational Audit & Identity Verification Columns
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