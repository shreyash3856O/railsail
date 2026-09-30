"use client";

import { useEffect, useState } from "react";
import { CORRIDORS } from "@/lib/corridors";
import { fetchRoute } from "@/lib/geo";

export function useCorridorGeometry(): Record<string, Array<[number, number]>> {
  const [geom, setGeom] = useState<Record<string, Array<[number, number]>>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const entries = await Promise.all(
        CORRIDORS.map(async (c) => {
          try {
            const r = await fetchRoute(c.from, c.to, "driving");
            return [c.id, r.geometry] as const;
          } catch {
            return null;
          }
        }),
      );
      if (cancelled) return;
      const next: Record<string, Array<[number, number]>> = {};
      for (const e of entries) {
        if (e) next[e[0]] = e[1];
      }
      setGeom(next);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return geom;
}
