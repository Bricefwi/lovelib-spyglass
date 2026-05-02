import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle2, AlertCircle, Rocket, Sparkles, Crown, Zap, Building2, RefreshCw } from "lucide-react";
import { ClientHeader } from "@/components/ClientHeader";
import { Footer } from "@/components/Footer";

interface TestResult {
  plan: string;
  status: 'pending' | 'running' | 'success' | 'error';
  auditId?: string;
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

const PLANS = [
  {
    id: 'freemium',
    name: 'Freemium',
    tier: 'discovery',
    url: 'https://www.boulangerie-test.fr',
    description: '7 agents IA, Claude Sonnet 4.5 + Gemini Flash, 15-20 pages',
    icon: Zap,
    color: 'bg-slate-500',
    expectedAgents: 7,
    expectedPages: '15-20',
    expectedInfographics: 3
  },
  {
    id: 'pro',
    name: 'Pro (49€)',
    tier: 'pro',
    url: 'https://www.qonto.com',
    description: '12 agents IA, Claude Sonnet 4.5 + GPT-5 + Perplexity Pro, 40-60 pages',
    icon: Sparkles,
    color: 'bg-blue-500',
    expectedAgents: 12,
    expectedPages: '40-60',
    expectedInfographics: 8
  },
  {
    id: 'agency',
    name: 'Agency (199€)',
    tier: 'agency',
    url: 'https://www.saint-gobain.com',
    description: '15 agents IA, Claude Opus 4.5 + GPT-5.2 + Perplexity Deep, 80-100 pages',
    icon: Crown,
    color: 'bg-purple-500',
    expectedAgents: 15,
    expectedPages: '80-100',
    expectedInfographics: 15
  },
  {
    id: 'enterprise',
    name: 'Enterprise (499€)',
    tier: 'enterprise',
    url: 'https://www.lvmh.com',
    description: '17 agents IA, Claude Opus 4.5 + GPT-5.2 Pro + Perplexity Deep Research, 120-300 pages',
    icon: Building2,
    color: 'bg-amber-500',
    expectedAgents: 17,
    expectedPages: '120-300',
    expectedInfographics: 25
  }
];

export default function TestOrchestratorV6() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunningAll, setIsRunningAll] = useState(false);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const launchAudit = async (plan: typeof PLANS[0]) => {
    setResults(prev => ({
      ...prev,
      [plan.id]: { plan: plan.id, status: 'running', startTime: Date.now() }
    }));
    
    addLog(`🚀 Démarrage audit ${plan.name} (${plan.tier}) - URL: ${plan.url}`);

    try {
      // 1. Récupérer l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // 2. Créer le pre_audit avec le tier spécifique
      const { data: preAudit, error: insertError } = await supabase
        .from('pre_audits')
        .insert({
          url: plan.url,
          status: 'pending',
          created_by: user.id,
          current_phase: 'PHASE_0_INIT',
          ai_tier: plan.tier
        })
        .select()
        .single();

      if (insertError) throw insertError;

      addLog(`📝 Pre-audit créé: ${preAudit.id} (tier: ${plan.tier})`);

      // 3. Appeler l'orchestrateur v8 (Premium)
      addLog(`⚡ Appel orchestrate-multi-agent-v8...`);
      
      const { data: orchestrationResult, error: functionError } = await supabase.functions.invoke(
        'orchestrate-multi-agent-v8',
        {
          body: {
            audit_id: preAudit.id,
            action: 'start',
            tier: plan.tier
          }
        }
      );

      if (functionError) throw functionError;

      addLog(`✅ ${plan.name}: Orchestration terminée`);
      console.log(`Résultat ${plan.name}:`, orchestrationResult);

      setResults(prev => ({
        ...prev,
        [plan.id]: {
          plan: plan.id,
          status: 'success',
          auditId: preAudit.id,
          result: orchestrationResult,
          endTime: Date.now(),
          startTime: prev[plan.id]?.startTime
        }
      }));

      toast.success(`${plan.name}: Audit terminé ✓`);

    } catch (err: any) {
      console.error(`Erreur ${plan.name}:`, err);
      addLog(`❌ ${plan.name}: ${err.message}`);
      
      setResults(prev => ({
        ...prev,
        [plan.id]: {
          plan: plan.id,
          status: 'error',
          error: err.message,
          endTime: Date.now(),
          startTime: prev[plan.id]?.startTime
        }
      }));

      toast.error(`${plan.name}: Erreur - ${err.message}`);
    }
  };

  const launchAllTests = async () => {
    setIsRunningAll(true);
    setLogs([]);
    setResults({});
    
    addLog('🎯 Démarrage des tests pour les 4 plans...');

    for (const plan of PLANS) {
      await launchAudit(plan);
      // Petit délai entre chaque test
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    addLog('🏁 Tous les tests sont terminés !');
    setIsRunningAll(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const getDuration = (result: TestResult) => {
    if (result.startTime && result.endTime) {
      return `${((result.endTime - result.startTime) / 1000).toFixed(1)}s`;
    }
    return '-';
  };

  return (
    <div className="min-h-screen bg-background">
      <ClientHeader />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🧪 Test Orchestrateur V8 Premium
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Validation du système multi-agents 17 agents avec modèles premium
          </p>
        </div>

        {/* Bouton principal */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Lancer les 4 tests séquentiellement</h2>
                <p className="text-muted-foreground">Freemium → Pro → Agency → Enterprise</p>
              </div>
              <Button 
                size="lg" 
                onClick={launchAllTests}
                disabled={isRunningAll}
                className="min-w-[200px]"
              >
                {isRunningAll ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Tests en cours...
                  </>
                ) : (
                  <>
                    <Rocket className="mr-2 h-5 w-5" />
                    Lancer les 4 tests
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grille des plans */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const result = results[plan.id];
            const isLoading = result?.status === 'running';

            return (
              <Card key={plan.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${plan.color}`} />
                
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${plan.color} text-white border-0`}>
                      {plan.tier.toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {result && getStatusIcon(result.status)}
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-2">{plan.name}</CardTitle>
                  <CardDescription className="text-xs">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>👥 <strong>{plan.expectedAgents}</strong> agents IA</p>
                    <p>📄 <strong>{plan.expectedPages}</strong> pages</p>
                    <p>📊 <strong>{plan.expectedInfographics}</strong> infographies</p>
                  </div>

                  {result && result.status === 'success' && (
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20 text-xs">
                      <p className="text-green-700 dark:text-green-400">✓ Durée: {getDuration(result)}</p>
                      {result.result?.agents_executed && (
                        <p className="text-green-600">Agents: {result.result.agents_executed}</p>
                      )}
                    </div>
                  )}

                  {result && result.status === 'error' && (
                    <div className="p-2 rounded-lg bg-primary/5 dark:bg-red-950/20 text-xs">
                      <p className="text-destructive dark:text-red-400 truncate">{result.error}</p>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => launchAudit(plan)}
                    disabled={isLoading || isRunningAll}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        En cours...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Tester
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Console de logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">📋 Console de Logs</span>
              {logs.length > 0 && (
                <Badge variant="secondary">{logs.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-xs max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-slate-500">Les logs apparaîtront ici...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="py-0.5">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tableau récapitulatif */}
        {Object.keys(results).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>📊 Résultats Détaillés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Plan</th>
                      <th className="text-center py-3 px-2">Status</th>
                      <th className="text-center py-3 px-2">Durée</th>
                      <th className="text-center py-3 px-2">Audit ID</th>
                      <th className="text-left py-3 px-2">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {PLANS.map(plan => {
                      const result = results[plan.id];
                      if (!result) return null;
                      
                      return (
                        <tr key={plan.id}>
                          <td className="py-2 px-2 font-medium">{plan.name}</td>
                          <td className="text-center py-2 px-2">
                            <Badge variant={
                              result.status === 'success' ? 'default' : 
                              result.status === 'error' ? 'destructive' : 'secondary'
                            }>
                              {result.status}
                            </Badge>
                          </td>
                          <td className="text-center py-2 px-2">{getDuration(result)}</td>
                          <td className="text-center py-2 px-2">
                            <code className="text-xs bg-muted px-1 rounded">
                              {result.auditId?.slice(0, 8) || '-'}
                            </code>
                          </td>
                          <td className="py-2 px-2 text-xs text-muted-foreground">
                            {result.result?.message || result.error || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
