import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Check, X, Gift, Zap, Building2, Rocket } from "lucide-react";
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
    if (tier === "freemium") {
      // Redirect to signup for freemium
      navigate("/auth", { state: { selectedPlan: tier } });
    } else if (!session) {
      // Redirect to auth if not logged in
      navigate("/auth", { state: { selectedPlan: tier } });
    } else {
      // Redirect to Stripe checkout
      navigate("/checkout", { state: { tier } });
    }
  };

  const plans = [
    {
      tier: "freemium",
      name: "Freemium",
      icon: Gift,
      price: 0,
      period: "/mois",
      description: "Découvrez la puissance de notre IA",
      auditsPerYear: 3,
      aiAgents: 7,
      aiModel: "Claude Sonnet 4.5 + Gemini 2.5 Flash",
      aiModelsDetail: [
        "🧠 Claude Sonnet 4.5 (Analyse & Stratégie)",
        "⚡ Gemini 2.5 Flash (Recherche rapide)"
      ],
      features: {
        included: [
          "3 audits gratuits",
          "7 agents IA spécialisés",
          "Rapports 15-20 pages",
          "1 scénario stratégique",
          "3 infographies",
          "Analyse technique de base",
          "Diagnostic SEO express",
          "Audit UX/UI rapide",
          "Génération 3-5 min",
          "Support communautaire",
          "Aperçu des analyses premium"
        ],
        excluded: [
          "Benchmark concurrentiel",
          "Étude de marché",
          "Analyses PESTEL & Porter",
          "Intelligence compétitive",
          "Analyses marketing avancées",
          "White-label branding",
          "Support prioritaire"
        ]
      },
      cta: "Commencer gratuitement",
      highlight: false,
      badge: "🎁 Gratuit"
    },
    {
      tier: "pro",
      name: "Pro",
      icon: Zap,
      price: 149,
      period: "/mois",
      description: "Pour professionnels et PME",
      auditsPerYear: 60,
      aiAgents: 12,
      aiModel: "Claude Sonnet 4.5 + GPT-5 + Perplexity Pro",
      aiModelsDetail: [
        "🔬 Perplexity Sonar Pro (Recherche avec citations)",
        "🧠 Claude Sonnet 4.5 (Analyse & Stratégie)",
        "✍️ GPT-5 (Rédaction professionnelle)"
      ],
      features: {
        included: [
          "60 audits par an (5/mois)",
          "12 agents IA spécialisés",
          "Rapports 35-50 pages",
          "3 scénarios stratégiques",
          "8 infographies professionnelles",
          "Scraping web avancé",
          "Benchmark 3-5 concurrents locaux",
          "Analyses PESTEL & Porter",
          "Audit marketing approfondi",
          "SEO/SEM complet",
          "Audit commercial détaillé",
          "Génération 5-7 min",
          "Support par email (48h)",
          "Export PDF/HTML"
        ],
        excluded: [
          "Étude de marché régionale",
          "Intelligence compétitive avancée",
          "Analyse internationale",
          "White-label branding",
          "API access"
        ]
      },
      cta: "Démarrer Pro",
      highlight: true,
      badge: "⭐ Recommandé"
    },
    {
      tier: "agency",
      name: "Agency",
      icon: Building2,
      price: 490,
      period: "/mois",
      description: "Pour agences et consultants",
      auditsPerYear: 240,
      aiAgents: 15,
      aiModel: "Claude Opus 4.5 + GPT-5.2 + Perplexity Deep",
      aiModelsDetail: [
        "🔬 Perplexity Deep Research (Recherche approfondie)",
        "🧠 Claude Opus 4.5 (Analyse stratégique)",
        "📊 GPT-5.2 Pro (Stratégie & Insights)",
        "✍️ Claude Opus 4.5 (Rédaction premium)"
      ],
      features: {
        included: [
          "240 audits par an (20/mois)",
          "15 agents IA experts",
          "Rapports 60-80 pages",
          "5 scénarios stratégiques",
          "15 infographies premium",
          "Benchmark 10-15 concurrents nationaux",
          "Étude de marché régionale complète",
          "Intelligence compétitive avancée",
          "Analyses PESTEL, Porter, SWOT",
          "Audit marketing & commercial expert",
          "Content Marketing & Social Media",
          "Email Marketing & Data Analytics",
          "White-label branding ✨",
          "Génération 10-15 min",
          "Support prioritaire (24h)",
          "Formation équipe (2h)",
          "Export multi-formats"
        ],
        excluded: [
          "Analyse internationale",
          "Pricing Intelligence",
          "API access"
        ]
      },
      cta: "Démarrer Agency",
      highlight: false
    },
    {
      tier: "enterprise",
      name: "Enterprise",
      icon: Rocket,
      price: 990,
      period: "/mois",
      description: "Solution complète pour grandes organisations",
      auditsPerYear: 600,
      aiAgents: 17,
      aiModel: "Claude Opus 4.5 + GPT-5.2 Pro + Perplexity Deep Research",
      aiModelsDetail: [
        "🔬 Perplexity Deep Research (Recherche ultra-profonde)",
        "🧠 Claude Opus 4.5 (Analyse McKinsey-level)",
        "📊 GPT-5.2 Pro (Stratégie entreprise)",
        "✍️ Claude Opus 4.5 (Rédaction exécutive)"
      ],
      features: {
        included: [
          "600 audits par an (50/mois)",
          "17 agents IA ultra-experts V8",
          "Rapports 100-150 pages",
          "7 scénarios stratégiques",
          "25 infographies sur-mesure",
          "Benchmark 20+ concurrents internationaux",
          "Étude de marché internationale complète",
          "Intelligence compétitive ultra-profonde",
          "Pricing Intelligence",
          "Analyses juridiques & conformité",
          "Roadmap transformation digitale",
          "Plan de migration détaillé",
          "White-label personnalisé",
          "Génération 20-30 min",
          "Support dédié 24/7",
          "Formation équipe (8h)",
          "Consultation stratégique (4h/mois)",
          "API access complet",
          "Intégration BI (Power BI, Metabase)"
        ],
        excluded: []
      },
      cta: "Contacter l'équipe",
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
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Choisissez votre plan
            </h1>
            <p className="text-xl text-muted-foreground">
              Des rapports stratégiques générés par IA multi-agents.
              De la découverte gratuite à l'expertise premium.
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
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className={`${
                        plan.tier === "freemium" 
                          ? "bg-green-500" 
                          : "bg-primary"
                      } text-white px-4 py-1 rounded-full text-sm font-semibold`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Icon & Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${
                        plan.highlight ? "bg-primary/10" : "bg-muted"
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          plan.highlight ? "text-primary" : "text-foreground"
                        }`} />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground">
                        {plan.name}
                      </h3>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">
                          {plan.price}€
                        </span>
                        <span className="text-muted-foreground">{plan.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {plan.auditsPerYear} {plan.auditsPerYear === 1 ? "audit" : "audits"} {plan.auditsPerYear === 1 ? "" : "par an"}
                      </p>
                    </div>

                    {/* AI Info */}
                    <div className="mb-4 p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-border">
                      <p className="text-xs font-semibold text-foreground mb-2">
                        🤖 {plan.aiAgents} agents IA
                      </p>
                      <div className="space-y-1">
                        {(plan as any).aiModelsDetail?.map((model: string, idx: number) => (
                          <p key={idx} className="text-xs text-muted-foreground">
                            {model}
                          </p>
                        )) || (
                          <p className="text-xs text-muted-foreground">{plan.aiModel}</p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm mb-6">
                      {plan.description}
                    </p>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectPlan(plan.tier)}
                      className={`w-full mb-6 ${
                        plan.tier === "freemium"
                          ? "bg-green-600 hover:bg-green-700"
                          : plan.highlight
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-gray-900 hover:bg-gray-800"
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>

                    {/* Features */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground mb-3">
                        Inclus :
                      </p>
                      {plan.features.included.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}

                      {plan.features.excluded.length > 0 && (
                        <>
                          <p className="text-sm font-semibold text-foreground mt-6 mb-3">
                            Non inclus :
                          </p>
                          {plan.features.excluded.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <X className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-muted-foreground">{feature}</span>
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
          <div className="mt-24 max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Questions fréquentes
            </h2>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  Comment fonctionnent les crédits d'audits ?
                </h3>
                <p className="text-muted-foreground">
                  Chaque plan inclut un nombre d'audits annuels. Les crédits se rechargent mensuellement 
                  (ex: Pro = 5 audits/mois). Non utilisés, ils ne se cumulent pas au-delà de 12 mois.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  Puis-je changer de plan en cours d'année ?
                </h3>
                <p className="text-muted-foreground">
                  Oui, vous pouvez upgrader ou downgrader à tout moment. La différence de prix sera 
                  calculée au prorata pour la période restante.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  Qu'est-ce que le white-label branding ?
                </h3>
                <p className="text-muted-foreground">
                  Les plans Agency et Enterprise vous permettent de personnaliser les rapports avec 
                  votre logo, vos couleurs et votre nom d'entreprise. Parfait pour les agences qui 
                  revendent nos audits.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  Quels modèles d'IA utilisez-vous ?
                </h3>
                <p className="text-muted-foreground">
                  Nous utilisons les meilleurs modèles IA du marché, routés intelligemment par tâche : 
                  <strong> Perplexity Sonar</strong> pour la recherche web, <strong>Gemini 3 Pro</strong> pour l'analyse, 
                  <strong> Claude Opus 4.5</strong> et <strong>GPT-5</strong> pour la stratégie et la rédaction. 
                  Chaque plan débloque des modèles plus puissants — l'Enterprise utilise les modèles les plus 
                  avancés pour une qualité de niveau McKinsey.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">
                  Combien d'agents IA travaillent sur mon audit ?
                </h3>
                <p className="text-muted-foreground">
                  Freemium : 7 agents (diagnostic express) • Pro : 12 agents (analyse approfondie) • 
                  Agency : 15 agents (étude stratégique) • Enterprise : 17 agents (expertise premium). 
                  Chaque agent est spécialisé dans un domaine (SEO, UX, marketing, etc.).
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-primary/5 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Besoin d'un plan personnalisé ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Pour les grandes entreprises avec des besoins spécifiques, contactez notre équipe 
              pour un devis sur mesure.
            </p>
            <Button
              onClick={() => navigate("/contact")}
              size="lg"
              className="bg-primary hover:bg-primary/90"
            >
              Contacter l'équipe commerciale
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
