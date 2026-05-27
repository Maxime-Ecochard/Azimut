/* ============================================
   AZIMUT — Application Complète (Single File)
   Fonctionne sans serveur, sans node_modules.
   ============================================ */

;(function() {
  'use strict';

  // Global Pomodoro Timer State for Pôle Pro
  var proTimerState = {
    timeLeft: 25 * 60,
    duration: 25 * 60,
    running: false,
    endTime: 0,
    mode: 'focus',
    activeTask: null
  };
  var proTimerIntervalId = null;

  function initProTimer() {
    var running = localStorage.getItem('azimut_pro_timer_running') === 'true';
    if (running) {
      var endTime = parseInt(localStorage.getItem('azimut_pro_timer_endtime')) || 0;
      var mode = localStorage.getItem('azimut_pro_timer_mode') || 'focus';
      var duration = parseInt(localStorage.getItem('azimut_pro_timer_duration')) || (25 * 60);
      var diff = Math.round((endTime - Date.now()) / 1000);
      
      if (diff > 0) {
        proTimerState.running = true;
        proTimerState.endTime = endTime;
        proTimerState.mode = mode;
        proTimerState.duration = duration;
        proTimerState.timeLeft = diff;
        
        startProInterval();
      } else {
        localStorage.setItem('azimut_pro_timer_running', 'false');
        proTimerState.running = false;
        proTimerState.timeLeft = duration;
        proTimerState.duration = duration;
        proTimerState.mode = mode;
      }
    } else {
      var savedTimeLeft = localStorage.getItem('azimut_pro_timer_timeleft');
      var mode = localStorage.getItem('azimut_pro_timer_mode') || 'focus';
      var duration = parseInt(localStorage.getItem('azimut_pro_timer_duration')) || (25 * 60);
      
      proTimerState.running = false;
      proTimerState.mode = mode;
      proTimerState.duration = duration;
      proTimerState.timeLeft = savedTimeLeft ? parseInt(savedTimeLeft) : duration;
    }
  }

  function startProInterval() {
    if (proTimerIntervalId) clearInterval(proTimerIntervalId);
    proTimerIntervalId = setInterval(function() {
      var diff = Math.round((proTimerState.endTime - Date.now()) / 1000);
      if (diff <= 0) {
        clearInterval(proTimerIntervalId);
        proTimerIntervalId = null;
        proTimerState.running = false;
        proTimerState.timeLeft = proTimerState.duration;
        localStorage.setItem('azimut_pro_timer_running', 'false');
        
        playFocusBell();
        
        if (proTimerState.activeTask) {
          // Mark task completed
          var tasks = JSON.parse(localStorage.getItem('azimut_pro_tasks') || '[]');
          var task = tasks.find(function(t) { return t.id === proTimerState.activeTask.id; });
          if (task) {
            task.completed = true;
            localStorage.setItem('azimut_pro_tasks', JSON.stringify(tasks));
          }
          proTimerState.activeTask = null;
        }
        
        alert("Timer terminé ! " + (proTimerState.mode === 'focus' ? "Travail terminé, c'est l'heure d'une pause." : "Pause terminée, retour au travail !"));
        
        if (window.location.hash === '#/pro') {
          renderPro(document.getElementById('app'));
        }
      } else {
        proTimerState.timeLeft = diff;
        if (window.location.hash === '#/pro') {
          updateTimerUI();
        }
      }
    }, 1000);
  }

  function playFocusBell() {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      var ctx = new AudioContext();
      var now = ctx.currentTime;
      var frequencies = [523.25, 783.99, 1046.50, 1318.51, 1567.98];
      var gains = [0.5, 0.25, 0.15, 0.1, 0.05];
      
      frequencies.forEach(function(freq, i) {
        var osc = ctx.createOscillator();
        var gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gainNode.gain.setValueAtTime(gains[i], now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      });
    } catch (e) {
      console.error('Audio synthesis failed:', e);
    }
  }

  function updateTimerUI() {
    var timeDisplay = document.getElementById('timer-display-time');
    var modeDisplay = document.getElementById('timer-display-mode');
    var fill = document.getElementById('timer-progress-fill');
    var toggleBtn = document.getElementById('btn-timer-toggle');
    if (!timeDisplay || !modeDisplay || !fill || !toggleBtn) return;
    
    var m = Math.floor(proTimerState.timeLeft / 60);
    var s = proTimerState.timeLeft % 60;
    timeDisplay.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    
    var modeLabels = {
      focus: 'Focus',
      shortBreak: 'Pause',
      longBreak: 'Longue Pause'
    };
    modeDisplay.textContent = modeLabels[proTimerState.mode] || 'Focus';
    
    var offset = 565.48 - (proTimerState.timeLeft / proTimerState.duration) * 565.48;
    fill.style.strokeDashoffset = offset;
    
    if (proTimerState.running) {
      toggleBtn.innerHTML = '<i data-lucide="pause"></i> Pause';
    } else {
      toggleBtn.innerHTML = '<i data-lucide="play"></i> Démarrer';
    }
    
    var colors = {
      focus: 'var(--accent-pro)',
      shortBreak: '#10B981',
      longBreak: '#3B82F6'
    };
    fill.style.stroke = colors[proTimerState.mode] || 'var(--accent-pro)';
    
    if (window.lucide) {
      try { window.lucide.createIcons(); } catch(e) {}
    }
  }

  // ============================================
  // DATA — Produits Nutritionnels
  // ============================================
  const NUTRITION_PRODUCTS = [
    { id: 'p1', brand: 'Overstims', name: 'Gel Energix', category: 'Gels', flavor: 'Citron', carbsPer100g: 76, weightGram: 28, carbsPerUnit: 21 },
    { id: 'p2', brand: 'Baouw', name: 'Barre Energétique', category: 'Barres', flavor: 'Cacao Noisette', carbsPer100g: 50, weightGram: 25, carbsPerUnit: 12.5 },
    { id: 'p3', brand: 'Maurten', name: 'Drink Mix 160', category: 'Boissons', flavor: 'Neutre', carbsPer100g: 99, weightGram: 40, carbsPerUnit: 39 },
    { id: 'p4', brand: 'Powerbar', name: 'PowerGel Original', category: 'Gels', flavor: 'Pomme verte', carbsPer100g: 65, weightGram: 41, carbsPerUnit: 26.5 },
    { id: 'p5', brand: 'Decathlon', name: 'Pâte de fruits', category: 'Pâtes de fruits', flavor: 'Fraise', carbsPer100g: 82, weightGram: 25, carbsPerUnit: 20.5 }
  ];

  // ============================================
  // ENGINE — Entraînement (Campus Coach)
  // ============================================
  const PROGRAMS = [
    { id: 'marathon', name: 'Marathon', durationWeeks: 12 },
    { id: 'semi', name: 'Semi-Marathon', durationWeeks: 10 },
    { id: '10k', name: '10km', durationWeeks: 8 },
    { id: '5k', name: '5km', durationWeeks: 6 },
    { id: 'trail', name: 'Trail', durationWeeks: 12 },
    { id: 'debuter', name: 'Débuter en course à pied', durationWeeks: 8 },
    { id: 'vitesse', name: 'Améliorer sa vitesse', durationWeeks: 6 },
    { id: 'endurance', name: 'Améliorer son endurance', durationWeeks: 8 }
  ];

  function calculateBasePace(level) {
    switch(level) {
      case 'Débutant': return 7.5;
      case 'Intermédiaire': return 6.0;
      case 'Confirmé': return 5.0;
      case 'Expert': return 4.2;
      default: return 6.5;
    }
  }

  function formatPace(paceDecimal) {
    var min = Math.floor(paceDecimal);
    var sec = Math.round((paceDecimal - min) * 60);
    return min + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function determineSessionType(sessionIndex, totalSessions, weekType) {
    if (sessionIndex === 0) {
      return { name: 'Endurance Fondamentale', duration: 45, paceMultiplier: 1.1, desc: 'Footing souple, tu dois pouvoir parler.' };
    } else if (sessionIndex === totalSessions - 1) {
      return { name: 'Sortie Longue', duration: weekType === 'Affûtage' ? 60 : 90, paceMultiplier: 1.15, desc: "Travailler l'endurance sur la durée." };
    } else {
      if (weekType === 'Spécifique') {
        return { name: 'Allure Spécifique', duration: 60, paceMultiplier: 0.95, desc: "Travail à l'allure cible de ta course." };
      }
      return { name: 'Fractionné', duration: 50, paceMultiplier: 0.85, desc: 'Intervalles courts pour développer la VMA.' };
    }
  }

  function generateTrainingPlan(profile) {
    var programId = profile.programId, level = profile.level, sessionsPerWeek = profile.sessionsPerWeek, targetDate = profile.targetDate, preferredDays = profile.preferredDays;
    var program = PROGRAMS.find(function(p) { return p.id === programId; }) || PROGRAMS[0];
    var totalWeeks = program.durationWeeks;
    var basePace = calculateBasePace(level);

    var plan = {
      id: 'plan_' + Date.now(),
      programName: program.name,
      totalWeeks: totalWeeks,
      sessionsPerWeek: sessionsPerWeek,
      basePace: basePace,
      targetDate: targetDate,
      startDate: new Date().toISOString(),
      weeks: []
    };

    for (var w = 1; w <= totalWeeks; w++) {
      var weekType = w === totalWeeks ? 'Affûtage' : (w <= totalWeeks / 2 ? 'Développement' : 'Spécifique');
      var week = { weekNumber: w, type: weekType, sessions: [] };
      var defaultDays = ['Lundi', 'Mercredi', 'Vendredi', 'Dimanche'];
      var daysToRun = preferredDays.length >= sessionsPerWeek ? preferredDays.slice(0, sessionsPerWeek) : defaultDays.slice(0, sessionsPerWeek);

      for (var s = 0; s < sessionsPerWeek; s++) {
        var sessionType = determineSessionType(s, sessionsPerWeek, weekType);
        week.sessions.push({
          id: 'w' + w + '_s' + (s + 1),
          dayName: daysToRun[s],
          type: sessionType.name,
          durationMinutes: sessionType.duration,
          description: sessionType.desc,
          pace: formatPace(basePace * sessionType.paceMultiplier),
          status: 'pending',
          feedback: null
        });
      }
      plan.weeks.push(week);
    }
    return plan;
  }

  // ============================================
  // ENGINE — Nutrition (myRavito)
  // ============================================
  function calculateCarbsNeed(durationHours, weather) {
    var baseCarbs = 40;
    if (durationHours > 3) baseCarbs += 20;
    if (weather === 'Froid') baseCarbs += 10;
    return baseCarbs;
  }

  function generateNutritionPlan(profile) {
    var durationHours = parseFloat(profile.duration);
    var targetCarbsPerHour = calculateCarbsNeed(durationHours, profile.weather);
    var allowedProducts = NUTRITION_PRODUCTS.filter(function(p) {
      return !profile.preferences.avoidCategories.includes(p.category);
    });

    var plan = { id: 'nutri_' + Date.now(), targetCarbsPerHour: targetCarbsPerHour, totalDuration: durationHours, timeline: [] };

    for (var h = 1; h <= Math.ceil(durationHours); h++) {
      var isLastHour = h === Math.ceil(durationHours);
      var hourCarbs = 0;
      var hourProducts = [];
      for (var i = 0; i < allowedProducts.length; i++) {
        var p = allowedProducts[i];
        if (hourCarbs + p.carbsPerUnit <= targetCarbsPerHour + 10) {
          hourProducts.push(p);
          hourCarbs += p.carbsPerUnit;
        }
        if (hourCarbs >= targetCarbsPerHour - 5) break;
      }
      plan.timeline.push({
        hour: h,
        label: isLastHour ? 'Heure ' + h + ' (Fin)' : 'Heure ' + h,
        targetCarbs: targetCarbsPerHour,
        actualCarbs: hourCarbs,
        products: hourProducts,
        hydrationMl: profile.weather === 'Chaud' ? 700 : 500
      });
    }
    return plan;
  }

  // ============================================
  // ENGINE — Parcours (OSRM)
  // ============================================
  function generateWaypoints(startLngLat, distanceKm) {
    var lng = startLngLat[0], lat = startLngLat[1];
    var radiusKm = distanceKm / 6;
    var radiusDeg = radiusKm / 111;
    var waypoints = [];
    for (var angle = 60; angle <= 300; angle += 120) {
      var rad = angle * (Math.PI / 180);
      var r = radiusDeg * (0.8 + Math.random() * 0.4);
      var pLng = lng + (r * Math.cos(rad) / Math.cos(lat * Math.PI / 180));
      var pLat = lat + (r * Math.sin(rad));
      waypoints.push([pLng, pLat]);
    }
    return waypoints;
  }

  function generateRoute(startLngLat, distanceKm, profile) {
    var osrmProfile = profile === 'bike' ? 'bike' : 'foot';
    var waypoints = generateWaypoints(startLngLat, distanceKm);
    var coords = [startLngLat].concat(waypoints).concat([startLngLat]);
    var coordString = coords.map(function(c) { return c[0] + ',' + c[1]; }).join(';');
    var url = 'https://router.project-osrm.org/route/v1/' + osrmProfile + '/' + coordString + '?overview=full&geometries=geojson';

    return fetch(url)
      .then(function(response) { return response.json(); })
      .then(function(data) {
        if (data.code !== 'Ok') throw new Error('Erreur OSRM: ' + data.code);
        var route = data.routes[0];
        return {
          id: 'route_' + Date.now(),
          distanceKm: (route.distance / 1000).toFixed(2),
          durationMin: Math.round(route.duration / 60),
          coordinates: route.geometry.coordinates,
          center: startLngLat
        };
      });
  }

  function downloadFile(filename, content, type) {
    type = type || 'application/gpx+xml';
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ============================================
  // ICONS HELPER
  // ============================================
  function refreshIcons() {
    if (window.lucide) { try { window.lucide.createIcons(); } catch(e) {} }
  }

  // ============================================
  // PAGE — Home (Hub)
  // ============================================
  function renderHome(container) {
    container.innerHTML =
      '<div class="page flex-col">' +
        '<header class="hub-header flex flex-col items-center gap-sm">' +
          '<h1 class="text-gradient">Azimut</h1>' +
          '<p class="tagline">Ton assistant personnel multi-pôles</p>' +
        '</header>' +
        '<main class="page-content">' +
          '<div class="hub-grid">' +
            '<a href="#/sport" class="hub-card sport-card glass-card animate-fadeInUp stagger-1">' +
              '<div class="card-icon-wrapper"><i data-lucide="activity"></i></div>' +
              '<div class="card-content"><h2>Sport</h2><p>Entraînement, Parcours &amp; Nutrition</p></div>' +
            '</a>' +
            '<a href="#/rando" class="hub-card rando-card glass-card animate-fadeInUp stagger-2">' +
              '<div class="card-icon-wrapper"><i data-lucide="tent"></i></div>' +
              '<div class="card-content"><h2>Rando</h2><p>Éditeur GPX, Météo &amp; Cartes</p></div>' +
            '</a>' +
            '<div class="hub-card voyage-card glass-card animate-fadeInUp stagger-3 disabled">' +
              '<div class="badge badge-coming">Bientôt</div>' +
              '<div class="card-icon-wrapper"><i data-lucide="plane"></i></div>' +
              '<div class="card-content"><h2>Voyage</h2><p>Carnets et planificateur de voyage</p></div>' +
            '</div>' +
            '<a href="#/pro" class="hub-card pro-card glass-card animate-fadeInUp stagger-4">' +
              '<div class="card-icon-wrapper"><i data-lucide="briefcase"></i></div>' +
              '<div class="card-content"><h2>Pro</h2><p>Productivité : 3-2-1 &amp; Pomodoro</p></div>' +
            '</a>' +
          '</div>' +
        '</main>' +
      '</div>';
    refreshIcons();
  }

  // ============================================
  // PAGE — Sport Home
  // ============================================
  function renderSportHome(container) {
    container.innerHTML =
      '<div class="page flex-col">' +
        '<header class="sport-header">' +
          '<a href="#/" class="back-btn"><i data-lucide="arrow-left"></i></a>' +
          '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Sport</h1>' +
        '</header>' +
        '<main class="page-content">' +
          '<div class="dashboard-grid">' +
            '<div class="module-card glass-card animate-fadeInUp stagger-1">' +
              '<div class="module-card-header"><i data-lucide="activity" class="module-icon"></i><h3>Coaching &amp; Plan</h3></div>' +
              '<p style="color:var(--text-secondary);font-size:var(--text-sm);">Plan d\'entraînement sur-mesure et dynamique.</p>' +
              '<a href="#/sport/coaching" class="btn btn-primary btn-full" style="margin-top:var(--space-md);">Créer mon plan</a>' +
            '</div>' +
            '<div class="module-card glass-card animate-fadeInUp stagger-2">' +
              '<div class="module-card-header"><i data-lucide="map" class="module-icon"></i><h3>Parcours</h3></div>' +
              '<p style="color:var(--text-secondary);font-size:var(--text-sm);">Génère des boucles de course ou vélo en 3 secondes.</p>' +
              '<a href="#/sport/parcours" class="btn btn-secondary btn-full" style="margin-top:var(--space-md);">Planifier un parcours</a>' +
            '</div>' +
            '<div class="module-card glass-card animate-fadeInUp stagger-3">' +
              '<div class="module-card-header"><i data-lucide="apple" class="module-icon"></i><h3>Nutrition</h3></div>' +
              '<p style="color:var(--text-secondary);font-size:var(--text-sm);">Stratégie nutritionnelle ultra-personnalisée pour la course.</p>' +
              '<a href="#/sport/nutrition" class="btn btn-secondary btn-full" style="margin-top:var(--space-md);">Ma stratégie</a>' +
            '</div>' +
          '</div>' +
        '</main>' +
        '<nav class="bottom-nav">' +
          '<a href="#/sport/coaching" class="nav-item"><i data-lucide="activity"></i><span>Coaching</span></a>' +
          '<a href="#/sport/parcours" class="nav-item"><i data-lucide="map"></i><span>Parcours</span></a>' +
          '<a href="#/sport/nutrition" class="nav-item"><i data-lucide="apple"></i><span>Nutrition</span></a>' +
        '</nav>' +
      '</div>';
    refreshIcons();
  }

  // ============================================
  // PAGE — Coaching Dashboard
  // ============================================
  function renderCoachingDashboard(container) {
    var planData = localStorage.getItem('azimut_active_plan');
    var plan = planData ? JSON.parse(planData) : null;

    if (!plan) {
      container.innerHTML =
        '<div class="page flex-col">' +
          '<header class="sport-header">' +
            '<a href="#/sport" class="back-btn"><i data-lucide="arrow-left"></i></a>' +
            '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Coaching</h1>' +
          '</header>' +
          '<main class="page-content">' +
            '<div class="empty-state">' +
              '<i data-lucide="activity" class="empty-state-icon"></i>' +
              '<h2 class="empty-state-title">Aucun plan actif</h2>' +
              '<p style="color:var(--text-secondary);margin-bottom:var(--space-lg);">Crée ton programme d\'entraînement sur-mesure pour atteindre tes objectifs.</p>' +
              '<a href="#/sport/coaching/onboarding" class="btn btn-primary">Démarrer l\'onboarding</a>' +
            '</div>' +
          '</main>' +
          '<nav class="bottom-nav">' +
            '<a href="#/sport/coaching" class="nav-item active"><i data-lucide="activity"></i><span>Coaching</span></a>' +
            '<a href="#/sport/parcours" class="nav-item"><i data-lucide="map"></i><span>Parcours</span></a>' +
            '<a href="#/sport/nutrition" class="nav-item"><i data-lucide="apple"></i><span>Nutrition</span></a>' +
          '</nav>' +
        '</div>';
      refreshIcons();
      return;
    }

    var currentWeekNum = 1;
    var currentWeek = plan.weeks[0];
    var completedSessions = currentWeek.sessions.filter(function(s) { return s.status === 'completed'; }).length;
    var totalSessions = currentWeek.sessions.length;

    var sessionsHTML = currentWeek.sessions.map(function(s, index) {
      var isCompleted = s.status === 'completed';
      var isNext = s.status === 'pending' && index === 0;
      return '<div class="glass-card" style="padding:var(--space-md);border-color:' + (isNext ? 'var(--accent-sport)' : 'var(--glass-border)') + ';opacity:' + (isCompleted ? '0.6' : '1') + ';">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-sm);">' +
          '<div>' +
            '<div style="color:var(--text-secondary);font-size:var(--text-xs);margin-bottom:2px;">' + s.dayName + '</div>' +
            '<h3 style="font-size:var(--text-base);font-weight:600;">' + s.type + '</h3>' +
          '</div>' +
          '<div class="badge ' + (isCompleted ? 'badge-success' : (isNext ? 'badge-sport' : 'badge-coming')) + '">' +
            (isCompleted ? 'Fait' : (isNext ? "Aujourd'hui" : 'À venir')) +
          '</div>' +
        '</div>' +
        '<div style="display:flex;gap:var(--space-md);color:var(--text-muted);font-size:var(--text-sm);margin-bottom:var(--space-md);">' +
          '<span style="display:flex;align-items:center;gap:4px;"><i data-lucide="clock" style="width:14px;"></i> ' + s.durationMinutes + ' min</span>' +
          '<span style="display:flex;align-items:center;gap:4px;"><i data-lucide="zap" style="width:14px;"></i> ' + s.pace + ' /km</span>' +
        '</div>' +
        '<a href="#/sport/coaching/session/' + currentWeekNum + '_' + s.id + '" class="btn ' + (isNext ? 'btn-primary' : 'btn-secondary') + ' btn-full btn-sm">' +
          (isCompleted ? 'Voir le débrief' : 'Détails de la séance') +
        '</a>' +
      '</div>';
    }).join('');

    container.innerHTML =
      '<div class="page flex-col">' +
        '<header class="sport-header">' +
          '<a href="#/sport" class="back-btn"><i data-lucide="arrow-left"></i></a>' +
          '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Coaching</h1>' +
        '</header>' +
        '<main class="page-content">' +
          '<div class="glass-card" style="padding:var(--space-md);margin-bottom:var(--space-lg);">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:var(--space-xs);">' +
              '<span style="font-weight:600;font-size:var(--text-sm);">' + plan.programName + '</span>' +
              '<span style="color:var(--text-secondary);font-size:var(--text-sm);">Semaine ' + currentWeekNum + '/' + plan.totalWeeks + '</span>' +
            '</div>' +
            '<div class="progress-bar"><div class="progress-bar-fill" style="width:' + ((currentWeekNum / plan.totalWeeks) * 100) + '%;"></div></div>' +
          '</div>' +
          '<h2 class="section-title">Semaine en cours (' + currentWeek.type + ')</h2>' +
          '<div class="flex-col gap-sm" style="margin-bottom:var(--space-lg);">' + sessionsHTML + '</div>' +
          '<h2 class="section-title">Statistiques Hebdo</h2>' +
          '<div class="hub-grid" style="grid-template-columns:1fr 1fr;">' +
            '<div class="glass-card" style="padding:var(--space-md);"><div class="stat-box"><span class="stat-label">Assiduité</span><span class="stat-value">' + completedSessions + ' / ' + totalSessions + '</span></div></div>' +
            '<div class="glass-card" style="padding:var(--space-md);"><div class="stat-box"><span class="stat-label">Temps estimé</span><span class="stat-value">' + currentWeek.sessions.reduce(function(acc, s) { return acc + s.durationMinutes; }, 0) + ' min</span></div></div>' +
          '</div>' +
          '<div style="margin-top:var(--space-xl);text-align:center;"><button class="btn btn-ghost btn-sm" id="btn-abandon-plan">Abandonner le plan</button></div>' +
        '</main>' +
        '<nav class="bottom-nav">' +
          '<a href="#/sport/coaching" class="nav-item active"><i data-lucide="activity"></i><span>Coaching</span></a>' +
          '<a href="#/sport/parcours" class="nav-item"><i data-lucide="map"></i><span>Parcours</span></a>' +
          '<a href="#/sport/nutrition" class="nav-item"><i data-lucide="apple"></i><span>Nutrition</span></a>' +
        '</nav>' +
      '</div>';
    refreshIcons();

    var abandonBtn = document.getElementById('btn-abandon-plan');
    if (abandonBtn) {
      abandonBtn.addEventListener('click', function() {
        if (confirm('Supprimer ce plan ?')) {
          localStorage.removeItem('azimut_active_plan');
          router();
        }
      });
    }
  }

  // ============================================
  // PAGE — Coaching Onboarding
  // ============================================
  function renderCoachingOnboarding(container) {
    var currentStep = 1;
    var formData = {
      programId: '',
      level: 'Débutant',
      sessionsPerWeek: 3,
      targetDate: '',
      preferredDays: ['Lundi', 'Mercredi', 'Vendredi']
    };

    function render() {
      var stepContent = '';
      if (currentStep === 1) {
        stepContent =
          '<h2 class="section-title">Quel est ton objectif ?</h2>' +
          '<div class="hub-grid" style="grid-template-columns:1fr;gap:var(--space-sm);">' +
          PROGRAMS.map(function(p) {
            return '<div class="glass-card program-card" data-id="' + p.id + '" style="padding:var(--space-md);cursor:pointer;border-color:' + (formData.programId === p.id ? 'var(--accent-sport)' : 'var(--glass-border)') + ';">' +
              '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-weight:600;">' + p.name + '</span>' +
                '<span class="badge badge-sport">' + p.durationWeeks + ' sem.</span>' +
              '</div>' +
            '</div>';
          }).join('') +
          '</div>';
      } else if (currentStep === 2) {
        stepContent =
          '<h2 class="section-title">Ton profil de coureur</h2>' +
          '<div class="flex-col gap-lg">' +
            '<div>' +
              '<label class="input-label">Niveau actuel</label>' +
              '<div class="scroll-x" id="level-selector">' +
              ['Débutant', 'Intermédiaire', 'Confirmé', 'Expert'].map(function(l) {
                return '<div class="chip ' + (formData.level === l ? 'active' : '') + '" data-value="' + l + '">' + l + '</div>';
              }).join('') +
              '</div>' +
            '</div>' +
            '<div>' +
              '<label class="input-label" id="sessions-label">Combien de séances par semaine ? (' + formData.sessionsPerWeek + ')</label>' +
              '<input type="range" class="range-slider" id="sessions-slider" min="2" max="6" value="' + formData.sessionsPerWeek + '">' +
            '</div>' +
          '</div>';
      } else if (currentStep === 3) {
        var prog = PROGRAMS.find(function(p) { return p.id === formData.programId; });
        stepContent =
          '<h2 class="section-title">Résumé de la préparation</h2>' +
          '<div class="glass-card" style="padding:var(--space-lg);">' +
            '<div class="stat-box" style="margin-bottom:var(--space-md);"><span class="stat-label">Programme</span><span class="stat-value" style="font-size:var(--text-xl);">' + (prog ? prog.name : '') + '</span></div>' +
            '<div class="stat-box" style="margin-bottom:var(--space-md);"><span class="stat-label">Profil</span><span class="stat-value" style="font-size:var(--text-xl);">' + formData.level + ' (' + formData.sessionsPerWeek + 'x / sem)</span></div>' +
            '<div class="stat-box"><span class="stat-label">Date de course cible (Optionnel)</span><input type="date" class="input-field" id="target-date" value="' + formData.targetDate + '" style="margin-top:var(--space-xs);"></div>' +
          '</div>' +
          '<p style="margin-top:var(--space-lg);color:var(--text-secondary);text-align:center;">Ton plan dynamique s\'ajustera automatiquement en fonction de tes retours après chaque séance.</p>';
      }

      container.innerHTML =
        '<div class="page flex-col">' +
          '<header class="sport-header">' +
            '<a href="#/sport/coaching" class="back-btn"><i data-lucide="x"></i></a>' +
            '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Créer mon plan</h1>' +
          '</header>' +
          '<main class="page-content">' +
            '<div class="progress-bar" style="margin-bottom:var(--space-lg);"><div class="progress-bar-fill" style="width:' + ((currentStep / 3) * 100) + '%;"></div></div>' +
            stepContent +
          '</main>' +
          '<div class="bottom-nav" style="padding:var(--space-md);justify-content:space-between;">' +
            (currentStep > 1 ? '<button class="btn btn-ghost" id="btn-prev">Précédent</button>' : '<div></div>') +
            (currentStep < 3 ? '<button class="btn btn-primary" id="btn-next" ' + (currentStep === 1 && !formData.programId ? 'disabled' : '') + '>Suivant</button>' : '<button class="btn btn-primary" id="btn-submit">Générer mon plan</button>') +
          '</div>' +
        '</div>';

      refreshIcons();
      attachEvents();
    }

    function attachEvents() {
      var nextBtn = document.getElementById('btn-next');
      var prevBtn = document.getElementById('btn-prev');
      var submitBtn = document.getElementById('btn-submit');

      if (nextBtn) nextBtn.addEventListener('click', function() { currentStep++; render(); });
      if (prevBtn) prevBtn.addEventListener('click', function() { currentStep--; render(); });
      if (submitBtn) submitBtn.addEventListener('click', function() {
        var plan = generateTrainingPlan(formData);
        localStorage.setItem('azimut_active_plan', JSON.stringify(plan));
        window.location.hash = '#/sport/coaching';
      });

      if (currentStep === 1) {
        document.querySelectorAll('.program-card').forEach(function(card) {
          card.addEventListener('click', function(e) {
            formData.programId = e.currentTarget.dataset.id;
            render();
          });
        });
      }
      if (currentStep === 2) {
        document.querySelectorAll('#level-selector .chip').forEach(function(chip) {
          chip.addEventListener('click', function(e) {
            formData.level = e.currentTarget.dataset.value;
            render();
          });
        });
        var slider = document.getElementById('sessions-slider');
        if (slider) {
          slider.addEventListener('input', function(e) {
            formData.sessionsPerWeek = parseInt(e.target.value);
            var label = document.getElementById('sessions-label');
            if (label) label.textContent = 'Combien de séances par semaine ? (' + formData.sessionsPerWeek + ')';
          });
        }
      }
      if (currentStep === 3) {
        var dateInput = document.getElementById('target-date');
        if (dateInput) dateInput.addEventListener('change', function(e) { formData.targetDate = e.target.value; });
      }
    }

    render();
  }

  // ============================================
  // PAGE — Session View
  // ============================================
  function renderSessionView(container, sessionIdParams) {
    var planData = localStorage.getItem('azimut_active_plan');
    if (!planData) { window.location.hash = '#/sport/coaching'; return; }

    var plan = JSON.parse(planData);
    var targetSession = null, targetWeek = null;

    for (var i = 0; i < plan.weeks.length; i++) {
      var w = plan.weeks[i];
      for (var j = 0; j < w.sessions.length; j++) {
        if (sessionIdParams.endsWith(w.sessions[j].id)) {
          targetSession = w.sessions[j];
          targetWeek = w;
          break;
        }
      }
      if (targetSession) break;
    }

    if (!targetSession) {
      container.innerHTML = '<div class="page-content">Séance introuvable.</div>';
      return;
    }

    function render() {
      var feedbackSection = '';
      if (targetSession.status === 'completed') {
        var emojis = { facile: '😊', faisable: '💪', difficile: '😰' };
        var labels = { facile: 'Plutôt facile', faisable: 'Difficile mais faisable', difficile: 'Trop difficile' };
        feedbackSection =
          '<div class="glass-card" style="padding:var(--space-lg);text-align:center;">' +
            '<i data-lucide="check-circle" style="color:var(--success);width:48px;height:48px;margin-bottom:var(--space-sm);"></i>' +
            '<h3 style="margin-bottom:var(--space-md);">Séance validée !</h3>' +
            '<div style="display:inline-flex;align-items:center;gap:var(--space-sm);background:var(--glass-bg-strong);padding:var(--space-sm) var(--space-md);border-radius:var(--radius-full);">' +
              '<span style="font-size:18px;">' + (emojis[targetSession.feedback] || '✅') + '</span>' +
              '<span style="font-weight:500;">' + (labels[targetSession.feedback] || 'Terminé') + '</span>' +
            '</div>' +
          '</div>';
      } else {
        feedbackSection =
          '<div class="glass-card" style="padding:var(--space-lg);">' +
            '<h3 class="section-title" style="margin-bottom:var(--space-xs);">Comment as-tu vécu l\'effort ?</h3>' +
            '<p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:var(--space-md);">Ton ressenti nous aide à ajuster les prochaines séances.</p>' +
            '<div class="flex-col gap-sm">' +
              '<button class="btn btn-secondary feedback-btn" data-value="facile" style="justify-content:flex-start;"><span style="font-size:20px;">😊</span> Plutôt facile à tenir</button>' +
              '<button class="btn btn-secondary feedback-btn" data-value="faisable" style="justify-content:flex-start;"><span style="font-size:20px;">💪</span> Difficile mais faisable</button>' +
              '<button class="btn btn-secondary feedback-btn" data-value="difficile" style="justify-content:flex-start;"><span style="font-size:20px;">😰</span> Trop difficile à tenir</button>' +
            '</div>' +
          '</div>';
      }

      container.innerHTML =
        '<div class="page flex-col">' +
          '<header class="sport-header">' +
            '<a href="#/sport/coaching" class="back-btn"><i data-lucide="arrow-left"></i></a>' +
            '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Séance</h1>' +
          '</header>' +
          '<main class="page-content" style="padding-bottom:120px;">' +
            '<div class="glass-card" style="padding:var(--space-xl);margin-bottom:var(--space-lg);text-align:center;background:linear-gradient(135deg,rgba(255,107,53,0.05),transparent);">' +
              '<div class="badge ' + (targetSession.status === 'completed' ? 'badge-success' : 'badge-sport') + '" style="margin-bottom:var(--space-sm);">' + (targetSession.status === 'completed' ? 'Terminée' : targetSession.dayName) + '</div>' +
              '<h2 style="font-size:var(--text-3xl);margin-bottom:var(--space-xs);">' + targetSession.type + '</h2>' +
              '<p style="color:var(--text-secondary);">' + targetSession.description + '</p>' +
              '<div style="display:flex;justify-content:center;gap:var(--space-xl);margin-top:var(--space-lg);">' +
                '<div class="stat-box"><span class="stat-label">Durée</span><span class="stat-value">' + targetSession.durationMinutes + '\'</span></div>' +
                '<div class="stat-box"><span class="stat-label">Allure Cible</span><span class="stat-value">' + targetSession.pace + '</span></div>' +
              '</div>' +
            '</div>' +
            '<h3 class="section-title">Structure de la séance</h3>' +
            '<div class="flex-col gap-sm" style="margin-bottom:var(--space-xl);">' +
              '<div class="glass-card" style="padding:var(--space-md);border-left:4px solid var(--glass-border-light);"><h4 style="font-size:var(--text-base);margin-bottom:4px;">Échauffement</h4><p style="color:var(--text-secondary);font-size:var(--text-sm);">15 min à allure très footing (7:00/km)</p></div>' +
              '<div class="glass-card" style="padding:var(--space-md);border-left:4px solid var(--accent-sport);"><h4 style="font-size:var(--text-base);margin-bottom:4px;">Corps de séance</h4><p style="color:var(--text-secondary);font-size:var(--text-sm);">' + (targetSession.durationMinutes - 25) + ' min à ' + targetSession.pace + '/km</p></div>' +
              '<div class="glass-card" style="padding:var(--space-md);border-left:4px solid var(--glass-border-light);"><h4 style="font-size:var(--text-base);margin-bottom:4px;">Retour au calme</h4><p style="color:var(--text-secondary);font-size:var(--text-sm);">10 min trot ou marche</p></div>' +
            '</div>' +
            feedbackSection +
          '</main>' +
        '</div>';

      refreshIcons();

      document.querySelectorAll('.feedback-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          targetSession.status = 'completed';
          targetSession.feedback = e.currentTarget.dataset.value;
          localStorage.setItem('azimut_active_plan', JSON.stringify(plan));
          render();
        });
      });
    }
    render();
  }

  // ============================================
  // PAGE — Route Generator (Parcours)
  // ============================================
  function renderRouteGenerator(container) {
    var activeTab = 'form';
    var currentRoute = null;
    var mapInstance = null;

    function update() {
      if (activeTab === 'form') renderForm();
      else renderMap();
    }

    function renderForm() {
      container.innerHTML =
        '<div class="page flex-col">' +
          '<header class="sport-header">' +
            '<a href="#/sport" class="back-btn"><i data-lucide="arrow-left"></i></a>' +
            '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Parcours</h1>' +
          '</header>' +
          '<main class="page-content" style="padding-bottom:120px;">' +
            '<h2 class="section-title">Nouveau parcours</h2>' +
            '<div class="glass-card" style="padding:var(--space-lg);margin-bottom:var(--space-xl);">' +
              '<div class="flex-col gap-lg">' +
                '<div><label class="input-label">Activité</label><div class="scroll-x" id="activity-selector"><div class="chip active" data-value="foot">Course à pied</div><div class="chip" data-value="foot">Marche</div><div class="chip" data-value="bike">Vélo</div></div></div>' +
                '<div><label class="input-label" id="distance-label">Distance ciblée : 10 km</label><input type="range" class="range-slider" id="distance-slider" min="3" max="50" value="10"></div>' +
                '<div><label class="input-label">Terrain</label><div class="scroll-x"><div class="chip active">Route</div><div class="chip">Nature</div><div class="chip">Mixte</div></div></div>' +
                '<button class="btn btn-primary btn-full" id="btn-generate" style="margin-top:var(--space-md);">Générer un tracé (~3 sec)</button>' +
              '</div>' +
            '</div>' +
            '<div id="loading-state" style="display:none;text-align:center;padding:var(--space-xl) 0;"><div class="spinner" style="margin:0 auto var(--space-md);"></div><p style="color:var(--text-secondary);">Calcul du meilleur itinéraire...</p></div>' +
          '</main>' +
          '<nav class="bottom-nav">' +
            '<a href="#/sport/coaching" class="nav-item"><i data-lucide="activity"></i><span>Coaching</span></a>' +
            '<a href="#/sport/parcours" class="nav-item active"><i data-lucide="map"></i><span>Parcours</span></a>' +
            '<a href="#/sport/nutrition" class="nav-item"><i data-lucide="apple"></i><span>Nutrition</span></a>' +
          '</nav>' +
        '</div>';
      refreshIcons();

      var activity = 'foot';
      document.querySelectorAll('#activity-selector .chip').forEach(function(chip) {
        chip.addEventListener('click', function(e) {
          document.querySelectorAll('#activity-selector .chip').forEach(function(c) { c.classList.remove('active'); });
          e.currentTarget.classList.add('active');
          activity = e.currentTarget.dataset.value;
        });
      });
      var slider = document.getElementById('distance-slider');
      var label = document.getElementById('distance-label');
      slider.addEventListener('input', function(e) { label.textContent = 'Distance ciblée : ' + e.target.value + ' km'; });

      document.getElementById('btn-generate').addEventListener('click', function() {
        document.getElementById('btn-generate').style.display = 'none';
        document.getElementById('loading-state').style.display = 'block';
        generateRoute([2.4333, 48.8333], parseInt(slider.value), activity)
          .then(function(route) { currentRoute = route; activeTab = 'map'; update(); })
          .catch(function(err) {
            alert(err.message || 'Erreur de génération.');
            document.getElementById('btn-generate').style.display = 'flex';
            document.getElementById('loading-state').style.display = 'none';
          });
      });
    }

    function renderMap() {
      container.innerHTML =
        '<div class="page flex-col" style="padding-bottom:0;">' +
          '<header class="sport-header" style="position:absolute;top:0;left:0;right:0;background:rgba(10,10,15,0.8);backdrop-filter:blur(10px);z-index:1000;">' +
            '<button class="back-btn" id="btn-back-form"><i data-lucide="x"></i></button>' +
            '<div style="flex:1;text-align:center;"><h1 class="text-gradient-sport" style="font-size:var(--text-lg);margin:0;">' + currentRoute.distanceKm + ' km</h1><p style="font-size:12px;color:var(--text-secondary);">Boucle générée</p></div>' +
            '<button class="back-btn" id="btn-download" title="Exporter GPX" style="background:var(--accent-sport-glow);color:var(--accent-sport);"><i data-lucide="download"></i></button>' +
          '</header>' +
          '<div id="map-container" style="flex:1;width:100%;height:100dvh;background:#222;"></div>' +
          '<div style="position:absolute;bottom:30px;left:var(--space-md);right:var(--space-md);z-index:1000;">' +
            '<div class="glass-card" style="padding:var(--space-md);display:flex;justify-content:space-around;background:rgba(20,20,32,0.9);">' +
              '<div class="stat-box" style="align-items:center;"><span class="stat-label">Distance</span><span class="stat-value" style="font-size:var(--text-lg);">' + currentRoute.distanceKm + '</span></div>' +
              '<div class="stat-box" style="align-items:center;"><span class="stat-label">Durée estimée</span><span class="stat-value" style="font-size:var(--text-lg);">' + currentRoute.durationMin + 'm</span></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      refreshIcons();

      document.getElementById('btn-back-form').addEventListener('click', function() { activeTab = 'form'; update(); });
      document.getElementById('btn-download').addEventListener('click', function() {
        var gpx = '<?xml version="1.0"?><gpx version="1.1" creator="Azimut"><trk><trkseg>' +
          currentRoute.coordinates.map(function(c) { return '<trkpt lat="' + c[1] + '" lon="' + c[0] + '"></trkpt>'; }).join('') +
          '</trkseg></trk></gpx>';
        downloadFile('azimut_parcours_' + currentRoute.distanceKm + 'km.gpx', gpx);
      });

      setTimeout(function() {
        if (!window.L) { alert('Leaflet n\'est pas chargé. Vérifiez votre connexion internet.'); return; }
        var latLngs = currentRoute.coordinates.map(function(c) { return [c[1], c[0]]; });
        mapInstance = L.map('map-container', { zoomControl: false, attributionControl: false });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(mapInstance);
        var polyline = L.polyline(latLngs, { color: '#FF6B35', weight: 5, opacity: 0.8 }).addTo(mapInstance);
        L.circleMarker(latLngs[0], { radius: 8, fillColor: 'white', color: '#FF6B35', weight: 3, opacity: 1, fillOpacity: 1 }).addTo(mapInstance);
        mapInstance.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }, 150);
    }

    update();
  }

  // ============================================
  // PAGE — Nutrition Plan
  // ============================================
  function renderNutritionPlan(container) {
    var planData = localStorage.getItem('azimut_nutrition_plan');
    var plan = planData ? JSON.parse(planData) : null;

    if (!plan) {
      container.innerHTML =
        '<div class="page flex-col">' +
          '<header class="sport-header">' +
            '<a href="#/sport" class="back-btn"><i data-lucide="arrow-left"></i></a>' +
            '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Nutrition</h1>' +
          '</header>' +
          '<main class="page-content" style="padding-bottom:120px;">' +
            '<div class="empty-state">' +
              '<i data-lucide="apple" class="empty-state-icon"></i>' +
              '<h2 class="empty-state-title">Stratégie Nutritionnelle</h2>' +
              '<p style="color:var(--text-secondary);margin-bottom:var(--space-lg);">Prépare ta nutrition pendant l\'effort, ultra-personnalisée à ton profil et à ta course.</p>' +
              '<a href="#/sport/nutrition/setup" class="btn btn-primary">Créer ma stratégie</a>' +
            '</div>' +
          '</main>' +
          '<nav class="bottom-nav">' +
            '<a href="#/sport/coaching" class="nav-item"><i data-lucide="activity"></i><span>Coaching</span></a>' +
            '<a href="#/sport/parcours" class="nav-item"><i data-lucide="map"></i><span>Parcours</span></a>' +
            '<a href="#/sport/nutrition" class="nav-item active"><i data-lucide="apple"></i><span>Nutrition</span></a>' +
          '</nav>' +
        '</div>';
      refreshIcons();
      return;
    }

    var timelineHTML = plan.timeline.map(function(slot) {
      var productsHTML = slot.products.map(function(p) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;background:var(--bg-primary);padding:var(--space-sm);border-radius:var(--radius-sm);">' +
          '<div><div style="font-size:var(--text-sm);font-weight:600;">' + p.name + ' (' + p.flavor + ')</div><div style="font-size:11px;color:var(--text-secondary);">' + p.brand + ' • ' + p.category + '</div></div>' +
          '<div class="badge badge-sport">' + p.carbsPerUnit + 'g</div></div>';
      }).join('');
      if (!slot.products.length) productsHTML = '<div style="color:var(--text-muted);font-size:var(--text-sm);">Aucun produit requis</div>';

      return '<div class="glass-card" style="padding:var(--space-md);display:flex;gap:var(--space-md);">' +
        '<div style="display:flex;flex-direction:column;align-items:center;min-width:60px;"><div style="font-weight:700;color:var(--text-primary);">' + slot.label + '</div><div style="color:var(--text-muted);font-size:12px;">' + slot.actualCarbs + 'g gl.</div></div>' +
        '<div style="flex:1;display:flex;flex-direction:column;gap:var(--space-sm);border-left:1px solid var(--glass-border);padding-left:var(--space-md);">' + productsHTML + '</div>' +
      '</div>';
    }).join('');

    container.innerHTML =
      '<div class="page flex-col">' +
        '<header class="sport-header">' +
          '<a href="#/sport" class="back-btn"><i data-lucide="arrow-left"></i></a>' +
          '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Nutrition</h1>' +
        '</header>' +
        '<main class="page-content" style="padding-bottom:120px;">' +
          '<div class="glass-card" style="padding:var(--space-md);margin-bottom:var(--space-xl);background:var(--glass-bg-strong);">' +
            '<div style="display:flex;justify-content:space-around;text-align:center;">' +
              '<div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--accent-sport);">' + plan.targetCarbsPerHour + 'g</div><div style="font-size:var(--text-xs);color:var(--text-secondary);text-transform:uppercase;">Glucides / h</div></div>' +
              '<div><div style="font-size:var(--text-2xl);font-weight:700;color:var(--info);">' + (plan.timeline[0] ? plan.timeline[0].hydrationMl : 500) + 'ml</div><div style="font-size:var(--text-xs);color:var(--text-secondary);text-transform:uppercase;">Eau / h</div></div>' +
            '</div>' +
          '</div>' +
          '<h2 class="section-title">Timeline de Course</h2>' +
          '<div style="display:flex;flex-direction:column;gap:var(--space-md);">' + timelineHTML + '</div>' +
          '<div style="margin-top:var(--space-xl);text-align:center;"><button class="btn btn-ghost btn-sm" id="btn-reconfig-nutri">Reconfigurer</button></div>' +
        '</main>' +
        '<nav class="bottom-nav">' +
          '<a href="#/sport/coaching" class="nav-item"><i data-lucide="activity"></i><span>Coaching</span></a>' +
          '<a href="#/sport/parcours" class="nav-item"><i data-lucide="map"></i><span>Parcours</span></a>' +
          '<a href="#/sport/nutrition" class="nav-item active"><i data-lucide="apple"></i><span>Nutrition</span></a>' +
        '</nav>' +
      '</div>';
    refreshIcons();

    document.getElementById('btn-reconfig-nutri').addEventListener('click', function() {
      if (confirm('Refaire la stratégie ?')) {
        localStorage.removeItem('azimut_nutrition_plan');
        router();
      }
    });
  }

  // ============================================
  // PAGE — Nutrition Setup
  // ============================================
  function renderNutritionSetup(container) {
    var formData = {
      distance: 42, duration: 4, weather: 'Tempéré', digestive: 'Tout passe',
      preferences: { avoidCategories: [] }
    };

    function render() {
      container.innerHTML =
        '<div class="page flex-col">' +
          '<header class="sport-header">' +
            '<a href="#/sport/nutrition" class="back-btn"><i data-lucide="x"></i></a>' +
            '<h1 class="text-gradient-sport" style="font-size:var(--text-2xl);margin:0;">Configuration</h1>' +
          '</header>' +
          '<main class="page-content" style="padding-bottom:120px;">' +
            '<h2 class="section-title">Ton épreuve</h2>' +
            '<div class="flex-col gap-lg">' +
              '<div><label class="input-label" id="dur-label">Durée estimée : ' + formData.duration + 'h</label><input type="range" class="range-slider" id="dur-slider" min="1" max="24" value="' + formData.duration + '"></div>' +
              '<div><label class="input-label">Météo prévue</label><div class="scroll-x" id="weather-selector"><div class="chip" data-value="Froid">Froid (&lt;10°C)</div><div class="chip active" data-value="Tempéré">Tempéré (10-20°C)</div><div class="chip" data-value="Chaud">Chaud (&gt;20°C)</div></div></div>' +
              '<div><label class="input-label">Profil digestif</label><div class="scroll-x" id="digest-selector"><div class="chip" data-value="Parfois ça coince">Parfois ça coince</div><div class="chip active" data-value="Tout passe">Tout passe</div></div></div>' +
              '<div><label class="input-label">À éviter (optionnel)</label><div class="scroll-x" id="avoid-selector"><div class="chip" data-value="Gels">Gels</div><div class="chip" data-value="Boissons">Boissons</div><div class="chip" data-value="Barres">Barres</div></div></div>' +
              '<button class="btn btn-primary btn-full" id="btn-generate-nutri" style="margin-top:var(--space-md);">Générer ma stratégie</button>' +
            '</div>' +
          '</main>' +
        '</div>';
      refreshIcons();

      var durSlider = document.getElementById('dur-slider');
      durSlider.addEventListener('input', function(e) {
        formData.duration = parseFloat(e.target.value);
        document.getElementById('dur-label').textContent = 'Durée estimée : ' + formData.duration + 'h';
      });

      function setupChips(selectorId, handler) {
        document.querySelectorAll('#' + selectorId + ' .chip').forEach(function(chip) {
          chip.addEventListener('click', handler);
        });
      }
      setupChips('weather-selector', function(e) {
        document.querySelectorAll('#weather-selector .chip').forEach(function(c) { c.classList.remove('active'); });
        e.currentTarget.classList.add('active');
        formData.weather = e.currentTarget.dataset.value;
      });
      setupChips('digest-selector', function(e) {
        document.querySelectorAll('#digest-selector .chip').forEach(function(c) { c.classList.remove('active'); });
        e.currentTarget.classList.add('active');
        formData.digestive = e.currentTarget.dataset.value;
      });
      setupChips('avoid-selector', function(e) {
        e.currentTarget.classList.toggle('active');
        var val = e.currentTarget.dataset.value;
        if (e.currentTarget.classList.contains('active')) {
          formData.preferences.avoidCategories.push(val);
        } else {
          formData.preferences.avoidCategories = formData.preferences.avoidCategories.filter(function(v) { return v !== val; });
        }
      });

      document.getElementById('btn-generate-nutri').addEventListener('click', function() {
        var plan = generateNutritionPlan(formData);
        localStorage.setItem('azimut_nutrition_plan', JSON.stringify(plan));
        window.location.hash = '#/sport/nutrition';
      });
    }
    render();
  }

  // ============================================
  // PAGE — Randonnée & Bivouac (JAMET Edition)
  // ============================================
  function renderRando(container) {
    var activeRoutePoints = [];
    var elevationData = [];
    var mapL = null;
    var mapR = null;
    
    var polylineL = null;
    var polylineR = null;
    var waypointMarkers = [];
    
    var refugesLayers = L.layerGroup();
    var waterLayers = L.layerGroup();
    
    var hoverMarkerL = null;
    var hoverMarkerR = null;
    
    var isDrawingMode = false;
    
    var radarLayer = null;
    var snowLayer = null;
    var slopeLayer = null;
    
    var topoLayerL = null;
    var satelliteLayerL = null;
    var baseLayerR = null;

    function formatDuration(hoursDecimal) {
      var h = Math.floor(hoursDecimal);
      var m = Math.round((hoursDecimal - h) * 60);
      if (h === 0) return m + ' min';
      return h + 'h' + (m < 10 ? '0' : '') + m;
    }

    function calculateTotalDistance(points) {
      var dist = 0;
      for (var i = 0; i < points.length - 1; i++) {
        dist += points[i].distanceTo(points[i+1]);
      }
      return dist / 1000;
    }

    function calculateHikingStats(points, elevations) {
      var distanceKm = calculateTotalDistance(points);
      var dPlus = 0;
      var dMoins = 0;
      
      if (elevations && elevations.length > 1) {
        for (var i = 1; i < elevations.length; i++) {
          var diff = elevations[i] - elevations[i-1];
          if (diff > 0) {
            dPlus += diff;
          } else {
            dMoins += Math.abs(diff);
          }
        }
      }
      
      // SAC rule: 4 km/h horizontal, +1h/300m up, +1h/600m down
      var timeHours = (distanceKm / 4.0) + (dPlus / 300.0) + (dMoins / 600.0);
      
      return {
        distance: distanceKm,
        dPlus: dPlus,
        dMoins: dMoins,
        timeHours: timeHours
      };
    }

    function getSampledCoordinates(coords, maxSamples) {
      if (coords.length <= maxSamples) return coords;
      var step = (coords.length - 1) / (maxSamples - 1);
      var sampled = [];
      for (var i = 0; i < maxSamples; i++) {
        sampled.push(coords[Math.round(i * step)]);
      }
      return sampled;
    }

    container.innerHTML =
      '<div class="page flex-col">' +
        '<header class="sport-header" style="border-bottom: 2px solid var(--accent-rando);">' +
          '<a href="#/" class="back-btn" style="color:var(--accent-rando);"><i data-lucide="arrow-left"></i></a>' +
          '<div style="flex:1;"><h1 class="rando-font text-gradient-rando" style="font-size:var(--text-xl);margin:0;letter-spacing:0.15em;">Pôle Rando</h1><p style="font-size:9px;color:var(--text-secondary);letter-spacing:0.1em;text-transform:uppercase;font-weight:700;">JAMET Heritage</p></div>' +
        '</header>' +
        '<main class="page-content" style="padding-bottom:120px;max-width:1000px;">' +
          
          '<!-- Action Controls -->' +
          '<div class="glass-card rando-patch" style="padding:var(--space-md);margin-bottom:var(--space-md);display:flex;flex-wrap:wrap;gap:var(--space-sm);align-items:center;background:rgba(20,20,32,0.6);">' +
            '<button id="btn-draw-mode" class="btn btn-rando-secondary btn-sm"><i data-lucide="edit-3"></i> Mode Dessin</button>' +
            '<button id="btn-undo" class="btn btn-secondary btn-sm" disabled><i data-lucide="undo-2"></i> Annuler</button>' +
            '<button id="btn-clear" class="btn btn-secondary btn-sm" disabled><i data-lucide="trash-2"></i> Effacer</button>' +
            '<label class="btn btn-secondary btn-sm" style="cursor:pointer;margin:0;display:inline-flex;align-items:center;gap:6px;"><i data-lucide="upload"></i> Importer GPX' +
              '<input type="file" id="gpx-file-input" accept=".gpx" style="display:none;">' +
            '</label>' +
            '<button id="btn-export" class="btn btn-rando btn-sm" disabled><i data-lucide="download"></i> Exporter GPX</button>' +
            '<button id="btn-locate" class="btn btn-secondary btn-sm" title="Me géolocaliser"><i data-lucide="map-pin"></i></button>' +
          '</div>' +
          
          '<!-- Mobile Tabs -->' +
          '<div class="map-tabs" style="margin-bottom:var(--space-sm);">' +
            '<button id="btn-tab-L" class="btn btn-rando btn-sm flex-1">Éditeur &amp; Tracé</button>' +
            '<button id="btn-tab-R" class="btn btn-rando-secondary btn-sm flex-1">Météo &amp; Pentes</button>' +
          '</div>' +
          
          '<!-- Dual Map Container -->' +
          '<div id="map-dual-container">' +
            '<!-- Map Left -->' +
            '<div id="map-left-card" class="map-card">' +
              '<div id="mapL" class="map-view-canvas"></div>' +
              '<div class="map-badge">Tracé &amp; Éditeur</div>' +
              
              '<!-- Opacity Comparateur slider -->' +
              '<div class="comparateur-card">' +
                '<div style="font-size:10px;font-weight:700;text-transform:uppercase;color:var(--accent-rando-light);margin-bottom:2px;">Comparateur Topo / Satellite</div>' +
                '<div class="comparateur-slider-container">' +
                  '<span class="comparateur-slider-label">Topo</span>' +
                  '<input type="range" id="slider-opacity" class="opacity-slider" min="0" max="1" step="0.05" value="1">' +
                  '<span class="comparateur-slider-label" style="text-align:right;">Sat.</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
            
            '<!-- Map Right -->' +
            '<div id="map-right-card" class="map-card">' +
              '<div id="mapR" class="map-view-canvas"></div>' +
              '<div class="map-badge">Météo, Neige &amp; Pentes</div>' +
              
              '<!-- Overlay controls -->' +
              '<div class="layer-controls-card">' +
                '<div style="font-size:9px;font-weight:700;text-transform:uppercase;color:var(--text-secondary);margin-bottom:4px;padding:0 4px;">Couches Miroir</div>' +
                '<button id="btn-layer-radar" class="layer-btn"><i data-lucide="cloud-rain" style="width:12px;"></i> Radar Pluie</button>' +
                '<button id="btn-layer-snow" class="layer-btn"><i data-lucide="snowflake" style="width:12px;"></i> Enneigement</button>' +
                '<button id="btn-layer-slope" class="layer-btn"><i data-lucide="trending-up" style="width:12px;"></i> Pentes &gt; 30°</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          
          '<!-- Stats Dashboard -->' +
          '<div id="rando-main-stats" class="glass-card rando-patch" style="padding:var(--space-md);margin-bottom:var(--space-md);background:rgba(20,20,32,0.85);">' +
            '<div class="rando-stats-grid">' +
              '<div class="stat-box"><span class="stat-label">Distance</span><span id="stat-distance" class="stat-value">0.0 km</span></div>' +
              '<div class="stat-box"><span class="stat-label">Dénivelé +</span><span id="stat-dplus" class="stat-value" style="color:var(--success);">0 m</span></div>' +
              '<div class="stat-box"><span class="stat-label">Dénivelé -</span><span id="stat-dmoins" class="stat-value" style="color:var(--danger);">0 m</span></div>' +
              '<div class="stat-box"><span class="stat-label">Temps (Naismith SAC)</span><span id="stat-time" class="stat-value" style="color:var(--accent-rando-light);">0 min</span></div>' +
            '</div>' +
            '<div style="font-size:11px;color:var(--text-secondary);display:flex;align-items:center;gap:4px;"><i data-lucide="info" style="width:12px;"></i> Calcule le temps de marche selon la règle de Naismith (SAC) : 4km/h à plat, +1h par 300m de montée, +1h par 600m de descente.</div>' +
          '</div>' +
          
          '<!-- Clicked Point Details (Split Stats) -->' +
          '<div id="rando-split-stats" class="glass-card rando-patch animate-fadeIn" style="display:none;padding:var(--space-md);margin-bottom:var(--space-md);background:rgba(25,25,40,0.95);border-color:var(--accent-rando-light);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-sm);border-bottom:1px solid var(--glass-border);padding-bottom:4px;">' +
              '<span class="rando-font" style="font-size:12px;color:var(--accent-rando-light);letter-spacing:0.05em;">Statistiques au point cliqué</span>' +
              '<button id="btn-close-split" class="back-btn" style="width:20px;height:20px;background:transparent;border:none;"><i data-lucide="x" style="width:14px;height:14px;"></i></button>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-md);">' +
              '<div>' +
                '<div style="font-size:11px;font-weight:700;color:var(--success);margin-bottom:2px;text-transform:uppercase;">Parcouru (Passé)</div>' +
                '<div style="font-size:13px;font-weight:600;"><span style="color:var(--text-secondary);">Dist. :</span> <span id="split-pass-dist">0 km</span></div>' +
                '<div style="font-size:13px;font-weight:600;"><span style="color:var(--text-secondary);">D+/D- :</span> <span id="split-pass-dplus">+0m</span> / <span id="split-pass-dminus">-0m</span></div>' +
                '<div style="font-size:13px;font-weight:600;"><span style="color:var(--text-secondary);">Temps :</span> <span id="split-pass-time">0 min</span></div>' +
              '</div>' +
              '<div>' +
                '<div style="font-size:11px;font-weight:700;color:var(--accent-sport);margin-bottom:2px;text-transform:uppercase;">Restant</div>' +
                '<div style="font-size:13px;font-weight:600;"><span style="color:var(--text-secondary);">Dist. :</span> <span id="split-rest-dist">0 km</span></div>' +
                '<div style="font-size:13px;font-weight:600;"><span style="color:var(--text-secondary);">D+/D- :</span> <span id="split-rest-dplus">+0m</span> / <span id="split-rest-dminus">-0m</span></div>' +
                '<div style="font-size:13px;font-weight:600;"><span style="color:var(--text-secondary);">Temps :</span> <span id="split-rest-time">0 min</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          
          '<!-- Elevation Profile -->' +
          '<div id="elevation-profile-card" class="profile-card" style="display:none;background:rgba(20,20,32,0.85);">' +
            '<div class="profile-header">' +
              '<span class="rando-font" style="font-size:var(--text-sm);color:var(--accent-rando-light);letter-spacing:0.05em;">Profil Altimétrique</span>' +
              '<span style="font-size:12px;color:var(--text-secondary);">Min : <strong id="profile-min-ele">0m</strong> | Max : <strong id="profile-max-ele">0m</strong></span>' +
            '</div>' +
            '<div class="profile-canvas-wrapper">' +
              '<canvas id="elevation-profile-canvas" class="profile-canvas"></canvas>' +
            '</div>' +
          '</div>' +
          
          '<!-- Refuges & Water points info banner -->' +
          '<div id="refuges-info-banner" style="font-size:11px;color:var(--text-secondary);text-align:center;margin-top:var(--space-md);">' +
            'Déplacez et zoomez la carte (niveau 12+) pour charger les refuges et points d\'eau de refuges.info' +
          '</div>' +
          
        '</main>' +
      '</div>';
      
    refreshIcons();

    // Mobile tabs implementation
    var btnTabL = document.getElementById('btn-tab-L');
    var btnTabR = document.getElementById('btn-tab-R');
    var cardL = document.getElementById('map-left-card');
    var cardR = document.getElementById('map-right-card');
    
    btnTabL.addEventListener('click', function() {
      btnTabL.className = 'btn btn-rando btn-sm flex-1';
      btnTabR.className = 'btn btn-rando-secondary btn-sm flex-1';
      if (window.innerWidth < 768) {
        cardL.style.display = 'block';
        cardR.style.display = 'none';
      }
      if (mapL) mapL.invalidateSize();
    });
    
    btnTabR.addEventListener('click', function() {
      btnTabR.className = 'btn btn-rando btn-sm flex-1';
      btnTabL.className = 'btn btn-rando-secondary btn-sm flex-1';
      if (window.innerWidth < 768) {
        cardR.style.display = 'block';
        cardL.style.display = 'none';
      }
      if (mapR) mapR.invalidateSize();
    });

    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768) {
        cardL.style.display = 'block';
        cardR.style.display = 'block';
      } else {
        if (btnTabL.classList.contains('btn-rando')) {
          cardL.style.display = 'block';
          cardR.style.display = 'none';
        } else {
          cardL.style.display = 'none';
          cardR.style.display = 'block';
        }
      }
      if (mapL) mapL.invalidateSize();
      if (mapR) mapR.invalidateSize();
    });

    function resizeCanvas(canvas) {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    }

    function renderProfile(points, elevations) {
      var canvas = document.getElementById('elevation-profile-canvas');
      if (!canvas) return;
      
      var profileCard = document.getElementById('elevation-profile-card');
      profileCard.style.display = 'block';
      
      resizeCanvas(canvas);
      
      var ctx = canvas.getContext('2d');
      var width = canvas.width;
      var height = canvas.height;
      var ratioDpi = window.devicePixelRatio || 1;
      
      ctx.clearRect(0, 0, width, height);
      
      if (!elevations || elevations.length === 0) return;
      
      var dists = [0];
      var runningDist = 0;
      for (var i = 1; i < points.length; i++) {
        runningDist += points[i-1].distanceTo(points[i]) / 1000;
        dists.push(runningDist);
      }
      var maxDist = runningDist;
      
      var minEle = Math.min.apply(null, elevations);
      var maxEle = Math.max.apply(null, elevations);
      
      document.getElementById('profile-min-ele').textContent = Math.round(minEle) + 'm';
      document.getElementById('profile-max-ele').textContent = Math.round(maxEle) + 'm';
      
      var elePadding = (maxEle - minEle) * 0.1 || 50;
      var yMin = Math.max(0, minEle - elePadding);
      var yMax = maxEle + elePadding;
      
      function getX(d) {
        if (maxDist === 0) return 20 * ratioDpi;
        var padding = 20 * ratioDpi;
        return padding + (d / maxDist) * (width - 2 * padding);
      }
      
      function getY(ele) {
        var padding = 10 * ratioDpi;
        return height - padding - ((ele - yMin) / (yMax - yMin)) * (height - 2 * padding);
      }
      
      // Fill Area
      ctx.beginPath();
      ctx.moveTo(getX(dists[0]), getY(yMin));
      for (var i = 0; i < points.length; i++) {
        ctx.lineTo(getX(dists[i]), getY(elevations[i]));
      }
      ctx.lineTo(getX(dists[dists.length - 1]), getY(yMin));
      ctx.closePath();
      
      var gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
      gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Stroke Path
      ctx.beginPath();
      ctx.moveTo(getX(dists[0]), getY(elevations[0]));
      for (var i = 1; i < points.length; i++) {
        ctx.lineTo(getX(dists[i]), getY(elevations[i]));
      }
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3 * ratioDpi;
      ctx.stroke();
      
      // Interactive hover
      var canvasWrapper = canvas.parentNode;
      canvasWrapper.onmousemove = function(e) {
        var rect = canvas.getBoundingClientRect();
        var clientX = e.clientX - rect.left;
        var ratio = clientX / rect.width;
        if (ratio < 0) ratio = 0;
        if (ratio > 1) ratio = 1;
        
        var targetDist = ratio * maxDist;
        var closestIdx = 0;
        var minDiff = Infinity;
        for (var i = 0; i < dists.length; i++) {
          var diff = Math.abs(dists[i] - targetDist);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        }
        
        renderProfile(points, elevations);
        
        // Draw vertical cursor line
        var cX = getX(dists[closestIdx]);
        ctx.beginPath();
        ctx.moveTo(cX, 0);
        ctx.lineTo(cX, height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1 * ratioDpi;
        ctx.stroke();
        
        // Draw point
        var cY = getY(elevations[closestIdx]);
        ctx.beginPath();
        ctx.arc(cX, cY, 5 * ratioDpi, 0, 2 * Math.PI);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2 * ratioDpi;
        ctx.fill();
        ctx.stroke();
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = (10 * ratioDpi) + 'px sans-serif';
        ctx.fillText(Math.round(elevations[closestIdx]) + 'm (' + dists[closestIdx].toFixed(1) + 'km)', cX + 8 * ratioDpi, cY - 8 * ratioDpi);
        
        // Leaflet marker synchronization
        var latlng = points[closestIdx];
        if (!hoverMarkerL) {
          hoverMarkerL = L.circleMarker(latlng, { radius: 6, fillColor: 'white', color: '#F59E0B', weight: 2, fillOpacity: 1 }).addTo(mapL);
          hoverMarkerR = L.circleMarker(latlng, { radius: 6, fillColor: 'white', color: '#F59E0B', weight: 2, fillOpacity: 1 }).addTo(mapR);
        } else {
          hoverMarkerL.setLatLng(latlng);
          hoverMarkerR.setLatLng(latlng);
        }
      };
      
      canvasWrapper.onmouseleave = function() {
        renderProfile(points, elevations);
        if (hoverMarkerL) {
          mapL.removeLayer(hoverMarkerL);
          mapR.removeLayer(hoverMarkerR);
          hoverMarkerL = null;
          hoverMarkerR = null;
        }
      };
    }

    function drawProfileCursorAt(idx) {
      if (elevationData.length === 0) return;
      var canvas = document.getElementById('elevation-profile-canvas');
      if (!canvas) return;
      
      var width = canvas.width;
      var height = canvas.height;
      var ratioDpi = window.devicePixelRatio || 1;
      
      renderProfile(activeRoutePoints, elevationData);
      
      var dists = [0];
      var runningDist = 0;
      for (var i = 1; i < activeRoutePoints.length; i++) {
        runningDist += activeRoutePoints[i-1].distanceTo(activeRoutePoints[i]) / 1000;
        dists.push(runningDist);
      }
      var maxDist = runningDist;
      
      var minEle = Math.min.apply(null, elevationData);
      var maxEle = Math.max.apply(null, elevationData);
      var elePadding = (maxEle - minEle) * 0.1 || 50;
      var yMin = Math.max(0, minEle - elePadding);
      var yMax = maxEle + elePadding;
      
      function getX(d) {
        if (maxDist === 0) return 20 * ratioDpi;
        var padding = 20 * ratioDpi;
        return padding + (d / maxDist) * (width - 2 * padding);
      }
      
      function getY(ele) {
        var padding = 10 * ratioDpi;
        return height - padding - ((ele - yMin) / (yMax - yMin)) * (height - 2 * padding);
      }
      
      var ctx = canvas.getContext('2d');
      var cX = getX(dists[idx]);
      var cY = getY(elevationData[idx]);
      
      ctx.beginPath();
      ctx.moveTo(cX, 0);
      ctx.lineTo(cX, height);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1 * ratioDpi;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(cX, cY, 5 * ratioDpi, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2 * ratioDpi;
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = (10 * ratioDpi) + 'px sans-serif';
      ctx.fillText(Math.round(elevationData[idx]) + 'm (' + dists[idx].toFixed(1) + 'km)', cX + 8 * ratioDpi, cY - 8 * ratioDpi);
      
      var latlng = activeRoutePoints[idx];
      if (!hoverMarkerL) {
        hoverMarkerL = L.circleMarker(latlng, { radius: 6, fillColor: 'white', color: '#F59E0B', weight: 2, fillOpacity: 1 }).addTo(mapL);
        hoverMarkerR = L.circleMarker(latlng, { radius: 6, fillColor: 'white', color: '#F59E0B', weight: 2, fillOpacity: 1 }).addTo(mapR);
      } else {
        hoverMarkerL.setLatLng(latlng);
        hoverMarkerR.setLatLng(latlng);
      }
    }

    function updateStats(points, elevations) {
      var stats = calculateHikingStats(points || activeRoutePoints, elevations || elevationData);
      document.getElementById('stat-distance').textContent = stats.distance.toFixed(2) + ' km';
      document.getElementById('stat-dplus').textContent = '+' + Math.round(stats.dPlus) + ' m';
      document.getElementById('stat-dmoins').textContent = '-' + Math.round(stats.dMoins) + ' m';
      document.getElementById('stat-time').textContent = formatDuration(stats.timeHours);
      
      var exportBtn = document.getElementById('btn-export');
      var clearBtn = document.getElementById('btn-clear');
      var undoBtn = document.getElementById('btn-undo');
      
      if (activeRoutePoints.length > 0) {
        exportBtn.removeAttribute('disabled');
        clearBtn.removeAttribute('disabled');
        undoBtn.removeAttribute('disabled');
      } else {
        exportBtn.setAttribute('disabled', 'true');
        clearBtn.setAttribute('disabled', 'true');
        undoBtn.setAttribute('disabled', 'true');
        document.getElementById('elevation-profile-card').style.display = 'none';
      }
    }

    function showPointDetailsPopup(idx) {
      if (activeRoutePoints.length === 0) return;
      
      var passedPoints = activeRoutePoints.slice(0, idx + 1);
      var remainingPoints = activeRoutePoints.slice(idx);
      
      var passedEles = [];
      var remainingEles = [];
      
      if (elevationData && elevationData.length === activeRoutePoints.length) {
        passedEles = elevationData.slice(0, idx + 1);
        remainingEles = elevationData.slice(idx);
      }
      
      var passedStats = calculateHikingStats(passedPoints, passedEles);
      var remainingStats = calculateHikingStats(remainingPoints, remainingEles);
      
      document.getElementById('rando-split-stats').style.display = 'block';
      
      document.getElementById('split-pass-dist').textContent = passedStats.distance.toFixed(2) + ' km';
      document.getElementById('split-pass-dplus').textContent = '+' + Math.round(passedStats.dPlus) + ' m';
      document.getElementById('split-pass-dminus').textContent = '-' + Math.round(passedStats.dMoins) + ' m';
      document.getElementById('split-pass-time').textContent = formatDuration(passedStats.timeHours);
      
      document.getElementById('split-rest-dist').textContent = remainingStats.distance.toFixed(2) + ' km';
      document.getElementById('split-rest-dplus').textContent = '+' + Math.round(remainingStats.dPlus) + ' m';
      document.getElementById('split-rest-dminus').textContent = '-' + Math.round(remainingStats.dMoins) + ' m';
      document.getElementById('split-rest-time').textContent = formatDuration(remainingStats.timeHours);
      
      var clickedLatLng = activeRoutePoints[idx];
      var clickMarkerPopup = L.popup()
        .setLatLng(clickedLatLng)
        .setContent('<div class="rando-popup"><h4>Infos point repère</h4><p>Distance parcourue : <strong>' + passedStats.distance.toFixed(2) + ' km</strong></p><p>Reste : <strong>' + remainingStats.distance.toFixed(2) + ' km</strong></p></div>')
        .openOn(mapL);
    }

    function fetchElevations() {
      if (activeRoutePoints.length === 0) {
        elevationData = [];
        renderProfile([], []);
        updateStats([], []);
        return;
      }
      
      var sampledPoints = getSampledCoordinates(activeRoutePoints, 80);
      var lats = sampledPoints.map(function(p) { return p.lat; }).join(',');
      var lngs = sampledPoints.map(function(p) { return p.lng; }).join(',');
      
      var url = 'https://api.open-meteo.com/v1/elevation?latitude=' + lats + '&longitude=' + lngs;
      
      fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          if (data && data.elevation) {
            // Expand the sampled elevations to match the size of activeRoutePoints 
            // by repeating or simple linear interpolation.
            // If activeRoutePoints was sampled, we can actually assign elevations directly to our sampled coordinates
            // and use the sampled list as the source for stats & profile!
            // To be precise and avoid mismatch, we map elevations back to the activeRoutePoints size.
            // A simple linear interpolation handles this perfectly:
            var fullElevations = [];
            var step = (data.elevation.length - 1) / (activeRoutePoints.length - 1 || 1);
            for (var i = 0; i < activeRoutePoints.length; i++) {
              var indexFloat = i * step;
              var idxLower = Math.floor(indexFloat);
              var idxUpper = Math.ceil(indexFloat);
              var t = indexFloat - idxLower;
              var valLower = data.elevation[idxLower];
              var valUpper = data.elevation[idxUpper];
              var val = valLower + t * (valUpper - valLower);
              fullElevations.push(val);
            }
            
            elevationData = fullElevations;
            renderProfile(activeRoutePoints, elevationData);
            updateStats(activeRoutePoints, elevationData);
          }
        })
        .catch(function(err) {
          console.error('Error fetching elevations:', err);
        });
    }

    function redrawWaypoints() {
      waypointMarkers.forEach(function(m) { mapL.removeLayer(m); });
      waypointMarkers = [];
      
      polylineL.setLatLngs(activeRoutePoints);
      polylineR.setLatLngs(activeRoutePoints);
      
      activeRoutePoints.forEach(function(latlng, idx) {
        var isStart = idx === 0;
        var isEnd = idx === activeRoutePoints.length - 1;
        
        var marker = L.circleMarker(latlng, {
          radius: 8,
          fillColor: isStart ? '#10B981' : (isEnd ? '#EF4444' : '#F59E0B'),
          color: '#ffffff',
          weight: 2,
          fillOpacity: 1
        }).addTo(mapL);
        
        marker.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          if (!isDrawingMode) return;
          removeWaypoint(idx);
        });
        
        waypointMarkers.push(marker);
      });
      
      fetchElevations();
    }
    
    function removeWaypoint(idx) {
      activeRoutePoints.splice(idx, 1);
      redrawWaypoints();
    }

    function undoWaypoint() {
      if (activeRoutePoints.length === 0) return;
      activeRoutePoints.pop();
      redrawWaypoints();
    }
    
    function clearWaypoints() {
      if (confirm('Effacer le parcours en cours ?')) {
        activeRoutePoints = [];
        elevationData = [];
        redrawWaypoints();
        document.getElementById('rando-split-stats').style.display = 'none';
      }
    }

    function parseGPX(gpxText) {
      var parser = new DOMParser();
      var xmlDoc = parser.parseFromString(gpxText, 'text/xml');
      var trkpts = xmlDoc.getElementsByTagName('trkpt');
      var points = [];
      var elevations = [];
      var hasEle = false;
      
      for (var i = 0; i < trkpts.length; i++) {
        var lat = parseFloat(trkpts[i].getAttribute('lat'));
        var lon = parseFloat(trkpts[i].getAttribute('lon'));
        points.push(L.latLng(lat, lon));
        
        var eleNode = trkpts[i].getElementsByTagName('ele')[0];
        if (eleNode) {
          elevations.push(parseFloat(eleNode.textContent));
          hasEle = true;
        } else {
          elevations.push(0);
        }
      }
      return { points: points, elevations: elevations, hasEle: hasEle };
    }

    function exportGPX(points, elevations) {
      var gpx = '<?xml version="1.0" encoding="UTF-8"?>\n';
      gpx += '<gpx version="1.1" creator="Azimut" xmlns="http://www.topografix.com/GPX/1/1">\n';
      gpx += '  <metadata>\n';
      gpx += '    <name>Tracé Azimut Rando</name>\n';
      gpx += '    <time>' + new Date().toISOString() + '</time>\n';
      gpx += '  </metadata>\n';
      gpx += '  <trk>\n';
      gpx += '    <name>Mon parcours Rando</name>\n';
      gpx += '    <trkseg>\n';
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        var ele = (elevations && elevations[i]) ? elevations[i] : 0;
        gpx += '      <trkpt lat="' + p.lat.toFixed(6) + '" lon="' + p.lng.toFixed(6) + '">\n';
        gpx += '        <ele>' + ele.toFixed(1) + '</ele>\n';
        gpx += '      </trkpt>\n';
      }
      gpx += '    </trkseg>\n';
      gpx += '  </trk>\n';
      gpx += '</gpx>';
      return gpx;
    }

    function loadRefugesData() {
      if (!mapL) return;
      var zoom = mapL.getZoom();
      var infoBanner = document.getElementById('refuges-info-banner');
      
      if (zoom < 12) {
        infoBanner.textContent = 'Déplacez et zoomez la carte (niveau 12+) pour charger les refuges et points d\'eau de refuges.info';
        refugesLayers.clearLayers();
        waterLayers.clearLayers();
        return;
      }
      
      infoBanner.textContent = 'Chargement des refuges et points d\'eau...';
      
      var bounds = mapL.getBounds();
      var west = bounds.getWest().toFixed(4);
      var south = bounds.getSouth().toFixed(4);
      var east = bounds.getEast().toFixed(4);
      var north = bounds.getNorth().toFixed(4);
      
      var url = 'https://www.refuges.info/api/bbox?bbox=' + west + ',' + south + ',' + east + ',' + north + '&format=geojson&detail=simple';
      
      fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) {
          refugesLayers.clearLayers();
          waterLayers.clearLayers();
          
          if (!data || !data.features) {
            infoBanner.textContent = 'Aucun refuge ou point d\'eau trouvé dans cette zone.';
            return;
          }
          
          var count = 0;
          data.features.forEach(function(feat) {
            var props = feat.properties;
            var coords = feat.geometry.coordinates;
            var latlng = L.latLng(coords[1], coords[0]);
            
            var isWater = props.type === "Point d'eau" || props.type.toLowerCase().indexOf('eau') !== -1;
            var iconHtml = '';
            
            if (isWater) {
              iconHtml = '<div class="rando-patch" style="background:#2563EB;color:white;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1.5px solid white;"><i data-lucide="droplet" style="width:12px;height:12px;color:white;"></i></div>';
            } else {
              iconHtml = '<div class="rando-patch" style="background:#D97706;color:white;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1.5px solid white;"><i data-lucide="home" style="width:12px;height:12px;color:white;"></i></div>';
            }
            
            var customIcon = L.divIcon({
              html: iconHtml,
              className: 'custom-poi-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            
            var popupContent = '<div class="rando-popup">' +
              '<h4>' + props.nom + '</h4>' +
              '<p><strong>Type :</strong> ' + props.type + '</p>' +
              '<p><strong>Altitude :</strong> ' + (props.altitude ? props.altitude + ' m' : 'Non spécifiée') + '</p>';
              
            if (props.places) {
              popupContent += '<p><strong>Places :</strong> ' + props.places + '</p>';
            }
            
            popupContent += '<a href="' + props.lien + '" target="_blank">Fiche Refuges.info</a>' +
              '</div>';
            
            var marker = L.marker(latlng, { icon: customIcon }).bindPopup(popupContent);
            
            if (isWater) {
              waterLayers.addLayer(marker);
            } else {
              refugesLayers.addLayer(marker);
            }
            count++;
          });
          
          infoBanner.textContent = count + ' points d\'intérêt chargés (Refuges & Points d\'eau).';
          refreshIcons();
        })
        .catch(function(err) {
          console.error('Error fetching refuges:', err);
          infoBanner.textContent = 'Erreur lors du chargement des refuges.';
        });
    }

    var isSyncing = false;
    function syncMaps(source, target) {
      source.on('move', function() {
        if (isSyncing) return;
        isSyncing = true;
        target.setView(source.getCenter(), source.getZoom(), { animate: false });
        isSyncing = false;
      });
      source.on('zoomend', function() {
        if (isSyncing) return;
        isSyncing = true;
        target.setZoom(source.getZoom());
        isSyncing = false;
      });
    }

    // Set maps initialization
    setTimeout(function() {
      if (!window.L) {
        alert('Leaflet n\'est pas chargé. Vérifiez votre connexion internet.');
        return;
      }
      
      // MAP LEFT
      mapL = L.map('mapL', { zoomControl: true, attributionControl: false }).setView([45.9227, 6.8685], 11);
      
      satelliteLayerL = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri Satellite'
      }).addTo(mapL);

      topoLayerL = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: 'OpenTopoMap'
      }).addTo(mapL);
      
      topoLayerL.bringToFront();
      
      // MAP RIGHT
      mapR = L.map('mapR', { zoomControl: false, attributionControl: false }).setView([45.9227, 6.8685], 11);
      
      baseLayerR = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: 'CartoDB Dark'
      }).addTo(mapR);

      // Synced Polylines
      polylineL = L.polyline([], { color: '#F59E0B', weight: 4, opacity: 0.8 }).addTo(mapL);
      polylineR = L.polyline([], { color: '#F59E0B', weight: 4, opacity: 0.8 }).addTo(mapR);
      
      // Sync
      syncMaps(mapL, mapR);
      syncMaps(mapR, mapL);
      
      refugesLayers.addTo(mapL);
      waterLayers.addTo(mapL);
      
      // Map click for drawing
      mapL.on('click', function(e) {
        if (!isDrawingMode) return;
        addWaypoint(e.latlng);
      });
      
      // Track hover / click
      polylineL.on('click', function(e) {
        if (isDrawingMode) return;
        L.DomEvent.stopPropagation(e);
        var closestIdx = findClosestPointIndex(e.latlng, activeRoutePoints);
        showPointDetailsPopup(closestIdx);
      });
      
      polylineL.on('mousemove', function(e) {
        if (isDrawingMode || activeRoutePoints.length === 0) return;
        var closestIdx = findClosestPointIndex(e.latlng, activeRoutePoints);
        drawProfileCursorAt(closestIdx);
      });
      
      polylineL.on('mouseout', function() {
        if (isDrawingMode) return;
        if (hoverMarkerL) {
          mapL.removeLayer(hoverMarkerL);
          mapR.removeLayer(hoverMarkerR);
          hoverMarkerL = null;
          hoverMarkerR = null;
        }
        if (activeRoutePoints.length > 0 && elevationData.length > 0) {
          renderProfile(activeRoutePoints, elevationData);
        }
      });

      mapL.on('moveend', function() {
        loadRefugesData();
      });

      // Attempt geolocation to center Map L
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          var userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          mapL.setView(userLatLng, 12);
        });
      }

      loadRefugesData();

    }, 150);

    function findClosestPointIndex(latlng, points) {
      var minD = Infinity;
      var idx = 0;
      for (var i = 0; i < points.length; i++) {
        var d = latlng.distanceTo(points[i]);
        if (d < minD) {
          minD = d;
          idx = i;
        }
      }
      return idx;
    }

    function addWaypoint(latlng) {
      activeRoutePoints.push(latlng);
      redrawWaypoints();
    }

    // Attach control listeners
    var drawModeBtn = document.getElementById('btn-draw-mode');
    drawModeBtn.addEventListener('click', function() {
      isDrawingMode = !isDrawingMode;
      drawModeBtn.classList.toggle('active');
      drawModeBtn.classList.toggle('btn-rando');
      drawModeBtn.classList.toggle('btn-rando-secondary');
      
      if (isDrawingMode) {
        drawModeBtn.innerHTML = '<i data-lucide="check"></i> Terminer';
        mapL.getContainer().style.cursor = 'crosshair';
      } else {
        drawModeBtn.innerHTML = '<i data-lucide="edit-3"></i> Mode Dessin';
        mapL.getContainer().style.cursor = '';
      }
      refreshIcons();
    });

    document.getElementById('btn-undo').addEventListener('click', undoWaypoint);
    document.getElementById('btn-clear').addEventListener('click', clearWaypoints);
    
    document.getElementById('btn-close-split').addEventListener('click', function() {
      document.getElementById('rando-split-stats').style.display = 'none';
      if (hoverMarkerL) {
        mapL.removeLayer(hoverMarkerL);
        mapR.removeLayer(hoverMarkerR);
        hoverMarkerL = null;
        hoverMarkerR = null;
      }
    });

    // Comparateur slider
    document.getElementById('slider-opacity').addEventListener('input', function(e) {
      var val = parseFloat(e.target.value);
      if (topoLayerL) topoLayerL.setOpacity(val);
    });

    // Mirror Layer toggles
    document.getElementById('btn-layer-radar').addEventListener('click', function(e) {
      e.currentTarget.classList.toggle('active');
      var isActive = e.currentTarget.classList.contains('active');
      if (isActive) {
        if (!radarLayer) {
          radarLayer = L.tileLayer('https://tile.rainviewer.com/api/maps/current/radar/{z}/{x}/{y}/2/1_1.png', {
            maxZoom: 19,
            opacity: 0.6,
            attribution: 'RainViewer'
          });
        }
        radarLayer.addTo(mapR);
      } else {
        if (radarLayer) mapR.removeLayer(radarLayer);
      }
    });

    document.getElementById('btn-layer-snow').addEventListener('click', function(e) {
      e.currentTarget.classList.toggle('active');
      var isActive = e.currentTarget.classList.contains('active');
      if (isActive) {
        if (!snowLayer) {
          snowLayer = L.tileLayer('https://tiles.opensnowmap.org/pistes/{z}/{x}/{y}.png', {
            maxZoom: 18,
            opacity: 0.8,
            attribution: 'OpenSnowMap'
          });
        }
        snowLayer.addTo(mapR);
      } else {
        if (snowLayer) mapR.removeLayer(snowLayer);
      }
    });

    document.getElementById('btn-layer-slope').addEventListener('click', function(e) {
      e.currentTarget.classList.toggle('active');
      var isActive = e.currentTarget.classList.contains('active');
      if (isActive) {
        if (!slopeLayer) {
          slopeLayer = L.tileLayer('https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.SLOPES.MOUNTAIN&STYLE=normal&FORMAT=image/png&TILEMATRIXSET=PM&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}', {
            maxZoom: 19,
            opacity: 0.65,
            attribution: 'IGN Slopes'
          });
        }
        slopeLayer.addTo(mapR);
      } else {
        if (slopeLayer) mapR.removeLayer(slopeLayer);
      }
    });

    // Locate Me
    document.getElementById('btn-locate').addEventListener('click', function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          var userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
          mapL.setView(userLatLng, 13);
        }, function() {
          alert('Impossible de vous géolocaliser.');
        });
      }
    });

    // GPX Importer listener
    document.getElementById('gpx-file-input').addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (!file) return;
      
      var reader = new FileReader();
      reader.onload = function(evt) {
        var gpxText = evt.target.result;
        var parsed = parseGPX(gpxText);
        if (parsed.points.length === 0) {
          alert('Aucun point tracé trouvé dans ce GPX.');
          return;
        }
        
        activeRoutePoints = parsed.points;
        if (parsed.hasEle) {
          elevationData = parsed.elevations;
          redrawWaypoints();
          renderProfile(activeRoutePoints, elevationData);
          updateStats(activeRoutePoints, elevationData);
        } else {
          redrawWaypoints();
        }
        
        if (activeRoutePoints.length > 0) {
          mapL.fitBounds(polylineL.getBounds(), { padding: [40, 40] });
        }
      };
      reader.readAsText(file);
    });

    // GPX Exporter listener
    document.getElementById('btn-export').addEventListener('click', function() {
      if (activeRoutePoints.length === 0) return;
      var gpxContent = exportGPX(activeRoutePoints, elevationData);
      downloadFile('azimut_parcours.gpx', gpxContent, 'application/gpx+xml');
    });

    // Initialize blank state
    updateStats([], []);

    // Set initial display of map tabs for mobile
    if (window.innerWidth < 768) {
      cardL.style.display = 'block';
      cardR.style.display = 'none';
    } else {
      cardL.style.display = 'block';
      cardR.style.display = 'block';
    }
  }

  // ============================================
  // ROUTER
  // ============================================
  function router() {
    var hash = window.location.hash || '#/';
    var appContainer = document.getElementById('app');
    appContainer.innerHTML = '';
    window.scrollTo(0, 0);

    // Dynamic route: session view
    if (hash.indexOf('#/sport/coaching/session/') === 0) {
      var sessionId = hash.split('/').pop();
      renderSessionView(appContainer, sessionId);
      return;
    }

    switch (hash) {
      case '#/':
        renderHome(appContainer);
        break;
      case '#/sport':
        renderSportHome(appContainer);
        break;
      case '#/sport/coaching':
        renderCoachingDashboard(appContainer);
        break;
      case '#/sport/coaching/onboarding':
        renderCoachingOnboarding(appContainer);
        break;
      case '#/sport/parcours':
        renderRouteGenerator(appContainer);
        break;
      case '#/sport/nutrition':
        renderNutritionPlan(appContainer);
        break;
      case '#/sport/nutrition/setup':
        renderNutritionSetup(appContainer);
        break;
      case '#/rando':
        renderRando(appContainer);
        break;
      case '#/pro':
        renderPro(appContainer);
        break;
      default:
        renderHome(appContainer);
        break;
    }
  }

  // ============================================
  // BOOT
  // ============================================
  // Force unregister old Service Workers (from Vite)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(function(reg) { reg.unregister(); });
    });
  }

  window.addEventListener('hashchange', router);
  window.addEventListener('DOMContentLoaded', function() {
    initProTimer();
    router();
  });

  // Make router available globally for manual testing
  window.azimutRouter = router;

})();
