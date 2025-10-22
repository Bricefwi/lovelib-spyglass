import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CGU() {
  return (
    <>
      <Helmet>
        <title>Conditions Générales d'Utilisation – IMOTION</title>
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Conditions Générales d'Utilisation</h1>
        <p className="text-gray-700">
          Usage professionnel. Accès nominatif. Respect des lois applicables. 
          Interdiction d'extraire des données sans autorisation.
        </p>
      </main>
      
      <Footer />
    </>
  );
}
