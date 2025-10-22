import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Comment fonctionne l'audit stratégique IMOTION ?",
      answer: "Notre audit se déroule en 4 étapes : (1) Analyse de votre URL et présence digitale, (2) Évaluation de vos processus marketing et commerciaux, (3) Benchmarking concurrentiel, (4) Génération de 4 scénarios d'optimisation avec ROI calculé."
    },
    {
      question: "Combien de temps dure un audit complet ?",
      answer: "Le pré-audit automatique prend quelques minutes. L'audit approfondi nécessite 5-7 jours ouvrés pour une analyse complète avec recommandations personnalisées et plan d'action détaillé."
    },
    {
      question: "Quels sont les indicateurs analysés dans l'audit ?",
      answer: "Nous analysons plus de 50 KPIs incluant : trafic web, taux de conversion, coût d'acquisition client (CAC), lifetime value (LTV), performance par canal, cycle de vente, taux de churn, et score de maturité digitale."
    },
    {
      question: "L'accompagnement IA nécessite-t-il des compétences techniques ?",
      answer: "Non, nos solutions sont conçues pour être utilisables sans expertise technique. Nous formons vos équipes et assurons la prise en main complète des outils mis en place."
    },
    {
      question: "Peut-on intégrer vos solutions à notre CRM existant ?",
      answer: "Oui, nous nous intégrons avec tous les CRM majeurs (Salesforce, HubSpot, Pipedrive, etc.) ainsi qu'avec vos outils analytics et marketing automation via API ou connecteurs natifs."
    },
    {
      question: "Quels sont les délais de mise en œuvre ?",
      answer: "Les quick wins identifiés dans l'audit peuvent être déployés sous 2-3 semaines. Les transformations structurelles se déploient sur 2-6 mois selon la complexité et vos ressources internes."
    },
    {
      question: "Quel est le ROI moyen constaté ?",
      answer: "Nos clients constatent en moyenne : +35% de taux de conversion, -25% de coût d'acquisition, et +18% de productivité commerciale dans les 6 premiers mois. Le ROI varie selon le secteur et la maturité initiale."
    },
    {
      question: "Proposez-vous un accompagnement post-déploiement ?",
      answer: "Oui, nous assurons un suivi pendant 3 à 12 mois selon la formule choisie : formations continues, optimisations mensuelles, support technique et révisions stratégiques trimestrielles."
    },
    {
      question: "Comment sont sécurisées nos données ?",
      answer: "Nous sommes conformes RGPD. Toutes les données sont hébergées en Europe, chiffrées en transit et au repos. Aucune donnée n'est partagée avec des tiers sans votre consentement explicite."
    },
    {
      question: "Quels secteurs accompagnez-vous ?",
      answer: "Nous intervenons principalement en B2B SaaS, e-commerce, services professionnels et industrie. Notre méthodologie est adaptable à tout secteur ayant une dimension digitale significative."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 py-32 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Foire Aux Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Retrouvez les réponses aux questions les plus fréquentes sur nos services
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border-2 border-border rounded-lg px-6 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 bg-muted/50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3 text-foreground">
            Vous ne trouvez pas votre réponse ?
          </h2>
          <p className="text-muted-foreground mb-6">
            Notre équipe est à votre disposition pour répondre à toutes vos questions
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            Nous contacter
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
