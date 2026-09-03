'use client';

import { motion } from 'framer-motion';
import { X, Home, Store, ArrowLeft, ChevronRight } from 'lucide-react';
import useStore from '@/stores/useStore';
import { generateULPIN } from '@/lib/ulpinGenerator';

export default function FloorPanel() {
  const { selectedBuilding, selectedFloor, selectFloor, selectUnit, setRightPanel } = useStore();

  if (!selectedBuilding || !selectedFloor) return null;

  const units = selectedBuilding.units?.filter(u => u.floor === selectedFloor) || [];
  const floorElevation = (selectedFloor - 1) * selectedBuilding.floorHeight;

  const statusStyles = {
    verified: 'border-verified/30 hover:border-verified/60',
    pending: 'border-pending/30 hover:border-pending/60',
    disputed: 'border-disputed/30 hover:border-disputed/60',
  };

  const statusDots = {
    verified: 'bg-verified',
    pending: 'bg-pending',
    disputed: 'bg-disputed',
  };

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-16 bottom-0 w-80 lg:w-96 z-30 glass-strong overflow-y-auto scrollbar-thin"
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { selectFloor(null); setRightPanel('building'); }}
              className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-text-muted" />
            </button>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Floor {selectedFloor}</h3>
              <p className="text-[10px] text-text-muted">{selectedBuilding.name}</p>
            </div>
          </div>
        </div>

        {/* Floor Info */}
        <div className="grid grid-cols-3 gap-2">
          <div className="glass rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-accent-cyan">{units.length}</p>
            <p className="text-[9px] text-text-muted">Units</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-accent-teal">{floorElevation.toFixed(1)}m</p>
            <p className="text-[9px] text-text-muted">Elevation</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <p className="text-sm font-bold text-accent-purple">{selectedBuilding.floorHeight}m</p>
            <p className="text-[9px] text-text-muted">Height</p>
          </div>
        </div>

        {/* Floor Plan Label */}
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Floor Plan — {units.length} Units
        </p>

        {/* Unit Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {units.map((unit, i) => {
            const Icon = unit.type === 'commercial' ? Store : Home;
            return (
              <motion.button
                key={unit.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => { selectUnit(unit); setRightPanel('property'); }}
                className={`glass rounded-xl p-3 text-left cursor-pointer transition-all border ${statusStyles[unit.status]} hover:bg-white/5`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-text-muted" />
                    <span className="text-xs font-semibold text-text-primary">{unit.unitNumber}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${statusDots[unit.status]}`} />
                </div>
                <p className="text-[10px] text-text-secondary">{unit.area} sq.ft</p>
                <p className="text-[9px] text-text-muted truncate mt-0.5">{unit.owner}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="glass rounded-lg p-3 mt-3">
          <p className="text-[10px] font-semibold text-text-muted mb-2">Status Legend</p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5 text-[9px] text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-verified" /> Verified
            </span>
            <span className="flex items-center gap-1.5 text-[9px] text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-pending" /> Pending
            </span>
            <span className="flex items-center gap-1.5 text-[9px] text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-disputed" /> Disputed
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
