"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Clock } from "lucide-react";
import {
  LEVEL_COLORS,
  LEVEL_LABELS,
  getTrafficSnapshot,
} from "@/lib/traffic";

export function TrafficDataCards() {
  const [snapshot, setSnapshot] = useState(() => getTrafficSnapshot());

  useEffect(() => {
    const timer = setInterval(() => {
      setSnapshot(getTrafficSnapshot());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 rounded-xl border border-[#E8E8E8] bg-white p-5"
      >
        <h3 className="font-semibold text-[#111111] mb-1 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#111111]" />
          Corridor status
        </h3>
        <p className="text-xs text-[#8A8A8A] mb-3">
          Simulated model, refreshes every few minutes
        </p>
        <ul className="space-y-2">
          {snapshot.roads.map((road) => (
            <li
              key={road.name}
              className="flex items-center justify-between rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] px-3 py-2 text-sm"
            >
              <span className="font-medium text-[#111111]">{road.name}</span>
              <span className="text-xs font-medium flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: LEVEL_COLORS[road.level] }}
                />
                <span className="text-[#6B6B6B]">
                  {LEVEL_LABELS[road.level]} · {road.delayMin} min
                </span>
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-[#E8E8E8] bg-white p-5 sm:w-64"
      >
        <h3 className="font-semibold text-[#111111] mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#111111]" />
          Average delay
        </h3>
        <p className="text-3xl font-semibold text-[#111111]">
          {snapshot.avgDelayMin} min
        </p>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Across monitored corridors
        </p>
      </motion.div>
    </div>
  );
}
