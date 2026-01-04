import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle2, AlertCircle, Rocket, Sparkles, Crown, Zap, Building2, Download, Eye, MessageSquare } from "lucide-react";

// Brief conversationnel enrichi basé sur l'échange avec Alex
const ENRICHED_BRIEF = {
  client_identity: {
    name: "Patrice Simion",
    role: "Créateur et fondateur",
    company: "iMotion Conseil"
  },
  strategic_objectives: [
    "Gagner en visibilité",
    "Transformer cette visibilité en clients",
    "Améliorer l'image de la société pour donner confiance",
    "Créer un cycle vertueux pour plus de clients abonnés"
  ],
  current_challenges: [
    "Difficulté à gagner en visibilité et crédibilité au démarrage",
    "Transformer la visibilité en chiffre d'affaires"
  ],
  competitive_landscape: {
    known_competitors: [],
    niche: "Accompagnement Marketing et Commercial avec IA",
    positioning: "Agence IA spécialisée B2B, peu de concurrence directe sur cette niche"
  },
  focus_areas: [
    "Stratégie de pricing",
    "Évaluation du modèle Freemium vs offre d'audits gratuits",
    "Pertinence de la conversion sans Freemium"
  ],
  key_questions: [
    "Est-ce que ma stratégie de pricing est la bonne par rapport au marché ?",
    "Est-ce que la démarche Freemium est pertinente ?",
    "Faut-il offrir 2 audits avant de convertir en forfait ?"
  ]
};

const SCENARIOS = [
  {
    id: 'freemium',
    name: 'Freemium - Discovery',
    tier: 'discovery',
    url: 'https://www.imotion-conseil.com',
    description: 'Analyse rapide avec sections cadenassées pour inciter à l\'upgrade',
    model: 'google/gemini-2.5-flash-lite',
    icon: Zap,
    color: 'bg-slate-500',
    expectedFeatures: ['Analyse de surface', 'SWOT basique', 'Sections Premium verrouillées'],
    briefIncluded: false
  },
  {
    id: 'pro',
    name: 'Pro - PME',
    tier: 'pro',
    url: 'https://www.imotion-conseil.com',
    description: 'Audit complet + brief conversationnel + recommandations actionnables',
    model: 'google/gemini-2.5-flash',
    icon: Sparkles,
    color: 'bg-blue-500',
    expectedFeatures: ['Brief Alex intégré', 'Analyse pricing', 'Concurrents identifiés', 'Plan d\'action 6 mois'],
    briefIncluded: true
  },
  {
    id: 'agency',
    name: 'Agency - Conseil Premium',
    tier: 'agency',
    url: 'https://www.imotion-conseil.com',
    description: 'Dream Team IA + brief enrichi + benchmarks sectoriels',
    model: 'openai/gpt-5',
    icon: Crown,
    color: 'bg-purple-500',
    expectedFeatures: ['Brief Alex complet', 'Analyse pricing approfondie', '3 scénarios stratégiques', 'Marque Blanche'],
    briefIncluded: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise - Transformation',
    tier: 'enterprise',
    url: 'https://www.imotion-conseil.com',
    description: 'Analyse McKinsey-level + roadmap transformation + ROI détaillé',
    model: 'openai/gpt-5',
    icon: Building2,
    color: 'bg-amber-500',
    expectedFeatures: ['Brief Alex + Deep Research', 'Analyse marché complète', 'Roadmap 12-36 mois', 'ROI quantifié', 'Benchmark international'],
    briefIncluded: true
  }
];

