"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Map,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Train,
  Car,
  Footprints,
  Bike,
  Clock,
} from "lucide-react";
import { Interactive3DTransit } from "@/components/3d/Interactive3DTransit";

const PRESET_ROUTES = [
  {
    name: "Andheri ➔ BKC",
    distance: "12.8 km",
    modes: [
      { icon: Train, label: "Metro/Local", time: "22 min", cost: "₹20" },
      { icon: Car, label: "Drive (Traffic)", time: "36 min", cost: "₹380" },
      { icon: Bike, label: "Cycle", time: "44 min", cost: "₹0" },
    ],
  },
  {
    name: "Bandra ➔ Nariman Pt",
    distance: "19.4 km",
    modes: [
      { icon: Train, label: "Fast Rail", time: "28 min", cost: "₹15" },
      { icon: Car, label: "Coastal Rd", time: "26 min", cost: "₹450" },
      { icon: Footprints, label: "Walk", time: "3h 40m", cost: "₹0" },
    ],
  },
  {
    name: "Dadar ➔ Siddhivinayak",
    distance: "1.8 km",
    modes: [
      { icon: Footprints, label: "Walk", time: "18 min", cost: "₹0" },
      { icon: Bike, label: "Cycle", time: "8 min", cost: "₹0" },
      { icon: Car, label: "Cab / Auto", time: "10 min", cost: "₹65" },
    ],
  },
];

export function Hero() {
  const [activePreset, setActivePreset] = useState(0);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] w-full max-w-full overflow-hidden bg-black text-white pt-20 pb-12 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24">
      {/* Background Matrix */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Ambient Top Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[700px] h-[250px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* Main Info Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left w-full max-w-full">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3 py-1 sm:px-3.5 sm:py-1.5 backdrop-blur-xl mb-4 sm:mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <span className="text-[11px] sm:text-xs font-mono uppercase tracking-widest text-zinc-300">
                RailSail 2.4 Engine
              </span>
              <span className="text-zinc-600 hidden sm:inline">•</span>
              <span className="text-[11px] sm:text-xs text-zinc-400 font-medium hidden sm:inline">
                OSRM & GTFS Multi-Modal
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-[family-name:var(--font-dm-serif)] text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.18] sm:leading-[1.12] tracking-tight text-white mb-4 sm:mb-6 max-w-full break-words">
              Know the route before the road.
              <span className="block text-zinc-400 mt-1">Travel smarter every day.</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-zinc-400 max-w-full lg:max-w-xl leading-relaxed mb-6 sm:mb-8 break-words">
              Search any location and compute verified physical road geometry with realistic travel
              times for driving, trains, buses, walking, and cycling. Built on OSRM, Valhalla,
              Western Line rail data, and live GTFS schedules.
            </p>

            {/* Mobile 3D Canvas (visible only on mobile/tablet) */}
            <div className="w-full lg:hidden mb-8">
              <Interactive3DTransit />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto">
              <Link
                href="/dashboard/planner"
                style={{ backgroundColor: "#ffffff", color: "#000000" }}
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-all hover:bg-zinc-200 active:scale-95 shadow-[0_0_25px_-5px_rgba(255,255,255,0.4)]"
              >
                <span style={{ color: "#000000" }} className="font-semibold">Find a route</span>
                <ArrowRight className="h-4 w-4" style={{ color: "#000000" }} />
              </Link>
              <Link
                href="/dashboard/traffic"
                style={{ color: "#ffffff" }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.05] px-7 py-3.5 text-sm font-medium transition-all hover:bg-white/[0.1] hover:border-white/40 active:scale-95 backdrop-blur-md"
              >
                <Map className="h-4 w-4 text-white" />
                <span>View Traffic Matrix</span>
              </Link>
            </div>

            {/* Route Simulator Card */}
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 sm:p-4 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-2.5 text-xs">
                <span className="font-mono text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 text-[11px] sm:text-xs">
                  <Zap className="w-3.5 h-3.5 text-white" />
                  Live Commute Simulator
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  Traffic-Adjusted
                </span>
              </div>

              {/* Preset Selector Pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {PRESET_ROUTES.map((route, idx) => (
                  <button
                    key={route.name}
                    type="button"
                    onClick={() => setActivePreset(idx)}
                    className={`text-[11px] sm:text-xs px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium transition-all ${
                      activePreset === idx
                        ? "bg-white text-black shadow"
                        : "bg-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    {route.name}
                  </button>
                ))}
              </div>

              {/* Mode Comparison Strip */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-white/5">
                {PRESET_ROUTES[activePreset].modes.map((mode) => (
                  <div
                    key={mode.label}
                    className="flex flex-col p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-zinc-400 mb-0.5">
                      <span className="flex items-center gap-1 truncate">
                        <mode.icon className="w-3 h-3 text-white shrink-0" />
                        <span className="truncate">{mode.label}</span>
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-white font-mono">{mode.time}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{mode.cost}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop 3D Canvas (visible only on lg+ screens) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center w-full">
            <div className="w-full relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-white/10 to-transparent blur-xl pointer-events-none" />
              <Interactive3DTransit />
            </div>
          </div>
        </div>

        {/* Bottom Feature Specs Strip */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-white/10">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 sm:bg-transparent sm:border-none">
            <div className="p-2 rounded-lg bg-white/[0.05] border border-white/10 shrink-0">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider">Engine Latency</p>
              <p className="text-xs sm:text-sm font-semibold text-white">&lt; 15ms Response</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 sm:bg-transparent sm:border-none">
            <div className="p-2 rounded-lg bg-white/[0.05] border border-white/10 shrink-0">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider">GTFS Database</p>
              <p className="text-xs sm:text-sm font-semibold text-white">10,279 Stops</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 sm:bg-transparent sm:border-none">
            <div className="p-2 rounded-lg bg-white/[0.05] border border-white/10 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider">Modal Profiles</p>
              <p className="text-xs sm:text-sm font-semibold text-white">6 Synchronized</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.02] border border-white/5 sm:bg-transparent sm:border-none">
            <div className="p-2 rounded-lg bg-white/[0.05] border border-white/10 shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-mono text-zinc-400 uppercase tracking-wider">Data Privacy</p>
              <p className="text-xs sm:text-sm font-semibold text-white">Local-First Storage</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
