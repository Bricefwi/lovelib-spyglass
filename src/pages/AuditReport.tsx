import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Mail } from "lucide-react";
import DOMPurify from "dompurify";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function AuditReport() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        
        const response = await fetch(
          `${supabaseUrl}/functions/v1/audit-html?report_id=${id}`,
          {
            headers: {
              'Authorization': `Bearer ${session?.access_token || supabaseAnonKey}`,
              'Content-Type': 'application/json',
            }
          }
        );
        
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

  const handleSendEmail = async () => {
    if (!id) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-audit-results', {
        body: { reportId: id }
      });

      if (error) throw error;

      toast({
        title: "✅ Email envoyé",
        description: `Le rapport a été envoyé à ${data.sentTo}`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'envoyer l'email. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

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

  return (
    <div className="relative">
      {/* Bouton d'envoi par email fixe en haut à droite */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={handleSendEmail}
          disabled={sending}
          className="shadow-lg"
        >
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer par email
            </>
          )}
        </Button>
      </div>
      
      {/* Contenu du rapport */}
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
    </div>
  );
}
