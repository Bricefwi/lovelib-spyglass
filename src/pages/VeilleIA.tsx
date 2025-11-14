import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, TrendingUp, Lightbulb, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface NewsItem {
  title: string;
  category: string;
  importance: string;
  summary: string;
  source: string;
  url: string;
  key_takeaways: string[];
  impact: string;
}

interface AINewsReport {
  id: string;
  date: string;
  summary: string;
  top_news: NewsItem[];
  trends: string[];
  recommendations: string[];
  html_content: string;
  created_at: string;
}

export default function VeilleIA() {
  const [reports, setReports] = useState<AINewsReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AINewsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_news_reports')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (error) throw error;

      const typedReports = (data || []).map(report => ({
        ...report,
        top_news: (report.top_news as unknown) as NewsItem[],
        trends: (report.trends as unknown) as string[],
        recommendations: (report.recommendations as unknown) as string[],
      }));

      setReports(typedReports);
      if (typedReports.length > 0) {
        setSelectedReport(typedReports[0]);
      }
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast.error("Erreur lors du chargement des rapports");
    } finally {
      setLoading(false);
    }
  };

  const collectNews = async () => {
    setCollecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Vous devez être connecté pour collecter les actualités");
        return;
      }

      toast.info("Collecte en cours... (cela peut prendre 30-60 secondes)");

      const { data, error } = await supabase.functions.invoke('collect-ai-news', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast.success("Actualités collectées et synthétisées avec succès !");
      await fetchReports();
    } catch (error: any) {
      console.error('Error collecting news:', error);
      toast.error(error.message || "Erreur lors de la collecte des actualités");
    } finally {
      setCollecting(false);
    }
  };

  const downloadHTML = () => {
    if (!selectedReport || !selectedReport.html_content) return;

    const blob = new Blob([selectedReport.html_content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veille-ia-${selectedReport.date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Rapport téléchargé");
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Modèles': 'bg-blue-100 text-blue-800',
      'Produits': 'bg-green-100 text-green-800',
      'Recherche': 'bg-purple-100 text-purple-800',
      'Business': 'bg-yellow-100 text-yellow-800',
      'Régulation': 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getImportanceColor = (importance: string) => {
    const colors: Record<string, string> = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800',
    };
    return colors[importance] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🤖 Veille IA Automatique</h1>
            <p className="text-muted-foreground">
              Collecte et synthèse quotidienne des actualités de l'industrie IA
            </p>
          </div>
          <Button 
            onClick={collectNews} 
            disabled={collecting}
            size="lg"
          >
            {collecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Collecte en cours...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Collecter Maintenant
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - List of reports */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Rapports</CardTitle>
              <CardDescription>{reports.length} rapports disponibles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedReport?.id === report.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">
                      {format(new Date(report.date), 'dd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-80 line-clamp-2">
                    {report.top_news.length} actualités
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Main content - Selected report */}
          <div className="lg:col-span-3 space-y-6">
            {selectedReport ? (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        Rapport du {format(new Date(selectedReport.date), 'dd MMMM yyyy', { locale: fr })}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {selectedReport.summary}
                      </CardDescription>
                    </div>
                    <Button onClick={downloadHTML} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      HTML
                    </Button>
                  </CardHeader>
                </Card>

                {/* News items */}
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">🔥 Actualités Principales</h2>
                  {selectedReport.top_news.map((item, idx) => (
                    <Card 
                      key={idx}
                      className={`${
                        item.importance === 'high' 
                          ? 'border-l-4 border-l-red-500' 
                          : item.importance === 'medium'
                          ? 'border-l-4 border-l-yellow-500'
                          : ''
                      }`}
                    >
                      <CardHeader>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                          <Badge className={getImportanceColor(item.importance)}>
                            {item.importance === 'high' ? 'Haute importance' : 
                             item.importance === 'medium' ? 'Importance moyenne' : 'Info'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{item.source}</span>
                        </div>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                        <CardDescription>{item.summary}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {item.key_takeaways.length > 0 && (
                          <div className="bg-muted p-4 rounded-lg mb-4">
                            <p className="font-semibold mb-2">Points clés :</p>
                            <ul className="list-disc list-inside space-y-1">
                              {item.key_takeaways.map((takeaway, i) => (
                                <li key={i} className="text-sm">{takeaway}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="font-semibold mb-1">Impact IMOTION :</p>
                          <p className="text-sm">{item.impact}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Trends */}
                {selectedReport.trends.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Tendances Observées
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {selectedReport.trends.map((trend, idx) => (
                          <li key={idx}>{trend}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {selectedReport.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Recommandations pour IMOTION
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2">
                        {selectedReport.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    Aucun rapport disponible. Cliquez sur "Collecter Maintenant" pour générer le premier rapport.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}