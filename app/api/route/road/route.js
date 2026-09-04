// Next.js App Router API Route — server-side road routing
// Runs on Node.js, reads OSM JSON, runs Dijkstra, returns 3D waypoints
// This keeps the 168KB OSM JSON OFF the client bundle entirely.

import { NextResponse } from 'next/server';
import osmCorridors from '@/data/osm_vadapalani_corridors.json';

// ── World-space projection (same formula as ProceduralCity.jsx) ───────────────
const originLon = 80.208;
const originLat = 13.051;
const R = 6378137;

function lonToX(lon) { return lon * (Math.PI / 180) * R; }
function latToY(lat) { return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) * R; }

const originX = lonToX(originLon);
const originZ = latToY(originLat);

function project(lon, lat) {
  return [lonToX(lon) - originX, -(latToY(lat) - originZ)];
}

// ── Road graph (built once per server process) ────────────────────────────────
let _graph = null;

function getGraph() {
  if (_graph) return _graph;

  const nodeCoords = {};
  for (const el of osmCorridors.elements) {
    if (el.type === 'node' && el.lon !== undefined) {
      const [x, z] = project(el.lon, el.lat);
      nodeCoords[el.id] = { id: el.id, lon: el.lon, lat: el.lat, x, z };
    }
  }

  const adj = new Map();
  const addEdge = (n1, n2, street) => {
    const c1 = nodeCoords[n1], c2 = nodeCoords[n2];
    if (!c1 || !c2) return;
    const dist = Math.hypot(c2.x - c1.x, c2.z - c1.z);
    if (dist < 0.1) return;
    if (!adj.has(n1)) adj.set(n1, []);
    if (!adj.has(n2)) adj.set(n2, []);
    adj.get(n1).push({ id: n2, x: c2.x, z: c2.z, dist, street });
    adj.get(n2).push({ id: n1, x: c1.x, z: c1.z, dist, street });
  };

  for (const el of osmCorridors.elements) {
    if (el.type !== 'way' || !el.tags?.highway) continue;
    const street = el.tags.name || el.tags.highway;
    const valid = el.nodes.filter(id => nodeCoords[id]);
    for (let i = 0; i < valid.length - 1; i++) addEdge(valid[i], valid[i + 1], street);
  }

  const nodes = Object.values(nodeCoords).filter(n => adj.has(n.id));
  _graph = { nodes, adj, nodeCoords };
  return _graph;
}

function nearestNode(graph, x, z) {
  let best = null, bestD = Infinity;
  for (const n of graph.nodes) {
    const d = Math.hypot(n.x - x, n.z - z);
    if (d < bestD) { bestD = d; best = n; }
  }
  return best;
}

