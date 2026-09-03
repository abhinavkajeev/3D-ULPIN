'use client';

import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '@/stores/useStore';
import ProceduralFloor from './ProceduralFloor';

export default function ProceduralBuilding({ data }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { selectedBuilding, selectBuilding, isExploded, setExploded, setHoveredBuilding, setRightPanel } = useStore();

  const isSelected = selectedBuilding?.id === data.id;
  const isOtherSelected = selectedBuilding && !isSelected;

  const { geom, edges, center } = useMemo(() => {
    const extrudeGeom = new THREE.ExtrudeGeometry(data.shape, {
      depth: data.height,
      bevelEnabled: false,
    });
    extrudeGeom.rotateX(-Math.PI / 2);
    // Center it around y=0 for simple scaling/lerping
    extrudeGeom.translate(0, -data.height / 2, 0);
    
    extrudeGeom.computeBoundingBox();
    const center = new THREE.Vector3();
    extrudeGeom.boundingBox.getCenter(center);
    
    const edgesGeom = new THREE.EdgesGeometry(extrudeGeom);
    
    return { geom: extrudeGeom, edges: edgesGeom, center };
  }, [data.shape, data.height]);

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#151520'),
      metalness: 0.4,
      roughness: 0.7,
      transparent: isOtherSelected,
      opacity: isOtherSelected ? 0.1 : 1,
    });
  }, [isOtherSelected]);

  const highlightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#00d4ff'),
      emissive: new THREE.Color('#00d4ff'),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
  }, []);

  const edgeMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color('#00f3ff'),
      linewidth: 1,
      transparent: true,
      opacity: isOtherSelected ? 0.1 : 0.4,
    });
  }, [isOtherSelected]);

  useFrame(() => {
    if (meshRef.current && !isExploded) {
      if (hovered || isSelected) {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, data.height / 2 + 2.0, 0.1);
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
      <group>
        {Array.from({ length: data.floors }, (_, i) => (
          <ProceduralFloor key={i} building={data} floorNumber={i + 1} />
        ))}
        <Html position={[center.x, data.height + 15, center.z]} center distanceFactor={60}>
          <div className="glass-strong rounded-xl px-4 py-2 text-center animate-fade-in pointer-events-none">
            <p className="text-xs font-bold text-accent-cyan whitespace-nowrap">{data.name}</p>
            <p className="text-[10px] text-text-muted">{data.floors} Floors • {data.totalUnits} Units</p>
          </div>
        </Html>
      </group>
    );
  }

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[0, data.height / 2, 0]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
        geometry={geom}
        material={material}
      >
        <lineSegments geometry={edges} material={edgeMaterial} />
      </mesh>

      {/* Holographic Selection Overlay */}
      {(hovered || isSelected) && !isOtherSelected && (
        <mesh position={[0, data.height / 2, 0]} material={highlightMaterial} geometry={geom} scale={1.05} />
      )}
    </group>
  );
}
