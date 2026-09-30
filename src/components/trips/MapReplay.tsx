"use client";

import { motion } from "framer-motion";
import { RouteMap } from "@/components/map/RouteMap";
import type { TripRecord } from "@/lib/trips";

interface MapReplayProps {
  trip: TripRecord | null;
}

export function MapReplay({ trip }: MapReplayProps) {
  return (
    <motion.div className="rounded-xl border border-[#E8E8E8] bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-[#E8E8E8]">
        <h2 className="font-semibold text-[#111111]">Map replay</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          {trip
            ? `Saved route: ${trip.from} to ${trip.to}`
            : "Select a trip to view the route"}
        </p>
      </div>
      <div className="p-4">
        <RouteMap
          geometry={trip?.geometry ?? null}
          heightClass="h-64"
          emptyLabel="Your saved route will draw here."
        />
      </div>
    </motion.div>
  );
}
