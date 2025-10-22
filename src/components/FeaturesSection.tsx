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
    <section className="py-24 px-6 bg-gradient-subtle">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Audit complet en quelques minutes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            De la collecte automatique aux rapports détaillés, notre plateforme IA gère tout le processus d'audit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all duration-300 group"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
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
