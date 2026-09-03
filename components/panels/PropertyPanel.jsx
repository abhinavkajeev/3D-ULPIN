'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Ruler, Building2, Layers, User, Calendar, IndianRupee, FileText, Copy, Check, QrCode } from 'lucide-react';
import { useState } from 'react';
import useStore from '@/stores/useStore';
import { generateULPIN } from '@/lib/ulpinGenerator';

export default function PropertyPanel() {
  const { selectedBuilding, selectedUnit, selectedFloor, selectUnit, setRightPanel } = useStore();
  const [copied, setCopied] = useState(false);

  if (!selectedBuilding || !selectedUnit) return null;

  const ulpinData = generateULPIN({
    parcelId: selectedBuilding.parcelId,
    buildingId: selectedBuilding.id,
    floor: selectedUnit.floor,
    unitNumber: selectedUnit.unitNumber,
    buildingObj: selectedBuilding,
    unitObj: selectedUnit,
  });

  const handleCopy = () => {
    if (ulpinData) {
      navigator.clipboard.writeText(ulpinData.ulpin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusStyles = {
    verified: { bg: 'bg-verified/10', text: 'text-verified', border: 'border-verified/30', label: '✓ Verified' },
    pending: { bg: 'bg-pending/10', text: 'text-pending', border: 'border-pending/30', label: '⏳ Pending' },
    disputed: { bg: 'bg-disputed/10', text: 'text-disputed', border: 'border-disputed/30', label: '⚠ Disputed' },
  };

  const status = statusStyles[selectedUnit.status] || statusStyles.pending;

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => { selectUnit(null); setRightPanel('floor'); }}
            className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-text-primary">{selectedUnit.name}</h3>
            <p className="text-[10px] text-text-muted">{selectedBuilding.name} • Floor {selectedUnit.floor}</p>
          </div>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${status.bg} ${status.border}`}>
          <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
        </div>

        {/* 3D ULPIN */}
        {ulpinData && (
          <div className="glass rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">3D ULPIN</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-text-muted hover:text-accent-cyan cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Color-coded ULPIN segments */}
            <div className="flex flex-wrap gap-1">
              {Object.entries(ulpinData.segments).map(([key, seg]) => (
                <span
                  key={key}
                  className="font-mono text-xs font-bold px-2 py-1 rounded-md"
                  style={{
                    background: seg.color + '15',
                    color: seg.color,
                  }}
                  title={seg.label}
                >
                  {seg.code}
                </span>
              ))}
            </div>

            {/* Full ULPIN */}
            <p className="font-mono text-sm font-bold text-text-primary tracking-wide text-center py-2 glass rounded-lg">
              {ulpinData.ulpin}
            </p>

            {/* Segment Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(ulpinData.segments).map(([key, seg]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: seg.color }} />
                  <span className="text-[9px] text-text-muted">{seg.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Property Details */}
        <div className="glass rounded-xl p-4 space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Property Details</p>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-accent-cyan shrink-0" />
              <div>
                <p className="text-[9px] text-text-muted">Owner</p>
                <p className="text-xs text-text-primary">{selectedUnit.owner}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-accent-teal shrink-0" />
              <div>
                <p className="text-[9px] text-text-muted">Area</p>
                <p className="text-xs text-text-primary">{selectedUnit.area || 850} sq.ft</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-accent-purple shrink-0" />
              <div>
                <p className="text-[9px] text-text-muted">Elevation</p>
                <p className="text-xs text-text-primary">
                  {typeof selectedUnit.elevation === 'number' 
                    ? `${selectedUnit.elevation.toFixed(1)}m` 
                    : `${((selectedUnit.floor || 1) * (selectedBuilding?.floorHeight || 3.5)).toFixed(1)}m`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-accent-amber shrink-0" />
              <div>
                <p className="text-[9px] text-text-muted">Height</p>
                <p className="text-xs text-text-primary">{selectedUnit.height || selectedBuilding?.floorHeight || 3.5}m</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-accent-green shrink-0" />
              <div>
                <p className="text-[9px] text-text-muted">Registered</p>
                <p className="text-xs text-text-primary">{selectedUnit.registrationDate || '2023-08-15'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5 text-accent-rose shrink-0" />
              <div>
                <p className="text-[9px] text-text-muted">Market Value</p>
                <p className="text-xs text-text-primary">
                  ₹{typeof selectedUnit.marketValue === 'number' ? (selectedUnit.marketValue / 100000).toFixed(1) : '65.0'}L
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Spatial Metadata */}
        {ulpinData && (
          <div className="glass rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Spatial Metadata</p>
            <div className="space-y-1.5 font-mono text-[10px]">
              <div className="flex justify-between">
                <span className="text-text-muted">Latitude</span>
                <span className="text-text-secondary">{ulpinData.spatial.coordinates.lat.toFixed(4)}°N</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Longitude</span>
                <span className="text-text-secondary">{ulpinData.spatial.coordinates.lon.toFixed(4)}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Elevation</span>
                <span className="text-text-secondary">{ulpinData.spatial.coordinates.elevation.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Bounding Box</span>
                <span className="text-text-secondary">
                  {ulpinData.spatial.unit.boundingBox.minElevation.toFixed(1)}m – {ulpinData.spatial.unit.boundingBox.maxElevation.toFixed(1)}m
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <button
          onClick={() => setRightPanel('certificate')}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all gradient-bg text-bg-primary hover:opacity-90 hover:shadow-glow-cyan"
        >
          <FileText className="w-4 h-4" />
          Generate Property Certificate
        </button>
      </div>
    </motion.div>
  );
}
