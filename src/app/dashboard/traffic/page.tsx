"use client";

import { useState } from "react";
import { TrafficMap } from "@/components/traffic/TrafficMap";
import { TrafficControls } from "@/components/traffic/TrafficControls";
import { TrafficDataCards } from "@/components/traffic/TrafficDataCards";

type ViewMode = "heatmap" | "density" | "peak";

export default function TrafficPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("heatmap");

  return (
    <div className="space-y-0">
      {/* Header with controls */}
      <div className="px-6 lg:px-8 pt-2 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-dm-serif)] text-2xl font-normal text-[#111111]">
              Traffic
            </h1>
            <p className="mt-1 text-[#6B6B6B] text-sm">
              A simulated congestion model for major corridors. Live municipal
              feeds are not connected yet.
            </p>
          </div>
          <TrafficControls viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      {/* Full-page map - edge to edge */}
      <div className="w-full">
        <TrafficMap viewMode={viewMode} />
      </div>

      {/* Data cards */}
      <div className="px-6 lg:px-8 py-6 lg:py-8 -mt-2">
        <TrafficDataCards />
      </div>
    </div>
  );
}
