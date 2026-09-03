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

export default function ProceduralFloor({ building, floorNumber }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { selectedFloor, selectFloor, setRightPanel } = useStore();

  const isSelected = selectedFloor === floorNumber;
  const floorHeight = 3;
  const explodeOffset = (floorNumber - 1) * (floorHeight + 2.0);
  
  const floorType = floorNumber === 1 ? (building.type === 'commercial' ? 'commercial' : 'mixed') :
                    building.type === 'commercial' ? 'commercial' : 'residential';
  const floorColor = floorTypeColors[floorType] || floorTypeColors.residential;

  // Main floor material — solid, visible, with strong emissive when selected
  const material = useMemo(() => {
    if (isSelected) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#00d4ff'),
        emissive: new THREE.Color('#00d4ff'),
        emissiveIntensity: 2.5,
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: 0.95,
      });
    }
    if (hovered) {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1e90ff'),
        emissive: new THREE.Color('#1e90ff'),
        emissiveIntensity: 0.5,
        metalness: 0.2,
        roughness: 0.3,
        transparent: true,
        opacity: 0.85,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(floorColor),
      metalness: 0.1,
      roughness: 0.5,
      transparent: true,
      opacity: 0.55,
    });
  }, [floorColor, hovered, isSelected]);

  // Outer glow shell material (BackSide) — creates a glowing halo effect around the selected floor
  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#00ffff'),
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide,
    });
  }, []);

  const edgeMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: isSelected ? '#00ffff' : hovered ? '#60a5fa' : '#ffffff',
      transparent: true,
      opacity: isSelected ? 1 : hovered ? 0.7 : 0.3,
      linewidth: 2,
    });
  }, [isSelected, hovered]);

  const { floorGeometry, edgesGeometry, center } = useMemo(() => {
    const geom = new THREE.ExtrudeGeometry(building.shape, {
      depth: floorHeight * 0.9,
      bevelEnabled: false,
    });
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, -floorHeight * 0.45, 0);

    geom.computeBoundingBox();
    const center = new THREE.Vector3();
    geom.boundingBox.getCenter(center);

    const edges = new THREE.EdgesGeometry(geom);
    return { floorGeometry: geom, edgesGeometry: edges, center };
  }, [building.shape]);

  const targetY = explodeOffset + floorHeight / 2;

  // Animate group position + pulsing glow on selected floor
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.12);
    }
    // Pulse the glow shell when selected
    if (glowRef.current && isSelected) {
      const pulse = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
      glowRef.current.material.opacity = pulse;
      glowRef.current.scale.setScalar(1.06 + Math.sin(state.clock.elapsedTime * 2) * 0.02);
    }
    // Pulse the main mesh emissive when selected
    if (meshRef.current && isSelected && meshRef.current.material.emissive) {
      const intensity = 2.0 + Math.sin(state.clock.elapsedTime * 4) * 1.0;
      meshRef.current.material.emissiveIntensity = intensity;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    selectFloor(floorNumber);
    setRightPanel('floor');
  };

  return (
    <group ref={groupRef} position={[0, floorNumber * floorHeight, 0]}>
      {/* Main floor mesh */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        castShadow
        receiveShadow
        material={material}
        geometry={floorGeometry}
      />

      {/* Outer glow shell — only shown on selected floor */}
      {isSelected && (
        <mesh
          ref={glowRef}
          geometry={floorGeometry}
          material={glowMaterial}
          scale={1.08}
        />
      )}

      {/* Edge wireframe */}
      <lineSegments material={edgeMaterial} geometry={edgesGeometry} />

      {/* Floating Floor Badge */}
      <Html position={[center.x, floorHeight / 2 + 1, center.z]} center distanceFactor={40}>
        <div
          className={`rounded-lg px-3 py-1.5 text-center pointer-events-none whitespace-nowrap transition-all duration-300 ${
            isSelected 
              ? 'bg-cyan-950/95 border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.6)] text-cyan-300 scale-125' 
              : hovered
                ? 'bg-slate-900/90 border border-blue-400 text-blue-300 scale-105'
                : 'bg-slate-950/70 border border-slate-700 text-slate-400'
          }`}
          style={{ opacity: hovered || isSelected ? 1 : 0.7 }}
        >
          <p className="text-[11px] font-extrabold tracking-wider">
            {isSelected ? `⚡ FLOOR ${floorNumber} ⚡` : `Floor ${floorNumber}`}
          </p>
        </div>
      </Html>
    </group>
  );
}
