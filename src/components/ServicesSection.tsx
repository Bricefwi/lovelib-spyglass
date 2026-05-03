import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, TrendingUp, Rocket, Check, Zap, Shield, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const services = [
  {
    icon: Search,
    title: "Audit marketing & commercial",
    description:
      "Photographie 360° de votre performance : funnel TOFU→BOFU, CAC/LTV, cohortes, win/loss, couverture pipeline et benchmarks marché.",
    deliverables: [
      "Diagnostic complet 50-120 pages",
      "Cartographie des canaux & KPIs",
      "Analyse concurrentielle approfondie",
    ],
  },
  {
    icon: TrendingUp,
    title: "Stratégie de croissance",
    description:
      "10 à 15 initiatives priorisées (RICE), budget alloué, KPIs cibles et roadmap trimestrielle 12-24 mois — propulsée par 17 agents IA.",
    deliverables: [
      "Plan stratégique SCQR niveau McKinsey",
      "Scénarios ROI projetés",
      "Roadmap 12-24 mois priorisée",
    ],
  },
  {
    icon: Rocket,
    title: "Déploiement & assistance",
    description:
      "Mise en œuvre opérationnelle : automation, tracking, copywriting, accompagnement des équipes et pilotage hebdomadaire des KPIs.",
    deliverables: [
      "Plan d'action 90 jours actionnable",
      "Mise en place outils & tracking",
      "Coaching équipes & revues KPIs",
    ],
  },
];

const tiers = [
  {
    name: "Conservateur",
    icon: Shield,
    tagline: "Sécuriser l'existant",
    badge: "Risque faible",
    badgeTone: "bg-muted text-foreground",
    roi: "+12 à 18%",
    horizon: "6 mois",
    features: [
      "Quick wins & optimisations",
      "Audit ciblé des canaux clés",
      "Recommandations à faible risque",
      "1 à 3 initiatives prioritaires",
    ],
  },
  {
    name: "Raisonnable",
    icon: Target,
    tagline: "Accélérer la croissance",
    badge: "Recommandé",
    badgeTone: "bg-primary text-primary-foreground",
    highlighted: true,
    roi: "+25 à 38%",
    horizon: "12 mois",
    features: [
      "Audit complet 360° + benchmark",
      "5 à 8 initiatives RICE priorisées",
      "Plan d'action 90 jours détaillé",
      "Accompagnement déploiement",
    ],
  },
  {
    name: "Ambitieux",
    icon: Zap,
    tagline: "Changer d'échelle",
    badge: "Croissance rapide",
    badgeTone: "bg-secondary text-secondary-foreground",
    roi: "+45 à 80%",
    horizon: "18-24 mois",
    features: [
      "Stratégie multi-canaux complète",
      "10 à 15 initiatives & nouveaux marchés",
      "Roadmap 12-24 mois avec scénarios",
      "Pilotage hebdomadaire & coaching",
    ],
  },
];

export const ServicesSection = () => {
  return (
    <section className="py-24 px-6 bg-background" id="services">
      <div className="container mx-auto">
        {/* Services */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Nos </span>
            <span className="text-primary">services</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            De l'audit à l'exécution : un accompagnement marketing & commercial bout-en-bout, propulsé par l'IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="bg-card border border-border hover:shadow-lg transition-all duration-300 group"
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">{service.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed text-muted-foreground pt-2">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.deliverables.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparatif niveaux */}
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-foreground">3 scénarios </span>
            <span className="text-primary">stratégiques</span>
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Chaque audit IMOTION livre trois scénarios chiffrés selon votre appétit au risque et votre horizon.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <Card
                key={index}
                className={`relative transition-all duration-300 ${
                  tier.highlighted
                    ? "border-2 border-primary shadow-xl md:scale-105 bg-card"
                    : "border border-border bg-card hover:shadow-lg"
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <Badge className={tier.badgeTone}>{tier.badge}</Badge>
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    {tier.tagline}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        ROI projeté
                      </div>
                      <div className="text-xl font-bold text-primary">{tier.roi}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                        Horizon
                      </div>
                      <div className="text-xl font-bold text-foreground">{tier.horizon}</div>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
