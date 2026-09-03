'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Layers, Users, Calendar, Ruler, ArrowRightLeft, ChevronRight, MapPin, Activity } from 'lucide-react';
import useStore from '@/stores/useStore';
import { generateBuildingULPIN } from '@/lib/ulpinGenerator';

export default function BuildingPanel() {
  const { selectedBuilding, setRightPanel, setExploded, isExploded, closeRightPanel, clearSelection } = useStore();

  if (!selectedBuilding) return null;

  const buildingUlpin = generateBuildingULPIN(selectedBuilding.id, selectedBuilding);
  const occupiedUnits = Math.round(selectedBuilding.totalUnits * selectedBuilding.occupancy);
  const vacantUnits = selectedBuilding.totalUnits - occupiedUnits;

  const statusColors = {
    verified: 'bg-verified/20 text-verified',
    pending: 'bg-pending/20 text-pending',
    disputed: 'bg-disputed/20 text-disputed',
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-16 bottom-0 w-80 lg:w-96 z-30 glass-strong overflow-y-auto scrollbar-thin"
    >
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: selectedBuilding.color + '20' }}>
              <Building2 className="w-5 h-5" style={{ color: selectedBuilding.color }} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">{selectedBuilding.name}</h3>
              <p className="text-[10px] text-text-muted">{selectedBuilding.zoneName}, Chennai</p>
            </div>
          </div>
          <button
            onClick={() => { closeRightPanel(); clearSelection(); }}
            className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${statusColors[selectedBuilding.status]}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {selectedBuilding.status}
          </span>
          <span className="text-[10px] text-text-muted capitalize px-2 py-1 rounded-full glass">
            {selectedBuilding.type}
          </span>
        </div>

        {/* ULPIN */}
        {buildingUlpin && (
          <div className="glass rounded-xl p-3">
            <p className="text-[10px] text-text-muted mb-1">Building ULPIN</p>
            <p className="text-xs font-mono font-bold gradient-text">{buildingUlpin}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-3 text-center">
            <Layers className="w-4 h-4 text-accent-cyan mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{selectedBuilding.floors}</p>
            <p className="text-[10px] text-text-muted">Floors</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <Users className="w-4 h-4 text-accent-purple mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{selectedBuilding.totalUnits}</p>
            <p className="text-[10px] text-text-muted">Total Units</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <Ruler className="w-4 h-4 text-accent-teal mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{selectedBuilding.height}m</p>
            <p className="text-[10px] text-text-muted">Height</p>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <Calendar className="w-4 h-4 text-accent-amber mx-auto mb-1" />
            <p className="text-lg font-bold text-text-primary">{selectedBuilding.yearBuilt}</p>
            <p className="text-[10px] text-text-muted">Year Built</p>
          </div>
        </div>

        {/* Occupancy Bar */}
        <div className="glass rounded-xl p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] text-text-muted">Occupancy</p>
            <p className="text-xs font-bold text-accent-green">{(selectedBuilding.occupancy * 100).toFixed(0)}%</p>
          </div>
          <div className="w-full h-2 rounded-full bg-bg-tertiary overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${selectedBuilding.occupancy * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full gradient-bg-teal"
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-accent-green">{occupiedUnits} Occupied</span>
            <span className="text-[9px] text-text-muted">{vacantUnits} Vacant</span>
          </div>
        </div>

        {/* Location */}
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
            <p className="text-[10px] text-text-muted">Location</p>
          </div>
          <p className="text-xs text-text-secondary">
            {(Array.isArray(selectedBuilding.coordinates) 
              ? selectedBuilding.coordinates[1] 
              : (selectedBuilding.coordinates?.lat ?? 13.0511))?.toFixed(4)}°N, {(Array.isArray(selectedBuilding.coordinates) 
              ? selectedBuilding.coordinates[0] 
              : (selectedBuilding.coordinates?.lon ?? 80.2081))?.toFixed(4)}°E
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => { setExploded(true); }}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all gradient-bg text-bg-primary hover:opacity-90 hover:shadow-glow-cyan"
          >
            <span className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              {isExploded ? 'Collapse Floors' : 'Explore Floors'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRightPanel('validation')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all glass hover:bg-white/5 text-text-secondary hover:text-accent-cyan"
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Run Validation
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
