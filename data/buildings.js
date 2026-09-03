// Realistic building footprints for Chennai T. Nagar area
// Buildings are placed along actual road grids to align with the raster map tiles
// The T. Nagar grid runs roughly N-S and E-W with streets like:
// - Pondy Bazaar (E-W around 13.042)
// - GN Chetty Road (E-W around 13.041)
// - Ranganathan Street (N-S around 80.234)
// - Usman Road (N-S around 80.232)
// - Thyagaraya Road (E-W around 13.044)

function createBuilding(id, coords, height, type, name) {
  let color;
  if (height > 35) color = '#6366f1';       // tall = indigo
  else if (height > 25) color = '#3b82f6';  // mid-tall = blue
  else if (height > 15) color = '#0ea5e9';  // medium = sky blue
  else color = '#14b8a6';                    // short = teal

  return {
    type: 'Feature',
    properties: {
      id: `BLDG-${id}`,
      height,
      min_height: 0,
      color,
      building_type: type,
      name: name || null,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  };
}

// Helper: create a rectangular building given center, width, depth (in degrees)
function rect(cx, cy, w, h) {
  return [
    [cx - w/2, cy - h/2],
    [cx + w/2, cy - h/2],
    [cx + w/2, cy + h/2],
    [cx - w/2, cy + h/2],
    [cx - w/2, cy - h/2],
  ];
}

const features = [];
let id = 1000;

// ============================================================
// Block 1: Along Pondy Bazaar / Thyagaraya Nagar main area
// Commercial strip along 13.0425 latitude
// ============================================================
const pondyBazaarLat = 13.0425;
for (let i = 0; i < 12; i++) {
  const lng = 80.2310 + i * 0.0008;
  const w = 0.0003 + (i % 3) * 0.00008;
  const d = 0.0002 + (i % 4) * 0.00005;
  const h = 15 + (i % 5) * 8;
  features.push(createBuilding(id++, rect(lng, pondyBazaarLat + 0.0002, w, d), h, 'commercial', i === 5 ? 'Pondy Bazaar Mall' : null));
  features.push(createBuilding(id++, rect(lng, pondyBazaarLat - 0.0003, w * 0.9, d * 0.8), h - 4, 'commercial'));
}

// ============================================================
// Block 2: Along GN Chetty Road (13.041 lat)
// Mixed residential/commercial
// ============================================================
const gnChettyLat = 13.0412;
for (let i = 0; i < 14; i++) {
  const lng = 80.2305 + i * 0.0007;
  const w = 0.0002 + (i % 3) * 0.00006;
  const d = 0.0002 + (i % 2) * 0.00008;
  const h = 10 + (i * 3) % 20;
  features.push(createBuilding(id++, rect(lng, gnChettyLat + 0.0002, w, d), h, 'mixed'));
  features.push(createBuilding(id++, rect(lng + 0.0003, gnChettyLat - 0.0003, w * 0.85, d * 1.1), h + 3, 'residential'));
}

// ============================================================
// Block 3: North Usman Road corridor (N-S road ~80.232)
// ============================================================
const usmanRoadLng = 80.2320;
for (let i = 0; i < 10; i++) {
  const lat = 13.0395 + i * 0.0006;
  const w = 0.00025;
  const d = 0.00018 + (i % 3) * 0.00005;
  const h = 12 + (i * 7) % 25;
  features.push(createBuilding(id++, rect(usmanRoadLng + 0.0004, lat, w, d), h, 'commercial'));
  features.push(createBuilding(id++, rect(usmanRoadLng - 0.0004, lat + 0.0002, w * 0.9, d), h - 3, 'residential'));
}

// ============================================================
// Block 4: Ranganathan Street area (N-S road ~80.234)
// Dense commercial area
// ============================================================
const ranganathanLng = 80.2340;
for (let i = 0; i < 12; i++) {
  const lat = 13.0400 + i * 0.0005;
  const w = 0.00022 + (i % 4) * 0.00004;
  const d = 0.00015 + (i % 3) * 0.00006;
  const h = 18 + (i * 5) % 30;
  features.push(createBuilding(id++, rect(ranganathanLng + 0.00035, lat, w, d), h, 'commercial'));
  features.push(createBuilding(id++, rect(ranganathanLng - 0.00035, lat - 0.0001, w, d * 0.9), h - 2, 'commercial'));
}

// ============================================================
// Block 5: Thyagaraya Road (E-W road ~13.044)
// ============================================================
const thyagarayaLat = 13.0440;
for (let i = 0; i < 10; i++) {
  const lng = 80.2300 + i * 0.001;
  const w = 0.0003 + (i % 3) * 0.0001;
  const d = 0.00025;
  const h = 14 + (i * 4) % 22;
  features.push(createBuilding(id++, rect(lng, thyagarayaLat + 0.0003, w, d), h, 'mixed'));
  features.push(createBuilding(id++, rect(lng + 0.0004, thyagarayaLat - 0.0003, w * 0.7, d * 0.8), h + 5, 'residential'));
}

// ============================================================
// Block 6: Interior blocks - residential neighborhoods
// Between GN Chetty Rd and Pondy Bazaar
// ============================================================
for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 8; col++) {
    const lng = 80.2308 + col * 0.0009 + (row % 2) * 0.0004;
    const lat = 13.0414 + row * 0.0004;
    const w = 0.00015 + (row * col) % 3 * 0.00005;
    const d = 0.00012 + (row + col) % 4 * 0.00004;
    const h = 6 + ((row * 7 + col * 3) % 18);
    const type = h > 15 ? 'apartments' : 'house';
    features.push(createBuilding(id++, rect(lng, lat, w, d), h, type));
  }
}

