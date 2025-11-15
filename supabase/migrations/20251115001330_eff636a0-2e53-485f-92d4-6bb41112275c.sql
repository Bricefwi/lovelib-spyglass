-- CORRECTIF: Les politiques service_role ne servent à rien car service_role bypass RLS
-- Supprimer les politiques inutiles créées par erreur

DROP POLICY IF EXISTS "Service role can read pre_audits" ON public.pre_audits;
DROP POLICY IF EXISTS "Service role can read audit_reports" ON public.audit_reports;

-- Restaurer les anciennes politiques correctes
DROP POLICY IF EXISTS "Users can view their own pre_audits" ON public.pre_audits;

CREATE POLICY "Users can view their own pre_audits"
ON public.pre_audits
FOR SELECT
USING (
  auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role)
);