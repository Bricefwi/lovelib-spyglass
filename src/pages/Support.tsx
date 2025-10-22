import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildSEO } from "@/lib/seo";

export default function Support() {
  const seo = buildSEO({
    title: "Support technique – IMOTION",
    description: "Comment obtenir de l'aide technique et fonctionnelle.",
    url: "/guide/support"
  });

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Support technique</h1>
        <p className="text-gray-700 mb-4">
          Pour toute question : <a href="mailto:support@imotion.tech" className="text-primary underline">support@imotion.tech</a>. 
          Temps de réponse cible : &lt; 24h ouvrées.
        </p>
        
        <ul className="list-disc pl-6 space-y-2">
          <li>Questions données/mesures : joindre captures et période.</li>
          <li>Export rapports : préciser format (PDF/CSV) et plage temporelle.</li>
          <li>Intégrations : HubSpot, Pipedrive, GA4, Stripe.</li>
        </ul>
      </main>
      
      <Footer />
    </>
  );
}
