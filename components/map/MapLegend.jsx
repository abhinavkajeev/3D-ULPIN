'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import useStore from '@/stores/useStore';

const LEGEND_ITEMS = [
  { key: 'parcels', label: 'Property Parcels', symbol: 'square', color: '#00d4ff', group: 'Base Layers' },
  { key: 'buildings', label: 'Buildings', symbol: 'square', color: '#a855f7', group: 'Base Layers' },
  { key: 'roads', label: 'Roads', symbol: 'line', color: '#94a3b8', group: 'Base Layers' },
  { key: 'adminBoundaries', label: 'Admin Boundaries', symbol: 'dashed', color: '#f59e0b', group: 'Base Layers' },
  
  { key: 'dem', label: 'DEM (Elevation)', symbol: 'terrain', color: '#14b8a6', unconfigured: true, group: 'Terrain' },
  { key: 'dsm', label: 'DSM (Surface)', symbol: 'terrain', color: '#22c55e', unconfigured: true, group: 'Terrain' },
  { key: 'lidar', label: 'LiDAR Point Cloud', symbol: 'dots', color: '#f43f5e', unconfigured: true, group: 'Terrain' },

  { key: 'elevatedStructures', label: 'Metro / Flyover', symbol: 'double-line', color: '#0284c7', group: 'Elevated' },
  { key: 'airRights', label: 'Air Rights Corridor', symbol: 'box-translucent', color: '#a855f7', group: 'Elevated' },

  { key: 'waterPipelines', label: 'Water Pipeline', symbol: 'circle-line', color: '#0ea5e9', group: 'Underground' },
  { key: 'sewerLines', label: 'Sewer / Drainage', symbol: 'circle-line', color: '#22c55e', group: 'Underground' },
  { key: 'electricalLines', label: 'Electricity', symbol: 'circle-line', color: '#facc15', group: 'Underground' },
  { key: 'gasLines', label: 'Gas Pipeline', symbol: 'circle-line', color: '#f87171', group: 'Underground' },
];

function SymbolIcon({ type, color }) {
  switch (type) {
    case 'square':
      return <div className="w-3.5 h-3.5 rounded-sm shrink-0 border border-white/20" style={{ backgroundColor: color }} />;
    case 'line':
      return <div className="w-4 h-1 rounded shrink-0" style={{ backgroundColor: color }} />;
    case 'dashed':
      return <div className="w-4 h-0.5 shrink-0 border-t-2 border-dashed" style={{ borderColor: color }} />;
    case 'double-line':
      return (
        <div className="w-4 flex flex-col gap-0.5 shrink-0">
          <div className="h-0.5 w-full rounded" style={{ backgroundColor: color }} />
          <div className="h-0.5 w-full rounded" style={{ backgroundColor: color }} />
        </div>
      );
    case 'box-translucent':
      return <div className="w-3.5 h-3.5 rounded-sm shrink-0 border border-dashed" style={{ backgroundColor: `${color}40`, borderColor: color }} />;
    case 'circle-line':
      return (
        <div className="flex items-center gap-0.5 shrink-0">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <div className="w-2.5 h-0.5 rounded" style={{ backgroundColor: color }} />
        </div>
      );
    case 'dots':
      return (
        <div className="flex gap-0.5 items-center shrink-0">
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: color }} />
        </div>
      );
    case 'terrain':
    default:
      return <div className="w-3.5 h-2.5 rounded-sm shrink-0 border" style={{ borderColor: color, backgroundColor: `${color}20` }} />;
  }
}

export default function MapLegend() {
  const { layers, sidebarOpen } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  // Filter ONLY active layers
  const activeItems = LEGEND_ITEMS.filter(item => layers[item.key]);

  if (activeItems.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-14 z-20 transition-all duration-300 pointer-events-auto ${
        sidebarOpen ? 'left-76' : 'left-4'
      }`}
    >
      <div className="glass-strong rounded-xl border border-border/80 shadow-2xl overflow-hidden min-w-[200px] max-w-[260px]">
        {/* Legend Header */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/60 hover:bg-slate-900/80 cursor-pointer transition-colors border-b border-border/40"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-accent-cyan" />
            <span className="text-xs font-bold text-text-primary tracking-wide">GIS Legend</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-accent-cyan/15 text-accent-cyan font-semibold">
              {activeItems.length}
            </span>
          </div>
          {collapsed ? (
            <ChevronUp className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {/* Legend Content */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-2.5 space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin"
            >
              {activeItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between gap-2.5 px-1.5 py-1 rounded hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2 min-w-0">
                    <SymbolIcon type={item.symbol} color={item.color} />
                    <span className="text-[11px] font-medium text-text-secondary truncate leading-none">
                      {item.label}
                    </span>
                  </div>
                  {item.unconfigured && (
                    <span className="text-[8px] font-mono text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded shrink-0">
                      NO DATA
                    </span>
                  )}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
