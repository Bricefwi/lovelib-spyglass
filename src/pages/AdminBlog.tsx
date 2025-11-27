import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ClientHeader } from "@/components/ClientHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { 
  Loader2, 
  RefreshCw, 
  Eye, 
  Calendar, 
  Clock, 
  TrendingUp,
  FileText,
  Sparkles,
  Search,
  Filter,
  ExternalLink
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author_name: string;
  published_at: string | null;
  updated_at: string;
  reliability_score: number;
  sources: any;
  tags: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'articles': 'Article',
  'etudes-de-cas': 'Étude de cas',
  'cas-clients': 'Cas client',
  'infographies': 'Infographie',
  'chiffres-cles': 'Chiffres clés'
};

export default function AdminBlog() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const navigate = useNavigate();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      toast.error("Accès non autorisé");
    }
  }, [isAdmin, roleLoading, navigate]);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, categoryFilter, statusFilter]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par catégorie
    if (categoryFilter !== "all") {
      filtered = filtered.filter(article => article.category === categoryFilter);
    }

    // Filtre par statut
    if (statusFilter === "published") {
      filtered = filtered.filter(article => article.published_at !== null);
    } else if (statusFilter === "draft") {
      filtered = filtered.filter(article => article.published_at === null);
    }

    setFilteredArticles(filtered);
  };

  const handleGenerateArticle = async () => {
    setGeneratingArticle(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-article', {
        body: { manual: true }
      });

      if (error) throw error;

      toast.success("Article généré avec succès !");
      fetchArticles();
    } catch (error: any) {
      console.error("Error generating article:", error);
      toast.error("Erreur lors de la génération : " + (error.message || "Erreur inconnue"));
    } finally {
      setGeneratingArticle(false);
    }
  };

  const getStats = () => {
    const published = articles.filter(a => a.published_at !== null).length;
    const drafts = articles.filter(a => a.published_at === null).length;
    const avgReliability = articles.reduce((sum, a) => sum + (a.reliability_score || 0), 0) / articles.length || 0;
    const thisMonth = articles.filter(a => {
      if (!a.published_at) return false;
      const publishDate = new Date(a.published_at);
      const now = new Date();
      return publishDate.getMonth() === now.getMonth() && publishDate.getFullYear() === now.getFullYear();
    }).length;

    return { published, drafts, avgReliability, thisMonth };
  };

  const stats = getStats();

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ClientHeader />
      
      <main className="flex-1 container mx-auto px-6 py-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Gestion du Blog
              </h1>
              <p className="text-muted-foreground">
                Visualisez et gérez les articles générés automatiquement
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={fetchArticles}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
              <Button
                onClick={handleGenerateArticle}
                disabled={generatingArticle}
                className="gap-2 bg-primary text-primary-foreground"
              >
                {generatingArticle ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Générer un article
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Articles publiés
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.published}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Brouillons
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.drafts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ce mois-ci
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Fiabilité moy.
                </CardTitle>
                <Sparkles className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.avgReliability * 100).toFixed(0)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    <SelectItem value="articles">Articles</SelectItem>
                    <SelectItem value="etudes-de-cas">Études de cas</SelectItem>
                    <SelectItem value="cas-clients">Cas clients</SelectItem>
                    <SelectItem value="infographies">Infographies</SelectItem>
                    <SelectItem value="chiffres-cles">Chiffres clés</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="published">Publiés</SelectItem>
                    <SelectItem value="draft">Brouillons</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Articles List */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || categoryFilter !== "all" || statusFilter !== "all"
                      ? "Aucun article ne correspond aux filtres"
                      : "Aucun article pour le moment"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.map((article) => (
                <Card key={article.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-foreground">
                            {article.title}
                          </h3>
                          <Badge variant={article.published_at ? "default" : "secondary"}>
                            {article.published_at ? "Publié" : "Brouillon"}
                          </Badge>
                          <Badge variant="outline">
                            {CATEGORY_LABELS[article.category] || article.category}
                          </Badge>
                        </div>
                        
                        {article.excerpt && (
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {article.published_at
                              ? formatDistanceToNow(new Date(article.published_at), {
                                  addSuffix: true,
                                  locale: fr
                                })
                              : "Non publié"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Mis à jour {formatDistanceToNow(new Date(article.updated_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-4 w-4" />
                            Fiabilité: {((article.reliability_score || 0) * 100).toFixed(0)}%
                          </div>
                          {article.sources && Array.isArray(article.sources) && article.sources.length > 0 && (
                            <div className="flex items-center gap-1">
                              <ExternalLink className="h-4 w-4" />
                              {article.sources.length} source{article.sources.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>

                        {article.tags && article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {article.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/blog/${article.slug}`, '_blank')}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Info Section */}
          <Card className="mt-8 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Génération automatique activée
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Les articles sont générés automatiquement 2 fois par mois (le 1er et le 15) à 9h00.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vous pouvez aussi générer des articles manuellement en cliquant sur "Générer un article".
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
