'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Ruler, Building2, Layers, User, Calendar, IndianRupee, FileText, Copy, Check, QrCode, Navigation } from 'lucide-react';
import { useState } from 'react';
import useStore from '@/stores/useStore';
import { generateULPIN } from '@/lib/ulpinGenerator';
import NavigationModal from '@/components/ui/NavigationModal';

export default function PropertyPanel() {
  const { selectedBuilding, selectedUnit, selectedFloor, selectUnit, setRightPanel } = useStore();
  const [copied, setCopied] = useState(false);
  const [navModalOpen, setNavModalOpen] = useState(false);

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
    <>
      <NavigationModal isOpen={navModalOpen} onClose={() => setNavModalOpen(false)} />
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

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.text} ${status.border}`}>
              {status.label}
            </span>
            <span className="text-[10px] text-text-muted">Unit ID: {selectedUnit.id || selectedUnit.unitNumber}</span>
          </div>

          {/* 3D ULPIN Segment */}
          {ulpinData && (
            <div className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">3D ULPIN</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[10px] text-accent-cyan hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Segmented Code */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(ulpinData.segments).map(([key, seg]) => (
                  <span
                    key={key}
                    className="px-2 py-1 rounded-md text-xs font-mono font-bold"
                    style={{ backgroundColor: `${seg.color}15`, color: seg.color }}
                  >
                    {seg.code}
                  </span>
                ))}
              </div>

              {/* Full ULPIN String */}
              <div className="bg-bg-primary/60 rounded-lg p-2.5 font-mono text-xs text-text-primary break-all border border-border text-center font-bold tracking-wider">
                {ulpinData.ulpin}
              </div>

              {/* Segment Legend */}
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                {Object.entries(ulpinData.segments).map(([key, seg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="text-text-muted">{seg.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property Details Grid */}
          <div className="glass rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Property Details</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-accent-cyan" />
                <div>
                  <p className="text-[10px] text-text-muted">Owner</p>
                  <p className="font-medium text-text-secondary">{selectedUnit.owner || 'Government / Registered'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Ruler className="w-3.5 h-3.5 text-accent-cyan" />
                <div>
                  <p className="text-[10px] text-text-muted">Area</p>
                  <p className="font-medium text-text-secondary">{selectedUnit.area || 850} sq.ft</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-accent-purple" />
                <div>
                  <p className="text-[10px] text-text-muted">Elevation</p>
                  <p className="font-medium text-text-secondary">{typeof selectedUnit.elevation === 'number' ? `${selectedUnit.elevation.toFixed(1)}m` : `${((selectedUnit.floor || 1) * (selectedBuilding?.floorHeight || 3.5)).toFixed(1)}m`}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-accent-purple" />
                <div>
                  <p className="text-[10px] text-text-muted">Height</p>
                  <p className="font-medium text-text-secondary">{selectedUnit.height || selectedBuilding?.floorHeight || 3.5}m</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-accent-green" />
                <div>
                  <p className="text-[10px] text-text-muted">Registered</p>
                  <p className="font-medium text-text-secondary">{selectedUnit.registrationDate || '2023-11-20'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <IndianRupee className="w-3.5 h-3.5 text-accent-green" />
                <div>
                  <p className="text-[10px] text-text-muted">Market Value</p>
                  <p className="font-medium text-text-secondary">₹{selectedUnit.marketValue ? (selectedUnit.marketValue / 100000).toFixed(1) + 'L' : '85.0L'}</p>
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
          <div className="space-y-2">
            <button
              onClick={() => setNavModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-500/30 shadow-[0_0_15px_rgba(52,211,153,0.25)]"
            >
              <Navigation className="w-4 h-4" />
              Navigate Route in 3D (Point A → Unit)
            </button>

            <button
              onClick={() => setRightPanel('certificate')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all gradient-bg text-bg-primary hover:opacity-90 hover:shadow-glow-cyan"
            >
              <FileText className="w-4 h-4" />
              Generate Property Certificate
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
