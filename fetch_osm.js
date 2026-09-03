const fs = require('fs');

const minLat = 13.04;
const maxLat = 13.06;
const minLon = 80.19;
const maxLon = 80.21;

const query = `[out:json];way["building"](${minLat},${minLon},${maxLat},${maxLon});(._;>;);out body;`;
const url = 'https://overpass.kumi.systems/api/interpreter';

console.log('Fetching from Overpass API (this may take up to 30 seconds)...');

async function main() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      body: query
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }
    
    const osm = await res.json();
    console.log('Download complete, processing JSON...');
    
    // Map node IDs to coordinates
    const nodes = new Map();
    osm.elements.forEach(el => {
      if (el.type === 'node') {
        nodes.set(el.id, [el.lon, el.lat]);
      }
    });
    
    // Extract ways
    const buildings = [];
    osm.elements.forEach(el => {
      if (el.type === 'way' && el.tags && el.tags.building) {
        const coords = [];
        let valid = true;
        
        let bMinLon = 180, bMaxLon = -180, bMinLat = 90, bMaxLat = -90;
        
        el.nodes.forEach(nodeId => {
          const coord = nodes.get(nodeId);
          if (coord) {
            coords.push(coord);
            bMinLon = Math.min(bMinLon, coord[0]);
            bMaxLon = Math.max(bMaxLon, coord[0]);
            bMinLat = Math.min(bMinLat, coord[1]);
            bMaxLat = Math.max(bMaxLat, coord[1]);
          } else {
            valid = false;
          }
        });
        
        if (valid && coords.length >= 3) {
          const centerLat = (bMinLat + bMaxLat) / 2;
          const centerLon = (bMinLon + bMaxLon) / 2;
          
          const width = (bMaxLon - bMinLon) * 111320 * Math.cos(centerLat * Math.PI / 180);
          const height = (bMaxLat - bMinLat) * 111320;
          const area = width * height;
          
          if (coords[0][0] !== coords[coords.length-1][0] || coords[0][1] !== coords[coords.length-1][1]) {
            coords.push(coords[0]);
          }
          
          buildings.push({
            lat: centerLat,
            lon: centerLon,
            area: area,
            coordinates: coords
          });
        }
      }
    });
    
    console.log(`Extracted ${buildings.length} real buildings.`);
    fs.writeFileSync('data/chennai_buildings.json', JSON.stringify(buildings, null, 2));
    console.log('Successfully saved to data/chennai_buildings.json');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
