# 🚆 RailSail — Smart Multimodal Urban Transit Navigator

> **Know the route before the rush. Travel smarter every day.**  
> RailSail is a fast, modern, and realistic urban transit planner built for Mumbai. It calculates verified door-to-door journeys combining the **Mumbai Suburban Railway**, **BEST Buses**, **Auto-rickshaws**, **Cabs**, **Cycling**, and **Walking** — with accurate traffic delays, real fare calculations, and interactive dark maps.

---

## 🌟 What is RailSail?

Getting around a busy metropolis like Mumbai is rarely just a "drive" or a "train ride" — it is almost always a **multimodal journey**:
1. You take an auto or walk to the local railway station.
2. You take a fast or slow suburban train across the city.
3. You take another auto, bus, or walk to your final destination.

Standard map apps often assume free-flowing traffic or don't combine rail, bus, and road options seamlessly. **RailSail solves this** by computing verified physical road and rail corridors, accounting for Mumbai rush-hour congestion, traffic signal delays, and calculating real transit fares in Indian Rupees (₹).

---

## 🏗️ System Architecture

RailSail is built with a client-first, edge-ready architecture that balances instant UI responsiveness with accurate spatial calculations.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT (BROWSER)                                  |
|                                                                                   |
|  +---------------------+   +-----------------------+   +-----------------------+  |
|  | Interactive 3D Hero |   | Multimodal Planner UI |   |   RouteMap (Leaflet)  |  |
|  | (Custom Canvas 3D)  |   | (Mode Selector, Fares)|   | (Dark Carto Basemap)  |  |
|  +---------------------+   +-----------------------+   +-----------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
                                  REST & Client Calls
                                           |
+------------------------------------------v----------------------------------------+
|                            NEXT.JS APPLICATION ENGINE                             |
|                                                                                   |
|  +-------------------------------------+   +------------------------------------+ |
|  |           Route Handlers            |   |           Spatial Engine           | |
|  |   - /api/transit/buses (GTFS query) |   |   - geo.ts (Haversine & OSRM)      | |
|  |   - /api/transit/status (Health)    |   |   - hybrid.ts (Multimodal Planner) | |
|  +-------------------------------------+   |   - fares.ts (Auto & Train Tariffs)| |
|                                            |   - traffic.ts (Rush-Hour Delays)  | |
|                                            +------------------------------------+ |
+------------------------------------------+----------------------------------------+
                                           |
                 +-------------------------+-------------------------+
                 |                                                   |
+----------------v-------------------+             +-----------------v--------------+
|       LOCAL PREBUILT DATA          |             |       EXTERNAL MAPPING APIS    |
|                                    |             |                                |
|  - public/gtfs-index.json          |             |  - Nominatim (Geocoding)       |
|    * 10,279 Mumbai Bus Stops       |             |  - OSRM (Road Geometry)        |
|    * 1,609 Bus Routes              |             |  - Valhalla (Fallback Routing) |
|    * 99,080 Scheduled Trips        |             |  - CARTO (Dark Matter Tiles)   |
|    (Parsed automatically at build) |             |                                |
+------------------------------------+             +--------------------------------+
```

### How a Trip is Calculated: Step-by-Step
1. **Search & Geocode**: User types starting point and destination. RailSail queries **Nominatim** filtered to the Mumbai bounding box.
2. **Station Snapping**: The system calculates the nearest suburban railway stations on the Western / Central lines using the Haversine distance formula.
3. **Multimodal Matrix**:
   - **First Mile**: Walk vs. Auto-rickshaw to station A.
   - **Transit Leg**: Direct suburban train between stations, including stops, frequency, and wait time.
   - **Last Mile**: Walk vs. Auto-rickshaw from station B to destination.
4. **Road Alternative**: Fetches exact road geometry from **OSRM** (with **Valhalla** fallback) and applies Mumbai's peak/off-peak congestion multipliers and signal delays.
5. **Bus Transit**: Queries the in-memory **GTFS** bus index for direct or connecting BEST bus routes.
6. **Fare Calculation**: Calculates exact fares using the official Western Railway fare chart and Mumbai auto-rickshaw meter rates (₹23 base + per-km slab).

---

## 💻 Tech Stack & Why We Chose It

| Layer | Technology | Why We Chose It |
|---|---|---|
| **Core Framework** | **Next.js 16 (App Router + Turbopack)** | Provides lightning-fast page loading, server-side API routes, and Turbopack for near-instant builds and hot-reloading. |
| **Language** | **TypeScript 5** | Strict type safety across complex spatial geometries, transit schedules, and fare matrix configurations. |
| **UI & Styling** | **Tailwind CSS v4** | Modern utility-first CSS engine. Delivers a responsive, lightweight, dark monochrome design system without CSS bloat. |
| **Interactive 3D** | **Custom HTML5 Canvas 3D Engine** | Pure mathematical 3D projection engine (`Interactive3DTransit.tsx`). Renders interactive wireframe spheres, rings, and transit networks responsive to cursor and touch with **zero bundle weight** compared to bulky 3D libraries like Three.js. |
| **Mapping Engine** | **Leaflet + React Integration** | Extremely lightweight and mobile-performant map library. Paired with CARTO Dark tiles for a high-contrast dark-mode cartography. |
| **Icons & Micro-animations** | **Lucide React + Framer Motion** | Crisp, lightweight icons and hardware-accelerated animations for smooth transitions. |
| **Transit Indexing** | **JSZip + Custom GTFS Pipeline** | Automatically downloads and compiles 13+ MB of raw Mumbai GTFS transport data into a compact 33 MB JSON search index during the prebuild stage. |

---

## 🌐 APIs Used & Where They Are Used

RailSail integrates open geographic data and routing services to operate without expensive paid API keys:

### 1. OpenStreetMap Nominatim (Geocoding & Autocomplete)
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **File**: [`src/lib/geo.ts`](file:///src/lib/geo.ts) (`searchPlaces`)
- **What it does**: Translates user inputs like `"Bandra Station"` or `"Nariman Point"` into exact latitude and longitude coordinates, bounded within Mumbai's geographic region.

### 2. OSRM (Open Source Routing Machine)
- **Endpoints**:
  - Driving: `https://router.project-osrm.org/route/v1/driving/{coords}`
  - Walking: `https://router.project-osrm.org/route/v1/foot/{coords}`
  - Cycling: `https://router.project-osrm.org/route/v1/bike/{coords}`
