import { generateRoute, downloadFile } from '../../../utils/routeGenerator.js';

export function renderRouteGenerator(container) {
  let activeTab = 'form'; // 'form' or 'map'
  let currentRoute = null;
  let mapInstance = null; // Leaflet map

  function updateView() {
    if (activeTab === 'form') {
      renderForm();
    } else {
      renderMap();
    }
  }

  function renderForm() {
    container.innerHTML = \`
      <div class="page flex-col">
        <header class="sport-header">
          <a href="#/sport" class="back-btn">
            <i data-lucide="arrow-left"></i>
          </a>
          <h1 class="text-gradient-sport" style="font-size: var(--text-2xl); margin: 0;">Parcours</h1>
        </header>

        <main class="page-content" style="padding-bottom: 120px;">
          <h2 class="section-title">Nouveau parcours</h2>
          
          <div class="glass-card" style="padding: var(--space-lg); margin-bottom: var(--space-xl);">
            <div class="flex-col gap-lg">
              
              <!-- Activité -->
              <div>
                <label class="input-label">Activité</label>
                <div class="scroll-x" id="activity-selector">
                  <div class="chip active" data-value="foot">Course à pied</div>
                  <div class="chip" data-value="foot">Marche</div>
                  <div class="chip" data-value="bike">Vélo</div>
                </div>
              </div>

              <!-- Distance -->
              <div>
                <label class="input-label" id="distance-label">Distance ciblée : 10 km</label>
                <input type="range" class="range-slider" id="distance-slider" min="3" max="50" value="10">
              </div>

              <!-- Terrain (UI seulement pour la démo) -->
              <div>
                <label class="input-label">Terrain</label>
                <div class="scroll-x">
                  <div class="chip active">Route</div>
                  <div class="chip">Nature</div>
                  <div class="chip">Mixte</div>
                </div>
              </div>

              <button class="btn btn-primary btn-full" id="btn-generate" style="margin-top: var(--space-md);">
                Générer un tracé (~3 sec)
              </button>
            </div>
          </div>
          
          <div id="loading-state" style="display: none; text-align: center; padding: var(--space-xl) 0;">
            <div class="spinner" style="margin: 0 auto var(--space-md);"></div>
            <p style="color: var(--text-secondary);">Calcul du meilleur itinéraire...</p>
          </div>

        </main>
        
        <!-- Bottom Navigation -->
        <nav class="bottom-nav">
          <a href="#/sport/coaching" class="nav-item">
            <i data-lucide="activity"></i>
            <span>Coaching</span>
          </a>
          <a href="#/sport/parcours" class="nav-item active">
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
    attachFormEvents();
  }

  function attachFormEvents() {
    const slider = document.getElementById('distance-slider');
    const label = document.getElementById('distance-label');
    const generateBtn = document.getElementById('btn-generate');
    const loadingState = document.getElementById('loading-state');
    
    let activity = 'foot';

    document.querySelectorAll('#activity-selector .chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('#activity-selector .chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        activity = e.currentTarget.dataset.value;
      });
    });

    slider.addEventListener('input', (e) => {
      label.textContent = \`Distance ciblée : \${e.target.value} km\`;
    });

    generateBtn.addEventListener('click', async () => {
      generateBtn.style.display = 'none';
      loadingState.style.display = 'block';

      try {
        // Paris par défaut pour la démo, ou utiliser la geolocation
        // Paris center: Lng: 2.3522, Lat: 48.8566
        // Pour varier un peu, on prend le Bois de Vincennes : 2.4333, 48.8333
        const startLngLat = [2.4333, 48.8333]; 
        const distance = parseInt(slider.value);

        currentRoute = await generateRoute(startLngLat, distance, activity);
        
        activeTab = 'map';
        updateView();
      } catch (err) {
        alert(err.message);
        generateBtn.style.display = 'flex';
        loadingState.style.display = 'none';
      }
    });
  }

  function renderMap() {
    container.innerHTML = \`
      <div class="page flex-col" style="padding-bottom: 0;">
        <header class="sport-header" style="position: absolute; top:0; left:0; right:0; background: rgba(10,10,15,0.8); backdrop-filter: blur(10px); z-index: 1000;">
          <button class="back-btn" id="btn-back-form">
            <i data-lucide="x"></i>
          </button>
          <div style="flex: 1; text-align: center;">
            <h1 class="text-gradient-sport" style="font-size: var(--text-lg); margin: 0;">\${currentRoute.distanceKm} km</h1>
            <p style="font-size: 12px; color: var(--text-secondary);">Boucle générée</p>
          </div>
          <button class="back-btn" id="btn-download" title="Exporter GPX" style="background: var(--accent-sport-glow); color: var(--accent-sport);">
            <i data-lucide="download"></i>
          </button>
        </header>

        <!-- Conteneur Leaflet -->
        <div id="map-container" style="flex: 1; width: 100%; height: 100dvh; background: #222;"></div>
        
        <!-- Overlay Stats en bas -->
        <div style="position: absolute; bottom: 30px; left: var(--space-md); right: var(--space-md); z-index: 1000;">
          <div class="glass-card" style="padding: var(--space-md); display: flex; justify-content: space-around; background: rgba(20,20,32,0.9);">
            <div class="stat-box" style="align-items: center;">
              <span class="stat-label">Distance</span>
              <span class="stat-value" style="font-size: var(--text-lg);">\${currentRoute.distanceKm}</span>
            </div>
            <div class="stat-box" style="align-items: center;">
              <span class="stat-label">Durée estimée</span>
              <span class="stat-value" style="font-size: var(--text-lg);">\${currentRoute.durationMin}m</span>
            </div>
          </div>
        </div>
      </div>
    \`;

    if (window.lucide) window.lucide.createIcons();
    
    // Init Leaflet
    setTimeout(() => {
      initLeafletMap();
    }, 100);

    document.getElementById('btn-back-form').addEventListener('click', () => {
      activeTab = 'form';
      updateView();
    });

    document.getElementById('btn-download').addEventListener('click', () => {
      downloadFile(\`azimut_parcours_\${currentRoute.distanceKm}km.gpx\`, currentRoute.gpx);
    });
  }

  function initLeafletMap() {
    if (!window.L) {
      alert('Leaflet nest pas chargé.');
      return;
    }

    const coords = currentRoute.coordinates; // Format OSRM: [lng, lat]
    // Leaflet attend [lat, lng]
    const latLngs = coords.map(c => [c[1], c[0]]);

    mapInstance = L.map('map-container', {
      zoomControl: false,
      attributionControl: false
    });

    // Tuiles sombres type CartoDB Dark Matter
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstance);

    // Tracer la ligne
    const polyline = L.polyline(latLngs, {
      color: 'var(--accent-sport)',
      weight: 5,
      opacity: 0.8
    }).addTo(mapInstance);

    // Ajouter marqueur de départ/arrivée
    const startPoint = latLngs[0];
    L.circleMarker(startPoint, {
      radius: 8,
      fillColor: 'white',
      color: 'var(--accent-sport)',
      weight: 3,
      opacity: 1,
      fillOpacity: 1
    }).addTo(mapInstance);

    // Centrer
    mapInstance.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }

  updateView();
}
