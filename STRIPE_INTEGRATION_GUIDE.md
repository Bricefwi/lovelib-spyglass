# Guide d'Intégration Stripe

## 🎯 Objectif

Permettre aux utilisateurs de souscrire aux plans Starter, Agency, Enterprise ou One-Shot via Stripe Checkout, avec mise à jour automatique du `plan_tier` dans la base de données.

## 📋 Prérequis

1. **Compte Stripe** : [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. **Clés API Stripe** :
   - Test mode : `sk_test_...` et `pk_test_...`
   - Live mode : `sk_live_...` and `pk_live_...`
3. **Webhooks configurés** pour recevoir les événements `checkout.session.completed`

## 🏗️ Architecture

```
User clicks "Démarrer" on Pricing page
  ↓
Frontend calls Supabase Edge Function: create-checkout-session
  ↓
Edge Function creates Stripe Checkout Session
  ↓
User redirected to Stripe Checkout
  ↓
User completes payment
  ↓
Stripe sends webhook to handle-stripe-webhook Edge Function
  ↓
Webhook updates profiles table (plan_tier, subscription_status, stripe_customer_id, stripe_subscription_id)
  ↓
User redirected to /dashboard with success message
```

## 📦 Étapes d'Implémentation

### 1. Ajouter les variables d'environnement

Ajoutez ces secrets dans Supabase (Settings → Edge Functions → Secrets):

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Créer les Price IDs dans Stripe Dashboard

1. Allez dans **Products** → **Add Product**
2. Créez 4 produits avec les prix correspondants:

```javascript
const STRIPE_PRICES = {
  starter: {
    monthly: 'price_starter_monthly_xxx',  // 149€/mois
    annual: 'price_starter_annual_xxx',    // 149€ * 12 * 0.8 = 1430€/an (-20%)
  },
  agency: {
    monthly: 'price_agency_monthly_xxx',   // 490€/mois
    annual: 'price_agency_annual_xxx',     // 490€ * 12 * 0.8 = 4704€/an (-20%)
  },
  enterprise: {
    monthly: 'price_enterprise_monthly_xxx', // 2500€/mois
    annual: 'price_enterprise_annual_xxx',   // 2500€ * 12 * 0.8 = 24000€/an (-20%)
  },
  one_shot: {
    single: 'price_one_shot_xxx',          // 290€ (paiement unique)
  }
};
```

### 3. Créer Edge Function: `create-checkout-session`

```typescript
// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.17.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier, billing_period = 'monthly' } = await req.json();

    // Validate tier
    const validTiers = ['starter', 'agency', 'enterprise', 'one_shot'];
    if (!validTiers.includes(tier)) {
      throw new Error("Invalid tier");
    }

    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Map tier to Stripe Price ID
    const PRICE_IDS = {
      starter: {
        monthly: Deno.env.get("STRIPE_PRICE_STARTER_MONTHLY"),
        annual: Deno.env.get("STRIPE_PRICE_STARTER_ANNUAL"),
      },
      agency: {
        monthly: Deno.env.get("STRIPE_PRICE_AGENCY_MONTHLY"),
        annual: Deno.env.get("STRIPE_PRICE_AGENCY_ANNUAL"),
      },
      enterprise: {
        monthly: Deno.env.get("STRIPE_PRICE_ENTERPRISE_MONTHLY"),
        annual: Deno.env.get("STRIPE_PRICE_ENTERPRISE_ANNUAL"),
      },
      one_shot: {
        single: Deno.env.get("STRIPE_PRICE_ONE_SHOT"),
      },
    };

    const priceId = tier === 'one_shot'
      ? PRICE_IDS[tier].single
      : PRICE_IDS[tier][billing_period];

    if (!priceId) {
      throw new Error("Price ID not configured");
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: tier === 'one_shot' ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        tier,
        user_id: "USER_ID_HERE", // Extract from JWT
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
```

### 4. Créer Edge Function: `handle-stripe-webhook`

```typescript
// supabase/functions/handle-stripe-webhook/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.17.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
  });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );

    console.log(`Webhook received: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId = session.metadata?.user_id;
      const tier = session.metadata?.tier;

      if (!userId || !tier) {
        throw new Error("Missing metadata");
      }

      // Update user profile
      const { error } = await supabase
        .from("profiles")
        .update({
          plan_tier: tier,
          subscription_status: session.mode === 'subscription' ? 'active' : 'one_time',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      console.log(`✅ User ${userId} upgraded to ${tier}`);
    }

    // Handle subscription updates
    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;

      // Update subscription status
      await supabase
        .from("profiles")
        .update({
          subscription_status: subscription.status,
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;

      // Downgrade to starter or free
      await supabase
        .from("profiles")
        .update({
          plan_tier: 'starter',
          subscription_status: 'canceled',
        })
        .eq("stripe_subscription_id", subscription.id);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }
});
```

### 5. Modifier la page Pricing pour appeler Stripe

```typescript
// src/pages/Pricing.tsx
const handleSelectPlan = async (tier: string) => {
  if (!session) {
    navigate("/auth", { state: { selectedPlan: tier } });
    return;
  }

  try {
    setIsLoading(true);

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        tier,
        billing_period: 'monthly', // or 'annual'
      },
    });

    if (error) throw error;

    // Redirect to Stripe Checkout
    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error: any) {
    console.error("Checkout error:", error);
    toast({
      title: "Erreur",
      description: "Impossible de créer la session de paiement. Réessayez.",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

### 6. Ajouter les colonnes manquantes dans `profiles`

```sql
-- Migration: Add Stripe columns to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription ON profiles(stripe_subscription_id);
```

### 7. Configurer les Webhooks dans Stripe Dashboard

1. Allez dans **Developers** → **Webhooks**
2. Cliquez sur **Add endpoint**
3. URL: `https://YOUR_PROJECT.supabase.co/functions/v1/handle-stripe-webhook`
4. Sélectionnez les événements:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copiez le **Signing secret** (`whsec_...`)
6. Ajoutez-le dans Supabase Secrets: `STRIPE_WEBHOOK_SECRET`

## 🧪 Tests

### Mode Test

1. Utilisez les cartes de test Stripe:
   - **Succès**: `4242 4242 4242 4242`
   - **Échec**: `4000 0000 0000 0002`
   - **3D Secure**: `4000 0025 0000 3155`

2. Utilisez Stripe CLI pour tester les webhooks localement:

```bash
stripe listen --forward-to localhost:54321/functions/v1/handle-stripe-webhook
stripe trigger checkout.session.completed
```

## 📊 Dashboard Client - Gestion Abonnement

Créez une page `/settings/subscription` où l'utilisateur peut:
- Voir son plan actuel
- Changer de plan (upgrade/downgrade)
- Annuler son abonnement
- Télécharger ses factures
- Mettre à jour ses informations de paiement

```typescript
// Exemple: Créer un Customer Portal
const createCustomerPortal = async () => {
  const { data } = await supabase.functions.invoke('create-customer-portal', {
    body: { return_url: window.location.href },
  });

  if (data?.url) {
    window.location.href = data.url;
  }
};
```

## 🔐 Sécurité

1. **Toujours vérifier les webhooks** avec `stripe.webhooks.constructEvent()`
2. **Utiliser SUPABASE_SERVICE_ROLE_KEY** pour les webhooks (pas les user JWT)
3. **Valider les metadata** (user_id, tier) avant d'update la DB
4. **Logger tous les événements** pour debugging
5. **Gérer les edge cases**:
   - Paiements partiels
   - Refunds
   - Subscription trials
   - Coupons/discounts

## 💰 Prix Recommandés (avec réduction annuelle)

| Plan | Mensuel | Annuel (-20%) | One-Shot |
|------|---------|---------------|----------|
| Starter | 149€/mois | 1430€/an (119€/mois) | - |
| Agency | 490€/mois | 4704€/an (392€/mois) | - |
| Enterprise | 2500€/mois | 24000€/an (2000€/mois) | - |
| One-Shot | - | - | 290€ |

## 📝 Checklist de Déploiement

- [ ] Comptes Stripe test et production créés
- [ ] Products et Prices configurés dans Stripe
- [ ] Secrets ajoutés dans Supabase (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, etc.)
- [ ] Edge Functions déployées (create-checkout-session, handle-stripe-webhook)
- [ ] Webhooks configurés dans Stripe Dashboard
- [ ] Migration SQL appliquée (colonnes Stripe dans profiles)
- [ ] Tests avec cartes de test Stripe
- [ ] Tests webhooks avec Stripe CLI
- [ ] Page Pricing mise à jour avec appel API
- [ ] Customer Portal configuré
- [ ] Logs et monitoring activés
- [ ] Plan de rollback préparé

## 🚀 Déploiement

```bash
# Déployer les Edge Functions
supabase functions deploy create-checkout-session
supabase functions deploy handle-stripe-webhook

# Appliquer les migrations
supabase db push

# Vérifier les secrets
supabase secrets list
```

## 📚 Ressources

- [Stripe Checkout Documentation](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Testing](https://stripe.com/docs/testing)

## ⚠️ Notes Importantes

1. **PCI Compliance**: Stripe gère la conformité PCI, ne stockez JAMAIS les numéros de cartes
2. **Webhooks retries**: Stripe réessaie les webhooks pendant 3 jours si ils échouent
3. **Idempotency**: Les webhooks peuvent être reçus plusieurs fois, utilisez `event.id` pour déduplication
4. **Taxes**: Configurez Stripe Tax pour gérer la TVA automatiquement (UE)
5. **Facturation**: Activez Stripe Billing pour générer des factures automatiquement

---

**Prochain commit**: Implémentation complète de Stripe après configuration des clés API
