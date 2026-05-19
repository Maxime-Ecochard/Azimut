export function renderCoachingDashboard(container) {
  const planData = localStorage.getItem('azimut_active_plan');
  const plan = planData ? JSON.parse(planData) : null;

  function updateView() {
    container.innerHTML = \`
      <div class="page flex-col">
        <header class="sport-header">
          <a href="#/sport" class="back-btn">
            <i data-lucide="arrow-left"></i>
          </a>
          <h1 class="text-gradient-sport" style="font-size: var(--text-2xl); margin: 0;">Coaching</h1>
        </header>
        <main class="page-content">
          \${plan ? renderActivePlan(plan) : renderEmptyState()}
        </main>
        
        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
          <a href="#/sport/coaching" class="nav-item active">
            <i data-lucide="activity"></i>
            <span>Coaching</span>
          </a>
          <a href="#/sport/parcours" class="nav-item">
            <i data-lucide="map"></i>
            <span>Parcours</span>
          </a>
          <a href="#/sport/nutrition" class="nav-item">
            <i data-lucide="apple"></i>
            <span>Nutrition</span>
          </a>
        </nav>
      </div>
    \`;

    if (window.lucide) window.lucide.createIcons();
  }

  function renderEmptyState() {
    return \`
      <div class="empty-state">
        <i data-lucide="activity" class="empty-state-icon"></i>
        <h2 class="empty-state-title">Aucun plan actif</h2>
        <p style="color: var(--text-secondary); margin-bottom: var(--space-lg);">
          Crée ton programme d'entraînement sur-mesure pour atteindre tes objectifs.
        </p>
        <a href="#/sport/coaching/onboarding" class="btn btn-primary">Démarrer l'onboarding</a>
      </div>
    \`;
  }

  function renderActivePlan(plan) {
    // Current week logic (simplified, assuming week 1)
    const currentWeekNum = 1;
    const currentWeek = plan.weeks.find(w => w.weekNumber === currentWeekNum);
    
    // Calculate stats
    const completedSessions = currentWeek.sessions.filter(s => s.status === 'completed').length;
    const totalSessions = currentWeek.sessions.length;

    return \`
      <!-- Progression Bar -->
      <div class="glass-card" style="padding: var(--space-md); margin-bottom: var(--space-lg);">
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-xs);">
          <span style="font-weight: 600; font-size: var(--text-sm);">\${plan.programName}</span>
          <span style="color: var(--text-secondary); font-size: var(--text-sm);">Semaine \${currentWeekNum}/\${plan.totalWeeks}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: \${(currentWeekNum / plan.totalWeeks) * 100}%;"></div>
        </div>
      </div>

      <!-- Semaine en cours -->
      <h2 class="section-title">Semaine en cours (\${currentWeek.type})</h2>
      <div class="flex-col gap-sm" style="margin-bottom: var(--space-lg);">
        \${currentWeek.sessions.map((s, index) => renderSessionCard(s, currentWeekNum, index)).join('')}
      </div>

      <!-- Stats Hebdo -->
      <h2 class="section-title">Statistiques Hebdo</h2>
      <div class="hub-grid" style="grid-template-columns: 1fr 1fr;">
        <div class="glass-card" style="padding: var(--space-md);">
          <div class="stat-box">
            <span class="stat-label">Assiduité</span>
            <span class="stat-value">\${completedSessions} / \${totalSessions}</span>
            <span class="stat-delta \${completedSessions > 0 ? 'up' : ''}">
              \${completedSessions > 0 ? '<i data-lucide="trending-up" style="width:12px"></i> En hausse' : '-'}
            </span>
          </div>
        </div>
        <div class="glass-card" style="padding: var(--space-md);">
          <div class="stat-box">
            <span class="stat-label">Temps estimé</span>
            <span class="stat-value">\${currentWeek.sessions.reduce((acc, s) => acc + s.durationMinutes, 0)} min</span>
          </div>
        </div>
      </div>
      
      <div style="margin-top: var(--space-xl); text-align: center;">
        <button class="btn btn-ghost btn-sm" onclick="if(confirm('Supprimer ce plan ?')) { localStorage.removeItem('azimut_active_plan'); window.location.reload(); }">Abandonner le plan</button>
      </div>
    \`;
  }

  function renderSessionCard(session, weekNum, sessionIndex) {
    const isCompleted = session.status === 'completed';
    const isNext = session.status === 'pending' && sessionIndex === 0; // Simplification pour la démo

    return \`
      <div class="glass-card" style="padding: var(--space-md); border-color: \${isNext ? 'var(--accent-sport)' : 'var(--glass-border)'}; opacity: \${isCompleted ? '0.6' : '1'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-sm);">
          <div>
            <div style="color: var(--text-secondary); font-size: var(--text-xs); margin-bottom: 2px;">\${session.dayName}</div>
            <h3 style="font-size: var(--text-base); font-weight: 600;">\${session.type}</h3>
          </div>
          <div class="badge \${isCompleted ? 'badge-success' : (isNext ? 'badge-sport' : 'badge-coming')}">
            \${isCompleted ? 'Fait' : (isNext ? 'Aujourd\\'hui' : 'À venir')}
          </div>
        </div>
        <div style="display: flex; gap: var(--space-md); color: var(--text-muted); font-size: var(--text-sm); margin-bottom: var(--space-md);">
          <span style="display: flex; align-items: center; gap: 4px;"><i data-lucide="clock" style="width: 14px;"></i> \${session.durationMinutes} min</span>
          <span style="display: flex; align-items: center; gap: 4px;"><i data-lucide="zap" style="width: 14px;"></i> \${session.pace} /km</span>
        </div>
        
        <a href="#/sport/coaching/session/\${weekNum}_\${session.id}" class="btn \${isNext ? 'btn-primary' : 'btn-secondary'} btn-full btn-sm">
          \${isCompleted ? 'Voir le débrief' : 'Détails de la séance'}
        </a>
      </div>
    \`;
  }

  updateView();
}
