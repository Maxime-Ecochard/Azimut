export function renderHome(container) {
  container.innerHTML = `
    <div class="page flex-col">
      <header class="hub-header flex flex-col items-center gap-sm">
        <h1 class="text-gradient">Azimut</h1>
        <p class="tagline">Ton assistant personnel multi-pôles</p>
      </header>
      
      <main class="page-content">
        <div class="hub-grid">
          
          <!-- Sport (Actif) -->
          <a href="#/sport" class="hub-card sport-card glass-card animate-fadeInUp stagger-1">
            <div class="card-icon-wrapper">
              <i data-lucide="activity"></i>
            </div>
            <div class="card-content">
              <h2>Sport</h2>
              <p>Entraînement, Parcours & Nutrition</p>
            </div>
          </a>

          <!-- Rando / Bivouac -->
          <div class="hub-card rando-card glass-card animate-fadeInUp stagger-2 disabled">
            <div class="badge badge-coming">Bientôt</div>
            <div class="card-icon-wrapper">
              <i data-lucide="tent"></i>
            </div>
            <div class="card-content">
              <h2>Rando & Bivouac</h2>
              <p>Exploration et préparation de trek</p>
            </div>
          </div>

          <!-- Voyage -->
          <div class="hub-card voyage-card glass-card animate-fadeInUp stagger-3 disabled">
            <div class="badge badge-coming">Bientôt</div>
            <div class="card-icon-wrapper">
              <i data-lucide="plane"></i>
            </div>
            <div class="card-content">
              <h2>Voyage</h2>
              <p>Carnets et planificateur de voyage</p>
            </div>
          </div>

          <!-- Pro -->
          <div class="hub-card pro-card glass-card animate-fadeInUp stagger-4 disabled">
            <div class="badge badge-coming">Bientôt</div>
            <div class="card-icon-wrapper">
              <i data-lucide="briefcase"></i>
            </div>
            <div class="card-content">
              <h2>Pro</h2>
              <p>Gestion de projets et objectifs</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
}
