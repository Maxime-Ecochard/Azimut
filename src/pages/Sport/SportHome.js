export function renderSportHome(container) {
  container.innerHTML = `
    <div class="page flex-col">
      <header class="sport-header">
        <a href="#/" class="back-btn">
          <i data-lucide="arrow-left"></i>
        </a>
        <h1 class="text-gradient-sport" style="font-size: var(--text-2xl); margin: 0;">Sport</h1>
      </header>
      
      <main class="page-content">
        <div class="dashboard-grid">
          
          <!-- Coaching Card -->
          <div class="module-card glass-card animate-fadeInUp stagger-1">
            <div class="module-card-header">
              <i data-lucide="activity" class="module-icon"></i>
              <h3>Coaching & Plan</h3>
            </div>
            <p style="color: var(--text-secondary); font-size: var(--text-sm);">
              Plan d'entraînement sur-mesure et dynamique.
            </p>
            <div class="stat-box" style="margin-top: var(--space-sm);">
              <span class="stat-label">Statut</span>
              <span class="stat-value" style="font-size: var(--text-lg); color: var(--text-muted);">Aucun plan actif</span>
            </div>
            <a href="#/sport/coaching" class="btn btn-primary btn-full" style="margin-top: var(--space-md);">
              Créer mon plan
            </a>
          </div>

          <!-- Parcours Card -->
          <div class="module-card glass-card animate-fadeInUp stagger-2">
            <div class="module-card-header">
              <i data-lucide="map" class="module-icon"></i>
              <h3>Parcours</h3>
            </div>
            <p style="color: var(--text-secondary); font-size: var(--text-sm);">
              Génère des boucles de course ou vélo en 3 secondes.
            </p>
            <a href="#/sport/parcours" class="btn btn-secondary btn-full" style="margin-top: var(--space-md);">
              Planifier un parcours
            </a>
          </div>

          <!-- Nutrition Card -->
          <div class="module-card glass-card animate-fadeInUp stagger-3">
            <div class="module-card-header">
              <i data-lucide="apple" class="module-icon"></i>
              <h3>Nutrition</h3>
            </div>
            <p style="color: var(--text-secondary); font-size: var(--text-sm);">
              Stratégie nutritionnelle ultra-personnalisée pour la course.
            </p>
            <a href="#/sport/nutrition" class="btn btn-secondary btn-full" style="margin-top: var(--space-md);">
              Ma stratégie
            </a>
          </div>

        </div>
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
        <a href="#/sport/nutrition" class="nav-item">
          <i data-lucide="apple"></i>
          <span>Nutrition</span>
        </a>
      </nav>
    </div>
  `;
}
