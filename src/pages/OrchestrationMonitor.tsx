import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock, ExternalLink, FileText } from "lucide-react";
import { toast } from "sonner";

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
  n8n_execution_id: string | null;
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
    window.open(`/audit-report?id=${reportId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Monitoring des Audits Approfondis</h1>
        <p className="text-muted-foreground">
          Suivi en temps réel des orchestrations multi-agents et génération de rapports enrichis
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
                        <div className="text-sm text-muted-foreground">{orch.current_phase}</div>
                      </div>
                    )}

                    {/* Error */}
                    {orch.error && (
                      <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                        <div className="font-medium text-sm text-destructive">Erreur</div>
                        <div className="text-sm text-destructive/80">{orch.error}</div>
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
                              <Badge className="ml-2 bg-yellow-500">Multi-Agent</Badge>
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Debug Info */}
                    {orch.n8n_execution_id && (
                      <div className="text-xs text-muted-foreground">
                        N8N Execution ID: {orch.n8n_execution_id}
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
  );
}