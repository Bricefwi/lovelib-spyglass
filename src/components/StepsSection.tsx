import { MessageSquare, FileText, Rocket, ArrowRight, Shield, Zap, Users, Lock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const trustItems = [
  { icon: Shield, title: "Données sécurisées", desc: "Hébergement EU", tone: "coral" },
  { icon: Zap, title: "IA de dernière génération", desc: "GPT & Claude", tone: "amber" },
  { icon: Users, title: "+150 entreprises", desc: "nous font confiance", tone: "night" },
  { icon: Lock, title: "RGPD conforme", desc: "100% transparent", tone: "success" },
];

const stats = [
  { value: "7", suffix: "phases", label: "Phases de découverte", icon: MessageSquare, tone: "coral" },
  { value: "45", suffix: "min", label: "Pour un CDC complet", icon: Zap, tone: "amber" },
  { value: "100", suffix: "%", label: "Cadrage structuré", icon: Star, tone: "night" },
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

const toneClasses: Record<string, { tile: string; text: string; ring: string; soft: string }> = {
  coral: {
    tile: "bg-[hsl(var(--coral-600))] shadow-[0_8px_20px_-6px_hsl(var(--coral-600)/0.45)]",
    text: "text-[hsl(var(--coral-600))]",
    ring: "ring-[hsl(var(--coral-600)/0.12)]",
    soft: "bg-[hsl(var(--coral-50))]",
  },
  amber: {
    tile: "bg-[hsl(var(--amber-500))] shadow-[0_8px_20px_-6px_hsl(var(--amber-500)/0.45)]",
    text: "text-[hsl(var(--amber-600))]",
    ring: "ring-[hsl(var(--amber-500)/0.15)]",
    soft: "bg-[hsl(var(--amber-300)/0.18)]",
  },
  night: {
    tile: "bg-[hsl(var(--night-700))] shadow-[0_8px_20px_-6px_hsl(var(--night-700)/0.45)]",
    text: "text-[hsl(var(--night-700))]",
    ring: "ring-[hsl(var(--night-700)/0.12)]",
    soft: "bg-[hsl(var(--night-700)/0.08)]",
  },
  success: {
    tile: "bg-[hsl(var(--success))] shadow-[0_8px_20px_-6px_hsl(var(--success)/0.45)]",
    text: "text-[hsl(var(--success))]",
    ring: "ring-[hsl(var(--success)/0.12)]",
    soft: "bg-[hsl(var(--success)/0.1)]",
  },
};

export const StepsSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative bg-[hsl(var(--ink-50))] py-24"
      id="how"
      style={{ backgroundImage: "var(--gradient-paper)" }}
    >
      {/* subtle ambient flame glow at top */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, hsl(var(--coral-500)/0.10) 0%, transparent 70%)",
        }}
      />

      <div className="container relative mx-auto px-6">
        {/* Trust strip */}
        <div className="mb-20 grid grid-cols-2 gap-6 rounded-2xl border border-[hsl(var(--ink-100))] bg-white/70 px-6 py-5 backdrop-blur md:grid-cols-4">
          {trustItems.map((it) => {
            const Icon = it.icon;
            const tc = toneClasses[it.tone];
            return (
              <div key={it.title} className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tc.soft}`}>
                  <Icon className={`h-5 w-5 ${tc.text}`} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[hsl(var(--ink-900))]">{it.title}</div>
                  <div className="text-xs text-[hsl(var(--ink-500))]">{it.desc}</div>
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
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${tc.tile}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-bold tracking-[-0.04em] text-[hsl(var(--ink-900))]"
                    style={{ fontFamily: "'General Sans', Inter, sans-serif", fontSize: "5rem", lineHeight: 1 }}
                  >
                    {s.value}
                  </span>
                  <span className={`text-2xl font-bold ${tc.text}`}>{s.suffix}</span>
                </div>
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--ink-500))]">
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Steps header */}
        <div className="mb-14 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[hsl(var(--coral-600))]">
            Comment ça marche
          </span>
          <h2
            className="mx-auto mt-4 max-w-3xl font-bold leading-[1.1] tracking-tight text-[hsl(var(--ink-900))]"
            style={{ fontFamily: "'General Sans', Inter, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            De l'idée au projet en{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-flame)" }}
            >
              3 étapes simples
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-[hsl(var(--ink-500))] md:text-lg">
            Un processus fluide et structuré, entièrement guidé par l'intelligence artificielle.
          </p>
        </div>

        {/* Steps grid */}
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-2/3 -translate-x-1/2 -translate-y-1/2 border-t border-dashed border-[hsl(var(--ink-200))] md:block" />
          {steps.map((step) => {
            const Icon = step.icon;
            const tc = toneClasses[step.tone];
            return (
              <div
                key={step.n}
                className={`group relative rounded-2xl border border-[hsl(var(--ink-100))] bg-white p-7 shadow-card-soft transition-all hover:-translate-y-1 hover:shadow-lg ring-1 ${tc.ring}`}
              >
                <span className="absolute right-5 top-5 font-mono text-xs font-semibold tracking-[0.18em] text-[hsl(var(--ink-300))]">
                  {step.n}
                </span>
                <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${tc.tile}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3
                  className="mb-2 text-xl font-bold text-[hsl(var(--ink-900))]"
                  style={{ fontFamily: "'General Sans', Inter, sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[hsl(var(--ink-500))]">{step.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full border-[hsl(var(--ink-200))] bg-white px-7 text-[hsl(var(--ink-900))] hover:bg-[hsl(var(--ink-50))]"
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
