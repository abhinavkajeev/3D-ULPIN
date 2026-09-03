const fs = require('fs');
const readline = require('readline');
const path = require('path');

const inputFile = path.join(__dirname, '../data/3a5_buildings.csv');
const outputFile = path.join(__dirname, '../data/chennai_buildings.json');

// Chennai approximate bounding box
const minLat = 13.0;
const maxLat = 13.1;
const minLon = 80.15;
const maxLon = 80.25;

const TARGET_COUNT = 800; // Limit to 800 buildings for performance
const buildings = [];

const fileStream = fs.createReadStream(inputFile);

const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let isHeader = true;
let count = 0;

rl.on('line', (line) => {
  if (isHeader) {
    isHeader = false;
    return;
  }

  const latStr = line.split(',')[0];
  const lonStr = line.split(',')[1];
  
  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
    // Extract polygon string
    const polyMatch = line.match(/POLYGON\(\((.*?)\)\)/);
    if (polyMatch) {
      const coordString = polyMatch[1];
      // Convert "lon lat, lon lat" to [[lon, lat], [lon, lat]]
      const coords = coordString.split(',').map(pair => {
        const [plon, plat] = pair.trim().split(' ');
        return [parseFloat(plon), parseFloat(plat)];
      });
      
      buildings.push({
        lat,
        lon,
        area: parseFloat(line.split(',')[2]),
        coordinates: coords
      });
      count++;
      
      if (count % 100 === 0) console.log(`Found ${count} buildings...`);
      if (count >= TARGET_COUNT) {
        rl.close();
        fileStream.destroy();
      }
    }
  }
});

rl.on('close', () => {
  fs.writeFileSync(outputFile, JSON.stringify(buildings, null, 2));
  console.log(`Successfully extracted ${buildings.length} buildings to ${outputFile}`);
});
