"use client";

import type * as Leaflet from "leaflet";

// Hardcoded so deploys work with zero setup. Override with
// NEXT_PUBLIC_CARTO_API_KEY in .env.local if you ever need to.
const CARTO_KEY =
  process.env.NEXT_PUBLIC_CARTO_API_KEY ||
  "cb1_45fq_1_cf78a486fd3779b895177c50";

export const TILE_URL =
  `https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png` +
  (CARTO_KEY ? `?key=${CARTO_KEY}` : "");
export const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';


export interface LeafletCtx {
  L: typeof Leaflet;
  map: Leaflet.Map;
  layer: Leaflet.LayerGroup;
}

const liveMaps = new WeakMap<HTMLElement, Leaflet.Map>();

function teardown(el: HTMLElement): void {
  const existing = liveMaps.get(el);
  if (!existing) return;
  liveMaps.delete(el);
  try {
    existing.remove();
  } catch {
    // already removed by a previous cleanup
  }
}

export async function initLeafletMap(
  el: HTMLElement,
  center: [number, number],
  zoom: number,
): Promise<LeafletCtx> {
  const L = await import("leaflet");
  // A previous mount may have initialized this same container while its
  // async import was still in flight (StrictMode / Fast Refresh remounts).
  // Tear it down first so L.map never sees a live container.
  teardown(el);
  const map = L.map(el).setView(center, zoom);
  L.tileLayer(TILE_URL, {
    attribution: ATTRIBUTION,
    maxZoom: 20,
  }).addTo(map);
  const layer = L.layerGroup().addTo(map);
  liveMaps.set(el, map);
  setTimeout(() => {
    if (map) map.invalidateSize();
  }, 150);
  return { L, map, layer };
}

export function destroyLeafletMap(el: HTMLElement): void {
  teardown(el);
}

export function releaseLeafletMap(el: HTMLElement, map: Leaflet.Map): void {
  if (liveMaps.get(el) === map) liveMaps.delete(el);
  try {
    map.remove();
  } catch {
    // already removed by a newer init on the same container
  }
}
