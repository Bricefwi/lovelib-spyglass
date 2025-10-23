import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Eye, Download } from "lucide-react";

interface AuditResult {
  id: string;
  summary: string;
  created_at: string;
  confidence: number;
  scores: any;
  pre_audits: {
    url: string;
    company_guess: string | null;
  };
}

export default function ClientAudits() {
  const [audits, setAudits] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("audit_results")
        .select(`
          id,
          summary,
          created_at,
          confidence,
          scores,
          pre_audits (url, company_guess)
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

  const viewReport = (auditId: string) => {
    window.open(`/api/audit-html?audit_result_id=${auditId}`, "_blank");
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
        <h1 className="text-3xl font-bold mb-8">Mes Audits Digitaux</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {audits.map((audit) => (
            <Card key={audit.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">
                  {audit.pre_audits?.company_guess || "Audit Digital"}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {audit.pre_audits?.url}
                </p>
                <Badge variant="outline">
                  Confiance: {Math.round(audit.confidence * 100)}%
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="text-2xl font-bold text-primary">
                    {audit.scores?.maturite || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Maturité</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="text-2xl font-bold text-primary">
                    {audit.scores?.marketing || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Marketing</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="text-2xl font-bold text-primary">
                    {audit.scores?.sales || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Sales</div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {audit.summary}
              </p>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => viewReport(audit.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Voir le rapport
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Généré le {new Date(audit.created_at).toLocaleDateString("fr-FR")}
              </p>
            </Card>
          ))}

          {audits.length === 0 && (
            <Card className="col-span-full p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore d'audit
              </p>
              <Button onClick={() => (window.location.href = "/")}>
                Demander un audit gratuit
              </Button>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
