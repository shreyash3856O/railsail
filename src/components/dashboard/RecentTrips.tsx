"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Route } from "lucide-react";
import { formatDuration } from "@/lib/geo";
import { PROFILE_LABELS } from "@/components/trips/SavedTrips";
import { getTrips, type TripRecord } from "@/lib/trips";

export function RecentTrips() {
  const [trips, setTrips] = useState<TripRecord[]>([]);

  useEffect(() => {
    setTrips(getTrips().slice(0, 3));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-xl border border-[#E8E8E8] bg-white p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#111111]">Recent trips</h2>
        <Link
          href="/dashboard/trips"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#111111] hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      {trips.length === 0 ? (
        <p className="text-sm text-[#6B6B6B]">
          Nothing here yet. Plan a route and it will show up here.
        </p>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/dashboard/trips?trip=${trip.id}`}
              className="flex w-full items-center gap-3 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-4 py-3 text-left transition-colors hover:border-[#111111]"
            >
              <Route className="h-4 w-4 shrink-0 text-[#111111]" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-[#111111]">
                  {trip.from} to {trip.to}
                </span>
                <span className="block text-xs text-[#8A8A8A]">
                  {PROFILE_LABELS[trip.profile]} · {formatDuration(trip.durationS)}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}
