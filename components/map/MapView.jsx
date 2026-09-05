'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { parcels } from '@/data/parcels';
import buildingsData from '@/data/chennai_osm_buildings.json';
import { infrastructure } from '@/data/infrastructure';
import { zones } from '@/data/zones';
import useStore from '@/stores/useStore';

// Fix MapLibre worker for Next.js
setWorkerUrl('/maplibre-gl-worker.js');

const originLon = 80.208;
const originLat = 13.051;
const R = 6378137;

function lonToX(lon) {
  return lon * (Math.PI / 180) * R;
}
function latToY(lat) {
  return Math.log(Math.tan((Math.PI / 4) + (lat * (Math.PI / 180)) / 2)) * R;
}
const originX = lonToX(originLon);
const originZ = latToY(originLat);

function unproject(x, z) {
  const worldX = x + originX;
  const lon = (worldX / R) * (180 / Math.PI);
  const worldY = originZ - z;
  const lat = (2 * Math.atan(Math.exp(worldY / R)) - Math.PI / 2) * (180 / Math.PI);
  return [lon, lat];
}

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const isLoaded = useRef(false);
  const { layers, selectParcel, selectBuilding, setRightPanel } = useStore();

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || "3a3edcc685e54cc2a4e4afa2fb34aa2a"}`
            ],
            tileSize: 256,
            maxzoom: 19,
            attribution: '&copy; OpenStreetMap contributors | Geoapify',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [80.2081, 13.0511], // Vadapalani, Chennai center
      zoom: 15,
      pitch: 35,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      isLoaded.current = true;

      // ── 1. Property Parcels ──
      map.current.addSource('parcels-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: parcels.map((parcel) => ({
            type: 'Feature',
            properties: { ...parcel },
            geometry: { type: 'Polygon', coordinates: [parcel.polygon] },
          })),
        },
      });

      map.current.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels-source',
        layout: { visibility: layers.parcels ? 'visible' : 'none' },
        paint: {
          'fill-color': [
            'match', ['get', 'status'],
            'verified', '#00d4ff',
            'pending', '#f59e0b',
            'disputed', '#f43f5e',
            '#00d4ff',
          ],
          'fill-opacity': 0.3,
        },
      });

      map.current.addLayer({
        id: 'parcels-outline',
        type: 'line',
        source: 'parcels-source',
        layout: { visibility: layers.parcels ? 'visible' : 'none' },
        paint: { 'line-color': '#00d4ff', 'line-width': 2 },
      });

      // ── 2. Buildings ──
      const buildingFeatures = buildingsData.slice(0, 600).map((b, idx) => ({
        type: 'Feature',
        properties: {
          id: `BLDG-${idx}`,
          name: b.name || `Building ${idx + 1}`,
          height: b.levels ? b.levels * 3.5 : 12,
          floors: b.levels || 3,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [b.coordinates],
        },
      }));

      map.current.addSource('buildings-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: buildingFeatures },
      });

      map.current.addLayer({
        id: 'buildings-fill',
        type: 'fill-extrusion',
        source: 'buildings-source',
        layout: { visibility: layers.buildings ? 'visible' : 'none' },
        paint: {
          'fill-extrusion-color': '#a855f7',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.7,
        },
      });

      // ── 3. Roads ──
      const roadFeatures = [
        // Arcot Road Main Transit Line
        {
          type: 'Feature',
          properties: { name: 'Arcot Road' },
          geometry: {
            type: 'LineString',
            coordinates: [[80.200, 13.050], [80.208, 13.051], [80.216, 13.052], [80.222, 13.053]],
          },
        },
        // Jawaharlal Nehru Road (100 Feet Rd)
        {
          type: 'Feature',
          properties: { name: '100 Feet Road' },
          geometry: {
            type: 'LineString',
            coordinates: [[80.208, 13.042], [80.208, 13.051], [80.208, 13.060]],
          },
        },
      ];

      map.current.addSource('roads-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: roadFeatures },
      });

      map.current.addLayer({
        id: 'roads-line',
        type: 'line',
        source: 'roads-source',
        layout: { visibility: layers.roads ? 'visible' : 'none' },
        paint: { 'line-color': '#94a3b8', 'line-width': 5 },
      });

      // ── 4. Admin Boundaries ──
      const adminFeatures = zones.map(z => ({
        type: 'Feature',
        properties: { name: z.name, ward: z.ward },
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [z.center.lon - 0.004, z.center.lat - 0.003],
            [z.center.lon + 0.004, z.center.lat - 0.003],
            [z.center.lon + 0.004, z.center.lat + 0.003],
            [z.center.lon - 0.004, z.center.lat + 0.003],
            [z.center.lon - 0.004, z.center.lat - 0.003],
          ]],
        },
      }));

      map.current.addSource('admin-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: adminFeatures },
      });

      map.current.addLayer({
        id: 'admin-boundaries-fill',
        type: 'fill',
        source: 'admin-source',
        layout: { visibility: layers.adminBoundaries ? 'visible' : 'none' },
        paint: { 'fill-color': '#f59e0b', 'fill-opacity': 0.08 },
      });

      map.current.addLayer({
        id: 'admin-boundaries-line',
        type: 'line',
        source: 'admin-source',
        layout: { visibility: layers.adminBoundaries ? 'visible' : 'none' },
        paint: { 'line-color': '#f59e0b', 'line-width': 2, 'line-dasharray': [3, 2] },
      });

      // ── 5. Elevated Structures (Metro / Flyovers) ──
      const elevatedFeatures = (infrastructure.elevatedStructures || []).map(struct => ({
        type: 'Feature',
        properties: { name: struct.name, type: struct.type },
        geometry: {
          type: 'LineString',
          coordinates: struct.path.map(pt => unproject(pt.x, pt.z)),
        },
      }));

      map.current.addSource('elevated-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: elevatedFeatures },
      });

      map.current.addLayer({
        id: 'elevated-structures-line',
        type: 'line',
        source: 'elevated-source',
        layout: { visibility: layers.elevatedStructures ? 'visible' : 'none' },
        paint: { 'line-color': '#0284c7', 'line-width': 6 },
      });

      // ── 6. Air Rights ──
      const airRightsFeatures = (infrastructure.airRights || []).map(ar => {
        const [lon, lat] = unproject(ar.bounds.x, ar.bounds.z);
        const w = 0.001;
        const h = 0.001;
        return {
          type: 'Feature',
          properties: { name: ar.name },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [lon - w, lat - h],
              [lon + w, lat - h],
              [lon + w, lat + h],
              [lon - w, lat + h],
              [lon - w, lat - h],
            ]],
          },
        };
      });

      map.current.addSource('air-rights-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: airRightsFeatures },
      });

      map.current.addLayer({
        id: 'air-rights-fill',
        type: 'fill',
        source: 'air-rights-source',
        layout: { visibility: layers.airRights ? 'visible' : 'none' },
        paint: { 'fill-color': '#a855f7', 'fill-opacity': 0.25 },
      });

      map.current.addLayer({
        id: 'air-rights-outline',
        type: 'line',
        source: 'air-rights-source',
        layout: { visibility: layers.airRights ? 'visible' : 'none' },
        paint: { 'line-color': '#a855f7', 'line-width': 2 },
      });

      // ── 7. Floor Boundaries ──
      const floorBoundaryFeatures = buildingFeatures.slice(0, 50).map(b => ({
        type: 'Feature',
        properties: { name: b.properties.name },
        geometry: b.geometry,
      }));

      map.current.addSource('floor-boundaries-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: floorBoundaryFeatures },
      });

      map.current.addLayer({
        id: 'floor-boundaries-line',
        type: 'line',
        source: 'floor-boundaries-source',
        layout: { visibility: layers.floorBoundaries ? 'visible' : 'none' },
        paint: { 'line-color': '#14b8a6', 'line-width': 2, 'line-dasharray': [2, 2] },
      });

      // ── 8. Underground Utilities (Water, Sewer, Electricity, Gas) ──
      const createUtilitySource = (pipeArray) => ({
        type: 'FeatureCollection',
        features: (pipeArray || []).map(pipe => ({
          type: 'Feature',
          properties: { name: pipe.name, depth: pipe.depth },
          geometry: {
            type: 'LineString',
            coordinates: pipe.path.map(pt => unproject(pt.x, pt.z)),
          },
        })),
      });

      // Water
      map.current.addSource('water-source', { type: 'geojson', data: createUtilitySource(infrastructure.waterPipelines) });
      map.current.addLayer({
        id: 'water-pipes-line',
        type: 'line',
        source: 'water-source',
        layout: { visibility: layers.waterPipelines ? 'visible' : 'none' },
        paint: { 'line-color': '#0ea5e9', 'line-width': 4 },
      });

      // Sewer
      map.current.addSource('sewer-source', { type: 'geojson', data: createUtilitySource(infrastructure.sewerLines) });
      map.current.addLayer({
        id: 'sewer-lines-line',
        type: 'line',
        source: 'sewer-source',
        layout: { visibility: layers.sewerLines ? 'visible' : 'none' },
        paint: { 'line-color': '#22c55e', 'line-width': 4 },
      });

      // Electricity
      map.current.addSource('electrical-source', { type: 'geojson', data: createUtilitySource(infrastructure.electricalLines) });
      map.current.addLayer({
        id: 'electrical-lines-line',
        type: 'line',
        source: 'electrical-source',
        layout: { visibility: layers.electricalLines ? 'visible' : 'none' },
        paint: { 'line-color': '#facc15', 'line-width': 3 },
      });

      // Gas
      map.current.addSource('gas-source', { type: 'geojson', data: createUtilitySource(infrastructure.gasLines) });
      map.current.addLayer({
        id: 'gas-lines-line',
        type: 'line',
        source: 'gas-source',
        layout: { visibility: layers.gasLines ? 'visible' : 'none' },
        paint: { 'line-color': '#f87171', 'line-width': 4 },
      });

      // ── Event Handlers ──
      map.current.on('click', 'parcels-fill', (e) => {
        const feature = e.features[0];
        const parcel = parcels.find((p) => p.id === feature.properties.id);
        if (parcel) selectParcel(parcel);
      });

      map.current.on('click', 'buildings-fill', (e) => {
        const feature = e.features[0];
        const bldg = buildingFeatures.find(b => b.properties.id === feature.properties.id);
        if (bldg) {
          selectBuilding({ ...bldg.properties, polygon: bldg.geometry.coordinates[0] });
          setRightPanel('building');
        }
      });

      ['parcels-fill', 'buildings-fill'].forEach(layerId => {
        map.current.on('mouseenter', layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });
        map.current.on('mouseleave', layerId, () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      });
    });
  }, [selectParcel, selectBuilding, setRightPanel]);

  // Reactive layer visibility updates when `layers` state changes
  useEffect(() => {
    if (!map.current || !isLoaded.current) return;

    const layerMap = {
      'parcels-fill': layers.parcels,
      'parcels-outline': layers.parcels,
      'buildings-fill': layers.buildings,
      'roads-line': layers.roads,
      'admin-boundaries-fill': layers.adminBoundaries,
      'admin-boundaries-line': layers.adminBoundaries,
      'elevated-structures-line': layers.elevatedStructures,
      'air-rights-fill': layers.airRights,
      'air-rights-outline': layers.airRights,
      'floor-boundaries-line': layers.floorBoundaries,
      'water-pipes-line': layers.waterPipelines,
      'sewer-lines-line': layers.sewerLines,
      'electrical-lines-line': layers.electricalLines,
      'gas-lines-line': layers.gasLines,
    };

    Object.entries(layerMap).forEach(([layerId, isVisible]) => {
      if (map.current.getLayer(layerId)) {
        map.current.setLayoutProperty(layerId, 'visibility', isVisible ? 'visible' : 'none');
      }
    });
  }, [layers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
