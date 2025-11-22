import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function TestDataSender() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const sendTestReports = async () => {
    setLoading(true);
    setResults(null);

    try {
      // Récupérer l'email de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de récupérer votre email",
        });
        return;
      }

      console.log("Envoi des rapports à:", user.email);

      // Appeler la fonction d'envoi des rapports
      const { data, error } = await supabase.functions.invoke('send-test-reports', {
        body: { userEmail: user.email }
      });

      if (error) {
        console.error("Erreur:", error);
        toast({
          variant: "destructive",
          title: "Erreur d'envoi",
          description: error.message,
        });
        return;
      }

      console.log("Résultats:", data);
      setResults(data);

      toast({
        title: "✅ Rapports envoyés !",
        description: `${data.reportsSent}/${data.totalReports} rapports envoyés à ${user.email}`,
      });

    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">📧 Envoi des Rapports de Test</h1>
          <p className="text-muted-foreground">
            Recevez les 3 rapports d'audit sur votre adresse email
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">📊 Jeu de données créé</h2>
              <div className="grid gap-4">
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl">1️⃣</div>
                  <div>
                    <h3 className="font-semibold">Bretagne Bio Distribution (PME)</h3>
                    <p className="text-sm text-muted-foreground">Rennes • Distribution bio • Score 72/100</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl">2️⃣</div>
                  <div>
                    <h3 className="font-semibold">TechInnov Solutions (ETI)</h3>
                    <p className="text-sm text-muted-foreground">Paris • SaaS B2B • Score 84/100</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl">3️⃣</div>
                  <div>
                    <h3 className="font-semibold">Groupe IndustrielPro (GE)</h3>
                    <p className="text-sm text-muted-foreground">Lyon • Industrie • Score 78/100</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={sendTestReports} 
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Envoyer les 3 rapports par email
                </>
              )}
            </Button>

            {results && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Résultat de l'envoi
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Destinataire:</strong> {results.recipientEmail}
                  </p>
                  <p className="text-sm">
                    <strong>Rapports envoyés:</strong> {results.reportsSent}/{results.totalReports}
                  </p>
                  
                  {results.details?.map((detail: any, index: number) => (
                    <div 
                      key={detail.reportId}
                      className={`flex items-start gap-2 p-3 rounded-lg ${
                        detail.success ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      {detail.success ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      )}
                      <div className="text-sm">
                        <p className="font-medium">{detail.title}</p>
                        {detail.success ? (
                          <p className="text-green-700">Email envoyé avec succès</p>
                        ) : (
                          <p className="text-red-700">{detail.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
