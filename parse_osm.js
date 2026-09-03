const fs = require('fs');

console.log('Processing JSON from osm_raw.json...');
try {
  const data = fs.readFileSync('osm_raw.json', 'utf8');
  const osm = JSON.parse(data);
  
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
        
        // Ensure polygon is closed
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
} catch (e) {
  console.error('Failed to parse Overpass response:', e.message);
}
