import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, BarChart3, Target, FileText, Zap, Shield } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Pré-audit automatique",
    description: "Collecte et analyse automatique depuis l'URL de votre site web. Validation des données en temps réel.",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Scénarios multi-branches",
    description: "Ambitieux, raisonnable, conservateur ou mix. Chaque scénario avec probabilité de succès et ROI estimé.",
    color: "text-accent"
  },
  {
    icon: Target,
    title: "Plan d'action opérationnel",
    description: "Initiatives chiffrées, timeline 90j, KPIs cibles, allocation budget et analyse risques/mitigations.",
    color: "text-primary"
  },
  {
    icon: FileText,
    title: "Rapports PDF/HTML",
    description: "Exports professionnels par phase avec branding IMOTION. Stockage S3 et indexation SEO optionnelle.",
    color: "text-accent"
  },
  {
    icon: Zap,
    title: "Intégration BI",
    description: "Webhooks Power BI et Metabase. Payloads structurés pour dashboards temps réel.",
    color: "text-primary"
  },
  {
    icon: Shield,
    title: "Sécurité & conformité",
    description: "RLS Supabase, RGPD, audit trail complet. Cache Redis et rate-limiting intégrés.",
    color: "text-accent"
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-background" id="solutions">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Services </span>
            <span className="text-primary">Premium</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            De la réparation hardware à la transformation digitale complète
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
