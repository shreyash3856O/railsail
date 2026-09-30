export interface BusApiOption {
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

export interface TransitStatus {
  ready: boolean;
  loading: boolean;
  error: string | null;
  agencies?: string[];
  routes?: number;
  stops?: number;
  feedStart?: string;
  feedEnd?: string;
}

export async function getTransitStatus(): Promise<TransitStatus> {
  const res = await fetch("/api/transit/status", { cache: "no-store" });
  if (!res.ok) throw new Error(`Status failed (${res.status})`);
  return (await res.json()) as TransitStatus;
}

export async function getBusOptions(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
  departAt: Date,
): Promise<BusApiOption[]> {
  const depart =
    departAt.getHours() * 3600 + departAt.getMinutes() * 60 + departAt.getSeconds();
  const params = new URLSearchParams({
    aLat: String(aLat),
    aLon: String(aLon),
    bLat: String(bLat),
    bLon: String(bLon),
    depart: String(depart),
  });
  const res = await fetch(`/api/transit/buses?${params.toString()}`);
  if (!res.ok) throw new Error(`Bus query failed (${res.status})`);
  const data = (await res.json()) as { options?: BusApiOption[]; error?: string };
  if (data.error) throw new Error(data.error);
  return data.options ?? [];
}

export function formatGtfsClock(totalSeconds: number): string {
  const s = ((Math.round(totalSeconds) % 86400) + 86400) % 86400;
  let h = Math.floor(s / 3600);
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${suffix}`;
}
