"use client";

import Link from "next/link";
import { Route, Terminal } from "lucide-react";

const exploreLinks = [
  { href: "#features", label: "Features" },
  { href: "#live-routes", label: "Live routes" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#problem", label: "Why RailSail" },
];

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/planner", label: "Route Planner" },
  { href: "/dashboard/traffic", label: "Corridor Radar" },
  { href: "/dashboard/trips", label: "Trip Memory" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 sm:gap-12 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <div className="sm:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 text-xl font-bold tracking-tight text-white mb-3 sm:mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black">
                <Route className="h-4 w-4" />
              </div>
              <span>RailSail</span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed mb-5 sm:mb-6">
              Next-generation open transit intelligence. Search, compare, and replay
              your urban commute with physical road geometry and real GTFS dispatch data.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] sm:text-xs font-mono text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span>OSRM & GTFS Engines Nominal</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-xs font-mono uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-xs font-mono uppercase tracking-wider">
              Applications
            </h4>
            <ul className="space-y-2 sm:space-y-2.5">
              {appLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-zinc-400 font-mono text-center sm:text-left">
          <p>© {new Date().getFullYear()} RailSail Mobility Systems. Open source transit architecture.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              Local-first • No tracking
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
