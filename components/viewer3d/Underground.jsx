'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { Html } from '@react-three/drei';
import useStore from '@/stores/useStore';
import { infrastructure } from '@/data/infrastructure';

export default function Underground() {
  const { layers, viewMode } = useStore();

  const activePipes = useMemo(() => {
    const result = {};
    if (layers.waterPipelines) result.water = infrastructure.waterPipelines || [];
    if (layers.sewerLines) result.sewer = infrastructure.sewerLines || [];
    if (layers.electricalLines) result.electrical = infrastructure.electricalLines || [];
    if (layers.gasLines) result.gas = infrastructure.gasLines || [];
    return result;
  }, [layers.waterPipelines, layers.sewerLines, layers.electricalLines, layers.gasLines]);

  const batchedMeshes = useMemo(() => {
    const typeConfig = {
      water:      { color: '#0ea5e9', emissive: '#0284c7', ei: 0.8, radius: 3.0, jointScale: 1.5 },
      sewer:      { color: '#22c55e', emissive: '#16a34a', ei: 0.6, radius: 3.5, jointScale: 1.5 },
      electrical: { color: '#facc15', emissive: '#eab308', ei: 1.0, radius: 2.2, jointScale: 1.3 },
      gas:        { color: '#f87171', emissive: '#ef4444', ei: 0.9, radius: 2.8, jointScale: 1.5 },
    };

    const results = [];

    for (const [type, pipes] of Object.entries(activePipes)) {
      const cfg = typeConfig[type];
      const pipeGeoms = [];
      const jointGeoms = [];
      const labels = [];

      for (let pIdx = 0; pIdx < pipes.length; pIdx++) {
        const pipe = pipes[pIdx];
        const depth = pipe.depth || -3;

        for (let i = 0; i < pipe.path.length; i++) {
          const pt = pipe.path[i];

          // ── Joint sphere at every node ──
          const sphere = new THREE.SphereGeometry(cfg.radius * cfg.jointScale, 10, 10);
          sphere.translate(pt.x, depth, pt.z);
          jointGeoms.push(sphere);

          // ── Pipe cylinder between consecutive nodes ──
          if (i < pipe.path.length - 1) {
            const next = pipe.path[i + 1];
            const dx = next.x - pt.x;
            const dy = 0; // same depth for both ends
            const dz = next.z - pt.z;
            const segLen = Math.sqrt(dx * dx + dz * dz);
            if (segLen < 0.3) continue;

            // CylinderGeometry default: upright along local Y, centered at origin
            const cyl = new THREE.CylinderGeometry(cfg.radius, cfg.radius, segLen, 12);

            // Build a transformation matrix to position & orient this cylinder
            // from pt → next along the XZ ground plane at the given depth
            const midX = (pt.x + next.x) / 2;
            const midZ = (pt.z + next.z) / 2;

            // Direction vector in XZ plane
            const dir = new THREE.Vector3(dx, 0, dz).normalize();
            // Cylinder default axis is Y; we need to rotate it to lie along dir
            // Quaternion from Y-axis to dir
            const up = new THREE.Vector3(0, 1, 0);
            const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

            const mat4 = new THREE.Matrix4();
            mat4.compose(
              new THREE.Vector3(midX, depth, midZ),
              quat,
              new THREE.Vector3(1, 1, 1)
            );
            cyl.applyMatrix4(mat4);

            pipeGeoms.push(cyl);
          }
        }

        // Label every 8th pipe to keep it clean
        if (pIdx % 8 === 0 && pipe.path.length > 1) {
          const mid = pipe.path[Math.floor(pipe.path.length / 2)];
          labels.push({
            position: [mid.x, (pipe.depth || -3) + 4, mid.z],
            name: pipe.name?.split('-')[0] || type.toUpperCase(),
            depth: pipe.depth || -3,
            type,
          });
        }
      }

      // ── Merge all pipe geometries of this type into 1 mesh ──
      let mergedPipes = null;
      let mergedJoints = null;

      if (pipeGeoms.length > 0) {
        try {
          mergedPipes = mergeGeometries(pipeGeoms, false);
        } catch (e) { /* skip */ }
        pipeGeoms.forEach(g => g.dispose());
      }
      if (jointGeoms.length > 0) {
        try {
          mergedJoints = mergeGeometries(jointGeoms, false);
        } catch (e) { /* skip */ }
        jointGeoms.forEach(g => g.dispose());
      }

      // Pipe body material — metallic with glow
      const pipeMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.15,
        metalness: 0.85,
        emissive: cfg.emissive,
        emissiveIntensity: cfg.ei,
      });

      // Joint material — slightly brighter
      const jointMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.1,
        metalness: 0.9,
        emissive: cfg.emissive,
        emissiveIntensity: cfg.ei * 1.3,
      });

      results.push({ type, mergedPipes, mergedJoints, pipeMat, jointMat, labels });
    }

    return results;
  }, [activePipes]);

  if (viewMode === 'map') return null;

  return (
    <group>
      {batchedMeshes.map(({ type, mergedPipes, mergedJoints, pipeMat, jointMat, labels }) => (
        <group key={type}>
          {mergedPipes && (
            <mesh geometry={mergedPipes} material={pipeMat} castShadow />
          )}
          {mergedJoints && (
            <mesh geometry={mergedJoints} material={jointMat} />
          )}
          
          {labels.map((label, i) => (
            <Html key={`${type}-lbl-${i}`} position={label.position} center distanceFactor={60}>
              <div className="bg-slate-950/90 border border-slate-700 rounded-md px-2.5 py-1 text-[9px] font-mono whitespace-nowrap shadow-xl flex items-center gap-2 pointer-events-none">
                <span className={`w-2.5 h-2.5 rounded-full ${
                  label.type === 'water' ? 'bg-sky-400 shadow-[0_0_6px_#38bdf8]' :
                  label.type === 'sewer' ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' :
                  label.type === 'electrical' ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]' : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                }`} />
                <span className="text-slate-200 font-bold uppercase tracking-wide">{label.name}</span>
                <span className="text-cyan-400 font-bold">{label.depth}m</span>
              </div>
            </Html>
          ))}
        </group>
      ))}
    </group>
  );
}
