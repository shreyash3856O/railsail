"use client";

import Link from "next/link";

const exploreLinks = [
  { href: "#features", label: "Features" },
  { href: "#live-routes", label: "Live routes" },
  { href: "#how-it-works", label: "How it works" },
];

const appLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/planner", label: "Route planner" },
  { href: "/dashboard/traffic", label: "Traffic" },
  { href: "/dashboard/trips", label: "Trip history" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#E8E8E8] bg-white py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="text-xl font-semibold text-[#111111]">
              RailSail
            </Link>
            <p className="mt-3 text-sm text-[#6B6B6B] max-w-xs leading-relaxed">
              Real routes from open map data. Search, compare, and replay
              your daily commute.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#111111] mb-4 text-sm">Explore</h4>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6B6B] hover:text-[#111111] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[#111111] mb-4 text-sm">App</h4>
            <ul className="space-y-2">
              {appLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#6B6B6B] hover:text-[#111111] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-[#E8E8E8] text-center text-[#8A8A8A] text-xs leading-relaxed">
          <p>© 2026 RailSail</p>
          <p className="mt-1">
            Place search by Nominatim, driving routes by OSRM, walking
            and cycling by Valhalla. Map data © OpenStreetMap contributors.
          </p>
        </div>
      </div>
    </footer>
  );
}
