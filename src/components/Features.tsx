"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Route,
  Activity,
  History,
  Train,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Route,
    title: "Real Road Geometry Engine",
    badge: "OSRM & Valhalla",
    description:
      "Type any two points and receive exact physical highway curves, turn angles, distances, and duration generated directly from OpenStreetMap node graphs.",
    colSpan: "lg:col-span-2",
  },
  {
    icon: Activity,
    title: "Live Corridor Congestion",
    badge: "Multi-Zone Radar",
    description:
      "Heatmaps and corridor delay calculations pinpoint where traffic bottlenecks develop across Western Express, Eastern Freeway, and link roads.",
    colSpan: "lg:col-span-1",
  },
  {
    icon: Train,
    title: "10,279 GTFS Transit Stops",
    badge: "Western Line Rail",
    description:
      "Offline-indexed timetables match real bus and suburban train runs with accurate stop-by-stop station itineraries.",
    colSpan: "lg:col-span-1",
  },
  {
    icon: History,
    title: "Local-First Trip Memory",
    badge: "100% Client-Side",
    description:
      "Every itinerary you plan is cached locally in your browser storage. Replay any route on the map and compare weekly travel metrics without logging in.",
    colSpan: "lg:col-span-2",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="features"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-black text-white border-t border-white/10 overflow-hidden"
    >
      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4 sm:gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-zinc-400 mb-2 sm:mb-3"
            >
              Engine Capabilities
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight"
            >
              Architected for precision mobility
            </motion.h2>
          </div>
          <Link
            href="/dashboard/planner"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            <span>Explore live planner</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className={`${feature.colSpan} group relative rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl hover:border-white/25 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-5 sm:mb-6">
                  <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white text-black transition-transform group-hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
                  </div>
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] sm:text-[11px] font-mono text-zinc-300">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  Telemetry verified
                </span>
                <span className="text-zinc-400 group-hover:text-white transition-colors">0{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
