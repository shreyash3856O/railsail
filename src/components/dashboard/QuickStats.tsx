"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Route, Clock } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/geo";
import { getTrips } from "@/lib/trips";

export function QuickStats() {
  const [stats, setStats] = useState({
    count: 0,
    totalM: 0,
    avgS: 0,
  });

  useEffect(() => {
    const trips = getTrips();
    const totalM = trips.reduce((sum, t) => sum + t.distanceM, 0);
    const totalS = trips.reduce((sum, t) => sum + t.durationS, 0);
    setStats({
      count: trips.length,
      totalM,
      avgS: trips.length > 0 ? totalS / trips.length : 0,
    });
  }, []);

  const cards = [
    {
      icon: Route,
      label: "Trips planned",
      value: String(stats.count),
      hint:
        stats.count === 0
          ? "Plan your first route"
          : `${formatDistance(stats.totalM)} covered`,
    },
    {
      icon: Clock,
      label: "Average travel time",
      value: stats.count === 0 ? "-" : formatDuration(stats.avgS),
      hint: stats.count === 0 ? "Across saved trips" : `Across ${stats.count} trips`,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-xl border border-[#E8E8E8] bg-white p-6"
    >
      <h2 className="font-semibold text-[#111111] mb-4">Your totals</h2>
      <div className="grid grid-cols-2 gap-4">
        {cards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4"
          >
            <stat.icon className="h-5 w-5 text-[#111111] mb-2" />
            <p className="text-2xl font-semibold text-[#111111]">{stat.value}</p>
            <p className="text-sm text-[#6B6B6B]">{stat.label}</p>
            <p className="text-xs text-[#8A8A8A] mt-1">{stat.hint}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