function dijkstra(graph, startId, endId) {
  const dist = new Map([[startId, 0]]);
  const prev = new Map();
  const visited = new Set();
  const queue = [{ id: startId, d: 0 }];

  while (queue.length) {
    queue.sort((a, b) => a.d - b.d);
    const { id: cur } = queue.shift();
    if (visited.has(cur)) continue;
    visited.add(cur);
    if (cur === endId) break;

    for (const edge of (graph.adj.get(cur) || [])) {
      if (visited.has(edge.id)) continue;
      const newD = dist.get(cur) + edge.dist;
      if (newD < (dist.get(edge.id) ?? Infinity)) {
        dist.set(edge.id, newD);
        prev.set(edge.id, { from: cur, street: edge.street });
        queue.push({ id: edge.id, d: newD });
      }
    }
  }

  // Reconstruct
  const path = [];
  let cur = endId;
  while (cur !== undefined) {
    const n = graph.nodeCoords[cur];
    if (!n) break;
    const e = prev.get(cur);
    path.unshift({ x: n.x, z: n.z, street: e?.street || 'Road' });
    cur = e?.from;
  }
  return path.length > 1 ? path : null;
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const oLon = parseFloat(searchParams.get('oLon'));
  const oLat = parseFloat(searchParams.get('oLat'));
  const dLon = parseFloat(searchParams.get('dLon'));
  const dLat = parseFloat(searchParams.get('dLat'));
  const dX   = parseFloat(searchParams.get('dX') || 'NaN');   // pre-projected building worldCenter
  const dZ   = parseFloat(searchParams.get('dZ') || 'NaN');
  const floor = parseInt(searchParams.get('floor') || '1', 10);
  const unit  = parseInt(searchParams.get('unit') || '101', 10);
  const buildingName = searchParams.get('building') || 'Building';

  if (isNaN(oLon) || isNaN(oLat) || isNaN(dLon) || isNaN(dLat)) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const graph = getGraph();

  const [origX, origZ] = project(oLon, oLat);
  const destX = isNaN(dX) ? project(dLon, dLat)[0] : dX;
  const destZ = isNaN(dZ) ? project(dLon, dLat)[1] : dZ;

  const FLOOR_H = 3.5;
  const LOBBY_H = 1.2;
  const verticalY = (floor - 1) * (FLOOR_H + 0.15) + FLOOR_H / 2;

  const startNode = nearestNode(graph, origX, origZ);
  const endNode   = nearestNode(graph, destX, destZ);

  const roadPath = (startNode && endNode) ? dijkstra(graph, startNode.id, endNode.id) : null;

  // Assemble waypoints
  const waypoints = [];
  waypoints.push({ x: origX, y: 0.8, z: origZ, stage: 'start' });

  if (startNode && Math.hypot(startNode.x - origX, startNode.z - origZ) > 3) {
    waypoints.push({ x: startNode.x, y: 0.8, z: startNode.z, stage: 'road' });
  }

  if (roadPath && roadPath.length > 1) {
    for (let i = 1; i < roadPath.length; i++) {
      waypoints.push({ x: roadPath[i].x, y: 0.8, z: roadPath[i].z, stage: 'road', street: roadPath[i].street });
    }
  }

  // Gate approach
  const gateX = endNode ? destX + (endNode.x - destX) * 0.3 - 4 : destX - 8;
  const gateZ = endNode ? destZ + (endNode.z - destZ) * 0.3 + 4 : destZ + 5;
  waypoints.push({ x: gateX, y: 0.8, z: gateZ, stage: 'gate' });

  // Lobby
  waypoints.push({ x: destX, y: LOBBY_H, z: destZ, stage: 'vertical-base' });

  // Elevator
  const liftSteps = Math.max(4, floor * 2);
  for (let s = 1; s <= liftSteps; s++) {
    const frac = s / liftSteps;
    waypoints.push({ x: destX, y: LOBBY_H + (verticalY - LOBBY_H) * frac, z: destZ, stage: 'vertical' });
  }

  // Unit
  const side = unit % 2 === 0 ? 1 : -1;
  waypoints.push({ x: destX + side * 4, y: verticalY, z: destZ + 3, stage: 'hallway' });
  waypoints.push({ x: destX + side * 8, y: verticalY, z: destZ + 6, stage: 'unit-dest' });

  // Metrics
  const roadDist = roadPath
    ? roadPath.reduce((s, p, i) => i === 0 ? 0 : s + Math.hypot(p.x - roadPath[i-1].x, p.z - roadPath[i-1].z), 0)
    : Math.hypot(destX - origX, destZ - origZ);

  const durationMin = Math.max(1, Math.round(roadDist / 80 + floor * 0.3));

  // Steps for HUD
  const steps = [];
  steps.push({ icon: '📍', text: 'Depart from starting point', dist: '0m', type: 'road' });

  if (roadPath && roadPath.length > 1) {
    let curStreet = roadPath[0].street;
    let segDist = 0;
    for (let i = 1; i < roadPath.length; i++) {
      segDist += Math.hypot(roadPath[i].x - roadPath[i-1].x, roadPath[i].z - roadPath[i-1].z);
      if (roadPath[i].street !== curStreet || i === roadPath.length - 1) {
        steps.push({ icon: i === 1 ? '🚶' : '↱', text: `Continue on ${curStreet}`, dist: `${Math.round(segDist)}m`, type: 'road' });
        curStreet = roadPath[i].street;
        segDist = 0;
      }
    }
  }

  steps.push({ icon: '🏢', text: `Enter ${buildingName} — main gate`, dist: '15m', type: 'gate' });
  steps.push({ icon: '🛗', text: `Take elevator to Floor ${floor} (+${verticalY.toFixed(1)}m)`, dist: `${Math.round(verticalY)}m`, type: 'elevator' });
  steps.push({ icon: '🚪', text: `Walk corridor to Unit #${unit}`, dist: '12m', type: 'indoor' });

  return NextResponse.json({
    waypoints,
    distanceMeters: Math.round(roadDist + verticalY + 30),
    durationMinutes: durationMin,
    targetFloor: floor,
    targetUnit: unit,
    buildingName,
    steps,
    verticalMeters: verticalY,
  });
}
