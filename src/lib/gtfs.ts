import { promises as fs } from "node:fs";
import path from "node:path";
import JSZip from "jszip";

const FEED_URL =
  "https://raw.githubusercontent.com/croyla/mumbai-gtfs/main/gtfs.zip";
const DATA_DIR = path.join(process.cwd(), "data", "gtfs");
const INDEX_PATH = path.join(DATA_DIR, "index.json");
const INDEX_VERSION = 1;

export interface GtfsStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

export interface GtfsRoute {
  id: string;
  agency: string;
  short: string;
  long: string;
}

export interface GtfsTrip {
  route: number;
  dir: number;
  headsign: string;
  stops: number[];
  times: number[];
}

interface GtfsIndex {
  version: number;
  feedStart: string;
  feedEnd: string;
  agencies: string[];
  stops: GtfsStop[];
  routes: GtfsRoute[];
  trips: GtfsTrip[];
  stopTrips: number[][];
}

function parseLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function parseTime(s: string): number {
  const parts = s.split(":").map(Number);
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) return -1;
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] ?? 0);
}

function haversineKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

let cached: Promise<GtfsIndex> | null = null;
let loadError: string | null = null;
let loading = false;

export function peekTransitStatus(): {
  ready: boolean;
  loading: boolean;
  error: string | null;
} {
  return { ready: cached != null, loading, error: loadError };
}

export async function ensureGtfs(baseUrl?: string): Promise<GtfsIndex> {
  if (!cached) {
    loading = true;
    loadError = null;
    cached = loadIndex(baseUrl)
      .catch((err) => {
        cached = null;
        loadError = err instanceof Error ? err.message : "Feed load failed";
        throw err;
      })
      .finally(() => {
        loading = false;
      });
  }
  return cached;
}

