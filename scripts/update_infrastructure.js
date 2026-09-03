const fs = require('fs');

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

function project(lon, lat) {
  const x = lonToX(lon) - originX;
  const z = -(latToY(lat) - originZ);
  return { x, z };
}

// 1. Process Metro Data
const metroData = JSON.parse(fs.readFileSync('data/osm_vadapalani_metro.json', 'utf8'));

const nodes = {};
metroData.elements.filter(e => e.type === 'node').forEach(n => {
  nodes[n.id] = { lat: n.lat, lon: n.lon };
});

const ways = metroData.elements.filter(e => e.type === 'way');

const paths = [];

ways.forEach(way => {
  const path = [];
  way.nodes.forEach(nid => {
    const node = nodes[nid];
    if (node) {
      path.push(project(node.lon, node.lat));
    }
  });
  if (path.length > 1) {
    paths.push(path);
  }
});

let infrastructureContent = `// Underground and elevated infrastructure mock data
export const infrastructure = {
  roads: [],
  waterPipelines: [
    {
      id: 'UTIL-CHN-WATER-001',
      type: 'water',
      name: 'Vadapalani Main Water Line',
      depth: -3.5,
      diameter: 0.6,
      length: 1000,
      color: '#3b82f6',
      path: [
        { x: -500, z: -200 },
        { x: 500, z: 200 }
      ],
      status: 'active',
      installedYear: 2015,
    }
  ],
  sewerLines: [],
  electricalLines: [],
  gasLines: [],
  elevatedStructures: [
`;

paths.forEach((path, i) => {
  infrastructureContent += `
    {
      id: 'ELEV-CHN-METRO-${i}',
      type: 'metro',
      name: 'Chennai Metro Green Line',
      elevation: 14.0,
      width: 8,
      color: '#00d4ff',
      path: ${JSON.stringify(path, null, 2).replace(/"/g, '')},
      stations: [],
    },`;
});

infrastructureContent += `
  ],
  airRights: [
    {
      id: 'AIR-CHN-001',
      name: 'Vadapalani Metro Airspace',
      type: 'transit-corridor',
      elevationMin: 10.0,
      elevationMax: 18.0,
      bounds: { x: 0, z: 0, width: 15, depth: 15 },
      status: 'allocated',
    }
  ],
};

export function getAllUtilities() {
  return [
    ...infrastructure.waterPipelines,
    ...infrastructure.sewerLines,
    ...infrastructure.electricalLines,
    ...infrastructure.gasLines,
  ];
}

export function getElevatedStructures() {
  return infrastructure.elevatedStructures;
}

export function getAirRights() {
  return infrastructure.airRights;
}
`;

fs.writeFileSync('data/infrastructure.js', infrastructureContent);
console.log('Successfully updated data/infrastructure.js with real OSM metro paths!');
