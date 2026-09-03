'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';
import useStore from '@/stores/useStore';
import Underground from './Underground';
import AirRights from './AirRights';
import ProceduralCity from './ProceduralCity';
import Route3D from './Route3D';
import * as THREE from 'three';

function Scene() {
  const { layers, isNavigating } = useStore();

  return (
    <>
      <Sky sunPosition={[100, 40, -20]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[100, 150, -50]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={300}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-bias={-0.001}
      />
      
      <Environment preset="city" />

      <ProceduralCity />

      {/* 3D Multi-Level Route Path from Point A to Point B */}
      {isNavigating && <Route3D />}

      {(layers.waterPipelines || layers.sewerLines || layers.electricalLines || layers.gasLines) && (
        <Underground />
      )}
      {(layers.airRights || layers.elevatedStructures) && (
        <AirRights />
      )}
    </>
  );
}

function CameraController({ controlsRef }) {
  const { selectedBuilding, selectedFloor, isExploded, isNavigating, navRoute } = useStore();
  const targetPos = useRef(new THREE.Vector3(0, 800, 1000));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);
  const lastAnimatedId = useRef(null);

  // Animate on 3D navigation activation
  useEffect(() => {
    if (!isNavigating || !navRoute || !controlsRef.current) return;
    const waypoints = navRoute.waypoints;
    if (!waypoints || waypoints.length < 2) return;

    const start = waypoints[0];
    const end = waypoints[waypoints.length - 1];
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const midZ = (start.z + end.z) / 2;

    const distSpan = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2));
    const camDist = Math.max(160, distSpan * 0.95);

    targetLook.current.set(midX, midY + 15, midZ);
    targetPos.current.set(midX + camDist * 0.6, midY + camDist * 0.75, midZ + camDist * 0.7);
    isAnimating.current = true;
  }, [isNavigating, navRoute]);

  useEffect(() => {
    if (!selectedBuilding || !controlsRef.current || isNavigating) return;
    
    // Only fly camera when a NEW building is selected
    const buildingChanged = lastAnimatedId.current !== selectedBuilding.id;
    if (!buildingChanged && !isExploded) return;
    
    lastAnimatedId.current = selectedBuilding.id;

    const [cx, cz] = selectedBuilding.worldCenter || [0, 0];
    const bHeight = selectedBuilding.height || 20;
    const totalExplodedHeight = isExploded ? selectedBuilding.floors * 5 : 0;
    const lookAtY = isExploded ? totalExplodedHeight / 2 + 5 : bHeight / 2;

    const dist = isExploded ? 120 + totalExplodedHeight : 80 + bHeight;
    const camY = lookAtY + dist * 0.7;
    const camX = cx + dist * 0.5;
    const camZ = cz + dist * 0.6;

    targetLook.current.set(cx, lookAtY, cz);
    targetPos.current.set(camX, camY, camZ);
    isAnimating.current = true;
  }, [selectedBuilding, isExploded, isNavigating]);

  // Cancel animation on user mouse interaction
  useEffect(() => {
    const cancel = () => { isAnimating.current = false; };
    window.addEventListener('mousedown', cancel);
    window.addEventListener('touchstart', cancel);
    return () => {
      window.removeEventListener('mousedown', cancel);
      window.removeEventListener('touchstart', cancel);
    };
  }, []);

  useFrame(() => {
    if (!isAnimating.current || !controlsRef.current) return;
    const controls = controlsRef.current;

    controls.target.lerp(targetLook.current, 0.08);
    controls.object.position.lerp(targetPos.current, 0.08);
    controls.update();

    if (controls.object.position.distanceTo(targetPos.current) < 2) {
      isAnimating.current = false;
    }
  });

  return null;
}


export default function CityScene() {
  const controlsRef = useRef();
  const { dragMode } = useStore();

  const isPan = dragMode === 'pan';

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{ position: [0, 800, 1000], fov: 45, near: 1, far: 50000 }}
        gl={{ 
          antialias: true, 
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          powerPreference: 'high-performance',
        }}
        style={{ background: '#87CEEB' }}
      >
        <Scene />
        <CameraController controlsRef={controlsRef} />
        <OrbitControls
          key={dragMode}
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.05}
          enablePan={true}
          panSpeed={2.0}
          screenSpacePanning={false}
          enableRotate={true}
          rotateSpeed={0.6}
          enableZoom={true}
          zoomSpeed={1.5}
          minDistance={10}
          maxDistance={25000}
          minPolarAngle={0.1}
          maxPolarAngle={Math.PI * 0.85}
          mouseButtons={{
            LEFT: isPan ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: isPan ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN
          }}
          touches={{
            ONE: isPan ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE,
            TWO: isPan ? THREE.TOUCH.DOLLY_ROTATE : THREE.TOUCH.DOLLY_PAN
          }}
        />
      </Canvas>
    </div>
  );
}

