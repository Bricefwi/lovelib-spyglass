import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function OnboardingCompany() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États SIRET
  const [siret, setSiret] = useState("");
  const [validatingSiret, setValidatingSiret] = useState(false);
  const [siretValid, setSiretValid] = useState(false);
  const [siretError, setSiretError] = useState("");
  const [companyData, setCompanyData] = useState<any>(null);
  
  // États formulaire
  const [website, setWebsite] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [professionalEmail, setProfessionalEmail] = useState("");
  const [professionalPhone, setProfessionalPhone] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [certified, setCertified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Vérifier si l'onboarding est déjà complété
  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('user_id', user.id)
        .single();
      
      // Pour l'instant on ne redirige pas car on n'a pas encore les colonnes company_
      // On vérifiera plus tard
    };
    
    checkOnboarding();
  }, [navigate]);

  const handleValidateSiret = async () => {
    if (!siret || siret.length !== 14) {
      setSiretError("Le SIRET doit contenir exactement 14 chiffres.");
      return;
    }

    setValidatingSiret(true);
    setSiretError("");

    try {
      const { data, error } = await supabase.functions.invoke('validate-company-siret', {
        body: { siret }
      });

      if (error) throw error;

      if (data.valid) {
        setCompanyData(data);
        setSiretValid(true);
        toast({
          title: "✅ SIRET validé",
          description: `Entreprise : ${data.legalName}`,
        });
      } else {
        setSiretError(data.error || "SIRET invalide");
        setSiretValid(false);
      }
    } catch (error: any) {
      console.error('Erreur validation SIRET:', error);
      setSiretError(error.message || "Erreur lors de la validation du SIRET");
      setSiretValid(false);
    } finally {
      setValidatingSiret(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/verification-document.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!siretValid || !certified) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez valider le SIRET et certifier les informations.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      // Upload document si présent
      let documentUrl = null;
      if (documentFile) {
        documentUrl = await handleFileUpload(documentFile);
      }

      // Sauvegarder dans profiles (temporairement sans les champs company_)
      const { error } = await supabase
        .from('profiles')
        .update({
          firstname,
          lastname,
          email: user.email,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "✅ Profil complété avec succès !",
        description: "Vous pouvez maintenant accéder à votre compte.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les données.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Identification de votre entreprise</CardTitle>
            <CardDescription>
              Ces informations nous permettent de personnaliser votre audit et de garantir la qualité des analyses.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1 : Validation SIRET */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">1. Validation SIRET</h3>
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET de votre entreprise *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="siret"
                      type="text"
                      placeholder="14 chiffres (ex: 12345678901234)"
                      value={siret}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 14) {
                          setSiret(value);
                          setSiretValid(false);
                          setSiretError("");
                        }
                      }}
                      maxLength={14}
                      disabled={siretValid}
                      className={siretValid ? "border-green-500" : ""}
                    />
                    <Button
                      type="button"
                      onClick={handleValidateSiret}
                      disabled={validatingSiret || siret.length !== 14 || siretValid}
                    >
                      {validatingSiret ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Validation...
                        </>
                      ) : siretValid ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Validé
                        </>
                      ) : (
                        "Valider"
                      )}
                    </Button>
                  </div>
                  
                  {siretError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{siretError}</AlertDescription>
                    </Alert>
                  )}
                  
                  {siretValid && (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        SIRET validé avec succès
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Section 2 : Informations Entreprise */}
              {siretValid && companyData && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-semibold">2. Informations Entreprise</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Raison sociale</Label>
                      <Input value={companyData.legalName} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Date de création</Label>
                      <Input value={companyData.creationDate} disabled />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label>Adresse du siège</Label>
                      <Input value={companyData.address} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Forme juridique</Label>
                      <Input value={companyData.legalForm} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Site web de l'entreprise *</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://www.votre-entreprise.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 3 : Vos Informations */}
              {siretValid && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-semibold">3. Vos Informations</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">Prénom *</Label>
                      <Input
                        id="firstname"
                        type="text"
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Nom *</Label>
                      <Input
                        id="lastname"
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="jobTitle">Fonction dans l'entreprise *</Label>
                      <Select value={jobTitle} onValueChange={setJobTitle} required>
                        <SelectTrigger id="jobTitle">
                          <SelectValue placeholder="Sélectionnez votre fonction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dirigeant">Dirigeant / Gérant</SelectItem>
                          <SelectItem value="directeur_marketing">Directeur Marketing</SelectItem>
                          <SelectItem value="responsable_communication">Responsable Communication</SelectItem>
                          <SelectItem value="responsable_commercial">Responsable Commercial</SelectItem>
                          <SelectItem value="consultant">Consultant externe</SelectItem>
                          <SelectItem value="autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4 : Contact Professionnel */}
              {siretValid && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-semibold">4. Contact Professionnel (Optionnel mais Recommandé)</h3>
                  
                  <Alert>
                    <AlertDescription>
                      💡 Utilisez votre email professionnel (@votreentreprise.com) pour augmenter votre score de confiance et accéder à plus d'audits gratuits.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="professionalEmail">Email professionnel</Label>
                      <Input
                        id="professionalEmail"
                        type="email"
                        placeholder="prenom.nom@votre-entreprise.com"
                        value={professionalEmail}
                        onChange={(e) => setProfessionalEmail(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="professionalPhone">Téléphone professionnel</Label>
                      <Input
                        id="professionalPhone"
                        type="tel"
                        placeholder="+33 6 12 34 56 78"
                        value={professionalPhone}
                        onChange={(e) => setProfessionalPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section 5 : Document Justificatif */}
              {siretValid && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-semibold">5. Document Justificatif (Optionnel)</h3>
                  
                  <Alert>
                    <AlertDescription>
                      📄 Kbis, délégation de pouvoir, carte de visite... (optionnel mais recommandé pour augmenter votre score de confiance)
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document">Télécharger un document</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="document"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                        className="cursor-pointer"
                      />
                      {documentFile && (
                        <span className="text-sm text-muted-foreground">
                          {documentFile.name} ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formats acceptés : PDF, JPG, PNG | Taille max : 5 MB
                    </p>
                  </div>
                </div>
              )}

              {/* Section 6 : Certification */}
              {siretValid && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <h3 className="text-xl font-semibold">6. Certification</h3>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="certified"
                      checked={certified}
                      onCheckedChange={(checked) => setCertified(checked as boolean)}
                    />
                    <label
                      htmlFor="certified"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Je certifie être habilité à représenter cette entreprise et que les informations fournies sont exactes.
                    </label>
                  </div>
                </div>
              )}

              {/* Bouton de validation */}
              {siretValid && (
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!certified || !jobTitle || !firstname || !lastname || !website || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sauvegarde en cours...
                      </>
                    ) : (
                      "Valider et accéder à mon compte"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
