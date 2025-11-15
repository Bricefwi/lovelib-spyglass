-- ============================================================================
-- Migration : Système de notifications email pour limites d'audits
-- ============================================================================

-- 1. Table pour logger les emails envoyés
CREATE TABLE IF NOT EXISTS public.email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  notification_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  resend_id text,
  created_at timestamptz DEFAULT now()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_email_notifications_user 
ON public.email_notifications(user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_notifications_type 
ON public.email_notifications(notification_type, sent_at DESC);

-- RLS sur email_notifications
ALTER TABLE public.email_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email notifications"
ON public.email_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all email notifications"
ON public.email_notifications
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

COMMENT ON TABLE public.email_notifications IS 
'Historique des notifications email envoyées aux utilisateurs (alertes limite audits, etc.)';