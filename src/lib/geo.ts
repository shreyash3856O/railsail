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
  engine: "osrm" | "valhalla" | "fallback";
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

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function distanceToMumbai(lat: number, lon: number): number {
  return distanceKm(MUMBAI_LAT, MUMBAI_LON, lat, lon);
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
    city?: string;
    district?: string;
    state?: string;
    country?: string;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

function buildPhotonDisplayName(p: PhotonFeature["properties"]): string {
  const parts = [
    p.name,
    p.street,
    p.district,
    p.city,
    p.state,
    p.country,
  ].filter((x): x is string => !!x && x.trim().length > 0);
  const deduped: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!deduped.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      deduped.push(trimmed);
    }
  }
  return deduped.join(", ");
}

async function searchPhoton(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${MUMBAI_LAT}&lon=${MUMBAI_LON}&limit=12`;
  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Photon failed (${res.status})`);
  const data = (await res.json()) as PhotonResponse;
  const features = data.features ?? [];
  return features
    .filter(
      (f) =>
        f.geometry?.coordinates &&
        f.geometry.coordinates.length >= 2 &&
        Number.isFinite(f.geometry.coordinates[0]) &&
        Number.isFinite(f.geometry.coordinates[1]),
    )
    .map((f) => {
      const [lon, lat] = f.geometry.coordinates;
      const p = f.properties ?? {};
      const full = buildPhotonDisplayName(p);
      const short = p.name?.trim() || shortName(full) || "Unknown place";
      return {
        displayName: full || short,
        shortName: short,
        lat,
        lon,
      };
    });
}

