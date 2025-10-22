import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PreAuditForm = () => {
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!website) {
      toast({
        title: "URL requise",
        description: "Veuillez entrer l'URL de votre site web",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Pré-audit lancé !",
        description: "Nous analysons votre site. Vous recevrez un email avec les résultats dans quelques minutes.",
      });
      setWebsite("");
    }, 2000);
  };

  return (
    <section id="pre-audit" className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background" />
      <div className="container mx-auto max-w-4xl relative z-10">
        <Card className="glass-dark border-primary/30 shadow-glow-strong">
          <CardHeader className="text-center pb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center mx-auto mb-6 shadow-glow">
              <LinkIcon className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-4xl md:text-5xl mb-4">Démarrez votre pré-audit</CardTitle>
            <CardDescription className="text-xl text-foreground/70">
              Entrez l'URL de votre site et recevez une première analyse en quelques minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="url"
                  placeholder="https://www.votre-entreprise.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="h-14 text-lg"
                  disabled={isLoading}
                />
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg h-16 bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-strong hover:shadow-glow font-semibold uppercase tracking-wide"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Lancer l'analyse gratuite"
                )}
              </Button>

              <p className="text-sm text-foreground/60 text-center uppercase tracking-wider">
                Aucun engagement • Résultats en 3-5 minutes
              </p>
            </form>

            <div className="mt-10 pt-8 border-t border-primary/20">
              <h4 className="font-semibold mb-6 text-xl text-primary">Ce que vous obtiendrez :</h4>
              <ul className="space-y-4 text-base text-foreground/80">
                <li className="flex items-start group">
                  <span className="text-primary mr-3 text-xl font-bold group-hover:scale-110 transition-transform">✓</span>
                  <span className="group-hover:text-foreground transition-colors">Collecte automatique des données de votre site</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-primary mr-3 text-xl font-bold group-hover:scale-110 transition-transform">✓</span>
                  <span className="group-hover:text-foreground transition-colors">Analyse de votre stack technique et présence digitale</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-primary mr-3 text-xl font-bold group-hover:scale-110 transition-transform">✓</span>
                  <span className="group-hover:text-foreground transition-colors">Rapport préliminaire avec opportunités identifiées</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-primary mr-3 text-xl font-bold group-hover:scale-110 transition-transform">✓</span>
                  <span className="group-hover:text-foreground transition-colors">4 scénarios chiffrés (ambitieux, raisonné, opportuniste, mix)</span>
                </li>
                <li className="flex items-start group">
                  <span className="text-primary mr-3 text-xl font-bold group-hover:scale-110 transition-transform">✓</span>
                  <span className="group-hover:text-foreground transition-colors">Estimation ROI et recommandations prioritaires</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
