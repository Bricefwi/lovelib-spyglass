import { MessageSquare, FileText, Rocket, ArrowRight, Shield, Zap, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const trustItems = [
  { icon: Shield, title: "Données sécurisées", desc: "Hébergement EU" },
  { icon: Zap, title: "IA de dernière génération", desc: "GPT & Claude" },
  { icon: Users, title: "+150 entreprises", desc: "nous font confiance" },
  { icon: Lock, title: "RGPD conforme", desc: "100% transparent" },
];

const stats = [
  { value: "7", suffix: "phases", label: "Phases de découverte", icon: MessageSquare, tone: "coral" },
  { value: "45", suffix: "min", label: "Pour un CDC complet", icon: Zap, tone: "amber" },
  { value: "100", suffix: "%", label: "Cadrage structuré", icon: Shield, tone: "night" },
];

const steps = [
  {
    n: "01",
    icon: MessageSquare,
    tone: "coral",
    title: "Décrivez votre projet",
    desc: "Répondez aux questions de Marc, notre consultant IA. En 7 phases structurées, il cerne votre vision, vos objectifs et vos contraintes.",
  },
  {
    n: "02",
    icon: FileText,
    tone: "amber",
    title: "Recevez votre CDC",
    desc: "Un cahier des charges professionnel est généré automatiquement : spécifications, architecture technique et recommandations.",
  },
  {
    n: "03",
    icon: Rocket,
    tone: "night",
    title: "Devis & Lancement",
    desc: "Obtenez une proposition chiffrée détaillée avec planning, options comparées et contrat. Lancez votre projet en confiance.",
  },
];

const toneClasses: Record<string, { bg: string; text: string; ring: string }> = {
  coral: { bg: "bg-[hsl(var(--coral-600))]", text: "text-[hsl(var(--coral-600))]", ring: "ring-[hsl(var(--coral-600)/0.15)]" },
  amber: { bg: "bg-[hsl(var(--amber-500))]", text: "text-[hsl(var(--amber-600))]", ring: "ring-[hsl(var(--amber-500)/0.15)]" },
  night: { bg: "bg-[hsl(var(--night-700))]", text: "text-[hsl(var(--night-700))]", ring: "ring-[hsl(var(--night-700)/0.15)]" },
};

export const StepsSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-background py-24" id="how">
      <div className="container mx-auto px-6">
        {/* Trust strip */}
        <div className="mb-20 grid grid-cols-2 gap-6 border-y border-border py-6 md:grid-cols-4">
          {trustItems.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{it.title}</div>
                  <div className="text-xs text-muted-foreground">{it.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mb-24 grid grid-cols-1 gap-12 text-center md:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            const tc = toneClasses[s.tone];
            return (
              <div key={s.label} className="flex flex-col items-center">
                <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${tc.bg} shadow-md`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-6xl font-bold tracking-tight text-foreground">{s.value}</span>
                  <span className={`text-2xl font-semibold ${tc.text}`}>{s.suffix}</span>
                </div>
                <div className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Steps header */}
        <div className="mb-14 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Comment ça marche
          </span>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            De l'idée au projet en{" "}
            <span className="gradient-text">3 étapes simples</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Un processus fluide et structuré, entièrement guidé par l'intelligence artificielle.
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* dotted connectors */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-2/3 -translate-x-1/2 -translate-y-1/2 border-t border-dashed border-border md:block" />
          {steps.map((step) => {
            const Icon = step.icon;
            const tc = toneClasses[step.tone];
            return (
              <div
                key={step.n}
                className={`group relative rounded-2xl border border-border bg-card p-7 shadow-card-soft transition-all hover:-translate-y-1 hover:shadow-lg ring-1 ${tc.ring}`}
              >
                <span className="absolute right-5 top-5 text-xs font-semibold tracking-widest text-muted-foreground">
                  {step.n}
                </span>
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${tc.bg} shadow-sm`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full"
            onClick={() => navigate("/how-it-works")}
          >
            Voir le processus détaillé <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
