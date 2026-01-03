-- Drop the existing view with SECURITY DEFINER
DROP VIEW IF EXISTS public.v_admin_audits;

-- Recreate the view with SECURITY INVOKER (default behavior, respects RLS of querying user)
CREATE VIEW public.v_admin_audits
WITH (security_invoker = true)
AS
SELECT pa.id,
    pa.url,
    pa.domain,
    pa.company_guess,
    pa.status,
    pa.confidence,
    pa.last_step,
    pa.report_html_url,
    pa.created_at,
    pa.updated_at,
    count(s.id) FILTER (WHERE (s.status = 'done'::text)) AS steps_done,
    count(s.id) AS total_steps
   FROM (pre_audits pa
     LEFT JOIN audit_steps s ON ((s.pre_audit_id = pa.id)))
  GROUP BY pa.id;

-- Grant appropriate permissions
GRANT SELECT ON public.v_admin_audits TO authenticated;

-- Add comment explaining the security change
COMMENT ON VIEW public.v_admin_audits IS 'Admin audits view with SECURITY INVOKER - respects RLS policies of the querying user';