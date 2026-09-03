'use client';

import { useState } from 'react';
import useStore from '@/stores/useStore';

export default function CalibrationPanel() {
  const { mapOffsetX, mapOffsetZ, mapRotationY, setMapOffset } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <button 
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 left-4 bg-background-surface/90 border border-white/10 px-4 py-2 rounded-xl text-sm z-50 backdrop-blur-md"
      >
        Open Calibration
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-background-surface/90 border border-white/10 p-4 rounded-xl z-50 w-64 backdrop-blur-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Map Calibration</h3>
        <button onClick={() => setCollapsed(true)} className="text-text-muted hover:text-white">✕</button>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">East / West (X)</span>
            <span className="text-brand-primary">{mapOffsetX}m</span>
          </div>
          <input 
            type="range" 
            min="-150" 
            max="150" 
            value={mapOffsetX} 
            onChange={(e) => setMapOffset(parseInt(e.target.value), mapOffsetZ, mapRotationY)}
            className="w-full accent-brand-primary"
          />
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">North / South (Z)</span>
            <span className="text-brand-primary">{mapOffsetZ}m</span>
          </div>
          <input 
            type="range" 
            min="-150" 
            max="150" 
            value={mapOffsetZ} 
            onChange={(e) => setMapOffset(mapOffsetX, parseInt(e.target.value), mapRotationY)}
            className="w-full accent-brand-primary"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">Rotation (Y)</span>
            <span className="text-brand-primary">{mapRotationY}°</span>
          </div>
          <input 
            type="range" 
            min="-180" 
            max="180" 
            value={mapRotationY} 
            onChange={(e) => setMapOffset(mapOffsetX, mapOffsetZ, parseInt(e.target.value))}
            className="w-full accent-brand-primary"
          />
        </div>
        
        <p className="text-[10px] text-text-muted leading-tight mt-2">
          Use these sliders to manually align the 3D buildings with the 2D map footprints.
        </p>
      </div>
    </div>
  );
}
