import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Eye } from "lucide-react";

export default function ClientAudits() {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      setLoading(true);
      
      // ✅ CRITIQUE: Récupérer l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      // ✅ CRITIQUE: Filtrer UNIQUEMENT les audits de cet utilisateur
      const { data, error } = await supabase
        .from("pre_audits")
        .select(`
          *,
          company:companies(domain, name)
        `)
        .eq("created_by", user.id)  // 🔒 FILTRE PAR UTILISATEUR
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

  const viewReport = async (preAuditId: string) => {
    try {
      // ✅ CRITIQUE: Vérifier que l'utilisateur possède cet audit
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté");
        return;
      }

      // Vérifier que l'audit appartient à l'utilisateur
      const { data: auditCheck } = await supabase
        .from("pre_audits")
        .select("created_by")
        .eq("id", preAuditId)
        .single();

      if (!auditCheck || auditCheck.created_by !== user.id) {
        toast.error("Accès non autorisé à ce rapport");
        return;
      }

      // Récupérer le rapport
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
      <main className="flex-1 container mx-auto px-4 py-8" style={{ maxWidth: 960 }}>
        <h1 className="text-3xl font-bold mb-8">Mes audits</h1>

        <div className="space-y-4">
          {audits.map((audit) => (
            <Card key={audit.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">
                      {audit.company?.name || audit.company?.domain || audit.domain || "Entreprise"}
                    </h3>
                    <Badge variant={audit.status === "consolidated" ? "default" : "secondary"}>
                      {audit.status}
                    </Badge>
                    {audit.confidence !== null && audit.confidence > 0 && (
                      <Badge variant="outline">
                        Confiance: {Math.round(audit.confidence)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{audit.url}</p>
                  <div className="text-xs text-muted-foreground mt-2">
                    Créé le {new Date(audit.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>
                {audit.status === "consolidated" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewReport(audit.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir le rapport
                  </Button>
                )}
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
