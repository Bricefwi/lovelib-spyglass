# Guide de Correction - Erreurs d'Authentification

Ce guide couvre trois problemes :
1. Erreur OAuth Google (redirect_uri_mismatch)
2. Inscription par email qui ne fonctionne plus
3. **NOUVEAU** : Connexion Google complete mais utilisateur non connecte

---

# PROBLEME 1 : Inscription Email Non Fonctionnelle

## Diagnostic

Le code dans `src/pages/Auth.tsx` (lignes 134-144) bloque la connexion si `email_confirmed_at` est null :

```typescript
// Probleme : Ce code empeche la connexion si l'email n'est pas confirme
if (!data.user.email_confirmed_at) {
  await supabase.auth.signOut();
  toast({
    title: "Email non confirme",
    description: "Veuillez confirmer votre adresse email...",
    variant: "destructive"
  });
  return;
}
```

## Causes Possibles

1. **Emails de confirmation non envoyes** - Configuration SMTP/Resend manquante
2. **URL de redirection non autorisee** - `emailRedirectTo` bloquee par Supabase
3. **Mode auto-confirm desactive** - Necessite confirmation email mais emails non recus

## Solutions

### Solution A : Activer Auto-Confirm (Recommandee)

1. Supabase Dashboard > Authentication > Providers > Email
2. Desactivez "Confirm email" ou activez "Auto-confirm users"
3. Supprimez le bloc de verification dans Auth.tsx (lignes 134-144)

### Solution B : Corriger l'Envoi d'Emails

1. Verifiez Supabase > Project Settings > Authentication > SMTP
2. Si custom SMTP : verifiez les credentials
3. Testez avec la page `/diagnostic-auth`

### Solution C : Ajouter les URLs Autorisees

Dans Supabase > Authentication > URL Configuration, ajoutez :

```
Site URL: https://novel-pathfinder-app.lovable.app

Redirect URLs:
https://novel-pathfinder-app.lovable.app/onboarding/company
https://novel-pathfinder-app.lovable.app/auth
https://novel-pathfinder-app.lovable.app/auth/callback
```

---

# PROBLEME 2 : Erreur OAuth Google (redirect_uri_mismatch)

## Probleme Identifie

L'erreur **400 redirect_uri_mismatch** se produit car l'URI de redirection utilisee par l'application Lovable n'est pas enregistree dans Google Cloud Console.

```
URI de redirection actuelle: https://novel-pathfinder-app.lovable.app/~oauth/callback
```

## Solution

### Etape 1 : Configuration Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Selectionnez votre projet
3. Naviguez vers **APIs & Services** > **Credentials**
4. Trouvez votre **OAuth 2.0 Client ID** et cliquez sur l'icone crayon (modifier)
5. Dans la section **Authorized redirect URIs**, ajoutez EXACTEMENT cette URL :

```
https://novel-pathfinder-app.lovable.app/~oauth/callback
```

6. Cliquez sur **Save**

### Etape 2 : Configuration Supabase (si necessaire)

Si vous utilisez des identifiants Google personnalises dans Supabase :

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Selectionnez votre projet : `gzfrcshvrktpejctlgta`
3. Naviguez vers **Authentication** > **Providers** > **Google**
4. Deux options :
   - **Option A (Recommandee)** : Videz les champs Client ID et Client Secret pour utiliser le mode gere par Supabase
   - **Option B** : Gardez vos identifiants et assurez-vous que l'URI de redirection est correctement configuree dans Google Cloud

### Etape 3 : Verification

Apres les modifications, attendez 5 minutes puis retestez la connexion Google.

## URLs de Redirection a Enregistrer

Pour une configuration complete, ajoutez ces URIs dans Google Cloud Console :

```
https://novel-pathfinder-app.lovable.app/~oauth/callback
https://gzfrcshvrktpejctlgta.supabase.co/auth/v1/callback
```

## Code de l'Application

Le code dans `src/pages/Auth.tsx` utilise correctement Supabase OAuth :

```typescript
const handleSocialLogin = async (provider: 'google' | 'apple' | 'azure' | 'facebook') => {
  await supabase.auth.signInWithOAuth({
    provider: provider,
    options: {
      redirectTo: `${window.location.origin}/onboarding/company`,
    },
  });
};
```

Ce code est correct. Le probleme est purement de configuration cote Google Cloud Console.

---

# PROBLEME 3 : Connexion Google Complete mais Non Connecte (CRITIQUE)

## Symptome

Apres l'authentification Google :
- Plus d'erreur 400
- L'utilisateur est redirige vers la page d'accueil (Home)
- Mais il n'est PAS connecte

## Diagnostic

Le handler `onAuthStateChange` dans `src/pages/Auth.tsx` (lignes 43-52) est **VIDE** :

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && event === "SIGNED_IN") {
      setTimeout(() => {
        // Trigger role check  <-- NE FAIT RIEN!
      }, 500);
    }
  });
  return () => subscription.unsubscribe();
}, []);
```

**Le callback ne fait rien apres la connexion OAuth !**

## Race Condition

1. OAuth redirige vers `/onboarding/company`
2. Onboarding verifie la session (pas encore prete a cause du timing)
3. Redirige vers `/auth`
4. Auth verifie le role (pas de role) -> redirige vers `/` (Home)

## Solution : Corriger le Handler

Remplacer le code vide par :

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session && event === "SIGNED_IN") {
      // Recuperer le role de l'utilisateur
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      // Rediriger selon le role
      if (roleData?.role === 'admin') {
        navigate("/admin/audits");
      } else if (roleData?.role === 'client') {
        navigate("/client/audits");
      } else {
        navigate("/onboarding/company");
      }
    }
  });

  return () => subscription.unsubscribe();
}, [navigate]);
```

## Solution Alternative : Creer une Page Callback

Creer `src/pages/AuthCallback.tsx` pour gerer le retour OAuth avec un loader et une gestion d'attente propre. Voir `PROMPTS_LOVABLE_OAUTH_FIX.md` pour le code complet.
