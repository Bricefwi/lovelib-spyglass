-- Enable RLS on admins table (security fix)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for admins table
CREATE POLICY "Super admins can manage all admin records"
  ON public.admins
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE user_id = auth.uid() AND super_admin = true
    )
  );

CREATE POLICY "Admins can view their own record"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);