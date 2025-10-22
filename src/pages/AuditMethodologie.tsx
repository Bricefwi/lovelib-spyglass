import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { buildSEO } from "@/lib/seo";

export default function AuditMethodologie() {
  const seo = buildSEO({
    title: "Méthodologie d'audit – IMOTION",
    description: "Collecte, scoring, analyse et restitution : notre méthodologie d'audit marketing & commercial.",
    url: "/audit-methodologie"
  });

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Méthodologie d'audit</h1>
        <p className="text-gray-700 mb-8">
          Objectif : établir une photographie exploitable sous 2 semaines, avec recommandations actionnables à 90 jours.
        </p>
        
        <ol className="space-y-6 list-decimal pl-6">
          <li>
            <b>Intake & périmètre</b> — Secteur, ICP, canaux, ARR, cycle de vente. 
            <i> Livrable :</i> check-list de complétude.
          </li>
          <li>
            <b>Collecte de données</b> — CRM (HubSpot/Pipedrive), Analytics (GA4), Ads, facturation (Stripe). 
            <i> Contrôles :</i> fenêtres d'attribution, cohérence unités.
          </li>
          <li>
            <b>Scoring</b> — RICE pour priorisation initiatives ; fiabilité des données (A/B/C) ; risques (probabilité × impact).
          </li>
          <li>
            <b>Analyses</b> — Funnel (TOFU→BOFU), CAC/LTV, cohortes, couverture pipeline, win/loss, pricing & discount.
          </li>
          <li>
            <b>Synthèse</b> — 10–15 initiatives classées, budget, planning trimestriel, KPIs cibles, dépendances.
          </li>
          <li>
            <b>Restitution</b> — Rapport PDF + Tableaux de bord + séance Q&A. 
            <i> Option :</i> itération sous 30 jours.
          </li>
        </ol>
        
        <div className="mt-10 p-4 border rounded-lg bg-secondary/10">
          <b>KPIs évalués</b> : CAC (par canal), LTV (par segment), MQL→SQL, Win rate, Cycle, NRR, Churn, Couverture pipeline.
        </div>
      </main>
      
      <Footer />
    </>
  );
}
