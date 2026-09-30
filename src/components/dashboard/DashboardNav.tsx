"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/planner", label: "Smart Route Planner" },
  { href: "/dashboard/traffic", label: "Traffic" },
  { href: "/dashboard/trips", label: "Trip History" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 px-6 lg:px-8 -mb-px overflow-x-auto">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
              ? "border-[#111111] text-[#111111]"
              : "border-transparent text-[#6B6B6B] hover:text-[#111111]"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
