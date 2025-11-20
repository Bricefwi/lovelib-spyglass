import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [auditId, setAuditId] = useState<string>("");
  const [showProgress, setShowProgress] = useState(false);
  const [auditsRemaining, setAuditsRemaining] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Récupérer le nombre d'audits restants au chargement
  useEffect(() => {
    const fetchAuditsRemaining = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('free_audits_used')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const remaining = 3 - (profile.free_audits_used || 0);
        setAuditsRemaining(remaining);
      }
    };

    fetchAuditsRemaining();
  }, []);

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
        // Vérifier l'accès avant de lancer l'audit avancé
        const { data: accessCheck, error: accessError } = await supabase.functions.invoke('check-audit-access', {
          body: {
            pre_audit_id: preAuditId
          }
        });

        if (accessError) {
          console.error('Error checking access:', accessError);
          toast({
            title: "❌ Erreur de vérification",
            description: "Impossible de vérifier vos droits d'accès. Veuillez réessayer.",
            variant: "destructive"
          });
          setIsLoading(false);
          setStep("idle");
          return;
        }

        // Si l'accès est refusé
        if (!accessCheck?.allowed) {
          const reason = accessCheck?.reason || 'unknown';
          const denialMessages: Record<string, { title: string; description: string }> = {
            'email_not_confirmed': {
              title: "📧 Email non confirmé",
              description: "Veuillez confirmer votre email avant de lancer un audit. Vérifiez votre boîte mail."
            },
            'onboarding_not_completed': {
              title: "🏢 Identification entreprise requise",
              description: "Veuillez compléter votre profil entreprise avant de lancer un audit."
            },
            'free_audits_exhausted': {
              title: "🎯 Audits gratuits épuisés",
              description: `Vous avez utilisé vos ${accessCheck?.free_audits_limit || 3} audits gratuits. Découvrez nos offres premium pour continuer.`
            },
            'rate_limit_exceeded': {
              title: "⏱️ Trop de tentatives",
              description: "Vous avez atteint la limite de tentatives. Veuillez patienter avant de réessayer."
            },
            'trust_score_too_low': {
              title: "⚠️ Vérification en cours",
              description: "Votre compte est en cours de vérification par notre équipe. Veuillez patienter."
            },
            'account_blocked': {
              title: "🚫 Compte temporairement bloqué",
              description: "Votre compte est temporairement bloqué. Contactez le support pour plus d'informations."
            },
            'account_rejected': {
              title: "❌ Compte rejeté",
              description: "Votre demande d'accès a été rejetée. Contactez le support pour plus d'informations."
            }
          };

          const message = denialMessages[reason] || {
            title: "❌ Accès refusé",
            description: "Vous ne pouvez pas lancer d'audit pour le moment."
          };

          toast({
            title: message.title,
            description: message.description,
            variant: "destructive"
          });

          // Rediriger selon la raison
          if (reason === 'onboarding_not_completed') {
            navigate('/onboarding/company');
          } else if (reason === 'free_audits_exhausted') {
            navigate('/pricing');
          }

          setIsLoading(false);
          setStep("idle");
          return;
        }

        // Si l'accès est autorisé, afficher un message de succès
        toast({
          title: "✅ Vérification réussie",
          description: `Audits gratuits restants : ${accessCheck?.free_audits_remaining || 0}/${accessCheck?.free_audits_limit || 3}`,
          variant: "default"
        });

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

        setAuditId(preAuditId);
        setShowProgress(true);
        setIsLoading(false);

        // Mettre à jour le compteur d'audits restants
        if (accessCheck?.free_audits_remaining !== undefined) {
          setAuditsRemaining(accessCheck.free_audits_remaining - 1);
        }

        toast({
          title: "✅ Analyse lancée !",
          description: "Suivez la progression ci-dessous. L'analyse prendra environ 2 semaines.",
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
            {showProgress && auditId ? (
              <AuditProgress auditId={auditId} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Badge Audits Restants */}
                {auditsRemaining !== null && auditType === "advanced" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-900">
                          Audits gratuits restants
                        </p>
                        <p className="text-sm text-blue-700">
                          Vous avez {auditsRemaining} audit{auditsRemaining > 1 ? 's' : ''} gratuit{auditsRemaining > 1 ? 's' : ''} restant{auditsRemaining > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {auditsRemaining}/3
                      </div>
                    </div>
                    {auditsRemaining === 0 && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto mt-2"
                        onClick={() => navigate('/pricing')}
                      >
                        💡 Découvrez nos offres premium →
                      </Button>
                    )}
                  </div>
                )}

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
                          Analyse complète (2 semaines) • 17 agents IA orchestrés • Rapport ultra-détaillé
                        </p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base py-6 font-semibold"
                  disabled={isLoading || (auditType === "advanced" && auditsRemaining === 0)}
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
                  ) : auditsRemaining === 0 && auditType === "advanced" ? (
                    <>
                      🎯 Audits gratuits épuisés
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
