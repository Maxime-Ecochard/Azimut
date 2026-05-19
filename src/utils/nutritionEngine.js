import { getProducts } from '../data/nutritionProducts.js';

/**
 * Calcule le besoin en glucides (g/h)
 */
function calculateCarbsNeed(durationHours, weather) {
  let baseCarbs = 40; // Base: 40g/h
  if (durationHours > 3) baseCarbs += 20; // Ultra: 60g/h
  if (weather === 'Froid') baseCarbs += 10; // Froid: on brûle plus
  return baseCarbs;
}

/**
 * Génère le plan nutritionnel selon le profil
 */
export function generateNutritionPlan(profile) {
  const { distance, duration, weather, digestive, preferences } = profile;
  
  const durationHours = parseFloat(duration);
  const targetCarbsPerHour = calculateCarbsNeed(durationHours, weather);
  
  const products = getProducts();
  const plan = {
    id: 'nutri_' + Date.now(),
    targetCarbsPerHour,
    totalDuration: durationHours,
    timeline: []
  };

  // Filtrer les produits selon les préférences (simplifié)
  const allowedProducts = products.filter(p => !preferences.avoidCategories.includes(p.category));

  // Générer une timeline par tranche d'une heure
  for (let h = 1; h <= Math.ceil(durationHours); h++) {
    const isLastHour = h === Math.ceil(durationHours);
    let hourCarbs = 0;
    const hourProducts = [];

    // Sélection naïve de produits pour atteindre l'objectif
    // Dans la vraie vie : mix solide/liquide selon la tolérance digestive
    for (const p of allowedProducts) {
      if (hourCarbs + p.carbsPerUnit <= targetCarbsPerHour + 10) {
        hourProducts.push(p);
        hourCarbs += p.carbsPerUnit;
      }
      if (hourCarbs >= targetCarbsPerHour - 5) break;
    }

    plan.timeline.push({
      hour: h,
      label: isLastHour ? \`Heure \${h} (Fin)\` : \`Heure \${h}\`,
      targetCarbs: targetCarbsPerHour,
      actualCarbs: hourCarbs,
      products: hourProducts,
      hydrationMl: weather === 'Chaud' ? 700 : 500
    });
  }

  return plan;
}
