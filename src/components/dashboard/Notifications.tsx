"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Route, Settings2 } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { getTrips } from "@/lib/trips";

export function Notifications() {
  const [tripCount, setTripCount] = useState(0);
  const [alertsOn, setAlertsOn] = useState(true);

  useEffect(() => {
    setTripCount(getTrips().length);
    try {
      setAlertsOn(getSettings().trafficAlerts);
    } catch {
      setAlertsOn(true);
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-xl border border-[#E8E8E8] bg-white p-6"
    >
      <h2 className="font-semibold text-[#111111] mb-4">Notifications</h2>
      <div className="space-y-3">
        <div className="flex gap-3 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4">
          <Route className="h-5 w-5 shrink-0 text-[#111111]" />
          <div className="min-w-0">
            <p className="font-medium text-[#111111]">Trip history</p>
            <p className="text-sm text-[#6B6B6B] mt-0.5">
              {tripCount === 0
                ? "No saved trips yet. Your planned routes will be listed here."
                : `You have ${tripCount} saved ${tripCount === 1 ? "trip" : "trips"}. Reopen any of them from Trip history.`}
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-[#E8E8E8] bg-[#FAFAFA] p-4">
          {alertsOn ? (
            <Bell className="h-5 w-5 shrink-0 text-[#111111]" />
          ) : (
            <Settings2 className="h-5 w-5 shrink-0 text-[#8A8A8A]" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-[#111111]">Traffic alerts</p>
            <p className="text-sm text-[#6B6B6B] mt-0.5">
              {alertsOn
                ? "Alerts are on. Check the traffic view before you leave."
                : "Alerts are off. You can turn them back on in settings."}{" "}
              <Link
                href="/dashboard/profile"
                className="font-medium text-[#111111] underline underline-offset-2"
              >
                Open settings
              </Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
