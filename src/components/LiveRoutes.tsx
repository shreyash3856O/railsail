"use client";

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Loader2, Satellite } from "lucide-react";
import { RouteMap } from "@/components/map/RouteMap";
import {
  fetchRoute,
  formatDistance,
  formatDuration,
  type RouteProfile,
  type RouteResult,
} from "@/lib/geo";

interface SampleRoute {
  label: string;
  profile: RouteProfile;
  profileLabel: string;
  from: { lat: number; lon: number };
  to: { lat: number; lon: number };
}

const SAMPLES: SampleRoute[] = [
  {
    label: "Andheri Station to BKC",
    profile: "driving",
    profileLabel: "Drive",
    from: { lat: 19.1197, lon: 72.8464 },
    to: { lat: 19.0596, lon: 72.8656 },
  },
  {
    label: "Bandra Station to Juhu Beach",
    profile: "bike",
    profileLabel: "Cycle",
    from: { lat: 19.0544, lon: 72.8402 },
    to: { lat: 19.1075, lon: 72.8263 },
  },
  {
    label: "Dadar Station to Siddhivinayak Temple",
    profile: "foot",
    profileLabel: "Walk",
    from: { lat: 19.018, lon: 72.8433 },
    to: { lat: 19.0183, lon: 72.8302 },
  },
];

export function LiveRoutes() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [results, setResults] = useState<Array<RouteResult | null>>([
    null,
    null,
    null,
  ]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const settled = await Promise.all(
        SAMPLES.map((s) => fetchRoute(s.from, s.to, s.profile).catch(() => null)),
      );
      if (!cancelled) {
        setResults(settled);
        setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const allFailed = loaded && results.every((r) => r === null);

  return (
    <section
      ref={ref}
      id="live-routes"
      className="py-24 px-6 bg-[#FAFAFA] border-t border-[#E8E8E8]"
    >
      <div className="mx-auto max-w-6xl">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#6B6B6B] mb-4"
        >
          Live data
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl text-[#111111] text-center mb-6 tracking-tight"
        >
          Real routes, computed right now
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center text-[#6B6B6B] mb-4"
        >
          These cards called the OSRM routing engine when this page loaded.
          Nothing here is a mockup.
        </motion.p>
        <p className="text-center text-xs text-[#8A8A8A] mb-16 flex items-center justify-center gap-1.5">
          <Satellite className="h-3.5 w-3.5" />
          Routing by OSRM on OpenStreetMap data
        </p>

        {allFailed ? (
          <div className="rounded-xl border border-[#E8E8E8] bg-white p-8 text-center text-sm text-[#6B6B6B]">
            The routing services are unreachable at the moment. Please check
            your connection and reload.
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {SAMPLES.map((sample, i) => {
              const result = results[i];
              return (
                <motion.div
                  key={sample.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 * i, duration: 0.5 }}
                  className="rounded-xl border border-[#E8E8E8] bg-white p-5"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[#111111] text-sm">
                      {sample.label}
                    </h3>
                  </div>
                  <p className="text-xs text-[#8A8A8A] mb-4">
                    {sample.profileLabel}
                  </p>
                  {result ? (
                    <>
                      <RouteMap
                        geometry={result.geometry}
                        heightClass="h-44"
                      />
                      <div className="flex items-center gap-5 mt-4">
                        <div>
                          <p className="text-lg font-semibold text-[#111111]">
                            {formatDuration(result.durationS)}
                          </p>
                          <p className="text-xs text-[#8A8A8A]">Travel time</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-[#111111]">
                            {formatDistance(result.distanceM)}
                          </p>
                          <p className="text-xs text-[#8A8A8A]">Distance</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-[#8A8A8A]">
                        {result.engine === "valhalla" ? "Routed by Valhalla" : "Routed by OSRM"}
                        {result.estimated ? " (estimated)" : ""}
                      </p>
                    </>
                  ) : loaded ? (
                    <div className="h-44 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-center px-6">
                      <p className="text-center text-xs text-[#8A8A8A]">
                        Route unavailable right now. Try reloading.
                      </p>
                    </div>
                  ) : (
                    <div className="h-44 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-[#8A8A8A] animate-spin" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
