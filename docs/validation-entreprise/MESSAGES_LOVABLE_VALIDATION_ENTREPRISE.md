# 📧 Messages pour Lovable : Système de Validation d'Entreprise

## 🎯 Contexte

Ces messages doivent être envoyés **séquentiellement** à Lovable pour implémenter le système de validation d'entreprise avec SIRET/SIREN obligatoire, vérification email, et anti-abus.

**⚠️ IMPORTANT** : Attendez que chaque modification soit appliquée et testée avant d'envoyer le message suivant.

---

## 📨 Message 1 : Activer la Confirmation Email Obligatoire

```
Je veux activer la confirmation email OBLIGATOIRE pour tous les nouveaux utilisateurs.

Modifications à faire :

1. Dans supabase/config.toml, modifie la section [auth.email] :

[auth.email]
enable_signup = true
enable_confirmations = true
double_confirm_changes = true

2. Dans le composant d'inscription (probablement Auth.tsx ou SignUp.tsx), modifie le message après inscription pour afficher :

"✅ Inscription réussie !

Un email de confirmation a été envoyé à votre adresse.
Veuillez cliquer sur le lien pour activer votre compte.

⏱️ Le lien expire dans 24 heures.
📧 Pensez à vérifier vos spams."

3. Empêche l'utilisateur de se connecter tant que l'email n'est pas confirmé.

4. Dans Supabase Dashboard → Authentication → Email Templates, personnalise le template "Confirm signup" avec :

Sujet : "Confirmez votre inscription sur IMOTION MANUS IA"

Corps :
<h2>Bienvenue sur IMOTION MANUS IA !</h2>
<p>Merci de vous être inscrit. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
<p><a href="{{ .ConfirmationURL }}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Confirmer mon email</a></p>
<p>Ce lien expire dans 24 heures.</p>
<p>Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer cet email.</p>
<p>L'équipe IMOTION</p>
```

**Résultat attendu** :
- Après inscription, l'utilisateur voit le message de confirmation
- Il ne peut pas se connecter avant d'avoir cliqué sur le lien
- Un email est envoyé avec le template personnalisé

---

## 📨 Message 2 : Créer la Page d'Onboarding Entreprise

```
Je veux créer une nouvelle page /onboarding/company pour collecter les informations entreprise après la confirmation email.

Crée une nouvelle page avec ce design :

📍 Route : /onboarding/company

🎨 Design :
- Titre : "Identification de votre entreprise"
- Sous-titre : "Ces informations nous permettent de personnaliser votre audit et de garantir la qualité des analyses."
- Formulaire en 4 sections

📋 Section 1 : SIRET/SIREN
- Label : "SIRET de votre entreprise *"
- Input : type="text", maxLength=14, placeholder="14 chiffres (ex: 12345678901234)"
- Bouton : "Valider le SIRET" qui appelle l'Edge Function validate-company-siret
- Afficher un loader pendant la validation
- Si valide, afficher ✅ et pré-remplir les champs ci-dessous
- Si invalide, afficher ❌ avec le message d'erreur

📋 Section 2 : Informations Entreprise (pré-remplies après validation SIRET)
- Raison sociale (disabled, pré-rempli)
- Adresse du siège (disabled, pré-rempli)
- Forme juridique (disabled, pré-rempli)
- Site web de l'entreprise (input text, requis)

📋 Section 3 : Vos Informations
- Prénom * (input text)
- Nom * (input text)
- Fonction dans l'entreprise * (select avec options) :
  * Dirigeant / Gérant
  * Directeur Marketing
  * Responsable Communication
  * Responsable Commercial
  * Consultant externe
  * Autre

📋 Section 4 : Contact Professionnel (optionnel mais recommandé)
- Email professionnel (input email)
- Info : "💡 Utilisez votre email professionnel (@votreentreprise.com) pour augmenter votre score de confiance et accéder à plus d'audits gratuits."
- Téléphone professionnel (input tel)

📋 Section 5 : Document Justificatif (optionnel)
- Upload fichier (accept=".pdf,.jpg,.png", max 5MB)
- Info : "📄 Kbis, délégation de pouvoir, carte de visite... (optionnel mais recommandé)"

📋 Section 6 : Certification
- Checkbox obligatoire : "Je certifie être habilité à représenter cette entreprise"

🔘 Bouton : "Valider et accéder à mon compte" (disabled tant que SIRET non validé et checkbox non cochée)

💾 Sauvegarde :
Quand l'utilisateur clique sur "Valider", sauvegarde dans la table profiles :
- company_siret
- company_siren
- company_legal_name
- company_address
- company_legal_form
- company_website
- user_first_name
- user_last_name
- user_role
- professional_email
- professional_phone
- verification_document_url (si uploadé)

Puis redirige vers /dashboard ou /client/new-project.

🔄 Redirection automatique :
Si l'utilisateur a déjà rempli ces infos (company_siret existe), redirige automatiquement vers /dashboard.
```

