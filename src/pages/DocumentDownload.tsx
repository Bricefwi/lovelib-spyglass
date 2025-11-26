import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";

const DocumentDownload = () => {
  const documents = [
    {
      name: "SECURITY_AUDIT_ACTIONS.md",
      description: "Actions de sécurité implémentées - Audit complet + solutions",
      size: "620 lignes",
      path: "/docs/SECURITY_AUDIT_ACTIONS.md"
    },
    {
      name: "SECURITY_IMPROVEMENTS.md",
      description: "Améliorations de sécurité détaillées",
      size: "240 lignes",
      path: "/docs/SECURITY_IMPROVEMENTS.md"
    },
    {
      name: "AMELIORATIONS_IMOTION.md",
      description: "Plan structuré en 4 phases - Proposition d'améliorations",
      size: "1200+ lignes",
      path: "/docs/AMELIORATIONS_IMOTION.md"
    },
    {
      name: "TEST_REPORT.md",
      description: "Rapport de tests complet",
      size: "26 lignes",
      path: "/docs/TEST_REPORT.md"
    }
  ];

  const downloadFile = async (fileName: string, filePath: string) => {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error("Fichier introuvable");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${fileName} téléchargé avec succès`);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement du fichier");
    }
  };

  const downloadAll = async () => {
    toast.info("Téléchargement de tous les fichiers...");
    for (const doc of documents) {
      await downloadFile(doc.name, doc.path);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    toast.success("Tous les fichiers ont été téléchargés");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Documentation Technique
          </h1>
          <p className="text-muted-foreground text-lg">
            Téléchargez les fichiers de documentation du projet IMOTION
          </p>
        </div>

        <div className="mb-6 flex justify-end">
          <Button onClick={downloadAll} size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            Tout télécharger
          </Button>
        </div>

        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card key={doc.name} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <FileText className="h-6 w-6 text-primary mt-1" />
                    <div>
                      <CardTitle className="text-xl">{doc.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {doc.description}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mt-1">
                        {doc.size}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => downloadFile(doc.name, doc.path)}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-6 bg-muted/50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">📋 Contenu des fichiers</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• <strong>SECURITY_AUDIT_ACTIONS.md</strong> : Actions de sécurité implémentées, corrections RLS, rate limiting</li>
            <li>• <strong>SECURITY_IMPROVEMENTS.md</strong> : Améliorations de sécurité détaillées, validation des entrées, protection XSS</li>
            <li>• <strong>AMELIORATIONS_IMOTION.md</strong> : Charte visuelle, templates de documents, système multi-branches</li>
            <li>• <strong>TEST_REPORT.md</strong> : Rapport de test complet avec résultats et recommandations</li>
          </ul>
        </div>

        <div className="mt-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Code Source Complet</h3>
                  <p className="text-sm text-muted-foreground">
                    Téléchargez le code source complet de l'application dans un fichier TXT compilé
                  </p>
                </div>
                <Button asChild variant="default">
                  <a href="/code-source">Accéder</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentDownload;