- **File**: [`src/lib/geo.ts`](file:///src/lib/geo.ts) (`fetchRoute`)
- **What it does**: Calculates physical road paths, polyline geometries, turn-by-turn road distances, and baseline travel durations.

### 3. Valhalla Routing Engine (Failover / High-Precision Fallback)
- **Endpoint**: `https://valhalla1.openstreetmap.de/route`
- **File**: [`src/lib/geo.ts`](file:///src/lib/geo.ts) (`fetchValhallaRoute`)
- **What it does**: Acts as an automatic fallback if OSRM is temporarily busy or rate-limited, ensuring zero route calculation outages.

### 4. CARTO Dark Matter Basemaps
- **Endpoint**: `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png`
- **File**: [`src/components/map/leaflet.ts`](file:///src/components/map/leaflet.ts) (`TILE_URL`)
- **What it does**: Provides crisp, high-contrast, beautiful dark-themed map tiles that match RailSail's monochrome design language. A public fallback key is bundled so it works out of the box.

### 5. Mumbai GTFS Transit Feed (BEST Bus Network)
- **Source**: `https://raw.githubusercontent.com/croyla/mumbai-gtfs/main/gtfs.zip`
- **Files**: [`scripts/build-gtfs-index.mjs`](file:///scripts/build-gtfs-index.mjs), [`src/lib/gtfs.ts`](file:///src/lib/gtfs.ts), [`src/app/api/transit/buses/route.ts`](file:///src/app/api/transit/buses/route.ts)
- **What it does**: Supplies official timetable data for 10,279 bus stops, 1,609 bus routes, and 99,080 scheduled trips across Mumbai. Built locally into `public/gtfs-index.json`.

### 6. Dynamic Urban Traffic Simulator
- **File**: [`src/lib/traffic.ts`](file:///src/lib/traffic.ts) & [`src/lib/geo.ts`](file:///src/lib/geo.ts)
- **What it does**: Simulates live traffic congestion for key Mumbai corridors (Western Express Highway, Eastern Express Highway, S.V. Road, LBS Marg) and adjusts road trip durations dynamically based on time of day and peak rush hours.

---

## ✨ Key Features

- **🎯 Multimodal Journey Planner**: Compare train + auto, direct driving, bus, cycling, and walking in one unified view.
- **⏱️ Realistic Travel Durations**: Unlike naive routing engines that calculate 50 km/h open-road speeds in central Mumbai, RailSail models signal waits, bottleneck corridors, and rush-hour delays.
- **💰 Accurate Indian Rupee Fares**:
  - Mumbai Suburban Local Train 2nd class fare structure.
  - Mumbai Auto-rickshaw metered fares (Day/Night tariff rates).
  - BEST ordinary and AC bus ticket slabs.
- **🪐 Interactive 3D Canvas**: Features 3 interactive geometric models (Sphere, Rings, Nexus) that react to mouse hover, device orientation, and touch dragging.
- **📱 100% Mobile-First & Responsive**: Engineered for mobile screens with touch-safe scrolling, collapsible sidebars, and fluid typography.
- **🚥 Corridor Live Traffic**: Visual overview of major arterial roads with color-coded congestion levels and average delays.
- **💾 Saved Trips & History**: Bookmark frequent commutes (Home to Work, College, etc.) with instant one-tap replanning.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or later recommended
- **npm**: `v10.x` or later

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shreyash3856O/railsail.git
   cd railsail
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the GTFS bus index**:
   *(This runs automatically prior to build, but you can run it manually for development)*
   ```bash
   node scripts/build-gtfs-index.mjs
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

RailSail is designed to run with **zero configuration** out of the box. All essential fallback keys and public endpoints are bundled.

If you wish to customize your deployment, copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `3000` | Local port for the web server |
| `NODE_ENV` | `development` / `production` | Application runtime environment |
| `NEXT_PUBLIC_CARTO_API_KEY` | *(Bundled working key)* | Optional custom CARTO API key for map tiles |

---

## 🚢 Deployment

### Deploying to Render
RailSail is fully configured for [Render](https://render.com) with the included [`render.yaml`](file:///render.yaml):

1. Link your GitHub repository in Render.
2. Select **Web Service**.
3. Use the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm run start`
   - **Node Version**: `20.18.0`

### Deploying to Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. The prebuild script will automatically generate `public/gtfs-index.json`.
3. Click **Deploy**.

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
All transit schedules and map data &copy; OpenStreetMap contributors, CARTO, and Mumbai GTFS data providers.
