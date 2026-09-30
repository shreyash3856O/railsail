"use client";

import { motion } from "framer-motion";
import { Route, Clock } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/geo";
import type { TripRecord } from "@/lib/trips";

interface AnalyticsSummaryProps {
  trips: TripRecord[];
}

export function AnalyticsSummary({ trips }: AnalyticsSummaryProps) {
  const totalM = trips.reduce((sum, t) => sum + t.distanceM, 0);
  const totalS = trips.reduce((sum, t) => sum + t.durationS, 0);

  const counts = new Map<string, number>();
  for (const t of trips) {
    const key = `${t.from} to ${t.to}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const mostUsed = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border border-[#E8E8E8] bg-white p-6"
    >
      <h2 className="font-semibold text-[#111111] mb-4">Analytics summary</h2>
      {trips.length === 0 ? (
        <p className="text-sm text-[#6B6B6B]">
          Stats appear here once you save your first trip.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Route className="h-4 w-4 text-[#111111]" />
              <span className="text-sm font-medium text-[#6B6B6B]">
                Most used route
              </span>
            </div>
            <p className="font-semibold text-[#111111]">
              {mostUsed ? mostUsed[0] : "-"}
            </p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              {mostUsed
                ? `${mostUsed[1]} ${mostUsed[1] === 1 ? "trip" : "trips"} · ${formatDistance(totalM)} total`
                : ""}
            </p>
          </div>
          <div className="rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-[#111111]" />
              <span className="text-sm font-medium text-[#6B6B6B]">
                Average travel time
              </span>
            </div>
            <p className="font-semibold text-[#111111]">
              {formatDuration(totalS / trips.length)}
            </p>
            <p className="text-xs text-[#8A8A8A] mt-1">
              Across {trips.length} {trips.length === 1 ? "trip" : "trips"}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
