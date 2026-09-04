'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '@/stores/useStore';

// ── Constants ─────────────────────────────────────────────────────────────────
const TUBE_RADIUS = 0.8;       // Route tube radius in world units
const PARTICLE_RADIUS = 1.6;   // Animated sphere radius
const PARTICLE_SPEED = 0.12;   // Fraction of curve per second

// ── Colour palette ────────────────────────────────────────────────────────────
const COLORS = {
  road:     '#0044cc', // Dark blue
  gate:     '#223399', // Deeper blue
  elevator: '#cc5500', // Dark orange/brown
  indoor:   '#aa0033', // Dark red
  start:    '#007722', // Dark green
  end:      '#aa0033',
  particle: '#ffffff',
  lift:     '#cc5500',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function RouteMarker({ position, color, emissive, label, sublabel, ping = false }) {
  return (
    <group position={position}>
      {/* Vertical pin */}
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.25, 1.6, 8, 16]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={1.5} />
      </mesh>
      {/* Globe top */}
      <mesh position={[0, 9, 0]}>
        <sphereGeometry args={[2.2, 20, 20]} />
        <meshStandardMaterial color={color} emissive={emissive} emissiveIntensity={2.5} transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 9, 0]} color={color} intensity={3} distance={40} />
      {/* Label */}
      <Html position={[0, 14, 0]} center distanceFactor={55}>
        <div
          className="whitespace-nowrap text-center pointer-events-none select-none px-3 py-1.5 rounded-xl"
          style={{
            background: 'rgba(3,5,15,0.95)',
            border: `2px solid ${color}`,
            boxShadow: `0 0 16px ${color}88`,
          }}
        >
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color }}>{label}</p>
          {sublabel && <p className="text-[9px] text-slate-300 mt-0.5">{sublabel}</p>}
        </div>
      </Html>
    </group>
  );
}

function ElevatorShaft({ x, z, topY, color = COLORS.lift }) {
  if (topY < 1) return null;
  return (
    <group position={[x, 0, z]}>
      {/* Wireframe shaft */}
      <mesh position={[0, topY / 2, 0]}>
        <cylinderGeometry args={[2.5, 2.5, topY, 12]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>
      {/* Inner glow */}
      <mesh position={[0, topY / 2, 0]}>
        <cylinderGeometry args={[1.5, 1.5, topY, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      {/* Floor rings */}
      {Array.from({ length: Math.max(2, Math.ceil(topY / 3.65)) }, (_, i) => (
        <mesh key={i} position={[0, i * 3.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.3, 2.6, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ── Segment-coloured tube ─────────────────────────────────────────────────────
function RouteSegment({ pts, color, opacity = 0.85 }) {
  const geom = useMemo(() => {
    if (pts.length < 2) return null;
    const vectors = pts.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const curve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.3);
    return new THREE.TubeGeometry(curve, pts.length * 4, TUBE_RADIUS, 10, false);
  }, [pts]);

  if (!geom) return null;
  return (
    <mesh geometry={geom}>
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        roughness={0.2}
        metalness={0.5}
        transparent={false}
        opacity={1}
      />
    </mesh>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Route3D() {
  const { navRoute, isNavigating, navOrigin } = useStore();
  const particleRef = useRef();
  const pulseRef = useRef();

  const waypoints = navRoute?.waypoints || [];

  // Build full curve for particle animation
  const fullCurve = useMemo(() => {
    if (waypoints.length < 2) return null;
    const pts = waypoints.map(w => new THREE.Vector3(w.x, w.y, w.z));
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3);
  }, [waypoints]);

  // Segment waypoints by stage for colouring
  const segments = useMemo(() => {
    if (waypoints.length < 2) return [];

    const result = [];
    let current = { stage: waypoints[0]?.stage || 'road', pts: [waypoints[0]] };

    for (let i = 1; i < waypoints.length; i++) {
      const w = waypoints[i];
      const stageGroup = ['start', 'road', 'road-end'].includes(w.stage) ? 'road'
        : ['vertical-base', 'vertical'].includes(w.stage) ? 'elevator'
        : w.stage === 'gate' ? 'gate'
        : 'indoor';

      const prevGroup = ['start', 'road', 'road-end'].includes(current.stage) ? 'road'
        : ['vertical-base', 'vertical'].includes(current.stage) ? 'elevator'
        : current.stage === 'gate' ? 'gate'
        : 'indoor';

      if (stageGroup !== prevGroup) {
        // Include transition point in both segments for continuity
        current.pts.push(w);
        result.push({ ...current });
        current = { stage: w.stage, pts: [w] };
      } else {
        current.pts.push(w);
      }
    }
    result.push(current);
    return result;
  }, [waypoints]);

  // Animated traveling particle
  useFrame((state) => {
    if (!fullCurve || !particleRef.current) return;
    const t = (state.clock.elapsedTime * PARTICLE_SPEED) % 1;
    const pos = fullCurve.getPointAt(t);
    particleRef.current.position.copy(pos);

    if (pulseRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
      pulseRef.current.scale.setScalar(s);
    }
  });

  if (!isNavigating || waypoints.length < 2) return null;

  const startPt = waypoints[0];
  const endPt = waypoints[waypoints.length - 1];
  const liftBasePt = waypoints.find(w => w.stage === 'vertical-base');
  const liftTopPt = [...waypoints].reverse().find(w => w.stage === 'vertical');

  const stageColor = (stage) =>
    ['start', 'road', 'road-end'].includes(stage) ? COLORS.road
    : ['vertical-base', 'vertical'].includes(stage) ? COLORS.elevator
    : stage === 'gate' ? COLORS.gate
    : COLORS.indoor;

  return (
    <group>
      {/* ── Coloured route segments ─── */}
      {segments.map((seg, i) => (
        <RouteSegment
          key={i}
          pts={seg.pts}
          color={stageColor(seg.stage)}
          opacity={seg.stage === 'road' || seg.stage === 'start' ? 0.82 : 0.9}
        />
      ))}

      {/* ── Elevator shaft visual ─── */}
      {liftBasePt && liftTopPt && (
        <ElevatorShaft
          x={liftBasePt.x}
          z={liftBasePt.z}
          topY={liftTopPt.y}
          color={COLORS.lift}
        />
      )}

      {/* ── Animated traveling particle ─── */}
      {fullCurve && (
        <group ref={particleRef}>
          <mesh ref={pulseRef}>
            <sphereGeometry args={[PARTICLE_RADIUS, 14, 14]} />
            <meshBasicMaterial color={COLORS.particle} />
          </mesh>
          <pointLight color="#00ffff" intensity={5} distance={35} />
        </group>
      )}

      {/* ── Point A marker ─── */}
      {startPt && (
        <RouteMarker
          position={[startPt.x, startPt.y, startPt.z]}
          color={COLORS.start}
          emissive="#16a34a"
          label="📍 Point A — Departure"
          sublabel={navOrigin?.name || 'Starting Point'}
        />
      )}

      {/* ── Point B marker (destination floor level) ─── */}
      {endPt && (
        <RouteMarker
          position={[endPt.x, endPt.y, endPt.z]}
          color={COLORS.end}
          emissive="#e11d48"
          label={`🎯 Floor ${navRoute?.targetFloor} · Unit #${navRoute?.targetUnit}`}
          sublabel={navRoute?.buildingName}
        />
      )}
    </group>
  );
}
