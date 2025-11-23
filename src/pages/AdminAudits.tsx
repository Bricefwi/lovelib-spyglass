import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Eye, ChevronDown, ChevronUp, Mail, Home } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";

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
  timeline?: Array<{at: string; label: string}>;
  company?: {website?: string; name?: string};
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
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  const [auditSteps, setAuditSteps] = useState<Record<string, AuditStep[]>>({});
  const [auditsWithReports, setAuditsWithReports] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<string>("all");
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
      
      // ✅ CORRECTION: Les admins peuvent voir TOUS les audits
      // Pas besoin de filtrer par user.id pour les admins
      // Les politiques RLS permettent déjà l'accès admin via has_role('admin')
      const { data, error } = await supabase
        .from("pre_audits")
        .select(`
          *,
          company:companies(website, name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAudits(data as any || []);
      
      // Vérifier quels audits ont des rapports
      if (data && data.length > 0) {
        const { data: reports } = await supabase
          .from("audit_reports")
          .select("pre_audit_id")
          .in("pre_audit_id", data.map((a: any) => a.id));
        
        if (reports) {
          setAuditsWithReports(new Set(reports.map(r => r.pre_audit_id)));
        }
      }
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

  const regenerateAudit = async (audit: any) => {
    try {
      setRegenerating(audit.id);
      const { data, error } = await supabase.functions.invoke("orchestrate-multi-agent", {
        body: { 
          audit_id: audit.id,
          action: 'start'
        },
      });

      if (error) throw error;
      
      if (data?.ok && data?.report_id) {
        toast.success("Analyse terminée");
        window.open(`/audit-report/${data.report_id}`, "_blank");
      } else {
        toast.success("Analyse relancée");
      }
      
      fetchAudits();
    } catch (error) {
      console.error("Error regenerating audit:", error);
      toast.error("Erreur lors de la relance");
    } finally {
      setRegenerating(null);
    }
  };

  const sendEmailReport = async (audit: PreAudit) => {
    try {
      setSendingEmail(audit.id);
      
      // Récupérer le dernier rapport pour cet audit
      const { data: report, error: reportError } = await supabase
        .from('audit_reports')
        .select('id')
        .eq('pre_audit_id', audit.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (reportError || !report) {
        console.error('Error fetching report:', reportError);
        toast.error("Aucun rapport trouvé pour cet audit");
        return;
      }

      console.log(`Sending email for report ${report.id} to patrice.simion@gmail.com`);

      // ✅ CORRECTION CRITIQUE: Utiliser le bon paramètre attendu par send-audit-results
      const { data, error } = await supabase.functions.invoke('send-audit-results', {
        body: {
          reportId: report.id,
          recipientEmail: 'patrice.simion@gmail.com'
        }
      });

      if (error) throw error;
      
      toast.success("Email envoyé avec succès à patrice.simion@gmail.com");
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setSendingEmail(null);
    }
  };


  const viewReport = async (preAuditId: string) => {
    try {
      const { data, error } = await supabase
        .from("audit_reports")
        .select("id")
        .eq("pre_audit_id", preAuditId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        toast.error("Aucun rapport disponible");
        return;
      }

      window.open(`/audit-report/${data.id}`, "_blank");
    } catch (error) {
      console.error("Error viewing report:", error);
      toast.error("Erreur lors de l'ouverture du rapport");
    }
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredAudits = statusFilter === "all" 
    ? audits 
    : audits.filter(a => a.status === statusFilter);

  const readyAudits = audits.filter((a: any) => 
    a.status === "consolidated"
  );

  const pendingAudits = audits.filter((a: any) => 
    a.status === "new" || a.status === "collecting" || a.status === "ai_running"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/dashboard")}
            >
              <Home className="h-4 w-4 mr-2" />
              Tableau de bord
            </Button>
            <h1 className="text-3xl font-bold">Pilotage des Audits</h1>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">Tous les statuts</option>
              <option value="new">Nouveau</option>
              <option value="collecting">En collecte</option>
              <option value="ai_running">Analyse IA</option>
              <option value="consolidated">Terminés</option>
              <option value="error">Erreurs</option>
            </select>
            <Button onClick={fetchAudits} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAudits.map((audit) => (
            <Card key={audit.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {audit.company?.name || audit.company?.website || audit.domain || "Entreprise"}
                    </h3>
                    <Badge variant={getStatusConfig(audit.status).variant}>
                      {getStatusConfig(audit.status).label}
                    </Badge>
                    {audit.confidence !== null && audit.confidence > 0 && (
                      <ConfidenceBadge score={audit.confidence > 1 ? Math.round(audit.confidence) : Math.round(audit.confidence * 100)} />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{audit.url}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>
                      Créé le {new Date(audit.created_at).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(audit.created_at).toLocaleTimeString("fr-FR")}
                    </span>
                    {audit.timeline && audit.timeline.length > 0 && (
                      <span>Timeline: {audit.timeline.length} étapes</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {auditsWithReports.has(audit.id) && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewReport(audit.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendEmailReport(audit)}
                        disabled={sendingEmail === audit.id}
                      >
                        {sendingEmail === audit.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Mail className="h-4 w-4 mr-2" />
                        )}
                        Envoyer
                      </Button>
                    </>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => regenerateAudit(audit)}
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
                  {audit.timeline && audit.timeline.length > 0 && (
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
                  )}
                </div>
              </div>

              {expandedAudit === audit.id && audit.timeline && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-3">Timeline</h4>
                  {audit.timeline.length > 0 ? (
                    <div className="space-y-2">
                      {audit.timeline.map((entry: any, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start text-sm">
                          <div className="text-muted-foreground font-mono text-xs min-w-[140px]">
                            {new Date(entry.at).toLocaleString("fr-FR")}
                          </div>
                          <div className="font-medium">{entry.label}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucune entrée dans la timeline
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}

          {filteredAudits.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {statusFilter === "all" 
                  ? "Aucun audit pour le moment" 
                  : "Aucun audit avec ce statut"}
              </p>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
