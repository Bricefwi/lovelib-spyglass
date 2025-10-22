import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, TrendingUp, Users, Zap, BarChart3, Rocket } from "lucide-react";

const Solutions = () => {
  const solutions = [
    {
      icon: Target,
      title: "Audit Stratégique",
      description: "Analyse complète de votre positionnement marché, canaux d'acquisition et opportunités de croissance.",
      features: ["Analyse concurrentielle", "Cartographie des canaux", "Recommandations actionnables"]
    },
    {
      icon: TrendingUp,
      title: "Pilotage Commercial",
      description: "Optimisation des cycles de vente, prévisions précises et stratégies de fidélisation client.",
      features: ["Optimisation du tunnel de vente", "Prévisions de revenus", "Score de qualification leads"]
    },
    {
      icon: Users,
      title: "Campagnes Multi-Canales",
      description: "Gestion et mesure de performance sur l'ensemble de vos canaux d'acquisition digitale.",
      features: ["Attribution multi-touch", "ROI par canal", "Optimisation budget"]
    },
    {
      icon: Zap,
      title: "Automatisation Marketing",
      description: "Mise en place de workflows automatisés pour gagner en efficacité et en personnalisation.",
      features: ["Email marketing automatisé", "Lead nurturing", "Segmentation dynamique"]
    },
    {
      icon: BarChart3,
      title: "Analytics & Reporting",
      description: "Tableaux de bord personnalisés et rapports d'analyse pour piloter vos décisions.",
      features: ["Dashboards temps réel", "KPIs personnalisés", "Alertes intelligentes"]
    },
    {
      icon: Rocket,
      title: "Accompagnement IA",
      description: "Intégration d'outils d'intelligence artificielle pour décupler vos performances.",
      features: ["Prédictions de churn", "Recommandations produits", "Optimisation prix"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Nos Solutions Marketing & Commerciales
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez comment IMOTION optimise vos performances à travers des stratégies data-driven, 
            des outils d'analyse avancés et un accompagnement sur mesure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            return (
              <Card 
                key={index} 
                className="border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300"
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{solution.title}</CardTitle>
                  <CardDescription className="text-base">
                    {solution.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {solution.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 text-center bg-muted/50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Prêt à transformer vos opérations ?
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            Demandez un audit gratuit pour identifier vos opportunités de croissance.
          </p>
          <a 
            href="/#audit" 
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Demander un audit
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Solutions;
