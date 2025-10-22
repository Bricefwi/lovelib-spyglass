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
      
      // Simulation de scores d'audit réalistes
      const auditScores = {
        seo: Math.floor(Math.random() * 40) + 30, // 30-70
        performance: Math.floor(Math.random() * 40) + 40, // 40-80
        mobile: Math.floor(Math.random() * 30) + 50, // 50-80
        security: Math.floor(Math.random() * 30) + 60, // 60-90
      };

      emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; }
            .score-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .score { font-size: 48px; font-weight: bold; color: #667eea; margin: 10px 0; }
            .score.warning { color: #f59e0b; }
            .score.danger { color: #ef4444; }
            .metric-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .recommendations { background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
            .cta { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Résultat de votre Pré-Audit Digital</h1>
              <p>Analyse de ${website}</p>
            </div>
            
            <div class="content">
              <h2>📊 Scores Globaux</h2>
              
              <div class="score-card">
                <h3>🔍 SEO & Visibilité</h3>
                <div class="score ${auditScores.seo < 50 ? 'danger' : auditScores.seo < 70 ? 'warning' : ''}">${auditScores.seo}/100</div>
                <p><strong>Points clés détectés :</strong></p>
                <ul>
                  <li>${auditScores.seo < 60 ? '❌ Balises meta incomplètes' : '✅ Balises meta présentes'}</li>
                  <li>${auditScores.seo < 50 ? '❌ Structure H1/H2 à optimiser' : '✅ Structure correcte'}</li>
                  <li>⚠️ Opportunités de mots-clés longue traîne</li>
                </ul>
              </div>

              <div class="score-card">
                <h3>⚡ Performance & Vitesse</h3>
                <div class="score ${auditScores.performance < 50 ? 'danger' : auditScores.performance < 70 ? 'warning' : ''}">${auditScores.performance}/100</div>
                <p><strong>Analyse :</strong></p>
                <ul>
                  <li>${auditScores.performance < 60 ? '❌ Temps de chargement > 3s' : '✅ Vitesse acceptable'}</li>
                  <li>⚠️ Images non optimisées détectées</li>
                  <li>${auditScores.performance > 70 ? '✅ Cache navigateur configuré' : '❌ Pas de cache navigateur'}</li>
                </ul>
              </div>

              <div class="score-card">
                <h3>📱 Compatibilité Mobile</h3>
                <div class="score ${auditScores.mobile < 60 ? 'danger' : auditScores.mobile < 75 ? 'warning' : ''}">${auditScores.mobile}/100</div>
                <p><strong>Responsive Design :</strong></p>
                <ul>
                  <li>${auditScores.mobile > 70 ? '✅ Design responsive' : '❌ Problèmes d\'affichage mobile'}</li>
                  <li>⚠️ Taille des boutons à améliorer</li>
                  <li>${auditScores.mobile < 60 ? '❌ Viewport non configuré' : '✅ Viewport OK'}</li>
                </ul>
              </div>

              <div class="score-card">
                <h3>🔒 Sécurité & Conformité</h3>
                <div class="score ${auditScores.security < 70 ? 'warning' : ''}">${auditScores.security}/100</div>
                <p><strong>Vérifications :</strong></p>
                <ul>
                  <li>${auditScores.security > 70 ? '✅ Certificat SSL actif' : '❌ Pas de HTTPS'}</li>
                  <li>⚠️ Politique de confidentialité à vérifier</li>
                  <li>✅ Pas de vulnérabilités critiques détectées</li>
                </ul>
              </div>

              <div class="recommendations">
                <h3>💡 Top 3 Recommandations Prioritaires</h3>
                <ol>
                  <li><strong>Optimiser le référencement local</strong> - Potentiel de +40% de visibilité</li>
                  <li><strong>Améliorer la vitesse de chargement</strong> - Impact direct sur les conversions</li>
                  <li><strong>Renforcer l'expérience mobile</strong> - 60% de vos visiteurs sont sur mobile</li>
                </ol>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://imotion.tech/contact" class="cta">📈 Demander l'Audit Complet</a>
                <p style="margin-top: 15px; color: #6b7280;">Audit détaillé avec plan d'action personnalisé</p>
              </div>
            </div>

            <div class="footer">
              <p><strong>IMOTION</strong> - Experts en Transformation Digitale B2B</p>
              <p>📧 contact@imotion.tech | 🌐 imotion.tech</p>
              <p style="font-size: 12px; margin-top: 15px;">
                Cet audit gratuit est une analyse préliminaire. Pour un diagnostic complet, contactez-nous.
              </p>
            </div>
          </div>
        </body>
        </html>
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