**Résultat attendu** :
- Page d'onboarding complète avec validation SIRET en temps réel
- Pré-remplissage automatique des données légales depuis l'API INSEE
- Sauvegarde dans la table profiles
- Redirection après validation

---

## 📨 Message 3 : Créer le Composant ProtectedRoute

```
Je veux créer un composant ProtectedRoute qui vérifie l'authentification et les informations entreprise avant d'accéder à certaines pages.

Crée un nouveau composant src/components/ProtectedRoute.tsx :

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireCompanyInfo?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireCompanyInfo = false 
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      // 1. Vérifier l'authentification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Connexion requise",
          description: "Veuillez vous connecter pour accéder à cette page.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // 2. Vérifier email confirmé
      if (!session.user.email_confirmed_at) {
        toast({
          title: "Email non confirmé",
          description: "Veuillez confirmer votre email avant de continuer. Vérifiez votre boîte mail.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // 3. Si requireCompanyInfo, vérifier que les infos entreprise sont remplies
      if (requireCompanyInfo) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('company_siret')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile?.company_siret) {
          toast({
            title: "Informations entreprise requises",
            description: "Veuillez compléter vos informations entreprise pour continuer.",
            variant: "default"
          });
          navigate('/onboarding/company');
          return;
        }
      }

      // ✅ Accès autorisé
      setAuthorized(true);
    } catch (error) {
      console.error('Access check error:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}

Utilise ce composant pour protéger les routes sensibles dans App.tsx :

// Exemple pour /client/new-project
<Route 
  path="/client/new-project" 
  element={
    <ProtectedRoute requireCompanyInfo={true}>
      <NewProjectPage />
    </ProtectedRoute>
  } 
/>

// Exemple pour /dashboard
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute requireCompanyInfo={false}>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

**Résultat attendu** :
- Composant ProtectedRoute fonctionnel
- Redirection automatique vers /auth si non connecté
- Redirection vers /onboarding/company si infos entreprise manquantes
- Messages toast informatifs

---

## 📨 Message 4 : Modifier PreAuditForm pour Vérifier l'Accès

```
Je veux modifier PreAuditForm.tsx pour vérifier l'accès avant de lancer l'audit.

Dans PreAuditForm.tsx, avant l'appel à orchestrate-multi-agent, ajoute un appel à check-audit-access :

// Au début de la fonction handleSubmit, après avoir récupéré le preAuditId

try {
  // 1. Vérifier l'accès
  console.log('Checking audit access...');
  const { data: accessCheck, error: accessError } = await supabase.functions.invoke('check-audit-access', {
    body: { websiteUrl: website }
  });

  if (accessError) {
    console.error('Access check error:', accessError);
    toast({
      title: "Erreur de vérification",
      description: "Impossible de vérifier vos droits d'accès. Veuillez réessayer.",
      variant: "destructive"
    });
    return;
  }

  if (!accessCheck.allowed) {
    console.log('Access denied:', accessCheck.reason);
    toast({
      title: "Accès refusé",
      description: accessCheck.message || "Vous n'avez pas accès à cette fonctionnalité.",
      variant: "destructive"
    });
    
    // Si email non confirmé, rediriger vers /auth
    if (accessCheck.reason === 'email_not_confirmed') {
      navigate('/auth');
    }
    
    // Si infos entreprise manquantes, rediriger vers /onboarding/company
    if (accessCheck.reason === 'company_info_missing') {
      navigate('/onboarding/company');
    }
    
    return;
  }

  // ✅ Accès autorisé
  console.log('Access granted:', accessCheck);
  
  // Afficher le nombre d'audits restants
  if (accessCheck.remaining_audits !== undefined) {
    toast({
      title: "Audit en cours de lancement",
      description: `Audits gratuits restants : ${accessCheck.remaining_audits - 1}/${accessCheck.remaining_audits}`,
      variant: "default"
    });
  }

  // 2. Lancer l'orchestration (code existant)
  console.log('Launching orchestration...');
  const { data: orchData, error: orchError } = await supabase.functions.invoke('orchestrate-multi-agent', {
    body: {
      preAuditId,
      url: website,
      companyInfo: preAuditData.company_info
    }
  });

  if (orchError) throw orchError;

  // Suite du code existant...
  
} catch (error) {
  console.error('Error:', error);
  toast({
    title: "Erreur",
    description: error.message || "Une erreur est survenue lors du lancement de l'audit.",
    variant: "destructive"
  });
}
```

**Résultat attendu** :
- Vérification de l'accès avant chaque audit
- Messages clairs en cas de refus
- Redirection automatique si nécessaire
- Affichage du nombre d'audits restants

---

## 📨 Message 5 : Modifier orchestrate-multi-agent pour Incrémenter le Compteur

```
Je veux modifier l'Edge Function orchestrate-multi-agent pour incrémenter le compteur d'audits gratuits utilisés.