export default function TestTieredCampaign() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);
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

      console.log("🚀 Lancement campagne enrichie pour:", user.email);
      console.log("📋 Brief conversationnel inclus:", ENRICHED_BRIEF);

      const { data, error } = await supabase.functions.invoke('test-tiered-campaign', {
        body: { 
          recipient_email: user.email,
          run_all: runAll,
          scenario_id: scenarioId,
          enriched_brief: ENRICHED_BRIEF, // Inclure le brief enrichi
          use_imotion_url: true // Utiliser imotion-conseil.com pour tous
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log("📊 Résultats:", data);
      setResults(data);
      
      // Récupérer les rapports sauvegardés pour visualisation
      if (data.results) {
        const reportIds = data.results.filter((r: any) => r.report_id).map((r: any) => r.report_id);
        if (reportIds.length > 0) {
          const { data: reports } = await supabase.from('audit_reports')
            .select('*')
            .in('id', reportIds);
          setSavedReports(reports || []);
        }
      }

      toast({
        title: "✅ Campagne exécutée !",
        description: `${data.summary?.success || 0} rapport(s) généré(s) et envoyé(s) à ${user.email}`,
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

  const downloadReport = (report: any) => {
    const blob = new Blob([report.html || ''], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${report.report_type || 'audit'}-${report.id.slice(0,8)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const viewReport = (report: any) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(report.html || '<p>Aucun contenu HTML</p>');
      newWindow.document.close();
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
            Testez les 4 niveaux d'audit (Freemium, Pro, Agency, Enterprise) avec votre brief conversationnel Alex
          </p>
        </div>

        {/* Brief enrichi - Affichage */}
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <MessageSquare className="h-5 w-5" />
              Brief Conversationnel Alex
            </CardTitle>
            <CardDescription>Contexte enrichi basé sur votre échange avec Alex</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">👤 Client</p>
                <p className="text-amber-700 dark:text-amber-300">{ENRICHED_BRIEF.client_identity.name} - {ENRICHED_BRIEF.client_identity.role}</p>
              </div>
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">🎯 Objectifs</p>
                <ul className="text-amber-700 dark:text-amber-300 list-disc list-inside">
                  {ENRICHED_BRIEF.strategic_objectives.slice(0, 2).map((obj, i) => (
                    <li key={i} className="truncate">{obj}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">💰 Focus Pricing</p>
                <ul className="text-amber-700 dark:text-amber-300 list-disc list-inside">
                  {ENRICHED_BRIEF.key_questions.slice(0, 2).map((q, i) => (
                    <li key={i} className="truncate">{q}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">⚡ Défis</p>
                <ul className="text-amber-700 dark:text-amber-300 list-disc list-inside">
                  {ENRICHED_BRIEF.current_challenges.map((c, i) => (
                    <li key={i} className="truncate">{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bouton principal */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Lancer les 4 tests simultanément</h2>
                <p className="text-muted-foreground">Générez et comparez les 4 niveaux d'audit avec votre brief Alex</p>
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
                    Lancer les 4 audits
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scénarios individuels */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Rapports générés - Visualisation et téléchargement */}
        {savedReports.length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-600" />
                Rapports Générés
              </CardTitle>
              <CardDescription>Visualisez et téléchargez les rapports générés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {savedReports.map((report) => (
                  <div key={report.id} className="p-4 bg-muted/30 rounded-lg border">
                    <p className="font-medium text-sm mb-2 truncate">{report.title}</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Type: {report.report_type || 'audit'}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => viewReport(report)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button size="sm" variant="default" onClick={() => downloadReport(report)}>
                        <Download className="h-4 w-4 mr-1" />
                        .html
                      </Button>
                    </div>
                  </div>
                ))}
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
                    <th className="text-center py-3 px-2">Agency</th>
                    <th className="text-center py-3 px-2">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2 px-2">Brief Alex intégré</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">✅</td>
                    <td className="text-center">✅</td>
                    <td className="text-center">✅+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Sections verrouillées</td>
                    <td className="text-center">✅ Oui</td>
                    <td className="text-center">❌ Non</td>
                    <td className="text-center">❌ Non</td>
                    <td className="text-center">❌ Non</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Analyse Pricing</td>
                    <td className="text-center">Surface</td>
                    <td className="text-center">Complète</td>
                    <td className="text-center">Benchmark</td>
                    <td className="text-center">Stratégique</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Profondeur d'analyse</td>
                    <td className="text-center">Surface</td>
                    <td className="text-center">Complète</td>
                    <td className="text-center">Expert</td>
                    <td className="text-center">McKinsey</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Scénarios stratégiques</td>
                    <td className="text-center">1</td>
                    <td className="text-center">2</td>
                    <td className="text-center">3</td>
                    <td className="text-center">5+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Score attendu</td>
                    <td className="text-center">~65/100</td>
                    <td className="text-center">~78/100</td>
                    <td className="text-center">~88/100</td>
                    <td className="text-center">~95/100</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2">Roadmap</td>
                    <td className="text-center">❌</td>
                    <td className="text-center">6 mois</td>
                    <td className="text-center">12 mois</td>
                    <td className="text-center">36 mois</td>
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
