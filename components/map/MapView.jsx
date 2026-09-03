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
      zoom: 14,
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
    });
  }, [selectParcel]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
