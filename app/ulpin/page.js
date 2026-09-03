'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, ChevronRight, MapPin, Building2, Layers, Home, Copy, Check, QrCode, RotateCcw } from 'lucide-react';
import Header from '@/components/layout/Header';
import { parcels } from '@/data/parcels';
import { buildings, getFloorUnits } from '@/data/buildings';
import { generateULPIN } from '@/lib/ulpinGenerator';

const steps = ['Select Parcel', 'Select Building', 'Select Floor', 'Select Unit'];

export default function UlpinPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [generatedUlpin, setGeneratedUlpin] = useState(null);
  const [copied, setCopied] = useState(false);

  const availableBuildings = selectedParcel
    ? buildings.filter(b => b.parcelId === selectedParcel.id)
    : [];

  const availableUnits = selectedBuilding && selectedFloor
    ? getFloorUnits(selectedBuilding.id, selectedFloor)
    : [];

  const handleSelectParcel = (parcel) => {
    setSelectedParcel(parcel);
    setCurrentStep(1);
  };

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    setCurrentStep(2);
  };

  const handleSelectFloor = (floor) => {
    setSelectedFloor(floor);
    setCurrentStep(3);
  };

  const handleSelectUnit = (unit) => {
    setSelectedUnit(unit);
    const ulpin = generateULPIN({
      parcelId: selectedParcel.id,
      buildingId: selectedBuilding.id,
      floor: unit.floor,
      unitNumber: unit.unitNumber,
    });
    setGeneratedUlpin(ulpin);
    setCurrentStep(4);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setSelectedParcel(null);
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setSelectedUnit(null);
    setGeneratedUlpin(null);
  };

  const handleCopy = () => {
    if (generatedUlpin) {
      navigator.clipboard.writeText(generatedUlpin.ulpin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="pt-20 px-4 lg:px-8 pb-8 max-w-[900px] mx-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-3 animate-pulse-glow">
            <Fingerprint className="w-7 h-7 text-bg-primary" />
          </div>
          <h1 className="text-xl font-bold gradient-text">3D ULPIN Generator</h1>
          <p className="text-xs text-text-muted mt-1">Generate unique volumetric property identifiers</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 ${i <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  i < currentStep ? 'gradient-bg text-bg-primary' :
                  i === currentStep ? 'border-2 border-accent-cyan text-accent-cyan' :
                  'border border-border text-text-muted'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className="text-[10px] font-medium text-text-secondary hidden sm:inline whitespace-nowrap">{step}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-px mx-2" style={{
                  background: i < currentStep ? 'linear-gradient(90deg, #00d4ff, #a855f7)' : 'var(--color-border)',
                }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Parcel */}
          {currentStep === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent-cyan" /> Select a Parcel
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parcels.map((parcel, i) => (
                  <motion.button
                    key={parcel.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleSelectParcel(parcel)}
                    className="glass rounded-xl p-4 text-left cursor-pointer hover:glow-border transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-semibold text-text-primary">{parcel.surveyNumber}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{parcel.zoneName}</p>
                        <p className="text-[10px] text-text-muted truncate mt-1 max-w-[200px]">{parcel.address}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-accent-cyan transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Building */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-accent-purple" /> Select a Building
              </h2>
              <p className="text-[10px] text-text-muted mb-3">Parcel: {selectedParcel?.surveyNumber} — {selectedParcel?.zoneName}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableBuildings.map((building, i) => (
                  <motion.button
                    key={building.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelectBuilding(building)}
                    className="glass rounded-xl p-4 text-left cursor-pointer hover:glow-border transition-all"
                  >
                    <p className="text-xs font-semibold text-text-primary">{building.name}</p>
                    <p className="text-[10px] text-text-muted mt-1">{building.floors} Floors • {building.totalUnits} Units • {building.height}m</p>
                  </motion.button>
                ))}
                {availableBuildings.length === 0 && (
                  <p className="text-xs text-text-muted col-span-2 text-center py-8">No buildings found on this parcel</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Floor */}
          {currentStep === 2 && selectedBuilding && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-accent-teal" /> Select a Floor
              </h2>
              <p className="text-[10px] text-text-muted mb-3">{selectedBuilding.name} • {selectedBuilding.floors} Floors</p>

              {/* Visual building stack */}
              <div className="flex flex-col-reverse items-center gap-1 mb-4">
                {Array.from({ length: selectedBuilding.floors }, (_, i) => i + 1).map((floor) => (
                  <motion.button
                    key={floor}
                    initial={{ opacity: 0, scaleX: 0.5 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    transition={{ delay: floor * 0.03 }}
                    onClick={() => handleSelectFloor(floor)}
                    className="w-full max-w-xs h-8 rounded-md flex items-center justify-between px-4 cursor-pointer transition-all hover:scale-[1.03] border border-transparent hover:border-accent-cyan/30"
                    style={{
                      background: floor === 1
                        ? 'linear-gradient(90deg, rgba(100,116,139,0.3), rgba(100,116,139,0.1))'
                        : `linear-gradient(90deg, rgba(0,212,255,${0.05 + floor * 0.02}), rgba(168,85,247,${0.05 + floor * 0.02}))`,
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold text-text-primary">F{floor}</span>
                    <span className="text-[9px] text-text-muted">{floor === 1 ? 'Ground / Parking' : `${getFloorUnits(selectedBuilding.id, floor).length} Units`}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: Select Unit */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Home className="w-4 h-4 text-accent-amber" /> Select a Unit
              </h2>
              <p className="text-[10px] text-text-muted mb-3">Floor {selectedFloor} • {availableUnits.length} Units</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableUnits.map((unit, i) => (
                  <motion.button
                    key={unit.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => handleSelectUnit(unit)}
                    className="glass rounded-xl p-3 text-left cursor-pointer hover:glow-border transition-all"
                  >
                    <p className="text-xs font-bold text-text-primary">{unit.unitNumber}</p>
                    <p className="text-[10px] text-text-muted">{unit.area} sq.ft</p>
                    <p className="text-[9px] text-text-muted truncate">{unit.owner}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Result: Generated ULPIN */}
          {currentStep === 4 && generatedUlpin && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5">
              {/* Success Header */}
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-3 animate-pulse-glow"
                >
                  <Check className="w-8 h-8 text-bg-primary" />
                </motion.div>
                <h2 className="text-lg font-bold text-text-primary">3D ULPIN Generated</h2>
              </div>

              {/* ULPIN Display */}
              <div className="glass-strong rounded-2xl p-6 space-y-4">
                <div className="flex flex-wrap justify-center gap-1.5">
                  {Object.entries(generatedUlpin.segments).map(([key, seg]) => (
                    <span
                      key={key}
                      className="font-mono text-sm font-bold px-3 py-1.5 rounded-lg"
                      style={{ background: seg.color + '15', color: seg.color }}
                    >
                      {seg.code}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3">
                  <p className="font-mono text-base font-bold text-text-primary tracking-wider">
                    {generatedUlpin.ulpin}
                  </p>
                  <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
                    {copied ? <Check className="w-4 h-4 text-accent-green" /> : <Copy className="w-4 h-4 text-text-muted" />}
                  </button>
                </div>

                {/* Segment Legend */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(generatedUlpin.segments).map(([key, seg]) => (
                    <div key={key} className="glass rounded-lg p-2 text-center">
                      <p className="text-[9px] text-text-muted uppercase">{key}</p>
                      <p className="text-xs font-semibold" style={{ color: seg.color }}>{seg.code}</p>
                      <p className="text-[8px] text-text-muted">{seg.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spatial Info */}
              <div className="glass rounded-xl p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-2">Spatial Metadata</p>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                  <div className="flex justify-between"><span className="text-text-muted">Lat</span><span className="text-text-secondary">{(generatedUlpin.spatial.coordinates?.lat ?? 13.04).toFixed(4)}°N</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Lon</span><span className="text-text-secondary">{(generatedUlpin.spatial.coordinates?.lon ?? 80.23).toFixed(4)}°E</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Elevation</span><span className="text-text-secondary">{(generatedUlpin.spatial.coordinates?.elevation ?? 0).toFixed(1)}m</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">Area</span><span className="text-text-secondary">{generatedUlpin.spatial.unit?.area ?? 0} sq.ft</span></div>
                </div>
              </div>

              {/* Reset */}
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all glass hover:bg-white/5 text-text-secondary"
              >
                <RotateCcw className="w-4 h-4" />
                Generate Another ULPIN
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
