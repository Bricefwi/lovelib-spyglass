import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";

export default function Onboarding() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    phone: "",
    companyName: "",
    companyWebsite: "",
    companySiren: "",
    companyIndustry: "",
    companyDescription: "",
    position: "",
    gdprConsent: false
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (!session && event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive"
      });
      return;
    }

    if (!formData.gdprConsent) {
      toast({
        title: "Consentement requis",
        description: "Vous devez accepter la politique de confidentialité",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create company first
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: formData.companyName,
          website: formData.companyWebsite,
          siren: formData.companySiren,
          industry: formData.companyIndustry,
          description: formData.companyDescription,
          city: "",
          country: "FR"
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: session.user.id,
          email: session.user.email!,
          firstname: formData.firstname,
          lastname: formData.lastname,
          phone: formData.phone,
          company_id: company.id,
          gdpr_consent: formData.gdprConsent,
          role: "client"
        });

      if (profileError) throw profileError;

      // Create client record
      const { error: clientError } = await supabase
        .from("clients")
        .insert({
          user_id: session.user.id,
          company_id: company.id,
          position: formData.position
        });

      if (clientError) throw clientError;

      toast({
        title: "Profil créé !",
        description: "Bienvenue sur IMOTION",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le profil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <Card className="w-full max-w-2xl border-2 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Complétez votre profil</CardTitle>
          <CardDescription>
            Renseignez vos informations pour accéder à la plateforme
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-l-4 border-primary pl-3">
                Informations personnelles
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstname">Prénom *</Label>
                  <Input
                    id="firstname"
                    value={formData.firstname}
                    onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastname">Nom *</Label>
                  <Input
                    id="lastname"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="position">Fonction / Poste *</Label>
                <Input
                  id="position"
                  placeholder="Ex: Directeur Marketing"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-l-4 border-primary pl-3">
                Informations entreprise
              </h3>
              
              <div>
                <Label htmlFor="companyName">Raison sociale *</Label>
                <Input
                  id="companyName"
                  placeholder="Nom de votre entreprise"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyWebsite">Site web</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://www.exemple.com"
                    value={formData.companyWebsite}
                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="companySiren">SIREN</Label>
                  <Input
                    id="companySiren"
                    placeholder="123456789"
                    value={formData.companySiren}
                    onChange={(e) => setFormData({ ...formData, companySiren: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="companyIndustry">Secteur d'activité *</Label>
                <Input
                  id="companyIndustry"
                  placeholder="Ex: E-commerce, Services, Tech..."
                  value={formData.companyIndustry}
                  onChange={(e) => setFormData({ ...formData, companyIndustry: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="companyDescription">Description de l'activité</Label>
                <Textarea
                  id="companyDescription"
                  placeholder="Décrivez brièvement votre activité..."
                  value={formData.companyDescription}
                  onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-start space-x-2 pt-4 border-t">
              <input
                type="checkbox"
                id="gdprConsent"
                checked={formData.gdprConsent}
                onChange={(e) => setFormData({ ...formData, gdprConsent: e.target.checked })}
                className="mt-1"
                required
              />
              <Label htmlFor="gdprConsent" className="text-sm text-muted-foreground cursor-pointer">
                J'accepte que mes données soient traitées conformément à la politique de confidentialité (RGPD) *
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création du profil...
                </>
              ) : (
                "Valider et accéder à IMOTION"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
