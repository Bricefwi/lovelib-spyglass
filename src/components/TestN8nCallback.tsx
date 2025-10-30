import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, PlayCircle, CheckCircle2 } from "lucide-react";

interface TestN8nCallbackProps {
  orchestrationId: string;
  preAuditId: string;
}

export const TestN8nCallback = ({ orchestrationId, preAuditId }: TestN8nCallbackProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const testCallback = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      // Données de test simulant un retour n8n complet
      const mockResults = {
        orchestrationId,
        preAuditId,
        status: 'completed',
        results: {
          market_research: {
            competitors: ["Concurrent 1", "Concurrent 2"],
            market_size: "Grand marché potentiel",
            trends: ["IA", "Automatisation", "Cloud"]
          },
          conversational_audits: {
            marketing: { score: 8, insights: ["Bon positionnement", "Manque de contenu"] },
            commercial: { score: 7, insights: ["Bonne approche", "Optimiser la conversion"] },
            technical: { score: 9, insights: ["Stack moderne", "Performance optimale"] },
            strategic: { score: 8, insights: ["Vision claire", "Scalabilité"] }
          },
          specialized_analysis: {
            seo: { score: 7, insights: ["Bon référencement de base", "Améliorer les backlinks"] },
            content: { score: 8, insights: ["Contenu pertinent", "Enrichir les articles"] },
            ux: { score: 9, insights: ["Navigation intuitive", "Design moderne"] },
            conversion: { score: 7, insights: ["Bon tunnel", "Optimiser les CTA"] }
          },
          synthesis: {
            overall_score: 8,
            key_recommendations: [
              "Renforcer la stratégie de contenu",
              "Optimiser le référencement naturel",
              "Améliorer les taux de conversion"
            ],
            priority_actions: [
              "Créer un blog régulier",
              "Optimiser les landing pages",
              "Mettre en place des A/B tests"
            ]
          },
          allAgentsResults: {
            total_agents: 12,
            execution_time: "45 minutes",
            data_points_analyzed: 1500
          }
        }
      };

      console.log('Envoi du callback test vers:', `${supabaseUrl}/functions/v1/n8n-callback`);
      console.log('Payload:', mockResults);

      const response = await fetch(`${supabaseUrl}/functions/v1/n8n-callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockResults)
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du test du callback');
      }

      console.log('Réponse du callback:', result);
      
      setSuccess(true);
      toast.success("Callback test réussi !", {
        description: `Orchestration: ${result.orchestrationId}, Rapport: ${result.reportId}`
      });

    } catch (error: any) {
      console.error('Erreur test callback:', error);
      toast.error("Échec du test", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-orange-500/50 bg-orange-50/50">
      <CardHeader>
        <CardTitle className="text-orange-600 flex items-center gap-2">
          🧪 Test du Callback N8N
        </CardTitle>
        <CardDescription>
          Simulez un retour de n8n pour vérifier que le système de réception fonctionne correctement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-3 rounded border text-sm space-y-2">
          <div><strong>Orchestration ID:</strong> {orchestrationId}</div>
          <div><strong>Pre-Audit ID:</strong> {preAuditId}</div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Ce bouton va simuler un callback de n8n avec des données de test complètes.
            Si cela fonctionne, le problème vient de n8n. Sinon, c'est l'application.
          </p>
        </div>

        <Button 
          onClick={testCallback} 
          disabled={loading || success}
          className="w-full"
          variant={success ? "default" : "outline"}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {success && <CheckCircle2 className="w-4 h-4 mr-2" />}
          {!loading && !success && <PlayCircle className="w-4 h-4 mr-2" />}
          {success ? "Test réussi ✓" : "Lancer le test du callback"}
        </Button>

        {success && (
          <div className="bg-green-50 border border-green-200 p-3 rounded text-sm text-green-700">
            ✓ Le callback a fonctionné ! L'application peut recevoir et traiter les données.
            Le problème vient donc de n8n qui ne renvoie pas les résultats.
          </div>
        )}
      </CardContent>
    </Card>
  );
};