import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IMOTION_BRAND } from "@/lib/brandConfig";

export default function CGU() {
  return (
    <>
      <Helmet>
        <title>Conditions Générales d'Utilisation – IMOTION</title>
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8" style={{ color: IMOTION_BRAND.colors.primary }}>Conditions Générales d'Utilisation (CGU)</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : 22 Novembre 2025</p>
        
        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Objet et Acceptation</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités de mise à disposition des services de la plateforme <strong>IMOTION</strong>.
              L'utilisation des services implique l'acceptation sans réserve et le respect des présentes conditions.
            </p>
            <p className="mt-2 font-semibold">
              Le service est exclusivement réservé à une utilisation professionnelle (B2B).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Description du Service</h2>
            <p>
              IMOTION fournit un outil d'audit et d'aide à la décision stratégique assisté par Intelligence Artificielle. 
              Le service permet de collecter des données publiques, de les analyser via des algorithmes et modèles de langage (LLM), et de générer des rapports de synthèse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Avertissement sur l'Intelligence Artificielle</h2>
            <div className="bg-secondary/5 border-l-4 border-orange-500 p-4 rounded">
              <p className="font-medium text-orange-700 mb-2">Clause de non-responsabilité (Disclaimer IA)</p>
              <p className="text-sm">
                Les analyses et recommandations fournies par IMOTION sont générées par des systèmes d'intelligence artificielle. 
                Bien que nous mettions en œuvre des mécanismes de vérification (Anti-Hallucination, croisement de sources), <strong>IMOTION ne garantit pas l'exactitude, l'exhaustivité ou la pertinence absolue des informations générées.</strong>
                <br/><br/>
                Ces rapports constituent une aide à la décision et ne sauraient se substituer au jugement professionnel de l'Utilisateur ou à un audit légal/financier certifié.
                L'Utilisateur reste seul responsable des décisions prises sur la base de ces rapports.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Accès et Sécurité</h2>
            <p>
              L'accès au service nécessite la création d'un compte. L'Utilisateur est responsable de la confidentialité de ses identifiants.
              IMOTION se réserve le droit de suspendre tout compte présentant une activité suspecte (abus d'API, tentatives d'intrusion).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Propriété Intellectuelle</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>La Plateforme :</strong> La structure, les logiciels, codes, et bases de données sont la propriété exclusive de IMOTION.</li>
              <li><strong>Les Rapports :</strong> Les rapports générés et payés par l'Utilisateur deviennent sa propriété. Il dispose d'un droit d'usage, de reproduction et de diffusion interne ou commerciale (dans le cas des agences) de ces livrables.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Données et Confidentialité</h2>
            <p>
              IMOTION s'engage à traiter les données conformément au RGPD. Les données soumises par l'Utilisateur (URL, documents) sont utilisées uniquement pour la génération de l'audit et ne sont pas partagées avec des tiers non autorisés.
              Consultez notre Politique de Confidentialité pour plus de détails.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
