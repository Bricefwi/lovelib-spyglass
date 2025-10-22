import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function RGPD() {
  return (
    <>
      <Helmet>
        <title>Politique RGPD – IMOTION</title>
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Politique RGPD</h1>
        <p className="text-gray-700">
          Consentement explicite, minimisation des données, droit d'accès/suppression, 
          chiffrage au repos (AES-256) et en transit (TLS). Export sur demande.
        </p>
      </main>
      
      <Footer />
    </>
  );
}
