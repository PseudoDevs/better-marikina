import { getRiverLevels } from "@/lib/live/river";

// Public JSON mirror of the PAGASA feed with CORS enabled, so other civic
// projects can use Marikina River levels from the browser.
export async function GET() {
  const data = await getRiverLevels();
  return Response.json(data, {
    status: data.ok ? 200 : 502,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
