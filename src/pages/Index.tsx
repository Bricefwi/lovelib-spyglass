import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { BlogSection } from "@/components/BlogSection";
import { PreAuditForm } from "@/components/PreAuditForm";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <BlogSection />
      <PreAuditForm />
      <Footer />
    </div>
  );
};

export default Index;
