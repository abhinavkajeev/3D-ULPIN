'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, ChevronLeft, ChevronRight, Eye, EyeOff,
  Droplets, Zap, Flame, PipetteIcon, TrainFront, CloudSun,
  Map, Building2, Route, Landmark, Mountain, Scan, Radio
} from 'lucide-react';
import useStore from '@/stores/useStore';

const layerGroups = [
  {
    title: 'Base Layers',
    layers: [
      { key: 'parcels', label: 'Property Parcels', icon: Map, color: 'bg-accent-cyan' },
      { key: 'buildings', label: 'Buildings', icon: Building2, color: 'bg-accent-purple' },
      { key: 'roads', label: 'Roads', icon: Route, color: 'bg-text-muted' },
      { key: 'adminBoundaries', label: 'Admin Boundaries', icon: Landmark, color: 'bg-accent-amber' },
    ],
  },
  // {
  //   title: 'Terrain',
  //   layers: [
  //     { key: 'dem', label: 'DEM', icon: Mountain, color: 'bg-accent-teal' },
  //     { key: 'dsm', label: 'DSM', icon: Mountain, color: 'bg-accent-green' },
  //     { key: 'lidar', label: 'LiDAR Point Cloud', icon: Scan, color: 'bg-accent-rose' },
  //   ],
  // },
  {
    title: 'Underground Utilities',
    layers: [
      { key: 'waterPipelines', label: 'Water Pipeline', icon: Droplets, color: 'bg-accent-blue' },
      { key: 'sewerLines', label: 'Sewer / Drainage', icon: PipetteIcon, color: 'bg-accent-green' },
      { key: 'electricalLines', label: 'Electricity', icon: Zap, color: 'bg-accent-amber' },
      { key: 'gasLines', label: 'Gas Pipeline', icon: Flame, color: 'bg-accent-rose' },
    ],
  },
  {
    title: 'Elevated Structures',
    layers: [
      { key: 'elevatedStructures', label: 'Metro / Flyovers', icon: TrainFront, color: 'bg-accent-cyan' },
      { key: 'airRights', label: 'Air Rights', icon: CloudSun, color: 'bg-accent-purple' },
    ],
  },
];

const UNCONFIGURED_LAYERS = {
  dem: 'Raster DEM required',
  dsm: 'Surface Model required',
  lidar: 'LAS/LAZ point cloud required',
};

function LayerToggle({ layer, isActive, onToggle }) {
  const Icon = layer.icon;
  const unconfiguredNotice = UNCONFIGURED_LAYERS[layer.key];

  return (
    <div className="relative group">
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 ${isActive
            ? 'bg-white/5 text-text-primary'
            : 'text-text-muted hover:text-text-secondary hover:bg-white/3'
          }`}
      >
        <div className={`w-5 h-5 rounded flex items-center justify-center ${isActive ? layer.color + '/20' : 'bg-white/5'}`}>
          <Icon className={`w-3 h-3 ${isActive ? 'opacity-100' : 'opacity-40'}`} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="truncate leading-tight">{layer.label}</p>
          {unconfiguredNotice && isActive && (
            <p className="text-[9px] text-amber-400/90 font-mono leading-tight truncate">
              Source not configured
            </p>
          )}
        </div>
        {isActive ? (
          <Eye className={`w-3.5 h-3.5 ${unconfiguredNotice ? 'text-amber-400' : 'text-accent-cyan'}`} />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-text-muted/50" />
        )}
      </button>

      {unconfiguredNotice && (
        <div className="hidden group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 pointer-events-none">
          <div className="bg-slate-900 border border-amber-500/40 text-amber-300 text-[10px] px-2.5 py-1 rounded-md shadow-lg whitespace-nowrap">
            ⚠️ {unconfiguredNotice}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar, layers, toggleLayer } = useStore();

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed left-0 top-20 z-40 glass-strong rounded-r-lg px-1.5 py-3 cursor-pointer hover:bg-white/10 transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-text-secondary" />
        ) : (
          <ChevronRight className="w-4 h-4 text-text-secondary" />
        )}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-16 bottom-0 w-72 z-30 glass-strong overflow-y-auto scrollbar-thin"
          >
            <div className="p-4 space-y-4">
              {/* Title */}
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-sm font-semibold text-text-primary">GIS Layers</h2>
              </div>

              {/* Layer Groups */}
              {layerGroups.map((group, gi) => (
                <motion.div
                  key={group.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.05 }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1.5 px-1">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.layers.map((layer) => (
                      <LayerToggle
                        key={layer.key}
                        layer={layer}
                        isActive={layers[layer.key]}
                        onToggle={() => toggleLayer(layer.key)}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}

              {/* Quick Actions */}
              <div className="pt-3 border-t border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2 px-1">
                  Quick Toggle
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      ['waterPipelines', 'sewerLines', 'electricalLines', 'gasLines'].forEach(l => {
                        if (!layers[l]) toggleLayer(l);
                      });
                    }}
                    className="glass rounded-lg px-3 py-2 text-[10px] font-medium text-text-secondary hover:text-accent-cyan hover:bg-accent-cyan/5 cursor-pointer transition-all"
                  >
                    Show Underground
                  </button>
                  <button
                    onClick={() => {
                      ['waterPipelines', 'sewerLines', 'electricalLines', 'gasLines'].forEach(l => {
                        if (layers[l]) toggleLayer(l);
                      });
                    }}
                    className="glass rounded-lg px-3 py-2 text-[10px] font-medium text-text-secondary hover:text-accent-rose hover:bg-accent-rose/5 cursor-pointer transition-all"
                  >
                    Hide Underground
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
