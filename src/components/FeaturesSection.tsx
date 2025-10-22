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
    <section className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-subtle opacity-50" />
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="text-foreground">Audit complet en</span>{" "}
            <span className="text-primary">quelques minutes</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
            De la collecte automatique aux rapports détaillés, notre plateforme IA gère tout le processus d'audit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="glass-dark border-primary/20 hover:border-primary/50 hover:shadow-glow transition-all duration-500 group"
              >
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300`}>
                    <Icon className={`w-8 h-8 ${feature.color} group-hover:text-primary transition-colors`} />
                  </div>
                  <CardTitle className="text-2xl group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed text-foreground/70">
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
