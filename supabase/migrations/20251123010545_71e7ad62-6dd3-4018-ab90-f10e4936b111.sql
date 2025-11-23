-- =================================================================
-- GRAND NETTOYAGE PARTIE 1 : Suppression des tables inutiles
-- =================================================================

-- 1. Supprimer la table audits (vide et non utilisée)
DROP TABLE IF EXISTS audits CASCADE;

-- Note: On garde audit_results car elle a 18 entrées qui peuvent être utiles
-- On pourrait la supprimer plus tard si confirmé inutile