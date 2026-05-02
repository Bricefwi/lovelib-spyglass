import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildSEO } from "@/lib/seo";
import { IMOTION_BRAND } from "@/lib/brandConfig";
import { CheckCircle2, Brain, Zap, Target, FileText, TrendingUp } from "lucide-react";

export default function AuditMethodologie() {
  const seo = buildSEO({
    title: "Méthodologie d'audit – IMOTION",
    description: "Collecte, scoring, analyse et restitution : notre méthodologie d'audit marketing & commercial propulsée par MANUS IA 2.0 avec 17 agents spécialisés.",
    url: "/audit-methodologie"
  });

  const methodologySteps = [
    {
      icon: Target,
      title: "Intake & Périmètre",
      description: "Secteur, ICP, canaux, ARR, cycle de vente",
      deliverable: "Check-list de complétude",
      agents: ["A01 - Market Researcher", "A02 - Competitor Analyst"],
      duration: "1-2 jours"
    },
    {
      icon: Brain,
      title: "Collecte de Données",
      description: "CRM (HubSpot/Pipedrive), Analytics (GA4), Ads, facturation (Stripe)",
      deliverable: "Contrôles : fenêtres d'attribution, cohérence unités",
      agents: ["A04 - Tech Auditor", "A05 - Conversational Marketing Auditor"],
      duration: "2-3 jours"
    },
    {
      icon: Zap,
      title: "Scoring Multi-Agents",
      description: "RICE pour priorisation initiatives ; fiabilité des données (A/B/C) ; risques (probabilité × impact)",
      deliverable: "Matrice de priorisation avec scores de confiance",
      agents: ["A17 - Truth Guardian", "A08 - Strategy Auditor"],
      duration: "1 jour"
    },
    {
      icon: TrendingUp,
      title: "Analyses Approfondies",
      description: "Funnel (TOFU→BOFU), CAC/LTV, cohortes, couverture pipeline, win/loss, pricing & discount",
      deliverable: "Dashboards interactifs + Insights actionnables",
      agents: ["A09 - SEO Analyst", "A10 - Content Analyst", "A11 - UX Analyst", "A12 - Conversion Analyst"],
      duration: "3-4 jours"
    },
    {
      icon: FileText,
      title: "Synthèse Stratégique",
      description: "10–15 initiatives classées, budget, planning trimestriel, KPIs cibles, dépendances",
      deliverable: "Plan stratégique + Roadmap + Scénarios d'évolution",
      agents: ["A13 - Synthesis Architect", "A14 - Recommendation Engine"],
      duration: "2 jours"
    },
    {
      icon: CheckCircle2,
      title: "Restitution & Suivi",
      description: "Rapport PDF + Tableaux de bord + séance Q&A",
      deliverable: "Documentation complète + Option itération sous 30 jours",
      agents: ["A15 - Report Generator", "A16 - Quality Reviewer"],
      duration: "1 jour"
    }
  ];

  const kpis = [
    { name: "CAC", description: "Coût d'Acquisition Client par canal" },
    { name: "LTV", description: "Lifetime Value par segment" },
    { name: "MQL→SQL", description: "Taux de conversion Marketing → Sales Qualified Leads" },
    { name: "Win Rate", description: "Taux de conversion des opportunités" },
    { name: "Cycle", description: "Durée moyenne du cycle de vente" },
    { name: "NRR", description: "Net Revenue Retention" },
    { name: "Churn", description: "Taux d'attrition client" },
    { name: "Couverture Pipeline", description: "Ratio pipeline / quota" }
  ];

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4" style={{ color: IMOTION_BRAND.colors.primary }}>
            Méthodologie d'Audit IMOTION
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto mb-6">
            Propulsée par <strong>MANUS IA 2.0</strong>, notre méthodologie combine l'expertise humaine 
            et l'intelligence artificielle pour délivrer des audits marketing & commerciaux d'une précision chirurgicale.
          </p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-muted rounded-full text-sm font-semibold text-foreground">
            <Brain className="w-5 h-5" style={{ color: IMOTION_BRAND.colors.primary }} />
            <span>17 Agents IA Spécialisés</span>
            <span className="mx-2">•</span>
            <Zap className="w-5 h-5" style={{ color: IMOTION_BRAND.colors.primary }} />
            <span>Garantie ZÉRO Hallucination</span>
            <span className="mx-2">•</span>
            <Target className="w-5 h-5" style={{ color: IMOTION_BRAND.colors.primary }} />
            <span>Livraison sous 2 semaines</span>
          </div>
        </div>

        {/* Objectif */}
        <div className="mb-12 p-6 rounded-lg" style={{ 
          backgroundColor: `${IMOTION_BRAND.colors.primary}10`,
          borderLeft: `4px solid ${IMOTION_BRAND.colors.primary}`
        }}>
          <h2 className="text-2xl font-bold mb-3" style={{ color: IMOTION_BRAND.colors.primary }}>
            🎯 Objectif
          </h2>
          <p className="text-foreground text-lg">
            Établir une photographie exploitable sous <strong>2 semaines</strong>, avec recommandations 
            actionnables à <strong>90 jours</strong> et un plan stratégique sur <strong>12-24 mois</strong>.
          </p>
        </div>

        {/* Methodology Steps */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: IMOTION_BRAND.colors.primary }}>
            Les 6 Étapes de Notre Méthodologie
          </h2>
          <div className="space-y-6">
            {methodologySteps.map((step, index) => (
              <div 
                key={index}
                className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow"
                style={{ borderColor: IMOTION_BRAND.colors.border.default }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${IMOTION_BRAND.colors.primary}20` }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: IMOTION_BRAND.colors.primary }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold" style={{ color: IMOTION_BRAND.colors.text.primary }}>
                        {index + 1}. {step.title}
                      </h3>
                      <span className="text-sm font-semibold px-3 py-1 rounded-full bg-muted text-foreground">
                        {step.duration}
                      </span>
                    </div>
                    <p className="text-foreground mb-3">{step.description}</p>
                    <div className="mb-3">
                      <span className="text-sm font-semibold" style={{ color: IMOTION_BRAND.colors.primary }}>
                        Livrable :
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">{step.deliverable}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {step.agents.map((agent, agentIndex) => (
                        <span 
                          key={agentIndex}
                          className="text-xs px-3 py-1 rounded-full font-medium"
                          style={{ 
                            backgroundColor: `${IMOTION_BRAND.colors.primary}15`,
                            color: IMOTION_BRAND.colors.primary
                          }}
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KPIs Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: IMOTION_BRAND.colors.primary }}>
            📊 KPIs Évalués
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border"
                style={{ 
                  backgroundColor: IMOTION_BRAND.colors.background.secondary,
                  borderColor: IMOTION_BRAND.colors.border.default
                }}
              >
                <h3 className="text-lg font-bold mb-1" style={{ color: IMOTION_BRAND.colors.primary }}>
                  {kpi.name}
                </h3>
                <p className="text-sm text-muted-foreground">{kpi.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Gates */}
        <div className="mb-12 p-6 rounded-lg bg-white border" style={{ borderColor: IMOTION_BRAND.colors.border.default }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: IMOTION_BRAND.colors.primary }}>
            🛡️ Quality Gates & Anti-Hallucination
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
              <p className="text-foreground">
                <strong>Phase 1 - Market Study :</strong> Seuil de confiance minimum 85% (retry x3 → fallback sources)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
              <p className="text-foreground">
                <strong>Phase 2 - Audits :</strong> Seuil 80% avec questions complémentaires si nécessaire
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
              <p className="text-foreground">
                <strong>Phase 3 - Analyses :</strong> Seuil 85% avec validation expert virtuel
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
              <p className="text-foreground">
                <strong>Phase 4 - Synthèse :</strong> Seuil 95% (blocage → révision complète)
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: IMOTION_BRAND.colors.status.success }} />
              <p className="text-foreground">
                <strong>Validation croisée :</strong> Minimum 2 sources indépendantes pour chaque affirmation
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a 
            href="/audit-gratuit"
            className="inline-block px-8 py-4 rounded-lg text-white font-bold text-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: IMOTION_BRAND.colors.primary }}
          >
            Demander un Audit Gratuit
          </a>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
