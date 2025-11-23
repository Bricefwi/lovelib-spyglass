import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IMOTION_BRAND } from "@/lib/brandConfig";
import { Shield, Lock, Eye, Database } from "lucide-react";

export default function RGPD() {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité & RGPD – IMOTION</title>
      </Helmet>
      
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8" style={{ color: IMOTION_BRAND.colors.primary }}>Politique de Confidentialité & RGPD</h1>
        
        <p className="text-lg text-gray-700 mb-12 leading-relaxed">
          Chez IMOTION, la sécurité de vos données stratégiques n'est pas une option. 
          Nous appliquons une politique de <strong>"Privacy by Design"</strong> pour garantir la confidentialité de vos audits.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <Shield className="w-10 h-10 text-green-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Responsable du Traitement</h3>
            <p className="text-gray-600 text-sm">
              Société IMOTION<br/>
              Délégué à la Protection des Données (DPO) :<br/>
              <a href={`mailto:${IMOTION_BRAND.company.email}`} className="text-primary underline">{IMOTION_BRAND.company.email}</a>
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <Database className="w-10 h-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Hébergement des Données</h3>
            <p className="text-gray-600 text-sm">
              Vos données sont stockées en Union Européenne (Francfort/Paris) via nos partenaires certifiés SOC2 et ISO 27001 (Supabase, AWS).
            </p>
          </div>
        </div>
        
        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. Données Collectées</h2>
            <p>Nous collectons uniquement les données strictement nécessaires à l'exécution du service :</p>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              <li><strong>Données de compte :</strong> Nom, Prénom, Email professionnel, SIRET.</li>
              <li><strong>Données d'audit :</strong> URLs soumises, documents uploadés (PDF), contexte d'entreprise.</li>
              <li><strong>Données techniques :</strong> Logs de connexion, adresse IP (pour la sécurité).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. Usage de l'Intelligence Artificielle et Sous-traitants</h2>
            <p>
              Pour fournir nos analyses, nous utilisons des modèles d'IA (LLM) via des API sécurisées. 
              <strong>Vos données ne sont PAS utilisées pour entraîner les modèles publics de nos fournisseurs.</strong>
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">Sous-traitant</th>
                    <th className="px-4 py-2">Rôle</th>
                    <th className="px-4 py-2">Localisation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">Supabase</td>
                    <td className="px-4 py-2">Base de données & Auth</td>
                    <td className="px-4 py-2">UE (Allemagne)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">OpenAI / Anthropic</td>
                    <td className="px-4 py-2">Moteurs d'Analyse (API Enterprise)</td>
                    <td className="px-4 py-2">USA (Privacy Shield)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-4 py-2 font-medium">Resend</td>
                    <td className="px-4 py-2">Envoi d'emails transactionnels</td>
                    <td className="px-4 py-2">USA / UE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. Durée de Conservation</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Comptes actifs :</strong> Durée de la relation contractuelle.</li>
              <li><strong>Rapports d'audit :</strong> 3 ans à compter de leur génération (archivage légal), sauf demande de suppression anticipée.</li>
              <li><strong>Comptes inactifs :</strong> Suppression après 24 mois d'inactivité.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. Vos Droits</h2>
            <p>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de portabilité et d'effacement de vos données.
              Vous pouvez exercer ces droits directement depuis votre tableau de bord ou en nous contactant à : {IMOTION_BRAND.company.email}.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. Sécurité</h2>
            <p>
              Nous utilisons le chiffrement TLS (Transport Layer Security) pour tous les échanges de données et le chiffrement AES-256 pour les données sensibles au repos.
              L'accès à vos rapports est protégé par authentification forte.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
