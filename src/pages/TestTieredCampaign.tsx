import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle2, AlertCircle, Rocket, Sparkles, Crown, Zap } from "lucide-react";

const SCENARIOS = [
  {
    id: 'freemium',
    name: 'Freemium - TPE Locale',
    tier: 'discovery',
    url: 'https://www.boulangerie-delalune.fr',
    description: 'Analyse rapide avec sections cadenassées pour inciter à l\'upgrade',
    model: 'gemini-2.0-flash',
    icon: Zap,
    color: 'bg-slate-500',
    expectedFeatures: ['Analyse de surface', 'SWOT basique', 'Sections Premium verrouillées']
  },
  {
    id: 'pro',
    name: 'Pro - PME SaaS',
    tier: 'pro',
    url: 'https://www.qonto.com',
    description: 'Audit complet avec GPT-5, recommandations actionnables',
    model: 'openai/gpt-5',
    icon: Sparkles,
    color: 'bg-blue-500',
    expectedFeatures: ['Analyse complète', 'Concurrents identifiés', 'Plan d\'action 6 mois']
  },
  {
    id: 'ultra_premium',
    name: 'Ultra-Premium - Grand Compte',
    tier: 'agency',
    url: 'https://www.saint-gobain.com',
    description: 'Dream Team IA + données enrichies + Marque Blanche',
    model: 'openai/gpt-5 (DeepThink)',
    icon: Crown,
    color: 'bg-purple-500',
    expectedFeatures: ['Analyse 360°', 'Benchmarks sectoriels', '3 scénarios stratégiques', 'Marque Blanche']
  }
];

export default function TestTieredCampaign() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const launchCampaign = async (runAll: boolean, scenarioId?: string) => {
    setLoading(runAll ? 'all' : scenarioId || null);
    setResults(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.email) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour lancer la campagne",
        });
        return;
      }

      console.log("🚀 Lancement campagne pour:", user.email);

      const { data, error } = await supabase.functions.invoke('test-tiered-campaign', {
        body: { 
          recipient_email: user.email,
          run_all: runAll,
          scenario_id: scenarioId
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("📊 Résultats:", data);
      setResults(data);

      toast({
        title: "✅ Campagne exécutée !",
        description: `${data.summary?.success || 0} rapport(s) envoyé(s) à ${user.email}`,
      });

    } catch (error: any) {
      console.error("❌ Erreur:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🎯 Campagne Test Multi-Niveaux
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Validez la gradation de qualité entre les offres Freemium, Pro et Ultra-Premium
          </p>
        </div>

        {/* Bouton principal */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Lancer les 3 tests simultanément</h2>
                <p className="text-muted-foreground">Recevez les 3 rapports sur votre email pour comparaison</p>
              </div>
              <Button 
                size="lg" 
                onClick={() => launchCampaign(true)}
                disabled={loading !== null}
                className="min-w-[200px]"
              >
                {loading === 'all' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Lancer les 3 audits
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scénarios individuels */}
        <div className="grid md:grid-cols-3 gap-6">
          {SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            const isLoading = loading === scenario.id;
            const result = results?.results?.find((r: any) => r.scenario === scenario.id);

            return (
              <Card key={scenario.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${scenario.color}`} />
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${scenario.color} text-white border-0`}>
                      {scenario.tier.toUpperCase()}
                    </Badge>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg mt-2">{scenario.name}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">URL de test:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded break-all">
                      {scenario.url}
                    </code>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium mb-2">Modèle IA:</p>
                    <Badge variant="secondary">{scenario.model}</Badge>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium mb-2">Fonctionnalités attendues:</p>
                    <ul className="space-y-1">
                      {scenario.expectedFeatures.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {result && (
                    <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 dark:bg-green-950/20' : 'bg-red-50 dark:bg-red-950/20'}`}>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                          {result.success ? 'Email envoyé ✓' : result.error}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => launchCampaign(false, scenario.id)}
                    disabled={loading !== null}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Génération...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Tester ce niveau
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Résultats globaux */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Résultat de la campagne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold">{results.scenarios_run}</div>
                  <div className="text-sm text-muted-foreground">Scénarios lancés</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{results.summary?.success || 0}</div>
                  <div className="text-sm text-muted-foreground">Succès</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{results.summary?.failed || 0}</div>
                  <div className="text-sm text-muted-foreground">Échecs</div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📧 Les rapports ont été envoyés à <strong>{results.recipient}</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vérifiez votre boîte mail pour comparer la qualité entre les niveaux.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grille de validation */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Grille de Validation</CardTitle>
            <CardDescription>Critères à vérifier pour chaque niveau reçu par email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Critère</th>
                    <th className="text-center py-3 px-2">Freemium</th>
                    <th className="text-center py-3 px-2">Pro</th>
                    <th className="text-center py-3 px-2">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-2">Branding personnalisé</td>
                    <td className="text-center">IMOTION Rouge</td>
                    <td className="text-center">IMOTION Rouge</td>
                    <td className="text-center">Agency Corp Bleu</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Sections verrouillées</td>
                    <td className="text-center">✅ Oui</td>
                    <td className="text-center">❌ Non</td>
                    <td className="text-center">❌ Non</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Profondeur d'analyse</td>
                    <td className="text-center">Surface</td>
                    <td className="text-center">Complète</td>
                    <td className="text-center">Expert</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Scénarios stratégiques</td>
                    <td className="text-center">1</td>
                    <td className="text-center">2</td>
                    <td className="text-center">3+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Score attendu</td>
                    <td className="text-center">~65/100</td>
                    <td className="text-center">~82/100</td>
                    <td className="text-center">~91/100</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
