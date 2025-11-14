-- Drop the authenticated-only policy
DROP POLICY IF EXISTS "Authenticated users can create companies" ON public.companies;

-- Allow public (anon) users to create companies during audit process
CREATE POLICY "Anyone can create companies"
ON public.companies
FOR INSERT
TO public
WITH CHECK (true);