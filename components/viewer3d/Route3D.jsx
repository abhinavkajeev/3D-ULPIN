'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '@/stores/useStore';

export default function Route3D() {
  const { navRoute, isNavigating, navOrigin, navDestination } = useStore();
  const pulseRef = useRef();
  const particleRef = useRef();

  const waypoints = navRoute?.waypoints || [];

  // Build 3D curve from waypoints
  const { curve, tubeGeometry, pointsArray } = useMemo(() => {
    if (waypoints.length < 2) return { curve: null, tubeGeometry: null, pointsArray: [] };

    const pts = waypoints.map(w => new THREE.Vector3(w.x, w.y, w.z));
    const catmull = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2);
    const geom = new THREE.TubeGeometry(catmull, 120, 1.2, 12, false);

    return { curve: catmull, tubeGeometry: geom, pointsArray: pts };
  }, [waypoints]);

  // Moving energy photon particle along the path
  useFrame((state) => {
    if (!curve || !particleRef.current) return;
    const t = (state.clock.elapsedTime * 0.15) % 1;
    const pos = curve.getPointAt(t);
    particleRef.current.position.copy(pos);

    if (pulseRef.current) {
      const s = 1.0 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      pulseRef.current.scale.set(s, s, s);
    }
  });

  if (!isNavigating || waypoints.length < 2) return null;

  const startPt = waypoints[0];
  const endPt = waypoints[waypoints.length - 1];
  const liftPt = waypoints.find(w => w.stage === 'vertical-base');

  return (
    <group>
      {/* Volumetric Glowing 3D Route Tube */}
      {tubeGeometry && (
        <mesh geometry={tubeGeometry}>
          <meshStandardMaterial
            color="#00f3ff"
            emissive="#00b4d8"
            emissiveIntensity={2.5}
            roughness={0.1}
            metalness={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {/* Animated Light Energy Pulse along the tube */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[2.4, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight color="#00ffff" intensity={4} distance={30} />
      </mesh>

      {/* Point A Marker (Ground Origin) */}
      {startPt && (
        <group position={[startPt.x, startPt.y, startPt.z]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.2, 1.8, 8, 16]} />
            <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={1.2} />
          </mesh>
          <mesh position={[0, 9, 0]} ref={pulseRef}>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshStandardMaterial color="#22c55e" emissive="#4ade80" emissiveIntensity={2} />
          </mesh>
          <Html position={[0, 13, 0]} center distanceFactor={50}>
            <div className="bg-emerald-950/95 border-2 border-emerald-400 rounded-lg px-3 py-1 shadow-[0_0_15px_rgba(74,222,128,0.5)] whitespace-nowrap text-center pointer-events-none animate-bounce">
              <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider block">📍 POINT A (START)</span>
              <span className="text-[9px] text-slate-200">{navOrigin?.name || 'Current Location'}</span>
            </div>
          </Html>
        </group>
      )}

      {/* Vertical Elevator Shaft Indicator */}
      {liftPt && (
        <group position={[liftPt.x, 0, liftPt.z]}>
          <mesh position={[0, (endPt.y) / 2, 0]}>
            <cylinderGeometry args={[1.5, 1.5, endPt.y, 16]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} wireframe />
          </mesh>
        </group>
      )}

      {/* Point B Destination Pin (Unit & Floor Level) */}
      {endPt && (
        <group position={[endPt.x, endPt.y, endPt.z]}>
          <mesh position={[0, 4, 0]}>
            <coneGeometry args={[2.2, 6, 16]} rotation={[Math.PI, 0, 0]} />
            <meshStandardMaterial color="#f43f5e" emissive="#e11d48" emissiveIntensity={2} />
          </mesh>
          <mesh position={[0, 8, 0]}>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial color="#fb7185" emissive="#f43f5e" emissiveIntensity={3} />
          </mesh>
          <Html position={[0, 12, 0]} center distanceFactor={45}>
            <div className="bg-rose-950/95 border-2 border-rose-400 rounded-lg px-3 py-1.5 shadow-[0_0_20px_rgba(244,63,94,0.6)] whitespace-nowrap text-center pointer-events-none animate-pulse">
              <span className="text-[10px] font-black text-rose-300 uppercase tracking-wider block">🎯 TARGET ULPIN DESTINATION</span>
              <span className="text-[11px] font-extrabold text-white block">Floor {navRoute.targetFloor} • Unit {navRoute.targetUnit}</span>
              <span className="text-[9px] text-rose-200 block">+{endPt.y.toFixed(1)}m Vertical Elevation</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
