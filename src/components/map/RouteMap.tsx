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
  interactive?: boolean;
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
          radius: 7,
          color: "#ffffff",
          weight: 2,
          fillColor: i === 0 ? "#ffffff" : "#09090b",
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

    // Glowing outer line for contrast
    L.polyline(latlngs, {
      color: "rgba(255, 255, 255, 0.2)",
      weight: 6,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(layer);

    // Sharp white route vector
    L.polyline(latlngs, {
      color: "#ffffff",
      weight: 3.5,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
      dashArray: seg.dashed ? "4 8" : undefined,
    }).addTo(layer);
  }

  // Origin Marker
  L.circleMarker(all[0], {
    radius: 6,
    color: "#ffffff",
    weight: 2.5,
    fillColor: "#ffffff",
    fillOpacity: 1,
  }).addTo(layer);

  // Destination Marker
  const last = all[all.length - 1];
  L.circleMarker(last, {
    radius: 7,
    color: "#ffffff",
    weight: 2.5,
    fillColor: "#000000",
    fillOpacity: 1,
  }).addTo(layer);

  map.fitBounds(L.latLngBounds(all).pad(0.25));
}

export function RouteMap({
  geometry,
  segments,
  markers,
  heightClass = "h-72",
  emptyLabel,
  interactive = false,
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

      // On non-interactive preview cards, disable gesture capture so users can scroll page easily on mobile
      if (!interactive) {
        ctx.map.dragging.disable();
        ctx.map.touchZoom.disable();
        ctx.map.doubleClickZoom.disable();
        ctx.map.scrollWheelZoom.disable();
        ctx.map.boxZoom.disable();
        ctx.map.keyboard.disable();
      }

      drawRoute(ctx, geometryRef.current, segmentsRef.current, markersRef.current);
      setTimeout(() => {
        if (!cancelled && ctx.map) ctx.map.invalidateSize();
      }, 200);
    });

    // ResizeObserver ensures map adjusts smoothly to mobile screen width and rotation
    const ro = new ResizeObserver(() => {
      if (ctxRef.current?.map) {
        ctxRef.current.map.invalidateSize();
        if (geometryRef.current || segmentsRef.current || markersRef.current) {
          drawRoute(ctxRef.current, geometryRef.current, segmentsRef.current, markersRef.current);
        }
      }
    });
    ro.observe(el);

    return () => {
      cancelled = true;
      ro.disconnect();
      if (live) {
        releaseLeafletMap(el, live.map);
        live = null;
      }
      ctxRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    if (ctxRef.current) {
      drawRoute(ctxRef.current, geometry, segments, markers);
      setTimeout(() => {
        ctxRef.current?.map.invalidateSize();
      }, 100);
    }
  }, [geometry, segments, markers]);

  const hasRoute =
    (!!geometry && geometry.length >= 2) ||
    (!!segments && segments.some((s) => s.geometry.length >= 2)) ||
    (!!markers && markers.length > 0);

  return (
    <div className={`relative ${heightClass} w-full overflow-hidden rounded-2xl border border-white/10 bg-black`}>
      <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" />
      {!hasRoute && emptyLabel && (
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pointer-events-none">
          <p className="rounded-full border border-white/10 bg-black/80 px-4 py-2 text-center text-xs font-mono text-zinc-400 shadow-sm backdrop-blur-md">
            {emptyLabel}
          </p>
        </div>
      )}
    </div>
  );
}
