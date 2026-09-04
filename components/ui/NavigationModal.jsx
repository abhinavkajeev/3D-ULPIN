'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, MapPin, X, Building, Layers, Search,
  Flag, Compass, Loader2, AlertCircle, CheckCircle2, ArrowRight,
  ChevronRight, Clock, Route, Zap,
} from 'lucide-react';
import useStore from '@/stores/useStore';
import { REAL_VADAPALANI_LOCATIONS, calculate3DRoute } from '@/lib/routeEngine';

// ── Step type icons ────────────────────────────────────────────────────────────
const STEP_ICON = {
  start:    { icon: '🟢', color: 'text-emerald-400' },
  road:     { icon: '🛣️',  color: 'text-slate-300' },
  gate:     { icon: '🏢', color: 'text-blue-400' },
  elevator: { icon: '🛗', color: 'text-amber-400' },
  indoor:   { icon: '🚪', color: 'text-rose-400' },
  arrive:   { icon: '🎯', color: 'text-rose-400' },
};

function OriginCard({ location, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-2.5 p-3 rounded-2xl text-left transition-all cursor-pointer border w-full ${
        selected
          ? 'bg-emerald-500/15 border-emerald-400/70 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
          : 'bg-white/4 border-white/6 hover:bg-white/8 hover:border-white/12'
      }`}
    >
      <span className="text-lg leading-none mt-0.5">{location.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${selected ? 'text-emerald-400' : 'text-slate-500'}`}>
            {location.category}
          </span>
          {selected && (
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          )}
        </div>
        <p className={`text-xs font-semibold leading-snug ${selected ? 'text-emerald-100' : 'text-slate-200'}`}>
          {location.name}
        </p>
        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{location.address}</p>
      </div>
    </button>
  );
}

