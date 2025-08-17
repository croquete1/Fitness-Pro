import { NextResponse } from "next/server";
import { fetchEventsSince } from "@/lib/events";

// GET /api/events?since=ISO&trainerId=abc
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since") ?? undefined;
  const trainerId = searchParams.get("trainerId") ?? undefined;

  const events = await fetchEventsSince(since, { trainerId: trainerId ?? undefined });
  return NextResponse.json({ data: events });
}
