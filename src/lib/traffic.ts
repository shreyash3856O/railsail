export type TrafficLevel = "flowing" | "busy" | "congested";

export interface RoadStatus {
  name: string;
  level: TrafficLevel;
  delayMin: number;
}

export interface TrafficSnapshot {
  minuteBucket: number;
  updatedLabel: string;
  roads: RoadStatus[];
  avgDelayMin: number;
  segmentLevels: TrafficLevel[];
}

const ROAD_NAMES = [
  "Western Express Highway",
  "S.V. Road",
  "LBS Marg",
  "Eastern Express Highway",
];

const SEGMENT_PATHS = [
  "M 50 250 L 200 200 L 350 150",
  "M 350 150 L 500 200 L 550 300",
  "M 200 200 L 250 350 L 200 450",
  "M 100 100 L 200 150 L 300 100",
  "M 400 250 L 450 380 L 400 450",
];

function isRushHour(hour: number): boolean {
  return (hour >= 8 && hour < 11) || (hour >= 17 && hour < 21);
}

function levelFor(index: number, bucket: number, rush: boolean): TrafficLevel {
  const n = (bucket + index * 2 + (rush ? index % 2 : 0)) % 3;
  if (n === 0) return "flowing";
  if (n === 1) return "busy";
  return "congested";
}

function delayFor(level: TrafficLevel, index: number, bucket: number): number {
  const base = 4 + index * 2 + (bucket % 4);
  if (level === "flowing") return base;
  if (level === "busy") return base + 5;
  return base + 11;
}

export function getTrafficSnapshot(now: Date = new Date()): TrafficSnapshot {
  const bucket = Math.floor(now.getTime() / 60000 / 10);
  const rush = isRushHour(now.getHours());
  const roads: RoadStatus[] = ROAD_NAMES.map((name, i) => {
    const level = levelFor(i, bucket, rush);
    return { name, level, delayMin: delayFor(level, i, bucket) };
  });
  const segmentLevels = SEGMENT_PATHS.map((_, i) =>
    levelFor(i + 1, bucket, rush),
  );
  const avgDelayMin = Math.round(
    roads.reduce((sum, r) => sum + r.delayMin, 0) / roads.length,
  );
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return {
    minuteBucket: bucket,
    updatedLabel: `${hh}:${mm}`,
    roads,
    avgDelayMin,
    segmentLevels,
  };
}

export const LEVEL_COLORS: Record<TrafficLevel, string> = {
  flowing: "#111111",
  busy: "#B98A00",
  congested: "#C43030",
};

export const LEVEL_LABELS: Record<TrafficLevel, string> = {
  flowing: "Flowing",
  busy: "Busy",
  congested: "Congested",
};

export function getSegmentPaths(): string[] {
  return SEGMENT_PATHS;
}
