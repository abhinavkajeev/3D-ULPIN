const fs = require('fs');
const Pbf = require('pbf');
const { VectorTile } = require('@mapbox/vector-tile');

async function test() {
  const apiKey = '3a3edcc685e54cc2a4e4afa2fb34aa2a';
  const url = `https://maps.geoapify.com/v1/tile/osm-carto/15/23689/15264.pbf?apiKey=${apiKey}`;
  
  console.log('Fetching vector tile:', url);
  const res = await fetch(url);
  if (!res.ok) {
    console.error('Failed to fetch:', res.status, await res.text());
    return;
  }
  
  const buffer = await res.arrayBuffer();
  const pbf = new Pbf(new Uint8Array(buffer));
  const tile = new VectorTile(pbf);
  
  console.log('Layers in tile:');
  for (const layerName in tile.layers) {
    console.log(`- ${layerName}: ${tile.layers[layerName].length} features`);
  }
  
  const buildingLayer = tile.layers['building'];
  if (buildingLayer) {
    console.log(`\nFound ${buildingLayer.length} buildings in this tile!`);
    const feature = buildingLayer.feature(0);
    console.log('First building properties:', feature.properties);
    console.log('First building geometry:', feature.loadGeometry());
  } else {
    console.log('No buildings found in this tile.');
  }
}

test();
