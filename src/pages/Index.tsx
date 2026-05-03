import { Helmet } from "react-helmet";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { StepsSection } from "@/components/StepsSection";
import { BlogSection } from "@/components/BlogSection";
import { PreAuditForm } from "@/components/PreAuditForm";
import { Footer } from "@/components/Footer";

const SITE_URL = "https://lovelib-spyglass.lovable.app";
const TITLE = "IMOTION Creator Studio — Votre cahier des charges IA en 45 min";
const DESCRIPTION =
  "IMOTION Creator Studio : l'IA qui transforme vos idées en projets digitaux concrets. Cahier des charges professionnel généré en 45 minutes — 100% gratuit, sans engagement.";
const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "IMOTION Creator Studio",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      email: "contact@imotion-conseil.fr",
      sameAs: ["https://linkedin.com/company/imotion-conseil"],
    },
    {
      "@type": "WebSite",
      name: "IMOTION Creator Studio",
      url: SITE_URL,
      inLanguage: "fr-FR",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "IMOTION Creator Studio",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      description: DESCRIPTION,
    },
  ],
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={`${SITE_URL}/`} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="IMOTION Creator Studio" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />

        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />
      <HeroSection />
      <FeaturesSection />
      <StepsSection />
      <BlogSection />
      <PreAuditForm />
      <Footer />
    </div>
  );
};

export default Index;

