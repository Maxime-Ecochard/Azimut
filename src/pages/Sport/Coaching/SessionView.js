import { adjustPlanWithFeedback } from '../../../utils/trainingEngine.js';

export function renderSessionView(container, sessionIdParams) {
  // sessionIdParams is something like "1_w1_s1" (weekNum_sessionId)
  const planData = localStorage.getItem('azimut_active_plan');
  if (!planData) {
    window.location.hash = '#/sport/coaching';
    return;
  }

  const plan = JSON.parse(planData);
  
  // Find the session in the plan
  let targetSession = null;
  let targetWeek = null;
  
  for (const week of plan.weeks) {
    const session = week.sessions.find(s => sessionIdParams.endsWith(s.id));
    if (session) {
      targetSession = session;
      targetWeek = week;
      break;
    }
  }

  if (!targetSession) {
    container.innerHTML = \`<div class="page-content">Séance introuvable.</div>\`;
    return;
  }

  function updateView() {
    container.innerHTML = \`
      <div class="page flex-col">
        <header class="sport-header">
          <a href="#/sport/coaching" class="back-btn">
            <i data-lucide="arrow-left"></i>
          </a>
          <h1 class="text-gradient-sport" style="font-size: var(--text-2xl); margin: 0;">Séance</h1>
        </header>

        <main class="page-content" style="padding-bottom: 120px;">
          
          <div class="glass-card" style="padding: var(--space-xl); margin-bottom: var(--space-lg); text-align: center; background: linear-gradient(135deg, rgba(255, 107, 53, 0.05), transparent);">
            <div class="badge \${targetSession.status === 'completed' ? 'badge-success' : 'badge-sport'}" style="margin-bottom: var(--space-sm);">
              \${targetSession.status === 'completed' ? 'Terminée' : targetSession.dayName}
            </div>
            <h2 style="font-size: var(--text-3xl); margin-bottom: var(--space-xs);">\${targetSession.type}</h2>
            <p style="color: var(--text-secondary);">\${targetSession.description}</p>
            
            <div style="display: flex; justify-content: center; gap: var(--space-xl); margin-top: var(--space-lg);">
              <div class="stat-box">
                <span class="stat-label">Durée</span>
                <span class="stat-value">\${targetSession.durationMinutes}'</span>
              </div>
              <div class="stat-box">
                <span class="stat-label">Allure Cible</span>
                <span class="stat-value">\${targetSession.pace}</span>
              </div>
            </div>
          </div>

          <h3 class="section-title">Structure de la séance</h3>
          <div class="flex-col gap-sm" style="margin-bottom: var(--space-xl);">
            <div class="glass-card" style="padding: var(--space-md); border-left: 4px solid var(--glass-border-light);">
              <h4 style="font-size: var(--text-base); margin-bottom: 4px;">Échauffement</h4>
              <p style="color: var(--text-secondary); font-size: var(--text-sm);">15 min à allure très footing (7:00/km)</p>
            </div>
            <div class="glass-card" style="padding: var(--space-md); border-left: 4px solid var(--accent-sport);">
              <h4 style="font-size: var(--text-base); margin-bottom: 4px;">Corps de séance</h4>
              <p style="color: var(--text-secondary); font-size: var(--text-sm);">\${targetSession.durationMinutes - 25} min à \${targetSession.pace}/km</p>
            </div>
            <div class="glass-card" style="padding: var(--space-md); border-left: 4px solid var(--glass-border-light);">
              <h4 style="font-size: var(--text-base); margin-bottom: 4px;">Retour au calme</h4>
              <p style="color: var(--text-secondary); font-size: var(--text-sm);">10 min trot ou marche</p>
            </div>
          </div>

          \${targetSession.status === 'completed' 
            ? renderCompletedState(targetSession.feedback) 
            : renderFeedbackForm()}

        </main>
      </div>
    \`;

    if (window.lucide) window.lucide.createIcons();
    attachEvents();
  }

  function renderFeedbackForm() {
    return \`
      <div class="glass-card" style="padding: var(--space-lg);">
        <h3 class="section-title" style="margin-bottom: var(--space-xs);">Comment as-tu vécu l'effort ?</h3>
        <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-bottom: var(--space-md);">Ton ressenti nous aide à ajuster les prochaines séances.</p>
        
        <div class="flex-col gap-sm">
          <button class="btn btn-secondary feedback-btn" data-value="facile" style="justify-content: flex-start;">
            <span style="font-size: 20px;">😊</span> Plutôt facile à tenir
          </button>
          <button class="btn btn-secondary feedback-btn" data-value="faisable" style="justify-content: flex-start;">
            <span style="font-size: 20px;">💪</span> Difficile mais faisable
          </button>
          <button class="btn btn-secondary feedback-btn" data-value="difficile" style="justify-content: flex-start;">
            <span style="font-size: 20px;">😰</span> Trop difficile à tenir
          </button>
        </div>
      </div>
    \`;
  }

  function renderCompletedState(feedback) {
    const emojis = { facile: '😊', faisable: '💪', difficile: '😰' };
    const labels = { facile: 'Plutôt facile', faisable: 'Difficile mais faisable', difficile: 'Trop difficile' };

    return \`
      <div class="glass-card" style="padding: var(--space-lg); text-align: center;">
        <i data-lucide="check-circle" style="color: var(--success); width: 48px; height: 48px; margin-bottom: var(--space-sm);"></i>
        <h3 style="margin-bottom: var(--space-md);">Séance validée !</h3>
        <div style="display: inline-flex; align-items: center; gap: var(--space-sm); background: var(--glass-bg-strong); padding: var(--space-sm) var(--space-md); border-radius: var(--radius-full);">
          <span style="font-size: 18px;">\${emojis[feedback] || '✅'}</span>
          <span style="font-weight: 500;">\${labels[feedback] || 'Terminé'}</span>
        </div>
      </div>
    \`;
  }

  function attachEvents() {
    const feedbackBtns = document.querySelectorAll('.feedback-btn');
    feedbackBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const feedbackValue = e.currentTarget.dataset.value;
        
        // Update session status in plan
        targetSession.status = 'completed';
        targetSession.feedback = feedbackValue;
        
        // Let engine adjust future sessions
        const adjustedPlan = adjustPlanWithFeedback(plan, targetSession.id, feedbackValue);
        
        // Save back
        localStorage.setItem('azimut_active_plan', JSON.stringify(adjustedPlan));
        
        // Re-render
        updateView();
      });
    });
  }

  updateView();
}
