"use client";

import { useAuth } from "@/contexts/AuthContext";
import { RouteSearch } from "@/components/dashboard/RouteSearch";
import { RecentTrips } from "@/components/dashboard/RecentTrips";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { TrafficOverview } from "@/components/dashboard/TrafficOverview";
import { Notifications } from "@/components/dashboard/Notifications";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-[family-name:var(--font-dm-serif)] text-2xl font-normal text-[#111111] mb-2">
        {user ? `${greeting()}, ${user.username}` : "Dashboard"}
      </h1>
      <p className="text-sm text-[#6B6B6B] mb-8">
        Plan routes, check traffic, and revisit saved trips.
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-6">
          <RouteSearch />
          <RecentTrips />
        </div>

        <div className="space-y-6">
          <QuickStats />
          <TrafficOverview />
        </div>

        <div>
          <Notifications />
        </div>
      </div>
    </div>
  );
}
