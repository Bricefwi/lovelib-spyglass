import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import DOMPurify from "dompurify";

export default function AuditReport() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/audit-html?report_id=${id}`);
        
        if (!response.ok) {
          throw new Error('Rapport non trouvé');
        }

        const htmlContent = await response.text();
        setHtml(htmlContent);
      } catch (error) {
        console.error('Error fetching report:', error);
        setHtml('<p style="text-align:center;padding:40px;">Erreur de chargement du rapport.</p>');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!html) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Rapport non disponible</p>
      </div>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />;
}
