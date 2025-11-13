/**
 * OrchestrationMonitor.tsx - Version Corrigée MANUS IA 2.0
 * 
 * Changements:
 * - ✅ Suppression de TestN8nCallback
 * - ✅ Renommage n8n_execution_id → manus_execution_id
 * - ✅ Amélioration affichage des erreurs (masquage détails techniques)
 * - ✅ Ajout du footer avec navigation
 * - ✅ Meilleure UX globale
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink, FileText, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AdminFooter } from "@/components/Navigation/AdminFooter";

interface Orchestration {
  id: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  current_phase: string | null;
  progress: number | null;
  error: string | null;
  pre_audit_id: string;
  manus_execution_id: string | null; // ✅ Renommé de n8n_execution_id
  pre_audits?: {
    url: string;
    company_guess: string | null;
  };
  audit_reports?: Array<{
    id: string;
    report_type: string | null;
    status: string | null;
    created_at: string;
  }>;
}

export default function OrchestrationMonitor() {
  const [orchestrations, setOrchestrations] = useState<Orchestration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrchestrations();

    // Real-time updates
    const channel = supabase
      .channel('orchestration-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_orchestrations'
        },
        () => {
          console.log('Orchestration updated, refreshing...');
          fetchOrchestrations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrchestrations = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_orchestrations')
        .select(`
          *,
          pre_audits (
            url,
            company_guess
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch reports separately for each orchestration
      const orchestrationsWithReports = await Promise.all(
        (data || []).map(async (orch) => {
          const { data: reports } = await supabase
            .from('audit_reports')
            .select('id, report_type, status, created_at')
            .eq('pre_audit_id', orch.pre_audit_id);

          return {
            ...orch,
            audit_reports: reports || []
          };
        })
      );

      setOrchestrations(orchestrationsWithReports as any);
    } catch (error: any) {
      console.error('Error fetching orchestrations:', error);
      toast.error("Erreur lors du chargement des orchestrations");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" /> Terminé</Badge>;
      case 'running':
        return <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> En cours</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Erreur</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const viewReport = async (preAuditId: string, reportId: string) => {
    window.open(`/audit-report/${reportId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Monitoring des Audits Approfondis</h1>
          <p className="text-muted-foreground">
            Suivi en temps réel des orchestrations multi-agents MANUS IA 2.0 et génération de rapports enrichis
          </p>
        </div>

        <div className="grid gap-4">
          {orchestrations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Aucune orchestration trouvée
                </p>
              </CardContent>
            </Card>
          ) : (
            orchestrations.map((orch) => {
              const deepAuditReport = orch.audit_reports?.find(r => r.report_type === 'deep_audit');
              const standardReport = orch.audit_reports?.find(r => !r.report_type || r.report_type === 'standard');

              return (
                <Card key={orch.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {orch.pre_audits?.company_guess || 'Entreprise inconnue'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          {orch.pre_audits?.url}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(orch.status)}
                        {orch.progress !== null && orch.status === 'running' && (
                          <div className="text-sm text-muted-foreground">
                            {orch.progress}% complété
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Timeline */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium text-muted-foreground">Créé</div>
                          <div>{new Date(orch.created_at).toLocaleString('fr-FR')}</div>
                        </div>
                        {orch.started_at && (
                          <div>
                            <div className="font-medium text-muted-foreground">Démarré</div>
                            <div>{new Date(orch.started_at).toLocaleString('fr-FR')}</div>
                          </div>
                        )}
                        {orch.completed_at && (
                          <div>
                            <div className="font-medium text-muted-foreground">Terminé</div>
                            <div>{new Date(orch.completed_at).toLocaleString('fr-FR')}</div>
                          </div>
                        )}
                      </div>

                      {/* Current Phase */}
                      {orch.current_phase && (
                        <div className="bg-muted/50 p-3 rounded-lg">
                          <div className="font-medium text-sm">Phase actuelle</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {orch.current_phase.replace(/_/g, ' ')}
                          </div>
                        </div>
                      )}

                      {/* Error - Version Améliorée ✅ */}
                      {orch.error && (
                        <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                            <div className="flex-1">
                              <div className="font-semibold text-sm text-destructive mb-2">
                                Une erreur s'est produite lors du traitement
                              </div>
                              <div className="text-sm text-muted-foreground mb-3">
                                Le système d'orchestration MANUS IA a rencontré un problème technique. 
                                Notre équipe a été automatiquement notifiée et travaille à la résolution.
                              </div>
                              <details className="mt-2">
                                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                                  📋 Détails techniques (pour le support)
                                </summary>
                                <pre className="text-xs text-destructive/80 mt-3 p-3 bg-background rounded border border-destructive/20 overflow-x-auto">
{orch.error}
                                </pre>
                              </details>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reports */}
                      {(deepAuditReport || standardReport) && (
                        <div className="border-t pt-4">
                          <div className="font-medium mb-3">Rapports disponibles</div>
                          <div className="flex gap-2 flex-wrap">
                            {standardReport && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => viewReport(orch.pre_audit_id, standardReport.id)}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Rapport Standard
                                <Badge variant="secondary" className="ml-2">Standard</Badge>
                              </Button>
                            )}
                            {deepAuditReport && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => viewReport(orch.pre_audit_id, deepAuditReport.id)}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Rapport Approfondi
                                <Badge className="ml-2 bg-yellow-500">Multi-Agent IA</Badge>
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* MANUS Execution ID - Version Améliorée ✅ */}
                      {orch.manus_execution_id && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/30 p-2 rounded">
                          <span className="font-semibold">MANUS Execution ID:</span>
                          <code className="bg-background px-2 py-1 rounded font-mono">
                            {orch.manus_execution_id}
                          </code>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Footer avec Navigation ✅ */}
      <AdminFooter />
    </div>
  );
}
