import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_element(name):
    return OxmlElement(name)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(18)
    run.font.bold = True
    run.font.color.rgb = RGBColor(17, 24, 39) # #111827
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = RGBColor(37, 99, 235) # #2563EB
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(12)
    run.font.bold = True
    run.font.color.rgb = RGBColor(55, 65, 81) # #374151
    return p

def add_body_paragraph(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = "Calibri"
        r_bold.font.size = Pt(10.5)
        r_bold.font.bold = True
        r_bold.font.color.rgb = RGBColor(31, 41, 55)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(55, 65, 81)
    return p

def add_bullet_item(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_bold = p.add_run(bold_prefix)
        r_bold.font.name = "Calibri"
        r_bold.font.size = Pt(10.5)
        r_bold.font.bold = True
        r_bold.font.color.rgb = RGBColor(17, 24, 39)
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(55, 65, 81)
    return p

def add_callout(doc, text, title="NOTE"):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "F3F4F6") # Light gray
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Left border accent
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="24" w:space="0" w:color="2563EB"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    
    rt = p.add_run(f"[{title}] ")
    rt.font.name = "Calibri"
    rt.font.size = Pt(10)
    rt.font.bold = True
    rt.font.color.rgb = RGBColor(37, 99, 235)
    
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(55, 65, 81)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_code_block(doc, code_text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, "1E293B") # Dark slate
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.05
    
    r = p.add_run(code_text)
    r.font.name = "Consolas"
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(241, 245, 249)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_styled_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=len(rows) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Header row
    hdr_cells = table.rows[0].cells
    for i, h_text in enumerate(headers):
        hdr_cells[i].text = ""
        set_cell_background(hdr_cells[i], "1E293B") # Dark slate header
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)
        if col_widths and i < len(col_widths):
            hdr_cells[i].width = col_widths[i]
            
    # Data rows
    for r_idx, row_data in enumerate(rows):
        row_cells = table.rows[r_idx + 1].cells
        bg_color = "F9FAFB" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, cell_value in enumerate(row_data):
            row_cells[c_idx].text = ""
            set_cell_background(row_cells[c_idx], bg_color)
            set_cell_margins(row_cells[c_idx], top=90, bottom=90, left=140, right=140)
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            r = p.add_run(cell_value)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(55, 65, 81)
            if col_widths and c_idx < len(col_widths):
                row_cells[c_idx].width = col_widths[c_idx]
                
    # Add subtle border to all cells
    for row in table.rows:
        for cell in row.cells:
            tcPr = cell._tc.get_or_add_tcPr()
            borders = parse_xml(f'<w:tcBorders {nsdecls("w")}><w:top w:val="single" w:sz="4" w:space="0" w:color="E5E7EB"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="E5E7EB"/><w:left w:val="none"/><w:right w:val="none"/></w:tcBorders>')
            tcPr.append(borders)
            
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def generate_document(output_path):
    doc = Document()
    
    # Set page margins
    for section in doc.sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)
        
    # --- DOCUMENT COVER / HEADER ---
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(10)
    title_p.paragraph_format.space_after = Pt(2)
    run_t = title_p.add_run("RailSail Documentation")
    run_t.font.name = "Calibri"
    run_t.font.size = Pt(26)
    run_t.font.bold = True
    run_t.font.color.rgb = RGBColor(17, 24, 39)
    
    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_before = Pt(0)
    subtitle_p.paragraph_format.space_after = Pt(12)
    run_st = subtitle_p.add_run("Smart Multimodal Urban Transit Navigator for Mumbai")
    run_st.font.name = "Calibri"
    run_st.font.size = Pt(14)
    run_st.font.color.rgb = RGBColor(75, 85, 99)
    
    add_callout(
        doc,
        "RailSail calculates verified door-to-door urban journeys combining the Mumbai Suburban Railway, BEST Buses, Auto-rickshaws, Cabs, Cycling, and Walking — accounting for rush-hour delays, realistic travel times, and real fare tariffs.",
        title="MISSION"
    )
    
    # --- SECTION 1: WHAT IS RAILSAIL ---
    add_heading_1(doc, "1. What is RailSail?")
    add_body_paragraph(
        doc,
        "Navigating a megacity like Mumbai is rarely just a single continuous drive or train ride. In reality, commuters take multimodal trips: walking or taking a shared auto to the nearest railway station, riding a fast or slow local train across the island city or suburbs, and finishing with an auto-rickshaw, feeder bus, or walk to their office or home."
    )
    add_body_paragraph(
        doc,
        "Traditional navigation apps often fail in this environment because they either assume unobstructed free-flowing road traffic or isolate transit modes without offering door-to-door multimodal combinations. RailSail resolves this by integrating real-world physical corridors, transit timetables, and congestion models into one seamless experience."
    )
    
    add_bullet_item(doc, " Computes verified multimodal matrices (First-Mile + Suburban Rail + Last-Mile).", "Multimodal Combinations:")
    add_bullet_item(doc, " Reflects real Mumbai traffic signal waits and bottleneck slowdowns instead of theoretical open-highway speeds.", "Realistic Urban Durations:")
    add_bullet_item(doc, " Exact official Western/Central railway ticket fares and metered auto rates (Day/Night tariffs).", "Accurate Indian Rupee (₹) Fares:")
    add_bullet_item(doc, " Full local index of 10,279 stops, 1,609 routes, and 99,080 trips with zero third-party API rate limits.", "Prebuilt GTFS Bus Index:")
    add_bullet_item(doc, " Interactive 3D transit visualizer built with mathematical canvas projection with zero bloated 3D libraries.", "Lightweight 3D & Dark Cartography:")

    # --- SECTION 2: SYSTEM ARCHITECTURE ---
    add_heading_1(doc, "2. System Architecture")
    add_body_paragraph(
        doc,
        "RailSail uses a client-optimized, edge-ready architecture built on Next.js 16. It couples client-side interactive mapping with server-side timetable indexing and external spatial engines."
    )
    
    arch_diagram = (
        "+-----------------------------------------------------------------------------------+\n"
        "|                                 CLIENT (BROWSER)                                  |\n"
        "|  +---------------------+   +-----------------------+   +-----------------------+  |\n"
        "|  | Interactive 3D Hero |   | Multimodal Planner UI |   |   RouteMap (Leaflet)  |  |\n"
        "|  | (Custom Canvas 3D)  |   | (Mode Selector, Fares)|   | (Dark Carto Basemap)  |  |\n"
        "|  +---------------------+   +-----------------------+   +-----------------------+  |\n"
        "+------------------------------------------+----------------------------------------+\n"
        "                                           |\n"
        "                                  REST & Client Calls\n"
        "                                           |\n"
        "+------------------------------------------v----------------------------------------+\n"
        "|                            NEXT.JS APPLICATION ENGINE                             |\n"
        "|  +-------------------------------------+   +------------------------------------+ |\n"
        "|  |           Route Handlers            |   |           Spatial Engine           | |\n"
        "|  |   - /api/transit/buses (GTFS query) |   |   - geo.ts (Haversine & OSRM)      | |\n"
        "|  |   - /api/transit/status (Health)    |   |   - hybrid.ts (Multimodal Planner) | |\n"
        "|  +-------------------------------------+   |   - fares.ts (Auto & Train Tariffs)| |\n"
        "|                                            |   - traffic.ts (Rush-Hour Delays)  | |\n"
        "|                                            +------------------------------------+ |\n"
        "+------------------------------------------+----------------------------------------+\n"
        "                                           |\n"
        "                 +-------------------------+-------------------------+\n"
        "                 |                                                   |\n"
        "+----------------v-------------------+             +-----------------v--------------+\n"
        "|       LOCAL PREBUILT DATA          |             |       EXTERNAL MAPPING APIS    |\n"
        "|  - public/gtfs-index.json          |             |  - Nominatim (Geocoding)       |\n"
        "|    * 10,279 Mumbai Bus Stops       |             |  - OSRM (Road Geometry)        |\n"
        "|    * 1,609 Bus Routes              |             |  - Valhalla (Fallback Routing) |\n"
        "|    * 99,080 Scheduled Trips        |             |  - CARTO (Dark Matter Tiles)   |\n"
        "+------------------------------------+             +--------------------------------+"
    )
    add_code_block(doc, arch_diagram)
    
    add_heading_2(doc, "Step-by-Step Trip Calculation Lifecycle")
    add_bullet_item(doc, "User inputs origin and destination names. Nominatim returns verified geographic coordinates bounded inside Mumbai.", "1. Geocoding & Autocomplete: ")
    add_bullet_item(doc, "The engine snaps coordinates to the nearest suburban railway stations via Haversine distance calculations.", "2. Station Snapping: ")
    add_bullet_item(doc, "Evaluates four first/last-mile permutations: Walk-Walk, Auto-Walk, Walk-Auto, and Auto-Auto.", "3. Multimodal Matrix: ")
    add_bullet_item(doc, "Fetches turn-by-turn road geometry from OSRM and applies time-of-day traffic delay models for realistic driving times.", "4. Road Leg & Congestion: ")
    add_bullet_item(doc, "Matches direct and connecting BEST bus routes from the local binary index.", "5. Bus Transit Scan: ")
    add_bullet_item(doc, "Applies official distance-based tariff slabs for suburban rail and metered rates for auto-rickshaws.", "6. Fare Computation: ")

    # --- SECTION 3: TECH STACK ---
    add_heading_1(doc, "3. Tech Stack & Why We Chose It")
    add_body_paragraph(
        doc,
        "Every dependency in RailSail was selected to maximize speed, minimize client bundle weight, and ensure zero reliance on expensive paid API subscriptions."
    )
    
    tech_headers = ["Layer", "Technology", "Why We Chose It"]
    tech_rows = [
        ["Framework", "Next.js 16 (App Router + Turbopack)", "Blazing-fast server rendering, built-in Edge and Node API routes, zero-config route handling, and rapid builds with Turbopack."],
        ["Language", "TypeScript 5", "Strict end-to-end type safety across geographic geometries, transit schedules, and fare matrix configurations."],
        ["UI & Styling", "Tailwind CSS v4 + PostCSS", "Modern utility-first CSS engine. Produces a lightweight, responsive, dark monochrome design system without CSS overhead."],
        ["3D Visualizer", "Custom HTML5 Canvas 3D Engine", "Mathematical wireframe 3D projection engine with zero bundle bloat. Replaces massive 500KB+ Three.js libraries with pure math."],
        ["Map Rendering", "Leaflet + CARTO Dark Matter", "Ultra-lightweight map library (compared to Mapbox GL). Fast raster tile caching with high-contrast monochrome dark tiles."],
        ["Icons & Animation", "Lucide React + Framer Motion", "Crisp SVG iconography and hardware-accelerated animations for smooth modal and navigation transitions."],
        ["Timetable Engine", "JSZip + GTFS Compiler", "Compiles 13+ MB of raw GTFS data into an indexed 33 MB JSON search file during prebuild, eliminating API latency."]
    ]
    col_w = [Inches(1.2), Inches(2.1), Inches(3.2)]
    build_styled_table(doc, tech_headers, tech_rows, col_w)

    # --- SECTION 4: APIS USED ---
    add_heading_1(doc, "4. APIs Used & Where They Are Used")
    add_body_paragraph(
        doc,
        "RailSail utilizes free, reliable, and open geospatial services along with local prebuilt data:"
    )
    
    api_headers = ["Service / API", "File Location", "Endpoint / Resource", "Role & Purpose"]
    api_rows = [
        [
            "OpenStreetMap Nominatim",
            "src/lib/geo.ts (searchPlaces)",
            "https://nominatim.openstreetmap.org/search",
            "Translates street addresses, landmarks, and station names into latitude/longitude with Mumbai viewport bounding."
        ],
        [
            "OSRM (Open Source Routing Machine)",
            "src/lib/geo.ts (fetchRoute)",
            "https://router.project-osrm.org/route/v1/{profile}",
            "Computes driving, walking, and cycling street geometries, actual road distances, and baseline travel times."
        ],
        [
            "Valhalla Routing Engine",
            "src/lib/geo.ts (fetchValhallaRoute)",
            "https://valhalla1.openstreetmap.de/route",
            "Secondary high-precision routing engine acting as an automatic fallback if OSRM is busy or rate-limited."
        ],
        [
            "CARTO Dark Matter Tiles",
            "src/components/map/leaflet.ts (TILE_URL)",
            "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png",
            "Serves high-contrast dark raster tiles for the interactive RouteMap component. Includes bundled zero-setup key."
        ],
        [
            "Mumbai GTFS Data Feed",
            "scripts/build-gtfs-index.mjs, src/lib/gtfs.ts",
            "https://raw.githubusercontent.com/croyla/mumbai-gtfs/main/gtfs.zip",
            "Provides raw scheduled timetable data for 10,279 bus stops, 1,609 routes, and 99,080 trips across Mumbai."
        ],
        [
            "Dynamic Traffic Simulator",
            "src/lib/traffic.ts",
            "Internal algorithmic service",
            "Models real-time rush-hour delays on WEH, EEH, S.V. Road, and LBS Marg based on time-of-day traffic buckets."
        ]
    ]
    api_col_w = [Inches(1.5), Inches(1.5), Inches(1.8), Inches(1.7)]
    build_styled_table(doc, api_headers, api_rows, api_col_w)

    # --- SECTION 5: KEY FEATURES ---
    add_heading_1(doc, "5. Key Features")
    add_bullet_item(doc, " Compare suburban rail + auto combos against direct road driving, buses, cycling, and walking on a single comparison board.", "Multimodal Journey Planner: ")
    add_bullet_item(doc, " Applies urban congestion factors, traffic signal pauses, and pedestrian pacing for real travel times instead of naive open-road speed assumptions.", "Realistic Urban Durations: ")
    add_bullet_item(doc, " Computes official Indian Railway 2nd class suburban fare tables and MMRDA metered auto rates (₹23 base + per-km slabs).", "Verified Mumbai Fares: ")
    add_bullet_item(doc, " Features 3 mathematical geometric models (Sphere, Rings, Nexus) that react smoothly to cursor coordinates, touch dragging, and orientation parallax.", "Interactive 3D Canvas Engine: ")
    add_bullet_item(doc, " Built from the ground up for mobile screens with touch-safe scrolling (pan-y), collapsible sidebars, and fluid typography.", "100% Mobile-First Responsive UI: ")
    add_bullet_item(doc, " Live overview of major Mumbai arterial roads with color-coded traffic density and average delay estimates.", "Corridor Live Traffic: ")
    add_bullet_item(doc, " Bookmark frequent commutes (Home to Work, College, etc.) with instant one-tap replanning.", "Saved Trips & History: ")

    # --- SECTION 6: GETTING STARTED ---
    add_heading_1(doc, "6. Getting Started & Local Development")
    add_body_paragraph(doc, "Follow these steps to run RailSail locally on your machine:")
    
    add_heading_2(doc, "Prerequisites")
    add_bullet_item(doc, " v20.x or higher", "Node.js:")
    add_bullet_item(doc, " v10.x or higher", "npm:")
    
    add_heading_2(doc, "Setup Commands")
    cmd_text = (
        "# 1. Clone the repository\n"
        "git clone https://github.com/shreyash3856O/railsail.git\n"
        "cd railsail\n\n"
        "# 2. Install all dependencies (including dev tools)\n"
        "npm install\n\n"
        "# 3. Build the GTFS bus index\n"
        "node scripts/build-gtfs-index.mjs\n\n"
        "# 4. Start local development server\n"
        "npm run dev\n"
    )
    add_code_block(doc, cmd_text)
    add_body_paragraph(doc, "Once the server starts, open http://localhost:3000 in your browser.")

    # --- SECTION 7: ENVIRONMENT VARIABLES ---
    add_heading_1(doc, "7. Environment Variables")
    add_body_paragraph(
        doc,
        "RailSail is designed to work with zero mandatory environment variables. All necessary fallback endpoints and keys are pre-configured."
    )
    
    env_headers = ["Variable", "Default Value", "Description"]
    env_rows = [
        ["PORT", "3000", "Local HTTP server port"],
        ["NODE_ENV", "development / production", "Node runtime environment"],
        ["NEXT_PUBLIC_CARTO_API_KEY", "Bundled working key", "Optional custom CARTO API key for map tiles"]
    ]
    env_col_w = [Inches(2.0), Inches(1.8), Inches(2.7)]
    build_styled_table(doc, env_headers, env_rows, env_col_w)

    # --- SECTION 8: DEPLOYMENT ---
    add_heading_1(doc, "8. Deployment Guide")
    
    add_heading_2(doc, "Deploying on Render")
    add_body_paragraph(
        doc,
        "RailSail includes a pre-configured render.yaml blueprint file for instant zero-hassle deployment on Render:"
    )
    render_config = (
        "Environment: Node\n"
        "Build Command: npm install --include=dev && npm run build\n"
        "Start Command: npm run start\n"
        "Node Version: 20.18.0\n"
        "Auto-Deploy: Enabled"
    )
    add_code_block(doc, render_config)
    add_callout(
        doc,
        "Ensure all @types dependencies are in 'dependencies' in package.json (already configured) so Render's production npm install doesn't skip TypeScript declarations during next build.",
        title="DEPLOYMENT TIP"
    )
    
    add_heading_2(doc, "Deploying on Vercel")
    add_body_paragraph(
        doc,
        "Connect your GitHub repository to Vercel. Next.js will automatically detect the build settings, run the prebuild GTFS script, and publish your production site."
    )

    # Save document
    doc.save(output_path)
    print(f"Successfully generated: {output_path}")

if __name__ == "__main__":
    out_file = r"c:\Users\shrey\Downloads\TransitWin-main\railsail\RailSail_Documentation.docx"
    generate_document(out_file)
