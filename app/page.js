'use client';

import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe2, Map, SplitSquareHorizontal, ZoomIn, ZoomOut, RotateCcw, Move3d, RotateCw } from 'lucide-react';
import useStore from '@/stores/useStore';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import BuildingPanel from '@/components/panels/BuildingPanel';
import FloorPanel from '@/components/panels/FloorPanel';
import PropertyPanel from '@/components/panels/PropertyPanel';
import Certificate from '@/components/ui/Certificate';

// Dynamic imports for 3D and Map (no SSR)
const CityScene = dynamic(() => import('@/components/viewer3d/CityScene'), { ssr: false });
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

function DragModeIcon() {
  const { dragMode } = useStore();
  if (dragMode === 'pan') {
    return <><Move3d className="w-4 h-4" /><span>Move</span></>;
  }
  return <><RotateCw className="w-4 h-4" /><span>Rotate</span></>;
}

export default function ViewerPage() {
  const { viewMode, setViewMode, rightPanel, selectedBuilding, selectedFloor, selectedUnit, sidebarOpen, dragMode, toggleDragMode } = useStore();

  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-primary">
      <Header />
      <Sidebar />

      {/* Main Content */}
      <main
        className="h-full pt-16 transition-all duration-300"
        style={{ paddingLeft: sidebarOpen ? '18rem' : '0' }}
      >
        <div className="relative w-full h-full">
          {/* 3D / Map Container */}
          <div className="w-full h-full flex">
            {/* 3D View */}
            {(viewMode === '3d' || viewMode === 'split') && (
              <div className={viewMode === 'split' ? 'w-1/2 h-full border-r border-border' : 'w-full h-full'}>
                <CityScene />
              </div>
            )}

            {/* Map View */}
            {(viewMode === 'map' || viewMode === 'split') && (
              <div className={viewMode === 'split' ? 'w-1/2 h-full' : 'w-full h-full'}>
                <MapView />
              </div>
            )}
          </div>

          {/* View Mode & Drag Mode Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 glass-strong rounded-xl p-1 shadow-lg">
              {[
                { mode: '3d', icon: Globe2, label: '3D View' },
                { mode: 'map', icon: Map, label: 'Map' },
                { mode: 'split', icon: SplitSquareHorizontal, label: 'Split' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                    viewMode === mode
                      ? 'bg-accent-cyan/15 text-accent-cyan shadow-glow-cyan font-semibold'
                      : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Drag Action Toggle (Move vs Rotate) in 3D */}
            {viewMode !== 'map' && (
              <div className="flex items-center gap-1 glass-strong rounded-xl p-1 shadow-lg border border-border">
                <button
                  onClick={() => useStore.setState({ dragMode: 'pan' })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                    dragMode === 'pan'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-semibold'
                      : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                  }`}
                  title="Drag on the map to move around"
                >
                  <Move3d className="w-3.5 h-3.5" />
                  <span>Move Map</span>
                </button>
                <button
                  onClick={() => useStore.setState({ dragMode: 'rotate' })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                    dragMode === 'rotate'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)] font-semibold'
                      : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
                  }`}
                  title="Drag on the map to rotate view angle"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Rotate Angle</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none z-10">
            <div className="glass rounded-lg px-3 py-2 pointer-events-auto">
              <p className="text-[10px] font-mono text-text-muted">
                Chennai, Tamil Nadu • 13.08°N, 80.27°E
              </p>
            </div>

            <div className="flex flex-col gap-1 pointer-events-auto">
              {/* Drag Mode Toggle */}
              {viewMode !== 'map' && (
                <button
                  onClick={toggleDragMode}
                  className={`glass rounded-lg px-2.5 py-2 cursor-pointer transition-all flex items-center gap-1.5 text-[10px] font-bold tracking-wider ${
                    dragMode === 'pan'
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_8px_rgba(0,200,255,0.15)]'
                      : 'bg-purple-500/15 text-purple-400 border border-purple-500/30 shadow-[0_0_8px_rgba(128,0,255,0.15)]'
                  }`}
                  title={`Current: Drag to ${dragMode === 'pan' ? 'Move' : 'Rotate'}\nClick to switch`}
                >
                  <DragModeIcon />
                </button>
              )}
              <button className="glass rounded-lg p-2 hover:bg-white/10 cursor-pointer transition-colors">
                <ZoomIn className="w-4 h-4 text-text-secondary" />
              </button>
              <button className="glass rounded-lg p-2 hover:bg-white/10 cursor-pointer transition-colors">
                <ZoomOut className="w-4 h-4 text-text-secondary" />
              </button>
              <button className="glass rounded-lg p-2 hover:bg-white/10 cursor-pointer transition-colors">
                <RotateCcw className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          </div>

          {/* Instructions Overlay */}
          {!selectedBuilding && viewMode !== 'map' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 glass-strong rounded-xl px-6 py-3 text-center pointer-events-none z-10"
            >
              <p className="text-xs text-text-secondary">
                <span className="text-accent-cyan font-semibold">Click</span> a building to explore •{' '}
                <span className="text-accent-cyan font-semibold">Scroll</span> to zoom •{' '}
                <span className="text-accent-cyan font-semibold">Left Drag</span> to {dragMode === 'pan' ? 'move' : 'rotate'} •{' '}
                <span className="text-accent-cyan font-semibold">Right Drag</span> to {dragMode === 'pan' ? 'rotate' : 'move'}
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Right Side Panels */}
      <AnimatePresence mode="wait">
        {rightPanel === 'building' && selectedBuilding && !selectedFloor && <BuildingPanel key="building" />}
        {rightPanel === 'floor' && selectedFloor && <FloorPanel key="floor" />}
        {rightPanel === 'property' && selectedUnit && <PropertyPanel key="property" />}
        {rightPanel === 'certificate' && <Certificate key="certificate" />}
      </AnimatePresence>
    </div>
  );
}
