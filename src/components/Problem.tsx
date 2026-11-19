"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { X, Check, Clock, Route, History, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

export function Problem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="problem"
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-black text-white border-t border-white/10 overflow-hidden"
    >
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-zinc-400 mb-3">
            System Comparison
          </p>
          <h2 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
            Commuting should not
            <br />
            waste your time.
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed">
            Guessing connections, stale screenshots of maps, and fragmented schedules
            turn every daily journey into a chore. RailSail unifies search, routing geometry,
            and history into one focused command center.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Legacy way card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl relative group hover:border-white/20 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] border border-white/10 text-zinc-400">
                    <X className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">The fragmented way</h3>
                    <p className="text-xs text-zinc-400 font-mono">Legacy transit apps</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono text-zinc-400">
                  OBSOLETE
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-400">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <AlertTriangle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Routes re-typed manually every morning with zero persistent context</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <Clock className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Stale estimates relying on theoretical speeds instead of real city delays</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <X className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>No persistent local record of historical routes or travel times</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <X className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                  <span>Forced account creation, bloated ads, and invasive telemetry tracking</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 border-t border-white/5 text-xs text-zinc-400 font-mono flex items-center justify-between">
              <span>Avg. Planning Friction</span>
              <span className="text-zinc-300 font-semibold">High • ~8 mins</span>
            </div>
          </motion.div>

          {/* RailSail way card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col justify-between rounded-3xl border border-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 sm:p-8 backdrop-blur-xl relative shadow-[0_0_40px_-15px_rgba(255,255,255,0.15)] group hover:border-white/40 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-5 sm:mb-6 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black shadow-sm">
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">With RailSail Engine</h3>
                    <p className="text-xs text-zinc-400 font-mono">Real-time open transit</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white text-black text-[10px] font-mono font-bold tracking-wider">
                  OPTIMAL
                </span>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-200">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <Route className="h-4 w-4 text-white shrink-0 mt-0.5" />
                  <span>Exact road geometry, elevation, and real distances via OSRM & Valhalla</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <Zap className="h-4 w-4 text-white shrink-0 mt-0.5" />
                  <span>Instant side-by-side comparison across 6 multi-modal transit profiles</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <History className="h-4 w-4 text-white shrink-0 mt-0.5" />
                  <span>Local-first trip history saved directly to your browser for one-click replay</span>
                </li>
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <ShieldCheck className="h-4 w-4 text-white shrink-0 mt-0.5" />
                  <span>Zero account required to search, zero ad tracking, 100% privacy</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 sm:mt-8 pt-4 border-t border-white/10 text-xs text-zinc-300 font-mono flex items-center justify-between">
              <span>Avg. Route Compute</span>
              <span className="text-white font-semibold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Instant • &lt; 15ms
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
