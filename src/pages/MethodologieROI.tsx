import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChartBlock } from "@/components/ChartBlock";
import { buildSEO } from "@/lib/seo";

export default function MethodologieROI() {
  const seo = buildSEO({
    title: "Méthodologie ROI – IMOTION",
    description: "Comment nous calculons un ROI réaliste et mesurable.",
    url: "/methodologie-roi"
  });

  const chartSpec = {
    title: "ROI cumulé sur 24 mois (exemple médian)",
    type: "line",
    xKey: "mois",
    yKeys: ["roi"],
    data: [
      { mois: "M0", roi: 0 },
      { mois: "M3", roi: 40 },
      { mois: "M6", roi: 120 },
      { mois: "M12", roi: 280 },
      { mois: "M18", roi: 360 },
      { mois: "M24", roi: 450 }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Méthodologie ROI</h1>
        <p className="text-gray-700 mb-6">
          Le ROI est calculé initiative par initiative, puis agrégé. Nous exposons les hypothèses, 
          la formule et les bornes (optimiste, médiane, prudente).
        </p>
        
        <pre className="bg-gray-50 p-4 rounded border text-sm overflow-x-auto">
          {`ROI = ((Revenus générés − Coûts) / Coûts) × 100
Où Revenus générés = Nouveaux contrats + Upsells + Récurrence conservée`}
        </pre>
        
        <ChartBlock 
          title={chartSpec.title}
          type={chartSpec.type as any}
          data={chartSpec.data}
          xKey={chartSpec.xKey}
          yKeys={chartSpec.yKeys}
        />
        
        <div className="mt-6 p-4 border rounded-lg text-sm text-gray-700 bg-secondary/10">
          <b>Conformité</b> : toute projection cite sa source (CRM/Analytics/Benchmarks) et la période. 
          Un <i>confidence_score</i> &gt; 0,85 est requis pour valider une estimation.
        </div>
      </main>
      
      <Footer />
    </>
  );
}
