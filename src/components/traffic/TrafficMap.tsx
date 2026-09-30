"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LEVEL_COLORS,
  LEVEL_LABELS,
  getTrafficSnapshot,
  type TrafficLevel,
} from "@/lib/traffic";
import { CORRIDORS } from "@/lib/corridors";
import { initLeafletMap, releaseLeafletMap, type LeafletCtx } from "@/components/map/leaflet";
import { useCorridorGeometry } from "@/components/map/useCorridors";
import type * as Leaflet from "leaflet";

type ViewMode = "heatmap" | "density" | "peak";

interface TrafficMapProps {
  viewMode: ViewMode;
}

type LatLon = [number, number];

function toLatLon(geom: Array<[number, number]>): LatLon[] {
  return geom.map(([lon, lat]) => [lat, lon]);
}

function midpoint(path: LatLon[]): LatLon {
  return path[Math.floor(path.length / 2)];
}

function drawTraffic(
  ctx: LeafletCtx,
  viewMode: ViewMode,
  levels: TrafficLevel[],
  delays: number[],
  geom: Record<string, Array<[number, number]>>,
) {
  const { L, layer } = ctx;
  layer.clearLayers();
  CORRIDORS.forEach((corridor, i) => {
    const level = levels[i] ?? "flowing";
    const delay = delays[i] ?? 0;
    const color = LEVEL_COLORS[level];
    const raw = geom[corridor.id];
    const path: LatLon[] = raw
      ? toLatLon(raw)
      : [
          [corridor.from.lat, corridor.from.lon],
          [corridor.to.lat, corridor.to.lon],
        ];
    const mid = midpoint(path);

    if (viewMode === "heatmap") {
      L.circle(mid, {
        radius: 2200,
        color,
        weight: 0,
        fillColor: color,
        fillOpacity: 0.22,
      }).addTo(layer);
      L.polyline(path, { color, weight: 4, opacity: 0.85 }).addTo(layer);
    } else if (viewMode === "density") {
      L.polyline(path, {
        color,
        weight: 14,
        opacity: 0.35,
        lineCap: "round",
      }).addTo(layer);
      L.polyline(path, { color, weight: 4, opacity: 0.9 }).addTo(layer);
    } else {
      L.polyline(path, {
        color: "#111111",
        weight: 7,
        opacity: 0.12,
        lineCap: "round",
      }).addTo(layer);
      L.polyline(path, {
        color,
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
      }).addTo(layer);
    }

    L.tooltip({
      permanent: true,
      direction: "top",
      offset: [0, -8],
      className: "corridor-tip",
    })
      .setLatLng(mid)
      .setContent(
        `${corridor.name} · ${LEVEL_LABELS[level]} · ${delay} min`,
      )
      .addTo(layer);

    corridor.junctions.forEach((j) => {
      L.circleMarker([j.lat, j.lon], {
        radius: 5,
        color: "#111111",
        weight: 2,
        fillColor: "#ffffff",
        fillOpacity: 1,
      })
        .bindTooltip(j.name, { direction: "top", offset: [0, -6] })
        .addTo(layer);
    });
  });
}

function corridorsBounds(): Leaflet.LatLngBoundsExpression {
  const all: LatLon[] = CORRIDORS.flatMap((c) => [
    [c.from.lat, c.from.lon] as LatLon,
    [c.to.lat, c.to.lon] as LatLon,
  ]);
  return all;
}

export function TrafficMap({ viewMode }: TrafficMapProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [ctx, setCtx] = useState<LeafletCtx | null>(null);
  const [snapshot, setSnapshot] = useState(() => getTrafficSnapshot());
  const geom = useCorridorGeometry();

  useEffect(() => {
    if (!container) return;
    let cancelled = false;
    let live: LeafletCtx | null = null;
    initLeafletMap(container, [19.12, 72.86], 11).then((c) => {
      if (cancelled) {
        releaseLeafletMap(container, c.map);
        return;
      }
      live = c;
      c.map.fitBounds(corridorsBounds(), { padding: [40, 40] });
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
    drawTraffic(
      ctx,
      viewMode,
      snapshot.roads.map((r) => r.level),
      snapshot.roads.map((r) => r.delayMin),
      geom,
    );
  }, [ctx, viewMode, snapshot, geom]);

  return (
    <div className="relative w-full h-[calc(100vh-10rem)] min-h-[400px] bg-[#FAFAFA] overflow-hidden">
      <div ref={setContainer} className="absolute inset-0 z-0" />

      <div className="absolute top-4 right-4 z-10 rounded-full border border-[#E8E8E8] bg-white px-4 py-1.5 text-xs text-[#6B6B6B] shadow-sm">
        Simulated levels on real roads · Updated {snapshot.updatedLabel}
      </div>

      <AnimatePresence>
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-4 left-4 z-10 rounded-xl border border-[#E8E8E8] bg-white px-4 py-2 shadow-sm pointer-events-none"
        >
          <p className="text-xs font-medium text-[#6B6B6B] mb-2">Traffic level</p>
          <div className="flex gap-4">
            {(Object.keys(LEVEL_LABELS) as TrafficLevel[]).map((level) => (
              <span key={level} className="flex items-center gap-1.5 text-xs text-[#111111]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: LEVEL_COLORS[level] }}
                />
                {LEVEL_LABELS[level]}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
