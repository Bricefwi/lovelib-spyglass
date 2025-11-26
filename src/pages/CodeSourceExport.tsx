import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Code, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const CodeSourceExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCodeCompilation = async () => {
    setIsGenerating(true);
    toast.info("Génération du fichier en cours...");

    try {
      // Liste des fichiers à inclure
      const filesToInclude = [
        // Configuration
        { path: "/package.json", category: "Configuration" },
        { path: "/tsconfig.json", category: "Configuration" },
        { path: "/vite.config.ts", category: "Configuration" },
        { path: "/tailwind.config.ts", category: "Configuration" },
        
        // Source principale
        { path: "/src/main.tsx", category: "Application" },
        { path: "/src/App.tsx", category: "Application" },
        { path: "/src/index.css", category: "Application" },
        
        // Pages principales
        { path: "/src/pages/Index.tsx", category: "Pages" },
        { path: "/src/pages/Auth.tsx", category: "Pages" },
        { path: "/src/pages/Dashboard.tsx", category: "Pages" },
        { path: "/src/pages/ClientNewProject.tsx", category: "Pages" },
        { path: "/src/pages/AuditGratuit.tsx", category: "Pages" },
        
        // Composants clés
        { path: "/src/components/Header.tsx", category: "Composants" },
        { path: "/src/components/Footer.tsx", category: "Composants" },
        { path: "/src/components/PreAuditForm.tsx", category: "Composants" },
        { path: "/src/components/ProtectedRoute.tsx", category: "Composants" },
        
        // Lib
        { path: "/src/lib/brandConfig.ts", category: "Lib" },
        { path: "/src/lib/utils.ts", category: "Lib" },
        { path: "/src/lib/pdfExport.ts", category: "Lib" },
        
        // Templates
        { path: "/src/lib/templates/index.ts", category: "Templates" },
        { path: "/src/lib/templates/auditReportTemplate.ts", category: "Templates" },
        { path: "/src/lib/templates/strategicPlanTemplate.ts", category: "Templates" },
        { path: "/src/lib/templates/premiumAuditTemplate.ts", category: "Templates" },
      ];

      let compiledContent = `
================================================================================
                     CODE SOURCE COMPILÉ - APPLICATION IMOTION
================================================================================

Date de génération: ${new Date().toLocaleString('fr-FR')}
Nombre de fichiers: ${filesToInclude.length}

================================================================================
                              TABLE DES MATIÈRES
================================================================================

`;

      // Générer la table des matières
      let currentCategory = "";
      filesToInclude.forEach(file => {
        if (file.category !== currentCategory) {
          currentCategory = file.category;
          compiledContent += `\n${currentCategory.toUpperCase()}\n`;
        }
        compiledContent += `  - ${file.path}\n`;
      });

      compiledContent += `
\n================================================================================
                                  CODE SOURCE
================================================================================\n\n`;

      // Tenter de récupérer et compiler chaque fichier
      for (const file of filesToInclude) {
        try {
          const response = await fetch(file.path);
          if (response.ok) {
            const content = await response.text();
            compiledContent += `
${'='.repeat(80)}
FICHIER: ${file.path}
CATÉGORIE: ${file.category}
${'='.repeat(80)}

${content}

`;
          } else {
            compiledContent += `
${'='.repeat(80)}
FICHIER: ${file.path}
CATÉGORIE: ${file.category}
${'='.repeat(80)}

[ERREUR: Fichier non accessible depuis le client]

`;
          }
        } catch (error) {
          compiledContent += `
${'='.repeat(80)}
FICHIER: ${file.path}
CATÉGORIE: ${file.category}
${'='.repeat(80)}

[ERREUR: ${error}]

`;
        }
      }

      // Ajouter les informations sur les edge functions
      compiledContent += `
${'='.repeat(80)}
                         EDGE FUNCTIONS (BACKEND)
${'='.repeat(80)}

Les edge functions suivantes sont déployées sur Supabase:

- audit-generate/
- audit-html/
- audit-html-advanced/
- check-audit-access/
- collect-ai-news/
- consolidate/
- faq-assistant/
- fetch-authoritative-data/
- generate-blog-article/
- generate-strategic-options/
- manus-callback/
- orchestrate-multi-agent/
- preaudit/
- send-audit-limit-warning/
- send-audit-results/
- send-auth-diagnostic/
- send-test-reports/
- validate-company-siret/

Note: Les edge functions ne sont pas incluses dans ce fichier de compilation
car elles sont déployées côté serveur. Consultez le dossier supabase/functions/
dans le repository pour accéder au code source.

${'='.repeat(80)}
                              FIN DU FICHIER
${'='.repeat(80)}
`;

      // Créer le blob et déclencher le téléchargement
      const blob = new Blob([compiledContent], { type: 'text/plain;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CODE-SOURCE-IMOTION-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Fichier de code source généré avec succès!");
    } catch (error) {
      console.error("Erreur lors de la génération:", error);
      toast.error("Erreur lors de la génération du fichier");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Code className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Export Code Source
          </h1>
          <p className="text-muted-foreground text-lg">
            Téléchargez le code source complet de l'application IMOTION
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Génération du fichier de compilation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">📦 Contenu du fichier</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Configuration (package.json, tsconfig, vite, tailwind)</li>
                <li>• Application principale (main.tsx, App.tsx, index.css)</li>
                <li>• Pages (Index, Auth, Dashboard, etc.)</li>
                <li>• Composants (Header, Footer, Forms, etc.)</li>
                <li>• Librairies (utils, brandConfig, pdfExport)</li>
                <li>• Templates (audit, strategic plan, premium)</li>
                <li>• Liste des Edge Functions backend</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Note importante</h3>
              <p className="text-sm text-yellow-700">
                Les edge functions (backend Supabase) ne sont pas incluses dans le fichier
                car elles sont déployées côté serveur. Le fichier liste leur emplacement
                dans le projet.
              </p>
            </div>

            <Button 
              onClick={generateCodeCompilation} 
              size="lg" 
              className="w-full gap-2"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Générer et télécharger le code source
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informations techniques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div>
                <strong>Format:</strong> Fichier texte (.txt)
              </div>
              <div>
                <strong>Encodage:</strong> UTF-8
              </div>
              <div>
                <strong>Structure:</strong> Table des matières + Code source complet avec délimiteurs
              </div>
              <div>
                <strong>Taille estimée:</strong> ~1-2 MB
              </div>
              <div>
                <strong>Technologies:</strong> React 18, TypeScript, Vite, TailwindCSS, Supabase
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodeSourceExport;
