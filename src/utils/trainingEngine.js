// Moteur de génération de plan d'entraînement (Inspiré par Campus Coach)

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

export function getAvailablePrograms() {
  return PROGRAMS;
}

/**
 * Calcule l'allure de base en min/km à partir d'un niveau ou chrono
 */
function calculateBasePace(level) {
  switch(level) {
    case 'Débutant': return 7.5; // 7:30 /km
    case 'Intermédiaire': return 6.0; // 6:00 /km
    case 'Confirmé': return 5.0; // 5:00 /km
    case 'Expert': return 4.2; // 4:12 /km
    default: return 6.5;
  }
}

/**
 * Formate un pace (décimal) en mm:ss
 */
export function formatPace(paceDecimal) {
  const min = Math.floor(paceDecimal);
  const sec = Math.round((paceDecimal - min) * 60);
  return \`\${min}:\${sec.toString().padStart(2, '0')}\`;
}

/**
 * Génère un plan complet
 */
export function generateTrainingPlan(profile) {
  const { programId, level, sessionsPerWeek, targetDate, preferredDays } = profile;
  
  const program = PROGRAMS.find(p => p.id === programId) || PROGRAMS[0];
  const totalWeeks = program.durationWeeks;
  const basePace = calculateBasePace(level);
  
  const plan = {
    id: 'plan_' + Date.now(),
    programName: program.name,
    totalWeeks,
    sessionsPerWeek,
    basePace,
    targetDate,
    startDate: new Date().toISOString(),
    weeks: []
  };

  // Generation basique des semaines
  for (let w = 1; w <= totalWeeks; w++) {
    const week = {
      weekNumber: w,
      type: w === totalWeeks ? 'Affûtage' : (w <= totalWeeks / 2 ? 'Développement' : 'Spécifique'),
      sessions: []
    };

    // Distribution des jours selon les préférences (simplifié pour V1)
    const daysToRun = preferredDays.length >= sessionsPerWeek 
      ? preferredDays.slice(0, sessionsPerWeek) 
      : ['Lundi', 'Mercredi', 'Vendredi', 'Dimanche'].slice(0, sessionsPerWeek);

    for (let s = 0; s < sessionsPerWeek; s++) {
      const sessionType = determineSessionType(s, sessionsPerWeek, week.type);
      
      week.sessions.push({
        id: \`w\${w}_s\${s+1}\`,
        dayName: daysToRun[s],
        type: sessionType.name,
        durationMinutes: sessionType.duration,
        description: sessionType.desc,
        pace: formatPace(basePace * sessionType.paceMultiplier),
        status: 'pending', // pending, completed, missed
        feedback: null
      });
    }
    
    plan.weeks.push(week);
  }

  return plan;
}

function determineSessionType(sessionIndex, totalSessions, weekType) {
  // Logique simplifiée :
  // S1: Footing EF (Endurance Fondamentale)
  // S2: Fractionné ou VMA (si > 2 séances)
  // S3: Sortie Longue (si week-end)
  
  if (sessionIndex === 0) {
    return { name: 'Endurance Fondamentale', duration: 45, paceMultiplier: 1.1, desc: 'Footing souple, tu dois pouvoir parler.' };
  } else if (sessionIndex === totalSessions - 1) {
    return { name: 'Sortie Longue', duration: weekType === 'Affûtage' ? 60 : 90, paceMultiplier: 1.15, desc: 'Travailler l\'endurance sur la durée.' };
  } else {
    if (weekType === 'Spécifique') {
      return { name: 'Allure Spécifique', duration: 60, paceMultiplier: 0.95, desc: 'Travail à l\'allure cible de ta course.' };
    }
    return { name: 'Fractionné', duration: 50, paceMultiplier: 0.85, desc: 'Intervalles courts pour développer la VMA.' };
  }
}

/**
 * Met à jour dynamiquement le plan selon le feedback
 */
export function adjustPlanWithFeedback(plan, sessionId, feedback) {
  // feedback = 'facile', 'faisable', 'difficile'
  // Si difficile, on réduit l'intensité de la prochaine séance spécifique
  // Logique simulée pour la V1
  console.log(\`Ajustement du plan suite au feedback \${feedback} pour la séance \${sessionId}\`);
  return plan; // Retourne le plan muté ou nouvelle copie
}
