import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

type AuditStatus = 
  | "new"
  | "collecting"
  | "ai_running"
  | "consolidating"
  | "pre_report_ready"
  | "sent"
  | "needs_review"
  | "error";

interface AuditStep {
  id: string;
  step: string;
  status: "queued" | "running" | "done" | "error";
  started_at: string;
  ended_at: string | null;
  message: string | null;
}

interface PreAudit {
  id: string;
  url: string;
  domain: string | null;
  company_guess: string | null;
  status: string;
  confidence: number | null;
  created_at: string;
  last_step: string | null;
  steps_done: number;
  total_steps: number;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  new: { label: "Nouveau", variant: "secondary" },
  collecting: { label: "Collecte web", variant: "default" },
  ai_running: { label: "Analyse IA en cours", variant: "default" },
  consolidating: { label: "Consolidation", variant: "default" },
  consolidated: { label: "Consolidé", variant: "default" },
  pre_report_ready: { label: "Pré-rapport prêt", variant: "outline" },
  sent: { label: "Envoyé", variant: "default" },
  needs_review: { label: "À réviser", variant: "outline" },
  error: { label: "Erreur", variant: "destructive" },
};

const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status] || { label: status, variant: "secondary" as const };
};

export default function AdminAudits() {
  const [audits, setAudits] = useState<PreAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [auditSteps, setAuditSteps] = useState<Record<string, AuditStep[]>>({});
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      toast.error("Accès non autorisé");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("v_admin_audits")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAudits(data as PreAudit[] || []);
    } catch (error) {
      console.error("Error fetching audits:", error);
      toast.error("Erreur lors du chargement des audits");
    } finally {
      setLoading(false);
    }
  };

  const fetchSteps = async (preAuditId: string) => {
    if (auditSteps[preAuditId]) return;

    try {
      const { data, error } = await supabase
        .from("audit_steps")
        .select("*")
        .eq("pre_audit_id", preAuditId)
        .order("started_at", { ascending: true });

      if (error) throw error;
      setAuditSteps(prev => ({ ...prev, [preAuditId]: data as AuditStep[] || [] }));
    } catch (error) {
      console.error("Error fetching steps:", error);
      toast.error("Erreur lors du chargement des étapes");
    }
  };

  const toggleTimeline = async (preAuditId: string) => {
    if (expandedAudit === preAuditId) {
      setExpandedAudit(null);
    } else {
      await fetchSteps(preAuditId);
      setExpandedAudit(preAuditId);
    }
  };

  const regenerateAudit = async (preAuditId: string) => {
    try {
      setRegenerating(preAuditId);
      const { error } = await supabase.functions.invoke("audit-generate", {
        body: { pre_audit_id: preAuditId },
      });

      if (error) throw error;
      toast.success("Rapport régénéré avec succès");
      fetchAudits();
    } catch (error) {
      console.error("Error regenerating audit:", error);
      toast.error("Erreur lors de la régénération");
    } finally {
      setRegenerating(null);
    }
  };

  const viewReport = (preAuditId: string) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const functionUrl = `${supabaseUrl}/functions/v1/audit-html?pre_audit_id=${preAuditId}`;
    window.open(functionUrl, "_blank");
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const readyAudits = audits.filter(a => a.status === "pre_report_ready" || a.status === "sent");

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pilotage des Audits</h1>
            <p className="text-muted-foreground mt-2">
              {audits.length} audits • {readyAudits.length} prêts
            </p>
          </div>
          <Button onClick={fetchAudits} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <div className="space-y-4">
          {audits.map((audit) => (
            <Card key={audit.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {audit.company_guess || audit.domain || "Entreprise"}
                    </h3>
                    <Badge variant={getStatusConfig(audit.status).variant}>
                      {getStatusConfig(audit.status).label}
                    </Badge>
                    {audit.confidence !== null && (
                      <Badge variant="outline">
                        Confiance: {Math.round(audit.confidence)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{audit.url}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>
                      Créé le {new Date(audit.created_at).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(audit.created_at).toLocaleTimeString("fr-FR")}
                    </span>
                    {audit.last_step && (
                      <span>Dernière étape : {audit.last_step}</span>
                    )}
                    <span>
                      {audit.steps_done} / {audit.total_steps} étapes terminées
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(audit.status === "pre_report_ready" || audit.status === "sent" || audit.status === "consolidated") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewReport(audit.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => regenerateAudit(audit.id)}
                    disabled={regenerating === audit.id}
                  >
                    {regenerating === audit.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Relancer IA
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTimeline(audit.id)}
                  >
                    {expandedAudit === audit.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {expandedAudit === audit.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-3">Timeline des étapes</h4>
                  {auditSteps[audit.id]?.length > 0 ? (
                    <div className="space-y-2">
                      {auditSteps[audit.id].map((step) => (
                        <div key={step.id} className="grid grid-cols-[140px_100px_1fr] gap-4 items-start text-sm">
                          <div className="text-muted-foreground font-mono text-xs">
                            {new Date(step.started_at).toLocaleString("fr-FR")}
                          </div>
                          <Badge
                            variant={
                              step.status === "done"
                                ? "default"
                                : step.status === "error"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {step.status}
                          </Badge>
                          <div>
                            <div className="font-semibold">{step.step}</div>
                            {step.message && (
                              <div className="text-muted-foreground text-xs mt-1">
                                {step.message}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucune étape enregistrée pour l'instant
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}

          {audits.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">Aucun audit pour le moment</p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
