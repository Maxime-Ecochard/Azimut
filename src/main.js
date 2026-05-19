import { renderHome } from './pages/Home.js';
import { renderSportHome } from './pages/Sport/SportHome.js';
import { renderCoachingDashboard } from './pages/Sport/Coaching/Dashboard.js';
import { renderRouteGenerator } from './pages/Sport/Routes/RouteGenerator.js';
import { renderCoachingOnboarding } from './pages/Sport/Coaching/Onboarding.js';
import { renderSessionView } from './pages/Sport/Coaching/SessionView.js';
import { renderNutritionSetup } from './pages/Sport/Nutrition/NutritionSetup.js';
import { renderNutritionPlan } from './pages/Sport/Nutrition/NutritionPlan.js';

const appContainer = document.getElementById('app');

// Simple Hash Router
function router() {
  const hash = window.location.hash || '#/';
  appContainer.innerHTML = ''; // Clear container

  // Scroll to top on route change
  window.scrollTo(0, 0);

  // Dynamic route matching
  if (hash.startsWith('#/sport/coaching/session/')) {
    const sessionId = hash.split('/').pop();
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
    // Add other routes later (Onboarding, Session, Maps, etc.)
    default:
      renderHome(appContainer); // Fallback
      break;
  }

  // Re-initialize Lucide icons for the newly injected HTML
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Listen to hash changes
window.addEventListener('hashchange', router);

// Initialize router on load
window.addEventListener('DOMContentLoaded', router);

// Force unregister old Service Workers to prevent Vite PWA conflicts
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Ancien Service Worker supprimé.');
    }
  });
}
