'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, X, ArrowRight, CornerDownRight, Building, Layers, Eye } from 'lucide-react';
import useStore from '@/stores/useStore';
import { LANDMARK_ORIGINS, calculate3DRoute } from '@/lib/routeEngine';

export default function NavigationModal({ isOpen, onClose }) {
  const { selectedBuilding, selectedFloor, selectedUnit, startNavigation, stopNavigation, isNavigating, navRoute, navOrigin } = useStore();
  const [selectedOriginId, setSelectedOriginId] = useState(LANDMARK_ORIGINS[0].id);

  if (!isOpen) return null;

  const targetBldg = selectedBuilding || (typeof window !== 'undefined' && window.__CITY_BUILDINGS__?.[0]);
  const currentOrigin = LANDMARK_ORIGINS.find(o => o.id === selectedOriginId) || LANDMARK_ORIGINS[0];

  const handleComputeRoute = () => {
    if (!targetBldg) return;

    const floorNum = selectedFloor || 2;
    const unitObj = selectedUnit || targetBldg.units?.find(u => u.floor === floorNum) || {
      unitNumber: floorNum * 100 + 1,
      floor: floorNum
    };

    // Calculate the multi-modal 3D trajectory
    const route = calculate3DRoute(currentOrigin, targetBldg, floorNum, unitObj);

    // Make sure target building is selected and exploded to show the vertical route inside
    useStore.setState({
      selectedBuilding: targetBldg,
      isExploded: true,
      selectedFloor: floorNum,
      selectedUnit: unitObj,
    });

    startNavigation({
      origin: currentOrigin,
      destination: {
        building: targetBldg,
        floor: floorNum,
        unit: unitObj
      },
      route
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-lg glass-strong border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/40 flex items-center justify-center shadow-glow-cyan">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">3D Multi-Level Route Planner</h2>
              <p className="text-[10px] text-text-muted">Street-to-Cadastre Floor & Unit Pathfinding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Origin (Point A) Selector */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_8px_#34d399]" />
            Starting Location (Point A)
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {LANDMARK_ORIGINS.map(origin => (
              <button
                key={origin.id}
                onClick={() => setSelectedOriginId(origin.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all ${
                  selectedOriginId === origin.id
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-medium">{origin.name}</span>
                </div>
                {selectedOriginId === origin.id && (
                  <span className="text-[9px] font-bold uppercase bg-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-md">Selected</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Destination (Point B - ULPIN Property) Display */}
        <div className="space-y-2 pt-2 border-t border-border">
          <label className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-[0_0_8px_#f43f5e]" />
            Target Cadastral Destination (Point B)
          </label>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-rose-400" />
                {targetBldg?.name || 'Selected Cadastral Building'}
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded">
                Floor {selectedFloor || 2}
              </span>
            </div>
            <div className="text-[11px] text-text-muted flex items-center justify-between">
              <span>Unit: <strong className="text-slate-200">{selectedUnit?.unitNumber || (Number(selectedFloor || 2) * 100 + 1)}</strong></span>
              <span>Elevation: <strong className="text-slate-200">+{((Number(selectedFloor || 2) - 1) * 5.5 + 3.5).toFixed(1)}m</strong></span>
              <span className="text-emerald-400 font-semibold">Verified Parcel</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-text-muted hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComputeRoute}
            className="px-5 py-2.5 rounded-xl text-xs font-bold gradient-bg text-bg-primary hover:opacity-90 shadow-glow-cyan flex items-center gap-2 cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            Launch 3D Path Navigation
          </button>
        </div>
      </motion.div>
    </div>
  );
}
