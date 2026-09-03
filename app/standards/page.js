'use client';

import { motion } from 'framer-motion';
import {
  FileCode2, Globe2, Database, Shield, Layers, ArrowRight,
  CheckCircle2, ExternalLink, BookOpen, Network, Box
} from 'lucide-react';
import Header from '@/components/layout/Header';

const standards = [
  {
    name: 'OGC CityGML 3.0',
    org: 'Open Geospatial Consortium',
    description: 'International standard for 3D city model representation. Our system supports LoD1–LoD3 building models with semantic surfaces.',
    status: 'Compliant',
    color: '#00d4ff',
    icon: Box,
    features: ['LoD1 Block Model', 'LoD2 Roof Structures', 'LoD3 Architectural Detail', 'Semantic Surfaces'],
  },
  {
    name: 'OGC IndoorGML 1.1',
    org: 'Open Geospatial Consortium',
    description: 'Standard for indoor spatial data. Used for floor-level and unit-level navigation within buildings.',
    status: 'Partial',
    color: '#a855f7',
    icon: Layers,
    features: ['Indoor Navigation Graph', 'Multi-layered Space Model', 'Floor Connectivity', 'Unit Boundary Representation'],
  },
  {
    name: 'ISO 19152 LADM',
    org: 'ISO / Land Administration Domain Model',
    description: 'International standard for land administration. ULPIN schema aligns with LADM spatial unit and party models.',
    status: 'Compliant',
    color: '#14b8a6',
    icon: Globe2,
    features: ['Spatial Unit Model', 'Party-Rights-Restriction', '3D Cadastral Parcels', 'Volumetric Objects'],
  },
  {
    name: 'OGC LandInfra / InfraGML',
    org: 'Open Geospatial Consortium',
    description: 'Standard for land and infrastructure data. Used for underground utility and elevated structure modeling.',
    status: 'Partial',
    color: '#f59e0b',
    icon: Network,
    features: ['Underground Utility Networks', 'Elevated Corridors', 'Road/Rail Infrastructure', '3D Alignment Geometry'],
  },
  {
    name: 'ULPIN / Bhu-Aadhaar',
    org: 'Dept. of Land Resources (DOLR), GoI',
    description: '14-digit alphanumeric ID based on geo-coordinates. Extended to 3D with building, floor, and unit segments.',
    status: 'Extended',
    color: '#22c55e',
    icon: Shield,
    features: ['Geo-coordinate Encoding', 'State-District-Zone Hierarchy', '3D Building/Floor/Unit Extension', 'ECCMA & OGC Aligned'],
  },
  {
    name: 'ILIMS Integration',
    org: 'National Land Records Modernization',
    description: 'Integration with Integrated Land Information Management System for unified land record access.',
    status: 'Designed',
    color: '#f43f5e',
    icon: Database,
    features: ['REST API Interface', 'GeoJSON / CityJSON Export', 'Real-time Sync Protocol', 'Aadhaar-linked Records'],
  },
];

const exportFormats = [
  { name: 'GeoJSON', ext: '.geojson', description: 'Standard geographic data format for 2D parcel boundaries' },
  { name: 'CityJSON', ext: '.cityjson', description: 'Lightweight 3D city model format (CityGML alternative)' },
  { name: 'IndoorGML', ext: '.gml', description: 'Indoor navigation and spatial data for floor/unit graphs' },
  { name: '3D Tiles', ext: '.b3dm', description: 'OGC 3D Tiles for streaming large-scale 3D datasets' },
  { name: 'glTF / GLB', ext: '.glb', description: '3D model interchange format for building geometries' },
  { name: 'KML', ext: '.kml', description: 'Google Earth compatible geographic markup' },
];

