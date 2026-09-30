"use client";

import { motion } from "framer-motion";
import { Bookmark, Trash2 } from "lucide-react";
import { formatDuration } from "@/lib/geo";
import { type TripMode, type TripRecord } from "@/lib/trips";

export const PROFILE_LABELS: Record<TripMode, string> = {
  driving: "Drive",
  train: "Train",
  bus: "Bus",
  auto: "Auto",
  foot: "Walk",
  bike: "Cycle",
};

interface SavedTripsProps {
  trips: TripRecord[];
  selectedTrip: TripRecord | null;
  onSelectTrip: (trip: TripRecord) => void;
  onDeleteTrip: (id: string) => void;
}

export function SavedTrips({
  trips,
  selectedTrip,
  onSelectTrip,
  onDeleteTrip,
}: SavedTripsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-[#E8E8E8] bg-white p-6"
    >
      <h2 className="font-semibold text-[#111111] mb-4 flex items-center gap-2">
        <Bookmark className="h-4 w-4 text-[#111111]" />
        Saved trips
        <span className="ml-auto rounded-full bg-[#FAFAFA] border border-[#E8E8E8] px-2.5 py-0.5 text-xs font-medium text-[#6B6B6B]">
          {trips.length}
        </span>
      </h2>
      {trips.length === 0 ? (
        <p className="text-sm text-[#6B6B6B]">
          No saved trips. Plan a route and press Save trip to keep it here.
        </p>
      ) : (
        <div className="space-y-2">
          {trips.map((trip) => {
            const isSelected = selectedTrip?.id === trip.id;
            return (
              <div
                key={trip.id}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  isSelected
                    ? "border-[#111111] bg-[#FAFAFA]"
                    : "border-[#E8E8E8] bg-white hover:border-[#8A8A8A]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectTrip(trip)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate font-medium text-[#111111]">
                    {trip.from} to {trip.to}
                  </p>
                  <p className="text-xs text-[#8A8A8A] mt-0.5">
                    {PROFILE_LABELS[trip.profile]} · {formatDuration(trip.durationS)}
                    {trip.costINR != null ? ` · Rs ${trip.costINR}` : ""}
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTrip(trip.id)}
                  aria-label={`Delete trip from ${trip.from} to ${trip.to}`}
                  className="rounded-lg p-2 text-[#8A8A8A] transition-colors hover:bg-[#FAFAFA] hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
