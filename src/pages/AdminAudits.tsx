import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Eye, Mail } from "lucide-react";

interface PreAudit {
  id: string;
  url: string;
  domain: string | null;
  company_guess: string | null;
  status: string;
  confidence: number | null;
  created_at: string;
  audit_results?: {
    id: string;
    created_at: string;
  }[];
}

export default function AdminAudits() {
  const [audits, setAudits] = useState<PreAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pre_audits")
        .select(`
          id,
          url,
          domain,
          company_guess,
          status,
          confidence,
          created_at,
          audit_results (id, created_at)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAudits(data || []);
    } catch (error) {
      console.error("Error fetching audits:", error);
      toast.error("Erreur lors du chargement des audits");
    } finally {
      setLoading(false);
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
    window.open(`/api/audit-html?pre_audit_id=${preAuditId}`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      collecting: "default",
      collected: "default",
      generating: "default",
      generated: "default",
      sent: "default",
      error: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Gestion des Audits</h1>
          <Button onClick={fetchAudits} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        <div className="space-y-4">
          {audits.map((audit) => (
            <Card key={audit.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{audit.company_guess || audit.domain || "Entreprise"}</h3>
                    {getStatusBadge(audit.status)}
                    {audit.confidence && (
                      <Badge variant="outline">
                        Confiance: {Math.round(audit.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{audit.url}</p>
                  <p className="text-xs text-muted-foreground">
                    Créé le {new Date(audit.created_at).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(audit.created_at).toLocaleTimeString("fr-FR")}
                  </p>
                  {audit.audit_results && audit.audit_results.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {audit.audit_results.length} rapport(s) généré(s)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {audit.audit_results && audit.audit_results.length > 0 && (
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
                </div>
              </div>
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
