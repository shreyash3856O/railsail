// Pre-builds a compact GTFS index for one-click deploys.
// Run: node scripts/build-gtfs-index.mjs
// Output: public/gtfs-index.json (gitignored, generated at build time via `prebuild`)
// The server loads this file at runtime instead of downloading + parsing the
// 140 MB stop_times.txt on first request (which serverless platforms kill).
import JSZip from "jszip";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FEED_URL =
  "https://raw.githubusercontent.com/croyla/mumbai-gtfs/main/gtfs.zip";
const DATA_DIR = path.join(ROOT, "data", "gtfs");
const ZIP_PATH = path.join(DATA_DIR, "gtfs.zip");
const OUT_PATH = path.join(ROOT, "public", "gtfs-index.json");

function parseLine(line) {
  const out = [];
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

function parseTime(s) {
  const parts = s.split(":").map(Number);
  if (parts.length < 2 || parts.some((n) => !Number.isFinite(n))) return -1;
  return parts[0] * 3600 + parts[1] * 60 + (parts[2] ?? 0);
}

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let zipData;
  try {
    const stat = await fs.stat(ZIP_PATH);
    if (stat.size > 10_000_000) {
      console.log(`Reusing cached ${ZIP_PATH}`);
      zipData = await fs.readFile(ZIP_PATH);
    } else {
      throw new Error("too small, redownload");
    }
  } catch {
    console.log(`Downloading ${FEED_URL} ...`);
    const res = await fetch(FEED_URL);
    if (!res.ok) throw new Error(`Feed download failed (${res.status})`);
    zipData = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(ZIP_PATH, zipData);
    console.log(`Saved ${(zipData.length / 1e6).toFixed(1)} MB`);
  }

  const zip = await JSZip.loadAsync(zipData);
  const text = async (name) => {
    const f = zip.file(name);
    if (!f) throw new Error(`Feed missing ${name}`);
    return f.async("string");
  };

  const feedInfo = parseLine((await text("feed_info.txt")).split("\n")[1] ?? "");

  const stops = [];
  const stopIdx = new Map();
  for (const line of (await text("stops.txt")).split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("stop_id")) continue;
    const c = parseLine(t);
    const lat = Number(c[2]);
    const lon = Number(c[3]);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    stopIdx.set(c[0], stops.length);
    stops.push([c[0], c[1], lat, lon]);
  }

  const routes = [];
  const routeIdx = new Map();
  for (const line of (await text("routes.txt")).split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("route_id")) continue;
    const c = parseLine(t);
    routeIdx.set(c[0], routes.length);
    routes.push([c[0], c[1], c[2], c[3] ?? ""]);
  }

  const tripMeta = new Map();
  for (const line of (await text("trips.txt")).split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("route_id")) continue;
    const c = parseLine(t);
    const r = routeIdx.get(c[0]);
    if (r == null) continue;
    tripMeta.set(c[2], [r, Number(c[4] ?? 0) === 1 ? 1 : 0, c[3] ?? ""]);
  }

  const trips = [];
  const stText = await text("stop_times.txt");
  let curId = "";
  let curStops = [];
  let curTimes = [];
  const flush = () => {
    if (!curId || curStops.length < 2) return;
    const meta = tripMeta.get(curId);
    if (meta) trips.push([meta[0], meta[1], meta[2], curStops, curTimes]);
  };
  let start = 0;
  for (let i = 0; i <= stText.length; i++) {
    if (i === stText.length || stText[i] === "\n") {
      const line = stText.slice(start, i).trim();
      start = i + 1;
      if (!line || line.startsWith("trip_id")) continue;
      const c = parseLine(line);
      if (c.length < 5) continue;
      if (c[0] !== curId) {
        flush();
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
  flush();

  const index = {
    version: 1,
    feedStart: feedInfo[3] ?? "",
    feedEnd: feedInfo[4] ?? "",
    agencies: [...new Set(routes.map((r) => r[1]))],
    stops,
    routes,
    trips,
  };
  await fs.writeFile(OUT_PATH, JSON.stringify(index));
  const mb = (await fs.stat(OUT_PATH)).size / 1e6;
  console.log(
    `Wrote ${OUT_PATH} (${mb.toFixed(1)} MB): ${stops.length} stops, ${routes.length} routes, ${trips.length} trips`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
