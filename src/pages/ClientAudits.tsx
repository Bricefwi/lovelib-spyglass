import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Eye } from "lucide-react";
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

interface PreAudit {
  id: string;
  url: string;
  domain: string | null;
  company_guess: string | null;
  status: AuditStatus;
  confidence: number | null;
  created_at: string;
}

const PROGRESS_ORDER: AuditStatus[] = [
  "new",
  "collecting",
  "ai_running",
  "consolidating",
  "pre_report_ready",
  "sent"
];

const progressValue = (status: AuditStatus): number => {
  const index = PROGRESS_ORDER.indexOf(status);
  return Math.round(((index + 1) / PROGRESS_ORDER.length) * 100);
};

export default function ClientAudits() {
  const [audits, setAudits] = useState<PreAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Protect client route - require authentication
    if (!roleLoading && !role) {
      navigate("/auth");
      toast.error("Veuillez vous connecter");
    }
  }, [role, roleLoading, navigate]);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pre_audits")
        .select("id, url, domain, company_guess, status, confidence, created_at")
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Mes Audits</h1>

          {audits.length > 0 ? (
            <div className="space-y-6">
              {audits.map((audit) => (
                <Card key={audit.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {audit.company_guess || audit.domain || "Entreprise"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {audit.url}
                      </p>
                      <div className="text-xs text-muted-foreground mb-4">
                        Créé le {new Date(audit.created_at).toLocaleDateString("fr-FR")} à{" "}
                        {new Date(audit.created_at).toLocaleTimeString("fr-FR")}
                      </div>
                    </div>
                    <Button
                      onClick={() => viewReport(audit.id)}
                      disabled={
                        audit.status === "new" ||
                        audit.status === "collecting" ||
                        audit.status === "ai_running" ||
                        audit.status === "consolidating"
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir le rapport
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progression</span>
                        <span className="font-semibold">{progressValue(audit.status)}%</span>
                      </div>
                      <Progress value={progressValue(audit.status)} className="h-2" />
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Statut: </span>
                        <span className="font-semibold">{audit.status}</span>
                      </div>
                      {audit.confidence !== null && (
                        <div>
                          <span className="text-muted-foreground">Confiance: </span>
                          <span className="font-semibold">{Math.round(audit.confidence)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore d'audit.
              </p>
              <Button onClick={() => navigate("/")}>
                Commencer un audit
              </Button>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
