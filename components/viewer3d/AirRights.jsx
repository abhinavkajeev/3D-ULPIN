'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import useStore from '@/stores/useStore';
import { infrastructure } from '@/data/infrastructure';

export default function AirRights() {
  const { layers, viewMode } = useStore();

  const concreteMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  const trackMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.8,
    metalness: 0.5,
  }), []);

  const airRightsMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#a855f7',
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    emissive: '#a855f7',
    emissiveIntensity: 0.2,
  }), []);

  const flyoverMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#475569',
    roughness: 0.8,
    metalness: 0.2,
  }), []);

  const flyoverRoadMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1e293b',
    roughness: 0.9,
    metalness: 0.1,
  }), []);

  const metroBeamMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#0284c7',
    roughness: 0.3,
    metalness: 0.6,
  }), []);

  if (viewMode === 'map') return null;

  return (
    <group>
      {/* Elevated Structures: Metro Viaducts & Flyovers */}
      {layers.elevatedStructures && infrastructure.elevatedStructures.map((struct) => {
        const isMetro = struct.type === 'metro';
        const midIndex = Math.floor(struct.path.length / 2);
        const midPoint = struct.path[midIndex] || struct.path[0];

        return (
          <group key={struct.id}>
            {/* Draw segments between each point in the path */}
            {struct.path.map((point, index) => {
              if (index === struct.path.length - 1) return null;
              
              const start = point;
              const end = struct.path[index + 1];
              
              const dx = end.x - start.x;
              const dz = end.z - start.z;
              const length = Math.sqrt(dx * dx + dz * dz);
              if (length < 0.5) return null;
              
              const cx = start.x + dx / 2;
              const cz = start.z + dz / 2;
              const cy = struct.elevation;
              
              const angle = Math.atan2(dx, dz);
              const numPillars = Math.max(1, Math.floor(length / 28));

              return (
                <group key={`${struct.id}-seg-${index}`} position={[cx, cy, cz]} rotation={[0, angle, 0]}>
                  {/* Viaduct / Deck Structure */}
                  <mesh castShadow receiveShadow material={isMetro ? concreteMaterial : flyoverMaterial}>
                    <boxGeometry args={[struct.width, isMetro ? 2.2 : 1.8, length]} />
                  </mesh>

                  {/* Top deck surface: rail tracks vs asphalt road */}
                  <mesh position={[0, isMetro ? 1.3 : 1.0, 0]} receiveShadow material={isMetro ? metroBeamMaterial : flyoverRoadMaterial}>
                    <boxGeometry args={[struct.width - (isMetro ? 2 : 1), 0.4, length]} />
                  </mesh>

                  {/* Support Pillars / Piers */}
                  {Array.from({ length: numPillars }).map((_, i) => {
                    const offset = (i - (numPillars - 1) / 2) * (length / numPillars);
                    return (
                      <mesh key={i} position={[0, -cy / 2, offset]} castShadow receiveShadow material={concreteMaterial}>
                        <cylinderGeometry args={[isMetro ? 1.8 : 2.2, isMetro ? 1.8 : 2.2, cy, 16]} />
                      </mesh>
                    );
                  })}

                  {/* Air Rights Protected Corridor Volume */}
                  {layers.airRights && (
                    <mesh position={[0, 8, 0]} material={airRightsMaterial}>
                      <boxGeometry args={[struct.width + 12, 16, length]} />
                    </mesh>
                  )}
                </group>
              );
            })}

            {/* Structure Tag Label */}
            {midPoint && (
              <Html position={[midPoint.x, struct.elevation + 4, midPoint.z]} center distanceFactor={70}>
                <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide backdrop-blur-md border shadow-lg whitespace-nowrap ${
                  isMetro 
                    ? 'bg-sky-950/90 text-sky-400 border-sky-500/60' 
                    : 'bg-slate-900/90 text-amber-400 border-amber-500/60'
                }`}>
                  {isMetro ? '🚇 ' : '🌉 '}
                  {struct.name}
                  <span className="ml-1.5 text-[9px] opacity-75 font-mono">
                    (+{struct.elevation}m)
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