// ============================================================
// Block 7: South of GN Chetty Road - more dense residential
// ============================================================
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 10; col++) {
    const lng = 80.2305 + col * 0.0008;
    const lat = 13.0390 + row * 0.0004;
    const w = 0.00016 + (row + col) % 3 * 0.00004;
    const d = 0.00013 + (row * col) % 4 * 0.00003;
    const h = 7 + ((row * 5 + col * 4) % 20);
    features.push(createBuilding(id++, rect(lng, lat, w, d), h, 'residential'));
  }
}

// ============================================================
// Block 8: Landmark / larger buildings
// ============================================================
features.push(createBuilding(id++, rect(80.2350, 13.0418, 0.0006, 0.0004), 8, 'commercial', 'T. Nagar Bus Terminus'));
features.push(createBuilding(id++, rect(80.2332, 13.0432, 0.0004, 0.0003), 22, 'commercial', 'Panagal Park Complex'));
features.push(createBuilding(id++, rect(80.2345, 13.0430, 0.0005, 0.0004), 28, 'commercial', 'Saravana Stores'));
features.push(createBuilding(id++, rect(80.2360, 13.0440, 0.0003, 0.0003), 42, 'apartments', 'Skyline Tower'));
features.push(createBuilding(id++, rect(80.2318, 13.0448, 0.00025, 0.00025), 38, 'apartments', 'Nagar Heights'));
features.push(createBuilding(id++, rect(80.2375, 13.0410, 0.00028, 0.00035), 35, 'apartments', 'Park View Residency'));

// ============================================================
// Block 9: North area near Kodambakkam / above Thyagaraya Rd
// ============================================================
for (let row = 0; row < 4; row++) {
  for (let col = 0; col < 8; col++) {
    const lng = 80.2310 + col * 0.0009;
    const lat = 13.0450 + row * 0.0005;
    const w = 0.00018 + (row + col) % 3 * 0.00005;
    const d = 0.00014 + (row * col) % 4 * 0.00004;
    const h = 8 + ((row * 6 + col * 5) % 22);
    features.push(createBuilding(id++, rect(lng, lat, w, d), h, 'residential'));
  }
}

// ============================================================
// Block 10: East side - Nandanam area
// ============================================================
for (let row = 0; row < 5; row++) {
  for (let col = 0; col < 5; col++) {
    const lng = 80.2380 + col * 0.0008;
    const lat = 13.0395 + row * 0.0005;
    const w = 0.00020 + (row + col) % 3 * 0.00005;
    const d = 0.00015 + (row * col) % 3 * 0.00004;
    const h = 10 + ((row * 4 + col * 6) % 25);
    features.push(createBuilding(id++, rect(lng, lat, w, d), h, 'residential'));
  }
}

export const chennaiBuildings = {
  type: 'FeatureCollection',
  features,
};

