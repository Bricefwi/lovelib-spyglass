# 🔧 CORRECTIFS APPLICATION - INSTRUCTIONS LOVABLE

Ce document contient tous les correctifs à apporter à l'application IMOTION. Copiez-collez chaque section dans le chat Lovable.

**Note :** Lovable est maintenant connecté à Claude et Perplexity pour vous assister dans la mise en œuvre de ces correctifs.

---

## 📋 RÉSUMÉ DES PROBLÈMES À CORRIGER

1. ❌ **Envoi d'emails échoue** - Edge Function manque de clé API Resend
2. ❌ **Profils incomplets** - Comptage incohérent (affiche 5, trouve 0)
3. ❌ **Adresse email incorrecte** dans les factures/devis

---

## 🔧 CORRECTIF 1 : Configuration Resend pour l'envoi d'emails

### **Prompt pour Lovable :**

```
Je rencontre une erreur "Failed to send a request to the Edge Function" lors de l'envoi d'emails (devis, factures, rapports d'audit).

L'edge function `send-audit-results` utilise Resend pour envoyer des emails mais la variable d'environnement RESEND_API_KEY n'est pas configurée.

Peux-tu :

1. Vérifier que la clé RESEND_API_KEY est bien configurée dans les secrets de l'edge function
2. Si elle n'existe pas, m'indiquer comment l'ajouter dans Supabase
3. Vérifier que l'edge function `send-audit-results` gère correctement les erreurs Resend
4. Modifier l'email "from" de "onboarding@resend.dev" vers "contact@imotion.fr" (ligne 203)

Voici le code actuel de l'edge function (lignes concernées) :

```typescript
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// ...

const emailResponse = await resend.emails.send({
  from: "IMOTION Conseil <onboarding@resend.dev>",  // ❌ À corriger
  to: [targetEmail],
  subject: subject,
  html: emailHTML,
});
```

Merci de me donner le code corrigé avec une meilleure gestion d'erreur.
```

---

## 🔧 CORRECTIF 2 : Comptage des profils incomplets

### **Contexte du problème :**

Dans la fonctionnalité "Rappel profil" (Control Tower), l'application affiche "Notifier les 5 utilisateurs avec profil incomplet" mais quand on clique sur "Envoyer le rappel", ça retourne "❗ Aucun profil incomplet trouvé".

Le problème vient d'une **définition incohérente** de "profil incomplet" :

**Définition actuelle dans AdminUsers.tsx (ligne 303-306) :**
```typescript
{user.firstname && user.lastname
  ? `${user.firstname} ${user.lastname}`
  : <span className="text-muted-foreground">Profil incomplet</span>
}
```
→ Profil incomplet = Prénom OU Nom manquant

**Mais la fonctionnalité "Rappel profil" cherche probablement autre chose** (email manquant ?).

### **Prompt pour Lovable :**

```
J'ai un problème de comptage incohérent dans la fonctionnalité "Rappel profil" :

**Symptôme :**
- L'interface affiche "Notifier les 5 utilisateurs avec profil incomplet"
- Quand je clique sur "Envoyer le rappel", j'obtiens "Aucun profil incomplet trouvé"

**Définition actuelle de "profil incomplet" dans AdminUsers.tsx :**
Un profil est incomplet si `firstname` OU `lastname` est manquant.

**Problème :**
La fonctionnalité "Rappel profil" utilise probablement une définition différente de "profil incomplet".

**Besoin :**
1. Localise la fonctionnalité "Rappel profil" / "Control Tower" dans le code
2. Unifie la définition de "profil incomplet" :
   - Un profil est incomplet si : `firstname` manquant OU `lastname` manquant OU `email` manquant
3. Corrige la logique de comptage pour qu'elle utilise exactement la même requête que la fonction d'envoi
4. Assure-toi que le comptage affiché et les utilisateurs ciblés par l'envoi sont identiques

**Requête SQL suggérée pour identifier les profils incomplets :**

```sql
SELECT
  user_id,
  email,
  firstname,
  lastname
FROM profiles
WHERE
  firstname IS NULL
  OR lastname IS NULL
  OR email IS NULL
  OR firstname = ''
  OR lastname = ''
  OR email = ''
```

Peux-tu me montrer où se trouve cette fonctionnalité et me donner le code corrigé ?
```

---

## 🔧 CORRECTIF 3 : Affichage de l'email dans le Dashboard utilisateur

### **Status :** ✅ **DÉJÀ CORRIGÉ**

L'email de l'utilisateur s'affiche maintenant correctement dans la section "Votre Entreprise" du Dashboard.

**Code corrigé (src/pages/Dashboard.tsx, ligne 283-286) :**
```typescript
<div>
  <p className="text-sm text-muted-foreground">Email</p>
  <p className="font-semibold">{profile.email}</p>
</div>
```

✅ Aucune action nécessaire pour ce correctif.

---

## 🔧 CORRECTIF 4 : Amélioration de l'edge function d'envoi d'emails

### **Prompt pour Lovable :**

