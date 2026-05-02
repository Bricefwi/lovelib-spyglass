import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IMOTION_BRAND } from "@/lib/brandConfig";

export default function MentionsLegales() {
  return (
    <>
      <Helmet>
        <title>Mentions Légales – IMOTION</title>
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8" style={{ color: IMOTION_BRAND.colors.primary }}>Mentions Légales</h1>
        
        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Éditeur du Site</h2>
            <p>
              Le site internet <strong>IMOTION</strong> (ci-après le "Site") est édité par la société <strong>IMOTION</strong> (ou votre raison sociale exacte), 
              [Forme Juridique : SAS / SARL] au capital de [Montant] €, immatriculée au Registre du Commerce et des Sociétés de [Ville] 
              sous le numéro [SIREN].
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li><strong>Siège social :</strong> {IMOTION_BRAND.company.address.street}, {IMOTION_BRAND.company.address.postalCode} {IMOTION_BRAND.company.address.city}, {IMOTION_BRAND.company.address.country}</li>
              <li><strong>Numéro de TVA intracommunautaire :</strong> [FR XX XXXXXXXXX]</li>
              <li><strong>Email :</strong> {IMOTION_BRAND.company.email}</li>
              <li><strong>Directeur de la publication :</strong> [Votre Nom]</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Hébergement</h2>
            <p>
              Le Site et l'application sont hébergés sur les infrastructures cloud de :
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li><strong>Frontend & Edge Functions :</strong> Supabase Inc., via Lovable Cloud.</li>
              <li><strong>Base de données :</strong> Supabase (AWS region Frankfurt/Paris).</li>
              <li><strong>Fournisseurs IA :</strong> OpenAI, Anthropic, Google (API).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Propriété Intellectuelle</h2>
            <p>
              L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
              Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est formellement interdite sauf autorisation expresse du directeur de la publication.
            </p>
            <p className="mt-2">
              La marque <strong>IMOTION</strong> et le logo associé sont des marques déposées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Limitation de responsabilité</h2>
            <p>
              Les informations contenues sur ce site sont aussi précises que possible et le site est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes, des omissions ou des lacunes.
              IMOTION ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
