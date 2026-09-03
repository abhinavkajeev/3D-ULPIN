'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Upload, ScanLine, Building2, Layers, CheckCircle2, ArrowRight, ImageIcon, X, Eye, Cpu, Maximize, Box } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useRouter } from 'next/navigation';

const pipelineSteps = [
  { id: 'detect', label: 'Building Detection', desc: 'YOLOv8 identifying building footprints from satellite imagery', icon: ScanLine, duration: 2000 },
  { id: 'segment', label: 'Floor Segmentation', desc: 'LiDAR point cloud elevation clustering for floor detection', icon: Layers, duration: 1500 },
  { id: 'height', label: 'Height Estimation', desc: 'Shadow analysis + DSM computing building heights', icon: Maximize, duration: 1200 },
  { id: 'footprint', label: 'Footprint Extraction', desc: 'SAM generating precise building polygon boundaries', icon: Box, duration: 1000 },
  { id: 'model', label: '3D Model Generation', desc: 'Constructing volumetric CityGML LoD2 building model', icon: Building2, duration: 1800 },
];

const demoDetections = [
  { id: 1, name: 'Pondy Heights', confidence: 97.2, floors: 8, height: '28.5m', area: '4,200 sq.ft', type: 'Residential', x: 15, y: 20, w: 22, h: 18 },
  { id: 2, name: 'GN Chetty Towers', confidence: 94.8, floors: 12, height: '42.0m', area: '6,800 sq.ft', type: 'Commercial', x: 45, y: 15, w: 25, h: 22 },
  { id: 3, name: 'Ranganathan Plaza', confidence: 91.5, floors: 5, height: '17.5m', area: '3,100 sq.ft', type: 'Mixed Use', x: 60, y: 50, w: 18, h: 15 },
  { id: 4, name: 'Thyagaraya Complex', confidence: 88.9, floors: 6, height: '21.0m', area: '5,500 sq.ft', type: 'Commercial', x: 20, y: 55, w: 20, h: 16 },
  { id: 5, name: 'Underground Parking P1', confidence: 85.3, floors: -2, height: '-7.0m', area: '8,000 sq.ft', type: 'Underground', x: 35, y: 40, w: 28, h: 12 },
];

const demoResults = {
  buildings: 5,
  floors: 29,
  units: 87,
  totalArea: '27,600 sq.ft',
  avgHeight: '27.3m',
  confidence: 91.5,
  underground: 1,
  processingTime: '7.5s',
  model: 'YOLOv8-X + SAM-ViT-H',
  dataSource: 'Drone Imagery (GSD: 2.5cm) + LiDAR (12 pts/m²)',
};

