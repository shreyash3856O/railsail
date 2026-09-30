"use client";

import { useState } from "react";
import { Search, Car, TrainFront, CarTaxiFront, Bus, Footprints, Bike } from "lucide-react";
import { PlaceSearchInput } from "./PlaceSearchInput";
import type { Place } from "@/lib/geo";
import type { TransitMode } from "@/lib/hybrid";

export const MODE_META: Array<{
  id: TransitMode;
  label: string;
  icon: typeof Car;
}> = [
  { id: "driving", label: "Drive", icon: Car },
  { id: "train", label: "Train", icon: TrainFront },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "auto", label: "Auto", icon: CarTaxiFront },
  { id: "foot", label: "Walk", icon: Footprints },
  { id: "bike", label: "Cycle", icon: Bike },
];

interface PlannerLeftPanelProps {
  from: Place | null;
  to: Place | null;
  mode: TransitMode;
  searching: boolean;
  departValue: string;
  initialFromText?: string;
  initialToText?: string;
  onFromChange: (place: Place | null) => void;
  onToChange: (place: Place | null) => void;
  onModeChange: (mode: TransitMode) => void;
  onDepartChange: (value: string) => void;
  onSearch: () => void;
}

export function PlannerLeftPanel({
  from,
  to,
  mode,
  searching,
  departValue,
  initialFromText,
  initialToText,
  onFromChange,
  onToChange,
  onModeChange,
  onDepartChange,
  onSearch,
}: PlannerLeftPanelProps) {
  const [error, setError] = useState("");

  const handleSearch = () => {
    if (!from || !to) {
      setError("Select a start and a destination from the suggestions.");
      return;
    }
    setError("");
    onSearch();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
        <h2 className="font-semibold text-[#111111] mb-4">Route search</h2>
        <div className="space-y-4">
          <PlaceSearchInput
            label="Start"
            placeholder="Search a place"
            value={from}
            initialText={initialFromText}
            onSelect={onFromChange}
          />
          <PlaceSearchInput
            label="Destination"
            placeholder="Search a place"
            value={to}
            initialText={initialToText}
            onSelect={onToChange}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div>
            <label className="block text-sm text-[#6B6B6B] mb-2">
              Depart at
            </label>
            <input
              type="datetime-local"
              value={departValue}
              onChange={(e) => onDepartChange(e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-3 text-sm text-[#111111] focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
        <h2 className="font-semibold text-[#111111] mb-4">Travel mode</h2>
        <div className="grid grid-cols-3 gap-2">
          {MODE_META.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 transition-colors ${
                mode === m.id
                  ? "border-[#111111] bg-[#111111] text-white"
                  : "border-[#E8E8E8] bg-[#FAFAFA] text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]"
              }`}
            >
              <m.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-[#8A8A8A] leading-relaxed">
          Drive and auto use live OSRM roads. Train pairs real walks with
          Western line rail fares. Bus uses real GTFS timetables (direct
          routes, no transfers). All six modes are compared below.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={searching}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
      >
        <Search className="h-4 w-4" />
        {searching ? "Routing..." : "Find route"}
      </button>
    </div>
  );
}
