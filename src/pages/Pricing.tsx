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
