'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import useStore from '@/stores/useStore';

export default function FloorBoundaries3D() {
  const { layers } = useStore();

  const floorRings = useMemo(() => {
    const items = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 120 + (i % 3) * 60;
      const cx = Math.cos(angle) * radius;
      const cz = Math.sin(angle) * radius;
      const floors = 4 + (i % 5);
      
      for (let f = 1; f <= floors; f++) {
        items.push({
          id: `fb-${i}-${f}`,
          pos: [cx, f * 3.5, cz],
          width: 25 + (i % 4) * 5,
          length: 25 + (i % 3) * 5,
        });
      }
    }
    return items;
  }, []);

  if (!layers.floorBoundaries) return null;

  return (
    <group>
      {floorRings.map((ring) => (
        <mesh key={ring.id} position={ring.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[ring.width, ring.length]} />
          <meshBasicMaterial color="#14b8a6" wireframe transparent opacity={0.35} />
        </mesh>
      ))}
    </group>
  );
}