// Alias for backward compatibility (used by ulpinGenerator.js)
export const buildings = [
  {
    id: 'BLDG-VAD-001',
    name: 'Nexus Vijaya Mall - Main Retail Wing',
    height: 38.5,
    type: 'commercial',
    floors: 8,
    totalUnits: 48,
    parcelId: 'parcel-vad-001',
    coordinates: [80.2081, 13.0511],
    floorHeight: 4.5,
  },
  {
    id: 'BLDG-VAD-002',
    name: 'Nexus Vijaya Mall - Entertainment & PVR Palazzo Tower',
    height: 42.0,
    type: 'commercial',
    floors: 9,
    totalUnits: 36,
    parcelId: 'parcel-vad-001',
    coordinates: [80.2084, 13.0513],
    floorHeight: 4.5,
  },
  {
    id: 'BLDG-VAD-003',
    name: 'Hotel Greenpark Luxury Suites & Banquet Block',
    height: 35.0,
    type: 'commercial',
    floors: 10,
    totalUnits: 60,
    parcelId: 'parcel-vad-002',
    coordinates: [80.2088, 13.0528],
    floorHeight: 3.5,
  },
  {
    id: 'BLDG-VAD-004',
    name: 'SIMS Multi-Speciality Hospital Clinical Block',
    height: 44.0,
    type: 'institutional',
    floors: 11,
    totalUnits: 88,
    parcelId: 'parcel-vad-003',
    coordinates: [80.2120, 13.0522],
    floorHeight: 4.0,
  },
  {
    id: 'BLDG-VAD-005',
    name: 'Kamala Multiplex Cinema & Commercial Hub',
    height: 24.0,
    type: 'commercial',
    floors: 5,
    totalUnits: 20,
    parcelId: 'parcel-vad-004',
    coordinates: [80.2118, 13.0502],
    floorHeight: 4.8,
  },
  {
    id: 'BLDG-VAD-006',
    name: 'Doshi Gardens Residential Tower A',
    height: 48.0,
    type: 'residential',
    floors: 14,
    totalUnits: 112,
    parcelId: 'parcel-vad-005',
    coordinates: [80.2075, 13.0488],
    floorHeight: 3.4,
  },
  {
    id: 'BLDG-VAD-007',
    name: 'Vadapalani Elevated Metro Station Concourse & Platform',
    height: 22.0,
    type: 'infrastructure',
    floors: 3,
    totalUnits: 12,
    parcelId: 'parcel-vad-006',
    coordinates: [80.2132, 13.0508],
    floorHeight: 6.0,
  },
];

// Mock data generator for ULPIN units
export function generateUnits(bldgId, floors, unitsPerFloor, bldgName, isCommercial) {
  const units = [];
  const statuses = ['verified', 'pending', 'disputed'];
  
  for (let f = 1; f <= floors; f++) {
    for (let u = 1; u <= unitsPerFloor; u++) {
      const unitNum = `${f}${(u < 10 ? '0' : '') + u}`;
      units.push({
        id: `${bldgId}-U${unitNum}`,
        number: unitNum,
        unitNumber: unitNum,
        floor: f,
        type: isCommercial ? 'Commercial Space' : 'Residential Appt',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        occupant: isCommercial ? `Business ${unitNum}` : `Resident ${unitNum}`,
        owner: isCommercial ? `Corporate ${unitNum}` : `Owner ${unitNum}`,
        area: Math.floor(500 + Math.random() * 1500),
        elevation: (f - 1) * 3.5,
        height: 3.5,
        registrationDate: `202${Math.floor(Math.random() * 4)}-${(Math.floor(Math.random() * 12) + 1).toString().padStart(2, '0')}-15`,
        marketValue: Math.floor(5000000 + Math.random() * 20000000),
        sqft: Math.floor(500 + Math.random() * 1500)
      });
    }
  }
  return units;
}

// Get units for a specific building and floor
export function getFloorUnits(buildingId, floor) {
  const building = buildings.find(b => b.id === buildingId);
  if (!building) return [];
  const unitsPerFloor = Math.max(2, Math.floor(building.totalUnits / building.floors));
  const isCommercial = building.type === 'commercial';
  const allUnits = generateUnits(buildingId, building.floors, unitsPerFloor, building.name, isCommercial);
  return allUnits.filter(u => u.floor === floor);
}

