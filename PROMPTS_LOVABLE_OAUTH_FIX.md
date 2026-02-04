# Prompts Lovable pour Corriger les Erreurs d'Authentification

## Contexte
L'application rencontre deux problemes :
1. Erreur **400 redirect_uri_mismatch** lors de la connexion avec Google OAuth
2. La **creation de compte par email** ne fonctionne plus

---

# PARTIE 1 : Correction Inscription Email

## Probleme Identifie
Le code dans `src/pages/Auth.tsx` (lignes 134-144) bloque la connexion si l'email n'est pas confirme :
```typescript
if (!data.user.email_confirmed_at) {
  await supabase.auth.signOut();
  // Affiche erreur "Email non confirme"
}
```

Cependant :
- Les emails de confirmation peuvent ne pas etre envoyes (configuration SMTP)
- L'URL de redirection email peut ne pas etre autorisee dans Supabase

---

## Prompt Email 1 : Diagnostic Inscription Email

```
L'inscription par email ne fonctionne plus. Quand un utilisateur s'inscrit :
1. Le compte semble se creer
2. Mais l'email de confirmation n'arrive jamais
3. Et la connexion echoue avec "Email non confirme"

Verifie dans Supabase :
1. Les parametres SMTP/Email (Authentication > Email Templates)
2. Si "Confirm email" est active ou non
3. Les URL autorisees dans "URL Configuration"

L'URL de redirection email utilisee est : ${window.location.origin}/onboarding/company
```

---

## Prompt Email 2 : Corriger le Code Auth.tsx

```
Dans le fichier src/pages/Auth.tsx, il y a un probleme avec la verification email_confirmed_at.

Modifie la fonction handleSignIn pour :
1. NE PAS bloquer la connexion si email_confirmed_at est null ET que le mode auto-confirm est active
2. Ou bien supprimer completement cette verification si Supabase gere l'auto-confirmation

Voici le code problematique a corriger (lignes 134-144) :
if (!data.user.email_confirmed_at) {
  await supabase.auth.signOut();
  toast({ title: "Email non confirme", ... });
  return;
}

Option 1 : Supprimer ce bloc de code
Option 2 : Ajouter une verification de configuration avant de bloquer
```

---

## Prompt Email 3 : Activer Auto-Confirm (Solution Rapide)

```
Je veux que les utilisateurs puissent se connecter immediatement apres inscription, sans confirmation email.

1. Va dans Supabase > Authentication > Email Auth
2. Desactive "Enable email confirmations" OU active "Auto-confirm users"
3. Dans src/pages/Auth.tsx, supprime ou commente le bloc qui verifie email_confirmed_at (lignes 134-144)
4. Teste l'inscription et la connexion immediates
```

---

## Prompt Email 4 : Configurer les URLs Autorisees

```
Ajoute les URLs suivantes dans Supabase > Authentication > URL Configuration :

Site URL:
https://novel-pathfinder-app.lovable.app

Redirect URLs (une par ligne):
https://novel-pathfinder-app.lovable.app/onboarding/company
https://novel-pathfinder-app.lovable.app/auth
https://novel-pathfinder-app.lovable.app/auth/callback
https://novel-pathfinder-app.lovable.app/~oauth/callback

Ces URLs sont necessaires pour :
- La confirmation email
- La reinitialisation de mot de passe
- Les callbacks OAuth
```

---

## Prompt Email 5 : Verifier Configuration Resend/SMTP

```
Verifie la configuration email dans Supabase :

1. Va dans Project Settings > Authentication > SMTP Settings
2. Verifie si un custom SMTP est configure
3. Si Resend est utilise, verifie que :
   - L'API key RESEND_API_KEY est valide
   - Le domaine d'envoi est verifie
   - L'adresse "from" est autorisee

4. Teste l'envoi d'email avec le diagnostic : /diagnostic-auth
```

---

# PARTIE 2 : Correction OAuth Google

---

