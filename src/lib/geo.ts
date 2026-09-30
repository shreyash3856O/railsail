export interface Place {
  displayName: string;
  shortName: string;
  lat: number;
  lon: number;
}

export type RouteProfile = "driving" | "foot" | "bike";

export interface RouteResult {
  distanceM: number;
  durationS: number;
  geometry: Array<[number, number]>;
  estimated: boolean;
  engine: "osrm" | "valhalla";
}

interface NominatimItem {
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
}

interface OsrmResponse {
  code: string;
  message?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: { coordinates: Array<[number, number]> };
  }>;
}

interface ValhallaResponse {
  trip?: {
    summary?: { time: number; length: number };
    legs?: Array<{ shape?: string }>;
  };
  error?: string;
}

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const OSRM_BASE = "https://router.project-osrm.org/route/v1";
const VALHALLA_BASE = "https://valhalla1.openstreetmap.de/route";

const MUMBAI_LAT = 19.076;
const MUMBAI_LON = 72.8777;

function shortName(displayName: string): string {
  const first = displayName.split(",")[0].trim();
  return first.length > 42 ? `${first.slice(0, 42)}...` : first;
}

function distanceToMumbai(lat: number, lon: number): number {
  const R = 6371;
  const dLat = ((lat - MUMBAI_LAT) * Math.PI) / 180;
  const dLon = ((lon - MUMBAI_LON) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((MUMBAI_LAT * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const KEEP_TOGETHER = new Set([
  "st",
  "rd",
  "dr",
  "mr",
  "mrs",
  "no",
  "po",
  "co",
  "opp",
  "nr",
]);

function spacedVariant(query: string): string | null {
  const words = query.split(/\s+/);
  let changed = false;
  const out = words.map((w) => {
    const lower = w.toLowerCase().replace(/[^a-z]/g, "");
    if (
      lower.length >= 2 &&
      lower.length <= 3 &&
      /^[bcdfghjklmnpqrstvwxyz]+$/.test(lower) &&
      !KEEP_TOGETHER.has(lower)
    ) {
      changed = true;
      return lower.split("").join(" ");
    }
    return w;
  });
  return changed ? out.join(" ") : null;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    city?: string;
    state?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

async function searchPhoton(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const params = new URLSearchParams({
    q: query,
    limit: "8",
    lat: String(MUMBAI_LAT),
    lon: String(MUMBAI_LON),
    lang: "en",
  });
  const res = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = (await res.json()) as PhotonResponse;
  const out: Place[] = [];
  for (const f of data.features ?? []) {
    const [lon, lat] = f.geometry.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const p = f.properties;
    const name =
      p.name ||
      [p.housenumber, p.street].filter(Boolean).join(" ") ||
      "Unnamed place";
    const area = [p.street, p.district || p.city, p.state]
      .filter(Boolean)
      .join(", ");
    out.push({
      displayName: area && area !== name ? `${name}, ${area}` : name,
      shortName: name.length > 42 ? `${name.slice(0, 42)}...` : name,
      lat,
      lon,
    });
  }
  return out;
}

async function searchNominatim(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const params = new URLSearchParams({
    format: "jsonv2",
    q: query,
    limit: "8",
    countrycodes: "in",
    addressdetails: "0",
    "accept-language": "en",
    viewbox: "72.4,19.6,73.4,18.7",
    bounded: "0",
  });
  const res = await fetch(`${NOMINATIM_BASE}?${params.toString()}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const items = (await res.json()) as NominatimItem[];
  return items
    .filter((i) => Number.isFinite(Number(i.lat)) && Number.isFinite(Number(i.lon)))
    .map((i) => ({
      displayName: i.display_name,
      shortName: i.name?.trim() || shortName(i.display_name),
      lat: Number(i.lat),
      lon: Number(i.lon),
    }));
}

export async function searchPlaces(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 3) return [];
  const variant = spacedVariant(q);
  const photonQueries = variant && variant !== q ? [q, variant] : [q];
  const settled = await Promise.all([
    ...photonQueries.map((v) => searchPhoton(v, signal).catch(() => [] as Place[])),
    searchNominatim(q, signal).catch(() => [] as Place[]),
  ]);
  const seen = new Set<string>();
  const merged: Place[] = [];
  for (const list of settled) {
    for (const p of list) {
      const key = `${p.lat.toFixed(3)}|${p.lon.toFixed(3)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(p);
    }
  }
  const tokenSet = new Set<string>();
  for (const v of photonQueries) {
    for (const t of v.toLowerCase().split(/[^a-z0-9]+/)) {
      if (t) tokenSet.add(t);
    }
  }
  const tokens = [...tokenSet];
  const scored = merged.map((p) => {
    const hay = `${p.shortName} ${p.displayName}`.toLowerCase();
    let text = 0;
    for (const t of tokens) {
      if (t.length >= 2 && hay.includes(t)) text += t.length;
    }
    return { p, score: text - distanceToMumbai(p.lat, p.lon) / 100 };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10).map((s) => s.p);
}

async function fetchDrivingRoute(
  from: Pick<Place, "lat" | "lon">,
  to: Pick<Place, "lat" | "lon">,
): Promise<RouteResult> {
  const coords = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const res = await fetch(
    `${OSRM_BASE}/driving/${coords}?overview=full&geometries=geojson&alternatives=true`,
    { headers: { Accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`Routing failed (${res.status})`);
  const data = (await res.json()) as OsrmResponse;
  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error(data.message || "No driving route found");
  }
  const fastest = data.routes.reduce((a, b) =>
    a.duration <= b.duration ? a : b,
  );
  return {
    distanceM: fastest.distance,
    durationS: fastest.duration,
    geometry: fastest.geometry.coordinates,
    estimated: false,
    engine: "osrm",
  };
}

function decodePolyline(encoded: string, precision = 6): Array<[number, number]> {
  const coords: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const factor = 10 ** precision;
  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    coords.push([lng / factor, lat / factor]);
  }
  return coords;
}

async function fetchValhallaRoute(
  from: Pick<Place, "lat" | "lon">,
  to: Pick<Place, "lat" | "lon">,
  costing: "pedestrian" | "bicycle",
): Promise<RouteResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(VALHALLA_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        locations: [
          { lat: from.lat, lon: from.lon },
          { lat: to.lat, lon: to.lon },
        ],
        costing,
        units: "kilometers",
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Routing failed (${res.status})`);
    const data = (await res.json()) as ValhallaResponse;
    const summary = data.trip?.summary;
    const shape = data.trip?.legs?.[0]?.shape;
    if (!summary || !shape) {
      throw new Error(data.error || "No route found");
    }
    return {
      distanceM: summary.length * 1000,
      durationS: summary.time,
      geometry: decodePolyline(shape, 6),
      estimated: false,
      engine: "valhalla",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchRoute(
  from: Pick<Place, "lat" | "lon">,
  to: Pick<Place, "lat" | "lon">,
  profile: RouteProfile,
): Promise<RouteResult> {
  if (profile === "driving") return fetchDrivingRoute(from, to);
  return fetchValhallaRoute(from, to, profile === "foot" ? "pedestrian" : "bicycle");
}

const FALLBACK_SPEEDS: Record<Extract<RouteProfile, "foot" | "bike">, number> = {
  foot: 4.8,
  bike: 15,
};

export function estimateFromDriving(
  driving: RouteResult,
  profile: Extract<RouteProfile, "foot" | "bike">,
): RouteResult {
  const kmh = FALLBACK_SPEEDS[profile];
  return {
    distanceM: driving.distanceM,
    durationS: (driving.distanceM / 1000 / kmh) * 3600,
    geometry: driving.geometry,
    estimated: true,
    engine: "osrm",
  };
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}
