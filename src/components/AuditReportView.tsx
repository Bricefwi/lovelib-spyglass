import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";

interface AuditReportViewProps {
  report: any;
}

export const AuditReportView = ({ report }: AuditReportViewProps) => {
  // Parse le rapport (soit déjà un objet, soit du JSON string)
  const parsedReport = typeof report === 'string' ? JSON.parse(report) : report;

  const executiveSummary = parsedReport?.executive_summary || parsedReport?.message || "Rapport généré";
  const scores = parsedReport?.scores || {};
  const recommendations = parsedReport?.recommendations || [];
  const kpis = parsedReport?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-6 w-6" />
            Résumé Exécutif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Scores */}
      {Object.keys(scores).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Scores & Évaluations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(scores).map(([key, value]: [string, any]) => {
              const score = typeof value === 'number' ? value : parseInt(value) || 0;
              const normalizedScore = score > 100 ? 100 : score;

              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <Badge variant={normalizedScore > 70 ? "default" : normalizedScore > 40 ? "secondary" : "destructive"}>
                      {normalizedScore}%
                    </Badge>
                  </div>
                  <Progress value={normalizedScore} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      {Object.keys(kpis).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Indicateurs Clés (KPIs)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(kpis).map(([key, value]: [string, any]) => (
              <div key={key} className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {typeof value === 'object' ? JSON.stringify(value) : value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {Array.isArray(recommendations) && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Recommandations Stratégiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec: any, idx: number) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                    {idx + 1}
                  </span>
                  <p className="text-foreground">
                    {typeof rec === 'string' ? rec : rec.text || JSON.stringify(rec)}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Debug: Afficher le JSON complet si nécessaire */}
      {parsedReport?.email_debug && (
        <Card className="bg-muted/20">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">🔧 Debug Email</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs text-muted-foreground overflow-x-auto">
              {JSON.stringify(parsedReport.email_debug, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
