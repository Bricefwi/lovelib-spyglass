# Guide de Correction - Erreur OAuth Google (redirect_uri_mismatch)

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
