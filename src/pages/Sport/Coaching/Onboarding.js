import { getAvailablePrograms, generateTrainingPlan } from '../../../utils/trainingEngine.js';

export function renderCoachingOnboarding(container) {
  let currentStep = 1;
  const formData = {
    programId: '',
    level: 'Débutant',
    sessionsPerWeek: 3,
    targetDate: '',
    preferredDays: ['Lundi', 'Mercredi', 'Vendredi']
  };

  const programs = getAvailablePrograms();

  function updateView() {
    container.innerHTML = \`
      <div class="page flex-col">
        <header class="sport-header">
          <a href="#/sport/coaching" class="back-btn">
            <i data-lucide="x"></i>
          </a>
          <h1 class="text-gradient-sport" style="font-size: var(--text-2xl); margin: 0;">Créer mon plan</h1>
        </header>

        <main class="page-content">
          <div class="progress-bar" style="margin-bottom: var(--space-lg);">
            <div class="progress-bar-fill" style="width: \${(currentStep / 3) * 100}%;"></div>
          </div>

          \${renderStep(currentStep)}

        </main>
        
        <div class="bottom-nav" style="padding: var(--space-md); justify-content: space-between;">
          \${currentStep > 1 
            ? \`<button class="btn btn-ghost" id="btn-prev">Précédent</button>\` 
            : \`<div></div>\`}
          \${currentStep < 3 
            ? \`<button class="btn btn-primary" id="btn-next" \${currentStep === 1 && !formData.programId ? 'disabled' : ''}>Suivant</button>\` 
            : \`<button class="btn btn-primary" id="btn-submit">Générer mon plan</button>\`}
        </div>
      </div>
    \`;

    // Re-bind icons
    if (window.lucide) window.lucide.createIcons();
    attachEvents();
  }

  function renderStep(step) {
    if (step === 1) {
      return \`
        <h2 class="section-title">Quel est ton objectif ?</h2>
        <div class="hub-grid" style="grid-template-columns: 1fr; gap: var(--space-sm);">
          \${programs.map(p => \`
            <div class="glass-card program-card \${formData.programId === p.id ? 'active' : ''}" data-id="\${p.id}" style="padding: var(--space-md); cursor: pointer; border-color: \${formData.programId === p.id ? 'var(--accent-sport)' : 'var(--glass-border)'}">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600;">\${p.name}</span>
                <span class="badge badge-sport">\${p.durationWeeks} sem.</span>
              </div>
            </div>
          \`).join('')}
        </div>
      \`;
    }

    if (step === 2) {
      return \`
        <h2 class="section-title">Ton profil de coureur</h2>
        <div class="flex-col gap-lg">
          <div>
            <label class="input-label">Niveau actuel</label>
            <div class="scroll-x" id="level-selector">
              \${['Débutant', 'Intermédiaire', 'Confirmé', 'Expert'].map(l => \`
                <div class="chip \${formData.level === l ? 'active' : ''}" data-value="\${l}">\${l}</div>
              \`).join('')}
            </div>
          </div>
          <div>
            <label class="input-label">Combien de séances par semaine ? (\${formData.sessionsPerWeek})</label>
            <input type="range" class="range-slider" id="sessions-slider" min="2" max="6" value="\${formData.sessionsPerWeek}">
          </div>
        </div>
      \`;
    }

    if (step === 3) {
      return \`
        <h2 class="section-title">Résumé de la préparation</h2>
        <div class="glass-card" style="padding: var(--space-lg);">
          <div class="stat-box" style="margin-bottom: var(--space-md);">
            <span class="stat-label">Programme</span>
            <span class="stat-value" style="font-size: var(--text-xl);">\${programs.find(p => p.id === formData.programId)?.name}</span>
          </div>
          <div class="stat-box" style="margin-bottom: var(--space-md);">
            <span class="stat-label">Profil</span>
            <span class="stat-value" style="font-size: var(--text-xl);">\${formData.level} (\${formData.sessionsPerWeek}x / sem)</span>
          </div>
          <div class="stat-box">
            <span class="stat-label">Date de course cible (Optionnel)</span>
            <input type="date" class="input-field" id="target-date" value="\${formData.targetDate}" style="margin-top: var(--space-xs);">
          </div>
        </div>
        <p style="margin-top: var(--space-lg); color: var(--text-secondary); text-align: center;">
          Ton plan dynamique s'ajustera automatiquement en fonction de tes retours après chaque séance.
        </p>
      \`;
    }
  }

  function attachEvents() {
    const nextBtn = document.getElementById('btn-next');
    const prevBtn = document.getElementById('btn-prev');
    const submitBtn = document.getElementById('btn-submit');

    if (nextBtn) nextBtn.addEventListener('click', () => { currentStep++; updateView(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { currentStep--; updateView(); });
    
    if (submitBtn) submitBtn.addEventListener('click', () => {
      // Generate and save plan
      const plan = generateTrainingPlan(formData);
      localStorage.setItem('azimut_active_plan', JSON.stringify(plan));
      window.location.hash = '#/sport/coaching'; // Redirect back to dashboard
    });

    // Step 1: Program selection
    if (currentStep === 1) {
      document.querySelectorAll('.program-card').forEach(card => {
        card.addEventListener('click', (e) => {
          formData.programId = e.currentTarget.dataset.id;
          updateView();
        });
      });
    }

    // Step 2: Level & Slider
    if (currentStep === 2) {
      document.querySelectorAll('#level-selector .chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
          formData.level = e.currentTarget.dataset.value;
          updateView();
        });
      });
      const slider = document.getElementById('sessions-slider');
      slider.addEventListener('input', (e) => {
        formData.sessionsPerWeek = parseInt(e.target.value);
        // Force update to refresh label but avoid losing focus if possible (for simplicity we re-render here, in real React it handles better)
        // For vanilla JS range slider, updating a label specifically is better:
        document.querySelector('.input-label').textContent = \`Combien de séances par semaine ? (\${formData.sessionsPerWeek})\`;
      });
    }

    // Step 3: Date
    if (currentStep === 3) {
      const dateInput = document.getElementById('target-date');
      dateInput.addEventListener('change', (e) => {
        formData.targetDate = e.target.value;
      });
    }
  }

  updateView();
}
