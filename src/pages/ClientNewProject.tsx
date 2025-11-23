import { Header } from "@/components/Header";
import { PreAuditForm } from "@/components/PreAuditForm";
import { Footer } from "@/components/Footer";

const ClientNewProject = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Nouveau Projet d'Audit
          </h1>
          <p className="text-muted-foreground mb-8">
            Lancez un audit stratégique de votre site web ou celui de votre client.
          </p>
          <PreAuditForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ClientNewProject;
