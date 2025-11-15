-- Désactiver temporairement le trigger qui limite les audits gratuits pour les tests
DROP TRIGGER IF EXISTS check_free_audits_limit ON public.pre_audits;

-- Vous pourrez le réactiver plus tard si nécessaire
-- Pour le moment, pas de limite d'audits pour les tests