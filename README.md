# 🌐 3D ULPIN: Intelligent 3D Cadastral Information System

[![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-r170+-049ef4?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-PostGIS-336791?style=for-the-badge&logo=postgresql)](https://postgis.net/)
[![FastAPI](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![SIH](https://img.shields.io/badge/Smart%20India%20Hackathon-2024%2F2026-orange?style=for-the-badge)](https://sih.gov.in/)

> **A Next-Generation WebGL-Powered 3D Cadastral Digital Twin for Real Property, Subterranean Utilities, and Multi-Level Strata Land Rights based on the Indian ULPIN (Bhu-Aadhaar) Standard.**

---

## 📌 Executive Overview

Traditional 2D cadastral systems represent land parcels as flat polygons, failing to address vertical property ownership, underground municipal utility corridors, and multi-tier elevated transit networks. 

**3D ULPIN** extends the Indian government's **Unique Land Parcel Identification Number (ULPIN / Bhu-Aadhaar)** into volumetric 3D spatial space $(X, Y, Z, \Delta t)$. Developed for the **Vadapalani municipal zone in Chennai**, this platform integrates real surveyed land parcel boundaries, 12,000+ building footprints, multi-tier transit corridors (Vadapalani Grade Separator + Chennai Metro Line 2), and deep 3D subterranean utility pipelines into a responsive, real-time spatial digital twin.

---

## ✨ Key Capabilities & Architectural Highlights

### 🏙️ 1. Volumetric 3D Cadastre & Exploded-Floor Inspection
- **Vertical Property Boundaries**: Explodes multi-story commercial and residential towers into individual vertical cadastre levels with smooth spring physics.
- **Dynamic Floor Highlighting**: Individual floor boundaries light up with responsive emissive cyan glows (`#00d4ff`) along with floating status badges (`★ FLOOR X (SELECTED)`).
- **Sub-Parcel Unit Attribution**: Unit-level cadastre linking area, height, market valuation, registration deed date, ownership category, and dispute status.

### 🚇 2. Multi-Level Air Rights & Transit Infrastructure
- **Vadapalani Grade Separator**: High-precision 3D elevated flyover at **+8.5m** with roadway curbs, lane markings, and reinforced concrete pier bents.
- **Chennai Metro Viaduct (Line 2)**: Elevated rail transit track at **+16.5m** with overhead catenary clearances, platform envelopes, and structural pylons.
- **Phase 2 Yellow Line Transit Corridor**: Double-decker multi-tier viaduct modeled at **+21.0m** elevation.

### 🚰 3. Subterranean Municipal Utility Corridors
- Volumetric 3D cylindrical pipelines modeled along real surveyed road alignments with true depth profiles:
  - 🔵 **Water Pipelines** (CMWSSB): High-pressure mains at $-3.2\text{m}$ depth ($Ø\,3.0\text{m}$)
  - 🟢 **Sewerage & Drainage** (Metrowater): Gravity sewer collectors at $-4.5\text{m}$ depth ($Ø\,3.5\text{m}$)
  - 🟡 **Underground Electrical** (TANGEDCO): High-voltage power conduits at $-1.8\text{m}$ depth ($Ø\,2.2\text{m}$)
  - 🔴 **Natural Gas Distribution** (Torrent Gas): High-strength transmission pipelines at $-2.2\text{m}$ depth ($Ø\,2.8\text{m}$)
- **Inspection Nodes & Manholes**: Volumetric spherical joint collars placed at surveyed network junctions.
- **Depth Transparency Mode**: Ground satellite imagery shifts to semi-transparent ($35\%$ opacity) without GPU Z-fighting when inspecting subsurface utilities.

### 🔍 4. Standardized 3D ULPIN Code Resolution & Search
- Generates and searches standardized 3D cadastre identifiers according to national standards:
  ```text
  TN-CHN-VAD-TS1082-B01-F04-U402
   │   │   │     │    │   │    └─ Unit 402
   │   │   │     │    │   └────── Floor 4 (+16.0m Elevation)
   │   │   │     │    └────────── Nexus Retail Wing (Building 01)
   │   │   │     └─────────────── Survey Plot TS-108/2 (Cadastral Parcel)
   │   │   └───────────────────── Vadapalani Administrative Zone
   │   └───────────────────────── Chennai District
   └───────────────────────────── State of Tamil Nadu
  ```
- **Camera Fly-To Navigation**: Direct search resolution zooms the 3D viewport straight to the targeted building, activates exploded vertical view, and highlights the corresponding floor.

### 🕹️ 5. Ergonomic 3D Navigation & Drag Mode Controls
- **Dual Drag Modes**: Top-bar toggle switch to swap between:
  - 🔵 **Move Map**: Left-click drag pans and translates across the city without changing angle.
  - 🟣 **Rotate Angle**: Left-click drag tilts and orbits around buildings and landmarks.
- **Full Tilt Range**: Unlocked vertical angle range ($0.1\text{ rad}$ to $0.85\pi\text{ rad}$) for street-level to bird's-eye views.

---

## 🛠️ Technology Stack

| Layer | Technologies & Frameworks |
|---|---|
| **Frontend Framework** | [Next.js 16 (App Router)](https://nextjs.org/), React 19, Turbopack |
| **3D Graphics Engine** | [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei) |
| **2D GIS & Cartography** | [MapLibre GL JS](https://maplibre.org/), Geoapify Tile API (EPSG:3857) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) with atomic state selectors |
| **Spatial Database** | [PostgreSQL](https://www.postgresql.org/) + [PostGIS 3.4](https://postgis.net/) (Dockerized) |
| **Backend API** | Node.js, Express, pg-promise |
| **UI & Motion** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Data Sources** | OpenStreetMap Overpass API, Chennai Corporation Cadastral Data |

---

## 📁 Repository Architecture

```text
3d-ulpin/
├── app/
│   ├── page.js                 # Primary 3D Viewer & Split-Map Page
│   ├── dashboard/              # Cadastral Analytics & Property Registry Dashboard
│   ├── ulpin/                  # 4-Step 3D ULPIN Generator Wizard
│   ├── validation/             # Spatial Topology & Encroachment Validator
│   ├── ai-engine/              # AI Property Risk & Valuation Engine
│   └── standards/              # OGC LandInfra & National ULPIN Technical Docs
├── backend/
│   ├── src/
│   │   ├── db/                 # PostGIS schema, spatial migrations & seed data
│   │   ├── routes/             # REST APIs (parcels, buildings, utilities, ULPIN)
│   │   └── server.js           # Express API server entry point
│   └── package.json
├── components/
│   ├── viewer3d/
│   │   ├── CityScene.jsx       # Canvas, OrbitControls & Dynamic Camera Controller
│   │   ├── ProceduralCity.jsx  # Batched city mesh & EPSG:3857 projection engine
│   │   ├── ProceduralBuilding.jsx # 3D extrusion, hover and selection shaders
│   │   ├── ProceduralFloor.jsx # Exploded-view vertical floors & glowing emissive mesh
│   │   ├── Underground.jsx     # Subterranean 3D utility pipelines & manholes
│   │   └── AirRights.jsx       # Vadapalani flyover & elevated Metro viaducts
│   ├── layout/
│   │   ├── Header.jsx          # ULPIN search, role switcher, navigation
│   │   └── Sidebar.jsx         # 15+ GIS & utility layer toggle controls
│   └── panels/                 # Building, Floor & Unit Property Inspector panels
├── data/
│   ├── parcels.js              # Surveyed Vadapalani parcels (Nexus Mall, Greenpark, SIMS)
│   ├── buildings.js            # Landmark structures & unit configurations
│   ├── infrastructure.js       # Real metro, flyover & subterranean utility paths
│   └── chennai_osm_buildings.json # 12,000+ real OSM building footprints
└── stores/
    └── useStore.js             # Global Zustand cadastre state management
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js**: v18.0 or later
- **npm** or **yarn**
- **Docker** (Optional, for local PostGIS database)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/abhinavkajeev/3D-ULPIN.git
cd 3D-ULPIN

# Install Frontend dependencies
npm install

# Install Backend dependencies
cd backend && npm install && cd ..
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_GEOAPIFY_API_KEY=3a3edcc685e54cc2a4e4afa2fb34aa2a
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

### 3. Launch Development Server
```bash
# Start Next.js frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Optional)* Run the PostGIS backend:
```bash
cd backend
npm run dev
```

---

## 🗺️ Demonstration Workflow

1. **Explore the 3D City**:
   - Use the **Move Map** and **Rotate Angle** buttons in the top navigation bar to pan and tilt.
   - Use **Scroll Wheel** to zoom seamlessly into individual buildings.
2. **Inspect Subterranean Corridors**:
   - In the left sidebar under *Underground Utilities*, toggle on **Water Pipeline**, **Sewer / Drainage**, **Electricity**, or **Gas Pipeline**.
   - Ground satellite tiles automatically become transparent, revealing the multi-level underground pipelines with depth markers.
3. **Generate a 3D ULPIN**:
   - Navigate to the **ULPIN Generator** (`/ulpin`).
   - Select a surveyed Vadapalani parcel (e.g., *Nexus Vijaya Mall* $\rightarrow$ *Main Retail Wing* $\rightarrow$ *Floor 4* $\rightarrow$ *Unit 402*).
   - Generate your unique digital cadastre certificate.
4. **Locate & Explode in 3D**:
   - Copy the generated ULPIN: `TN-CHN-VAD-TS1082-B01-F04-U402`.
   - Switch back to **3D Viewer** (`/`), paste the code into the search bar, and select it.
   - The camera will automatically fly down to the building, explode the floors vertically, and illuminate Floor 4 with cyan glow!

---

## 📜 Standards & Compliance

- **ULPIN (Bhu-Aadhaar)**: Aligned with the Department of Land Resources (DoLR), Ministry of Rural Development, Government of India.
- **OGC LandInfra / InfraGML**: Incorporates ISO 19152 Land Administration Domain Model (LADM) recommendations for 3D/4D spatial units.
- **EPSG:3857 / EPSG:4326**: Precise geographic-to-cartesian projection alignment with OpenStreetMap.

---

## 👤 Author

**Abhinav KA**  
- GitHub: [@abhinavkajeev](https://github.com/abhinavkajeev)
- Repository: [https://github.com/abhinavkajeev/3D-ULPIN](https://github.com/abhinavkajeev/3D-ULPIN)

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