Dans supabase/functions/orchestrate-multi-agent/index.ts, ajoute ce code au début (après la vérification JWT) :

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
  // Ne pas bloquer l'audit si l'incrémentation échoue
}

console.log(`✅ Audit counter incremented for user ${user.id}: ${profile.free_audits_used + 1}/${profile.max_free_audits}`);

// Continuer avec le code existant de l'orchestration...
```

**Résultat attendu** :
- Le compteur `free_audits_used` est incrémenté après chaque audit
- L'utilisateur ne peut plus lancer d'audit une fois la limite atteinte

---

## 📨 Message 6 : Créer la Page Admin de Modération

```
Je veux créer une page /admin/verifications pour que les admins puissent valider manuellement les utilisateurs avec un trust_score < 30.

Crée une nouvelle page src/pages/AdminVerifications.tsx :

📍 Route : /admin/verifications (protégée par ProtectedRoute + vérification role='admin')

🎨 Design :
- Titre : "Vérifications en attente"
- Sous-titre : "Utilisateurs nécessitant une validation manuelle"

📊 Tableau avec colonnes :
- Email
- Nom Prénom
- Entreprise (raison sociale)
- SIRET
- Email professionnel
- Trust Score (badge coloré : rouge < 30, orange 30-60, vert > 60)
- Audits utilisés
- Date d'inscription
- Actions (boutons)

🔘 Actions par utilisateur :
- ✅ Approuver : Appelle la fonction SQL admin_approve_user (trust_score = 80)
- ❌ Rejeter : Appelle la fonction SQL admin_reject_user (trust_score = 0, audits bloqués)
- 📧 Contacter : Ouvre le client email avec mailto:
- 🔍 Détails : Affiche un modal avec :
  * Logs de vérification (table company_verification_logs)
  * Document justificatif (si uploadé)
  * Historique des tentatives d'audit

📈 Statistiques en haut de page :
- Nombre total d'utilisateurs en attente
- Nombre d'utilisateurs approuvés aujourd'hui
- Nombre d'utilisateurs rejetés aujourd'hui

🔄 Rafraîchissement automatique toutes les 30 secondes

💾 Appels RPC :
- Pour approuver : supabase.rpc('admin_approve_user', { target_user_id, admin_user_id, approval_notes })
- Pour rejeter : supabase.rpc('admin_reject_user', { target_user_id, admin_user_id, rejection_reason })

📊 Requête pour récupérer les utilisateurs en attente :
SELECT * FROM admin_pending_verifications ORDER BY created_at DESC;
```

**Résultat attendu** :
- Page admin fonctionnelle
- Tableau avec tous les utilisateurs en attente
- Boutons d'action (approuver, rejeter, contacter)
- Modal de détails avec logs et documents

---

## 📨 Message 7 : Ajouter un Badge "Audits Restants" dans le Header

```
Je veux afficher le nombre d'audits gratuits restants dans le header pour que l'utilisateur sache combien il lui reste.

Dans le composant Header (ou Navigation), ajoute un badge qui affiche :

🎨 Design :
- Position : À côté du bouton "Démarrer un projet" ou dans le menu utilisateur
- Badge avec icône : 🎯 ou 📊
- Texte : "X audits restants"
- Couleur :
  * Vert si >= 2 audits restants
  * Orange si 1 audit restant
  * Rouge si 0 audit restant

