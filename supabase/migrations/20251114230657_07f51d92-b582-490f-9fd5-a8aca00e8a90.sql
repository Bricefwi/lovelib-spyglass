-- ============================================
-- MIGRATION: Dashboard Administrateur
-- Date: 2025-11-14
-- Description: Tables et fonctions pour le dashboard admin
-- ============================================

-- 1. Ajouter colonnes manquantes à profiles si besoin
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- 2. Créer table admin_activity_logs
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Seuls les admins peuvent voir les logs
CREATE POLICY "Admins can view activity logs"
ON public.admin_activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert activity logs"
ON public.admin_activity_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. Fonction: Approuver un utilisateur
CREATE OR REPLACE FUNCTION public.admin_approve_user(
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can approve users';
  END IF;

  -- Mettre à jour le statut
  UPDATE public.profiles
  SET 
    account_status = 'active',
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Logger l'action
  INSERT INTO public.admin_activity_logs (admin_id, action, target_user_id, created_at)
  VALUES (p_admin_id, 'approve_user', p_user_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Fonction: Rejeter un utilisateur
CREATE OR REPLACE FUNCTION public.admin_reject_user(
  p_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reject users';
  END IF;

  -- Mettre à jour le statut
  UPDATE public.profiles
  SET 
    account_status = 'rejected',
    rejection_reason = p_reason,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Logger l'action
  INSERT INTO public.admin_activity_logs (admin_id, action, target_user_id, details, created_at)
  VALUES (p_admin_id, 'reject_user', p_user_id, jsonb_build_object('reason', p_reason), NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Fonction: Bloquer un utilisateur
CREATE OR REPLACE FUNCTION public.admin_block_user(
  p_user_id UUID,
  p_admin_id UUID,
  p_blocked_until TIMESTAMP WITH TIME ZONE,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can block users';
  END IF;

  -- Mettre à jour le blocage
  UPDATE public.profiles
  SET 
    blocked_until = p_blocked_until,
    block_reason = p_reason,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Logger l'action
  INSERT INTO public.admin_activity_logs (admin_id, action, target_user_id, details, created_at)
  VALUES (p_admin_id, 'block_user', p_user_id, 
    jsonb_build_object('blocked_until', p_blocked_until, 'reason', p_reason), NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Fonction: Débloquer un utilisateur
CREATE OR REPLACE FUNCTION public.admin_unblock_user(
  p_user_id UUID,
  p_admin_id UUID
)
RETURNS VOID AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can unblock users';
  END IF;

  -- Supprimer le blocage
  UPDATE public.profiles
  SET 
    blocked_until = NULL,
    block_reason = NULL,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Logger l'action
  INSERT INTO public.admin_activity_logs (admin_id, action, target_user_id, created_at)
  VALUES (p_admin_id, 'unblock_user', p_user_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Fonction: Ajuster le trust score
CREATE OR REPLACE FUNCTION public.admin_adjust_trust_score(
  p_user_id UUID,
  p_admin_id UUID,
  p_new_score INTEGER,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can adjust trust scores';
  END IF;

  -- Vérifier que le score est valide
  IF p_new_score < 0 OR p_new_score > 100 THEN
    RAISE EXCEPTION 'Trust score must be between 0 and 100';
  END IF;

  -- Mettre à jour le trust score
  UPDATE public.profiles
  SET 
    trust_score = p_new_score,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Logger l'action
  INSERT INTO public.admin_activity_logs (admin_id, action, target_user_id, details, created_at)
  VALUES (p_admin_id, 'adjust_trust_score', p_user_id, 
    jsonb_build_object('new_score', p_new_score, 'reason', p_reason), NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Fonction: Réinitialiser les audits gratuits
CREATE OR REPLACE FUNCTION public.admin_reset_free_audits(
  p_user_id UUID,
  p_admin_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reset free audits';
  END IF;

  -- Réinitialiser les audits
  UPDATE public.profiles
  SET 
    free_audits_used = 0,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Logger l'action
  INSERT INTO public.admin_activity_logs (admin_id, action, target_user_id, details, created_at)
  VALUES (p_admin_id, 'reset_free_audits', p_user_id, 
    jsonb_build_object('reason', p_reason), NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;