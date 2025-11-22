-- Fonction pour changer le rôle d'un utilisateur (admin uniquement)
CREATE OR REPLACE FUNCTION public.admin_change_user_role(
  p_admin_id uuid,
  p_user_id uuid,
  p_new_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier que l'appelant est admin
  IF NOT has_role(p_admin_id, 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can change user roles';
  END IF;

  -- Insérer ou mettre à jour le rôle
  INSERT INTO user_roles (user_id, role)
  VALUES (p_user_id, p_new_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Supprimer les autres rôles pour cet utilisateur (un utilisateur = un rôle)
  DELETE FROM user_roles 
  WHERE user_id = p_user_id AND role != p_new_role;

  -- Logger l'action
  INSERT INTO admin_activity_logs (admin_id, target_user_id, action, details)
  VALUES (
    p_admin_id,
    p_user_id,
    'change_role',
    jsonb_build_object('new_role', p_new_role)
  );
END;
$$;