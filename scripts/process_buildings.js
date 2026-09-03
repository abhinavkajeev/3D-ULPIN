const fs = require('fs');

const data = JSON.parse(fs.readFileSync('data/osm_vadapalani_buildings.json', 'utf8'));

const nodes = {};
data.elements.filter(e => e.type === 'node').forEach(n => {
  nodes[n.id] = { lat: n.lat, lon: n.lon };
});

const ways = data.elements.filter(e => e.type === 'way');

const output = [];

ways.forEach(way => {
  const coords = [];
  let sumLat = 0;
  let sumLon = 0;
  
  way.nodes.forEach(nid => {
    const node = nodes[nid];
    if (node) {
      coords.push([node.lon, node.lat]);
      sumLat += node.lat;
      sumLon += node.lon;
    }
  });

  if (coords.length >= 3) {
    // Simple area approximation just so it has an area property
    const area = 1000;
    
    output.push({
      lat: sumLat / way.nodes.length,
      lon: sumLon / way.nodes.length,
      area: area,
      coordinates: coords
    });
  }
});

fs.writeFileSync('data/chennai_osm_buildings.json', JSON.stringify(output, null, 2));
console.log('Successfully processed ' + output.length + ' buildings into data/chennai_osm_buildings.json!');
