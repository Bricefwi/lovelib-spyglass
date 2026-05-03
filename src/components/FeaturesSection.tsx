import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, TrendingUp, Target, FileText, Users, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Audit marketing & commercial",
    description: "Analyse complète de votre funnel TOFU→BOFU, CAC/LTV, cohortes, win/loss et couverture pipeline.",
  },
  {
    icon: TrendingUp,
    title: "Stratégie de croissance",
    description: "10 à 15 initiatives priorisées (RICE), budget alloué, KPIs cibles et roadmap trimestrielle 12-24 mois.",
  },
  {
    icon: Target,
    title: "Plan d'action 90 jours",
    description: "Quick wins actionnables, scénarios ambitieux/raisonnable/conservateur avec ROI projeté et risques mitigés.",
  },
  {
    icon: FileText,
    title: "Rapports niveau McKinsey",
    description: "Livrables PDF/HTML format SCQR, 50 à 300 pages, dashboards interactifs et synthèse exécutive.",
  },
  {
    icon: Users,
    title: "17 agents IA spécialisés",
    description: "Market researcher, competitor analyst, SEO, conversion, UX, pricing… orchestrés par MANUS IA 2.0.",
  },
  {
    icon: ShieldCheck,
    title: "Garantie ZÉRO hallucination",
    description: "Validation croisée multi-sources, seuils de confiance 85-95%, données réelles uniquement (Tavily + scraping).",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-background" id="solutions">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Un audit </span>
            <span className="text-primary">marketing & commercial</span>
            <span className="text-foreground"> de référence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            De la photographie de votre performance à la stratégie de croissance actionnable — propulsé par l'IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="bg-card border border-border hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
