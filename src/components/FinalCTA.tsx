"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Navigation } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-black text-white border-t border-white/10 overflow-hidden">
      {/* Concentric ambient background glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] rounded-full border border-white/[0.04] animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] rounded-full border border-dashed border-white/[0.06] animate-[spin_40s_linear_infinite_reverse]" />
        <div className="absolute w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] rounded-full border border-white/[0.08]" />
        <div className="absolute w-[400px] h-[200px] sm:w-[500px] sm:h-[250px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_70%)] blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-300 mb-4 sm:mb-6 backdrop-blur-xl">
          <Sparkles className="w-3.5 h-3.5 text-white" />
          Zero Setup • Open Transit Access
        </div>

        <h2 className="font-[family-name:var(--font-dm-serif)] text-3xl sm:text-5xl lg:text-6xl text-white mb-4 sm:mb-6 tracking-tight">
          Plan your first real route in seconds
        </h2>

        <p className="text-zinc-400 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
          Type any two destinations and inspect real road topology, transit schedules, and
          multi-modal travel comparisons without signing up.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard/planner"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-white px-7 py-3.5 sm:px-8 sm:py-4 text-sm font-semibold text-black transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            <Navigation className="h-4 w-4" />
            <span>Launch Route Planner</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/dashboard/traffic"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 py-3.5 sm:px-8 sm:py-4 text-sm font-medium text-white transition-all hover:bg-white/[0.1] active:scale-95 backdrop-blur-md"
          >
            <span>Inspect Live Congestion</span>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
