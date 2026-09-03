'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '@/stores/useStore';

const floorTypeColors = {
  residential: '#3b82f6',
  commercial: '#f59e0b',
  mixed: '#a855f7',
  parking: '#64748b',
  institutional: '#14b8a6',
};

export default function Floor({ building, floorNumber, totalFloors }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { selectedFloor, selectFloor, setRightPanel } = useStore();

  const isSelected = selectedFloor === floorNumber;
  const explodeOffset = (floorNumber - 1) * (building.floorHeight + 2.0); // Slightly more gap for realistic look
  
  const floorType = floorNumber === 1 ? (building.type === 'commercial' ? 'commercial' : 'mixed') :
                    building.type === 'commercial' ? 'commercial' : 'residential';
  const floorColor = floorTypeColors[floorType] || floorTypeColors.residential;

  // Use a glass-like material for floors to look holographic in realistic daylight
  const material = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(isSelected ? '#00d4ff' : hovered ? '#1e90ff' : floorColor),
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.8, // Glass-like transparency
      thickness: 1.0,
      transparent: true,
      opacity: isSelected ? 0.9 : hovered ? 0.8 : 0.6,
      emissive: new THREE.Color(isSelected ? '#00d4ff' : '#000000'),
      emissiveIntensity: isSelected ? 0.5 : 0,
    });
  }, [floorColor, hovered, isSelected]);

  const edgeMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: isSelected ? '#00d4ff' : '#ffffff',
      transparent: true,
      opacity: isSelected ? 1 : 0.4,
      linewidth: 2,
    });
  }, [isSelected]);

  useFrame(() => {
    if (meshRef.current) {
      const targetY = explodeOffset + building.floorHeight / 2;
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.08);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    selectFloor(floorNumber);
    setRightPanel('floor');
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[0, explodeOffset + building.floorHeight / 2, 0]}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        castShadow
        receiveShadow
        material={material}
      >
        <boxGeometry args={[building.footprint.width, building.floorHeight * 0.9, building.footprint.depth]} />
      </mesh>

      <lineSegments position={[0, explodeOffset + building.floorHeight / 2, 0]} material={edgeMaterial}>
        <edgesGeometry args={[new THREE.BoxGeometry(building.footprint.width, building.floorHeight * 0.9, building.footprint.depth)]} />
      </lineSegments>

      <Html position={[building.footprint.width / 2 + 3, explodeOffset + building.floorHeight / 2, 0]} center distanceFactor={40}>
        <div
          className={`rounded-lg px-2.5 py-1 text-center pointer-events-none whitespace-nowrap transition-all ${
            isSelected ? 'bg-bg-primary/90 border border-accent-cyan shadow-glow-cyan' : 'bg-bg-primary/70 border border-border'
          }`}
          style={{ opacity: hovered || isSelected ? 1 : 0.7 }}
        >
          <p className={`text-[11px] font-bold ${isSelected ? 'text-accent-cyan' : 'text-text-primary'}`}>
            F{floorNumber}
          </p>
        </div>
      </Html>
    </group>
  );
}
