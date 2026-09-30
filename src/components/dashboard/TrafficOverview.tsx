"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  LEVEL_COLORS,
  LEVEL_LABELS,
  getTrafficSnapshot,
  type TrafficLevel,
} from "@/lib/traffic";
import { CORRIDORS } from "@/lib/corridors";
import {
  initLeafletMap,
  releaseLeafletMap,
  type LeafletCtx,
} from "@/components/map/leaflet";
import { useCorridorGeometry } from "@/components/map/useCorridors";

export function TrafficOverview() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [ctx, setCtx] = useState<LeafletCtx | null>(null);
  const [snapshot, setSnapshot] = useState(() => getTrafficSnapshot());
  const geom = useCorridorGeometry();

  useEffect(() => {
    if (!container) return;
    let cancelled = false;
    let live: LeafletCtx | null = null;
    initLeafletMap(container, [19.12, 72.86], 10).then((c) => {
      if (cancelled) {
        releaseLeafletMap(container, c.map);
        return;
      }
      live = c;
      c.map.fitBounds(
        CORRIDORS.flatMap((r) => [
          [r.from.lat, r.from.lon],
          [r.to.lat, r.to.lon],
        ]) as Array<[number, number]>,
        { padding: [16, 16] },
      );
      setCtx(c);
    });
    return () => {
      cancelled = true;
      if (live) {
        releaseLeafletMap(container, live.map);
        live = null;
      }
      setCtx(null);
    };
  }, [container]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshot(getTrafficSnapshot());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!ctx) return;
    const { L, layer } = ctx;
    layer.clearLayers();
    CORRIDORS.forEach((corridor, i) => {
      const level = snapshot.roads[i]?.level ?? "flowing";
      const raw = geom[corridor.id];
      const path: Array<[number, number]> = raw
        ? raw.map(([lon, lat]) => [lat, lon] as [number, number])
        : [
            [corridor.from.lat, corridor.from.lon],
            [corridor.to.lat, corridor.to.lon],
          ];
      L.polyline(path, {
        color: LEVEL_COLORS[level],
        weight: 5,
        opacity: 0.9,
        lineCap: "round",
      }).addTo(layer);
    });
  }, [ctx, snapshot, geom]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-xl border border-[#E8E8E8] bg-white p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#111111]">Traffic overview</h2>
        <Link
          href="/dashboard/traffic"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#111111] hover:underline"
        >
          Full map
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <p className="text-sm text-[#6B6B6B] mb-4">
        Live corridor status on the real road network · Updated{" "}
        {snapshot.updatedLabel}
      </p>
      <div className="relative h-48 rounded-xl border border-[#E8E8E8] overflow-hidden">
        <div ref={setContainer} className="absolute inset-0 z-0" />
        <div className="absolute bottom-3 right-3 z-10 flex gap-3 rounded-full border border-[#E8E8E8] bg-white px-3 py-1.5">
          {(Object.keys(LEVEL_LABELS) as TrafficLevel[]).map((level) => (
            <span
              key={level}
              className="flex items-center gap-1.5 text-xs text-[#6B6B6B]"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: LEVEL_COLORS[level] }}
              />
              {LEVEL_LABELS[level]}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
