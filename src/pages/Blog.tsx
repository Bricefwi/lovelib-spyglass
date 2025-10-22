import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string;
  category: string;
  published_at: string;
}

const Blog = () => {
  const [searchParams] = useSearchParams();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const category = searchParams.get('cat');

  useEffect(() => {
    let isMounted = true;
    
    const fetchArticles = async () => {
      let query = supabase
        .from('blog_articles')
        .select('id, slug, title, excerpt, cover_url, category, published_at')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(24);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching articles:', error);
      } else if (isMounted) {
        setArticles(data || []);
      }
      
      if (isMounted) {
        setLoading(false);
      }
    };

    fetchArticles();
    
    return () => {
      isMounted = false;
    };
  }, [category]);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'articles': 'Articles',
      'etudes-de-cas': 'Études de cas',
      'cas-clients': 'Cas clients',
      'infographies': 'Infographies',
      'chiffres-cles': 'Chiffres clés'
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Blog IMOTION
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Cas concrets, études de cas et insights pour optimiser vos opérations marketing & commerciales
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Aucun article publié pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group"
                onClick={() => navigate(`/blog/${article.slug}`)}
              >
                {article.cover_url && (
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={article.cover_url}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
                    {getCategoryLabel(article.category)}
                  </div>
                  <h2 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {new Date(article.published_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-primary font-medium">
                      Lire →
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
