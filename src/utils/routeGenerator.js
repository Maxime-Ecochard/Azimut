/**
 * Algorithme de génération de parcours basé sur OSRM (Open Source Routing Machine).
 * Pour la version sans backend, on utilise l'API publique OSRM (démo).
 */

// Format GPX template
const gpxTemplate = (name, tracks) => \`<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Azimut PWA" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>\${name}</name>
  </metadata>
  <trk>
    <name>\${name}</name>
    <trkseg>
\${tracks.map(pt => \`      <trkpt lat="\${pt[1]}" lon="\${pt[0]}"></trkpt>\`).join('\\n')}
    </trkseg>
  </trk>
</gpx>\`;

/**
 * Génère des points aléatoires autour d'un centre pour forcer OSRM à faire une boucle.
 * @param {Array} startLngLat - [longitude, latitude]
 * @param {number} distanceKm - Distance ciblée en km
 */
function generateWaypoints(startLngLat, distanceKm) {
  const [lng, lat] = startLngLat;
  // Approximation : 1 degré de latitude ~ 111 km
  // Pour faire une boucle de D km, le rayon moyen est d'environ D / (2 * pi)
  const radiusKm = distanceKm / 6; 
  const radiusDeg = radiusKm / 111;

  // On génère 3 points intermédiaires pour former un cercle
  const waypoints = [];
  for (let angle = 60; angle <= 300; angle += 120) {
    const rad = angle * (Math.PI / 180);
    // On ajoute un peu d'aléatoire pour varier les parcours
    const r = radiusDeg * (0.8 + Math.random() * 0.4); 
    const pLng = lng + (r * Math.cos(rad) / Math.cos(lat * Math.PI / 180));
    const pLat = lat + (r * Math.sin(rad));
    waypoints.push([pLng, pLat]);
  }
  return waypoints;
}

/**
 * Appel API OSRM pour le routing
 */
export async function generateRoute(startLngLat, distanceKm, profile = 'foot') {
  // profile peut être 'foot', 'bike', 'car' dans OSRM public
  const osrmProfile = profile === 'velo' ? 'bike' : 'foot';
  
  // 1. Générer les waypoints intermédiaires pour la boucle
  const waypoints = generateWaypoints(startLngLat, distanceKm);
  
  // 2. Construire les coordonnées pour OSRM : départ -> wp1 -> wp2 -> wp3 -> arrivée (départ)
  const coords = [
    startLngLat,
    ...waypoints,
    startLngLat
  ];

  const coordString = coords.map(c => \`\${c[0]},\${c[1]}\`).join(';');

  // Utilisation du service public OSRM (Limité, idéal pour la démo)
  const url = \`https://router.project-osrm.org/route/v1/\${osrmProfile}/\${coordString}?overview=full&geometries=geojson\`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== 'Ok') {
      throw new Error('Erreur de routage OSRM: ' + data.code);
    }

    const route = data.routes[0];
    const generatedDistanceKm = route.distance / 1000;
    
    return {
      id: 'route_' + Date.now(),
      distanceKm: generatedDistanceKm.toFixed(2),
      durationMin: Math.round(route.duration / 60),
      coordinates: route.geometry.coordinates, // Array de [lng, lat]
      center: startLngLat,
      gpx: gpxTemplate(\`Parcours \${distanceKm}km\`, route.geometry.coordinates)
    };

  } catch (err) {
    console.error(err);
    throw new Error('Impossible de générer le parcours. Vérifie ta connexion.');
  }
}

/**
 * Télécharge une string sous forme de fichier local
 */
export function downloadFile(filename, content, type = 'application/gpx+xml') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
