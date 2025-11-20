-- Correction des politiques RLS du bucket verification-documents
-- Problème: La politique admin interroge directement user_roles, ce qui peut causer une récursion infinie
-- Solution: Utiliser la fonction has_role() qui est SECURITY DEFINER

-- Supprimer l'ancienne politique admin problématique
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;

-- Recréer la politique admin en utilisant has_role()
CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Ajouter une politique pour permettre aux admins de supprimer des documents
CREATE POLICY "Admins can delete verification documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'verification-documents'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Ajouter une politique pour permettre aux utilisateurs de supprimer leurs propres documents
CREATE POLICY "Users can delete their own verification documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);