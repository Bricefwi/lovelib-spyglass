import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildSEO } from "@/lib/seo";

export default function CalculsKPIs() {
  const seo = buildSEO({
    title: "Calculs & KPIs – IMOTION",
    description: "Formules CAC, LTV, ROI, couverture pipeline, churn, et exemples chiffrés.",
    url: "/calculs-kpis"
  });

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Calculs & KPIs</h1>
        
        <div className="space-y-6 text-gray-800">
          <div>
            <b>CAC (par canal)</b> = Dépenses_canal / Conversions_attribuées (période). 
            <i> Exemple :</i> 8 200€ / 96 = 85€.
          </div>
          <div>
            <b>LTV</b> = ARPA × (1 / churn_mensuel) × marge. 
            <i> Ex.</i> 79€ × (1/0,03) × 0,8 = 2 107€.
          </div>
          <div>
            <b>Ratio LTV:CAC</b> = LTV / CAC. 
            <i> Seuil cible</i> ≥ 3,0.
          </div>
          <div>
            <b>Couverture pipeline</b> = Pipeline / Quota. 
            <i> Règle</i> 3× à 4× selon cycle et win rate.
          </div>
          <div>
            <b>ROI</b> = ((Revenus générés − Coûts) / Coûts) × 100. 
            <i> Base</i> préciser période et hypothèses.
          </div>
          <div>
            <b>Churn</b> (mensuel) = Perte_MRR / MRR_début. 
            <i> Alerte</i> &gt; 3–5%.
          </div>
        </div>
        
        <div className="mt-10 p-4 border rounded-lg bg-secondary/10">
          <b>Bonne pratique :</b> toujours afficher la période, l'unité et n (échantillon). 
          Les chiffres sans unité ne sont pas acceptés.
        </div>
      </main>
      
      <Footer />
    </>
  );
}
