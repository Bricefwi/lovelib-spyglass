import { IMOTION_BRAND } from '../brandConfig';

export interface EmailTemplateData {
  auditType: 'standard' | 'premium';
  websiteUrl: string;
  companyName?: string;
  reportUrl: string;
  recipientName?: string;
}

/**
 * Génère un email professionnel conforme à la charte IMOTION
 */
export function generateAuditEmailHTML(data: EmailTemplateData): string {
  const { auditType, websiteUrl, companyName, reportUrl, recipientName } = data;
  
  const auditTypeLabel = auditType === 'premium' ? 'Audit Digital Approfondi' : 'Pré-Audit Digital';
  const greeting = recipientName ? `Bonjour ${recipientName}` : 'Bonjour';
  
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${auditTypeLabel} IMOTION</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Container principal -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- En-tête avec logo et bande rouge -->
          <tr>
            <td style="background: linear-gradient(135deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryLight} 100%); padding: 40px 30px; text-align: center;">
              <img src="https://gzfrcshvrktpejctlgta.supabase.co/storage/v1/object/public/public-assets/LogoIMOTION-white.png" alt="IMOTION" style="height: 50px; margin-bottom: 20px;" />
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2;">
                🎯 ${auditTypeLabel}
              </h1>
              <p style="color: rgba(255, 255, 255, 0.95); margin: 10px 0 0; font-size: 16px;">
                ${companyName || websiteUrl}
              </p>
            </td>
          </tr>
          
          <!-- Corps du message -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                ${greeting},
              </p>
              
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Nous avons finalisé votre <strong>${auditTypeLabel}</strong> pour <strong>${websiteUrl}</strong>.
              </p>
              
              ${auditType === 'premium' ? `
              <div style="background-color: #fafafa; border-left: 4px solid ${IMOTION_BRAND.colors.primary}; padding: 20px; margin: 30px 0;">
                <h3 style="color: ${IMOTION_BRAND.colors.primary}; margin: 0 0 15px; font-size: 18px; font-weight: 600;">
                  📊 Votre audit approfondi comprend :
                </h3>
                <ul style="color: #1a1a1a; font-size: 15px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong>Analyse SWOT détaillée</strong> de votre positionnement digital</li>
                  <li><strong>Scores de maturité</strong> par domaine (Marketing, Tech, Data, IA)</li>
                  <li><strong>Roadmap stratégique</strong> sur 12 mois</li>
                  <li><strong>Quick wins</strong> identifiés avec impact/effort/ROI</li>
                  <li><strong>4 scénarios d'évolution</strong> adaptés à vos ressources</li>
                  <li><strong>KPIs recommandés</strong> pour piloter votre transformation</li>
                </ul>
              </div>
              ` : `
              <div style="background-color: #fafafa; border-left: 4px solid ${IMOTION_BRAND.colors.primary}; padding: 20px; margin: 30px 0;">
                <p style="color: #666666; font-size: 15px; line-height: 1.6; margin: 0;">
                  Cette analyse préliminaire vous donne un premier aperçu de votre présence digitale et des opportunités d'amélioration.
                </p>
              </div>
              `}
              
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 30px 0 20px;">
                Cliquez sur le bouton ci-dessous pour consulter votre rapport complet :
              </p>
              
              <!-- Bouton CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${reportUrl}" style="display: inline-block; background: linear-gradient(135deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryLight} 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(216, 35, 42, 0.3);">
                      📄 Consulter mon ${auditTypeLabel}
                    </a>
                  </td>
                </tr>
              </table>
              
              ${auditType === 'premium' ? `
              <div style="background-color: #fff9f0; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="color: #f59e0b; margin: 0 0 10px; font-size: 16px; font-weight: 600;">
                  💡 Besoin d'accompagnement ?
                </h3>
                <p style="color: #1a1a1a; font-size: 15px; line-height: 1.6; margin: 0;">
                  Notre équipe est disponible pour vous aider à mettre en œuvre les recommandations de cet audit et accélérer votre transformation digitale.
                </p>
              </div>
              ` : ''}
              
              <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin: 30px 0 0;">
                Cordialement,<br/>
                <strong style="color: ${IMOTION_BRAND.colors.primary};">L'équipe IMOTION</strong>
              </p>
            </td>
          </tr>
          
          <!-- Pied de page -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 15px; font-weight: 600;">
                IMOTION - AI No-Code Solutions
              </p>
              <p style="color: #999999; font-size: 13px; margin: 0 0 5px;">
                ${IMOTION_BRAND.company.website} • ${IMOTION_BRAND.company.email}
              </p>
              <p style="color: #666666; font-size: 12px; margin: 15px 0 0; line-height: 1.5;">
                Vous recevez cet email car vous avez demandé un audit digital sur IMOTION.<br/>
                © ${new Date().getFullYear()} IMOTION. Tous droits réservés.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Génère le sujet de l'email selon le type d'audit
 */
export function generateEmailSubject(data: EmailTemplateData): string {
  const { auditType, websiteUrl, companyName } = data;
  const target = companyName || websiteUrl;
  
  if (auditType === 'premium') {
    return `🎯 Votre Audit Digital Approfondi IMOTION - ${target}`;
  }
  return `🎯 Votre Pré-Audit Digital IMOTION - ${target}`;
}
