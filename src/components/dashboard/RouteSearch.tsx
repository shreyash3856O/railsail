"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { PlaceSearchInput } from "@/components/planner/PlaceSearchInput";
import type { Place } from "@/lib/geo";

export function RouteSearch() {
  const router = useRouter();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set("from", from.shortName);
    if (to) params.set("to", to.shortName);
    const qs = params.toString();
    router.push(qs ? `/dashboard/planner?${qs}` : "/dashboard/planner");
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onSubmit={submit}
      className="rounded-xl border border-[#E8E8E8] bg-white p-6"
    >
      <h2 className="font-semibold text-[#111111] mb-4">Plan a route</h2>
      <div className="space-y-4">
        <PlaceSearchInput
          label="Start"
          placeholder="Search a place"
          value={from}
          onSelect={setFrom}
        />
        <PlaceSearchInput
          label="Destination"
          placeholder="Search a place"
          value={to}
          onSelect={setTo}
        />
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111111] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#333333]"
        >
          <Search className="h-4 w-4" />
          Find route
        </button>
      </div>
    </motion.form>
  );
}
