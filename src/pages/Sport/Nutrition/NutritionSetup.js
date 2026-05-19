import { generateNutritionPlan } from '../../../utils/nutritionEngine.js';

export function renderNutritionSetup(container) {
  const formData = {
    distance: 42,
    duration: 4, // heures
    weather: 'Tempéré',
    digestive: 'Tout passe',
    preferences: {
      avoidCategories: []
    }
  };

  function updateView() {
    container.innerHTML = \`
      <div class="page flex-col">
        <header class="sport-header">
          <a href="#/sport/nutrition" class="back-btn">
            <i data-lucide="x"></i>
          </a>
          <h1 class="text-gradient-sport" style="font-size: var(--text-2xl); margin: 0;">Configuration</h1>
        </header>

        <main class="page-content" style="padding-bottom: 120px;">
          <h2 class="section-title">Ton épreuve</h2>
          <div class="flex-col gap-lg">
            
            <div>
              <label class="input-label" id="dur-label">Durée estimée : \${formData.duration}h</label>
              <input type="range" class="range-slider" id="dur-slider" min="1" max="24" value="\${formData.duration}">
            </div>

            <div>
              <label class="input-label">Météo prévue</label>
              <div class="scroll-x" id="weather-selector">
                <div class="chip" data-value="Froid">Froid (<10°C)</div>
                <div class="chip active" data-value="Tempéré">Tempéré (10-20°C)</div>
                <div class="chip" data-value="Chaud">Chaud (>20°C)</div>
              </div>
            </div>

            <div>
              <label class="input-label">Profil digestif</label>
              <div class="scroll-x" id="digest-selector">
                <div class="chip" data-value="Parfois ça coince">Parfois ça coince</div>
                <div class="chip active" data-value="Tout passe">Tout passe</div>
              </div>
            </div>

            <div>
              <label class="input-label">À éviter (optionnel)</label>
              <div class="scroll-x" id="avoid-selector">
                <div class="chip" data-value="Gels">Gels</div>
                <div class="chip" data-value="Boissons">Boissons</div>
                <div class="chip" data-value="Barres">Barres</div>
              </div>
            </div>

            <button class="btn btn-primary btn-full" id="btn-generate" style="margin-top: var(--space-md);">
              Générer ma stratégie
            </button>
          </div>
        </main>
      </div>
    \`;

    if (window.lucide) window.lucide.createIcons();
    attachEvents();
  }

  function attachEvents() {
    const durSlider = document.getElementById('dur-slider');
    const durLabel = document.getElementById('dur-label');
    
    durSlider.addEventListener('input', (e) => {
      formData.duration = parseFloat(e.target.value);
      durLabel.textContent = \`Durée estimée : \${formData.duration}h\`;
    });

    const setupChips = (selectorId, field, multi = false) => {
      document.querySelectorAll(\`#\${selectorId} .chip\`).forEach(chip => {
        chip.addEventListener('click', (e) => {
          if (!multi) {
            document.querySelectorAll(\`#\${selectorId} .chip\`).forEach(c => c.classList.remove('active'));
            e.currentTarget.classList.add('active');
            formData[field] = e.currentTarget.dataset.value;
          } else {
            e.currentTarget.classList.toggle('active');
            const val = e.currentTarget.dataset.value;
            if (e.currentTarget.classList.contains('active')) {
              formData[field].push(val);
            } else {
              formData[field] = formData[field].filter(v => v !== val);
            }
          }
        });
      });
    };

    setupChips('weather-selector', 'weather');
    setupChips('digest-selector', 'digestive');
    setupChips('avoid-selector', 'avoidCategories', true); // Dans preferences.avoidCategories en fait, petit hack:
    
    document.querySelectorAll('#avoid-selector .chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
            const val = e.currentTarget.dataset.value;
            if (e.currentTarget.classList.contains('active')) {
              formData.preferences.avoidCategories.push(val);
            } else {
              formData.preferences.avoidCategories = formData.preferences.avoidCategories.filter(v => v !== val);
            }
        });
    });

    document.getElementById('btn-generate').addEventListener('click', () => {
      const plan = generateNutritionPlan(formData);
      localStorage.setItem('azimut_nutrition_plan', JSON.stringify(plan));
      window.location.hash = '#/sport/nutrition';
    });
  }

  updateView();
}
