# 🚀 MODIFICATIONS UI/UX - À COPIER DANS LOVABLE

Ce document contient TOUTES les modifications à apporter au projet. Copiez-collez les instructions ci-dessous dans le chat Lovable.

---

## 📋 RÉSUMÉ DES MODIFICATIONS

- ✅ **3 nouveaux fichiers** à créer
- ✅ **4 fichiers existants** à modifier
- ✅ **1 nouvelle route** à ajouter

---

## 1️⃣ CRÉER : src/pages/Pricing.tsx

**Instructions pour Lovable :**

```
Crée un nouveau fichier src/pages/Pricing.tsx avec le code suivant :
```

```typescript
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Check, X, Sparkles, Building2, Rocket, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const Pricing = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const handleSelectPlan = (tier: string) => {
    if (!session) {
      // Redirect to auth if not logged in
      navigate("/auth", { state: { selectedPlan: tier } });
    } else {
      // Redirect to Stripe checkout
      navigate("/checkout", { state: { tier } });
    }
  };

  const plans = [
    {
      tier: "starter",
      name: "Starter",
      icon: Zap,
      price: 149,
      period: "/mois",
      description: "Idéal pour freelances et petites structures",
      auditsPerYear: 60,
      features: {
        included: [
          "60 audits par an",
          "Rapports 30-40 pages",
          "1 scénario stratégique",
          "5 infographies",
          "Scraping web avancé",
          "Audit marketing essentiel",
          "Audit commercial essentiel",
          "SEO quick check",
          "Génération 4h",
          "Support par email"
        ],
        excluded: [
          "PESTEL Analysis",
          "Porter 5 Forces",
          "Content Marketing",
          "Social Media Audit",
          "Email Marketing",
          "Data Analytics",
          "White-label branding"
        ]
      },
      cta: "Démarrer Starter",
      highlight: false
    },
    {
      tier: "agency",
      name: "Agency",
      icon: Building2,
      price: 490,
      period: "/mois",
      description: "Pour agences et consultants professionnels",
      auditsPerYear: 240,
      features: {
        included: [
          "240 audits par an",
          "Rapports 50-70 pages",
          "3 scénarios stratégiques",
          "12 infographies",
          "Scraping + PESTEL + Porter",
          "Intelligence compétitive",
          "Audit marketing approfondi",
          "SEO/SEM full audit",
          "Content + Social + Email",
          "Data Analytics complet",
          "White-label branding ✨",
          "Génération 8h",
          "Support prioritaire",
          "GPT-4o Advanced"
        ],
        excluded: [
          "Pricing Intelligence"
        ]
      },
      cta: "Démarrer Agency",
      highlight: true,
      badge: "Le plus populaire"
    },
    {
      tier: "enterprise",
      name: "Enterprise",
      icon: Rocket,
      price: 2500,
      period: "/mois",
      description: "Solution complète pour grandes organisations",
      auditsPerYear: 600,
      features: {
        included: [
          "600 audits par an",
          "Rapports 80-120 pages",
          "7 scénarios stratégiques",
          "20 infographies",
          "Toutes analyses activées",
          "Pricing Intelligence",
          "Intelligence ultra-profonde",
          "White-label personnalisé",
          "Génération 8-14h",
          "GPT-4 Turbo (128k context)",
          "Narrative comprehensive",
          "Support dédié 24/7",
          "Formation équipe incluse",
          "API access"
        ],
        excluded: []
      },
      cta: "Contacter l'équipe",
      highlight: false
    },
    {
      tier: "one_shot",
      name: "One-Shot",
      icon: Sparkles,
      price: 290,
      period: "/audit",
      description: "Un audit complet sans engagement",
      auditsPerYear: 1,
      features: {
        included: [
          "1 audit complet",
          "Rapport 45-60 pages",
          "3 scénarios stratégiques",
          "10 infographies",
          "PESTEL + Porter + SWOT",
          "Intelligence compétitive",
          "SEO/SEM full audit",
          "Content + Social Media",
          "Génération 6h",
          "GPT-4o Advanced",
          "Narrative balanced"
        ],
        excluded: [
          "Email Marketing",
          "Data Analytics",
          "White-label"
        ]
      },
      cta: "Commander un audit",
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-gray-600">
              Des rapports stratégiques générés par IA multi-agents.
              Qualité consulting McKinsey, prix transparents.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.tier}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.highlight
                      ? "border-primary scale-105"
                      : "border-gray-200 hover:border-primary/50"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Icon & Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${
                        plan.highlight ? "bg-primary/10" : "bg-gray-100"
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          plan.highlight ? "text-primary" : "text-gray-700"
                        }`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {plan.name}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {plan.price}€
                        </span>
                        <span className="text-gray-600">{plan.period}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {plan.auditsPerYear} {plan.auditsPerYear === 1 ? "audit" : "audits"} {plan.auditsPerYear === 1 ? "" : "par an"}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6">
                      {plan.description}
                    </p>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectPlan(plan.tier)}
                      className={`w-full mb-6 ${
                        plan.highlight
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>

                    {/* Features */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-gray-900 mb-3">
                        Inclus :
                      </p>
                      {plan.features.included.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            {feature}
                          </span>
                        </div>
                      ))}

                      {plan.features.excluded.length > 0 && (
                        <>
                          <p className="text-sm font-semibold text-gray-900 mt-4 mb-3">
                            Non inclus :
                          </p>
                          {plan.features.excluded.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-500">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">
              Questions fréquentes
            </h2>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-2">
                  Comment fonctionnent les crédits d'audits ?
                </h3>
                <p className="text-gray-600">
                  Chaque plan inclut un nombre d'audits annuels. Les crédits se rechargent
                  mensuellement (ex: Agency = 20 audits/mois). Non utilisés, ils ne se cumulent pas.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-2">
                  Puis-je changer de plan en cours d'année ?
                </h3>
                <p className="text-gray-600">
                  Oui, vous pouvez upgrader ou downgrader à tout moment. La différence de prix
                  sera calculée au prorata pour la période restante.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-2">
                  Qu'est-ce que le white-label branding ?
                </h3>
                <p className="text-gray-600">
                  Les plans Agency et Enterprise vous permettent de personnaliser les rapports
                  avec votre logo, vos couleurs et votre nom d'entreprise. Parfait pour les
                  agences qui revendent nos audits.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-2">
                  Quels modèles d'IA utilisez-vous ?
                </h3>
                <p className="text-gray-600">
                  Nous utilisons une combinaison de GPT-4o, GPT-4 Turbo, Claude 3.5 Sonnet, et
                  Perplexity Sonar Pro selon les tâches. Les plans supérieurs bénéficient des
                  modèles les plus avancés pour une qualité maximale.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-primary/10 to-blue-50 rounded-2xl p-12">
              <h2 className="text-3xl font-bold mb-4">
                Besoin d'un plan personnalisé ?
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Pour les grandes entreprises avec des besoins spécifiques, contactez notre équipe
                pour un devis sur mesure.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/contact")}
                className="bg-gray-900 hover:bg-gray-800"
              >
                Contacter l'équipe commerciale
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
```

---

## 2️⃣ CRÉER : src/components/UserMenu.tsx

**Instructions pour Lovable :**

```
Crée un nouveau fichier src/components/UserMenu.tsx avec le code suivant :
```

```typescript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  User,
  LayoutDashboard,
  CreditCard,
  LogOut,
  Settings,
  Zap,
  Building2,
  Rocket,
  Sparkles
} from "lucide-react";

interface UserMenuProps {
  session: Session;
}

interface UserProfile {
  plan_tier?: string;
  subscription_status?: string;
  organization_id?: string;
}

export const UserMenu = ({ session }: UserMenuProps) => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!session?.user?.id) return;

      // Fetch user profile with plan tier
      const { data } = await supabase
        .from('profiles')
        .select('plan_tier, subscription_status, organization_id')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUserProfile(data);
      }
    };

    fetchUserProfile();
  }, [session]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .slice(0, 2)
      .toUpperCase();
  };

  const getPlanDisplay = (tier?: string) => {
    if (!tier) return { name: "Aucun plan", icon: User, color: "bg-gray-500" };

    const plans = {
      starter: { name: "Starter", icon: Zap, color: "bg-blue-500" },
      agency: { name: "Agency", icon: Building2, color: "bg-purple-500" },
      enterprise: { name: "Enterprise", icon: Rocket, color: "bg-orange-500" },
      one_shot: { name: "One-Shot", icon: Sparkles, color: "bg-green-500" },
    };

    return plans[tier as keyof typeof plans] || plans.starter;
  };

  const planDisplay = getPlanDisplay(userProfile?.plan_tier);
  const PlanIcon = planDisplay.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-2 cursor-pointer group">
          {/* Avatar */}
          <Avatar className="w-9 h-9 border-2 border-gray-200 group-hover:border-primary transition-colors">
            <AvatarFallback className="bg-gradient-to-br from-primary to-blue-600 text-white text-sm font-semibold">
              {getInitials(session.user.email || "")}
            </AvatarFallback>
          </Avatar>

          {/* Plan Badge (Desktop only) */}
          <div className="hidden md:block">
            <Badge
              variant="secondary"
              className={`${planDisplay.color} text-white border-none text-xs font-semibold px-2 py-1`}
            >
              <PlanIcon className="w-3 h-3 mr-1" />
              {planDisplay.name}
            </Badge>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {/* User Info Section */}
        <DropdownMenuLabel className="pb-2">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-900">
              Mon compte
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>

            {/* Plan Badge in dropdown */}
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="secondary"
                className={`${planDisplay.color} text-white border-none text-xs font-semibold`}
              >
                <PlanIcon className="w-3 h-3 mr-1" />
                {planDisplay.name}
              </Badge>
              {userProfile?.subscription_status === 'active' && (
                <span className="text-xs text-green-600 font-medium">Actif</span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Navigation Links */}
        <DropdownMenuItem
          onClick={() => navigate("/dashboard")}
          className="cursor-pointer"
        >
          <LayoutDashboard className="w-4 h-4 mr-2" />
          <span>Tableau de bord</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate("/pricing")}
          className="cursor-pointer"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          <span>Plans & Facturation</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => navigate("/client/audits")}
          className="cursor-pointer"
        >
          <Settings className="w-4 h-4 mr-2" />
          <span>Mes audits</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
```

---

## 3️⃣ CRÉER : src/components/ClientHeader.tsx

**Instructions pour Lovable :**

```
Crée un nouveau fichier src/components/ClientHeader.tsx avec le code suivant :
```

```typescript
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import logoImotion from "@/assets/logo-imotion.png";
import { UserMenu } from "@/components/UserMenu";
import { ArrowLeft, LayoutDashboard, FileText, Plus } from "lucide-react";

export const ClientHeader = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const isAdminPath = location.pathname.startsWith('/admin') || location.pathname === '/veille-ia';
  const dashboardPath = isAdminPath ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Back button */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(dashboardPath)}
            >
              <img
                src={logoImotion}
                alt="IMOTION Logo"
                className="h-12 w-auto"
              />
            </div>

            <div className="h-8 w-px bg-border" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(dashboardPath)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au tableau de bord
            </Button>
          </div>

          {/* Right: Navigation + User menu */}
          <div className="flex items-center gap-3">
            {/* Client navigation */}
            {!isAdminPath && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/client/audits")}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Mes Audits
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/client/new-project")}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau Projet
                </Button>
              </>
            )}

            {/* Admin navigation */}
            {isAdminPath && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin/audits")}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Audits
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/admin/dashboard")}
                  className="gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </>
            )}

            {/* User menu */}
            {session && <UserMenu session={session} />}
          </div>
        </div>
      </div>
    </header>
  );
};
```

---

## 4️⃣ MODIFIER : src/components/Header.tsx

**Instructions pour Lovable :**

```
Dans le fichier src/components/Header.tsx, remplace la définition de baseNavigation par :
```

```typescript
const baseNavigation = [
  { name: "Solutions", href: "/solutions" },
  { name: "Comment ça marche", href: "/how-it-works" },
  { name: "Tarifs", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];
```

**ET remplace la section d'affichage de l'utilisateur par :**

```typescript
{session ? (
  <UserMenu session={session} />
) : (
  <>
    <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
      Se connecter
    </Button>
    <Button size="sm" onClick={handleStartProject}>
      Démarrer
    </Button>
  </>
)}
```

**ET ajoute l'import suivant en haut du fichier :**

```typescript
import { UserMenu } from "@/components/UserMenu";
```

---

## 5️⃣ MODIFIER : src/App.tsx

**Instructions pour Lovable :**

```
Dans le fichier src/App.tsx, ajoute l'import suivant :
```

```typescript
import Pricing from "./pages/Pricing";
```

**ET ajoute la route suivante dans les Routes :**

```typescript
<Route path="/pricing" element={<Pricing />} />
```

---

## 6️⃣ MODIFIER : src/pages/VeilleIA.tsx

**Instructions pour Lovable :**

```
Dans le fichier src/pages/VeilleIA.tsx :

1. Ajoute l'import en haut du fichier :
```

```typescript
import { ClientHeader } from "@/components/ClientHeader";
```

```
2. Remplace la première ligne du return par :
```

```typescript
return (
  <div className="min-h-screen bg-background">
    <ClientHeader />
    <div className="container mx-auto px-4 pt-8 pb-8">
```

---

## 7️⃣ MODIFIER : src/pages/ClientNewProject.tsx

**Instructions pour Lovable :**

```
Dans le fichier src/pages/ClientNewProject.tsx :

1. Remplace l'import du Header par :
```

```typescript
import { ClientHeader } from "@/components/ClientHeader";
```

```
2. Remplace la première ligne du return par :
```

```typescript
return (
  <div className="min-h-screen bg-background">
    <ClientHeader />
    <div className="container mx-auto px-6 pt-8 pb-20">
```

---

## ✅ RÉSUMÉ DES CHANGEMENTS

### Nouveaux fichiers créés :
1. ✅ `src/pages/Pricing.tsx` - Page de tarification avec 4 plans
2. ✅ `src/components/UserMenu.tsx` - Menu utilisateur avec badge d'abonnement
3. ✅ `src/components/ClientHeader.tsx` - Header pour pages client/admin

### Fichiers modifiés :
4. ✅ `src/components/Header.tsx` - Navigation simplifiée + UserMenu
5. ✅ `src/App.tsx` - Route `/pricing` ajoutée
6. ✅ `src/pages/VeilleIA.tsx` - ClientHeader ajouté
7. ✅ `src/pages/ClientNewProject.tsx` - ClientHeader ajouté

---

## 🎯 RÉSULTAT ATTENDU

Après ces modifications, vous aurez :

1. **Page d'accueil** - Header avec 4 liens + UserMenu avec badge d'abonnement coloré
2. **Route `/pricing`** - Nouvelle page de tarification professionnelle
3. **Route `/client/new-project`** - Navigation complète avec bouton retour
4. **Route `/veille-ia`** - Navigation complète avec bouton retour

---

## 📝 INSTRUCTIONS POUR LOVABLE

Copiez-collez chaque section ci-dessus (1️⃣ à 7️⃣) dans le chat Lovable, une par une, en suivant l'ordre.

Attendez que Lovable confirme chaque modification avant de passer à la suivante.

Bonne chance ! 🚀
