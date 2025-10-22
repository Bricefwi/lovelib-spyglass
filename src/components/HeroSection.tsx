import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import marketingWorkspace from "@/assets/marketing-workspace.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-20">
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20">
        {/* Left Content */}
        <div className="text-left">
          <div className="inline-block mb-6">
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              • Intégrateur Apple & IA
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight">
            Accélérez vos opérations avec Apple & l'IA.
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl">
            Modernisez votre SI, automatisez, déployez des apps métiers.
          </p>

          <p className="text-base text-muted-foreground mb-8 max-w-xl">
            IMOTION conçoit et opère vos solutions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold"
            >
              Démarrer un projet
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-6 text-base font-semibold border-2"
            >
              Demander un audit
            </Button>
          </div>
        </div>

        {/* Right Image */}
        <div className="relative lg:block hidden">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src={marketingWorkspace} 
              alt="Workspace moderne avec analytics" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
