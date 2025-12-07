-- Ajouter les colonnes pour la logique interactive multi-branches
ALTER TABLE pre_audits 
ADD COLUMN IF NOT EXISTS available_choices JSONB,
ADD COLUMN IF NOT EXISTS selected_choice TEXT,
ADD COLUMN IF NOT EXISTS interaction_step TEXT DEFAULT 'start';

-- Index pour les requêtes sur l'état d'interaction
CREATE INDEX IF NOT EXISTS idx_pre_audits_interaction_step ON pre_audits(interaction_step);
CREATE INDEX IF NOT EXISTS idx_pre_audits_selected_choice ON pre_audits(selected_choice);