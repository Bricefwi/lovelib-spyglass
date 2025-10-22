import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function MentionsLegales() {
  return (
    <>
      <Helmet>
        <title>Mentions légales – IMOTION</title>
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Mentions légales</h1>
        <p className="text-gray-700">
          Éditeur : IMOTION. Hébergeur : Supabase + Lovable Cloud. 
          Contact : <a href="mailto:contact@imotion.tech" className="text-primary underline">contact@imotion.tech</a>
        </p>
      </main>
      
      <Footer />
    </>
  );
}
