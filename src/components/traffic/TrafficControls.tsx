"use client";

import { Flame, Layers, Clock } from "lucide-react";

type ViewMode = "heatmap" | "density" | "peak";

interface TrafficControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const viewModes = [
  { id: "heatmap" as const, label: "Traffic heatmap", icon: Flame },
  { id: "density" as const, label: "Congestion density", icon: Layers },
  { id: "peak" as const, label: "Peak hour prediction", icon: Clock },
];

export function TrafficControls({
  viewMode,
  onViewModeChange,
}: TrafficControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {viewModes.map((mode) => (
        <button
          key={mode.id}
          type="button"
          onClick={() => onViewModeChange(mode.id)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
            viewMode === mode.id
              ? "border-[#111111] bg-[#111111] text-white"
              : "border-[#E8E8E8] bg-white text-[#6B6B6B] hover:border-[#111111] hover:text-[#111111]"
          }`}
        >
          <mode.icon className="h-4 w-4" />
          {mode.label}
        </button>
      ))}
    </div>
  );
}
