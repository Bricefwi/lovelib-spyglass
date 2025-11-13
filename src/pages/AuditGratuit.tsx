import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildSEO } from "@/lib/seo";
import { IMOTION_BRAND } from "@/lib/brandConfig";
import { CheckCircle2, Zap, TrendingUp, Target, ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function AuditGratuit() {
  const navigate = useNavigate();
  
  const seo = buildSEO({
    title: "Audit Digital Gratuit – IMOTION",
    description: "Obtenez un audit digital gratuit de votre site web en 10 minutes. Analyse automatisée par IA avec 17 agents spécialisés. Rapport préliminaire avec opportunités identifiées et scénarios chiffrés.",
    url: "/audit-gratuit"
  });

  const benefits = [
    {
      icon: Zap,
      title: "Analyse Rapide",
      description: "Collecte automatique des données de votre site en 10 minutes"
    },
    {
      icon: Brain,
      title: "17 Agents IA Spécialisés",
      description: "Technologie MANUS IA 2.0 pour une analyse complète"
    },
    {
      icon: Target,
      title: "Opportunités Identifiées",
      description: "Rapport préliminaire avec quick wins et axes d'amélioration"
    },
    {
      icon: TrendingUp,
      title: "4 Scénarios Chiffrés",
      description: "Projections ROI : ambitieux, raisonné, opportuniste, mix"
    }
  ];

  const whatYouGet = [
    "Collecte automatique des données de votre site",
    "Analyse de votre stack technique et présence digitale",
    "Rapport préliminaire avec opportunités identifiées",
    "4 scénarios chiffrés (ambitieux, raisonné, opportuniste, mix)",
    "Estimation ROI et recommandations prioritaires"
  ];

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-32">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ 
            backgroundColor: `${IMOTION_BRAND.colors.primary}15`,
            color: IMOTION_BRAND.colors.primary
          }}>
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">100% Gratuit • Sans Engagement</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6" style={{ color: IMOTION_BRAND.colors.primary }}>
            Audit Digital Gratuit
          </h1>
          
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Découvrez le potentiel inexploité de votre site web en <strong>10 minutes</strong>. 
            Notre système d'IA analyse automatiquement votre présence digitale et identifie vos opportunités de croissance.
          </p>

          <Button 
            size="lg"
            className="text-lg px-8 py-6"
            style={{ backgroundColor: IMOTION_BRAND.colors.primary }}
            onClick={() => navigate("/onboarding")}
          >
            Démarrer Mon Audit Gratuit
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Résultats envoyés par email • Aucun engagement
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="bg-white border rounded-lg p-6 text-center hover:shadow-lg transition-shadow"
              style={{ borderColor: IMOTION_BRAND.colors.border.default }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${IMOTION_BRAND.colors.primary}20` }}
              >
                <benefit.icon className="w-8 h-8" style={{ color: IMOTION_BRAND.colors.primary }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: IMOTION_BRAND.colors.text.primary }}>
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* What You Get */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: IMOTION_BRAND.colors.primary }}>
            Ce que vous obtiendrez
          </h2>
          
          <div className="bg-white border rounded-lg p-8" style={{ borderColor: IMOTION_BRAND.colors.border.default }}>
            <div className="space-y-4">
              {whatYouGet.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
                  <p className="text-gray-700 text-lg">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8" style={{ color: IMOTION_BRAND.colors.primary }}>
            Audit Gratuit vs Audit Premium
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audit Gratuit */}
            <div className="bg-white border rounded-lg p-8" style={{ borderColor: IMOTION_BRAND.colors.border.default }}>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: IMOTION_BRAND.colors.text.primary }}>
                  Audit Gratuit
                </h3>
                <p className="text-4xl font-extrabold" style={{ color: IMOTION_BRAND.colors.primary }}>
                  0€
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Analyse rapide (10 min) • 5 agents IA • Rapport préliminaire
                </p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
                  <span className="text-sm text-gray-700">Analyse technique de base</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
                  <span className="text-sm text-gray-700">Opportunités quick wins</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
                  <span className="text-sm text-gray-700">4 scénarios d'évolution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
                  <span className="text-sm text-gray-700">Estimation ROI préliminaire</span>
                </li>
              </ul>
              
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => navigate("/onboarding")}
              >
                Démarrer l'Audit Gratuit
              </Button>
            </div>

            {/* Audit Premium */}
            <div 
              className="border-2 rounded-lg p-8 relative"
              style={{ 
                borderColor: IMOTION_BRAND.colors.primary,
                backgroundColor: `${IMOTION_BRAND.colors.primary}05`
              }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span 
                  className="px-4 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: IMOTION_BRAND.colors.primary }}
                >
                  Recommandé
                </span>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2" style={{ color: IMOTION_BRAND.colors.text.primary }}>
                  Audit Premium
                </h3>
                <p className="text-4xl font-extrabold" style={{ color: IMOTION_BRAND.colors.primary }}>
                  Sur Devis
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Analyse complète (2 semaines) • 17 agents IA • Rapport ultra-détaillé
                </p>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.primary }} />
                  <span className="text-sm text-gray-700"><strong>17 agents IA orchestrés</strong> (MANUS IA 2.0)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.primary }} />
                  <span className="text-sm text-gray-700">Analyse approfondie (CRM, Analytics, Ads)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.primary }} />
                  <span className="text-sm text-gray-700">Plan stratégique 12-24 mois</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.primary }} />
                  <span className="text-sm text-gray-700">Roadmap trimestrielle détaillée</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.primary }} />
                  <span className="text-sm text-gray-700">Séance Q&A + itération 30 jours</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.primary }} />
                  <span className="text-sm text-gray-700">Garantie ZÉRO hallucination (95%+ confiance)</span>
                </li>
              </ul>
              
              <Button 
                className="w-full text-white"
                style={{ backgroundColor: IMOTION_BRAND.colors.primary }}
                onClick={() => navigate("/contact")}
              >
                Demander un Devis
              </Button>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: IMOTION_BRAND.colors.text.primary }}>
            Prêt à découvrir votre potentiel ?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Lancez votre audit gratuit maintenant et recevez vos résultats par email en 10 minutes.
          </p>
          <Button 
            size="lg"
            className="text-lg px-8 py-6"
            style={{ backgroundColor: IMOTION_BRAND.colors.primary }}
            onClick={() => navigate("/onboarding")}
          >
            Démarrer Mon Audit Gratuit
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
