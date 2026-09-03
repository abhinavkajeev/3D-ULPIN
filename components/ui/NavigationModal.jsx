'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, MapPin, X, ArrowRight, Building, Layers, Search, Check, Flag, Compass } from 'lucide-react';
import useStore from '@/stores/useStore';
import { REAL_VADAPALANI_LOCATIONS, calculate3DRoute } from '@/lib/routeEngine';
import { buildings } from '@/data/buildings';

export default function NavigationModal({ isOpen, onClose }) {
  const { selectedBuilding, selectedFloor, selectedUnit, startNavigation, stopNavigation, isNavigating, navRoute, navOrigin } = useStore();
  
  // Point A state: selected landmark or custom coordinate
  const [selectedOriginId, setSelectedOriginId] = useState(REAL_VADAPALANI_LOCATIONS[0].id);
  
  // Point B state: selectable via ULPIN search, building list, or current selection
  const [targetBuildingId, setTargetBuildingId] = useState('');
  const [targetFloorNumber, setTargetFloorNumber] = useState(2);
  const [targetUnitNumber, setTargetUnitNumber] = useState(201);
  const [ulpinSearchInput, setUlpinSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');

  // Available buildings in the city
  const allBuildings = useMemo(() => {
    if (typeof window !== 'undefined' && window.__CITY_BUILDINGS__ && window.__CITY_BUILDINGS__.length > 0) {
      return window.__CITY_BUILDINGS__;
    }
    return buildings;
  }, []);

  // Sync with current selection when modal opens
  useMemo(() => {
    if (selectedBuilding) {
      setTargetBuildingId(selectedBuilding.id);
      setTargetFloorNumber(selectedFloor || 2);
      setTargetUnitNumber(selectedUnit?.unitNumber || (Number(selectedFloor || 2) * 100 + 1));
    } else if (allBuildings.length > 0 && !targetBuildingId) {
      setTargetBuildingId(allBuildings[0].id);
      setTargetFloorNumber(2);
      setTargetUnitNumber(201);
    }
  }, [selectedBuilding, selectedFloor, selectedUnit, allBuildings, targetBuildingId]);

  if (!isOpen) return null;

  const currentOrigin = REAL_VADAPALANI_LOCATIONS.find(o => o.id === selectedOriginId) || REAL_VADAPALANI_LOCATIONS[0];
  const activeTargetBldg = allBuildings.find(b => b.id === targetBuildingId) || allBuildings[0];

  // Handle direct ULPIN search input in the modal
  const handleSearchULPIN = (e) => {
    e.preventDefault();
    setSearchError('');
    const query = ulpinSearchInput.trim().toUpperCase();
    if (!query) return;

    // Pattern matching e.g. TN-CHN-VAD-TS1082-B01-F04-U402 or B01 / F04
    const bMatch = query.match(/B(\d+)/i);
    const fMatch = query.match(/F(\d+)/i);
    const uMatch = query.match(/U(\d+)/i);

    let matchedBldg = null;
    if (bMatch) {
      const idx = (parseInt(bMatch[1], 10) - 1) % allBuildings.length;
      matchedBldg = allBuildings[idx >= 0 ? idx : 0];
    } else {
      matchedBldg = allBuildings.find(b => 
        b.name?.toUpperCase().includes(query) || b.id?.toUpperCase().includes(query)
      );
    }

    if (matchedBldg) {
      setTargetBuildingId(matchedBldg.id);
      const floor = fMatch ? Math.min(Math.max(1, parseInt(fMatch[1], 10)), matchedBldg.floors || 6) : 2;
      setTargetFloorNumber(floor);
      const unit = uMatch ? parseInt(uMatch[1], 10) : (floor * 100 + 1);
      setTargetUnitNumber(unit);
      setSearchError('');
    } else {
      setSearchError(`No building found matching "${query}". Select from dropdown.`);
    }
  };

  const handleComputeRoute = () => {
    if (!activeTargetBldg) return;

    const unitObj = activeTargetBldg.units?.find(u => u.floor === targetFloorNumber) || {
      unitNumber: targetUnitNumber,
      floor: targetFloorNumber
    };

    // Calculate strictly road-network path to target floor/unit
    const route = calculate3DRoute(currentOrigin, activeTargetBldg, targetFloorNumber, unitObj);

    // Explode target building and highlight floor
    useStore.setState({
      selectedBuilding: activeTargetBldg,
      isExploded: true,
      selectedFloor: targetFloorNumber,
      selectedUnit: unitObj,
    });

    startNavigation({
      origin: currentOrigin,
      destination: {
        building: activeTargetBldg,
        floor: targetFloorNumber,
        unit: unitObj
      },
      route
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-xl glass-strong border border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.3)] space-y-5 max-h-[90vh] overflow-y-auto scrollbar-thin"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 flex items-center justify-center shadow-glow-cyan">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                3D Road Route & ULPIN Navigator
              </h2>
              <p className="text-[11px] text-text-muted">Strict road-network travel from Point A to exact Floor & Unit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-muted hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── POINT A: Starting Location ─── */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block shadow-[0_0_10px_#34d399]" />
            1. Select Departure Point (Point A)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REAL_VADAPALANI_LOCATIONS.map(origin => (
              <button
                key={origin.id}
                onClick={() => setSelectedOriginId(origin.id)}
                className={`flex flex-col p-2.5 rounded-2xl text-left transition-all cursor-pointer border ${
                  selectedOriginId === origin.id
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_15px_rgba(52,211,153,0.25)]'
                    : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">{origin.category}</span>
                  {selectedOriginId === origin.id && (
                    <span className="text-[9px] font-extrabold bg-emerald-400 text-slate-950 px-1.5 py-0.5 rounded-full">Active</span>
                  )}
                </div>
                <p className="text-xs font-semibold leading-snug">{origin.name}</p>
                <p className="text-[10px] text-text-muted mt-0.5 truncate">{origin.address}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ─── POINT B: Target Destination (via ULPIN or Building Picker) ─── */}
        <div className="space-y-3 pt-3 border-t border-border">
          <label className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block shadow-[0_0_10px_#f43f5e]" />
            2. Choose Target Destination (Point B using ULPIN)
          </label>

          {/* Quick ULPIN Search Input */}
          <form onSubmit={handleSearchULPIN} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={ulpinSearchInput}
                onChange={(e) => setUlpinSearchInput(e.target.value)}
                placeholder="Enter ULPIN (e.g. TN-CHN-VAD-TS1082-B01-F04-U402)"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition-colors cursor-pointer shrink-0"
            >
              Resolve ULPIN
            </button>
          </form>

          {searchError && (
            <p className="text-[11px] text-rose-400 font-medium">{searchError}</p>
          )}

          {/* Destination Building & Floor Selectors */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-text-muted font-semibold uppercase block mb-1">Target Building</label>
                <select
                  value={targetBuildingId}
                  onChange={(e) => setTargetBuildingId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                >
                  {allBuildings.slice(0, 30).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.floors || 4} Floors)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-text-muted font-semibold uppercase block mb-1">Target Floor</label>
                  <select
                    value={targetFloorNumber}
                    onChange={(e) => {
                      const f = parseInt(e.target.value, 10);
                      setTargetFloorNumber(f);
                      setTargetUnitNumber(f * 100 + 1);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  >
                    {Array.from({ length: activeTargetBldg?.floors || 4 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Floor {i + 1}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-text-muted font-semibold uppercase block mb-1">Target Unit</label>
                  <input
                    type="number"
                    value={targetUnitNumber}
                    onChange={(e) => setTargetUnitNumber(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>
            </div>

            {/* Generated Destination Summary */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Building className="w-3.5 h-3.5 text-rose-400" />
                {activeTargetBldg?.name}
              </span>
              <span className="text-[11px] font-mono text-cyan-300 font-bold bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                Level {targetFloorNumber} • Door #{targetUnitNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-text-muted hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleComputeRoute}
            className="px-6 py-2.5 rounded-xl text-xs font-bold gradient-bg text-bg-primary hover:opacity-95 shadow-glow-cyan flex items-center gap-2 cursor-pointer transition-all"
          >
            <Compass className="w-4 h-4" />
            Compute Road Route in 3D
          </button>
        </div>
      </motion.div>
    </div>
  );
}
