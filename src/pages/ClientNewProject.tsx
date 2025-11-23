import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ClientNewProject = () => {
  const [siret, setSiret] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleValidateSiret = async () => {
    if (!siret || siret.length !== 14) {
      toast({
        title: "SIRET invalide",
        description: "Le SIRET doit contenir exactement 14 chiffres",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke("validate-company-siret", {
        body: { siret },
      });

      if (error) throw error;

      if (data.success) {
        setCompanyData(data.company);
        setIsValidated(true);
        toast({
          title: "Entreprise validée",
          description: `${data.company.legal_name} - ${data.company.city}`,
        });
      } else {
        toast({
          title: "Validation échouée",
          description: data.message || "Impossible de valider ce SIRET",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la validation du SIRET",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleStartAudit = async () => {
    if (!isValidated || !companyData) return;

    setIsSubmitting(true);
    try {
      // 1. Créer ou récupérer l'entreprise dans la table companies
      const { data: existingCompany } = await supabase
        .from("companies")
        .select("id")
        .eq("siret", siret)
        .maybeSingle();

      let companyId = existingCompany?.id;

      if (!companyId) {
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: companyData.legal_name,
            siret: siret,
            siren: companyData.siren,
            city: companyData.city,
            address: companyData.address,
            postal_code: companyData.postal_code,
            country: "France",
            industry: companyData.activity || null,
          })
          .select("id")
          .single();

        if (companyError) throw companyError;
        companyId = newCompany.id;
      }

      // 2. Rediriger vers l'audit conversationnel (à implémenter)
      toast({
        title: "Entreprise enregistrée",
        description: "Démarrage de l'audit conversationnel...",
      });

      // TODO: Rediriger vers la page d'audit conversationnel avec les agents IA
      // navigate(`/client/audit-conversationnel/${companyId}`);
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de démarrer l'audit",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Nouveau Projet d'Audit Conversationnel
          </h1>
          <p className="text-muted-foreground mb-8">
            Nos agents IA hyper-spécialisés vont échanger avec vous pour analyser en profondeur votre entreprise cliente.
            Commencez par identifier l'entreprise.
          </p>

          <Card className="p-6">
            <div className="space-y-6">
              {/* Étape 1: Validation SIRET */}
              <div>
                <Label htmlFor="siret" className="text-base font-semibold mb-2 block">
                  SIRET de l'entreprise cliente
                </Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Entrez le numéro SIRET (14 chiffres) pour identifier l'entreprise
                </p>
                <div className="flex gap-3">
                  <Input
                    id="siret"
                    value={siret}
                    onChange={(e) => setSiret(e.target.value.replace(/\D/g, ""))}
                    placeholder="12345678901234"
                    maxLength={14}
                    disabled={isValidated}
                    className="font-mono"
                  />
                  <Button
                    onClick={handleValidateSiret}
                    disabled={isValidating || isValidated || siret.length !== 14}
                  >
                    {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isValidated ? <CheckCircle className="mr-2 h-4 w-4" /> : null}
                    {isValidated ? "Validé" : "Valider"}
                  </Button>
                </div>
              </div>

              {/* Étape 2: Informations entreprise validée */}
              {isValidated && companyData && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-lg">{companyData.legal_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {companyData.address}, {companyData.postal_code} {companyData.city}
                      </p>
                      {companyData.activity && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Activité: {companyData.activity}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleStartAudit}
                    disabled={isSubmitting}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Démarrer l'audit conversationnel
                  </Button>
                </div>
              )}

              {/* Note d'information */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Audit conversationnel avec IA</p>
                  <p>
                    Une fois l'entreprise validée, nos agents IA spécialisés vont vous poser des questions
                    ciblées pour construire un diagnostic complet et des recommandations stratégiques personnalisées.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientNewProject;