function StatusBadge({ status }) {
  const colors = {
    'Compliant': 'bg-accent-green/15 text-accent-green',
    'Partial': 'bg-accent-amber/15 text-accent-amber',
    'Extended': 'bg-accent-cyan/15 text-accent-cyan',
    'Designed': 'bg-accent-purple/15 text-accent-purple',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${colors[status] || 'bg-white/10 text-text-muted'}`}>
      {status}
    </span>
  );
}

export default function StandardsPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />

      <main className="pt-20 px-4 lg:px-8 pb-8 max-w-[1200px] mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mx-auto mb-3">
            <FileCode2 className="w-7 h-7 text-accent-cyan" />
          </div>
          <h1 className="text-xl font-bold gradient-text">Standards & Interoperability</h1>
          <p className="text-xs text-text-muted mt-1">OGC · ISO · DOLR · ECCMA Compliance Framework</p>
        </motion.div>

        {/* Standards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {standards.map((std, i) => {
            const Icon = std.icon;
            return (
              <motion.div
                key={std.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-2xl p-5 hover:glow-border transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: std.color + '15' }}>
                    <Icon className="w-5 h-5" style={{ color: std.color }} />
                  </div>
                  <StatusBadge status={std.status} />
                </div>

                <h3 className="text-sm font-bold text-text-primary mb-1">{std.name}</h3>
                <p className="text-[10px] text-accent-cyan font-medium mb-2">{std.org}</p>
                <p className="text-[11px] text-text-secondary leading-relaxed mb-3">{std.description}</p>

                <div className="space-y-1.5">
                  {std.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: std.color }} />
                      <span className="text-[10px] text-text-secondary">{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Data Export Formats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-accent-cyan" />
            <h2 className="text-sm font-bold text-text-primary">Supported Export Formats</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {exportFormats.map((fmt, i) => (
              <motion.div
                key={fmt.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="glass rounded-xl p-3 text-center hover:bg-white/5 transition-all cursor-pointer group"
              >
                <p className="text-xs font-bold text-text-primary mb-0.5">{fmt.name}</p>
                <p className="text-[9px] font-mono text-accent-cyan mb-1.5">{fmt.ext}</p>
                <p className="text-[9px] text-text-muted leading-relaxed">{fmt.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Architecture Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-sm font-bold text-text-primary mb-4">System Architecture — Interoperability Layer</h2>
          <div className="glass rounded-xl p-4 font-mono text-[10px] text-text-secondary space-y-2 overflow-x-auto">
            <pre className="whitespace-pre">{`
┌─────────────────────────────────────────────────────────────────┐
│                    3D ULPIN Cadastral Portal                    │
├──────────┬──────────┬──────────┬──────────┬─────────────────────┤
│  3D View │  Map View│ Dashboard│ ULPIN Gen│  AI/ML Engine       │
│ (Three.js)│(MapLibre)│(Recharts)│          │  (YOLOv8/SAM)      │
├──────────┴──────────┴──────────┴──────────┴─────────────────────┤
│                      API Gateway (Express.js)                   │
├─────────┬───────────┬───────────┬───────────┬───────────────────┤
│ Parcels │ Buildings │  ULPIN    │Validation │  Infrastructure   │
│   API   │   API     │   API     │   API     │      API          │
├─────────┴───────────┴───────────┴───────────┴───────────────────┤
│                  Interoperability Middleware                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ CityGML  │ │IndoorGML │ │  LADM    │ │ GeoJSON  │          │
│  │ Encoder  │ │ Encoder  │ │ Mapper   │ │ Serializer│         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
├─────────────────────────────────────────────────────────────────┤
│          PostGIS Database (with 3D Spatial Extensions)          │
│  ┌──────────────┐  ┌────────────┐  ┌─────────────────┐        │
│  │ ST_3DIntersects│ │ST_Contains │ │ST_3DDistance     │        │
│  └──────────────┘  └────────────┘  └─────────────────┘        │
├─────────────────────────────────────────────────────────────────┤
│               External Data Sources                             │
│  ┌─────────┐ ┌────────┐ ┌──────┐ ┌───────┐ ┌───────┐         │
│  │  Drone  │ │ LiDAR  │ │ DEM  │ │ CORS  │ │ ILIMS │         │
│  │ Imagery │ │ Points │ │ /DSM │ │ /GNSS │ │       │         │
│  └─────────┘ └────────┘ └──────┘ └───────┘ └───────┘         │
└─────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
