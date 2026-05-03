import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const terminalLines = [
  "Audit funnel marketing & commercial",
  "Analyse CAC / LTV / cohortes",
  "10 initiatives priorisées (RICE)",
  "Plan stratégique 90j · ROI projeté",
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
  }, []);

  return (
    <section className="relative overflow-hidden bg-[hsl(var(--night-900))] pb-24 pt-24 text-[hsl(var(--ink-50))] sm:pb-32 sm:pt-28">
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 20%, hsl(var(--amber-500) / 0.25) 0%, transparent 60%), radial-gradient(50% 40% at 10% 80%, hsl(var(--coral-600) / 0.18) 0%, transparent 70%)",
        }}
      />
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--ink-50)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--ink-50)) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="container relative mx-auto grid grid-cols-1 items-center gap-12 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* LEFT — Wordmark + headline */}
        <div className="animate-fade-in-up">
          {/* Giant wordmark */}
          <div className="mb-6 flex items-end gap-3 sm:mb-8 sm:gap-4">
            <span className="relative flex items-end leading-none">
              <svg viewBox="0 0 24 64" className="h-[5.5rem] w-auto sm:h-[7rem] md:h-[10rem] lg:h-[12rem]" aria-hidden="true">
                <defs>
                  <linearGradient id="hero-flame" x1="0" y1="64" x2="0" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--coral-600))" />
                    <stop offset="55%" stopColor="hsl(var(--coral-500))" />
                    <stop offset="100%" stopColor="hsl(var(--amber-400))" />
                  </linearGradient>
                </defs>
                <rect x="9" y="18" width="6" height="40" rx="2" fill="url(#hero-flame)" />
                <path d="M12 4 L22 18 L14 18 L14 22 L10 22 L10 18 L2 18 Z" fill="url(#hero-flame)" />
              </svg>
              <span
                className="font-bold tracking-[-0.06em] text-white"
                style={{
                  fontFamily: "'General Sans', Inter, system-ui, sans-serif",
                  fontSize: "clamp(3.75rem, 14vw, 12rem)",
                  lineHeight: 0.85,
                }}
              >
                motion
              </span>
            </span>
            <span className="mb-3 hidden border-l border-[hsl(var(--ink-700))] pl-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--ink-300))] sm:inline-block sm:text-[0.7rem]">
              Creator
              <br />
              Studio
            </span>
          </div>

          <h1
            className="mb-5 max-w-2xl font-bold leading-[1.08] tracking-tight text-white animate-fade-in-up delay-100 sm:mb-6"
            style={{
              fontFamily: "'General Sans', Inter, system-ui, sans-serif",
              fontSize: "clamp(1.75rem, 4.2vw, 3.25rem)",
            }}
          >
            Boostez votre{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-flame)" }}
            >
              croissance marketing & commerciale
            </span>
          </h1>

          <p className="mb-7 max-w-xl text-[15px] leading-relaxed text-[hsl(var(--ink-300))] animate-fade-in-up delay-200 sm:mb-8 sm:text-base md:text-lg">
            IMOTION audite votre marketing et votre force de vente, puis génère
            un <span className="font-semibold text-white">plan stratégique actionnable</span> propulsé
            par 17 agents IA spécialisés — livré sous 2 semaines.
          </p>

          <div className="mb-7 flex flex-col gap-3 animate-fade-in-up delay-300 sm:mb-8 sm:flex-row">
            <Button
              size="lg"
              className="group cta-glow press shine h-14 w-full rounded-xl px-7 text-base font-semibold text-white shadow-coral hover:shadow-glow-strong sm:w-auto"
              style={{ backgroundImage: "var(--gradient-flame)" }}
              onClick={() => navigate(session ? "/client/new-project" : "/auth")}
            >
              <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              Lancer mon audit gratuit
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="press h-14 w-full rounded-xl border-[hsl(var(--ink-600))] bg-[hsl(var(--ink-800)/0.6)] px-7 text-base font-semibold text-white backdrop-blur transition-colors hover:border-[hsl(var(--coral-500))] hover:bg-[hsl(var(--ink-700))] hover:text-white sm:w-auto"
              onClick={() => navigate("/audit-methodologie")}
            >
              Voir la méthodologie
            </Button>
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[hsl(var(--ink-300))] animate-fade-in-up delay-500 sm:gap-x-6">
            {["Audit gratuit", "Livré en 2 semaines", "17 agents IA"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--success))]" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — Mockup stack (hidden on small screens) */}
        <div className="relative hidden h-[460px] lg:block">
          {/* Browser mockup back */}
          <div className="absolute right-0 top-8 w-[110%] rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 animate-scale-in animate-float-soft">
            <div className="flex items-center gap-2 border-b border-[hsl(var(--ink-100))] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--coral-500))]" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--amber-400))]" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--success))]" />
              <span className="ml-3 truncate font-mono text-xs text-[hsl(var(--ink-500))]">
                imotion-conseils.fr/dashboard
              </span>
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[hsl(var(--coral-50))] px-2 py-1 text-[10px] font-semibold text-[hsl(var(--coral-700))]">
                <Sparkles className="h-3 w-3" /> IA active
              </span>
            </div>
            <div className="space-y-3 p-5">
              <div className="h-2 w-2/3 rounded-full bg-[hsl(var(--ink-100))]" />
              <div className="h-2 w-1/2 rounded-full bg-[hsl(var(--ink-100))]" />
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[hsl(var(--ink-100))]">
                <div
                  className="h-full w-3/4 rounded-full"
                  style={{ backgroundImage: "var(--gradient-flame)" }}
                />
              </div>
              <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-[hsl(var(--ink-100))] px-4 py-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--ink-400))]">
                  ROI projeté
                </div>
                <div className="text-lg font-bold text-[hsl(var(--ink-900))]">+38 %</div>
              </div>
            </div>
            <div className="absolute -top-3 right-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--success))] px-3 py-1 text-xs font-semibold text-white shadow-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> Audit livré en 2 semaines
            </div>
          </div>

          {/* Terminal front */}
          <div className="absolute left-0 top-48 w-[88%] rounded-2xl bg-[hsl(var(--ink-900))] shadow-2xl ring-1 ring-white/10 animate-scale-in delay-200">
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--coral-500))]" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--amber-400))]" />
              <span className="h-3 w-3 rounded-full bg-[hsl(var(--success))]" />
              <span className="ml-3 font-mono text-xs text-[hsl(var(--ink-300))]">
                alex-ia — stratège marketing
              </span>
            </div>
            <div className="space-y-2 p-5 font-mono text-sm">
              {terminalLines.map((l, i) => (
                <div
                  key={l}
                  className="flex items-start gap-2 text-[hsl(var(--ink-100))] animate-fade-in"
                  style={{ animationDelay: `${400 + i * 250}ms` }}
                >
                  <span className="text-[hsl(var(--success))]">✓</span>
                  <span>{l}</span>
                  {i === terminalLines.length - 1 && (
                    <span className="ml-1 inline-block h-4 w-2 animate-blink bg-[hsl(var(--coral-500))]" />
                  )}
                </div>
              ))}
              <div className="!mt-5 flex items-center justify-between rounded-lg bg-[hsl(var(--ink-800))] px-3 py-2 text-xs">
                <span className="inline-flex items-center gap-2 font-semibold text-white">
                  <span
                    className="h-2 w-8 rounded-full"
                    style={{ backgroundImage: "var(--gradient-flame)" }}
                  />
                  AUDIT
                </span>
                <span className="inline-flex items-center gap-2 text-[hsl(var(--ink-400))]">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--ink-500))]" />
                  STRATÉGIE
                </span>
              </div>
              <div className="!mt-3 text-[hsl(var(--coral-400))]">
                ✦ Plan stratégique généré
                <span className="ml-1 inline-block h-4 w-2 animate-blink bg-[hsl(var(--coral-500))]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background" />
    </section>
  );
};

export default HeroSection;
