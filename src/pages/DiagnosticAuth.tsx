import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function DiagnosticAuth() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke('send-auth-diagnostic', {
        body: { email }
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "✅ Diagnostic envoyé !",
        description: `Un rapport complet a été envoyé à ${email}`,
      });

      console.log("Diagnostic result:", data);
    } catch (error: any) {
      console.error("Error sending diagnostic:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le diagnostic",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Mail className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">🔍 Diagnostic d'Authentification</CardTitle>
            <CardDescription className="text-base mt-2">
              Recevez un rapport détaillé sur l'état de votre compte par email
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Diagnostic envoyé !</h3>
                <p className="text-muted-foreground mb-4">
                  Vérifiez votre boîte mail ({email})
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Le rapport contient des informations détaillées sur votre compte et des solutions recommandées.
                </p>
                <Button 
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  variant="outline"
                >
                  Nouveau diagnostic
                </Button>
              </div>
            ) : (
              <form onSubmit={handleDiagnostic} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Saisissez l'email de votre compte IMOTION
                  </p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">Le rapport contiendra :</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>✓ État du compte (existant ou non)</li>
                    <li>✓ Statut de confirmation email</li>
                    <li>✓ Rôle attribué (admin/client)</li>
                    <li>✓ Dernière connexion</li>
                    <li>✓ Solutions personnalisées</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Recevoir le diagnostic
                    </>
                  )}
                </Button>

                <div className="text-center pt-4">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => window.location.href = "/auth"}
                  >
                    Retour à la connexion
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Des questions ? <a href="/support" className="text-primary hover:underline">Contactez le support</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