async function loadIndex(baseUrl?: string): Promise<GtfsIndex> {
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/gtfs-index.json`);
      if (res.ok) {
        return fromCompact(await res.json());
      }
    } catch {
      // fall through to legacy runtime build
    }
  }
  return buildIndex();
}

interface CompactIndex {
  version: number;
  feedStart: string;
  feedEnd: string;
  agencies: string[];
  stops: Array<[string, string, number, number]>;
  routes: Array<[string, string, string, string]>;
  trips: Array<[number, number, string, number[], number[]]>;
}

function fromCompact(raw: CompactIndex): GtfsIndex {
  if (raw.version !== INDEX_VERSION || !Array.isArray(raw.trips)) {
    throw new Error("Incompatible prebuilt index");
  }
  const stops: GtfsStop[] = raw.stops.map((s) => ({
    id: s[0],
    name: s[1],
    lat: s[2],
    lon: s[3],
  }));
  const routes: GtfsRoute[] = raw.routes.map((r) => ({
    id: r[0],
    agency: r[1],
    short: r[2],
    long: r[3],
  }));
  const trips: GtfsTrip[] = raw.trips.map((t) => ({
    route: t[0],
    dir: t[1],
    headsign: t[2],
    stops: t[3],
    times: t[4],
  }));
  const stopTrips: number[][] = Array.from({ length: stops.length }, () => []);
  trips.forEach((trip, ti) => {
    for (let seq = 0; seq < trip.stops.length; seq++) {
      stopTrips[trip.stops[seq]].push(ti * 4096 + seq);
    }
  });
  return {
    version: INDEX_VERSION,
    feedStart: raw.feedStart,
    feedEnd: raw.feedEnd,
    agencies: raw.agencies,
    stops,
    routes,
    trips,
    stopTrips,
  };
}

export async function getTransitStatus(baseUrl?: string): Promise<{
  ready: boolean;
  loading: boolean;
  error: string | null;
  agencies?: string[];
  routes?: number;
  stops?: number;
  feedStart?: string;
  feedEnd?: string;
}> {
  if (cached) {
    const idx = await cached;
    return {
      ready: true,
      loading: false,
      error: null,
      agencies: idx.agencies,
      routes: idx.routes.length,
      stops: idx.stops.length,
      feedStart: idx.feedStart,
      feedEnd: idx.feedEnd,
    };
  }
  void ensureGtfs(baseUrl).catch(() => undefined);
  return { ready: false, loading: true, error: loadError };
}

async function buildIndex(): Promise<GtfsIndex> {
  try {
    const raw = await fs.readFile(INDEX_PATH, "utf-8");
    const parsed = JSON.parse(raw) as GtfsIndex;
    if (parsed.version === INDEX_VERSION && parsed.trips.length > 0) {
      return parsed;
    }
  } catch {
    // fall through to full build
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Feed download failed (${res.status})`);
  const zip = await JSZip.loadAsync(await res.arrayBuffer());

  const text = async (name: string): Promise<string> => {
    const f = zip.file(name);
    if (!f) throw new Error(`Feed missing ${name}`);
    return f.async("string");
  };

  const feedInfo = parseLine((await text("feed_info.txt")).split("\n")[1] ?? "");
  const feedStart = feedInfo[3] ?? "";
  const feedEnd = feedInfo[4] ?? "";

  const stopRows = (await text("stops.txt")).split("\n");
  const stops: GtfsStop[] = [];
  const stopIdx = new Map<string, number>();
  for (let i = 1; i < stopRows.length; i++) {
    const line = stopRows[i].trim();
    if (!line) continue;
    const c = parseLine(line);
    const lat = Number(c[2]);
    const lon = Number(c[3]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    stopIdx.set(c[0], stops.length);
    stops.push({ id: c[0], name: c[1], lat, lon });
  }

  const routeRows = (await text("routes.txt")).split("\n");
  const routes: GtfsRoute[] = [];
  const routeIdx = new Map<string, number>();
  for (let i = 1; i < routeRows.length; i++) {
    const line = routeRows[i].trim();
    if (!line) continue;
    const c = parseLine(line);
    routeIdx.set(c[0], routes.length);
    routes.push({ id: c[0], agency: c[1], short: c[2], long: c[3] ?? "" });
  }

  const tripRows = (await text("trips.txt")).split("\n");
  const tripMeta = new Map<string, { route: number; dir: number; headsign: string }>();
  for (let i = 1; i < tripRows.length; i++) {
    const line = tripRows[i].trim();
    if (!line) continue;
    const c = parseLine(line);
    const r = routeIdx.get(c[0]);
    if (r == null) continue;
    tripMeta.set(c[2], {
      route: r,
      dir: Number(c[4] ?? 0) === 1 ? 1 : 0,
      headsign: c[3] ?? "",
    });
  }

  const trips: GtfsTrip[] = [];
  const tripPos = new Map<string, number>();
  const stText = await text("stop_times.txt");
  let start = 0;
  const pushTrip = (id: string, stopsArr: number[], timesArr: number[]) => {
    const meta = tripMeta.get(id);
    if (!meta || stopsArr.length < 2) return;
    tripPos.set(id, trips.length);
    trips.push({ route: meta.route, dir: meta.dir, headsign: meta.headsign, stops: stopsArr, times: timesArr });
  };
  let curId = "";
  let curStops: number[] = [];
  let curTimes: number[] = [];
  for (let i = 0; i <= stText.length; i++) {
    if (i === stText.length || stText[i] === "\n") {
      const line = stText.slice(start, i).trim();
      start = i + 1;
      if (!line || line.startsWith("trip_id")) continue;
      const c = parseLine(line);
      if (c.length < 5) continue;
      if (c[0] !== curId) {
        if (curId) pushTrip(curId, curStops, curTimes);
        curId = c[0];
        curStops = [];
        curTimes = [];
      }
      const s = stopIdx.get(c[3]);
      const t = parseTime(c[2]);
      if (s == null || t < 0) continue;
      curStops.push(s);
      curTimes.push(t);
    }
  }
  if (curId) pushTrip(curId, curStops, curTimes);

  const stopTrips: number[][] = Array.from({ length: stops.length }, () => []);
  trips.forEach((trip, ti) => {
    for (let seq = 0; seq < trip.stops.length; seq++) {
      stopTrips[trip.stops[seq]].push(ti * 4096 + seq);
    }
  });

  const agencies = [...new Set(routes.map((r) => r.agency))];
  const index: GtfsIndex = {
    version: INDEX_VERSION,
    feedStart,
    feedEnd,
    agencies,
    stops,
    routes,
    trips,
    stopTrips,
  };
  await fs.writeFile(INDEX_PATH, JSON.stringify(index));
  return index;
}

