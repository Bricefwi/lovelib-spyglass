import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImotionLogo } from "@/components/brand/ImotionLogo";
import { ArrowRight, Check, X, Flame } from "lucide-react";

const palette = [
  { name: "Coral 600 / CTA", hex: "#D8442A", token: "--coral-600", text: "white" },
  { name: "Coral 500 / Hero", hex: "#EE5A36", token: "--coral-500", text: "white" },
  { name: "Amber 500", hex: "#EF8208", token: "--amber-500", text: "white" },
  { name: "Amber 400", hex: "#FFA418", token: "--amber-400", text: "white" },
  { name: "Ink 900 / Texte", hex: "#0F0E0D", token: "--ink-900", text: "white" },
  { name: "Ink 500 / Subtle", hex: "#5C5955", token: "--ink-500", text: "white" },
  { name: "Night 700", hex: "#1E2A6B", token: "--night-700", text: "white" },
  { name: "Bg / Cream", hex: "#FAF8F7", token: "--ink-50", text: "ink" },
];

const tone = {
  do: [
    "« Transformez vos idées en projets concrets »",
    "« Votre CDC prêt en 45 minutes »",
    "« Marc, votre consultant IA »",
  ],
  dont: [
    "« Solution révolutionnaire propulsée par l'IA »",
    "« La meilleure plateforme du marché »",
    "« Synergie disruptive de l'écosystème digital »",
  ],
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-2xl border border-border bg-card p-6 shadow-card-soft ${className}`}>
    {children}
  </div>
);

const BrandGuidelines = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pb-24 pt-32">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Brand Guidelines v1
        </span>
        <h1 className="mt-3 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          Le système IMOTION,<br />en une page.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Une identité unique : <strong>flamme corail</strong>, <strong>encre chaude</strong>, et une typographie display qui donne enfin du caractère à la marque.
        </p>

        {/* PALETTE */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground">Palette</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Le coral signature passe AA en 600. L'amber accompagne. L'encre chaude ancre le tout.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {palette.map((c) => (
              <div key={c.hex} className="overflow-hidden rounded-2xl border border-border bg-card shadow-card-soft">
                <div className="h-24" style={{ backgroundColor: c.hex }} />
                <div className="p-4">
                  <div className="text-sm font-semibold text-foreground">{c.name}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TYPOGRAPHIE */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground">Typographie</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            General Sans pour les titres (display, caractère). Inter pour le texte courant. JetBrains Mono pour la data.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Display — General Sans
              </div>
              <div className="mt-3 text-7xl font-bold tracking-tight text-foreground">Aa</div>
              <div className="mt-3 text-2xl font-semibold text-foreground">Transformez vos idées</div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">500, 600, 700</div>
            </Card>
            <Card>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Texte — Inter
              </div>
              <div className="mt-3 text-7xl font-bold text-foreground" style={{ fontFamily: "Inter" }}>Aa</div>
              <div className="mt-3 text-base text-muted-foreground">
                L'IA qui transforme vos idées en cahiers des charges professionnels — gratuitement.
              </div>
              <div className="mt-2 font-mono text-xs text-muted-foreground">400, 500, 600, 700</div>
            </Card>
          </div>
        </section>

        {/* LOGO */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground">Logo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Wordmark seul ou avec sous-titre Creator Studio. Toujours flèche corail montante sur le « i ».
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card className="flex items-center justify-center text-4xl">
              <ImotionLogo tone="dark" />
            </Card>
            <Card className="flex items-center justify-center text-4xl">
              <ImotionLogo tone="dark" showTagline />
            </Card>
            <div className="flex items-center justify-center rounded-2xl bg-[hsl(var(--ink-900))] p-6 text-4xl">
              <ImotionLogo tone="light" showTagline />
            </div>
          </div>
        </section>

        {/* BOUTONS */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground">Boutons & Badges</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Tous les CTA passent WCAG AA. La hiérarchie est claire : Flame &gt; Primary &gt; Secondary &gt; Ghost.
          </p>
          <Card className="mt-6 flex flex-wrap items-center gap-3">
            <Button className="gradient-flame text-white shadow-coral hover:opacity-95">
              <Flame className="mr-2 h-4 w-4" /> Flame CTA
            </Button>
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button className="bg-[hsl(var(--ink-900))] text-white hover:bg-[hsl(var(--ink-800))]">Dark</Button>
            <Button variant="ghost">Ghost <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Card>
          <Card className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-[hsl(var(--coral-100))] text-[hsl(var(--coral-700))] hover:bg-[hsl(var(--coral-100))]">
              ✦ Propulsé par l'IA
            </Badge>
            <Badge className="bg-[hsl(var(--amber-300)/0.4)] text-[hsl(var(--amber-600))] hover:bg-[hsl(var(--amber-300)/0.4)]">
              Phase 2/7
            </Badge>
            <Badge className="bg-[hsl(150_76%_36%/0.15)] text-[hsl(150_76%_30%)] hover:bg-[hsl(150_76%_36%/0.15)]">
              ✓ CDC prêt
            </Badge>
            <Badge className="bg-[hsl(var(--night-700)/0.12)] text-[hsl(var(--night-700))] hover:bg-[hsl(var(--night-700)/0.12)]">
              Architecture
            </Badge>
            <Badge variant="outline">Neutral</Badge>
          </Card>
        </section>

        {/* TON */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-foreground">Ton de marque</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Précis, chaleureux, jamais corporate. On parle à un dirigeant qui n'a pas le temps, mais a besoin de comprendre.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="border-[hsl(150_76%_36%/0.3)] bg-[hsl(150_76%_36%/0.05)]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[hsl(150_76%_30%)]">
                <Check className="h-4 w-4" /> À FAIRE
              </div>
              <ul className="space-y-2 text-sm text-foreground">
                {tone.do.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </Card>
            <Card className="border-[hsl(var(--coral-600)/0.3)] bg-[hsl(var(--coral-600)/0.05)]">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--coral-700))]">
                <X className="h-4 w-4" /> À ÉVITER
              </div>
              <ul className="space-y-2 text-sm text-foreground">
                {tone.dont.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BrandGuidelines;
