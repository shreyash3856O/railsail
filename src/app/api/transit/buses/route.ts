import { ensureGtfs, planBus } from "@/lib/gtfs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const aLat = Number(url.searchParams.get("aLat"));
    const aLon = Number(url.searchParams.get("aLon"));
    const bLat = Number(url.searchParams.get("bLat"));
    const bLon = Number(url.searchParams.get("bLon"));
    const depart = Number(url.searchParams.get("depart") ?? "0");
    if (![aLat, aLon, bLat, bLon].every(Number.isFinite)) {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    }
    const idx = await ensureGtfs(url.origin);
    const options = planBus(idx, aLat, aLon, bLat, bLon, depart, 5);
    return Response.json({ options });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Bus query failed" },
      { status: 500 },
    );
  }
}
