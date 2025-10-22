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
    <section id="pre-audit" className="py-24 px-6">
      <div className="container mx-auto max-w-3xl">
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LinkIcon className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl">Démarrez votre pré-audit</CardTitle>
            <CardDescription className="text-lg">
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
                className="w-full text-lg h-14"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Lancer l'analyse"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Aucun engagement. Résultats en 3-5 minutes.
              </p>
            </form>

            <div className="mt-8 pt-8 border-t border-border/50">
              <h4 className="font-semibold mb-3">Ce que vous obtiendrez :</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Collecte automatique des données de votre site</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Analyse de votre stack technique et présence digitale</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Rapport préliminaire avec opportunités identifiées</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">✓</span>
                  <span>Estimation ROI et recommandations prioritaires</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
