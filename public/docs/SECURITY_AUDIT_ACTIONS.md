# Actions de Sécurité Implémentées - Audit IMOTION

## ✅ Corrections Critiques Appliquées (14 nov 2025)

### 1. Politiques RLS Corrigées

#### **Profiles Table**
- ✅ Ajout policy SELECT pour que users puissent voir leur profil
- ✅ Restriction UPDATE pour empêcher modification des champs sensibles (`free_audits_used`, `trust_score`, `account_status`)
- ✅ Les champs sensibles ne peuvent être modifiés que via fonctions SECURITY DEFINER

#### **Companies Table**
- ✅ Ajout policy SELECT pour que users voient leurs sociétés (via company_id dans profile ou pre_audits)
- ✅ Accès uniquement aux sociétés de l'utilisateur ou liées à ses audits

#### **Logs de Sécurité** (`company_verification_logs`, `audit_access_control`)
- ✅ SELECT limité : users voient uniquement leurs propres logs
- ✅ INSERT supprimé pour users : seul service_role peut insérer (via edge functions)
- ⚠️ Protection contre manipulation des logs

### 2. Rate Limiting Implémenté

#### **Nouvelle table `rate_limits`**
```sql
- resource_type: 'validate_siret', 'preaudit', etc.
- identifier: user_id ou ip_address  
- window_start: timestamp du début de fenêtre
- request_count: nombre de requêtes dans la fenêtre
```

#### **Fonction `check_rate_limit()`**
- Nettoie automatiquement les anciennes entrées
- Vérifie et incrémente le compteur  
- Retourne `{allowed: boolean, current_count, max_requests, window_minutes}`
- SECURITY DEFINER pour bypass RLS

#### **Limites configurées:**
- **validate-company-siret**: 5 req/minute par user
- **preaudit**: 3 req/heure par user
- **check-audit-access**: 10 req/heure par IP (existant)

### 3. Fonction Sécurisée pour Audits Gratuits

```sql
CREATE FUNCTION increment_free_audits_used(p_user_id uuid)
```
- Vérifie que l'appelant est bien p_user_id (pas d'usurpation)
- Incrémente `free_audits_used` et met à jour `last_audit_at`
- SECURITY DEFINER pour bypass RLS UPDATE restrictif

### 4. Améliorations Edge Functions

#### **validate-company-siret/index.ts**
- ✅ Vérification authentification obligatoire (JWT)
- ✅ Rate limiting avant validation (5/min)
- ✅ Logs via `supabaseAdmin` (service_role) au lieu de user client
- ✅ Messages d'erreur génériques (pas de détails techniques exposés)
- ✅ IP et User-Agent loggés pour traçabilité

#### **preaudit/index.ts**  
- ✅ Vérification authentification obligatoire
- ✅ Rate limiting avant lancement audit (3/heure)
- ✅ Utilisation `supabaseAdmin` pour INSERT pre_audits (bypass RLS si nécessaire)
- ✅ Ajout `created_by: user.id` pour lier audit à user
- ✅ Messages d'erreur génériques avec requestId pour support

#### **check-audit-access/index.ts**
- ✅ Déjà bien sécurisé (validation Zod, SSRF protection, rate limiting)
- ⚠️ À améliorer: logging des tentatives d'accès refusées

## 🔐 Principes de Sécurité Appliqués

### **1. Zero Trust - Validation côté serveur**
- Jamais de confiance dans les données client
- Validation Zod stricte sur toutes les entrées
- JWT vérifié par Supabase automatiquement

### **2. Principe du Moindre Privilège**
- RLS activé sur toutes les tables publiques
- Users ne voient/modifient que leurs données
- Service_role utilisé uniquement quand nécessaire
- Fonctions SECURITY DEFINER pour opérations privilégiées

### **3. Defense in Depth (Défense en profondeur)**
- Validation multi-couches : Zod + RLS + Rate Limiting
- Logging exhaustif pour audit trail
- Messages d'erreur sanitisés (pas de stack traces)

### **4. Privacy by Design**
- Données sensibles protégées (free_audits_used, trust_score)
- Logs traçables mais non modifiables par users
- IP/User-Agent anonymisables si besoin RGPD

## ⚠️ Actions Restantes (Priorité Moyen Terme)

### **Edge Functions**
- [ ] Implémenter rate limiting dans code de toutes les fonctions
- [ ] Uniformiser format réponses d'erreur JSON
- [ ] Ajouter timeout sur appels API externes (éviter DoS)
- [ ] Monitorer coûts appels Lovable AI

### **RLS & Database**
- [ ] Audit complet de toutes les tables (audits, audit_reports, etc.)
- [ ] Créer vues filtrées pour queries complexes (éviter subqueries lourdes)
- [ ] Policy DELETE sur tables critiques (actuellement non géré)

### **Authentification**
- [ ] Activer MFA (Multi-Factor Auth) dans Supabase Auth
- [ ] Politique mots de passe renforcée (min 10 car, complexité)
- [ ] Lockout après 5 tentatives échouées
- [ ] Session timeout configuré (actuellement default 1h)

### **Monitoring & Alertes**
- [ ] Dashboard admin pour visualiser rate_limits
- [ ] Alertes automatiques si dépassements fréquents
- [ ] Export logs de sécurité pour analyse externe
- [ ] Tests de pénétration périodiques

### **RGPD & Conformité**
- [ ] Politique de confidentialité accessible
- [ ] Bannière consentement cookies
- [ ] Interface "Mes données" (export/suppression)
- [ ] Documentation conservation données (RGPD)
- [ ] AIPD (Analyse d'Impact) si données sensibles

## 📊 Métriques de Sécurité

### Avant Audit (13 nov)
- ❌ 5 failles critiques (Priorité 1)
- ⚠️ 3 vulnérabilités moyennes (Priorité 2)
- ℹ️ 2 améliorations (Priorité 3)

### Après Corrections (14 nov)
- ✅ 0 failles critiques restantes
- ⚠️ 3 vulnérabilités moyennes (à traiter)
- ℹ️ 5 améliorations identifiées

**Amélioration: 100% des failles critiques corrigées en <24h**

## 🔗 Références

### Documentation Technique
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Top 10 2021](https://owasp.org/www-project-top-ten/)
- [Guide CNIL Développeurs](https://www.cnil.fr/fr/guide-rgpd-du-developpeur)

### Outils Recommandés
- **SAST**: ESLint Security Plugin, Semgrep
- **DAST**: OWASP ZAP (tests d'intrusion automatisés)
- **Dependency Scanning**: Snyk, OWASP Dependency-Check
- **Secrets Detection**: Gitleaks, TruffleHog

---

**Date révision**: 14 novembre 2025  
**Prochaine révision**: 21 novembre 2025 (hebdomadaire)  
**Responsable Sécurité**: À désigner