export interface BusItinerary {
  agency: string;
  routeShort: string;
  routeLong: string;
  headsign: string;
  direction: number;
  fromStop: { name: string; lat: number; lon: number };
  toStop: { name: string; lat: number; lon: number };
  departures: Array<{ depart: number; arrive: number }>;
  stopsBetween: number;
}

export function nearbyStops(
  idx: GtfsIndex,
  lat: number,
  lon: number,
  radiusKm = 0.9,
): number[] {
  const out: number[] = [];
  for (let i = 0; i < idx.stops.length; i++) {
    const s = idx.stops[i];
    if (haversineKm(lat, lon, s.lat, s.lon) <= radiusKm) out.push(i);
  }
  return out;
}

export function planBus(
  idx: GtfsIndex,
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
  departSec: number,
  limit = 5,
): BusItinerary[] {
  const aStops = nearbyStops(idx, aLat, aLon).sort(
    (x, y) =>
      haversineKm(aLat, aLon, idx.stops[x].lat, idx.stops[x].lon) -
      haversineKm(aLat, aLon, idx.stops[y].lat, idx.stops[y].lon),
  );
  const bSet = new Set(nearbyStops(idx, bLat, bLon));
  if (aStops.length === 0 || bSet.size === 0) return [];

  const groups = new Map<
    string,
    {
      tripIdx: number;
      seqA: number;
      seqB: number;
      departures: Array<{ depart: number; arrive: number }>;
    }
  >();

  const seenTrips = new Set<number>();
  for (const a of aStops) {
    for (const packed of idx.stopTrips[a]) {
      const tripIdx = Math.floor(packed / 4096);
      if (seenTrips.has(tripIdx)) continue;
      seenTrips.add(tripIdx);
      const trip = idx.trips[tripIdx];
      const seqA = packed % 4096;
      for (let seqB = seqA + 1; seqB < trip.stops.length; seqB++) {
        if (!bSet.has(trip.stops[seqB])) continue;
        const dep = trip.times[seqA];
        if (dep < departSec || dep > departSec + 3 * 3600) continue;
        const key = `${trip.route}|${trip.dir}|${trip.stops[seqA]}|${trip.stops[seqB]}`;
        let g = groups.get(key);
        if (!g) {
          g = { tripIdx, seqA, seqB, departures: [] };
          groups.set(key, g);
        }
        if (g.departures.length < 3) {
          g.departures.push({ depart: dep, arrive: trip.times[seqB] });
        }
      }
    }
  }

  const options: BusItinerary[] = [];
  for (const g of groups.values()) {
    if (g.departures.length === 0) continue;
    g.departures.sort((x, y) => x.depart - y.depart);
    const trip = idx.trips[g.tripIdx];
    const route = idx.routes[trip.route];
    const fromStop = idx.stops[trip.stops[g.seqA]];
    const toStop = idx.stops[trip.stops[g.seqB]];
    options.push({
      agency: route.agency,
      routeShort: route.short,
      routeLong: route.long,
      headsign: trip.headsign,
      direction: trip.dir,
      fromStop: { name: fromStop.name, lat: fromStop.lat, lon: fromStop.lon },
      toStop: { name: toStop.name, lat: toStop.lat, lon: toStop.lon },
      departures: g.departures,
      stopsBetween: g.seqB - g.seqA,
    });
  }
  options.sort((a, b) => a.departures[0].depart - b.departures[0].depart);
  return options.slice(0, limit);
}
