"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Wallet,
  Footprints,
  TrainFront,
  CarTaxiFront,
  Bus,
  Ticket,
  Clock,
  Loader2,
} from "lucide-react";
import { MODE_META } from "./PlannerLeftPanel";
import {
  formatDistance,
  formatDuration,
} from "@/lib/geo";
import {
  formatINR,
} from "@/lib/fares";
import {
  formatGtfsClock,
  type BusApiOption,
} from "@/lib/transit-client";
import {
  comboLegs,
  formatClock,
  legClockTimes,
  type ComboId,
  type HybridLeg,
  type TransitMode,
  type TransitPlan,
} from "@/lib/hybrid";

export interface ModeOption {
  mode: TransitMode;
  timeS: number | null;
  distanceM: number | null;
  costINR: number | null;
  estimated: boolean;
  costNote?: string;
}

interface PlannerResultsProps {
  options: ModeOption[];
  loading: boolean;
  searched: boolean;
  selected: TransitMode;
  onSelect: (mode: TransitMode) => void;
  transit: TransitPlan | null;
  trainCombo: ComboId;
  onComboChange: (combo: ComboId) => void;
  busOptions: BusApiOption[];
  busOptionsPending: boolean;
  busSel: number;
  onBusSel: (idx: number) => void;
  busLegs: HybridLeg[];
  busDetailLoading: boolean;
  busDepartAt: number;
}

const LEG_ICONS = {
  walk: Footprints,
  train: TrainFront,
  bus: Bus,
  auto: CarTaxiFront,
} as const;

