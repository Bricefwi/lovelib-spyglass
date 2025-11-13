/**
 * Template HTML pour le Planning Projet
 * Respecte la charte visuelle IMOTION
 * Style Gantt avec timeline visuelle
 */

import { IMOTION_BRAND } from '../brandConfig';

export interface ProjectPlanningData {
  company: {
    name: string;
    website: string;
  };
  projectName: string;
  startDate: string;
  endDate: string;
  phases: Array<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    progress: number;
    tasks: Array<{
      name: string;
      owner: string;
      startDate: string;
      endDate: string;
      status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
      dependencies?: string[];
      deliverables?: string[];
    }>;
  }>;
  milestones: Array<{
    name: string;
    date: string;
    description: string;
    critical: boolean;
  }>;
  team: Array<{
    name: string;
    role: string;
    allocation: string;
  }>;
  generatedAt: string;
  planningId: string;
}

export function generateProjectPlanningHTML(data: ProjectPlanningData): string {
  const { company, projectName, startDate, endDate, phases, milestones, team, generatedAt, planningId } = data;

  // Calculer la durée totale en jours
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planning Projet - ${projectName} | IMOTION</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: ${IMOTION_BRAND.typography.fontFamily.primary};
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      line-height: ${IMOTION_BRAND.typography.lineHeight.normal};
      color: ${IMOTION_BRAND.colors.text.primary};
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 40px 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: ${IMOTION_BRAND.colors.background.main};
      border-radius: ${IMOTION_BRAND.borderRadius.lg};
      box-shadow: ${IMOTION_BRAND.shadows.lg};
    }

    .header {
      text-align: center;
      padding: 60px 40px 40px;
      background: linear-gradient(135deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryLight} 100%);
      color: white;
      border-radius: ${IMOTION_BRAND.borderRadius.lg} ${IMOTION_BRAND.borderRadius.lg} 0 0;
    }

    .logo {
      max-width: 180px;
      height: auto;
      margin: 0 auto 25px;
      display: block;
      filter: brightness(0) invert(1);
    }

    .title {
      font-size: ${IMOTION_BRAND.typography.fontSize['4xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.extrabold};
      margin-bottom: 15px;
    }

    .subtitle {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.medium};
      opacity: 0.95;
      margin-bottom: 20px;
    }

    .project-meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
    }

    .project-meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section {
      padding: 40px;
      border-bottom: 1px solid ${IMOTION_BRAND.colors.border.default};
    }

    .section:last-child {
      border-bottom: none;
    }

    .section-title {
      font-size: ${IMOTION_BRAND.typography.fontSize['3xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.primary};
      margin-bottom: 30px;
      padding-bottom: 12px;
      border-bottom: 3px solid ${IMOTION_BRAND.colors.primary};
    }

    .phase-card {
      background: ${IMOTION_BRAND.colors.background.secondary};
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      margin-bottom: 30px;
      overflow: hidden;
    }

    .phase-header {
      background: ${IMOTION_BRAND.colors.primary};
      color: white;
      padding: 25px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .phase-info {
      flex: 1;
    }

    .phase-name {
      font-size: ${IMOTION_BRAND.typography.fontSize['2xl']};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      margin-bottom: 8px;
    }

    .phase-description {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      opacity: 0.95;
    }

    .phase-dates {
      text-align: right;
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
    }

    .phase-progress {
      background: white;
      padding: 20px 30px;
      border-bottom: 1px solid ${IMOTION_BRAND.colors.border.default};
    }

    .progress-label {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.text.secondary};
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }

    .progress-bar {
      width: 100%;
      height: 12px;
      background: ${IMOTION_BRAND.colors.background.secondary};
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, ${IMOTION_BRAND.colors.primary} 0%, ${IMOTION_BRAND.colors.primaryLight} 100%);
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      transition: width 0.3s ease;
    }

    .tasks-list {
      padding: 25px 30px;
    }

    .task-item {
      background: white;
      border-radius: ${IMOTION_BRAND.borderRadius.sm};
      padding: 20px;
      margin-bottom: 15px;
      border-left: 4px solid ${IMOTION_BRAND.colors.border.default};
    }

    .task-item:last-child {
      margin-bottom: 0;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .task-name {
      font-size: ${IMOTION_BRAND.typography.fontSize.lg};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
      flex: 1;
    }

    .task-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wide};
    }

    .status-not_started {
      background: ${IMOTION_BRAND.colors.border.default};
      color: ${IMOTION_BRAND.colors.text.secondary};
    }

    .status-in_progress {
      background: ${IMOTION_BRAND.colors.status.warning};
      color: white;
    }

    .status-completed {
      background: ${IMOTION_BRAND.colors.status.success};
      color: white;
    }

    .status-blocked {
      background: ${IMOTION_BRAND.colors.status.error};
      color: white;
    }

    .task-meta {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      color: ${IMOTION_BRAND.colors.text.secondary};
      margin-bottom: 12px;
    }

    .task-meta strong {
      color: ${IMOTION_BRAND.colors.primary};
    }

    .task-deliverables {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 12px;
      border-radius: ${IMOTION_BRAND.borderRadius.sm};
      margin-top: 12px;
    }

    .deliverables-title {
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.primary};
      text-transform: uppercase;
      letter-spacing: ${IMOTION_BRAND.typography.letterSpacing.wider};
      margin-bottom: 8px;
    }

    .deliverables-list {
      list-style: none;
      padding: 0;
    }

    .deliverables-list li {
      padding: 4px 0 4px 20px;
      position: relative;
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
    }

    .deliverables-list li:before {
      content: "📦";
      position: absolute;
      left: 0;
    }

    .milestones-timeline {
      position: relative;
      padding-left: 40px;
    }

    .timeline-line {
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 3px;
      background: ${IMOTION_BRAND.colors.border.default};
    }

    .milestone-item {
      position: relative;
      margin-bottom: 30px;
      padding-left: 30px;
    }

    .milestone-item:last-child {
      margin-bottom: 0;
    }

    .milestone-dot {
      position: absolute;
      left: -28px;
      top: 5px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: ${IMOTION_BRAND.colors.primary};
      border: 3px solid white;
      box-shadow: 0 0 0 3px ${IMOTION_BRAND.colors.primary};
    }

    .milestone-dot.critical {
      background: ${IMOTION_BRAND.colors.status.error};
      box-shadow: 0 0 0 3px ${IMOTION_BRAND.colors.status.error};
    }

    .milestone-content {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 20px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      border-left: 4px solid ${IMOTION_BRAND.colors.primary};
    }

    .milestone-content.critical {
      border-left-color: ${IMOTION_BRAND.colors.status.error};
    }

    .milestone-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .milestone-name {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
      flex: 1;
    }

    .milestone-date {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      color: ${IMOTION_BRAND.colors.primary};
      background: white;
      padding: 6px 12px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
    }

    .milestone-description {
      color: ${IMOTION_BRAND.colors.text.secondary};
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .team-member {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 25px;
      border-radius: ${IMOTION_BRAND.borderRadius.md};
      text-align: center;
      border-top: 4px solid ${IMOTION_BRAND.colors.primary};
    }

    .member-name {
      font-size: ${IMOTION_BRAND.typography.fontSize.xl};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.bold};
      color: ${IMOTION_BRAND.colors.text.primary};
      margin-bottom: 8px;
    }

    .member-role {
      font-size: ${IMOTION_BRAND.typography.fontSize.base};
      color: ${IMOTION_BRAND.colors.primary};
      font-weight: ${IMOTION_BRAND.typography.fontWeights.semibold};
      margin-bottom: 12px;
    }

    .member-allocation {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      color: ${IMOTION_BRAND.colors.text.secondary};
      background: white;
      padding: 8px 16px;
      border-radius: ${IMOTION_BRAND.borderRadius.full};
      display: inline-block;
    }

    .footer {
      background: ${IMOTION_BRAND.colors.background.secondary};
      padding: 40px;
      text-align: center;
      border-radius: 0 0 ${IMOTION_BRAND.borderRadius.lg} ${IMOTION_BRAND.borderRadius.lg};
    }

    .footer-logo {
      max-width: 120px;
      height: auto;
      margin: 0 auto 20px;
      display: block;
      opacity: 0.8;
    }

    .footer-text {
      font-size: ${IMOTION_BRAND.typography.fontSize.sm};
      color: ${IMOTION_BRAND.colors.text.secondary};
      line-height: ${IMOTION_BRAND.typography.lineHeight.relaxed};
    }

    .footer-meta {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid ${IMOTION_BRAND.colors.border.default};
      font-size: ${IMOTION_BRAND.typography.fontSize.xs};
      color: ${IMOTION_BRAND.colors.text.muted};
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
    }

    @media (max-width: 768px) {
      .header {
        padding: 40px 20px 30px;
      }
      .title {
        font-size: ${IMOTION_BRAND.typography.fontSize['3xl']};
      }
      .section {
        padding: 30px 20px;
      }
      .phase-header {
        flex-direction: column;
        align-items: start;
      }
      .phase-dates {
        text-align: left;
      }
      .team-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${IMOTION_BRAND.logos.main}" alt="${IMOTION_BRAND.logos.alt}" class="logo">
      <h1 class="title">Planning Projet</h1>
      <p class="subtitle">${projectName}</p>
      <div class="project-meta">
        <div class="project-meta-item">
          <span>📅</span>
          <span>Début: ${new Date(startDate).toLocaleDateString('fr-FR')}</span>
        </div>
        <div class="project-meta-item">
          <span>🏁</span>
          <span>Fin: ${new Date(endDate).toLocaleDateString('fr-FR')}</span>
        </div>
        <div class="project-meta-item">
          <span>⏱️</span>
          <span>Durée: ${totalDays} jours</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">📊 Phases du Projet</h2>
      ${phases.map(phase => `
        <div class="phase-card">
          <div class="phase-header">
            <div class="phase-info">
              <h3 class="phase-name">${phase.name}</h3>
              <p class="phase-description">${phase.description}</p>
            </div>
            <div class="phase-dates">
              <div>${new Date(phase.startDate).toLocaleDateString('fr-FR')}</div>
              <div>→</div>
              <div>${new Date(phase.endDate).toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
          <div class="phase-progress">
            <div class="progress-label">
              <span>Progression</span>
              <span>${phase.progress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${phase.progress}%"></div>
            </div>
          </div>
          <div class="tasks-list">
            ${phase.tasks.map(task => `
              <div class="task-item">
                <div class="task-header">
                  <h4 class="task-name">${task.name}</h4>
                  <span class="task-status status-${task.status}">
                    ${task.status === 'not_started' ? 'À Démarrer' : 
                      task.status === 'in_progress' ? 'En Cours' : 
                      task.status === 'completed' ? 'Terminé' : 'Bloqué'}
                  </span>
                </div>
                <div class="task-meta">
                  <span><strong>Responsable:</strong> ${task.owner}</span>
                  <span><strong>Début:</strong> ${new Date(task.startDate).toLocaleDateString('fr-FR')}</span>
                  <span><strong>Fin:</strong> ${new Date(task.endDate).toLocaleDateString('fr-FR')}</span>
                </div>
                ${task.deliverables && task.deliverables.length > 0 ? `
                  <div class="task-deliverables">
                    <div class="deliverables-title">Livrables</div>
                    <ul class="deliverables-list">
                      ${task.deliverables.map(deliverable => `<li>${deliverable}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="section">
      <h2 class="section-title">🎯 Jalons Clés</h2>
      <div class="milestones-timeline">
        <div class="timeline-line"></div>
        ${milestones.map(milestone => `
          <div class="milestone-item">
            <div class="milestone-dot ${milestone.critical ? 'critical' : ''}"></div>
            <div class="milestone-content ${milestone.critical ? 'critical' : ''}">
              <div class="milestone-header">
                <h3 class="milestone-name">
                  ${milestone.critical ? '🔴 ' : ''}${milestone.name}
                </h3>
                <div class="milestone-date">${new Date(milestone.date).toLocaleDateString('fr-FR')}</div>
              </div>
              <p class="milestone-description">${milestone.description}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">👥 Équipe Projet</h2>
      <div class="team-grid">
        ${team.map(member => `
          <div class="team-member">
            <h3 class="member-name">${member.name}</h3>
            <div class="member-role">${member.role}</div>
            <div class="member-allocation">Allocation: ${member.allocation}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <img src="${IMOTION_BRAND.logos.compact}" alt="${IMOTION_BRAND.logos.alt}" class="footer-logo">
      <div class="footer-text">
        <strong>${IMOTION_BRAND.company.name}</strong> - ${IMOTION_BRAND.company.tagline}<br>
        ${IMOTION_BRAND.company.website} | ${IMOTION_BRAND.company.email}
      </div>
      <div class="footer-meta">
        Planning généré le ${new Date(generatedAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}<br>
        ID: ${planningId}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
