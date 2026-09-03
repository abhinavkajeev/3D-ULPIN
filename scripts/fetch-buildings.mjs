// Use the main overpass-api.de with correct headers
const query = `[out:json][timeout:30];way["building"](13.038,80.228,13.046,80.240);out body geom;`;

console.log('Fetching from overpass-api.de...');
fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: `data=${encodeURIComponent(query)}`,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (building-fetcher)'
  }
})
.then(r => {
  console.log('Status:', r.status);
  console.log('Content-Type:', r.headers.get('content-type'));
  return r.text();
})
.then(text => {
  if (text.startsWith('{')) {
    const data = JSON.parse(text);
    console.log('elements:', data.elements.length);
    const fs = require('fs');
    fs.writeFileSync('d:/Projects/3d-ulpin/data/osm-buildings.json', JSON.stringify(data));
    console.log('saved!');
  } else {
    console.log('Response (first 500):', text.substring(0, 500));
  }
})
.catch(e => console.error('Error:', e));
