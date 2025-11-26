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
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // ✅ SECURITY: Verify user has access to this audit
        if (!session?.user) {
          toast({
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder à ce rapport",
            variant: "destructive"
          });
          navigate('/auth');
          return;
        }

        // Check if user owns this audit or is admin
        const { data: audit, error: auditError } = await supabase
          .from('pre_audits')
          .select('created_by, user_roles!inner(role)')
          .eq('id', id)
          .single();

        if (auditError) {
          console.error('❌ Error checking audit access:', auditError);
          setError('Audit introuvable ou accès non autorisé');
          setLoading(false);
          return;
        }

        // Allow access if user owns the audit or is admin
        const isOwner = audit.created_by === session.user.id;
        const isAdmin = audit.user_roles?.role === 'admin';

        if (!isOwner && !isAdmin) {
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas accès à ce rapport d'audit",
            variant: "destructive"
          });
          navigate('/dashboard');
          return;
        }

        console.log('🔍 Fetching report with ID:', id);
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/audit-html?report_id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        console.log('📡 Response status:', response.status);
        const htmlContent = await response.text();
        console.log('📄 HTML content length:', htmlContent.length);
        console.log('📄 First 200 chars:', htmlContent.substring(0, 200));
        
        if (!response.ok || htmlContent.includes('Erreur')) {
          setError(htmlContent);
        } else {
          setHtml(htmlContent);
        }
      } catch (error: any) {
        console.error('❌ Error:', error);
        setError(`Exception: ${error.message}`);
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

  // Affichage d'erreur VISIBLE
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-8 bg-gray-100">
        <div className="max-w-3xl w-full bg-red-50 border-2 border-red-600 rounded-lg p-8">
          <h1 className="text-2xl font-bold text-red-900 mb-4">🔴 Erreur de Génération du Rapport</h1>
          <div className="bg-white p-6 rounded border border-red-300 font-mono text-sm overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap text-red-800">{error}</pre>
          </div>
          <div className="mt-6">
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour aux Audits
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
