const fs = require('fs');
const data = require('./data/chennai_osm_buildings.json');

const originLon = 80.20;
const originLat = 13.05;
const R = 6378137;

function lonToX(lon) {
  return lon * (Math.PI / 180) * R;
}

function latToY(lat) {
  return Math.log(Math.tan((Math.PI / 4) + (lat * (Math.PI / 180)) / 2)) * R;
}

const originX = lonToX(originLon);
const originZ = latToY(originLat);

const withDistance = data.map(b => {
  const dx = lonToX(b.lon) - originX;
  const dz = latToY(b.lat) - originZ;
  return { ...b, distSq: dx * dx + dz * dz, dx, dz };
});

const nearest200 = withDistance.sort((a, b) => a.distSq - b.distSq).slice(0, 200);

let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
nearest200.forEach(b => {
  b.coordinates.forEach(c => {
    const x = lonToX(c[0]) - originX;
    const z = latToY(c[1]) - originZ;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  });
});

const width = 800;
const height = 800;
const scale = Math.min(width / (maxX - minX), height / (maxZ - minZ)) * 0.9;
const offsetX = width / 2 - ((minX + maxX) / 2) * scale;
const offsetZ = height / 2 - ((minZ + maxZ) / 2) * scale;

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">\n`;
svg += `<rect width="100%" height="100%" fill="white" />\n`;

nearest200.forEach(b => {
  let pts = b.coordinates.map(c => {
    const x = lonToX(c[0]) - originX;
    const z = latToY(c[1]) - originZ;
    return `${x * scale + offsetX},${height - (z * scale + offsetZ)}`;
  }).join(' ');
  svg += `<polygon points="${pts}" fill="rgba(0,0,0,0.5)" stroke="black" stroke-width="1" />\n`;
});

svg += `</svg>`;

fs.writeFileSync('C:\\Users\\bsanj\\.gemini\\antigravity-ide\\brain\\b54f0778-c9f9-48fe-a7ab-ee17cd9216d3\\test_buildings.svg', svg);
console.log('SVG generated');
