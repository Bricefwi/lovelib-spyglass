-- ==============================================================================
-- MIGRATION SAAS B2B : ORGANISATIONS & ABONNEMENTS
-- ==============================================================================

-- 1. Création de la table ORGANISATIONS
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    slug TEXT,
    billing_email TEXT,
    stripe_customer_id TEXT,
    subscription_plan TEXT DEFAULT 'freemium',
    subscription_status TEXT DEFAULT 'active',
    ai_model_preference TEXT DEFAULT 'standard'
);

-- 2. Création de la table MEMBRES D'ORGANISATION
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    UNIQUE(organization_id, user_id)
);

-- 3. MIGRATION : Convertir chaque utilisateur existant en "Chef d'Organisation"
DO $$
DECLARE
    user_rec RECORD;
    new_org_id UUID;
    org_name TEXT;
BEGIN
    FOR user_rec IN SELECT u.id, u.email, u.raw_user_meta_data, p.company_legal_name 
                    FROM auth.users u
                    LEFT JOIN profiles p ON p.user_id = u.id LOOP
        -- Déterminer le nom de l'org (basé sur l'entreprise ou l'email)
        org_name := COALESCE(user_rec.company_legal_name, user_rec.raw_user_meta_data->>'company_name', 'Organisation de ' || split_part(user_rec.email, '@', 1));
        
        -- Créer l'organisation
        INSERT INTO organizations (name, billing_email, subscription_plan)
        VALUES (org_name, user_rec.email, 'freemium')
        RETURNING id INTO new_org_id;

        -- Lier l'utilisateur comme Propriétaire (Owner)
        INSERT INTO organization_members (organization_id, user_id, role)
        VALUES (new_org_id, user_rec.id, 'owner')
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- 4. MISE À JOUR DE LA TABLE AUDITS (pre_audits)
ALTER TABLE pre_audits 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS ai_tier TEXT DEFAULT 'standard';

-- Lier les anciens audits aux nouvelles organisations
UPDATE pre_audits pa
SET organization_id = om.organization_id
FROM organization_members om
WHERE pa.created_by = om.user_id;

-- 5. Ajouter organization_id au profil pour faciliter l'accès
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

UPDATE profiles p
SET organization_id = om.organization_id
FROM organization_members om
WHERE p.user_id = om.user_id AND om.role = 'owner';

-- 6. SÉCURITÉ (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Fonction security definer pour obtenir l'organization_id de l'utilisateur
CREATE OR REPLACE FUNCTION public.get_user_organization_id(p_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id 
  FROM organization_members 
  WHERE user_id = p_user_id 
  LIMIT 1;
$$;

-- Politique : On peut voir son organisation
CREATE POLICY "Users can view their organization" ON organizations
FOR SELECT USING (
    id = get_user_organization_id(auth.uid())
);

CREATE POLICY "Users can update their organization" ON organizations
FOR UPDATE USING (
    id = get_user_organization_id(auth.uid())
);

-- Politique : On peut voir les membres de son équipe
CREATE POLICY "Users can view their team members" ON organization_members
FOR SELECT USING (
    organization_id = get_user_organization_id(auth.uid())
);

-- Service role peut tout gérer
CREATE POLICY "Service role can manage organizations" ON organizations
FOR ALL USING (
    (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

CREATE POLICY "Service role can manage org members" ON organization_members
FOR ALL USING (
    (auth.jwt() ->> 'role'::text) = 'service_role'::text
);

-- Admins peuvent tout voir
CREATE POLICY "Admins can view all organizations" ON organizations
FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view all org members" ON organization_members
FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role)
);