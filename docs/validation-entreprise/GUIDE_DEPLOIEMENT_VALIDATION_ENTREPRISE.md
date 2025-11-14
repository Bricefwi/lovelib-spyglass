# 🚀 Guide de Déploiement : Système de Validation d'Entreprise IMOTION MANUS IA 2.0

## 📋 Vue d'ensemble

Ce guide vous accompagne dans le déploiement complet du système de validation d'entreprise avec **vérification email obligatoire**, **identification SIRET/SIREN**, et **mécanismes anti-abus**.

Le déploiement se fait en **5 étapes principales** :

1. ✅ **Obtenir un token API INSEE** (gratuit, 5 minutes)
2. ✅ **Déployer les migrations SQL** (base de données)
3. ✅ **Déployer les Edge Functions** (validation SIRET + contrôle d'accès)
4. ✅ **Configurer l'authentification Supabase** (confirmation email)
5. ✅ **Modifier le frontend via Lovable** (onboarding + protection des routes)

**Durée estimée** : 2-3 heures

---

## 🎯 Objectifs du Système

### Sécurité & Authentification
- ✅ Email obligatoire avec vérification par lien de confirmation
- ✅ Aucun accès sans validation email
- ✅ Session sécurisée avec JWT vérifié

### Identification Entreprise
- ✅ SIRET/SIREN obligatoire validé via API INSEE officielle
- ✅ Informations légales automatiquement récupérées (raison sociale, adresse, forme juridique)
- ✅ Rôle utilisateur dans l'entreprise (Dirigeant, Responsable Marketing, etc.)

### Anti-Abus
- ✅ SIRET unique : une entreprise = un compte
- ✅ Rate limiting : max 10 tentatives par IP par heure
- ✅ Trust score : algorithme de détection de faux comptes
- ✅ Modération manuelle pour les comptes suspects (trust_score < 30)
- ✅ Limite de 3 audits gratuits par entreprise

### Qualité des Audits
- ✅ Données d'entrée vérifiables pour les agents IA
- ✅ Correspondance email professionnel / domaine du site
- ✅ Logs de toutes les tentatives d'accès (analytics anti-fraude)

---

## 📦 Contenu du Package

Le fichier `validation-entreprise-complete.zip` contient :

```
validation-entreprise-complete/
├── PLAN_ARCHITECTURE_VALIDATION_ENTREPRISE.md  # Architecture détaillée (50+ pages)
├── DEPLOYMENT_SQL_VALIDATION_ENTREPRISE.sql    # Script SQL de déploiement
├── MESSAGES_LOVABLE_VALIDATION_ENTREPRISE.md   # 7 messages pour Lovable
└── edge-functions-validation/
    ├── validate-company-siret/
    │   └── index.ts                            # Edge Function validation SIRET
    └── check-audit-access/
        └── index.ts                            # Edge Function contrôle d'accès
```

---

## 🔐 Étape 1 : Obtenir un Token API INSEE (5 minutes)

### Pourquoi ?
L'API INSEE permet de valider les SIRET/SIREN et de récupérer automatiquement les données légales des entreprises françaises (raison sociale, adresse, forme juridique).

### Instructions

1. **Créer un compte INSEE**
   - Allez sur https://api.insee.fr/catalogue/
   - Cliquez sur **"Sign Up"** (en haut à droite)
   - Remplissez le formulaire d'inscription
   - Confirmez votre email

2. **Créer une application**
   - Connectez-vous à votre compte INSEE
   - Allez dans **"My Applications"**
   - Cliquez sur **"Add Application"**
   - Nom de l'application : `IMOTION MANUS IA`
   - Description : `Validation SIRET pour audits marketing`
   - Callback URL : `https://votre-domaine.com` (pas utilisé, mais requis)

3. **Souscrire à l'API Sirene**
   - Dans votre application, cliquez sur **"Subscribe"**
   - Cherchez **"Sirene - V3"**
   - Cliquez sur **"Subscribe"** (gratuit, 30 requêtes/minute)
   - Acceptez les conditions d'utilisation

4. **Récupérer le token**
   - Allez dans **"Production Keys"**
   - Copiez le **"Consumer Key"** et le **"Consumer Secret"**
   - Générez un token Bearer :

   ```bash
   curl -X POST https://api.insee.fr/token \
     -H "Authorization: Basic $(echo -n 'CONSUMER_KEY:CONSUMER_SECRET' | base64)" \
     -d "grant_type=client_credentials"
   ```

   Vous obtiendrez un JSON avec un `access_token` :
   ```json
   {
     "access_token": "votre_token_ici",
     "expires_in": 604800
   }
   ```

5. **Configurer le secret dans Supabase**
   - Allez dans votre projet Supabase
   - **Project Settings** → **Edge Functions** → **Secrets**
   - Cliquez sur **"Add new secret"**
   - Nom : `INSEE_API_TOKEN`
   - Valeur : Le `access_token` obtenu ci-dessus
   - Cliquez sur **"Save"**

### ✅ Vérification

Testez l'API avec un SIRET valide :

```bash
curl -X GET "https://api.insee.fr/entreprises/sirene/V3/siret/12345678901234" \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

Si vous obtenez un JSON avec les données de l'entreprise, c'est bon ! ✅

### 📝 Note importante

Le token INSEE expire après 7 jours. Vous devrez le renouveler régulièrement. Pour automatiser le renouvellement, créez un CRON job qui :
1. Génère un nouveau token
2. Met à jour le secret `INSEE_API_TOKEN` dans Supabase via l'API

---

## 🗄️ Étape 2 : Déployer les Migrations SQL (10 minutes)

### Objectif
Créer les nouvelles tables et colonnes pour stocker les informations entreprise, les logs de vérification, et les contrôles d'accès.

### Instructions

1. **Connectez-vous à Supabase**
   - Allez sur https://supabase.com
   - Ouvrez votre projet `lovelib-spyglass`

2. **Ouvrez l'éditeur SQL**
   - Dans le menu latéral, cliquez sur **"SQL Editor"**
   - Cliquez sur **"New query"**

3. **Copiez-collez le fichier SQL**
   - Ouvrez le fichier `DEPLOYMENT_SQL_VALIDATION_ENTREPRISE.sql`
   - Sélectionnez **tout le contenu** (Ctrl+A / Cmd+A)
   - Copiez (Ctrl+C / Cmd+C)
   - Collez dans l'éditeur SQL de Supabase (Ctrl+V / Cmd+V)

4. **Exécutez la migration**
   - Cliquez sur le bouton **"Run"** en bas à droite
   - Attendez la confirmation d'exécution (30-60 secondes)
   - Vérifiez qu'il n'y a pas d'erreurs

5. **Vérifiez le résultat**
   
   **Nouvelles colonnes dans `profiles`** :
   - Allez dans **"Table Editor"** → **"profiles"**
   - Vérifiez que ces colonnes existent :
     - `company_siret` (VARCHAR 14)
     - `company_siren` (VARCHAR 9)
     - `company_legal_name` (TEXT)
     - `company_address` (TEXT)
     - `trust_score` (INTEGER)
     - `max_free_audits` (INTEGER)
     - `free_audits_used` (INTEGER)
     - ... et 10 autres colonnes

   **Nouvelles tables** :
   - Allez dans **"Table Editor"**
   - Vérifiez que ces tables existent :
     - `company_verification_logs`
     - `audit_access_control`

   **Nouvelles fonctions SQL** :
   - Allez dans **"Database"** → **"Functions"**
   - Vérifiez que ces fonctions existent :
     - `calculate_trust_score`
     - `admin_approve_user`
     - `admin_reject_user`

   **Nouvelles vues** :
   - Allez dans **"Database"** → **"Views"**
   - Vérifiez que ces vues existent :
     - `admin_pending_verifications`
     - `admin_audit_analytics`

### ✅ Résultat attendu

Vous devriez voir ce message dans les logs SQL :
```
✅ Déploiement terminé avec succès !
Prochaines étapes :
1. Déployer les Edge Functions (validate-company-siret, check-audit-access)
2. Ajouter le secret INSEE_API_TOKEN dans Supabase
3. Activer la confirmation email dans Supabase Auth
4. Modifier le frontend via Lovable (page onboarding, ProtectedRoute)
```

### 🔍 Vérification des contraintes

Testez que les contraintes fonctionnent :

```sql
-- Tester la contrainte SIRET unique
INSERT INTO profiles (id, company_siret) 
VALUES ('00000000-0000-0000-0000-000000000001', '12345678901234');

-- Tenter d'insérer le même SIRET (doit échouer)
INSERT INTO profiles (id, company_siret) 
VALUES ('00000000-0000-0000-0000-000000000002', '12345678901234');
-- Erreur attendue : duplicate key value violates unique constraint "unique_siret"
```

---

## ⚡ Étape 3 : Déployer les Edge Functions (15 minutes)

### Objectif
Déployer les 2 nouvelles Edge Functions qui gèrent la validation SIRET et le contrôle d'accès aux audits.

### Option A : Via Lovable (Recommandé)

Si vous utilisez **Lovable**, les Edge Functions peuvent être déployées automatiquement :

1. **Copier les fichiers dans le projet GitHub**
   
   Copiez les 2 dossiers dans votre dépôt GitHub :
   ```
   supabase/functions/validate-company-siret/index.ts
   supabase/functions/check-audit-access/index.ts
   ```

2. **Commit et push**
   ```bash
   git add supabase/functions/
   git commit -m "feat: Add company validation and access control Edge Functions"
   git push origin main
   ```

3. **Vérifier le déploiement dans Lovable**
   - Allez sur votre projet Lovable
   - Vérifiez qu'un nouveau build est en cours
   - Attendez que le build soit terminé (5-10 minutes)

4. **Vérifier dans Supabase**
   - Allez dans **"Edge Functions"**
   - Vérifiez que ces 2 fonctions apparaissent :
     - `validate-company-siret`
     - `check-audit-access`

### Option B : Via l'Interface Supabase

Si vous préférez déployer manuellement :

1. **Accédez aux Edge Functions**
   - Dans Supabase, allez dans **"Edge Functions"**

2. **Créer la fonction `validate-company-siret`**
   - Cliquez sur **"Create a new function"**
   - Nom : `validate-company-siret`
   - Copiez le contenu de `edge-functions-validation/validate-company-siret/index.ts`
   - Collez dans l'éditeur
   - Cliquez sur **"Deploy"**

3. **Créer la fonction `check-audit-access`**
   - Cliquez sur **"Create a new function"**
   - Nom : `check-audit-access`
   - Copiez le contenu de `edge-functions-validation/check-audit-access/index.ts`
   - Collez dans l'éditeur
   - Cliquez sur **"Deploy"**

### Option C : Via Supabase CLI (Pour développeurs)

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref lovelib-spyglass

# Déployer les fonctions
supabase functions deploy validate-company-siret
supabase functions deploy check-audit-access
```

### ✅ Tester les Edge Functions

**Test 1 : validate-company-siret**

```bash
curl -X POST "https://lovelib-spyglass.supabase.co/functions/v1/validate-company-siret" \
  -H "Authorization: Bearer VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"siret": "12345678901234"}'
```

**Réponse attendue** (si SIRET valide) :
```json
{
  "valid": true,
  "siret": "12345678901234",
  "siren": "123456789",
  "legalName": "ENTREPRISE EXEMPLE SAS",
  "address": "123 Rue de la Paix, 75001 Paris",
  "legalForm": "5710",
  "creationDate": "2020-01-15",
  "isActive": true
}
```

**Test 2 : check-audit-access**

```bash
curl -X POST "https://lovelib-spyglass.supabase.co/functions/v1/check-audit-access" \
  -H "Authorization: Bearer VOTRE_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"websiteUrl": "https://www.example.com"}'
```

**Réponse attendue** (si accès autorisé) :
```json
{
  "allowed": true,
  "reason": "free_trial",
  "remaining_audits": 3,
  "trust_score": 60,
  "user_id": "xxx-xxx-xxx"
}
```

### 🔧 Modifier `orchestrate-multi-agent`

**Important** : Vous devez également modifier l'Edge Function existante `orchestrate-multi-agent` pour incrémenter le compteur d'audits.

Ajoutez ce code au début de la fonction (après la vérification JWT) :

```typescript
// Récupérer l'utilisateur authentifié
const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Non authentifié' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } }
  );
}

// Récupérer le profil
const { data: profile, error: profileError } = await supabaseClient
  .from('profiles')
  .select('free_audits_used, max_free_audits')
  .eq('id', user.id)
  .single();

if (profileError || !profile) {
  return new Response(
    JSON.stringify({ error: 'Profil introuvable' }),
    { status: 404, headers: { 'Content-Type': 'application/json' } }
  );
}

// Incrémenter le compteur d'audits gratuits
const { error: updateError } = await supabaseClient
  .from('profiles')
  .update({ 
    free_audits_used: profile.free_audits_used + 1 
  })
  .eq('id', user.id);

if (updateError) {
  console.error('Error updating audit counter:', updateError);
}

console.log(`✅ Audit counter incremented: ${profile.free_audits_used + 1}/${profile.max_free_audits}`);
```

---

## 📧 Étape 4 : Configurer l'Authentification Supabase (10 minutes)

### Objectif
Activer la confirmation email obligatoire et configurer le SMTP avec Resend.

### 4.1 : Activer la Confirmation Email

1. **Ouvrez les paramètres d'authentification**
   - Dans Supabase, allez dans **"Authentication"**
   - Cliquez sur **"Providers"**
   - Sélectionnez **"Email"**

2. **Activer la confirmation**
   - Cochez **"Confirm email"**
   - Décochez **"Enable auto-confirm"** (important !)
   - Cliquez sur **"Save"**

3. **Personnaliser le template d'email**
   - Allez dans **"Authentication"** → **"Email Templates"**
   - Sélectionnez **"Confirm signup"**
   - Modifiez le template :

   **Sujet** :
   ```
   Confirmez votre inscription sur IMOTION MANUS IA
   ```

   **Corps** (HTML) :
   ```html
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
     <h2 style="color: #2563eb;">Bienvenue sur IMOTION MANUS IA !</h2>
     
     <p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
     
     <p style="text-align: center; margin: 30px 0;">
       <a href="{{ .ConfirmationURL }}" 
          style="background: #2563eb; 
                 color: white; 
                 padding: 12px 24px; 
                 text-decoration: none; 
                 border-radius: 6px; 
                 display: inline-block;">
         Confirmer mon email
       </a>
     </p>
     
     <p style="color: #666; font-size: 14px;">
       Ce lien expire dans 24 heures.
     </p>
     
     <p style="color: #666; font-size: 14px;">
       Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email.
     </p>
     
     <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
     
     <p style="color: #999; font-size: 12px; text-align: center;">
       L'équipe IMOTION<br>
       <a href="https://www.imotion.fr" style="color: #2563eb;">www.imotion.fr</a>
     </p>
   </div>
   ```

   - Cliquez sur **"Save"**

### 4.2 : Configurer SMTP avec Resend

1. **Obtenir une clé API Resend**
   - Si vous n'avez pas encore de compte Resend, créez-en un sur https://resend.com
   - Allez dans **"API Keys"**
   - Créez une nouvelle clé API
   - Copiez la clé (elle ne sera affichée qu'une fois)

2. **Configurer SMTP dans Supabase**
   - Allez dans **"Project Settings"** → **"Auth"**
   - Scrollez jusqu'à **"SMTP Settings"**
   - Cliquez sur **"Enable Custom SMTP"**
   - Remplissez :
     - **Sender email** : `noreply@imotion.fr` (ou votre domaine)
     - **Sender name** : `IMOTION MANUS IA`
     - **Host** : `smtp.resend.com`
     - **Port** : `465`
     - **Username** : `resend`
     - **Password** : Votre clé API Resend
   - Cliquez sur **"Save"**

3. **Tester l'envoi d'email**
   - Créez un nouvel utilisateur via l'interface Supabase
   - Vérifiez que l'email de confirmation est envoyé
   - Vérifiez qu'il arrive bien dans la boîte mail

### ✅ Vérification

Créez un compte de test :

1. Allez sur votre site (ou via l'API)
2. Inscrivez-vous avec un email réel
3. Vérifiez que vous recevez l'email de confirmation
4. Cliquez sur le lien
5. Vérifiez que `email_confirmed_at` est rempli dans la table `auth.users`

```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'votre-email-test@example.com';
```

**Attendu** :
- `email_confirmed_at` doit avoir une valeur (pas NULL)

---

## 💻 Étape 5 : Modifier le Frontend via Lovable (1-2 heures)

### Objectif
Créer la page d'onboarding entreprise, protéger les routes, et modifier le formulaire d'audit pour vérifier l'accès.

### Instructions

Envoyez les **7 messages** contenus dans le fichier `MESSAGES_LOVABLE_VALIDATION_ENTREPRISE.md` à Lovable, **un par un**, dans l'ordre.

**⚠️ IMPORTANT** : Attendez que chaque modification soit appliquée et testée avant d'envoyer le message suivant.

### Ordre des messages

1. **Message 1** : Activer la confirmation email obligatoire
   - Durée : 5 minutes
   - Test : S'inscrire et vérifier l'email de confirmation

2. **Message 2** : Créer la page d'onboarding entreprise (`/onboarding/company`)
   - Durée : 20 minutes
   - Test : Remplir le formulaire avec un SIRET valide

3. **Message 3** : Créer le composant `ProtectedRoute`
   - Durée : 10 minutes
   - Test : Tenter d'accéder à `/client/new-project` sans être connecté

4. **Message 4** : Modifier `PreAuditForm` pour vérifier l'accès
   - Durée : 15 minutes
   - Test : Lancer un audit et vérifier le message "Audits restants"

5. **Message 5** : Modifier `orchestrate-multi-agent` pour incrémenter le compteur
   - Durée : 10 minutes
   - Test : Lancer 3 audits et vérifier que le 4ème est bloqué

6. **Message 6** : Créer la page admin de modération (`/admin/verifications`)
   - Durée : 30 minutes
   - Test : Se connecter en tant qu'admin et approuver un utilisateur

7. **Message 7** : Ajouter un badge "Audits restants" dans le header
   - Durée : 10 minutes
   - Test : Vérifier que le badge s'affiche et se met à jour

### 📝 Exemple de conversation avec Lovable

**Vous** :
```
Je veux activer la confirmation email OBLIGATOIRE pour tous les nouveaux utilisateurs.

Modifications à faire :

1. Dans supabase/config.toml, modifie la section [auth.email] :
...
```

**Lovable** :
```
Je vais activer la confirmation email obligatoire. Voici les modifications que je vais faire :
1. Modifier supabase/config.toml
2. Modifier le composant d'inscription
...
```

**Vous** (après vérification) :
```
Parfait ! Ça fonctionne. Passons au message suivant.
```

### 🧪 Tests de Validation

Après avoir envoyé tous les messages, testez le parcours complet :

#### Test 1 : Inscription complète

1. S'inscrire avec un nouvel email
2. Recevoir l'email de confirmation
3. Cliquer sur le lien de confirmation
4. Être redirigé vers `/onboarding/company`
5. Saisir un SIRET valide
6. Voir les informations pré-remplies
7. Remplir les informations personnelles
8. Valider et être redirigé vers `/dashboard`

#### Test 2 : Lancer un audit

1. Cliquer sur "Démarrer un projet"
2. Remplir le formulaire de pré-audit
3. Voir le message "Audits gratuits restants : 3"
4. Lancer l'audit avec succès
5. Vérifier que le compteur passe à "Audits gratuits restants : 2"

#### Test 3 : Limites d'audits

1. Lancer 3 audits gratuits
2. Au 4ème audit, voir le message "Vous avez utilisé vos 3 audits gratuits"
3. Être redirigé vers `/pricing`

#### Test 4 : Protection des routes

1. Se déconnecter
2. Tenter d'accéder à `/client/new-project`
3. Être redirigé vers `/auth`
4. Se connecter
5. Si infos entreprise manquantes, être redirigé vers `/onboarding/company`

#### Test 5 : Modération admin

1. Se connecter en tant qu'admin
2. Accéder à `/admin/verifications`
3. Voir les utilisateurs en attente (trust_score < 30)
4. Approuver un utilisateur
5. Vérifier que son trust_score passe à 80

---

## 📊 Tableau de Bord et Monitoring

### Vues SQL pour Admins

**Utilisateurs en attente de validation** :
```sql
SELECT * FROM admin_pending_verifications 
ORDER BY created_at DESC;
```

**Analytics quotidiens des audits** :
```sql
SELECT * FROM admin_audit_analytics 
ORDER BY date DESC 
LIMIT 30;
```

**Utilisateurs avec trust_score élevé** :
```sql
SELECT 
  email,
  company_legal_name,
  trust_score,
  free_audits_used,
  max_free_audits
FROM profiles
WHERE trust_score >= 80
ORDER BY trust_score DESC;
```

**Détection d'abus (même IP, plusieurs comptes)** :
```sql
SELECT 
  ip_address,
  COUNT(DISTINCT user_id) AS unique_users,
  COUNT(*) AS total_attempts,
  MAX(created_at) AS last_attempt
FROM audit_access_control
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY ip_address
HAVING COUNT(DISTINCT user_id) > 3
ORDER BY total_attempts DESC;
```

### Métriques Clés à Surveiller

1. **Taux de confirmation email** : % d'utilisateurs qui confirment leur email
2. **Taux de complétion onboarding** : % d'utilisateurs qui remplissent le formulaire entreprise
3. **Distribution trust_score** : Combien d'utilisateurs par tranche de score
4. **Taux de conversion audit gratuit → Premium** : % d'utilisateurs qui passent à Premium après 3 audits
5. **Taux de rejet admin** : % d'utilisateurs rejetés par les admins

---

## 🚨 Problèmes Courants et Solutions

### Problème 1 : L'API INSEE ne répond pas

**Symptôme** : Erreur 500 lors de la validation SIRET

**Causes possibles** :
- Token INSEE expiré (expire après 7 jours)
- API INSEE temporairement indisponible
- Rate limit dépassé (30 requêtes/minute)

**Solutions** :
1. Vérifier que le secret `INSEE_API_TOKEN` est bien configuré
2. Générer un nouveau token INSEE
3. Tester l'API manuellement avec `curl`
4. Implémenter un système de cache pour réduire les appels API

### Problème 2 : L'email de confirmation n'arrive pas

**Symptôme** : L'utilisateur ne reçoit pas l'email

**Causes possibles** :
- Configuration SMTP incorrecte
- Email dans les spams
- Domaine d'envoi non vérifié
- Rate limit Resend dépassé

**Solutions** :
1. Vérifier la configuration SMTP dans Supabase
2. Vérifier que `enable_confirmations = true` dans config.toml
3. Tester avec un email réel (pas temp-mail)
4. Vérifier les logs Resend
5. Ajouter un SPF/DKIM pour votre domaine

### Problème 3 : Le compteur d'audits ne s'incrémente pas

**Symptôme** : L'utilisateur peut lancer plus de 3 audits

**Causes possibles** :
- Code d'incrémentation manquant dans `orchestrate-multi-agent`
- Erreur lors de la mise à jour de la base de données
- RLS bloquant la mise à jour

**Solutions** :
1. Vérifier que le code d'incrémentation est bien dans `orchestrate-multi-agent`
2. Vérifier les logs de l'Edge Function
3. Tester manuellement l'incrémentation en SQL
4. Vérifier les politiques RLS sur la table `profiles`

### Problème 4 : Le trust_score reste à 0

**Symptôme** : Le trust_score ne se calcule pas automatiquement

**Causes possibles** :
- Trigger `trigger_update_trust_score` non actif
- Fonction `calculate_trust_score` avec erreur
- Données manquantes (professional_email, company_website)

**Solutions** :
1. Vérifier que le trigger est actif :
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_trust_score';
   ```
2. Tester manuellement la fonction :
   ```sql
   SELECT calculate_trust_score(p.*) FROM profiles p WHERE id = 'xxx';
   ```
3. Vérifier que les données sont bien renseignées
4. Recalculer manuellement le trust_score :
   ```sql
   UPDATE profiles SET trust_score = calculate_trust_score(profiles.*);
   ```

### Problème 5 : Rate limiting trop strict

**Symptôme** : Utilisateurs légitimes bloqués par le rate limiting

**Causes possibles** :
- Limite trop basse (10 requêtes/heure)
- Plusieurs utilisateurs derrière le même proxy/NAT

**Solutions** :
1. Augmenter la limite dans `check-audit-access` (ex: 20 requêtes/heure)
2. Ajouter une whitelist d'IPs de confiance
3. Utiliser un rate limiting par utilisateur plutôt que par IP
4. Implémenter un système de captcha pour les IPs suspectes

---

## 📈 Optimisations Futures

### 1. Renouvellement Automatique du Token INSEE

Créez un CRON job qui renouvelle le token INSEE tous les 6 jours :

```typescript
// Edge Function: renew-insee-token
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const consumerKey = Deno.env.get('INSEE_CONSUMER_KEY');
  const consumerSecret = Deno.env.get('INSEE_CONSUMER_SECRET');
  
  const credentials = btoa(`${consumerKey}:${consumerSecret}`);
  
  const response = await fetch('https://api.insee.fr/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  
  const data = await response.json();
  
  // Mettre à jour le secret INSEE_API_TOKEN via l'API Supabase Management
  // (nécessite un token de management)
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### 2. Cache des Données INSEE

Pour réduire les appels API, cachez les données INSEE pendant 30 jours :

```sql
CREATE TABLE IF NOT EXISTS insee_cache (
  siret VARCHAR(14) PRIMARY KEY,
  data JSONB NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_insee_cache_expires ON insee_cache(expires_at);
```

### 3. Vérification Email Professionnel

Ajoutez une vérification de l'email professionnel par envoi d'un code :

```typescript
// Envoyer un code à l'email professionnel
const code = Math.random().toString(36).substring(2, 8).toUpperCase();

await resend.emails.send({
  from: 'noreply@imotion.fr',
  to: professionalEmail,
  subject: 'Code de vérification IMOTION',
  html: `Votre code de vérification : <strong>${code}</strong>`
});

// Stocker le code dans la base
await supabase
  .from('email_verification_codes')
  .insert({
    user_id: userId,
    email: professionalEmail,
    code: code,
    expires_at: new Date(Date.now() + 600000) // 10 minutes
  });
```

### 4. Analyse de Cohérence des Données

Vérifiez la cohérence entre SIRET, email pro, et site web :

```typescript
// Extraire le domaine du site web depuis le SIRET (via API Pappers)
const response = await fetch(`https://api.pappers.fr/v2/entreprise?siret=${siret}&api_token=${PAPPERS_TOKEN}`);
const data = await response.json();
const officialWebsite = data.site_internet;

// Comparer avec le site web saisi
if (officialWebsite && officialWebsite !== companyWebsite) {
  // Warning : site web ne correspond pas au SIRET
  trustScore -= 20;
}
```

### 5. Scoring Avancé avec Machine Learning

Entraînez un modèle ML pour détecter les faux comptes :

```python
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

# Features
features = [
  'email_domain_matches_website',
  'professional_email_provided',
  'document_uploaded',
  'phone_provided',
  'siret_age_days',
  'registration_hour',
  'registration_day_of_week',
  'ip_country',
  'user_agent_is_mobile'
]

# Entraîner le modèle sur les données historiques
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Prédire le risque de faux compte
risk_score = model.predict_proba(user_features)[0][1]

if risk_score > 0.8:
  # Compte suspect, modération manuelle
  trust_score = 10
```

---

## ✅ Checklist Finale de Déploiement

### Base de Données
- [ ] Script SQL exécuté sans erreur
- [ ] 3 nouvelles tables créées (`company_verification_logs`, `audit_access_control`, etc.)
- [ ] 17 nouvelles colonnes ajoutées à `profiles`
- [ ] 3 fonctions SQL créées (`calculate_trust_score`, `admin_approve_user`, `admin_reject_user`)
- [ ] 2 vues créées (`admin_pending_verifications`, `admin_audit_analytics`)
- [ ] Contraintes actives (SIRET unique, format valide)
- [ ] Trigger `trigger_update_trust_score` actif

### Edge Functions
- [ ] `validate-company-siret` déployée et testée
- [ ] `check-audit-access` déployée et testée
- [ ] `orchestrate-multi-agent` modifiée (incrémentation compteur)
- [ ] Logs visibles dans Supabase Dashboard

### Secrets
- [ ] `INSEE_API_TOKEN` configuré dans Supabase
- [ ] Token INSEE valide et testé
- [ ] Tous les autres secrets présents (`OPENAI_API_KEY`, `RESEND_API_KEY`, etc.)

### Authentification
- [ ] Confirmation email activée (`enable_confirmations = true`)
- [ ] SMTP configuré avec Resend
- [ ] Template d'email personnalisé
- [ ] Email de confirmation reçu et testé

### Frontend
- [ ] Page `/onboarding/company` créée
- [ ] Validation SIRET en temps réel fonctionnelle
- [ ] Composant `ProtectedRoute` créé
- [ ] Routes protégées (`/client/new-project`, `/dashboard`)
- [ ] `PreAuditForm` modifié (vérification accès)
- [ ] Badge "Audits restants" dans le header
- [ ] Page admin `/admin/verifications` créée

### Tests
- [ ] Test inscription + confirmation email
- [ ] Test onboarding avec SIRET valide
- [ ] Test lancement d'audit (accès autorisé)
- [ ] Test limite 3 audits gratuits
- [ ] Test protection des routes
- [ ] Test modération admin
- [ ] Test rate limiting (10 requêtes/heure)

### Documentation
- [ ] Guide de déploiement lu et compris
- [ ] Messages Lovable envoyés et appliqués
- [ ] Équipe formée sur le système de validation
- [ ] Procédure de modération documentée

---

## 🎉 Félicitations !

Vous avez déployé avec succès le système de validation d'entreprise IMOTION MANUS IA 2.0 !

Votre plateforme dispose maintenant de :
- ✅ Authentification robuste avec email obligatoire
- ✅ Validation SIRET/SIREN automatique via API INSEE
- ✅ Système anti-abus avec trust score et rate limiting
- ✅ Limite de 3 audits gratuits par entreprise
- ✅ Modération manuelle pour les comptes suspects
- ✅ Logs complets pour analytics et détection de fraude

**Prochaines étapes** :
1. Monitorer les métriques clés (taux de confirmation, trust_score, audits lancés)
2. Ajuster les seuils si nécessaire (trust_score minimum, rate limiting)
3. Former les admins à la modération
4. Implémenter les optimisations futures (cache INSEE, ML scoring)

**Support** :
- Documentation complète : `PLAN_ARCHITECTURE_VALIDATION_ENTREPRISE.md`
- Messages Lovable : `MESSAGES_LOVABLE_VALIDATION_ENTREPRISE.md`
- Script SQL : `DEPLOYMENT_SQL_VALIDATION_ENTREPRISE.sql`

Bon lancement ! 🚀
