import {
  fetchRoute,
  type Place,
  type RouteResult,
} from "./geo";
import { WESTERN_STATIONS, nearestStation, type Station } from "./stations";
import {
  autoFare,
  suburbanRailFare,
  trafficAdjustment,
  trainFrequency,
} from "./fares";

export type TransitMode = "driving" | "train" | "auto" | "bus" | "foot" | "bike";

export interface HybridLeg {
  mode: "walk" | "train" | "bus" | "auto";
  fromLabel: string;
  toLabel: string;
  distanceM: number;
  durationS: number;
  costINR: number;
  note?: string;
  geometry: Array<[number, number]>;
  dashed?: boolean;
}

export interface RoadOption {
  distanceM: number;
  durationS: number;
  costINR: number;
  geometry: Array<[number, number]>;
}

export type ComboId = "ww" | "aw" | "wa" | "aa";

export interface Combo {
  id: ComboId;
  access: "walk" | "auto";
  egress: "walk" | "auto";
  label: string;
  costINR: number;
  timeS: number;
  available: boolean;
}

export interface TransitPlan {
  stationA: Station;
  stationB: Station;
  railKm: number;
  stops: number;
  fareINR: number;
  waitMin: number;
  frequencyLabel: string;
  departAt: number;
  fromLabel: string;
  toLabel: string;
  accessWalk: RouteResult;
  accessAuto: RoadOption | null;
  egressWalk: RouteResult;
  egressAuto: RoadOption | null;
  trainTimeS: number;
  combos: Combo[];
}

const MAX_STATION_ACCESS_KM = 4;
const TRAIN_AVG_KMPH = 40;

async function quiet<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p;
  } catch {
    return null;
  }
}

async function autoOption(
  a: Pick<Place, "lat" | "lon">,
  b: Pick<Place, "lat" | "lon">,
  walkM: number,
  at: Date,
): Promise<RoadOption | null> {
  if (walkM <= 1500) return null;
  const road = await quiet(fetchRoute(a, b, "driving"));
  if (!road) return null;
  const adj = trafficAdjustment(at);
  return {
    distanceM: road.distanceM,
    durationS: road.durationS * adj.factor,
    costINR: autoFare(road.distanceM / 1000, at),
    geometry: road.geometry,
  };
}

export async function buildTransitPlan(
  from: Place,
  to: Place,
  departAt: Date = new Date(),
): Promise<TransitPlan | null> {
  const nearA = nearestStation(from.lat, from.lon);
  const nearB = nearestStation(to.lat, to.lon);
  if (
    nearA.distanceKm > MAX_STATION_ACCESS_KM ||
    nearB.distanceKm > MAX_STATION_ACCESS_KM ||
    nearA.station.code === nearB.station.code
  ) {
    return null;
  }

  const freq = trainFrequency(departAt);
  if (!freq.running) return null;

  const [walk1, walk2] = await Promise.all([
    quiet(fetchRoute(from, nearA.station, "foot")),
    quiet(fetchRoute(nearB.station, to, "foot")),
  ]);
  if (!walk1 || !walk2) return null;

  const [accessAuto, egressAuto] = await Promise.all([
    autoOption(from, nearA.station, walk1.distanceM, departAt),
    autoOption(nearB.station, to, walk2.distanceM, departAt),
  ]);

  const railKm = Math.abs(nearB.station.km - nearA.station.km);
  const orderA = WESTERN_STATIONS.findIndex(
    (s) => s.code === nearA.station.code,
  );
  const orderB = WESTERN_STATIONS.findIndex(
    (s) => s.code === nearB.station.code,
  );
  const stops = Math.max(0, Math.abs(orderB - orderA) - 1);
  const trainTimeS = (railKm / TRAIN_AVG_KMPH) * 3600;
  const fareINR = suburbanRailFare(railKm);
  const waitS = freq.waitMin * 60;

  const combos: Combo[] = [
    {
      id: "ww",
      access: "walk",
      egress: "walk",
      label: "Walk, train, walk",
      costINR: fareINR,
      timeS: walk1.durationS + waitS + trainTimeS + walk2.durationS,
      available: true,
    },
    {
      id: "aw",
      access: "auto",
      egress: "walk",
      label: "Auto, train, walk",
      costINR: accessAuto ? fareINR + accessAuto.costINR : 0,
      timeS: accessAuto
        ? accessAuto.durationS + waitS + trainTimeS + walk2.durationS
        : 0,
      available: accessAuto != null,
    },
    {
      id: "wa",
      access: "walk",
      egress: "auto",
      label: "Walk, train, auto",
      costINR: egressAuto ? fareINR + egressAuto.costINR : 0,
      timeS: egressAuto
        ? walk1.durationS + waitS + trainTimeS + egressAuto.durationS
        : 0,
      available: egressAuto != null,
    },
    {
      id: "aa",
      access: "auto",
      egress: "auto",
      label: "Auto, train, auto",
      costINR:
        accessAuto && egressAuto
          ? fareINR + accessAuto.costINR + egressAuto.costINR
          : 0,
      timeS:
        accessAuto && egressAuto
          ? accessAuto.durationS +
            waitS +
            trainTimeS +
            egressAuto.durationS
          : 0,
      available: accessAuto != null && egressAuto != null,
    },
  ];

  return {
    stationA: nearA.station,
    stationB: nearB.station,
    railKm,
    stops,
    fareINR,
    waitMin: freq.waitMin,
    frequencyLabel: freq.label,
    departAt: departAt.getTime(),
    fromLabel: from.shortName,
    toLabel: to.shortName,
    accessWalk: walk1,
    accessAuto,
    egressWalk: walk2,
    egressAuto,
    trainTimeS,
    combos,
  };
}

