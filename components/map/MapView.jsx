'use client';

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import { setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { parcels } from '@/data/parcels';
import useStore from '@/stores/useStore';

// Fix MapLibre worker: serve .js (not .mjs) so Next.js sends correct MIME type
setWorkerUrl('/maplibre-gl-worker.js');

export default function MapView() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const { selectParcel } = useStore();

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
      center: [80.2341, 13.0418], // Chennai T. Nagar
      zoom: 16.5,
      pitch: 60,
      bearing: -20,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      const geojson = {
        type: 'FeatureCollection',
        features: parcels.map((parcel) => ({
          type: 'Feature',
          properties: {
            id: parcel.id,
            surveyNumber: parcel.surveyNumber,
            zoneName: parcel.zoneName,
            owner: parcel.owner,
            area: parcel.area,
            status: parcel.status,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [parcel.polygon],
          },
        })),
      };

      map.current.addSource('parcels-source', {
        type: 'geojson',
        data: geojson,
      });

      map.current.addLayer({
        id: 'parcels-fill',
        type: 'fill',
        source: 'parcels-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'status'],
            'verified', '#00d4ff',
            'pending', '#f59e0b',
            'disputed', '#f43f5e',
            '#00d4ff',
          ],
          'fill-opacity': 0.35,
        },
      });

      map.current.addLayer({
        id: 'parcels-outline',
        type: 'line',
        source: 'parcels-source',
        paint: {
          'line-color': '#00d4ff',
          'line-width': 2,
        },
      });

      map.current.on('click', 'parcels-fill', (e) => {
        const feature = e.features[0];
        const parcel = parcels.find((p) => p.id === feature.properties.id);
        if (parcel) {
          selectParcel(parcel);
        }
      });

      map.current.on('mouseenter', 'parcels-fill', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });

      map.current.on('mouseleave', 'parcels-fill', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });

      // Fetch and render 3D buildings from backend
      const loadBuildings = async () => {
        try {
          const res = await fetch('http://localhost:4000/api/v1/buildings');
          const data = await res.json();
          
          const buildingsGeojson = {
            type: 'FeatureCollection',
            features: data.buildings
              .filter(b => b.footprint) // Only buildings with polygons
              .map(b => ({
                type: 'Feature',
                properties: {
                  id: b.id,
                  name: b.name,
                  type: b.type,
                  height: b.height || (b.floors * 3.5),
                  color: b.type === 'residential' ? '#3b82f6' : (b.type === 'commercial' ? '#a855f7' : '#22c55e')
                },
                geometry: b.footprint
              }))
          };

          map.current.addSource('buildings-source', {
            type: 'geojson',
            data: buildingsGeojson
          });

          map.current.addLayer({
            id: 'buildings-3d',
            type: 'fill-extrusion',
            source: 'buildings-source',
            paint: {
              'fill-extrusion-color': ['get', 'color'],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.85
            }
          });
          
          // Optional: Add hover/click for buildings
          map.current.on('mouseenter', 'buildings-3d', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer';
          });
          map.current.on('mouseleave', 'buildings-3d', () => {
            if (map.current) map.current.getCanvas().style.cursor = '';
          });
        } catch (err) {
          console.error("Failed to load 3D buildings:", err);
        }
      };

      loadBuildings();
    });
  }, [selectParcel]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
