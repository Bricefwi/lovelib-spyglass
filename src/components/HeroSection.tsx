import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-animated">
      {/* Background avec effet glassmorphism */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 gradient-hero opacity-80" />
        <img 
          src={heroBg} 
          alt="" 
          className="w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
      </div>

      {/* Floating orbs avec glow */}
      <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-primary/30 rounded-full blur-3xl animate-float opacity-60" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-accent/25 rounded-full blur-3xl animate-float opacity-50" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 rounded-full glass-dark shadow-glow">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary uppercase tracking-wide">IA + Conseil Expert</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary" style={{ 
            backgroundSize: '200% auto',
            animation: 'gradient-shift 8s linear infinite'
          }}>
            IMOTION
          </span>
          <br />
          <span className="text-foreground/90">Conseil & Performance</span>
        </h1>

        <p className="text-xl md:text-3xl text-muted-foreground mb-4 max-w-3xl mx-auto font-light">
          Marketing & Commercial — Conseil augmenté par l'IA
        </p>

        <p className="text-base md:text-lg text-foreground/70 mb-12 max-w-2xl mx-auto leading-relaxed">
          Diagnostic stratégique depuis l'URL de votre site. Rapports par étapes, scénarios chiffrés, plan d'exécution opérationnel.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            className="text-lg px-10 py-7 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-strong hover:shadow-glow transition-all group font-semibold uppercase tracking-wide"
          >
            Lancer mon pré-audit
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="text-lg px-10 py-7 glass-dark border-primary/30 hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            Voir un exemple de plan
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { value: "< 5 min", label: "Pré-audit automatique" },
            { value: "4", label: "Scénarios détaillés" },
            { value: "100%", label: "ROI chiffré" }
          ].map((stat, i) => (
            <div 
              key={i}
              className="p-8 rounded-2xl glass-dark hover:shadow-glow transition-all duration-500 hover:scale-105 group"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">{stat.value}</div>
              <div className="text-muted-foreground text-sm uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