export default function AIEnginePage() {
  const router = useRouter();
  const [stage, setStage] = useState('upload');
  const [currentPipelineStep, setCurrentPipelineStep] = useState(-1);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [showDetections, setShowDetections] = useState(true);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const fileInputRef = useRef(null);

  const handleUpload = (name) => {
    setFileName(name || 'drone_capture_chennai_tnagar.tiff');
    setStage('processing');
    runPipeline();
  };

  const runPipeline = async () => {
    for (let i = 0; i < pipelineSteps.length; i++) {
      setCurrentPipelineStep(i);
      await new Promise(r => setTimeout(r, pipelineSteps[i].duration));
    }
    setCurrentPipelineStep(pipelineSteps.length);
    await new Promise(r => setTimeout(r, 500));
    setStage('results');
  };

  const handleReset = () => {
    setStage('upload');
    setCurrentPipelineStep(-1);
    setFileName('');
    setSelectedDetection(null);
  };

  const handleViewIn3D = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="pt-20 px-4 lg:px-8 pb-8 max-w-[1000px] mx-auto">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent-purple/10 flex items-center justify-center mx-auto mb-3">
            <BrainCircuit className="w-7 h-7 text-accent-purple" />
          </div>
          <h1 className="text-xl font-bold gradient-text">AI/ML Extraction Engine</h1>
          <p className="text-xs text-text-muted mt-1">YOLOv8 + Segment Anything + LiDAR Point Cloud Analysis</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* UPLOAD STAGE */}
          {stage === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]?.name); }}
                onClick={() => fileInputRef.current?.click()}
                className={`glass rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-6 ${
                  dragOver ? 'glow-border bg-accent-cyan/5 scale-[1.02]' : 'hover:bg-white/5'
                }`}
              >
                <input ref={fileInputRef} type="file" className="hidden" accept=".tiff,.tif,.png,.jpg,.jpeg,.las,.laz"
                  onChange={(e) => handleUpload(e.target.files?.[0]?.name)} />
                <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${dragOver ? 'text-accent-cyan' : 'text-text-muted'}`} />
                <p className="text-sm font-semibold text-text-primary mb-1">Upload Aerial / Drone Imagery</p>
                <p className="text-[11px] text-text-muted mb-4">Supports GeoTIFF, PNG, JPG, LAS/LAZ point clouds</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Drone (GSD 2.5cm)', 'Satellite (50cm)', 'LiDAR (12 pts/m²)', 'DSM/DEM'].map(t => (
                    <span key={t} className="px-2 py-1 rounded-full glass text-[9px] font-medium text-text-secondary">{t}</span>
                  ))}
                </div>
              </div>

              {/* Demo Button */}
              <button
                onClick={() => handleUpload('drone_capture_chennai_tnagar_2026.tiff')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all gradient-bg text-bg-primary hover:opacity-90"
              >
                <Cpu className="w-4 h-4" />
                Run Demo — Chennai T. Nagar Aerial Capture
              </button>
            </motion.div>
          )}

          {/* PROCESSING STAGE */}
          {stage === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="glass rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <ImageIcon className="w-4 h-4 text-accent-cyan" />
                  <span className="text-xs font-semibold text-text-primary">{fileName}</span>
                </div>

                {/* Simulated image with detection boxes appearing */}
                <div className="relative glass rounded-xl overflow-hidden mb-6" style={{ height: 280 }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-bg-secondary to-bg-primary flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-accent-cyan/30 border-t-accent-cyan animate-spin mx-auto mb-3" />
                      <p className="text-xs text-text-muted">{currentPipelineStep >= 0 && currentPipelineStep < pipelineSteps.length ? pipelineSteps[currentPipelineStep].desc : 'Initializing...'}</p>
                    </div>
                  </div>

                  {/* Detection boxes appearing progressively */}
                  {currentPipelineStep >= 0 && demoDetections.slice(0, Math.min(currentPipelineStep + 1, demoDetections.length)).map((det, i) => (
                    <motion.div
                      key={det.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute border-2 border-accent-cyan rounded-md"
                      style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%` }}
                    >
                      <div className="absolute -top-5 left-0 bg-accent-cyan/90 text-bg-primary text-[8px] font-bold px-1.5 py-0.5 rounded-t-md whitespace-nowrap">
                        {det.name} ({det.confidence}%)
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Pipeline Steps */}
              <div className="space-y-2">
                {pipelineSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i === currentPipelineStep;
                  const isDone = i < currentPipelineStep;
                  return (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`glass rounded-xl px-4 py-3 flex items-center gap-3 transition-all ${isActive ? 'glow-border' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isDone ? 'bg-accent-green/15' : isActive ? 'bg-accent-cyan/15' : 'bg-white/5'
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-accent-green" /> :
                         isActive ? <div className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" /> :
                         <Icon className="w-4 h-4 text-text-muted" />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-semibold ${isDone ? 'text-accent-green' : isActive ? 'text-accent-cyan' : 'text-text-muted'}`}>{step.label}</p>
                        <p className="text-[10px] text-text-muted">{step.desc}</p>
                      </div>
                      {isDone && <span className="text-[9px] text-accent-green font-mono">{(step.duration / 1000).toFixed(1)}s</span>}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* RESULTS STAGE */}
          {stage === 'results' && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              {/* Success */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-accent-green/15 flex items-center justify-center mx-auto mb-3"
                >
                  <CheckCircle2 className="w-8 h-8 text-accent-green" />
                </motion.div>
                <h2 className="text-lg font-bold text-text-primary">Extraction Complete</h2>
                <p className="text-[11px] text-text-muted mt-1">{demoResults.model} • {demoResults.processingTime}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: 'Buildings Detected', value: demoResults.buildings, color: '#00d4ff' },
                  { label: 'Floors Segmented', value: demoResults.floors, color: '#a855f7' },
                  { label: 'Units Estimated', value: demoResults.units, color: '#14b8a6' },
                  { label: 'Avg Confidence', value: `${demoResults.confidence}%`, color: '#22c55e' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass rounded-xl p-4 text-center"
                  >
                    <p className="text-xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
                    <p className="text-[9px] text-text-muted mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Detection Map */}
              <div className="glass rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Detected Buildings</h3>
                  <button
                    onClick={() => setShowDetections(!showDetections)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg glass text-[10px] font-medium text-text-secondary cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    {showDetections ? 'Hide Boxes' : 'Show Boxes'}
                  </button>
                </div>

                {/* Simulated aerial view with detections */}
                <div className="relative rounded-xl overflow-hidden" style={{ height: 300, background: 'linear-gradient(135deg, #1a2332, #0f1923)' }}>
                  {/* Grid pattern to simulate satellite */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />

                  {/* Road lines */}
                  <div className="absolute top-0 bottom-0 left-1/3 w-px bg-text-muted/20" />
                  <div className="absolute top-0 bottom-0 left-2/3 w-px bg-text-muted/20" />
                  <div className="absolute left-0 right-0 top-1/3 h-px bg-text-muted/20" />

                  {showDetections && demoDetections.map((det, i) => (
                    <motion.div
                      key={det.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedDetection(det)}
                      className={`absolute cursor-pointer transition-all hover:scale-105 ${
                        det.type === 'Underground'
                          ? 'border-2 border-dashed border-accent-amber rounded-md'
                          : 'border-2 border-accent-cyan rounded-md'
                      } ${selectedDetection?.id === det.id ? 'ring-2 ring-accent-green ring-offset-2 ring-offset-bg-primary' : ''}`}
                      style={{ left: `${det.x}%`, top: `${det.y}%`, width: `${det.w}%`, height: `${det.h}%`,
                        background: det.type === 'Underground' ? 'rgba(245,158,11,0.1)' : 'rgba(0,212,255,0.08)' }}
                    >
                      <div className={`absolute -top-5 left-0 text-bg-primary text-[7px] font-bold px-1.5 py-0.5 rounded-t whitespace-nowrap ${
                        det.type === 'Underground' ? 'bg-accent-amber/90' : 'bg-accent-cyan/90'
                      }`}>
                        {det.name}
                      </div>
                      <div className="absolute -bottom-4 left-0 text-[7px] font-mono text-accent-green">{det.confidence}%</div>
                    </motion.div>
                  ))}
                </div>

                {/* Selected detection details */}
                <AnimatePresence>
                  {selectedDetection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass rounded-xl p-4 mt-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-text-primary">{selectedDetection.name}</p>
                          <p className="text-[10px] text-text-muted">{selectedDetection.type}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-accent-green/15 text-accent-green text-[9px] font-bold">
                          {selectedDetection.confidence}% confidence
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3">
                        <div><p className="text-[8px] text-text-muted">Floors</p><p className="text-xs font-bold text-text-primary">{selectedDetection.floors}</p></div>
                        <div><p className="text-[8px] text-text-muted">Height</p><p className="text-xs font-bold text-text-primary">{selectedDetection.height}</p></div>
                        <div><p className="text-[8px] text-text-muted">Area</p><p className="text-xs font-bold text-text-primary">{selectedDetection.area}</p></div>
                        <div><p className="text-[8px] text-text-muted">Type</p><p className="text-xs font-bold text-text-primary">{selectedDetection.type}</p></div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Data Source */}
              <div className="glass rounded-xl p-4 mb-6">
                <p className="text-[9px] text-text-muted uppercase tracking-wider mb-2">Processing Pipeline</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div><span className="text-text-muted">Model:</span> <span className="text-text-secondary font-medium">{demoResults.model}</span></div>
                  <div><span className="text-text-muted">Source:</span> <span className="text-text-secondary font-medium">{demoResults.dataSource}</span></div>
                  <div><span className="text-text-muted">Processing:</span> <span className="text-text-secondary font-medium">{demoResults.processingTime}</span></div>
                  <div><span className="text-text-muted">Underground:</span> <span className="text-text-secondary font-medium">{demoResults.underground} structure detected</span></div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleReset} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer glass hover:bg-white/5 text-text-secondary transition-all">
                  <Upload className="w-4 h-4" />
                  New Extraction
                </button>
                <button onClick={handleViewIn3D} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer gradient-bg text-bg-primary hover:opacity-90 transition-all">
                  <Eye className="w-4 h-4" />
                  View in 3D
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
