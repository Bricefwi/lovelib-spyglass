import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AuditReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audit-html?report_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) throw new Error('Rapport introuvable');
        const htmlContent = await response.text();
        setHtml(htmlContent);
      } catch (error) {
        console.error('Error:', error);
        toast({ title: "Erreur", description: "Impossible de charger le rapport", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSendEmail = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-audit-results', {
        body: { reportId: id }
      });
      if (error) throw error;
      toast({ title: "Succès", description: "Rapport envoyé par email" });
    } catch (error) {
      toast({ title: "Erreur", description: "Échec de l'envoi", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-red-600" /></div>;

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header de Navigation (Hors du rapport) */}
      <div className="bg-white border-b h-16 flex items-center justify-between px-6 shadow-sm z-10">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="font-bold text-lg text-gray-800">Aperçu du Rapport</div>
        <Button onClick={handleSendEmail} disabled={sending} className="bg-[#d8232a] hover:bg-[#b01d23] text-white gap-2">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
          Envoyer au Client
        </Button>
      </div>

      {/* LE RAPPORT (Iframe isolée pour protéger le design) */}
      <div className="flex-1 overflow-hidden bg-gray-100 p-4 md:p-8">
        <iframe 
          title="Audit Report"
          srcDoc={html || ""}
          className="w-full h-full bg-white shadow-2xl rounded-lg"
          style={{ border: 'none', display: 'block', margin: '0 auto', maxWidth: '1000px' }}
        />
      </div>
    </div>
  );
}