## Prompt 1 : Diagnostic et Configuration Supabase

```
Je rencontre une erreur OAuth Google "redirect_uri_mismatch" (erreur 400) lors de la connexion.

L'URI de redirection bloquee est : https://novel-pathfinder-app.lovable.app/~oauth/callback

Peux-tu :
1. Verifier la configuration OAuth Google dans les parametres Supabase du projet
2. M'indiquer si des identifiants Google personnalises (Client ID/Secret) sont configures
3. Si oui, me guider pour soit :
   - Les supprimer pour utiliser le mode gere par Lovable/Supabase
   - Ou me donner les instructions exactes pour configurer Google Cloud Console

Affiche-moi egalement l'URL exacte du callback OAuth que je dois ajouter dans Google Cloud Console.
```

---

## Prompt 2 : Verification du Code Auth.tsx

```
Verifie le fichier src/pages/Auth.tsx et assure-toi que :
1. La fonction handleSocialLogin utilise correctement signInWithOAuth
2. L'option redirectTo pointe vers une URL valide de l'application
3. Le flux OAuth est correctement configure pour Google

Si des corrections sont necessaires dans le code, applique-les.
```

---

## Prompt 3 : Configuration Complete OAuth (si identifiants personnalises)

```
Je dois configurer Google OAuth avec mes propres identifiants. Voici ce dont j'ai besoin :

1. Cree ou met a jour la configuration pour supporter Google OAuth
2. Les URIs de redirection autorisees doivent inclure :
   - https://novel-pathfinder-app.lovable.app/~oauth/callback
   - https://gzfrcshvrktpejctlgta.supabase.co/auth/v1/callback

3. Assure-toi que le flow OAuth redirige correctement vers /onboarding/company apres authentification

4. Ajoute une gestion d'erreur appropriee si l'OAuth echoue
```

---

## Prompt 4 : Supprimer les Identifiants Google Personnalises (Option Simple)

```
Je souhaite utiliser le mode OAuth gere par Lovable/Supabase pour Google.

1. Va dans les parametres d'authentification Supabase
2. Dans la section Google Provider, supprime les identifiants personnalises (Client ID et Client Secret) s'ils sont presents
3. Active le mode "Managed by Supabase/Lovable" pour Google OAuth
4. Confirme-moi que la configuration est correcte

Cela devrait resoudre l'erreur redirect_uri_mismatch.
```

---

## Prompt 5 : Test et Validation

```
Apres les modifications OAuth :

1. Verifie que la connexion Google fonctionne correctement
2. Teste le flux complet : bouton Google -> authentification -> redirection vers /onboarding/company
3. Assure-toi que les erreurs OAuth sont correctement gerees et affichees a l'utilisateur
4. Confirme que la session utilisateur est correctement creee apres authentification
```

---

## Instructions pour Google Cloud Console

Si vous devez configurer manuellement Google Cloud Console :

### Etape 1 : Acceder aux Credentials
1. https://console.cloud.google.com/apis/credentials
2. Selectionnez votre projet ou creez-en un nouveau

### Etape 2 : Configurer OAuth 2.0 Client
1. Cliquez sur "Create Credentials" > "OAuth client ID"
2. Type d'application : "Web application"
3. Nom : "IMOTION Lovable App"

### Etape 3 : URIs Autorisees
**Authorized JavaScript origins:**
```
https://novel-pathfinder-app.lovable.app
```

**Authorized redirect URIs:**
```
https://novel-pathfinder-app.lovable.app/~oauth/callback
https://gzfrcshvrktpejctlgta.supabase.co/auth/v1/callback
```

### Etape 4 : Copier les Identifiants
1. Notez le Client ID et Client Secret
2. Entrez-les dans Supabase > Authentication > Providers > Google

---

## Resolution Rapide

La solution la plus simple est souvent de **supprimer les identifiants Google personnalises** dans Supabase et d'utiliser le mode gere automatiquement. Cela evite les problemes de configuration redirect_uri.