export function PlannerResults({
  options,
  loading,
  searched,
  selected,
  onSelect,
  transit,
  trainCombo,
  onComboChange,
  busOptions,
  busOptionsPending,
  busSel,
  onBusSel,
  busLegs,
  busDetailLoading,
  busDepartAt,
}: PlannerResultsProps) {
  const available = options.filter((o) => o.timeS != null);
  const fastest =
    available.length > 0
      ? available.reduce((a, b) => ((a.timeS ?? Infinity) <= (b.timeS ?? Infinity) ? a : b))
      : null;
  const motorized = available.filter(
    (o) => o.mode === "driving" || o.mode === "train" || o.mode === "auto",
  );
  const cheapest =
    motorized.length > 0
      ? motorized.reduce((a, b) => ((a.costINR ?? Infinity) <= (b.costINR ?? Infinity) ? a : b))
      : null;

  if (!searched && !loading) {
    return (
      <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
        <h2 className="font-semibold text-[#111111] mb-2">Route options</h2>
        <p className="text-sm text-[#6B6B6B]">
          Search two places to compare drive, train, auto, walk, and cycle
          with real times and real rupee costs.
        </p>
      </div>
    );
  }

  const legs = transit ? comboLegs(transit, trainCombo) : [];
  const times = transit ? legClockTimes(transit.departAt, legs, transit.waitMin) : [];
  const arrival = times.length > 0 ? times[times.length - 1].end : null;
  const cheapestComboId =
    transit != null
      ? [...transit.combos]
          .filter((c) => c.available)
          .sort((a, b) => a.costINR - b.costINR)[0]?.id
      : undefined;

  return (
    <div className="space-y-6">
      {searched && fastest && cheapest && (
        <div className="rounded-xl border border-[#111111] bg-[#111111] p-5 text-sm leading-relaxed">
          <p className="text-white">
            Fastest: {labelFor(fastest.mode)} at{" "}
            {formatDuration(fastest.timeS ?? 0)}.
          </p>
          <p className="text-[#C9C9C9] mt-1">
            Cheapest motorized: {labelFor(cheapest.mode)} at{" "}
            {formatINR(cheapest.costINR ?? 0)}.
            {fastest.mode !== cheapest.mode &&
              cheapest.timeS != null &&
              fastest.timeS != null &&
              ` It takes ${formatDuration(cheapest.timeS)} instead of ${formatDuration(fastest.timeS)}.`}
          </p>
        </div>
      )}

      <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
        <h2 className="font-semibold text-[#111111] mb-4">Route options</h2>
        <div className="space-y-3">
          {options.map((opt) => {
            const meta = MODE_META.find((m) => m.id === opt.mode);
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <motion.button
                key={opt.mode}
                type="button"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => opt.timeS != null && onSelect(opt.mode)}
                disabled={opt.timeS == null}
                className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                  selected === opt.mode && opt.timeS != null
                    ? "border-[#111111] bg-[#FAFAFA]"
                    : "border-[#E8E8E8] bg-white hover:border-[#8A8A8A]"
                } ${opt.timeS == null ? "opacity-60" : ""}`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111111]">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[#111111]">
                      {meta.label}
                    </span>
                    {fastest?.mode === opt.mode && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#111111] px-2 py-0.5 text-xs font-medium text-white">
                        <Trophy className="h-3 w-3" />
                        Fastest
                      </span>
                    )}
                    {cheapest?.mode === opt.mode && fastest?.mode !== opt.mode && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#111111] px-2 py-0.5 text-xs font-medium text-[#111111]">
                        <Wallet className="h-3 w-3" />
                        Cheapest
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6B6B6B]">
                    {loading && opt.timeS == null
                      ? "Routing..."
                      : opt.timeS != null
                        ? `${formatDuration(opt.timeS)}, ${formatDistance(opt.distanceM ?? 0)}, ${opt.costINR != null ? formatINR(opt.costINR) : "Free"}${opt.estimated ? " (estimated)" : ""}`
                        : "Unavailable"}
                  </p>
                  {opt.costNote && opt.timeS != null && (
                    <p className="text-xs text-[#8A8A8A] mt-0.5">{opt.costNote}</p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {transit && selected === "train" && (
        <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
          <h2 className="font-semibold text-[#111111] mb-1">
            Train itinerary
          </h2>
          <p className="text-xs text-[#8A8A8A] mb-4 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Leaving {formatClock(transit.departAt)}
            {arrival ? `, arriving about ${formatClock(arrival)}` : ""} ·{" "}
            {transit.stationA.name} to {transit.stationB.name} ·{" "}
            {transit.railKm.toFixed(1)} km by rail
          </p>

          <div className="mb-5 grid gap-2 sm:grid-cols-2">
            {transit.combos.map((combo) => (
              <button
                key={combo.id}
                type="button"
                disabled={!combo.available}
                onClick={() => onComboChange(combo.id)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  trainCombo === combo.id
                    ? "border-[#111111] bg-[#FAFAFA]"
                    : "border-[#E8E8E8] bg-white hover:border-[#8A8A8A]"
                } ${!combo.available ? "opacity-50" : ""}`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-[#111111]">
                  {combo.label}
                  {cheapestComboId === combo.id && (
                    <span className="rounded-full bg-[#111111] px-2 py-0.5 text-[11px] font-medium text-white">
                      Cheapest
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs text-[#6B6B6B]">
                  {combo.available
                    ? `${formatINR(combo.costINR)} · ${formatDuration(combo.timeS)}`
                    : "Not available for this trip"}
                </span>
              </button>
            ))}
          </div>

          <ol className="space-y-0">
            {legs.map((leg, i) => {
              const LegIcon = LEG_ICONS[leg.mode];
              const t = times[i];
              return (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E8E8] bg-[#FAFAFA]">
                      <LegIcon className="h-4 w-4 text-[#111111]" />
                    </div>
                    {i < legs.length - 1 && (
                      <span className="w-px flex-1 bg-[#E8E8E8]" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-[#111111]">
                      {leg.fromLabel} to {leg.toLabel}
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      {t ? `${formatClock(t.start)} to ${formatClock(t.end)} · ` : ""}
                      {leg.mode === "walk" && "Walk "}
                      {leg.mode === "train" && "Slow local "}
                      {leg.mode === "auto" && "Auto "}
                      {formatDistance(leg.distanceM)} ·{" "}
                      {leg.costINR === 0 ? "Free" : formatINR(leg.costINR)}
                    </p>
                    {leg.note && (
                      <p className="text-xs text-[#8A8A8A] mt-0.5">{leg.note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-2 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] p-4 text-xs text-[#6B6B6B] leading-relaxed">
            <p className="flex items-start gap-2">
              <Ticket className="h-4 w-4 shrink-0 mt-0.5 text-[#111111]" />
              <span>
                Buy the Rs {transit.fareINR} unreserved ticket on the UTS app
                before boarding. First train about 4:15 AM, last about 12:45
                AM. Train times here use typical frequency, not live departures.
              </span>
            </p>
          </div>
        </div>
      )}

      {selected === "bus" && (
        <BusItinerary
          busOptions={busOptions}
          busOptionsPending={busOptionsPending}
          busSel={busSel}
          onBusSel={onBusSel}
          busLegs={busLegs}
          busDetailLoading={busDetailLoading}
          busDepartAt={busDepartAt}
        />
      )}

      {available.length > 0 && (
        <div className="rounded-xl border border-[#E8E8E8] bg-white p-6 overflow-hidden">
          <h2 className="font-semibold text-[#111111] mb-4">
            Route comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-sm">
              <thead>
                <tr className="border-b border-[#E8E8E8]">
                  <th className="text-left py-3 font-medium text-[#111111]">Mode</th>
                  <th className="text-left py-3 font-medium text-[#111111]">Travel time</th>
                  <th className="text-left py-3 font-medium text-[#111111]">Distance</th>
                  <th className="text-left py-3 font-medium text-[#111111]">Cost</th>
                </tr>
              </thead>
              <tbody>
                {available.map((opt) => (
                  <tr
                    key={opt.mode}
                    className="border-b border-[#E8E8E8] last:border-0"
                  >
                    <td className="py-3 font-medium text-[#111111]">
                      {labelFor(opt.mode)}
                    </td>
                    <td className="py-3 text-[#6B6B6B]">
                      {opt.timeS != null ? formatDuration(opt.timeS) : "-"}
                    </td>
                    <td className="py-3 text-[#6B6B6B]">
                      {opt.distanceM != null ? formatDistance(opt.distanceM) : "-"}
                    </td>
                    <td className="py-3 text-[#6B6B6B]">
                      {opt.costINR != null ? formatINR(opt.costINR) : "Free"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[#8A8A8A] leading-relaxed">
            Drive cost is fuel only at Rs 111.21/L and 15 km/L (Sept 2026
            Mumbai price, toll and parking excluded). Auto uses the MMRTA meter
            tariff from 1 Sept 2026. Train uses the Western Railway suburban
            II-class table. Road times include a peak-hour adjustment when you
            travel at peak hours. Bus legs are not offered: there is no public
            bus route or schedule feed available without a transit API key.
          </p>
        </div>
      )}
    </div>
  );
}

function labelFor(mode: TransitMode): string {
  const meta = MODE_META.find((m) => m.id === mode);
  return meta ? meta.label : mode;
}

function BusItinerary({
  busOptions,
  busOptionsPending,
  busSel,
  onBusSel,
  busLegs,
  busDetailLoading,
  busDepartAt,
}: {
  busOptions: BusApiOption[];
  busOptionsPending: boolean;
  busSel: number;
  onBusSel: (idx: number) => void;
  busLegs: HybridLeg[];
  busDetailLoading: boolean;
  busDepartAt: number;
}) {
  if (busOptionsPending) {
    return (
      <div className="rounded-xl border border-[#E8E8E8] bg-white p-6 flex items-center gap-3 text-sm text-[#6B6B6B]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading bus timetables from the GTFS feed (first load takes a while)…
      </div>
    );
  }
  if (busOptions.length === 0) {
    return (
      <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
        <h2 className="font-semibold text-[#111111] mb-2">Bus itinerary</h2>
        <p className="text-sm text-[#6B6B6B] leading-relaxed">
          No direct (no-transfer) buses found between stops near these places
          at this hour. The feed covers BEST, TMT, KDMT, and VVMT routes. Try
          a different time or a nearby landmark.
        </p>
      </div>
    );
  }
  const opt = busOptions[busSel] ?? busOptions[0];
  const dayStart = new Date(busDepartAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayMs = dayStart.getTime();
  const times: Array<{ start: number; end: number }> = [];
  {
    let cursor = busDepartAt;
    for (const leg of busLegs) {
      if (leg.mode === "bus" && opt) {
        cursor = Math.max(cursor, dayMs + opt.departures[0].depart * 1000);
      }
      const start = cursor;
      cursor += leg.durationS * 1000;
      times.push({ start, end: cursor });
    }
  }
  const arrival = times.length > 0 ? times[times.length - 1].end : null;

  return (
    <div className="rounded-xl border border-[#E8E8E8] bg-white p-6">
      <h2 className="font-semibold text-[#111111] mb-1">Bus itinerary</h2>
      <p className="text-xs text-[#8A8A8A] mb-4">
        Direct buses, no transfers · GTFS timetable (BEST, TMT, KDMT, VVMT)
      </p>

      <div className="mb-5 space-y-2">
        {busOptions.slice(0, 5).map((o, i) => {
          const first = o.departures[0];
          return (
            <button
              key={`${o.agency}-${o.routeShort}-${o.direction}-${i}`}
              type="button"
              onClick={() => onBusSel(i)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                (busOptions[busSel] ?? busOptions[0]) === o
                  ? "border-[#111111] bg-[#FAFAFA]"
                  : "border-[#E8E8E8] bg-white hover:border-[#8A8A8A]"
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-[#111111]">
                <Bus className="h-4 w-4" />
                Route {o.routeShort} · {o.agency}
              </span>
              <span className="mt-0.5 block text-xs text-[#6B6B6B]">
                {first
                  ? `${formatGtfsClock(first.depart)} to ${formatGtfsClock(first.arrive)}`
                  : "No departures"}{" "}
                · {o.stopsBetween} stops · {o.fromStop.name} to {o.toStop.name}
              </span>
            </button>
          );
        })}
      </div>

      {busDetailLoading || busLegs.length === 0 ? (
        <div className="flex items-center gap-3 text-sm text-[#6B6B6B]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Drawing walks and road path…
        </div>
      ) : (
        <>
          <p className="text-xs text-[#8A8A8A] mb-4 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Leaving {formatClock(busDepartAt)}
            {arrival ? `, arriving about ${formatClock(arrival)}` : ""}
          </p>
          <ol className="space-y-0">
            {busLegs.map((leg, i) => {
              const LegIcon = LEG_ICONS[leg.mode];
              const t = times[i];
              return (
                <li key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E8E8E8] bg-[#FAFAFA]">
                      <LegIcon className="h-4 w-4 text-[#111111]" />
                    </div>
                    {i < busLegs.length - 1 && (
                      <span className="w-px flex-1 bg-[#E8E8E8]" />
                    )}
                  </div>
                  <div className="pb-5">
                    <p className="text-sm font-medium text-[#111111]">
                      {leg.fromLabel} to {leg.toLabel}
                    </p>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      {t ? `${formatClock(t.start)} to ${formatClock(t.end)} · ` : ""}
                      {leg.mode === "walk" && "Walk "}
                      {leg.mode === "bus" && "Bus "}
                      {formatDistance(leg.distanceM)} ·{" "}
                      {leg.costINR === 0 ? "Free" : formatINR(leg.costINR)}
                    </p>
                    {leg.note && (
                      <p className="text-xs text-[#8A8A8A] mt-0.5">{leg.note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {opt && opt.departures.length > 1 && (
            <p className="text-xs text-[#8A8A8A] mt-1">
              Later buses on this route:{" "}
              {opt.departures
                .slice(1)
                .map((d) => formatGtfsClock(d.depart))
                .join(", ")}
            </p>
          )}
          <div className="mt-3 rounded-xl bg-[#FAFAFA] border border-[#E8E8E8] p-4 text-xs text-[#6B6B6B] leading-relaxed">
            Fares use the May 2025 BEST stage chart as an approximation for all
            agencies. Track live buses and buy tickets on the Chalo app where
            available.
          </div>
        </>
      )}
    </div>
  );
}
