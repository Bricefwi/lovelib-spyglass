import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, AlertCircle, Upload, ArrowLeft, Home } from "lucide-react";
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
  
  // États formulaire enrichis
  const [website, setWebsite] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [professionalEmail, setProfessionalEmail] = useState("");
  const [professionalPhone, setProfessionalPhone] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [certified, setCertified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Nouveaux champs pour l'IA
  const [employeeRange, setEmployeeRange] = useState("");
  const [targetType, setTargetType] = useState("");
  const [fullAddress, setFullAddress] = useState("");

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
        .select('company_siret, company_legal_name, firstname, lastname')
        .eq('user_id', user.id)
        .single();
      
      // Si l'entreprise est déjà validée, rediriger vers le dashboard
      if (profile?.company_siret && profile?.company_legal_name) {
        toast({
          title: "Profil déjà complété",
          description: "Vous pouvez lancer vos audits.",
        });
        navigate('/dashboard');
        return;
      }
      
      // Pré-remplir les champs si disponibles
      if (profile?.firstname) setFirstname(profile.firstname);
      if (profile?.lastname) setLastname(profile.lastname);
    };
    
    checkOnboarding();
  }, [navigate, toast]);

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
        
        // Pré-remplir l'adresse si disponible
        if (data.address) {
          setFullAddress(data.address);
        }
        
        // Pré-remplir la tranche d'effectif si disponible
        if (data.employees) {
          const emp = parseInt(data.employees);
          if (emp <= 10) setEmployeeRange("1-10");
          else if (emp <= 50) setEmployeeRange("11-50");
          else if (emp <= 200) setEmployeeRange("51-200");
          else setEmployeeRange("200+");
        }
        
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

      // Créer ou mettre à jour l'entreprise dans la table companies
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .upsert({
          siret: siret,
          siren: companyData.siren,
          name: companyData.legalName,
          address: fullAddress || companyData.address,
          city: companyData.city || 'Non renseigné',
          country: 'France',
          website: website,
          industry: targetType,
          employee_count: employeeRange ? parseInt(employeeRange.split('-')[0]) : null,
          size_estimate: employeeRange,
        }, { onConflict: 'siret' })
        .select()
        .single();

      if (companyError) {
        console.error('Error creating company:', companyError);
        // Continuer même si l'entreprise existe déjà
      }

      // Sauvegarder dans profiles avec toutes les infos entreprise
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          firstname,
          lastname,
          job_title: jobTitle,
          professional_email: professionalEmail || null,
          professional_phone: professionalPhone || null,
          verification_document_url: documentUrl,
          verification_method: 'api_recherche_entreprise',
          company_siret: siret,
          company_siren: companyData.siren,
          company_legal_name: companyData.legalName,
          company_legal_form: companyData.legalForm,
          company_address: fullAddress || companyData.address,
          company_creation_date: companyData.creationDate,
          company_website: website,
          company_id: company?.id || null,
          gdpr_consent: certified,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast({
        title: "✅ Profil entreprise complété !",
        description: "Vous pouvez maintenant lancer vos audits stratégiques.",
      });

      navigate('/dashboard');
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
        {/* Boutons de navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Accueil
          </Button>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Identification de votre entreprise</CardTitle>
            <CardDescription>
              Ces informations nous permettent de personnaliser votre audit et de garantir la qualité des analyses IA.
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
                      placeholder="14 chiffres (ex: 85780250800047)"
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
                        SIRET validé avec succès - Entreprise identifiée
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
                      <Input value={companyData.legalName} disabled className="bg-muted" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Date de création</Label>
                      <Input value={companyData.creationDate} disabled className="bg-muted" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Forme juridique</Label>
                      <Input value={companyData.legalForm} disabled className="bg-muted" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="employeeRange">Effectif (Tranche salariale) *</Label>
                      <Select value={employeeRange} onValueChange={setEmployeeRange} required>
                        <SelectTrigger id="employeeRange">
                          <SelectValue placeholder="Sélectionnez une tranche" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1 à 10 salariés</SelectItem>
                          <SelectItem value="11-50">11 à 50 salariés</SelectItem>
                          <SelectItem value="51-200">51 à 200 salariés</SelectItem>
                          <SelectItem value="200+">Plus de 200 salariés</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="targetType">Type de Cible *</Label>
                      <Select value={targetType} onValueChange={setTargetType} required>
                        <SelectTrigger id="targetType">
                          <SelectValue placeholder="B2B, B2C, B2B2C..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="B2B">B2B (Entreprises)</SelectItem>
                          <SelectItem value="B2C">B2C (Particuliers)</SelectItem>
                          <SelectItem value="B2B2C">B2B2C (Mixte)</SelectItem>
                          <SelectItem value="Marketplace">Marketplace</SelectItem>
                        </SelectContent>
                      </Select>
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
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fullAddress">Adresse complète du siège</Label>
                      <Textarea
                        id="fullAddress"
                        placeholder="Adresse, Code postal, Ville"
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        className="min-h-[80px]"
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
                      Je certifie être habilité à représenter cette entreprise et que les informations fournies sont exactes. J'accepte les CGU et la politique RGPD.
                    </label>
                  </div>
                </div>
              )}

              {/* Boutons d'action */}
              {siretValid && (
                <div className="pt-6 flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    size="lg"
                    disabled={!certified || !jobTitle || !firstname || !lastname || !website || !employeeRange || !targetType || submitting}
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
