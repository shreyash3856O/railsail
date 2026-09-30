export interface Station {
  name: string;
  code: string;
  lat: number;
  lon: number;
  km: number;
}

export const WESTERN_STATIONS: Station[] = [
  { name: "Churchgate", code: "CCG", lat: 18.9357, lon: 72.8273, km: 0 },
  { name: "Marine Lines", code: "MEL", lat: 18.9445, lon: 72.8238, km: 1 },
  { name: "Charni Road", code: "CYR", lat: 18.9516, lon: 72.8195, km: 3 },
  { name: "Grant Road", code: "GTR", lat: 18.9634, lon: 72.8172, km: 4 },
  { name: "Mumbai Central", code: "MMCT", lat: 18.9695, lon: 72.8194, km: 5 },
  { name: "Mahalaxmi", code: "MX", lat: 18.9825, lon: 72.8245, km: 7 },
  { name: "Lower Parel", code: "PL", lat: 18.995, lon: 72.83, km: 8 },
  { name: "Prabhadevi", code: "PBHD", lat: 19.0085, lon: 72.837, km: 10 },
  { name: "Dadar", code: "DDR", lat: 19.018, lon: 72.8433, km: 11 },
  { name: "Matunga Road", code: "MRU", lat: 19.027, lon: 72.846, km: 13 },
  { name: "Mahim Jn", code: "MM", lat: 19.039, lon: 72.84, km: 14 },
  { name: "Bandra", code: "BA", lat: 19.0544, lon: 72.8402, km: 16 },
  { name: "Khar Road", code: "KHAR", lat: 19.067, lon: 72.839, km: 18 },
  { name: "Santacruz", code: "STC", lat: 19.081, lon: 72.841, km: 20 },
  { name: "Vile Parle", code: "VLP", lat: 19.096, lon: 72.844, km: 21 },
  { name: "Andheri", code: "ADH", lat: 19.1197, lon: 72.8464, km: 23 },
  { name: "Jogeshwari", code: "JOS", lat: 19.134, lon: 72.847, km: 25 },
  { name: "Ram Mandir", code: "RMD", lat: 19.145, lon: 72.848, km: 27 },
  { name: "Goregaon", code: "GMN", lat: 19.166, lon: 72.852, km: 29 },
  { name: "Malad", code: "MDD", lat: 19.187, lon: 72.847, km: 30 },
  { name: "Kandivali", code: "KILE", lat: 19.205, lon: 72.85, km: 32 },
  { name: "Borivali", code: "BVI", lat: 19.2297, lon: 72.8592, km: 34 },
  { name: "Dahisar", code: "DIC", lat: 19.25, lon: 72.857, km: 36 },
  { name: "Mira Road", code: "MIRA", lat: 19.2952, lon: 72.8544, km: 39 },
  { name: "Bhayandar", code: "BYR", lat: 19.312, lon: 72.8475, km: 42 },
  { name: "Naigaon", code: "NIG", lat: 19.3517, lon: 72.8392, km: 46 },
  { name: "Vasai Road", code: "BSR", lat: 19.3818, lon: 72.8313, km: 49 },
  { name: "Nallasopara", code: "NSP", lat: 19.4154, lon: 72.8092, km: 53 },
  { name: "Virar", code: "VR", lat: 19.4559, lon: 72.8115, km: 58 },
];

function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
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

export function nearestStation(
  lat: number,
  lon: number,
): { station: Station; distanceKm: number } {
  let best = WESTERN_STATIONS[0];
  let bestD = Infinity;
  for (const s of WESTERN_STATIONS) {
    const d = haversineKm(lat, lon, s.lat, s.lon);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return { station: best, distanceKm: bestD };
}
