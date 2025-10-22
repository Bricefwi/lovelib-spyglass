import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import businessAnalytics from "@/assets/business-analytics.jpg";

const articles = [
  {
    title: "5 stratégies pour optimiser votre tunnel de conversion",
    description: "Découvrez comment améliorer votre taux de conversion de 35% en moyenne grâce à ces techniques éprouvées.",
    date: "15 Mars 2025",
    image: businessAnalytics,
    stats: "+35% conversion"
  },
  {
    title: "L'IA au service de la prospection commerciale",
    description: "Comment les PME utilisent l'intelligence artificielle pour automatiser leur prospection et gagner 8h par semaine.",
    date: "12 Mars 2025",
    image: businessAnalytics,
    stats: "8h/semaine gagnées"
  },
  {
    title: "ROI Marketing : calculer et optimiser vos investissements",
    description: "Guide complet avec exemples concrets et calculateurs pour mesurer l'efficacité de vos campagnes marketing.",
    date: "8 Mars 2025",
    image: businessAnalytics,
    stats: "ROI +140%"
  },
  {
    title: "Automatisation No-Code : cas d'usage réels en PME",
    description: "3 entreprises partagent comment elles ont automatisé leurs processus sans développeurs, avec résultats chiffrés.",
    date: "5 Mars 2025",
    image: businessAnalytics,
    stats: "Gain 18%"
  }
];

export const BlogSection = () => {
  return (
    <section className="py-24 px-6 bg-secondary/30" id="blog">
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
          {articles.map((article, index) => (
            <Card key={index} className="bg-card border border-border hover:shadow-lg transition-all duration-300 group overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {article.stats}
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{article.date}</span>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed mb-4">
                  {article.description}
                </CardDescription>
                <Button variant="ghost" size="sm" className="p-0 h-auto font-semibold text-primary hover:text-primary/80">
                  Lire l'article
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="border-2">
            Voir tous les articles
          </Button>
        </div>
      </div>
    </section>
  );
};
