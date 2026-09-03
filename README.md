# 3D ULPIN GIS Cadastral Mapping System

A highly interactive, web-based 3D Geographic Information System (GIS) designed to visualize, manage, and analyze property data using the ULPIN (Unique Land Parcel Identification Number) framework. This platform merges real-world open map data with procedurally generated architectural details to create a fully explorable digital twin of city parcels.

## 🌟 Key Features

*   **Procedural 3D City Generation:** Dynamically extrudes real OpenStreetMap (OSM) building footprints into 3D geometries based on their geographic area and footprint shape.
*   **True Web Mercator Alignment:** Employs precise EPSG:3857 coordinate projection math to perfectly align 3D architectural shapes over 2D slippy map tiles (Geoapify).
*   **Deep Property Granularity:** Procedurally divides buildings into floors, and floors into individual units (apartments, commercial spaces). Each unit is assigned a mock ULPIN, owner, elevation, market value, and validation status.
*   **Interactive Viewing Modes:**
    *   **3D View:** A rich WebGL environment with realistic lighting, shadows, and camera controls.
    *   **Map View:** A fast 2D vector/raster map interface for traditional cadastral viewing.
    *   **Split View:** Side-by-side comparative viewing.
*   **Government Dashboard:** An analytics center built with Recharts to display real-time insights on registered properties, validation statuses, zone distribution, and recent cadastral activities.
*   **Contextual UI Panels:** Dynamic sidebars powered by Framer Motion that react to your clicks, displaying detailed Building, Floor, and Unit information, as well as digital property certificates.

## 🛠️ Technology Stack

*   **Framework:** [Next.js (App Router)](https://nextjs.org/) + React
*   **3D Engine:** [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) + [@react-three/drei](https://github.com/pmndrs/drei)
*   **2D Mapping:** [MapLibre GL JS](https://maplibre.org/) + `react-map-gl`
*   **Styling:** Tailwind CSS + Vanilla CSS (Glassmorphism design system)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Data Visualization:** [Recharts](https://recharts.org/)
*   **Data Processing:** Node.js scripts for parsing raw GeoJSON.

## ⚙️ How It Works (The Data Pipeline)

1.  **Data Ingestion:** The system uses real building footprint data extracted from OpenStreetMap (via Overpass API).
2.  **Parsing & Optimization:** A custom Node.js script (`parse_geojson.js`) processes the raw, heavy GeoJSON export. It extracts the raw coordinate rings, calculates the geographic center and approximate area in square meters, and outputs a highly optimized flat JSON array (`chennai_osm_buildings.json`).
3.  **Spatial Filtering:** When the app loads, `ProceduralCity.jsx` calculates the squared distance of every building in the dataset to the current camera origin using precise Web Mercator meter distances. It culls the dataset to only render the closest buildings for maximum rendering performance.
4.  **Geometry Extrusion:** `ProceduralBuilding.jsx` takes the `[lon, lat]` coordinates of the building polygon, projects them into the 3D scene's `[X, Z]` plane (where 1 unit = 1 meter), and uses `THREE.ExtrudeGeometry` to raise the building.
5.  **Mock Data Generation:** For demonstration purposes, `data/buildings.js` injects deep metadata into these physical shapes, simulating a fully populated government database of individual floor and unit ownership records.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm, yarn, pnpm, or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/SanjayB2005/3d-ulpin.git
    cd 3d-ulpin
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Environment Variables:
    Create a `.env.local` file in the root directory and add your API keys:
    ```env
    NEXT_PUBLIC_GEOAPIFY_API_KEY=your_api_key_here
    NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to explore the 3D GIS environment. Navigate to `/dashboard` to view the analytics interface.

## 📂 Project Structure

*   `/app`: Next.js App Router pages (`/`, `/dashboard`, etc.) and global layouts.
*   `/components`:
    *   `/viewer3d`: All Three.js and React Three Fiber components (`CityScene`, `ProceduralCity`, `ProceduralBuilding`).
    *   `/map`: 2D MapLibre components (`MapView`).
    *   `/panels`: Contextual UI sidebars (`BuildingPanel`, `PropertyPanel`, etc.).
    *   `/layout`: Global layout components (`Header`, `Sidebar`).
    *   `/ui`: Reusable UI elements.
*   `/data`: Static datasets, generated JSON files, and mock data generators.
*   `/stores`: Zustand state management (`useStore.js`).
*   `/styles`: Global CSS (`globals.css`) containing custom design tokens.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
