const fs = require('fs');
const path = require('path');

const inputPath = 'C:\\Users\\bsanj\\Downloads\\osm_buildings.geojson';
const outputPath = 'd:\\Projects\\3d-ulpin\\data\\chennai_buildings.json';

console.log('Reading GeoJSON file from Downloads...');
try {
  const data = fs.readFileSync(inputPath, 'utf8');
  const geojson = JSON.parse(data);
  
  if (!geojson.features) {
    throw new Error('Not a valid GeoJSON FeatureCollection');
  }

  const buildings = [];
  
  geojson.features.forEach(feature => {
    if (feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
      // Extract the outer ring of the polygon
      const coords = feature.geometry.type === 'Polygon' 
        ? feature.geometry.coordinates[0] 
        : feature.geometry.coordinates[0][0]; // For MultiPolygon, take the first polygon's outer ring
        
      if (coords && coords.length >= 3) {
        let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
        
        coords.forEach(coord => {
          minLon = Math.min(minLon, coord[0]);
          maxLon = Math.max(maxLon, coord[0]);
          minLat = Math.min(minLat, coord[1]);
          maxLat = Math.max(maxLat, coord[1]);
        });
        
        const centerLat = (minLat + maxLat) / 2;
        const centerLon = (minLon + maxLon) / 2;
        
        // Rough area in square meters
        const width = (maxLon - minLon) * 111320 * Math.cos(centerLat * Math.PI / 180);
        const height = (maxLat - minLat) * 111320;
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
  
  console.log(`Extracted ${buildings.length} building polygons from GeoJSON.`);
  
  fs.writeFileSync(outputPath, JSON.stringify(buildings, null, 2));
  console.log('Successfully saved to data/chennai_buildings.json');
} catch (e) {
  console.error('Failed to parse GeoJSON:', e.message);
}
