# 📧 Système de Notifications Email - Limites d'Audits

## ✅ Implémentation Complète

### 1. Edge Function `send-audit-limit-warning`

**Fichier**: `supabase/functions/send-audit-limit-warning/index.ts`

Cette fonction envoie automatiquement des emails via **Resend** quand:
- **2 audits utilisés** → Email d'avertissement ⚠️
- **3 audits utilisés** → Email de limite atteinte 🚀

**Fonctionnalités:**
- ✅ Validation des données d'entrée
- ✅ Récupération du profil utilisateur via service_role
- ✅ Templates HTML professionnels
- ✅ Envoi via API Resend
- ✅ Logging dans table `email_notifications`
- ✅ Gestion d'erreurs complète

**API:**
```typescript
POST /functions/v1/send-audit-limit-warning
Body: {
  user_id: "uuid",
  notification_type: "audit_limit_reached" | "audit_limit_warning"
}
```

### 2. Table de Logging `email_notifications`

**Colonnes:**
- `id` (uuid) - Identifiant unique
- `user_id` (uuid) - Utilisateur destinataire
- `email` (text) - Adresse email
- `notification_type` (text) - Type de notification
- `sent_at` (timestamptz) - Date d'envoi
- `resend_id` (text) - ID Resend pour traçabilité

**RLS Policies:**
- Users: lecture de leurs propres notifications uniquement
- Admins: lecture de toutes les notifications

### 3. Fonction Helper Frontend

**Fichier**: `src/lib/emailNotifications.ts`

```typescript
import { sendAuditLimitEmail, checkAndNotifyAuditLimit } from '@/lib/emailNotifications';

// Envoyer email manuellement
await sendAuditLimitEmail({ 
  userId: 'xxx', 
  notificationType: 'audit_limit_reached' 
});

// Vérifier et envoyer automatiquement si nécessaire
await checkAndNotifyAuditLimit(userId, auditsUsed);
```

**Sécurités intégrées:**
- Vérification si notification déjà envoyée (< 7 jours)
- Empêche spam d'emails
- Logging automatique des envois

## 🔧 Configuration Requise

### 1. Resend API Key
✅ Déjà configurée dans `RESEND_API_KEY`

### 2. Domaine Email Vérifié
⚠️ **ACTION REQUISE**: Vérifier le domaine sur Resend
- URL: https://resend.com/domains
- Domaine à configurer: `imotion.fr`
- Email expéditeur: `no-reply@imotion.fr`

### 3. Configuration Edge Function
✅ Ajoutée à `supabase/config.toml`:
```toml
[functions.send-audit-limit-warning]
verify_jwt = false  # Appelée par triggers ou app, pas directement par users
```

## 📝 Utilisation

### Option A: Appel Manuel depuis le Frontend

Après incrémentation des audits:

```typescript
import { checkAndNotifyAuditLimit } from '@/lib/emailNotifications';

// Dans PreAuditForm.tsx après audit lancé
const { data: profile } = await supabase
  .from('profiles')
  .select('free_audits_used')
  .eq('user_id', user.id)
  .single();

if (profile) {
  await checkAndNotifyAuditLimit(user.id, profile.free_audits_used);
}
```

### Option B: Trigger Automatique PostgreSQL (Avancé)

**Prérequis**: Extension `pg_net` activée sur Supabase

```sql
-- Fonction trigger
CREATE OR REPLACE FUNCTION notify_audit_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_edge_url text;
BEGIN
  IF NEW.free_audits_used >= 2 AND NEW.free_audits_used <> OLD.free_audits_used THEN
    v_edge_url := current_setting('app.settings.edge_function_url', true) 
      || '/send-audit-limit-warning';
    
    PERFORM net.http_post(
      url := v_edge_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := jsonb_build_object(
        'user_id', NEW.user_id,
        'notification_type', CASE 
          WHEN NEW.free_audits_used >= 3 THEN 'audit_limit_reached'
          ELSE 'audit_limit_warning'
        END
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trg_notify_audit_limit
AFTER UPDATE OF free_audits_used ON profiles
FOR EACH ROW
EXECUTE FUNCTION notify_audit_limit();
```

## 📧 Templates Email

### Template 1: Limite Atteinte (3 audits)
**Sujet**: 🚀 Limite d'audits gratuits atteinte - IMOTION

**Contenu:**
- Message personnalisé avec prénom
- Liste des avantages Premium
- CTA vers page pricing
- Contact support

### Template 2: Avertissement (2 audits)
**Sujet**: ⚠️ Bientôt la fin de vos audits gratuits - IMOTION

**Contenu:**
- Alerte courtoise
- Compteur d'audits utilisés
- Incitation à découvrir Premium

## 🔍 Monitoring

### Vérifier les emails envoyés

```sql
SELECT 
  en.email,
  en.notification_type,
  en.sent_at,
  en.resend_id,
  p.firstname,
  p.lastname,
  p.free_audits_used
FROM email_notifications en
JOIN profiles p ON p.user_id = en.user_id
ORDER BY en.sent_at DESC
LIMIT 20;
```

### Taux d'envoi par type

```sql
SELECT 
  notification_type,
  COUNT(*) as total_sent,
  COUNT(DISTINCT user_id) as unique_users
FROM email_notifications
WHERE sent_at > NOW() - INTERVAL '30 days'
GROUP BY notification_type;
```

## ⚠️ Points d'Attention

1. **Domaine Resend**: Doit être vérifié avant utilisation en production
2. **Rate Limiting**: Resend limite à 100 emails/jour en plan gratuit
3. **Testing**: Tester avec votre email avant d'activer en prod
4. **RGPD**: Les emails marketing nécessitent consentement explicite

## 🚀 Prochaines Étapes

1. [ ] Vérifier domaine `imotion.fr` sur Resend
2. [ ] Tester l'envoi d'email en local
3. [ ] Intégrer l'appel dans `PreAuditForm.tsx`
4. [ ] Créer page `/pricing` pour le CTA
5. [ ] Optionnel: Activer trigger PostgreSQL automatique

---

**Date création**: 14 novembre 2025  
**Version**: 1.0  
**Responsable**: Système d'alerte audits
