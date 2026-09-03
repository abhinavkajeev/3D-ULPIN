'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '@/stores/useStore';
import Floor from './Floor';

const realisticPalette = ['#e2e8f0', '#cbd5e1', '#f1f5f9', '#f8fafc', '#f5f5f4', '#e7e5e4'];

export default function Building({ data }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { selectedBuilding, selectBuilding, isExploded, setExploded, setHoveredBuilding, setRightPanel } = useStore();

  const isSelected = selectedBuilding?.id === data.id;
  const isOtherSelected = selectedBuilding && !isSelected;

  // Realistic material
  const material = useMemo(() => {
    // Generate a consistent realistic color based on building ID length or hash
    const colorIndex = data.id.length % realisticPalette.length;
    const baseColor = new THREE.Color(data.color === '#4a9eff' || data.color.startsWith('#') ? realisticPalette[colorIndex] : data.color);
    
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      metalness: data.material === 'glass' ? 0.8 : 0.1,
      roughness: data.material === 'glass' ? 0.2 : 0.8,
      transparent: isOtherSelected,
      opacity: isOtherSelected ? 0.1 : 1, // Fade out non-selected buildings
    });
  }, [data.color, data.id.length, data.material, isOtherSelected]);

  // Roof material (slightly darker or different color)
  const roofMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#94a3b8'),
      metalness: 0.2,
      roughness: 0.9,
      transparent: isOtherSelected,
      opacity: isOtherSelected ? 0.1 : 1,
    });
  }, [isOtherSelected]);

  // Holographic highlight material
  const highlightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00d4ff'),
      emissive: new THREE.Color('#00d4ff'),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide, // Render over the building slightly
    });
  }, []);

  useFrame(() => {
    if (meshRef.current && !isExploded) {
      if (hovered || isSelected) {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, data.height / 2 + 0.3, 0.1);
      } else {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, data.height / 2, 0.1);
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      setExploded(!isExploded);
      setRightPanel('building');
    } else {
      selectBuilding(data);
      setRightPanel('building');
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredBuilding(data.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredBuilding(null);
    document.body.style.cursor = 'default';
  };

  if (isSelected && isExploded) {
    return (
      <group position={[data.position.x, 0, data.position.z]}>
        {Array.from({ length: data.floors }, (_, i) => (
          <Floor key={i} building={data} floorNumber={i + 1} totalFloors={data.floors} />
        ))}
        <Html position={[0, data.height + 8, 0]} center distanceFactor={60}>
          <div className="glass-strong rounded-xl px-4 py-2 text-center animate-fade-in pointer-events-none">
            <p className="text-xs font-bold text-accent-cyan whitespace-nowrap">{data.name}</p>
            <p className="text-[10px] text-text-muted">{data.floors} Floors • {data.totalUnits} Units</p>
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group position={[data.position.x, 0, data.position.z]}>
      {/* Base Building */}
      <mesh
        ref={meshRef}
        position={[0, data.height / 2, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[data.footprint.width, data.height, data.footprint.depth]} />
        {/* Assign roof material to the top face (index 2 or 3 depending on orientation) */}
        <meshStandardMaterial attach="material-0" {...material} />
        <meshStandardMaterial attach="material-1" {...material} />
        <meshStandardMaterial attach="material-2" {...roofMaterial} /> {/* Top */}
        <meshStandardMaterial attach="material-3" {...material} />     {/* Bottom */}
        <meshStandardMaterial attach="material-4" {...material} />
        <meshStandardMaterial attach="material-5" {...material} />
      </mesh>

      {/* Holographic Selection Overlay */}
      {(hovered || isSelected) && !isOtherSelected && (
        <mesh position={[0, data.height / 2, 0]} material={highlightMaterial}>
          <boxGeometry args={[data.footprint.width + 0.4, data.height + 0.4, data.footprint.depth + 0.4]} />
        </mesh>
      )}

      {/* Realistic Windows (only for modern/glass buildings) */}
      {!isOtherSelected && data.material === 'glass' && Array.from({ length: data.floors }, (_, fi) => (
        <group key={fi}>
          {Array.from({ length: Math.floor(data.footprint.width / 3) }, (_, wi) => (
            <mesh
              key={`w-${fi}-${wi}`}
              position={[
                -data.footprint.width / 2 + 1.5 + wi * 3,
                fi * data.floorHeight + data.floorHeight / 2 + 0.5,
                data.footprint.depth / 2 + 0.05,
              ]}
            >
              <planeGeometry args={[1.5, 1.2]} />
              <meshStandardMaterial
                color="#0f172a"
                metalness={0.9}
                roughness={0.1}
                envMapIntensity={2.0} // High reflection for daylight
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Status indicator (only disputed) */}
      {data.status === 'disputed' && !isOtherSelected && (
        <mesh position={[0, data.height + 2, 0]}>
          <sphereGeometry args={[0.6, 16, 16]} />
          <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.8} />
        </mesh>
      )}
    </group>
  );
}