export function cheapestCombo(plan: TransitPlan): Combo {
  const avail = plan.combos.filter((c) => c.available);
  return avail.reduce((a, b) => (a.costINR <= b.costINR ? a : b));
}

export function comboLegs(plan: TransitPlan, comboId: ComboId): HybridLeg[] {
  const combo = plan.combos.find((c) => c.id === comboId) ?? plan.combos[0];
  const accessAuto = combo.access === "auto" ? plan.accessAuto : null;
  const egressAuto = combo.egress === "auto" ? plan.egressAuto : null;
  const legs: HybridLeg[] = [];
  if (accessAuto) {
    legs.push({
      mode: "auto",
      fromLabel: plan.fromLabel,
      toLabel: `${plan.stationA.name} station`,
      distanceM: accessAuto.distanceM,
      durationS: accessAuto.durationS,
      costINR: accessAuto.costINR,
      note: "MMRTA meter tariff",
      geometry: accessAuto.geometry,
    });
  } else {
    legs.push({
      mode: "walk",
      fromLabel: plan.fromLabel,
      toLabel: `${plan.stationA.name} station`,
      distanceM: plan.accessWalk.distanceM,
      durationS: plan.accessWalk.durationS,
      costINR: 0,
      geometry: plan.accessWalk.geometry,
    });
  }
  legs.push({
    mode: "train",
    fromLabel: plan.stationA.name,
    toLabel: plan.stationB.name,
    distanceM: plan.railKm * 1000,
    durationS: plan.trainTimeS,
    costINR: plan.fareINR,
    note: `Slow local, ${plan.stops} stops, ${plan.frequencyLabel.toLowerCase()}`,
    geometry: [
      [plan.stationA.lon, plan.stationA.lat],
      [plan.stationB.lon, plan.stationB.lat],
    ],
    dashed: true,
  });
  if (egressAuto) {
    legs.push({
      mode: "auto",
      fromLabel: `${plan.stationB.name} station`,
      toLabel: plan.toLabel,
      distanceM: egressAuto.distanceM,
      durationS: egressAuto.durationS,
      costINR: egressAuto.costINR,
      note: "MMRTA meter tariff",
      geometry: egressAuto.geometry,
    });
  } else {
    legs.push({
      mode: "walk",
      fromLabel: `${plan.stationB.name} station`,
      toLabel: plan.toLabel,
      distanceM: plan.egressWalk.distanceM,
      durationS: plan.egressWalk.durationS,
      costINR: 0,
      geometry: plan.egressWalk.geometry,
    });
  }
  return legs;
}

export function legClockTimes(
  departAtMs: number,
  legs: HybridLeg[],
  waitMin: number,
): Array<{ start: number; end: number }> {
  const times: Array<{ start: number; end: number }> = [];
  let cursor = departAtMs;
  for (const leg of legs) {
    if (leg.mode === "train") cursor += waitMin * 60 * 1000;
    const start = cursor;
    cursor += leg.durationS * 1000;
    times.push({ start, end: cursor });
  }
  return times;
}

export function formatClock(ms: number): string {
  const d = new Date(ms);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${suffix}`;
}

export interface AutoPlan {
  result: RouteResult;
  costINR: number;
  peakLabel: string;
}

export async function buildAutoPlan(
  from: Pick<Place, "lat" | "lon">,
  to: Pick<Place, "lat" | "lon">,
  now: Date = new Date(),
): Promise<AutoPlan> {
  const result = await fetchRoute(from, to, "driving");
  const adj = trafficAdjustment(now);
  return {
    result: {
      ...result,
      durationS: result.durationS * adj.factor,
    },
    costINR: autoFare(result.distanceM / 1000, now),
    peakLabel: adj.label,
  };
}

export interface DrivePlan {
  result: RouteResult;
  fuelINR: number;
  peakLabel: string;
}

export function drivePlanFrom(
  result: RouteResult,
  distanceKm: number,
  now: Date,
  fuelPerKm: number,
): DrivePlan {
  const adj = trafficAdjustment(now);
  return {
    result: { ...result, durationS: result.durationS * adj.factor },
    fuelINR: Math.round(distanceKm * fuelPerKm),
    peakLabel: adj.label,
  };
}
