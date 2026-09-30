"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bookmark, Check } from "lucide-react";
import { PlannerLeftPanel } from "@/components/planner/PlannerLeftPanel";
import { PlannerResults, type ModeOption } from "@/components/planner/PlannerResults";
import { RouteMap, type MapSegment, type MapMarker } from "@/components/map/RouteMap";
import {
  estimateFromDriving,
  fetchRoute,
  searchPlaces,
  type Place,
  type RouteResult,
} from "@/lib/geo";
import {
  autoFare,
  bestBusFare,
  carFuelCost,
  trafficAdjustment,
  CAR_MILEAGE_KMPL,
  PETROL_PRICE_PER_LITRE,
} from "@/lib/fares";
import {
  getBusOptions,
  formatGtfsClock,
  type BusApiOption,
} from "@/lib/transit-client";
import {
  type ComboId,
  type HybridLeg,
  type TransitMode,
  type TransitPlan,
  buildTransitPlan,
  cheapestCombo,
  comboLegs,
} from "@/lib/hybrid";
import { getSettings } from "@/lib/settings";
import { saveTrip } from "@/lib/trips";

function settingsMode(): TransitMode {
  try {
    const pref = getSettings().preferredTransport;
    if (pref === "Walk") return "foot";
    if (pref === "Cycle") return "bike";
  } catch {
    // fall through to default
  }
  return "driving";
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PlannerContent() {
  const searchParams = useSearchParams();
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [mode, setMode] = useState<TransitMode>(() => settingsMode());
  const [departInput, setDepartInput] = useState(() => toLocalInput(new Date()));
  const [drive, setDrive] = useState<RouteResult | null>(null);
  const [walk, setWalk] = useState<RouteResult | null>(null);
  const [cycle, setCycle] = useState<RouteResult | null>(null);
  const [transit, setTransit] = useState<TransitPlan | null>(null);
  const [trainCombo, setTrainCombo] = useState<ComboId>("ww");
  const [busOptions, setBusOptions] = useState<BusApiOption[] | null>(null);
  const [busSel, setBusSel] = useState(0);
  const [busDetail, setBusDetail] = useState<{
    walkA: RouteResult;
    walkB: RouteResult;
    busGeom: Array<[number, number]>;
    busKm: number | null;
    fare: number | null;
  } | null>(null);
  const [busDetailLoading, setBusDetailLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [peakLabel, setPeakLabel] = useState("Free-flow conditions");
  const [initialFromText] = useState(() => searchParams.get("from") ?? "");
  const [initialToText] = useState(() => searchParams.get("to") ?? "");
  const autoSearched = useRef(false);

  const runSearch = useCallback(async (a: Place, b: Place, at: Date) => {
    setSearching(true);
    setSearched(true);
    setError("");
    setSaved(false);
    setDrive(null);
    setWalk(null);
    setCycle(null);
    setTransit(null);
    setBusOptions(null);
    setBusDetail(null);
    setBusSel(0);
    setPeakLabel(trafficAdjustment(at).label);

    const [d, f, c, t] = await Promise.all([
      fetchRoute(a, b, "driving").catch(() => null),
      fetchRoute(a, b, "foot").catch(() => null),
      fetchRoute(a, b, "bike").catch(() => null),
      buildTransitPlan(a, b, at).catch(() => null),
    ]);

    getBusOptions(a.lat, a.lon, b.lat, b.lon, at)
      .then((opts) => {
        setBusOptions(opts);
        if (opts.length === 0 && !d && !f && !c && !t) {
          setError("Routing failed. Check your connection and try again.");
        }
      })
      .catch(() => {
        setBusOptions([]);
        if (!d && !f && !c && !t) {
          setError("Routing failed. Check your connection and try again.");
        }
      });

    if (!d && !f && !c && !t) {
      setSearching(false);
      return;
    }
    setDrive(d);
    setWalk(f ?? (d ? estimateFromDriving(d, "foot") : null));
    setCycle(c ?? (d ? estimateFromDriving(d, "bike") : null));
    setTransit(t);
    if (t) setTrainCombo(cheapestCombo(t).id);
    setSearching(false);
  }, []);

  useEffect(() => {
    if (autoSearched.current) return;
    const qFrom = searchParams.get("from")?.trim();
    const qTo = searchParams.get("to")?.trim();
    if (!qFrom || !qTo) return;
    autoSearched.current = true;
    (async () => {
      try {
        const [a, b] = await Promise.all([
          searchPlaces(qFrom),
          searchPlaces(qTo),
        ]);
        if (a.length > 0 && b.length > 0) {
          setFrom(a[0]);
          setTo(b[0]);
          await runSearch(a[0], b[0], new Date());
        }
      } catch {
        // leave the form for manual search
      }
    })();
  }, [searchParams, runSearch]);

  const departAt = new Date(departInput);
  const departSec =
    departAt.getHours() * 3600 + departAt.getMinutes() * 60;

  useEffect(() => {
    if (!busOptions || busOptions.length === 0 || !from || !to) return;
    const opt = busOptions[busSel] ?? busOptions[0];
    if (!opt) return;
    let cancelled = false;
    setBusDetail(null);
    setBusDetailLoading(true);
    (async () => {
      try {
        const [wA, wB, road] = await Promise.all([
          fetchRoute(from, opt.fromStop, "foot").catch(() => null),
          fetchRoute(opt.toStop, to, "foot").catch(() => null),
          fetchRoute(opt.fromStop, opt.toStop, "driving").catch(() => null),
        ]);
        if (cancelled) return;
        if (!wA || !wB) {
          setBusDetail(null);
          return;
        }
        const busKm = road ? road.distanceM / 1000 : null;
        setBusDetail({
          walkA: wA,
          walkB: wB,
          busGeom: road?.geometry ?? [],
          busKm,
          fare: busKm != null ? bestBusFare(busKm) : null,
        });
      } finally {
        if (!cancelled) setBusDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [busOptions, busSel, from, to]);

  const adj = trafficAdjustment(departAt);
  const driveKm = drive ? drive.distanceM / 1000 : null;
  const autoCost = driveKm != null ? autoFare(driveKm, departAt) : null;
  const autoTime = drive != null ? drive.durationS * adj.factor : null;
  const fuelCost = driveKm != null ? carFuelCost(driveKm) : null;

  const trainLegs = transit ? comboLegs(transit, trainCombo) : [];
  const trainComboData = transit?.combos.find((c) => c.id === trainCombo);
  const trainTime =
    trainComboData && trainComboData.available ? trainComboData.timeS : null;
  const trainCost =
    trainComboData && trainComboData.available ? trainComboData.costINR : null;
  const trainDist =
    trainTime != null ? trainLegs.reduce((s, l) => s + l.distanceM, 0) : null;

  const busOpt = busOptions && busOptions.length > 0
    ? (busOptions[busSel] ?? busOptions[0])
    : null;
  const busDep = busOpt ? busOpt.departures[0] : null;
  const busWait = busDep ? Math.max(0, busDep.depart - departSec) : null;
  const busLegs: HybridLeg[] =
    busOpt && busDetail && busDep
      ? [
          {
            mode: "walk",
            fromLabel: from?.shortName ?? "",
            toLabel: busOpt.fromStop.name,
            distanceM: busDetail.walkA.distanceM,
            durationS: busDetail.walkA.durationS,
            costINR: 0,
            geometry: busDetail.walkA.geometry,
          },
          {
            mode: "bus",
            fromLabel: busOpt.fromStop.name,
            toLabel: busOpt.toStop.name,
            distanceM: (busDetail.busKm ?? 0) * 1000,
            durationS: busDep.arrive - busDep.depart,
            costINR: busDetail.fare ?? 0,
            note: `Route ${busOpt.routeShort} (${busOpt.agency})${busOpt.headsign ? ` toward ${busOpt.headsign}` : ""}, ${busOpt.stopsBetween} stops, GTFS timetable`,
            geometry: busDetail.busGeom,
          },
          {
            mode: "walk",
            fromLabel: busOpt.toStop.name,
            toLabel: to?.shortName ?? "",
            distanceM: busDetail.walkB.distanceM,
            durationS: busDetail.walkB.durationS,
            costINR: 0,
            geometry: busDetail.walkB.geometry,
          },
        ]
      : [];
  const busTime =
    busOpt && busDetail && busDep && busWait != null
      ? busDetail.walkA.durationS + busWait + (busDep.arrive - busDep.depart) + busDetail.walkB.durationS
      : null;
  const busDist =
    busTime != null ? busLegs.reduce((s, l) => s + l.distanceM, 0) : null;

  const options: ModeOption[] = [
    {
      mode: "driving",
      timeS: drive ? drive.durationS * adj.factor : null,
      distanceM: drive?.distanceM ?? null,
      costINR: fuelCost,
      estimated: adj.factor !== 1,
      costNote: `Fuel only, ${CAR_MILEAGE_KMPL} km/L at Rs ${PETROL_PRICE_PER_LITRE}/L. ${adj.label}.`,
    },
    {
      mode: "train",
      timeS: trainTime,
      distanceM: trainDist,
      costINR: trainCost,
      estimated: false,
      costNote: transit
        ? `Rs ${transit.fareINR} suburban ticket, walks free. ${transit.frequencyLabel}.`
        : undefined,
    },
    {
      mode: "bus",
      timeS: busTime,
      distanceM: busDist,
      costINR: busDetail?.fare ?? null,
      estimated: false,
      costNote:
        busOpt && busDetail
          ? `${busOpt.agency} service, stage fare approximate, GTFS timetable.`
          : undefined,
    },
    {
      mode: "auto",
      timeS: autoTime,
      distanceM: drive?.distanceM ?? null,
      costINR: autoCost,
      estimated: adj.factor !== 1,
      costNote:
        autoCost != null
          ? `MMRTA meter tariff (1 Sept 2026). ${adj.label}.`
          : undefined,
    },
    {
      mode: "foot",
      timeS: walk?.durationS ?? null,
      distanceM: walk?.distanceM ?? null,
      costINR: walk ? 0 : null,
      estimated: walk?.estimated ?? false,
    },
    {
      mode: "bike",
      timeS: cycle?.durationS ?? null,
      distanceM: cycle?.distanceM ?? null,
      costINR: cycle ? 0 : null,
      estimated: cycle?.estimated ?? false,
    },
  ];

  const active = options.find((o) => o.mode === mode) ?? null;
  const activeHasData = active?.timeS != null;

  const mapSegments: MapSegment[] | undefined =
    mode === "train" && transit && trainTime != null
      ? trainLegs
          .filter((l) => l.geometry.length >= 2)
          .map((l) => ({ geometry: l.geometry, dashed: l.dashed }))
      : mode === "bus" && busTime != null
        ? busLegs
            .filter((l) => l.geometry.length >= 2)
            .map((l) => ({ geometry: l.geometry }))
        : undefined;
  const mapGeometry =
    mode === "train" || mode === "bus"
      ? null
      : mode === "driving" || mode === "auto"
        ? (drive?.geometry ?? null)
        : mode === "foot"
          ? (walk?.geometry ?? null)
          : (cycle?.geometry ?? null);

  const markers: MapMarker[] = [];
  if (from) markers.push({ lat: from.lat, lon: from.lon, label: from.shortName });
  if (to) markers.push({ lat: to.lat, lon: to.lon, label: to.shortName });

  const handleSave = () => {
    if (!from || !to || !activeHasData || !active) return;
    const geom =
      mode === "train"
        ? trainLegs.flatMap((l) => l.geometry)
        : mode === "bus"
          ? busLegs.flatMap((l) => l.geometry)
          : (mapGeometry ?? []);
    saveTrip({
      from: from.shortName,
      to: to.shortName,
      profile: mode,
      distanceM: active.distanceM ?? 0,
      durationS: active.timeS ?? 0,
      geometry: geom,
      estimated: active.estimated,
      costINR: active.costINR ?? undefined,
    });
    setSaved(true);
  };

  const handleDepartChange = (value: string) => {
    setDepartInput(value);
    setSaved(false);
    if (searched && from && to && value) {
      runSearch(from, to, new Date(value));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-dm-serif)] text-2xl font-normal text-[#111111]">
          Route planner
        </h1>
        <p className="mt-1 text-[#6B6B6B] text-sm">
          Drive and auto on live OSRM roads, train on Western line rail data,
          walk and cycle on Valhalla. Every cost uses published tariffs.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <PlannerLeftPanel
            from={from}
            to={to}
            mode={mode}
            searching={searching}
            departValue={departInput}
            initialFromText={initialFromText}
            initialToText={initialToText}
            onFromChange={(p) => {
              setFrom(p);
              setSaved(false);
            }}
            onToChange={(p) => {
              setTo(p);
              setSaved(false);
            }}
            onModeChange={setMode}
            onDepartChange={handleDepartChange}
            onSearch={() => {
              if (from && to && departInput) runSearch(from, to, new Date(departInput));
            }}
          />
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="rounded-xl border border-[#E8E8E8] bg-white p-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <h2 className="font-semibold text-[#111111]">Route map</h2>
              {activeHasData && from && to && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saved}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E8E8E8] px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:border-[#111111] disabled:opacity-60"
                >
                  {saved ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="h-3.5 w-3.5" />
                      Save trip
                    </>
                  )}
                </button>
              )}
            </div>
            <RouteMap
              geometry={mapGeometry}
              segments={mapSegments}
              markers={markers.length > 0 ? markers : undefined}
              heightClass="h-[420px]"
              emptyLabel={
                error
                  ? error
                  : "Search two places above to draw the real route here."
              }
            />
            {activeHasData && from && to && (
              <p className="px-1 pt-3 text-sm text-[#6B6B6B]">
                {from.shortName} to {to.shortName} · {peakLabel}
              </p>
            )}
          </div>

          <PlannerResults
            options={options}
            loading={searching}
            searched={searched}
            selected={mode}
            onSelect={setMode}
            transit={transit}
            trainCombo={trainCombo}
            onComboChange={setTrainCombo}
            busOptions={busOptions ?? []}
            busOptionsPending={busOptions === null}
            busSel={busSel}
            onBusSel={setBusSel}
            busLegs={busLegs}
            busDetailLoading={busDetailLoading}
            busDepartAt={departAt.getTime()}
          />
        </div>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  return (
    <Suspense>
      <PlannerContent />
    </Suspense>
  );
}
