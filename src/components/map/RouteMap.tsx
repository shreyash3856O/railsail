"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { initLeafletMap, releaseLeafletMap, type LeafletCtx } from "./leaflet";

interface RouteMapProps {
  geometry: Array<[number, number]> | null;
  segments?: MapSegment[];
  markers?: MapMarker[];
  heightClass?: string;
  emptyLabel?: string;
}

export interface MapMarker {
  lat: number;
  lon: number;
  label?: string;
}

export interface MapSegment {
  geometry: Array<[number, number]>;
  dashed?: boolean;
}

const DEFAULT_CENTER: [number, number] = [19.076, 72.8777];

function drawRoute(
  ctx: LeafletCtx,
  geometry: Array<[number, number]> | null,
  segments?: MapSegment[],
  markers?: MapMarker[],
) {
  const { L, map, layer } = ctx;
  layer.clearLayers();
  const segs: MapSegment[] =
    segments ??
    (geometry && geometry.length >= 2 ? [{ geometry }] : []);
  const valid = segs.filter((s) => s.geometry.length >= 2);
  if (valid.length === 0) {
    if (markers && markers.length > 0) {
      const pts = markers.map(
        (m) => [m.lat, m.lon] as [number, number],
      );
      markers.forEach((m, i) => {
        L.circleMarker([m.lat, m.lon], {
          radius: 8,
          color: "#111111",
          weight: 3,
          fillColor: i === 0 ? "#111111" : "#ffffff",
          fillOpacity: 1,
        })
          .bindTooltip(m.label ?? (i === 0 ? "Start" : "Destination"), {
            permanent: true,
            direction: "top",
            offset: [0, -10],
            className: "corridor-tip",
          })
          .addTo(layer);
      });
      if (pts.length === 1) {
        map.setView(pts[0], 14);
      } else {
        map.fitBounds(L.latLngBounds(pts).pad(0.3));
      }
    }
    return;
  }
  const all: Array<[number, number]> = [];
  for (const seg of valid) {
    const latlngs = seg.geometry.map(([lon, lat]) => [lat, lon]) as Array<
      [number, number]
    >;
    all.push(...latlngs);
    L.polyline(latlngs, {
      color: "#111111",
      weight: 5,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      dashArray: seg.dashed ? "1 8" : undefined,
    }).addTo(layer);
  }
  L.circleMarker(all[0], {
    radius: 8,
    color: "#111111",
    weight: 3,
    fillColor: "#111111",
    fillOpacity: 1,
  }).addTo(layer);
  const last = all[all.length - 1];
  L.circleMarker(last, {
    radius: 8,
    color: "#111111",
    weight: 3,
    fillColor: "#ffffff",
    fillOpacity: 1,
  }).addTo(layer);
  map.fitBounds(L.latLngBounds(all).pad(0.2));
}

export function RouteMap({
  geometry,
  segments,
  markers,
  heightClass = "h-72",
  emptyLabel,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<LeafletCtx | null>(null);
  const geometryRef = useRef<RouteMapProps["geometry"]>(geometry);
  geometryRef.current = geometry;
  const segmentsRef = useRef<RouteMapProps["segments"]>(segments);
  segmentsRef.current = segments;
  const markersRef = useRef<RouteMapProps["markers"]>(markers);
  markersRef.current = markers;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || ctxRef.current) return;
    let cancelled = false;
    let live: LeafletCtx | null = null;
    initLeafletMap(el, DEFAULT_CENTER, 11).then((ctx) => {
      if (cancelled) {
        releaseLeafletMap(el, ctx.map);
        return;
      }
      live = ctx;
      ctxRef.current = ctx;
      drawRoute(ctx, geometryRef.current, segmentsRef.current, markersRef.current);
    });
    return () => {
      cancelled = true;
      if (live) {
        releaseLeafletMap(el, live.map);
        live = null;
      }
      ctxRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (ctxRef.current)
      drawRoute(ctxRef.current, geometry, segments, markers);
  }, [geometry, segments, markers]);

  const hasRoute =
    (!!geometry && geometry.length >= 2) ||
    (!!segments && segments.some((s) => s.geometry.length >= 2)) ||
    (!!markers && markers.length > 0);

  return (
    <div className={`relative ${heightClass} overflow-hidden rounded-xl border border-[#E8E8E8] bg-[#FAFAFA]`}>
      <div ref={containerRef} className="absolute inset-0 z-0" />
      {!hasRoute && emptyLabel && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pointer-events-none">
          <p className="rounded-full border border-[#E8E8E8] bg-white px-4 py-2 text-center text-sm text-[#6B6B6B] shadow-sm">
            {emptyLabel}
          </p>
        </div>
      )}
    </div>
  );
}