async function searchNominatim(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const boundedUrl = `${NOMINATIM_BASE}?format=json&q=${encodeURIComponent(query)}&limit=10&viewbox=72.75,19.35,73.15,18.85&bounded=1`;
  let res = await fetch(boundedUrl, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (res.ok) {
    const items = (await res.json()) as NominatimItem[];
    if (items.length > 0) {
      return items
        .filter((i) => Number.isFinite(Number(i.lat)) && Number.isFinite(Number(i.lon)))
        .map((i) => ({
          displayName: i.display_name,
          shortName: i.name?.trim() || shortName(i.display_name),
          lat: Number(i.lat),
          lon: Number(i.lon),
        }));
    }
  }
  const fallbackUrl = `${NOMINATIM_BASE}?format=json&q=${encodeURIComponent(query)}&limit=10`;
  res = await fetch(fallbackUrl, {
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

/**
 * Calculates accurate real-world urban transit duration factoring in:
 * - City traffic congestion (morning/evening rush hour)
 * - Traffic light cycles and intersection queuing delays (~35-60s per km)
 * - Realistic vehicle velocities (Cars: 18-26 km/h, Cycle: 14-16 km/h, Walk: 4.8 km/h)
 */
export function calculateRealisticUrbanDuration(
  distanceMeters: number,
  rawOsrmDurationSeconds: number,
  profile: RouteProfile,
  at: Date = new Date(),
): number {
  const km = Math.max(0.1, distanceMeters / 1000);
  const hour = at.getHours();
  const isMorningPeak = hour >= 8 && hour < 11;
  const isEveningPeak = hour >= 17 && hour < 21;
  const isPeak = isMorningPeak || isEveningPeak;
  const isNight = hour >= 23 || hour < 5;

  if (profile === "foot") {
    // Pedestrian walking speed: 4.8 km/h + 40s per km for street crossing / traffic lights
    const walkingSeconds = (km / 4.8) * 3600;
    const signalDelay = km * 40;
    return Math.round(walkingSeconds + signalDelay);
  }

  if (profile === "bike") {
    // Urban bicycle speed: 15 km/h + 25s per km for intersection stops
    const cyclingSeconds = (km / 15) * 3600;
    const signalDelay = km * 25;
    return Math.round(cyclingSeconds + signalDelay);
  }

  // Driving in urban traffic (OSRM free-flow assumes 60-80 km/h highway without red lights)
  // Realistic urban city speeds:
  // - Peak hours: 16-19 km/h
  // - Regular day hours: 22-26 km/h
  // - Night hours: 38-44 km/h
  let avgSpeedKmph = 24;
  let signalDelaySecPerKm = 35;
  let osrmMultiplier = 1.65;

  if (isPeak) {
    avgSpeedKmph = 17;
    signalDelaySecPerKm = 55;
    osrmMultiplier = 2.15;
  } else if (isNight) {
    avgSpeedKmph = 38;
    signalDelaySecPerKm = 15;
    osrmMultiplier = 1.25;
  }

  const speedDuration = (km / avgSpeedKmph) * 3600;
  const osrmAdjusted = rawOsrmDurationSeconds * osrmMultiplier + km * signalDelaySecPerKm;

  return Math.round(Math.max(speedDuration, osrmAdjusted));
}

function generateInterpolatedRoute(
  from: Pick<Place, "lat" | "lon">,
  to: Pick<Place, "lat" | "lon">,
  numPoints = 8,
): Array<[number, number]> {
  const coords: Array<[number, number]> = [];
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Introduce slight natural arc to simulate urban road curvature
    const arc = Math.sin(t * Math.PI) * 0.003;
    const lat = from.lat + (to.lat - from.lat) * t + arc;
    const lon = from.lon + (to.lon - from.lon) * t - arc * 0.5;
    coords.push([lon, lat]);
  }
  return coords;
}

async function fetchDrivingRoute(
  from: Pick<Place, "lat" | "lon">,
  to: Pick<Place, "lat" | "lon">,
  at: Date = new Date(),
): Promise<RouteResult> {
  const coords = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  try {
    const res = await fetch(
      `${OSRM_BASE}/driving/${coords}?overview=full&geometries=geojson&alternatives=true`,
      { headers: { Accept: "application/json" } },
    );
    if (res.ok) {
      const data = (await res.json()) as OsrmResponse;
      if (data.code === "Ok" && data.routes?.length) {
        const fastest = data.routes.reduce((a, b) =>
          a.duration <= b.duration ? a : b,
        );
        const accurateDuration = calculateRealisticUrbanDuration(
          fastest.distance,
          fastest.duration,
          "driving",
          at,
        );
        return {
          distanceM: fastest.distance,
          durationS: accurateDuration,
          geometry: fastest.geometry.coordinates,
          estimated: false,
          engine: "osrm",
        };
      }
    }
  } catch {
    // fallback below
  }

  // Graceful fallback if OSRM is unreachable
  const straightKm = distanceKm(from.lat, from.lon, to.lat, to.lon);
  const roadDistanceM = straightKm * 1.28 * 1000;
  const durationS = calculateRealisticUrbanDuration(roadDistanceM, (roadDistanceM / 1000 / 50) * 3600, "driving", at);

  return {
    distanceM: roadDistanceM,
    durationS,
    geometry: generateInterpolatedRoute(from, to),
    estimated: true,
    engine: "fallback",
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
  at: Date = new Date(),
): Promise<RouteResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s fast timeout to prevent blocking
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
    const profile = costing === "pedestrian" ? "foot" : "bike";
    const distanceM = summary.length * 1000;
    const accurateDuration = calculateRealisticUrbanDuration(
      distanceM,
      summary.time,
      profile,
      at,
    );

    return {
      distanceM,
      durationS: accurateDuration,
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
  at: Date = new Date(),
): Promise<RouteResult> {
  if (profile === "driving") {
    return fetchDrivingRoute(from, to, at);
  }

  // For walking or cycling: try Valhalla first, but fall back seamlessly
  try {
    return await fetchValhallaRoute(
      from,
      to,
      profile === "foot" ? "pedestrian" : "bicycle",
      at,
    );
  } catch {
    // Seamless fallback: fetch road geometry from OSRM and calculate exact pedestrian/cycle time
    const drivingRoute = await fetchDrivingRoute(from, to, at);
    return estimateFromDriving(drivingRoute, profile, at);
  }
}

const FALLBACK_SPEEDS: Record<Extract<RouteProfile, "foot" | "bike">, number> = {
  foot: 4.8,
  bike: 15,
};

export function estimateFromDriving(
  driving: RouteResult,
  profile: Extract<RouteProfile, "foot" | "bike">,
  at: Date = new Date(),
): RouteResult {
  const accurateDuration = calculateRealisticUrbanDuration(
    driving.distanceM,
    driving.durationS,
    profile,
    at,
  );
  return {
    distanceM: driving.distanceM,
    durationS: accurateDuration,
    geometry: driving.geometry,
    estimated: true,
    engine: driving.engine,
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
