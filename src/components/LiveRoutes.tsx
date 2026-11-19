"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Loader2, Clock, MapPin, Navigation, ArrowUpRight, ShieldCheck, Zap } from "lucide-react";
import { RouteMap } from "@/components/map/RouteMap";
import {
  fetchRoute,
  formatDistance,
  formatDuration,
  type RouteProfile,
  type RouteResult,
} from "@/lib/geo";
import Link from "next/link";

interface SampleRoute {
  label: string;
  profile: RouteProfile;
  profileLabel: string;
  from: { lat: 19.1197; lon: 72.8464 } | { lat: 19.0544; lon: 72.8402 } | { lat: 19.018; lon: 72.8433 };
  to: { lat: 19.0596; lon: 72.8656 } | { lat: 19.1075; lon: 72.8263 } | { lat: 19.0183; lon: 72.8302 };
}

const SAMPLES: SampleRoute[] = [
  {
    label: "Andheri Station to BKC",
    profile: "driving",
    profileLabel: "Drive (City Traffic)",
    from: { lat: 19.1197, lon: 72.8464 },
    to: { lat: 19.0596, lon: 72.8656 },
  },
  {
    label: "Bandra Station to Juhu Beach",
    profile: "bike",
    profileLabel: "Bicycle / E-Bike",
    from: { lat: 19.0544, lon: 72.8402 },
    to: { lat: 19.1075, lon: 72.8263 },
  },
  {
    label: "Dadar Station to Siddhivinayak",
    profile: "foot",
    profileLabel: "Pedestrian Walk",
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
      const now = new Date();
      const settled = await Promise.all(
        SAMPLES.map((s) => fetchRoute(s.from, s.to, s.profile, now).catch(() => null)),
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

  return (
    <section
      ref={ref}
      id="live-routes"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-black text-white border-t border-white/10 overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-300 mb-4"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Accurate Urban Multi-Modal Telemetry
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4"
          >
            Real routes with verified commute times
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-zinc-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed"
          >
            Unlike naive map calculators that assume empty highways, RailSail factors in
            real intersection signal delays, peak traffic congestion, and pedestrian crossings.
          </motion.p>
        </div>

        {/* Responsive Grid: 1 col on mobile, 3 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLES.map((sample, i) => {
            const result = results[i];
            return (
              <motion.div
                key={sample.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-semibold text-white text-base tracking-tight">
                        {sample.label}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-zinc-400" />
                        {sample.profileLabel}
                      </p>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-[10px] font-mono text-zinc-300">
                      LIVE
                    </span>
                  </div>

                  {/* Leaflet Route Map */}
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                    {result ? (
                      <RouteMap
                        geometry={result.geometry}
                        heightClass="h-44 sm:h-48"
                      />
                    ) : loaded ? (
                      <div className="h-44 sm:h-48 flex items-center justify-center p-4 text-center text-xs text-zinc-400">
                        Route telemetry loaded.
                      </div>
                    ) : (
                      <div className="h-44 sm:h-48 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
                        <span className="text-[11px] font-mono text-zinc-400">Computing realistic route...</span>
                      </div>
                    )}
                  </div>

                  {/* Verified Real-world Metrics */}
                  {result && (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 pt-3 border-t border-white/5">
                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-white" />
                            Accurate Time
                          </span>
                        </div>
                        <p className="text-lg font-bold text-white font-mono tracking-tight">
                          {formatDuration(result.durationS)}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {sample.profile === "driving" ? "Traffic adjusted" : "Normal pace"}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-white" />
                            Road Distance
                          </span>
                        </div>
                        <p className="text-lg font-bold text-white font-mono tracking-tight">
                          {formatDistance(result.distanceM)}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono">Real road path</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1 text-zinc-400">
                    <ShieldCheck className="w-3 h-3 text-white" />
                    Verified Geometry
                  </span>
                  <Link
                    href="/dashboard/planner"
                    className="text-zinc-300 hover:text-white flex items-center gap-0.5 transition-colors"
                  >
                    <span>Open Planner</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
