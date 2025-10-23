-- Ajouter la colonne company_id manquante dans pre_audits
ALTER TABLE public.pre_audits 
ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;