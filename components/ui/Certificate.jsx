'use client';

import { motion } from 'framer-motion';
import { X, Shield, MapPin, QrCode, Printer, Download } from 'lucide-react';
import useStore from '@/stores/useStore';
import { generateULPIN } from '@/lib/ulpinGenerator';
import { generateCertificatePDF } from '@/lib/pdfGenerator';

export default function Certificate() {
  const { selectedBuilding, selectedUnit, setRightPanel } = useStore();

  if (!selectedBuilding || !selectedUnit) return null;

  const ulpinData = generateULPIN({
    parcelId: selectedBuilding.parcelId,
    buildingId: selectedBuilding.id,
    floor: selectedUnit.floor,
    unitNumber: selectedUnit.unitNumber,
  });

  if (!ulpinData) return null;

  const handlePrint = () => {
    generateCertificatePDF(ulpinData);
  };

  const handleDownload = () => {
    generateCertificatePDF(ulpinData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setRightPanel('property')}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-bg-secondary border border-border rounded-2xl max-w-lg w-full overflow-hidden shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1.5 gradient-bg" />

        <div className="p-6 space-y-5">
          {/* Close button */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center animate-pulse-glow">
                <Shield className="w-6 h-6 text-bg-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold gradient-text">3D Property Certificate</h2>
                <p className="text-[10px] text-text-muted">Government of Tamil Nadu • Digital Land Records</p>
              </div>
            </div>
            <button
              onClick={() => setRightPanel('property')}
              className="p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Certificate Body */}
          <div className="border border-border-glow rounded-xl p-5 space-y-4">
            {/* ULPIN */}
            <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">
                Unique Land Parcel Identification Number (3D)
              </p>
              <p className="text-lg font-mono font-bold gradient-text tracking-wider">
                {ulpinData.ulpin}
              </p>
            </div>

            <hr className="border-border" />

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xs">
              <div>
                <p className="text-[9px] text-text-muted uppercase">Owner</p>
                <p className="font-semibold text-text-primary">{ulpinData.metadata.owner}</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted uppercase">Status</p>
                <p className="font-semibold text-verified uppercase">{ulpinData.metadata.status}</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted uppercase">Property Type</p>
                <p className="font-semibold text-text-primary capitalize">{ulpinData.metadata.landUse}</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted uppercase">Area</p>
                <p className="font-semibold text-text-primary">{ulpinData.spatial.unit.area} sq.ft</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted uppercase">Floor</p>
                <p className="font-semibold text-text-primary">{ulpinData.spatial.floor.number}</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted uppercase">Elevation</p>
                <p className="font-semibold text-text-primary">{ulpinData.spatial.floor.elevation.toFixed(1)}m</p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted uppercase">Coordinates</p>
                <p className="font-semibold text-text-primary font-mono text-[10px]">
                  {ulpinData.spatial.coordinates.lat.toFixed(4)}°N, {ulpinData.spatial.coordinates.lon.toFixed(4)}°E
                </p>
              </div>
              <div>
                <p className="text-[9px] text-text-muted uppercase">Market Value</p>
                <p className="font-semibold text-text-primary">₹{(ulpinData.metadata.marketValue / 100000).toFixed(1)}L</p>
              </div>
            </div>

            <hr className="border-border" />

            {/* Volumetric Info */}
            <div className="text-center">
              <p className="text-[9px] text-text-muted uppercase tracking-wide mb-1">3D Bounding Volume</p>
              <p className="font-mono text-[11px] text-text-secondary">
                {ulpinData.spatial.unit.boundingBox.minElevation.toFixed(1)}m — {ulpinData.spatial.unit.boundingBox.maxElevation.toFixed(1)}m
              </p>
            </div>

            {/* QR Placeholder */}
            <div className="flex justify-center">
              <div className="w-20 h-20 glass rounded-lg flex items-center justify-center">
                <QrCode className="w-10 h-10 text-text-muted/30" />
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-[8px] text-text-muted">
                Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                {' '}• Digitally Signed • Tamper-Proof Record
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all glass hover:bg-white/5 text-text-secondary"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all gradient-bg text-bg-primary hover:opacity-90"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
