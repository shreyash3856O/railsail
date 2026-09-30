import type { RouteProfile } from "./geo";

export type TripMode = RouteProfile | "train" | "auto" | "bus";

export interface TripRecord {
  id: string;
  from: string;
  to: string;
  profile: TripMode;
  distanceM: number;
  durationS: number;
  geometry: Array<[number, number]>;
  createdAt: number;
  estimated?: boolean;
  costINR?: number;
}

const TRIPS_KEY = "railsail_trips";
const MAX_TRIPS = 30;

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

export function getTrips(): TripRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TRIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TripRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t.id === "string" && Array.isArray(t.geometry))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export function saveTrip(
  trip: Omit<TripRecord, "id" | "createdAt">,
): TripRecord {
  const record: TripRecord = { ...trip, id: makeId(), createdAt: Date.now() };
  if (typeof window !== "undefined") {
    const next = [record, ...getTrips()].slice(0, MAX_TRIPS);
    try {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(next));
    } catch {
      // storage full or unavailable, keep the record in memory only
    }
  }
  return record;
}

export function deleteTrip(id: string): TripRecord[] {
  const next = getTrips().filter((t) => t.id !== id);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TRIPS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  return next;
}