export default function NavigationModal({ isOpen, onClose }) {
  const {
    selectedBuilding, selectedFloor, selectedUnit,
    startNavigation, stopNavigation, isNavigating,
  } = useStore();

  // Point A
  const [originId, setOriginId] = useState(REAL_VADAPALANI_LOCATIONS[0].id);

  // Point B
  const [targetBuildingId, setTargetBuildingId] = useState('');
  const [targetFloor, setTargetFloor] = useState(2);
  const [targetUnit, setTargetUnit] = useState(201);
  const [ulpinQuery, setUlpinQuery] = useState('');
  const [ulpinError, setUlpinError] = useState('');

  // Route computation state
  const [loading, setLoading] = useState(false);
  const [routePreview, setRoutePreview] = useState(null); // { distanceMeters, durationMinutes }
  const [error, setError] = useState('');

  const allBuildings = useMemo(() => {
    if (typeof window !== 'undefined' && window.__CITY_BUILDINGS__?.length > 0) {
      return window.__CITY_BUILDINGS__;
    }
    return [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Auto-fill building from scene selection
  useEffect(() => {
    if (selectedBuilding && selectedBuilding.id !== targetBuildingId) {
      setTargetBuildingId(selectedBuilding.id);
      setTargetFloor(selectedFloor || 2);
      setTargetUnit(selectedUnit?.unitNumber || ((selectedFloor || 2) * 100 + 1));
    } else if (allBuildings.length > 0 && !targetBuildingId) {
      setTargetBuildingId(allBuildings[0].id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuilding, selectedFloor, selectedUnit, allBuildings]);

  // Computed values (always run — before hooks that depend on them)
  const origin = REAL_VADAPALANI_LOCATIONS.find(o => o.id === originId) || REAL_VADAPALANI_LOCATIONS[0];
  const targetBldg = allBuildings.find(b => b.id === targetBuildingId) || allBuildings[0];
  const maxFloors = targetBldg?.floors || 6;

  // ULPIN search handler (must be before conditional return)
  const handleUlpinSearch = useCallback((e) => {
    e.preventDefault();
    setUlpinError('');
    const q = ulpinQuery.trim().toUpperCase();
    if (!q) return;

    const bMatch = q.match(/B(\d+)/i);
    const fMatch = q.match(/F(\d+)/i);
    const uMatch = q.match(/U(\d+)/i);

    let matched = null;
    if (bMatch) {
      const idx = (parseInt(bMatch[1], 10) - 1 + allBuildings.length) % allBuildings.length;
      matched = allBuildings[idx];
    } else {
      matched = allBuildings.find(b =>
        b.name?.toUpperCase().includes(q) || b.id?.toUpperCase().includes(q)
      );
    }

    if (matched) {
      setTargetBuildingId(matched.id);
      const f = fMatch ? Math.min(Math.max(1, parseInt(fMatch[1], 10)), matched.floors || 6) : 2;
      setTargetFloor(f);
      setTargetUnit(uMatch ? parseInt(uMatch[1], 10) : f * 100 + 1);
    } else {
      setUlpinError(`No match for "${q}". Try selecting from list.`);
    }
  }, [ulpinQuery, allBuildings]);

  // Compute route (async — calls /api/route/road server-side Dijkstra)
  const handleComputeRoute = useCallback(async () => {
    if (!targetBldg) return;
    setLoading(true);
    setError('');

    try {
      const unitObj = { unitNumber: targetUnit, floor: targetFloor };
      const route = await calculate3DRoute(origin, targetBldg, targetFloor, unitObj);

      setRoutePreview({ distanceMeters: route.distanceMeters, durationMinutes: route.durationMinutes });

      useStore.setState({
        selectedBuilding: targetBldg,
        isExploded: true,
        selectedFloor: targetFloor,
        selectedUnit: unitObj,
      });

      startNavigation({
        origin,
        destination: { building: targetBldg, floor: targetFloor, unit: unitObj },
        route,
      });

      onClose();
    } catch (err) {
      setError('Route calculation failed. Check connection & try again.');
      console.error('[NavigationModal]', err);
    } finally {
      setLoading(false);
    }
  }, [origin, targetBldg, targetFloor, targetUnit, startNavigation, onClose]);

  // ── Early return AFTER all hooks ──────────────────────────────────────────
  if (!isOpen) return null;


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg">
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 24 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto scrollbar-thin rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.25)]"
            style={{ background: 'rgba(6,8,20,0.97)', border: '1px solid rgba(6,182,212,0.3)' }}
          >
            {/* ── Header ───────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/8"
              style={{ background: 'rgba(6,8,20,0.98)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)' }}>
                  <Navigation className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide">3D Road Route Navigator</h2>
                  <p className="text-[11px] text-slate-500">Real road routing • Exact floor & unit destination</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* ── Section A: Starting Point ───────────────────────────── */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-white">A</span>
                  </div>
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Starting Point
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
                  {REAL_VADAPALANI_LOCATIONS.map(loc => (
                    <OriginCard
                      key={loc.id}
                      location={loc}
                      selected={originId === loc.id}
                      onClick={() => setOriginId(loc.id)}
                    />
                  ))}
                </div>
              </section>

              {/* ── Connector ──────────────────────────────────────────── */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 to-rose-500/40" />
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-cyan-400"
                  style={{ border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.08)' }}>
                  <Route className="w-3 h-3" />
                  Road Route
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-rose-500/40 via-cyan-500/40 to-emerald-500/40" />
              </div>

              {/* ── Section B: Destination ─────────────────────────────── */}
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-black text-white">B</span>
                  </div>
                  <label className="text-xs font-bold text-rose-400 uppercase tracking-widest">
                    Destination — ULPIN Address
                  </label>
                </div>

                {/* ULPIN Search */}
                <form onSubmit={handleUlpinSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={ulpinQuery}
                      onChange={e => { setUlpinQuery(e.target.value); setUlpinError(''); }}
                      placeholder="ULPIN: TN-CHN-VAD-TS1082-B01-F03-U301"
                      className="w-full rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-300 hover:text-cyan-100 transition-all cursor-pointer shrink-0"
                    style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.35)' }}
                  >
                    Resolve
                  </button>
                </form>

                {ulpinError && (
                  <div className="flex items-center gap-2 text-[11px] text-rose-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {ulpinError}
                  </div>
                )}

                {/* Building / Floor / Unit selectors */}
                <div className="rounded-2xl p-4 space-y-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(244,63,94,0.25)' }}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Building */}
                    <div className="sm:col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Building
                      </label>
                      <select
                        value={targetBuildingId}
                        onChange={e => setTargetBuildingId(e.target.value)}
                        className="w-full rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 transition-colors cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {allBuildings.slice(0, 40).map(b => (
                          <option key={b.id} value={b.id} style={{ background: '#0a0c1a' }}>
                            {b.name} ({b.floors}F)
                          </option>
                        ))}
                        {allBuildings.length === 0 && (
                          <option value="" style={{ background: '#0a0c1a' }}>Loading city buildings…</option>
                        )}
                      </select>
                    </div>

                    {/* Floor */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Floor
                      </label>
                      <select
                        value={targetFloor}
                        onChange={e => {
                          const f = parseInt(e.target.value, 10);
                          setTargetFloor(f);
                          setTargetUnit(f * 100 + 1);
                        }}
                        className="w-full rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 transition-colors cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                        {Array.from({ length: maxFloors }, (_, i) => (
                          <option key={i + 1} value={i + 1} style={{ background: '#0a0c1a' }}>
                            Floor {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Unit */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Unit #
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={targetUnit}
                        onChange={e => setTargetUnit(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-full rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 transition-colors"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                      />
                    </div>
                  </div>

                  {/* Destination summary */}
                  {targetBldg && (
                    <div className="pt-2 border-t border-white/6 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <Building className="w-3.5 h-3.5 text-rose-400" />
                        <span className="text-slate-200 font-medium truncate max-w-[160px]">{targetBldg.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-cyan-300 px-2 py-0.5 rounded-lg"
                          style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)' }}>
                          Floor {targetFloor} · Unit #{targetUnit}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scene hint */}
                {!selectedBuilding && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-cyan-500" />
                    Tip: Click any building in the 3D scene to auto-select it as destination
                  </p>
                )}
                {selectedBuilding && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3" />
                    Scene selection: <span className="font-semibold">{selectedBuilding.name}</span>
                  </p>
                )}
              </section>

              {/* ── Route Preview ──────────────────────────────────────── */}
              {routePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 rounded-2xl p-3"
                  style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.3)' }}
                >
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                    <Route className="w-3.5 h-3.5" />
                    <span className="font-bold">{routePreview.distanceMeters}m</span>
                  </div>
                  <div className="h-3 w-px bg-white/10" />
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-bold">~{routePreview.durationMinutes} min</span>
                  </div>
                  <div className="flex-1" />
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </motion.div>
              )}

              {/* ── Error ─────────────────────────────────────────────── */}
              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-400 rounded-xl p-3"
                  style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* ── Action Buttons ─────────────────────────────────────── */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {isNavigating && (
                  <button
                    onClick={() => { stopNavigation(); onClose(); }}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    style={{ border: '1px solid rgba(244,63,94,0.3)' }}
                  >
                    Stop Active Route
                  </button>
                )}

                <button
                  onClick={handleComputeRoute}
                  disabled={loading || !targetBldg}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  style={{ background: 'linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Computing…
                    </>
                  ) : (
                    <>
                      <Compass className="w-4 h-4" />
                      Start 3D Navigation
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
