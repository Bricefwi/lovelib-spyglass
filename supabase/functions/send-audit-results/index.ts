import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AuditResultRequest {
  website: string;
  auditType: 'free' | 'manual' | 'automated';
  clientEmail?: string;
  results?: any;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { website, auditType, clientEmail, results }: AuditResultRequest = await req.json();

    console.log(`Sending audit results for ${website} - Type: ${auditType}`);

    let emailContent = '';
    let subject = '';

    if (auditType === 'free') {
      subject = `[IMOTION] Résultat Pré-Audit Gratuit - ${website}`;
      emailContent = `
        <h1>Résultat du Pré-Audit Gratuit</h1>
        <p><strong>Site analysé :</strong> ${website}</p>
        <h2>Analyse effectuée</h2>
        <p>L'audit gratuit a été demandé pour ce site.</p>
        <hr>
        <p><em>Email de test - IMOTION</em></p>
      `;
    } else if (auditType === 'manual' && clientEmail) {
      subject = `[IMOTION TEST] Résultats Audit Manuel - ${website}`;
      emailContent = `
        <h1>Test Circuit Manuel</h1>
        <p><strong>Client :</strong> ${clientEmail}</p>
        <p><strong>Site :</strong> ${website}</p>
        <h2>Résultats</h2>
        <pre>${JSON.stringify(results, null, 2)}</pre>
      `;
    } else if (auditType === 'automated') {
      subject = `[IMOTION TEST] Batterie de Tests Automatiques`;
      emailContent = `
        <h1>Batterie de Tests Automatiques</h1>
        <p>Les tests automatiques ont été exécutés avec succès.</p>
        <h2>Résultats</h2>
        <pre>${JSON.stringify(results, null, 2)}</pre>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "IMOTION Tests <onboarding@resend.dev>",
      to: ["patrice.simion@gmail.com"],
      subject: subject,
      html: emailContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-audit-results function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
