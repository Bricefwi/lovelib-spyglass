import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Zap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AuditProgress } from "./AuditProgress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const PreAuditForm = () => {
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"idle" | "collecting" | "generating" | "done" | "error">("idle");
  const [auditType, setAuditType] = useState<"standard" | "advanced">("standard");
  const [orchestrationId, setOrchestrationId] = useState<string>("");
  const [showProgress, setShowProgress] = useState(false);
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
    setStep("collecting");
    
    try {
      // Étape 1: Collecte multi-sources
      toast({
        title: "🔍 Collecte des données...",
        description: "Analyse de votre site et recherche d'informations publiques",
      });

      const { data: preAuditData, error: preAuditError } = await supabase.functions.invoke('preaudit', {
        body: { url: website }
      });

      if (preAuditError) throw preAuditError;

      const preAuditId = preAuditData?.pre_audit_id;
      if (!preAuditId) {
        throw new Error("Pre-audit ID not returned");
      }

      if (auditType === "advanced") {
        // Launch multi-agent orchestration
        setStep("generating");
        toast({
          title: "🚀 Lancement de l'analyse multi-agent...",
          description: "12+ agents IA vont analyser votre entreprise en profondeur",
        });

        const { data: orchData, error: orchError } = await supabase.functions.invoke('orchestrate-multi-agent', {
          body: {
            preAuditId,
            url: website,
            companyInfo: preAuditData.company_info
          }
        });

        if (orchError) throw orchError;

        setOrchestrationId(orchData.orchestrationId);
        setShowProgress(true);
        setIsLoading(false);

        toast({
          title: "✅ Analyse lancée !",
          description: "Suivez la progression ci-dessous. L'analyse prendra 15-20 minutes.",
        });

      } else {
        // Standard audit
        setStep("generating");
        toast({
          title: "🤖 Génération du rapport...",
          description: "L'IA analyse les données et rédige votre pré-audit personnalisé",
        });

        const { data: auditData, error: auditError } = await supabase.functions.invoke('audit-generate', {
          body: { pre_audit_id: preAuditId }
        });

        if (auditError) throw auditError;

        // Succès
        setStep("done");
        toast({
          title: "✅ Pré-audit terminé !",
          description: `Votre rapport complet pour ${website} est prêt. Consultez votre email.`,
        });
        setWebsite("");
        setIsLoading(false);
        setTimeout(() => setStep("idle"), 3000);
      }
      
    } catch (error: any) {
      console.error('Error during audit:', error);
      setStep("error");
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer l'audit. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsLoading(false);
      setTimeout(() => setStep("idle"), 3000);
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
            {showProgress && orchestrationId ? (
              <AuditProgress
                orchestrationId={orchestrationId}
                onComplete={() => {
                  toast({
                    title: "✅ Analyse terminée !",
                    description: "Votre rapport ultra-détaillé est prêt. Consultez votre email.",
                  });
                  setShowProgress(false);
                  setWebsite("");
                  setStep("idle");
                }}
                onError={(error) => {
                  toast({
                    title: "Erreur",
                    description: error,
                    variant: "destructive",
                  });
                  setShowProgress(false);
                  setStep("idle");
                }}
              />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="space-y-4">
                  <Label className="text-base font-semibold">Type d'analyse :</Label>
                  <RadioGroup value={auditType} onValueChange={(value: "standard" | "advanced") => setAuditType(value)}>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Zap className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Audit Standard</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Gratuit</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Analyse rapide (5 min) • 1 agent IA • Rapport basique
                        </p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-4 border-2 border-primary rounded-lg hover:bg-accent cursor-pointer">
                      <RadioGroupItem value="advanced" id="advanced" />
                      <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          <span className="font-semibold">Audit Approfondi</span>
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Premium</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Analyse complète (15-20 min) • 12+ agents IA • Rapport ultra-détaillé
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
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
                      {step === "collecting" && "Collecte des données..."}
                      {step === "generating" && (auditType === "advanced" ? "Lancement multi-agent..." : "Génération du rapport IA...")}
                      {step === "done" && "Terminé !"}
                      {step === "error" && "Erreur"}
                      {step === "idle" && "Analyse en cours..."}
                    </>
                  ) : (
                    <>
                      {auditType === "advanced" ? (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Lancer l'analyse IA avancée
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Lancer l'analyse IA complète
                        </>
                      )}
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Résultats envoyés par email • Aucun engagement
                </p>
              </form>
            )}

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
