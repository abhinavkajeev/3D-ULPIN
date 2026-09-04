// ─────────────────────────────────────────────────────────────────────────────
//  3D ULPIN Route Engine  — Client-side thin wrapper
//  Heavy computation (Dijkstra on OSM) runs server-side at /api/route/road
//  This file is safe to import in client components — zero large imports.
// ─────────────────────────────────────────────────────────────────────────────

// ── World-space projection (identical to ProceduralCity.jsx) ─────────────────
const originLon = 80.208;
const originLat = 13.051;
const R = 6378137;

function lonToX(lon) { return lon * (Math.PI / 180) * R; }
function latToY(lat) { return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) * R; }

const originX = lonToX(originLon);
const originZ = latToY(originLat);

export function project(lon, lat) {
  const x = lonToX(lon) - originX;
  const z = -(latToY(lat) - originZ);
  return [x, z];
}

// ── Real Vadapalani landmark locations ────────────────────────────────────────
export const REAL_VADAPALANI_LOCATIONS = [
  { id: 'vadapalani-metro',  name: 'Vadapalani Metro Station',  category: 'Transit Hub',     lon: 80.2095, lat: 13.0520, address: '100 Feet Rd & Arcot Rd Junction', icon: '🚇' },
  { id: 'sims-hospital',     name: 'SIMS Hospital',             category: 'Healthcare',       lon: 80.2105, lat: 13.0485, address: '1 Jawaharlal Nehru Salai',         icon: '🏥' },
  { id: 'nexus-mall',        name: 'Nexus Vijaya Mall',         category: 'Commercial Hub',   lon: 80.2081, lat: 13.0511, address: '183 Arcot Road, Vadapalani',       icon: '🏬' },
  { id: 'greenpark-hotel',   name: 'Hotel Greenpark',           category: 'Hospitality',      lon: 80.2088, lat: 13.0528, address: 'NSK Salai, Vadapalani',            icon: '🏨' },
  { id: 'kamala-theatre',    name: 'Kamala Multiplex',          category: 'Entertainment',    lon: 80.2118, lat: 13.0502, address: '18 Arcot Road, Vadapalani',        icon: '🎭' },
  { id: 'arcot-west-gate',   name: 'Arcot Road West Gate',      category: 'Road Junction',    lon: 80.2038, lat: 13.0503, address: 'Arcot Road Outer Corridor',        icon: '🛣️'  },
  { id: 'kaveri-colony',     name: 'Kaveri Rangan Colony',      category: 'Residential Area', lon: 80.2065, lat: 13.0545, address: 'Kaveri Rangan Main Road',          icon: '🏘️'  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  Main Export — calculate3DRoute
//  Async: calls the Next.js API route for server-side OSM Dijkstra routing.
//  Returns the same route object shape as before.
// ─────────────────────────────────────────────────────────────────────────────
export async function calculate3DRoute(originCoord, targetBuilding, targetFloor = 1, targetUnit = null) {
  const floorNum = Math.max(1, Number(targetFloor) || 1);
  const unitNum  = targetUnit?.unitNumber || (floorNum * 100 + 1);

  const destLon = targetBuilding.lon ?? targetBuilding.coordinates?.lon;
  const destLat = targetBuilding.lat ?? targetBuilding.coordinates?.lat;

  // If building has a pre-projected worldCenter, pass it to the server
  const [dX, dZ] = targetBuilding.worldCenter
    ? targetBuilding.worldCenter
    : project(destLon, destLat);

  const params = new URLSearchParams({
    oLon: originCoord.lon,
    oLat: originCoord.lat,
    dLon: destLon ?? originCoord.lon,
    dLat: destLat ?? originCoord.lat,
    dX,
    dZ,
    floor: floorNum,
    unit: unitNum,
    building: targetBuilding.name || 'Building',
  });

  const res = await fetch(`/api/route/road?${params}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Route API error ${res.status}`);
  }

  const data = await res.json();
  return data;
}
