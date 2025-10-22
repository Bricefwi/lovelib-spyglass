import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import logoImotion from "@/assets/logo-imotion.png";

interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_url: string;
  published_at: string;
}

export const BlogSection = () => {
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('blog_articles')
        .select('id, slug, title, excerpt, cover_url, published_at')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(4);

      if (data) {
        setArticles(data);
      }
    };

    fetchArticles();
  }, []);

  return (
    <section className="py-24 px-6 bg-background" id="blog">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Blog & Ressources
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cas concrets, chiffres clés et stratégies éprouvées pour booster vos performances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {articles.map((article) => (
            <Card 
              key={article.id} 
              className="bg-card border-2 border-border hover:border-primary/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-pointer"
              onClick={() => navigate(`/blog/${article.slug}`)}
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                <img 
                  src={article.cover_url || logoImotion} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = logoImotion;
                  }}
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(article.published_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </CardDescription>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-bold text-primary hover:text-primary/80 hover:translate-x-1 transition-all">
                  Lire l'article
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all font-semibold"
            onClick={() => navigate('/blog')}
          >
            Voir tous les articles
          </Button>
        </div>
      </div>
    </section>
  );
};
