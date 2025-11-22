-- ✅ CORRECTION: Supprimer d'abord le trigger, PUIS la fonction
DROP TRIGGER IF EXISTS trg_check_free_audits ON pre_audits;
DROP TRIGGER IF EXISTS check_free_audits_before_insert ON pre_audits;
DROP FUNCTION IF EXISTS check_free_audits_remaining() CASCADE;

-- Le contrôle des limites d'audits se fait maintenant UNIQUEMENT dans check-audit-access
-- pour les audits approfondis