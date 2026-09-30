import { getTransitStatus } from "@/lib/gtfs";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const baseUrl = new URL(req.url).origin;
    const status = await getTransitStatus(baseUrl);
    return Response.json(status);
  } catch (err) {
    return Response.json(
      { ready: false, loading: false, error: err instanceof Error ? err.message : "Status failed" },
      { status: 500 },
    );
  }
}
