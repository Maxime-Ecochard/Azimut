export function renderNutritionPlan(container) {
  const planData = localStorage.getItem('azimut_nutrition_plan');
  const plan = planData ? JSON.parse(planData) : null;

  function updateView() {
    container.innerHTML = \`
      <div class="page flex-col">
        <header class="sport-header">
          <a href="#/sport" class="back-btn">
            <i data-lucide="arrow-left"></i>
          </a>
          <h1 class="text-gradient-sport" style="font-size: var(--text-2xl); margin: 0;">Nutrition</h1>
        </header>

        <main class="page-content" style="padding-bottom: 120px;">
          \${plan ? renderPlan(plan) : renderEmptyState()}
        </main>
        
        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
          <a href="#/sport/coaching" class="nav-item">
            <i data-lucide="activity"></i>
            <span>Coaching</span>
          </a>
          <a href="#/sport/parcours" class="nav-item">
            <i data-lucide="map"></i>
            <span>Parcours</span>
          </a>
          <a href="#/sport/nutrition" class="nav-item active">
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
        <i data-lucide="apple" class="empty-state-icon"></i>
        <h2 class="empty-state-title">Stratégie Nutritionnelle</h2>
        <p style="color: var(--text-secondary); margin-bottom: var(--space-lg);">
          Prépare ta nutrition pendant l’effort, ultra-personnalisée à ton profil et à ta course.
        </p>
        <a href="#/sport/nutrition/setup" class="btn btn-primary">Créer ma stratégie</a>
      </div>
    \`;
  }

  function renderPlan(plan) {
    return \`
      <div class="glass-card" style="padding: var(--space-md); margin-bottom: var(--space-xl); background: var(--glass-bg-strong);">
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--accent-sport);">\${plan.targetCarbsPerHour}g</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase;">Glucides / h</div>
          </div>
          <div>
            <div style="font-size: var(--text-2xl); font-weight: 700; color: var(--info);">\${plan.timeline[0]?.hydrationMl || 500}ml</div>
            <div style="font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase;">Eau / h</div>
          </div>
        </div>
      </div>

      <h2 class="section-title">Timeline de Course</h2>
      <div class="timeline" style="display: flex; flex-direction: column; gap: var(--space-md);">
        \${plan.timeline.map(slot => \`
          <div class="glass-card" style="padding: var(--space-md); display: flex; gap: var(--space-md);">
            <div style="display: flex; flex-direction: column; align-items: center; min-width: 60px;">
              <div style="font-weight: 700; color: var(--text-primary);">\${slot.label}</div>
              <div style="color: var(--text-muted); font-size: 12px;">\${slot.actualCarbs}g gl.</div>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column; gap: var(--space-sm); border-left: 1px solid var(--glass-border); padding-left: var(--space-md);">
              \${slot.products.map(p => \`
                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); padding: var(--space-sm); border-radius: var(--radius-sm);">
                  <div>
                    <div style="font-size: var(--text-sm); font-weight: 600;">\${p.name} (\${p.flavor})</div>
                    <div style="font-size: 11px; color: var(--text-secondary);">\${p.brand} • \${p.category}</div>
                  </div>
                  <div class="badge badge-sport">\${p.carbsPerUnit}g</div>
                </div>
              \`).join('')}
              \${slot.products.length === 0 ? \`<div style="color: var(--text-muted); font-size: var(--text-sm);">Aucun produit requis (fin de course)</div>\` : ''}
            </div>
          </div>
        \`).join('')}
      </div>
      
      <div style="margin-top: var(--space-xl); text-align: center;">
        <button class="btn btn-ghost btn-sm" onclick="if(confirm('Refaire la stratégie ?')) { localStorage.removeItem('azimut_nutrition_plan'); window.location.reload(); }">Reconfigurer</button>
      </div>
    \`;
  }

  updateView();
}
