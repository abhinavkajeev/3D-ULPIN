'use client';

import { useMemo, useCallback } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import buildingsData from '@/data/chennai_osm_buildings.json';
import { generateUnits } from '@/data/buildings';
import ProceduralBuilding from './ProceduralBuilding';
import useStore from '@/stores/useStore';

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

function project(lon, lat) {
  const x = lonToX(lon) - originX;
  const z = -(latToY(lat) - originZ);
  return [x, z];
}

const WORLD_SIZE = 2 * Math.PI * R;

// ── Tile component ──
function MapTile({ tx, ty, tz }) {
  const { layers } = useStore();
  const hasUnderground = layers.waterPipelines || layers.sewerLines || layers.electricalLines || layers.gasLines;
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "3a3edcc685e54cc2a4e4afa2fb34aa2a";
  const url = `https://maps.geoapify.com/v1/tile/osm-bright/${tz}/${tx}/${ty}@2x.png?apiKey=${apiKey}`;
  const texture = useLoader(THREE.TextureLoader, url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;

  const tileSize = WORLD_SIZE / Math.pow(2, tz);
  const centerX = (tx * tileSize) - (WORLD_SIZE / 2) + (tileSize / 2);
  const centerY = (WORLD_SIZE / 2) - (ty * tileSize) - (tileSize / 2);
  const posX = centerX - originX;
  const posZ = -(centerY - originZ);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[posX, -0.2, posZ]} receiveShadow>
      <planeGeometry args={[tileSize, tileSize]} />
      <meshStandardMaterial 
        map={texture} 
        roughness={1.0} 
        transparent={hasUnderground}
        opacity={hasUnderground ? 0.35 : 1.0}
        depthWrite={!hasUnderground}
      />
    </mesh>
  );
}

function TileGrid() {
  const zoom = 15;
  const centerTx = Math.floor((originLon + 180) / 360 * Math.pow(2, zoom));
  const centerTy = Math.floor((1 - Math.log(Math.tan(originLat * Math.PI / 180) + 1 / Math.cos(originLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
  
  const gridSize = 3; // 7x7 = 49 tiles (reduced from 9x9=81)
  const tiles = [];
  
  for (let x = -gridSize; x <= gridSize; x++) {
    for (let y = -gridSize; y <= gridSize; y++) {
      tiles.push({ tx: centerTx + x, ty: centerTy + y, tz: zoom });
    }
  }

  return (
    <group>
      {tiles.map(t => (
        <MapTile key={`${t.tz}-${t.tx}-${t.ty}`} tx={t.tx} ty={t.ty} tz={t.tz} />
      ))}
    </group>
  );
}

// ── Batched static buildings (single merged geometry = 1 draw call) ──
function BatchedBuildings({ buildings }) {
  const { mesh, edges } = useMemo(() => {
    const geometries = [];
    for (const b of buildings) {
      try {
        const geom = new THREE.ExtrudeGeometry(b.shape, {
          depth: b.height,
          bevelEnabled: false,
        });
        geom.rotateX(-Math.PI / 2);
        // Translate to world position at ground level
        geom.translate(0, 0, 0);
        geometries.push(geom);
      } catch (e) {
        // Skip invalid shapes
      }
    }
    if (geometries.length === 0) return { mesh: null, edges: null };
    const merged = mergeGeometries(geometries, false);
    geometries.forEach(g => g.dispose());
    const edgesGeom = new THREE.EdgesGeometry(merged, 15);
    return { mesh: merged, edges: edgesGeom };
  }, [buildings]);

  if (!mesh) return null;

  return (
    <group>
      <mesh geometry={mesh} castShadow receiveShadow>
        <meshStandardMaterial
          color="#151520"
          metalness={0.4}
          roughness={0.7}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color="#00f3ff" transparent opacity={0.25} />
      </lineSegments>
    </group>
  );
}

export default function ProceduralCity() {
  const { selectedBuilding } = useStore();

  const processedBuildings = useMemo(() => {
    const withDistance = buildingsData.map(b => {
      const dx = lonToX(b.lon) - originX;
      const dz = latToY(b.lat) - originZ;
      return { ...b, distSq: dx * dx + dz * dz };
    });

    // Reduced to 600 from 1200 for better performance
    const nearestBuildings = withDistance.sort((a, b) => a.distSq - b.distSq).slice(0, 600);

    const items = nearestBuildings.map((building, index) => {
      const shape = new THREE.Shape();
      building.coordinates.forEach((coord, i) => {
        const [x, z] = project(coord[0], coord[1]);
        if (i === 0) shape.moveTo(x, -z);
        else shape.lineTo(x, -z);
      });
      
      const area = building.area || 80;
      let height = 9;
      if (building.levels) {
        height = building.levels * 3.5;
      } else if (area > 500) {
        height = 36 + (index % 4) * 6;
      } else if (area > 250) {
        height = 18 + (index % 3) * 4;
      } else {
        height = 8 + (index % 3) * 3;
      }
      
      const floors = Math.max(1, Math.floor(height / 3.5));
      const unitsPerFloor = Math.max(2, Math.floor(area / 80));
      const type = (building.name || area > 250) ? 'commercial' : 'residential';
      const statuses = ['verified', 'pending', 'disputed'];
      
      const bldgId = `BLDG-${index}`;
      const bldgName = building.name || `Survey Plot ${index + 101}`;
      const units = generateUnits(bldgId, floors, unitsPerFloor, bldgName, type === 'commercial');

      return {
        ...building,
        id: bldgId,
        name: bldgName,
        shape,
        height: Math.round(height * 10) / 10,
        floorHeight: 3.5,
        floors,
        totalUnits: floors * unitsPerFloor,
        units,
        type,
        occupancy: 0.5 + Math.random() * 0.45,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        zoneName: 'Central District',
        color: type === 'commercial' ? '#4a9eff' : '#00f3ff',
        coordinates: { lat: building.lat, lon: building.lon },
        worldCenter: project(building.lon, building.lat),
        polygon: building.coordinates
      };
    });

    if (typeof window !== 'undefined') {
      window.__CITY_BUILDINGS__ = items;
    }
    return items;
  }, []);

  // Split: selected building is interactive, all others are batched
  const selectedId = selectedBuilding?.id;
  const interactiveBuilding = processedBuildings.find(b => b.id === selectedId);
  const staticBuildings = processedBuildings.filter(b => b.id !== selectedId);

  return (
    <group>
      {/* Single merged mesh for all non-selected buildings (1 draw call) */}
      <BatchedBuildings buildings={staticBuildings} />

      {/* Invisible click hitboxes so user can click any building to select it */}
      {staticBuildings.map((building) => (
        <ClickableHitbox key={building.id} data={building} />
      ))}

      {/* Only the selected building renders as full interactive component */}
      {interactiveBuilding && (
        <ProceduralBuilding key={interactiveBuilding.id} data={interactiveBuilding} />
      )}

      <TileGrid />
    </group>
  );
}

// Invisible clickable hitbox for each building
function ClickableHitbox({ data }) {
  const { selectBuilding, setRightPanel } = useStore();
  
  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(data.shape, {
      depth: data.height,
      bevelEnabled: false,
    });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [data.shape, data.height]);

  return (
    <mesh
      geometry={geom}
      onClick={(e) => {
        e.stopPropagation();
        selectBuilding(data);
        setRightPanel('building');
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { document.body.style.cursor = 'default'; }}
    >
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}