```
Je veux améliorer la gestion d'erreur de l'edge function `send-audit-results` pour mieux diagnostiquer les problèmes d'envoi d'emails.

**Améliorations demandées :**

1. **Vérification de la clé API au démarrage :**
```typescript
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
if (!RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not configured");
  throw new Error("RESEND_API_KEY environment variable is required");
}
const resend = new Resend(RESEND_API_KEY);
```

2. **Validation de l'email destinataire :**
```typescript
// Vérifier que l'email est valide avant d'envoyer
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(targetEmail)) {
  return new Response(
    JSON.stringify({ error: `Invalid email address: ${targetEmail}` }),
    { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

3. **Meilleure gestion des erreurs Resend :**
```typescript
try {
  const emailResponse = await resend.emails.send({
    from: "IMOTION Conseil <contact@imotion.fr>", // ✅ Corrigé
    to: [targetEmail],
    subject: subject,
    html: emailHTML,
  });

  if (!emailResponse.data) {
    throw new Error("Resend did not return email data");
  }

  console.log("✅ Email sent successfully:", emailResponse.data.id);

  return new Response(JSON.stringify({
    success: true,
    emailId: emailResponse.data.id,
    sentTo: targetEmail
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

} catch (resendError: any) {
  console.error("❌ Resend API error:", {
    message: resendError.message,
    code: resendError.code,
    statusCode: resendError.statusCode,
  });

  return new Response(
    JSON.stringify({
      error: "Failed to send email via Resend",
      details: resendError.message,
      code: resendError.code || "UNKNOWN"
    }),
    { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}
```

4. **Logs détaillés pour le debugging :**
```typescript
console.log("📧 Email sending details:", {
  reportId,
  targetEmail,
  auditType,
  websiteUrl: website,
  companyName,
  reportUrl,
});
```

Peux-tu modifier l'edge function `send-audit-results/index.ts` avec ces améliorations ?
```

---

## 🔧 CORRECTIF 5 : Edge function pour rappel de profils incomplets

### **Prompt pour Lovable :**

```
Je veux créer une nouvelle edge function pour gérer l'envoi de rappels aux utilisateurs avec profils incomplets.

**Nom de l'edge function :** `send-incomplete-profile-reminders`

**Fonctionnalité :**
1. Récupère tous les utilisateurs avec profils incomplets (firstname OU lastname OU email manquant)
2. Envoie un email de rappel à chaque utilisateur pour compléter son profil
3. Enregistre l'envoi dans une table `profile_reminder_logs`
4. Retourne le nombre d'emails envoyés

**Schéma de la table profile_reminder_logs :**
```sql
CREATE TABLE profile_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL, -- 'sent' | 'failed'
  error_message TEXT,
  missing_fields TEXT[] -- ['firstname', 'lastname', 'email']
);
```

**Code de l'edge function :**

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérifier la clé Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    const resend = new Resend(RESEND_API_KEY);

    // Créer le client Supabase avec SERVICE_ROLE
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Récupérer les utilisateurs avec profils incomplets
    const { data: incompleteProfiles, error: queryError } = await supabase
      .from('profiles')
      .select('user_id, email, firstname, lastname')
      .or('firstname.is.null,lastname.is.null,email.is.null,firstname.eq.,lastname.eq.,email.eq.');

    if (queryError) {
      console.error("Query error:", queryError);
      throw queryError;
    }

    if (!incompleteProfiles || incompleteProfiles.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          count: 0,
          message: "Aucun profil incomplet trouvé"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${incompleteProfiles.length} incomplete profiles`);

    let sentCount = 0;
    let failedCount = 0;

    // Envoyer un email à chaque utilisateur
    for (const profile of incompleteProfiles) {
      const missingFields: string[] = [];
      if (!profile.firstname) missingFields.push('firstname');
      if (!profile.lastname) missingFields.push('lastname');
      if (!profile.email) missingFields.push('email');

      // Si l'email manque, on ne peut pas envoyer
      if (!profile.email) {
        console.warn(`Cannot send reminder to user ${profile.user_id}: email missing`);
        await supabase.from('profile_reminder_logs').insert({
          user_id: profile.user_id,
          email: 'email_missing',
          status: 'failed',
          error_message: 'Email address missing',
          missing_fields: missingFields,
        });
        failedCount++;
        continue;
      }

      try {
        // Template d'email
        const emailHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Complétez votre profil IMOTION</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; padding: 30px;">
    <h1 style="color: #E30613;">📋 Complétez votre profil IMOTION</h1>
    <p>Bonjour,</p>
    <p>Nous avons remarqué que votre profil IMOTION est incomplet.</p>
    <p><strong>Champs manquants :</strong></p>
    <ul>
      ${missingFields.includes('firstname') ? '<li>Prénom</li>' : ''}
      ${missingFields.includes('lastname') ? '<li>Nom</li>' : ''}
    </ul>
    <p>Pour profiter pleinement de nos services, merci de compléter votre profil en vous connectant à votre compte.</p>
    <a href="https://7c6553ec-011c-44ef-a323-d4dbfc5215db.lovableproject.com/dashboard"
       style="display: inline-block; background-color: #E30613; color: white; padding: 12px 24px;
              text-decoration: none; border-radius: 4px; margin: 20px 0;">
      Compléter mon profil
    </a>
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      L'équipe IMOTION<br/>
      contact@imotion.fr
    </p>
  </div>
</body>
</html>
        `;

        // Envoyer l'email
        const emailResponse = await resend.emails.send({
          from: "IMOTION <contact@imotion.fr>",
          to: [profile.email],
          subject: "📋 Complétez votre profil IMOTION",
          html: emailHTML,
        });

        // Logger le succès
        await supabase.from('profile_reminder_logs').insert({
          user_id: profile.user_id,
          email: profile.email,
          status: 'sent',
          missing_fields: missingFields,
        });

        sentCount++;
        console.log(`✅ Reminder sent to ${profile.email}`);

      } catch (emailError: any) {
        console.error(`❌ Failed to send to ${profile.email}:`, emailError.message);

        // Logger l'échec
        await supabase.from('profile_reminder_logs').insert({
          user_id: profile.user_id,
          email: profile.email,
          status: 'failed',
          error_message: emailError.message,
          missing_fields: missingFields,
        });

        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalIncomplete: incompleteProfiles.length,
        sent: sentCount,
        failed: failedCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
```

Peux-tu :
1. Créer cette edge function `send-incomplete-profile-reminders`
2. Créer la table `profile_reminder_logs` avec la migration SQL
3. Créer un bouton dans l'interface admin pour déclencher cette fonction
4. Afficher le résultat (nombre d'emails envoyés) après l'exécution
```

---

## 🔧 CORRECTIF 6 : Interface admin pour les rappels de profils

### **Prompt pour Lovable :**

```
Dans la page AdminUsers (/admin/users), je veux ajouter une section en haut de page pour gérer les rappels de profils incomplets.

**Design :**

```tsx
{/* Section Rappel Profils Incomplets */}
<Card className="mb-6 border-l-4 border-l-orange-500">
  <CardContent className="p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <AlertCircle className="h-8 w-8 text-orange-500" />
        <div>
          <h3 className="text-lg font-semibold">Rappel de profils incomplets</h3>
          <p className="text-sm text-muted-foreground">
            {incompleteCount} utilisateur{incompleteCount > 1 ? 's' : ''} avec profil incomplet
          </p>
        </div>
      </div>
      <Button
        onClick={handleSendReminders}
        disabled={sendingReminders || incompleteCount === 0}
        className="gap-2"
      >
        {sendingReminders ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Envoyer les rappels
          </>
        )}
      </Button>
    </div>
  </CardContent>
</Card>
```

**Logique :**

```typescript
const [incompleteCount, setIncompleteCount] = useState(0);
const [sendingReminders, setSendingReminders] = useState(false);

// Compter les profils incomplets (même logique que l'edge function)
useEffect(() => {
  const countIncomplete = users.filter(u =>
    !u.firstname || !u.lastname || !u.email ||
    u.firstname === '' || u.lastname === '' || u.email === ''
  ).length;
  setIncompleteCount(countIncomplete);
}, [users]);

// Envoyer les rappels
const handleSendReminders = async () => {
  setSendingReminders(true);
  try {
    const { data, error } = await supabase.functions.invoke('send-incomplete-profile-reminders');

    if (error) throw error;

    toast.success(
      `Rappels envoyés avec succès : ${data.sent} email(s) envoyé(s), ${data.failed} échec(s)`
    );
  } catch (error: any) {
    console.error('Error sending reminders:', error);
    toast.error(`Erreur : ${error.message}`);
  } finally {
    setSendingReminders(false);
  }
};
```

Peux-tu ajouter cette section à la page AdminUsers.tsx ?
```

---

## 📝 ORDRE D'EXÉCUTION RECOMMANDÉ

1. **CORRECTIF 1** - Configuration Resend (priorité haute)
2. **CORRECTIF 4** - Amélioration edge function d'envoi
3. **CORRECTIF 5** - Création edge function rappels profils
4. **CORRECTIF 2** - Correction comptage profils incomplets
5. **CORRECTIF 6** - Interface admin rappels

---

## ✅ CHECKLIST DE VALIDATION

Après avoir appliqué tous les correctifs, vérifiez :

- [ ] Les emails de rapports d'audit s'envoient correctement
- [ ] L'email "from" est bien "contact@imotion.fr"
- [ ] Le comptage des profils incomplets est cohérent
- [ ] Les rappels de profils s'envoient aux bons utilisateurs
- [ ] L'email s'affiche dans le Dashboard utilisateur
- [ ] Les logs des rappels sont enregistrés dans profile_reminder_logs

---

## 🆘 SUPPORT

Si un correctif échoue, demandez à Lovable :
```
Le correctif [numéro] a échoué avec l'erreur suivante : [message d'erreur]

Peux-tu m'aider à diagnostiquer et corriger ce problème ?
```

---

**Bonne chance avec les correctifs ! 🚀**
