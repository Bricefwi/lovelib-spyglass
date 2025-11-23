-- =================================================================
-- STRATEGIC CROSSROADS : Architecture Multi-Branches Premium
-- =================================================================

-- 1. Nettoyage des audits zombies
DELETE FROM pre_audits 
WHERE status IN ('pending', 'collecting', 'running') 
AND created_at < NOW() - INTERVAL '24 hours';

-- 2. Table des Carrefours Stratégiques (Le cœur du système multi-branches)
CREATE TABLE IF NOT EXISTS strategic_choices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES pre_audits(id) ON DELETE CASCADE,
    phase TEXT NOT NULL, -- 'PHASE_1_MARKET', 'PHASE_2_COMPETITIVE', etc.
    context_summary TEXT, -- Résumé exécutif de la situation
    options JSONB NOT NULL, -- Les 3 choix stratégiques (format: [{id, title, description, pros, cons, impact, effort}])
    selected_option TEXT, -- 'option_A', 'option_B', ou 'option_C' (NULL tant que non choisi)
    created_at TIMESTAMPTZ DEFAULT now(),
    selected_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id)
);

-- 3. Index pour performance
CREATE INDEX IF NOT EXISTS idx_strategic_choices_audit ON strategic_choices(audit_id);
CREATE INDEX IF NOT EXISTS idx_strategic_choices_pending ON strategic_choices(audit_id, selected_option) 
WHERE selected_option IS NULL;

-- 4. RLS Policies (Sécurité)
ALTER TABLE strategic_choices ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs voient leurs propres choix
CREATE POLICY "Users can view their strategic choices" ON strategic_choices
FOR SELECT USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
        SELECT 1 FROM pre_audits 
        WHERE pre_audits.id = strategic_choices.audit_id 
        AND pre_audits.created_by = auth.uid()
    )
);

-- Les utilisateurs peuvent choisir une option
CREATE POLICY "Users can select strategic option" ON strategic_choices
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM pre_audits 
        WHERE pre_audits.id = strategic_choices.audit_id 
        AND pre_audits.created_by = auth.uid()
    )
);

-- Service role peut tout gérer
CREATE POLICY "Service role manages strategic choices" ON strategic_choices
FOR ALL USING (
    (auth.jwt() ->> 'role'::text) = 'service_role'::text
);