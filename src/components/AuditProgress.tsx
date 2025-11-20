import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, AlertCircle, Terminal } from "lucide-react";
import { AuditReportView } from "./AuditReportView";

interface AuditLog {
  agent: string;
  message?: string;
  status?: string;
  timestamp: string;
  target?: string;
}

interface AuditProgressProps {
  auditId: string;
}

const AGENT_CONFIG: Record<string, { name: string; color: string }> = {
  A01: { name: "Orchestrator", color: "hsl(var(--primary))" },
  A02: { name: "Web Scraper", color: "hsl(var(--accent))" },
  A03: { name: "PESTEL Analysis", color: "hsl(142 76% 36%)" },
  A04: { name: "Porter Analysis", color: "hsl(262 83% 58%)" },
};

const PHASE_MAP: Record<string, number> = {
  PHASE_0_INIT: 0,
  PHASE_1_MARKET_STUDY: 25,
  PHASE_2_AUDITS: 50,
  PHASE_3_ANALYSIS: 75,
  PHASE_4_SYNTHESIS: 100,
};

export const AuditProgress = ({ auditId }: AuditProgressProps) => {
  const [currentPhase, setCurrentPhase] = useState<string>("PHASE_0_INIT");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("pending");
  const [reportData, setReportData] = useState<any>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auditId) return;

    // Initial fetch
    fetchAuditData();

    // CORRECTION: Polling automatique toutes les 5 secondes
    const pollingInterval = setInterval(() => {
      if (status !== 'completed' && status !== 'failed') {
        console.log('🔄 Polling audit status...');
        fetchAuditData();
      }
    }, 5000); // 5 secondes

    // CORRECTION: Timeout de sécurité (5 minutes)
    const timeoutId = setTimeout(() => {
      if (status !== 'completed' && status !== 'failed') {
        console.error('⏱️ Timeout: Audit took too long');
        setStatus('error');
      }
    }, 300000); // 5 minutes

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`audit-${auditId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pre_audits',
          filter: `id=eq.${auditId}`
        },
        (payload) => {
          console.log('🔄 Realtime update:', payload);
          const newData = payload.new as any;
          
          if (newData.current_phase) {
            setCurrentPhase(newData.current_phase);
            setProgress(PHASE_MAP[newData.current_phase] || 0);
          }
          
          if (newData.audit_logs) {
            setLogs(newData.audit_logs as AuditLog[]);
          }
          
          if (newData.status) {
            setStatus(newData.status);
            
            // Si le statut passe à completed, charger le rapport
            if (newData.status === 'completed' && newData.consolidated) {
              setReportData(newData.consolidated);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollingInterval);
      clearTimeout(timeoutId);
    };
  }, [auditId]);

  useEffect(() => {
    // Auto-scroll terminal to bottom
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const fetchAuditData = async () => {
    const { data, error } = await supabase
      .from('pre_audits')
      .select('current_phase, audit_logs, status, consolidated')
      .eq('id', auditId)
      .single();

    if (error) {
      console.error('Error fetching audit:', error);
      return;
    }

    if (data) {
      setCurrentPhase(data.current_phase || 'PHASE_0_INIT');
      setProgress(PHASE_MAP[data.current_phase || 'PHASE_0_INIT'] || 0);
      setLogs(Array.isArray(data.audit_logs) ? (data.audit_logs as unknown as AuditLog[]) : []);
      setStatus(data.status || 'pending');
      
      // Si statut completed et qu'on a des données consolidées, on les charge
      if (data.status === 'completed' && data.consolidated) {
        setReportData(data.consolidated);
      }
    }
  };

  const getAgentStatus = (agentId: string): 'running' | 'pending' | 'completed' => {
    const agentLog = logs.find(log => log.agent === agentId);
    if (!agentLog) return 'pending';
    if (agentLog.status === 'running') return 'running';
    if (agentLog.status === 'completed') return 'completed';
    return 'pending';
  };

  // Si le rapport est disponible, afficher le composant AuditReportView
  if (status === 'completed' && reportData) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <div className="flex items-center gap-3 text-primary">
            <CheckCircle2 className="h-8 w-8" />
            <div>
              <h3 className="text-xl font-bold">✅ Audit Terminé avec Succès!</h3>
              <p className="text-sm text-muted-foreground">Votre rapport détaillé est maintenant disponible ci-dessous.</p>
            </div>
          </div>
        </Card>
        
        <AuditReportView report={reportData} />
      </div>
    );
  }

  return (
    <Card className="p-6 space-y-6 bg-gradient-to-br from-background to-muted/20">
      {/* Header with Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">🚀 Mission Control</h3>
          <span className="text-sm text-muted-foreground">
            {currentPhase.replace('PHASE_', 'Phase ').replace('_', ' ')}
          </span>
        </div>
        <Progress value={progress} className="h-3 bg-muted" />
        <p className="text-sm text-muted-foreground mt-2">{progress}% complété</p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(AGENT_CONFIG).map(([id, config]) => {
          const agentStatus = getAgentStatus(id);
          return (
            <div
              key={id}
              className={`p-4 rounded-lg border-2 transition-all ${
                agentStatus === 'running'
                  ? 'border-primary bg-primary/10 animate-pulse'
                  : agentStatus === 'completed'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-muted bg-muted/5 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold" style={{ color: config.color }}>
                  {id}
                </span>
                {agentStatus === 'running' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                {agentStatus === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                {agentStatus === 'pending' && <div className="h-4 w-4 rounded-full border-2 border-muted" />}
              </div>
              <p className="text-xs text-muted-foreground">{config.name}</p>
            </div>
          );
        })}
      </div>

      {/* Terminal Log */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Terminal className="h-4 w-4" />
          <span>System Logs</span>
        </div>
        <div
          ref={terminalRef}
          className="bg-black/95 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs text-green-400 space-y-1"
        >
          {logs.length === 0 ? (
            <div className="text-muted-foreground/50">Waiting for agents...</div>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-muted-foreground/70">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="text-primary font-bold">{log.agent}:</span>
                <span className="text-green-400">
                  {log.message || log.status || 'Processing...'}
                  {log.target && ` → ${log.target}`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status Footer */}
      {(status === 'error' || status === 'failed') && (
        <div className="flex items-center gap-3 text-destructive p-4 rounded-lg bg-destructive/10 border border-destructive/30">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h4 className="font-semibold">❌ Erreur détectée</h4>
            <p className="text-sm">Un problème est survenu lors de l'audit. Veuillez réessayer ou contacter le support.</p>
            {logs.length > 0 && logs[logs.length - 1].message && (
              <p className="text-xs mt-2 font-mono">{logs[logs.length - 1].message}</p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
