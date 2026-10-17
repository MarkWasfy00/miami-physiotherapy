import type { NextRequest } from "next/server";
import { branches } from "@/lib/data";
import { takenSlots } from "@/lib/booking-store";

/** GET /api/availability?branch=miami&date=2026-10-20 → { taken: ["12:00", ...] } */
export async function GET(request: NextRequest) {
  const branch = request.nextUrl.searchParams.get("branch") ?? "";
  const date = request.nextUrl.searchParams.get("date") ?? "";

  if (!branches.some((b) => b.slug === branch) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  return Response.json({ taken: await takenSlots(branch, date) }, { headers: { "cache-control": "no-store" } });
}
