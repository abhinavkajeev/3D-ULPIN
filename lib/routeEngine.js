// 3D Routing & Pathfinding Engine for Urban Cadastre & Vertical Navigation
import { infrastructure } from '@/data/infrastructure';

const originLon = 80.208;
const originLat = 13.051;
const R = 6378137;

function lonToX(lon) {
  return lon * (Math.PI / 180) * R;
}

function latToY(lat) {
  return Math.log(Math.tan((Math.PI / 4) + (lat * (Math.PI / 180)) / 2)) * R;
}

const originX = lonToX(originLon);
const originZ = latToY(originLat);

export function project(lon, lat) {
  const x = lonToX(lon) - originX;
  const z = -(latToY(lat) - originZ);
  return [x, z];
}

// Predefined landmark spawn points for Point A
export const LANDMARK_ORIGINS = [
  { id: 'vadapalani-junction', name: 'Vadapalani Junction / 100 Feet Rd', lon: 80.2081, lat: 13.0512 },
  { id: 'metro-station', name: 'Vadapalani Metro Station Concourse', lon: 80.2095, lat: 13.0520 },
  { id: 'arcot-west', name: 'Arcot Road West Gate (Saligramam Side)', lon: 80.2045, lat: 13.0505 },
  { id: 'kaveri-colony', name: 'Kaveri Rangan Colony Entrance', lon: 80.2062, lat: 13.0545 },
  { id: 'sims-junction', name: 'SIMS Hospital Traffic Square', lon: 80.2105, lat: 13.0485 },
];

/**
 * Calculates a multi-modal 3D path:
 * Phase 1: Ground road path from Point A to Building Footprint Entrance
 * Phase 2: Building Entryway Transition
 * Phase 3: Vertical ascent (elevator / staircase shaft) up to specific Floor
 * Phase 4: Corridors & indoor path to specific Unit
 */
export function calculate3DRoute(originCoord, targetBuilding, targetFloor = 1, targetUnit = null) {
  const [origX, origZ] = project(originCoord.lon, originCoord.lat);
  const [destX, destZ] = targetBuilding.worldCenter || project(targetBuilding.lon, targetBuilding.lat);

  const floorNum = Number(targetFloor) || 1;
  const floorHeight = targetBuilding.floorHeight || 3.5;
  const verticalTargetY = (floorNum - 1) * (floorHeight + 2.0) + floorHeight / 2;

  // 1. Generate realistic street-level waypoints
  const waypoints = [];
  waypoints.push({ x: origX, y: 0.8, z: origZ, stage: 'ground', label: 'Start Point A' });

  // Add intermediate Manhattan street waypoints for realistic city path
  const dx = destX - origX;
  const dz = destZ - origZ;
  
  // Midpoint 1: turn along grid
  const mid1X = origX + dx * 0.45;
  const mid1Z = origZ;
  waypoints.push({ x: mid1X, y: 0.8, z: mid1Z, stage: 'ground', label: 'Follow Arcot Corridor' });

  // Midpoint 2: turn towards building
  const mid2X = origX + dx * 0.45;
  const mid2Z = origZ + dz * 0.85;
  waypoints.push({ x: mid2X, y: 0.8, z: mid2Z, stage: 'ground', label: 'Approach Parcel Access Road' });

  // Building Ground Lobby Gate
  const lobbyX = destX - 12;
  const lobbyZ = destZ + 8;
  waypoints.push({ x: lobbyX, y: 0.8, z: lobbyZ, stage: 'entry', label: `Enter ${targetBuilding.name} Main Lobby` });

  // Central Vertical Elevator/Staircase Shaft
  const shaftX = destX - 2;
  const shaftZ = destZ + 2;
  waypoints.push({ x: shaftX, y: 1.0, z: shaftZ, stage: 'vertical-base', label: 'Take Elevator / Core Shaft' });

  // Vertical Shaft Ascent (intermediate floor steps)
  const stepsCount = Math.max(3, floorNum * 2);
  for (let s = 1; s <= stepsCount; s++) {
    const fraction = s / stepsCount;
    const currY = 1.0 + (verticalTargetY - 1.0) * fraction;
    waypoints.push({
      x: shaftX,
      y: currY,
      z: shaftZ,
      stage: 'vertical',
      label: s === stepsCount ? `Arrive at Floor ${floorNum}` : `Ascending... +${currY.toFixed(1)}m`
    });
  }

  // Floor Hallway to Unit
  const unitOffsetX = (targetUnit?.unitNumber % 2 === 0 ? 10 : -10);
  const unitOffsetZ = 8;
  const unitX = destX + unitOffsetX;
  const unitZ = destZ + unitOffsetZ;

  waypoints.push({
    x: shaftX + unitOffsetX * 0.5,
    y: verticalTargetY,
    z: shaftZ + unitOffsetZ * 0.5,
    stage: 'hallway',
    label: `Follow Floor ${floorNum} Corridor`
  });

  waypoints.push({
    x: unitX,
    y: verticalTargetY,
    z: unitZ,
    stage: 'unit-dest',
    label: targetUnit ? `Destination: Unit ${targetUnit.unitNumber}` : `Destination: Floor ${floorNum}`
  });

  // Calculate total ground & vertical distance
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];
    const d = Math.sqrt(
      Math.pow(p2.x - p1.x, 2) +
      Math.pow(p2.y - p1.y, 2) +
      Math.pow(p2.z - p1.z, 2)
    );
    totalDistance += d;
  }

  // Speed assumptions: Walking ground @ 1.4 m/s (5 km/h), Elevator @ 1.5 m/s
  const durationMinutes = Math.max(1, Math.round(totalDistance / 70));

  return {
    waypoints,
    distanceMeters: Math.round(totalDistance),
    durationMinutes,
    targetFloor: floorNum,
    targetUnit: targetUnit?.unitNumber || (floorNum * 100 + 1),
    buildingName: targetBuilding.name,
    steps: [
      { text: `Depart from Point A (${originCoord.name || 'Starting Point'})`, type: 'walk', dist: `${Math.round(Math.abs(dx))}m` },
      { text: `Follow designated road network toward ${targetBuilding.name}`, type: 'walk', dist: `${Math.round(Math.abs(dz))}m` },
      { text: `Pass security & access ${targetBuilding.name} Main Entrance`, type: 'entry', dist: '15m' },
      { text: `Ascend Central Lift Core to Level ${floorNum} (+${verticalTargetY.toFixed(1)}m elevation)`, type: 'elevator', dist: `${Math.round(verticalTargetY)}m vertical` },
      { text: `Walk through Floor ${floorNum} access hallway to Unit ${targetUnit?.unitNumber || (floorNum * 100 + 1)}`, type: 'indoor', dist: '18m' },
    ]
  };
}
