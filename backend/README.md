# 3D Cadastre Backend Service (Node.js + Express + PostGIS)

> **Status:** Architecture placeholder only. The frontend is fully implemented with simulated client-side logic.

## Architecture

```
backend/
├── package.json
├── src/
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   └── database.js        # PostgreSQL / PostGIS connection
│   ├── models/
│   │   ├── Parcel.js          # 2D spatial parcel model
│   │   ├── Building.js        # 3D building model
│   │   ├── Floor.js           # Floor level spatial model
│   │   ├── Unit.js            # 3D volumetric unit model
│   │   └── ULPIN.js           # ULPIN registry schema
│   ├── routes/
│   │   ├── parcels.js         # GeoJSON API routes
│   │   ├── buildings.js       # 3D tile / model routes
│   │   ├── ulpin.js           # ULPIN encoding API
│   │   └── validation.js      # PostGIS spatial validation API
│   └── services/
│       ├── ulpinService.js    # Spatial ULPIN encoding algorithm
│       └── validationService.js # Topology validation queries
```

## Intended API Endpoints

- `GET /api/v1/parcels` — Fetch parcel GeoJSON features
- `GET /api/v1/buildings/:id` — Fetch 3D building geometry + metadata
- `POST /api/v1/ulpin/generate` — Generate 3D ULPIN for given volumetric bounding box
- `POST /api/v1/validation/check` — Run PostGIS `ST_3DIntersects` and `ST_Overlaps`
