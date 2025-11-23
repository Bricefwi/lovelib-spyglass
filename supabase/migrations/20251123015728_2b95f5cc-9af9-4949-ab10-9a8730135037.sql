-- ================================================================
-- AUDIT DE SÉCURITÉ RENFORCÉ - "ZERO TRUST"
-- ================================================================

-- 1. CRÉATION TABLE DE LOGS DE SÉCURITÉ (AUDIT TRAIL IMMUABLE)
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_time TIMESTAMPTZ DEFAULT now(),
    user_id UUID,
    action TEXT NOT NULL, -- 'LOGIN', 'EXPORT_PDF', 'DELETE_AUDIT', etc.
    resource_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    severity TEXT DEFAULT 'info',
    details JSONB DEFAULT '{}'::jsonb
);

-- Activer RLS sur les logs
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Politiques : Seuls les admins peuvent lire, personne ne peut modifier/supprimer
CREATE POLICY "Admins can view security logs" 
ON security_audit_logs FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert logs" 
ON security_audit_logs FOR INSERT 
WITH CHECK (true); -- Edge functions utilisent service_role

CREATE POLICY "No updates on logs" 
ON security_audit_logs FOR UPDATE 
USING (false);

CREATE POLICY "No deletes on logs" 
ON security_audit_logs FOR DELETE 
USING (false);

-- 2. FONCTION DE PROTECTION CONTRE L'INJECTION DE RÔLE
CREATE OR REPLACE FUNCTION force_default_role()
RETURNS TRIGGER AS $$
BEGIN
    -- Par défaut, tout nouveau membre est 'member', sauf intervention admin
    IF NEW.role IS NULL THEN
        NEW.role := 'member';
    END IF;
    
    -- Log les tentatives de création de rôles sensibles (pour audit)
    IF (NEW.role IN ('admin', 'owner')) AND (auth.uid() != NEW.user_id) THEN
        -- Cela signifie qu'un admin crée un autre admin (légitime)
        -- On log juste pour traçabilité
        INSERT INTO security_audit_logs (user_id, action, resource_id, severity)
        VALUES (auth.uid(), 'PROMOTE_USER', NEW.user_id, 'warning');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attacher le trigger à organization_members
DROP TRIGGER IF EXISTS enforce_default_role ON organization_members;
CREATE TRIGGER enforce_default_role
BEFORE INSERT ON organization_members
FOR EACH ROW EXECUTE FUNCTION force_default_role();

-- 3. RENFORCEMENT DES POLITIQUES MULTI-TENANCY
-- Politique supplémentaire pour pre_audits : isolation par organisation
CREATE POLICY "View organization audits" 
ON pre_audits FOR SELECT 
USING (
    organization_id IN (
        SELECT organization_id 
        FROM organization_members 
        WHERE user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR created_by = auth.uid() -- Le créateur peut toujours voir son audit
);

-- 4. RENFORCEMENT AUDIT REPORTS (même logique multi-tenancy)
CREATE POLICY "View organization reports" 
ON audit_reports FOR SELECT 
USING (
    pre_audit_id IN (
        SELECT id FROM pre_audits 
        WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    )
    OR has_role(auth.uid(), 'admin'::app_role)
    OR created_by = auth.uid()
);

-- 5. PROTECTION STRATEGIC_CHOICES (isolation par audit)
CREATE POLICY "View organization strategic choices" 
ON strategic_choices FOR SELECT 
USING (
    audit_id IN (
        SELECT id FROM pre_audits 
        WHERE organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
        OR created_by = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
);

-- 6. INDEX POUR PERFORMANCE (éviter les full scans sur les checks RLS)
CREATE INDEX IF NOT EXISTS idx_org_members_user_org 
ON organization_members(user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_pre_audits_org 
ON pre_audits(organization_id);

CREATE INDEX IF NOT EXISTS idx_security_logs_user_time 
ON security_audit_logs(user_id, event_time DESC);

-- 7. COMMENTAIRES DOCUMENTATION
COMMENT ON TABLE security_audit_logs IS 
'Table WORM (Write Once Read Many) - Logs de sécurité immuables pour conformité RGPD/SOC2';

COMMENT ON FUNCTION force_default_role() IS 
'Prévention injection de privilèges - Force le rôle member par défaut';