import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuditReport() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: preAudit } = await supabase
        .from("pre_audits")
        .select("*")
        .eq("id", id)
        .single();

      const { data: sources } = await supabase
        .from("audit_sources")
        .select("*")
        .eq("pre_audit_id", id);

      setData({ preAudit, sources: sources || [] });
      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data?.preAudit) {
    return <div className="min-h-screen flex items-center justify-center">Audit non trouvé</div>;
  }

  const { preAudit, sources } = data;
  const consolidated = preAudit.consolidated || {};
  const scores = consolidated.scores || {};
  const scenarios = consolidated.scenarios || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <header className="bg-gradient-to-r from-primary to-red-500 text-white py-6 px-8 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">IMOTION</h1>
            <span className="text-xl">Rapport d'audit digital</span>
          </div>
          <div className="text-right">
            <div className="font-bold">{preAudit.company_guess || preAudit.domain}</div>
            <div className="text-sm">Confiance: {Math.round((preAudit.confidence || 0) * 100)}%</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* Résumé */}
        <section className="bg-card rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-2xl font-bold text-primary mb-4">Résumé exécutif</h2>
          <p className="text-muted-foreground leading-relaxed">
            {consolidated.summary || "Analyse en cours..."}
          </p>
          <div className="mt-4">
            <span className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-full font-bold text-sm">
              Score de confiance: {Math.round((preAudit.confidence || 0) * 100)}%
            </span>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Scores */}
          <section className="bg-card rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Scores & Indicateurs</h2>
            {Object.keys(scores).length > 0 ? (
              Object.entries(scores).map(([key, value]) => (
                <div key={key} className="bg-muted rounded-xl p-4 mb-3">
                  <div className="text-sm text-muted-foreground font-semibold mb-1">{key}</div>
                  <div className="text-3xl font-bold text-primary">
                    {typeof value === "number" ? Math.round(value as number) : String(value)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">Aucun score disponible</p>
            )}
          </section>

          {/* Informations */}
          <section className="bg-card rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Informations collectées</h2>
            <div className="bg-muted rounded-xl p-4 mb-3">
              <div className="text-sm text-muted-foreground font-semibold mb-1">URL analysée</div>
              <a href={preAudit.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {preAudit.url}
              </a>
            </div>
            <div className="bg-muted rounded-xl p-4 mb-3">
              <div className="text-sm text-muted-foreground font-semibold mb-1">Domaine</div>
              <div className="font-semibold">{preAudit.domain || "N/A"}</div>
            </div>
            <div className="bg-muted rounded-xl p-4">
              <div className="text-sm text-muted-foreground font-semibold mb-1">Statut</div>
              <div className="font-semibold">{preAudit.status}</div>
            </div>
          </section>
        </div>

        {/* Scénarios */}
        <section className="bg-card rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Scénarios recommandés</h2>
          {scenarios.length > 0 ? (
            scenarios.map((scenario: any, idx: number) => (
              <div key={idx} className="bg-red-50 border-l-4 border-primary rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg mb-2">
                  {scenario.title || scenario.name || "Scénario"}
                </h3>
                <p className="text-muted-foreground">
                  {scenario.description || scenario.content || JSON.stringify(scenario)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Aucun scénario disponible</p>
          )}
        </section>

        {/* Sources */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4">Sources & Références</h2>
          {sources.length > 0 ? (
            sources.map((source: any) => (
              <div key={source.id} className="bg-muted rounded-lg p-4 mb-3">
                {source.url && (
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                    {source.url}
                  </a>
                )}
                {source.snippet && <p className="text-muted-foreground mt-2 text-sm">{source.snippet}</p>}
                {source.reliability && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Fiabilité: {Math.round(source.reliability * 100)}%
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Aucune source référencée</p>
          )}
          <p className="text-xs text-muted-foreground mt-4">
            ⚠️ Les données sont issues de collectes publiques et de modèles IA, consolidées automatiquement.
          </p>
        </section>
      </main>

      <footer className="border-t mt-12 py-8 text-center text-muted-foreground text-sm">
        <div className="font-semibold mb-2">IMOTION • Conseil Marketing & Commercial</div>
        <div>Rapport généré automatiquement • {new Date().toLocaleDateString("fr-FR")}</div>
      </footer>
    </div>
  );
}
