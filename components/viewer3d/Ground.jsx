'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import useStore from '@/stores/useStore';
import { infrastructure } from '@/data/infrastructure';

export default function Ground() {
  const { layers } = useStore();

  const groundMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#e2e8f0', // Light concrete/urban color
      roughness: 1,
      metalness: 0,
      depthWrite: true,
    });
  }, []);

  const roadMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#334155', // Dark asphalt
      roughness: 0.9,
      metalness: 0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
  }, []);

  return (
    <group>
      {/* Base Ground Plane (Concrete/Urban base) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow material={groundMaterial}>
        <planeGeometry args={[1000, 1000]} />
      </mesh>

      {/* Subtle Grid Helper for scale */}
      <gridHelper args={[1000, 100]} position={[0, -0.05, 0]} material-opacity={0.15} material-transparent material-color="#94a3b8" />

      {/* Roads */}
      {layers.roads && infrastructure.roads.map((road) => (
        <group key={road.id}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[road.position.x, 0.05, road.position.z]} receiveShadow material={roadMaterial}>
            <planeGeometry args={[road.width, road.length]} />
          </mesh>
          {/* Street markings (Dashed white line) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[road.position.x, 0.08, road.position.z]} receiveShadow>
            <planeGeometry args={[0.3, road.length]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
          </mesh>
        </group>
      ))}

      {/* Green Zones (Parks & Cadastral Parcels) */}
      {layers.parcels && (
        <group position={[0, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[80, 0.02, 60]} receiveShadow>
            <planeGeometry args={[60, 40]} />
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.25} roughness={1} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-50, 0.02, -80]} receiveShadow>
            <planeGeometry args={[90, 70]} />
            <meshStandardMaterial color="#00d4ff" transparent opacity={0.25} roughness={1} />
          </mesh>
        </group>
      )}

      {/* Admin Boundaries in 3D */}
      {layers.adminBoundaries && (
        <group position={[0, 0.1, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[290, 295, 64]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
}
