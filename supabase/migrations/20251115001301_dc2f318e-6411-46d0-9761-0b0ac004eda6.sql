-- Ajouter policy SELECT pour service_role sur pre_audits
DROP POLICY IF EXISTS "Service role can read pre_audits" ON public.pre_audits;

CREATE POLICY "Service role can read pre_audits"
ON public.pre_audits
FOR SELECT
USING (
  (auth.jwt() ->> 'role') = 'service_role'
  OR auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Même chose pour audit_reports
DROP POLICY IF EXISTS "Service role can read audit_reports" ON public.audit_reports;

CREATE POLICY "Service role can read audit_reports"
ON public.audit_reports
FOR SELECT
USING (
  (auth.jwt() ->> 'role') = 'service_role'
  OR auth.uid() = created_by 
  OR has_role(auth.uid(), 'admin'::app_role)
);