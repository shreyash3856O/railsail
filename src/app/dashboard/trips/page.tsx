"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SavedTrips } from "@/components/trips/SavedTrips";
import { TripInformation } from "@/components/trips/TripInformation";
import { MapReplay } from "@/components/trips/MapReplay";
import { AnalyticsSummary } from "@/components/trips/AnalyticsSummary";
import { deleteTrip, getTrips, type TripRecord } from "@/lib/trips";

function TripsContent() {
  const searchParams = useSearchParams();
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripRecord | null>(null);

  useEffect(() => {
    const stored = getTrips();
    setTrips(stored);
    const wanted = searchParams.get("trip");
    if (wanted) {
      const match = stored.find((t) => t.id === wanted);
      if (match) setSelectedTrip(match);
    } else if (stored.length > 0) {
      setSelectedTrip(stored[0]);
    }
  }, [searchParams]);

  const handleDelete = (id: string) => {
    const next = deleteTrip(id);
    setTrips(next);
    if (selectedTrip?.id === id) {
      setSelectedTrip(next.length > 0 ? next[0] : null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-dm-serif)] text-2xl font-normal text-[#111111]">
          Trip history
        </h1>
        <p className="mt-1 text-[#6B6B6B] text-sm">
          Routes you saved from the planner, stored in this browser
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-6">
          <SavedTrips
            trips={trips}
            selectedTrip={selectedTrip}
            onSelectTrip={setSelectedTrip}
            onDeleteTrip={handleDelete}
          />
          <TripInformation trip={selectedTrip} />
        </aside>

        <div className="space-y-6">
          <MapReplay trip={selectedTrip} />
          <AnalyticsSummary trips={trips} />
        </div>
      </div>
    </div>
  );
}

export default function TripsPage() {
  return (
    <Suspense>
      <TripsContent />
    </Suspense>
  );
}
