"use client";

import { motion } from "framer-motion";
import { Clock, Ruler, Navigation, Wallet } from "lucide-react";
import { formatDistance, formatDuration } from "@/lib/geo";
import type { TripRecord } from "@/lib/trips";
import { PROFILE_LABELS } from "./SavedTrips";

interface TripInformationProps {
  trip: TripRecord | null;
}

export function TripInformation({ trip }: TripInformationProps) {
  if (!trip) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-[#E8E8E8] bg-white p-6"
      >
        <h2 className="font-semibold text-[#111111] mb-4">Trip information</h2>
        <p className="text-[#6B6B6B] text-sm">
          Select a trip to view details
        </p>
      </motion.div>
    );
  }

  const rows = [
    {
      icon: Clock,
      label: trip.estimated ? "Travel time (estimated)" : "Travel time",
      value: formatDuration(trip.durationS),
    },
    {
      icon: Ruler,
      label: "Distance",
      value: formatDistance(trip.distanceM),
    },
    {
      icon: Navigation,
      label: "Travel mode",
      value: PROFILE_LABELS[trip.profile],
    },
  ];

  if (trip.costINR != null) {
    rows.push({
      icon: Wallet,
      label: "Trip cost",
      value: `Rs ${trip.costINR}`,
    });
  }

  return (
    <motion.div
      key={trip.id}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#E8E8E8] bg-white p-6"
    >
      <h2 className="font-semibold text-[#111111] mb-4">Trip information</h2>
      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FAFAFA] border border-[#E8E8E8]">
              <row.icon className="h-4 w-4 text-[#111111]" />
            </div>
            <div>
              <p className="text-xs text-[#6B6B6B]">{row.label}</p>
              <p className="font-medium text-[#111111]">{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
