/**
 * Index des Templates IMOTION
 * 
 * Exporte tous les templates de documents avec charte visuelle IMOTION
 */

export { generateAuditReportHTML } from './auditReportTemplate';
export type { AuditReportData } from './auditReportTemplate';

export { generateStrategicPlanHTML } from './strategicPlanTemplate';
export type { StrategicPlanData } from './strategicPlanTemplate';

export { generateProjectPlanningHTML } from './projectPlanningTemplate';
export type { ProjectPlanningData } from './projectPlanningTemplate';

// Ré-export de la configuration de marque
export { IMOTION_BRAND } from '../brandConfig';
