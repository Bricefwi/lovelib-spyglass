import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    
    try {
      const { data, error } = await supabase.functions.invoke('send-audit-results', {
        body: { 
          website, 
          auditType: 'free' 
        }
      });

      if (error) throw error;

      toast({
        title: "✅ Pré-audit envoyé !",
        description: `Analyse de ${website} envoyée à patrice.simion@gmail.com`,
      });
      setWebsite("");
    } catch (error: any) {
      console.error('Error sending audit:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'audit. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="audit" className="py-24 px-6 bg-background">
      <div className="container mx-auto max-w-2xl">
        <Card className="bg-card border border-border shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl md:text-5xl mb-4 text-foreground">Audit Digital Gratuit</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Évaluez la maturité digitale de votre entreprise en quelques minutes
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
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-6 font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  "Lancer l'analyse gratuite"
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Résultats envoyés par email • Aucun engagement
              </p>
            </form>

            <div className="mt-10 pt-8 border-t border-border">
              <h4 className="font-semibold mb-6 text-lg text-foreground">Ce que vous obtiendrez :</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>Collecte automatique des données de votre site</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>Analyse de votre stack technique et présence digitale</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>Rapport préliminaire avec opportunités identifiées</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
                  <span>4 scénarios chiffrés (ambitieux, raisonné, opportuniste, mix)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-3 font-bold">✓</span>
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
