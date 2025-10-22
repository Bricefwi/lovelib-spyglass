-- Fix infinite recursion in admins table RLS policies
-- Create security definer function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = _user_id
      AND super_admin = true
  )
$$;

-- Create security definer function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admins
    WHERE user_id = _user_id
  )
$$;

-- Drop existing policies on admins table
DROP POLICY IF EXISTS "Admins can view their own record" ON public.admins;
DROP POLICY IF EXISTS "Super admins can manage all admin records" ON public.admins;

-- Recreate policies using security definer functions
CREATE POLICY "Admins can view their own record"
ON public.admins
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all admin records"
ON public.admins
FOR ALL
USING (public.is_super_admin(auth.uid()));

-- Update other tables to use the new is_admin function
DROP POLICY IF EXISTS "Admins can manage all clients" ON public.clients;
CREATE POLICY "Admins can manage all clients"
ON public.clients
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Admins can manage companies"
ON public.companies
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all audits" ON public.audits;
CREATE POLICY "Admins can manage all audits"
ON public.audits
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all deltas" ON public.deltas;
CREATE POLICY "Admins can manage all deltas"
ON public.deltas
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all dept synthesis" ON public.dept_synthesis;
CREATE POLICY "Admins can manage all dept synthesis"
ON public.dept_synthesis
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all missions" ON public.missions;
CREATE POLICY "Admins can manage all missions"
ON public.missions
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all reports" ON public.reports;
CREATE POLICY "Admins can manage all reports"
ON public.reports
FOR ALL
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage SEO index" ON public.seo_index;
CREATE POLICY "Admins can manage SEO index"
ON public.seo_index
FOR ALL
USING (public.is_admin(auth.uid()));