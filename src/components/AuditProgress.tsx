import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface Phase {
  name: string;
  order: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  label: string;
  description: string;
  agents?: string[];
}

interface AuditProgressProps {
  orchestrationId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const PHASE_CONFIG: Record<string, { label: string; description: string; icon: string }> = {
  market_research: {
    label: "📊 Étude de Marché",
    description: "Analyse du marché, concurrence et tendances",
    icon: "📊"
  },
  conversational_audits: {
    label: "💬 Audits Conversationnels",
    description: "Audit marketing, commercial, technique et stratégique",
    icon: "💬"
  },
  specialized_analysis: {
    label: "🎯 Analyses Spécialisées",
    description: "SEO, contenu, UX et optimisation de conversion",
    icon: "🎯"
  },
  synthesis: {
    label: "📑 Synthèse & Vérification",
    description: "Consolidation des résultats et génération du rapport",
    icon: "📑"
  }
};

export const AuditProgress = ({ orchestrationId, onComplete, onError }: AuditProgressProps) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'running' | 'completed' | 'error'>('running');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!orchestrationId) return;

    // Initial fetch
    fetchOrchestrationStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`orchestration-${orchestrationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_orchestrations',
          filter: `id=eq.${orchestrationId}`
        },
        (payload) => {
          console.log('Orchestration update:', payload);
          fetchOrchestrationStatus();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_phases',
          filter: `orchestration_id=eq.${orchestrationId}`
        },
        (payload) => {
          console.log('Phase update:', payload);
          fetchOrchestrationStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orchestrationId]);

  const fetchOrchestrationStatus = async () => {
    try {
      const { data: orchestration, error: orchError } = await supabase
        .from('agent_orchestrations')
        .select('*')
        .eq('id', orchestrationId)
        .single();

      if (orchError) throw orchError;

      if (!orchestration) return;

      setCurrentPhase(orchestration.current_phase || '');
      setProgress(orchestration.progress || 0);
      setStatus(orchestration.status as 'running' | 'completed' | 'error');

      if (orchestration.error) {
        setError(orchestration.error);
        onError?.(orchestration.error);
      }

      if (orchestration.status === 'completed') {
        onComplete?.();
      }

      // Fetch phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('agent_phases')
        .select('*')
        .eq('orchestration_id', orchestrationId)
        .order('phase_order', { ascending: true });

      if (phasesError) throw phasesError;

      if (phasesData && phasesData.length > 0) {
        const formattedPhases = phasesData.map(phase => ({
          name: phase.phase_name,
          order: phase.phase_order,
          status: phase.status as 'pending' | 'running' | 'completed' | 'error',
          label: PHASE_CONFIG[phase.phase_name]?.label || phase.phase_name,
          description: PHASE_CONFIG[phase.phase_name]?.description || '',
          agents: phase.agents as string[] || []
        }));
        setPhases(formattedPhases);
      } else {
        // Use default phases from orchestration
        const defaultPhases = (orchestration.phases as any[] || []).map((p: any) => ({
          name: p.name,
          order: p.order,
          status: p.status || 'pending',
          label: PHASE_CONFIG[p.name]?.label || p.name,
          description: PHASE_CONFIG[p.name]?.description || '',
          agents: []
        }));
        setPhases(defaultPhases);
      }

    } catch (err) {
      console.error('Error fetching orchestration status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      onError?.(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const getPhaseIcon = (phase: Phase) => {
    if (phase.status === 'completed') {
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    } else if (phase.status === 'running') {
      return <Loader2 className="h-6 w-6 text-primary animate-spin" />;
    } else if (phase.status === 'error') {
      return <AlertCircle className="h-6 w-6 text-destructive" />;
    }
    return <div className="h-6 w-6 rounded-full border-2 border-muted" />;
  };

  if (status === 'error') {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Erreur lors de l'analyse</h3>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Analyse Multi-Agent en cours</h3>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">{progress}% complété</p>
      </div>

      <div className="space-y-4">
        {phases.map((phase) => (
          <div
            key={phase.name}
            className={`p-4 rounded-lg border ${
              phase.status === 'running' 
                ? 'border-primary bg-primary/5' 
                : phase.status === 'completed'
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-muted'
            }`}
          >
            <div className="flex items-start gap-3">
              {getPhaseIcon(phase)}
              <div className="flex-1">
                <h4 className="font-medium">{phase.label}</h4>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
                {phase.agents && phase.agents.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {phase.agents.map((agent, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-muted"
                      >
                        {agent}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {status === 'completed' && (
        <div className="flex items-center gap-3 text-green-600 p-4 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle2 className="h-6 w-6" />
          <div>
            <h4 className="font-semibold">Analyse terminée !</h4>
            <p className="text-sm">Votre rapport complet est prêt.</p>
          </div>
        </div>
      )}
    </Card>
  );
};