💾 Récupération des données :
const [remainingAudits, setRemainingAudits] = useState<number | null>(null);

useEffect(() => {
  async function fetchRemainingAudits() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('max_free_audits, free_audits_used')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      setRemainingAudits(profile.max_free_audits - profile.free_audits_used);
    }
  }

  fetchRemainingAudits();

  // Rafraîchir toutes les 10 secondes
  const interval = setInterval(fetchRemainingAudits, 10000);
  return () => clearInterval(interval);
}, []);

🎯 Affichage :
{remainingAudits !== null && (
  <Badge 
    variant={remainingAudits >= 2 ? "success" : remainingAudits === 1 ? "warning" : "destructive"}
  >
    🎯 {remainingAudits} audit{remainingAudits > 1 ? 's' : ''} restant{remainingAudits > 1 ? 's' : ''}
  </Badge>
)}

Si remainingAudits === 0, affiche un bouton "Passer à Premium" qui redirige vers /pricing.
```

**Résultat attendu** :
- Badge visible dans le header
- Couleur adaptée au nombre d'audits restants
- Rafraîchissement automatique
- Bouton "Passer à Premium" si 0 audit restant

---

## ✅ Checklist de Validation

Après avoir envoyé tous les messages, teste le parcours complet :

1. **Inscription** :
   - [ ] S'inscrire avec un nouvel email
   - [ ] Recevoir l'email de confirmation
   - [ ] Cliquer sur le lien de confirmation
   - [ ] Être redirigé vers /onboarding/company

2. **Onboarding** :
   - [ ] Saisir un SIRET valide
   - [ ] Voir les informations pré-remplies
   - [ ] Remplir les informations personnelles
   - [ ] Valider et être redirigé vers /dashboard

3. **Audit** :
   - [ ] Cliquer sur "Démarrer un projet"
   - [ ] Remplir le formulaire de pré-audit
   - [ ] Voir le message "Audits gratuits restants : X"
   - [ ] Lancer l'audit avec succès

4. **Limites** :
   - [ ] Lancer 3 audits gratuits
   - [ ] Au 4ème audit, voir le message "Audits épuisés"
   - [ ] Être redirigé vers /pricing

5. **Admin** :
   - [ ] Se connecter en tant qu'admin
   - [ ] Accéder à /admin/verifications
   - [ ] Voir les utilisateurs en attente
   - [ ] Approuver un utilisateur
   - [ ] Vérifier que son trust_score passe à 80

---

## 🚨 Problèmes Potentiels et Solutions

### Problème 1 : L'API INSEE ne répond pas

**Symptôme** : Erreur 500 lors de la validation SIRET

**Solution** :
1. Vérifier que le secret `INSEE_API_TOKEN` est bien configuré dans Supabase
2. Tester l'API INSEE manuellement : https://api.insee.fr/catalogue/
3. Si l'API est down, afficher un message : "Service temporairement indisponible"

### Problème 2 : L'email de confirmation n'arrive pas

**Symptôme** : L'utilisateur ne reçoit pas l'email

**Solution** :
1. Vérifier la configuration SMTP dans Supabase (Resend)
2. Vérifier que `enable_confirmations = true` dans config.toml
3. Tester avec un email réel (pas temp-mail)

### Problème 3 : Le compteur d'audits ne s'incrémente pas

**Symptôme** : L'utilisateur peut lancer plus de 3 audits

**Solution** :
1. Vérifier que le code d'incrémentation est bien dans orchestrate-multi-agent
2. Vérifier que la colonne `free_audits_used` existe dans profiles
3. Vérifier les logs de l'Edge Function

### Problème 4 : Le trust_score ne se calcule pas

**Symptôme** : Le trust_score reste à 0

**Solution** :
1. Vérifier que le trigger `trigger_update_trust_score` est actif
2. Exécuter manuellement : `SELECT calculate_trust_score(p.*) FROM profiles p WHERE id = 'xxx';`
3. Vérifier que les données (professional_email, company_website) sont bien renseignées

---

## 📞 Support

Si un message ne fonctionne pas comme prévu :
1. Demande à Lovable de montrer le code qu'il a modifié
2. Vérifie les logs dans la console du navigateur
3. Vérifie les logs des Edge Functions dans Supabase
4. Reviens vers moi avec les erreurs exactes

Bon courage ! 🚀
