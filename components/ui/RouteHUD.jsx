'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, X, ChevronDown, ChevronUp,
  Clock, Route, Layers, Building, ArrowRight,
  MapPin, TrendingUp,
} from 'lucide-react';
import useStore from '@/stores/useStore';

// ── Step type configuration ───────────────────────────────────────────────────
const STEP_CONFIG = {
  road:     { bg: 'rgba(0,229,255,0.1)',  border: 'rgba(0,229,255,0.3)',  text: '#00e5ff', dot: '#00e5ff'  },
  gate:     { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#60a5fa', dot: '#3b82f6'  },
  elevator: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', dot: '#f59e0b'  },
  indoor:   { bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.3)',  text: '#fb7185', dot: '#f43f5e'  },
};

function getStepStyle(step) {
  return STEP_CONFIG[step.type] || STEP_CONFIG.road;
}

function StepRow({ step, index, isLast }) {
  const style = getStepStyle(step);
  return (
    <div className="flex gap-2.5">
      {/* Timeline spine */}
      <div className="flex flex-col items-center gap-0 shrink-0">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
          style={{ background: style.bg, border: `1.5px solid ${style.dot}`, color: style.text }}
        >
          {step.icon || index + 1}
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1" style={{ background: `${style.dot}30`, minHeight: '12px' }} />
        )}
      </div>
      {/* Content */}
      <div className="pb-2.5 flex-1 min-w-0">
        <p className="text-[11px] text-slate-200 leading-snug">{step.text}</p>
        {step.dist && (
          <span className="text-[10px] font-mono font-bold" style={{ color: style.text }}>
            {step.dist}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RouteHUD() {
  const { navRoute, navOrigin, navDestination, stopNavigation, isNavigating } = useStore();
  const [expanded, setExpanded] = useState(true);

  if (!isNavigating || !navRoute) return null;

  const steps = navRoute.steps || [];
  const roadSteps = steps.filter(s => s.type === 'road');
  const buildingSteps = steps.filter(s => s.type !== 'road');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed right-4 top-20 bottom-20 w-72 flex flex-col z-30 pointer-events-none"
      >
        <div
          className="w-full flex flex-col rounded-2xl overflow-hidden pointer-events-auto"
          style={{
            background: 'rgba(4,6,18,0.97)',
            border: '1px solid rgba(0,229,255,0.25)',
            boxShadow: '0 0 40px rgba(0,229,255,0.12), inset 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-60" />
              </div>
              <span className="text-xs font-black text-white tracking-wide uppercase">Navigation Active</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setExpanded(v => !v)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={stopNavigation}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                title="Stop Navigation"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Stats ───────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-px shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.04)' }}>
            <div className="flex flex-col items-center py-2.5 px-3" style={{ background: 'rgba(4,6,18,0.8)' }}>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                <Route className="w-3 h-3" /> Distance
              </div>
              <span className="text-sm font-black text-cyan-300">{navRoute.distanceMeters}m</span>
            </div>
            <div className="flex flex-col items-center py-2.5 px-3" style={{ background: 'rgba(4,6,18,0.8)' }}>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                <Clock className="w-3 h-3" /> Est. Time
              </div>
              <span className="text-sm font-black text-cyan-300">~{navRoute.durationMinutes} min</span>
            </div>
          </div>

          {/* ── Route summary chips ──────────────────────────────────── */}
          <div className="flex items-center gap-1.5 px-4 py-2 shrink-0 flex-wrap"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.25)', color: '#00e5ff' }}>
              <MapPin className="w-2.5 h-2.5" />
              {navOrigin?.name || 'Start'}
            </div>
            <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
            <div className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: '#fb7185' }}>
              <Building className="w-2.5 h-2.5" />
              {navRoute.buildingName}
            </div>
          </div>

          {/* ── Floor destination badge ──────────────────────────────── */}
          <div className="flex items-center gap-2 px-4 py-2 shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(245,158,11,0.06)' }}>
            <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div className="text-[11px]">
              <span className="text-slate-400">Destination: </span>
              <span className="font-bold text-amber-300">Floor {navRoute.targetFloor}</span>
              <span className="text-slate-400"> · Unit </span>
              <span className="font-bold text-amber-300">#{navRoute.targetUnit}</span>
            </div>
          </div>

          {/* ── Steps list ──────────────────────────────────────────── */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="overflow-y-auto px-4 py-3 space-y-0 max-h-80 scrollbar-thin">
                  {steps.length > 0 ? (
                    steps.map((step, i) => (
                      <StepRow key={i} step={step} index={i} isLast={i === steps.length - 1} />
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 text-center py-4">No turn-by-turn steps available</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Legend ──────────────────────────────────────────────── */}
          <div className="px-4 py-2.5 shrink-0 flex items-center gap-3 flex-wrap"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { color: '#00e5ff', label: 'Road' },
              { color: '#3b82f6', label: 'Gate' },
              { color: '#f59e0b', label: 'Elevator' },
              { color: '#f43f5e', label: 'Indoor' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1 text-[10px] text-slate-500">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
