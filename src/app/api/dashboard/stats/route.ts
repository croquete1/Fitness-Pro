import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getAdminStats, getClientStats, getPTStats } from "@/lib/dashboardRepo";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (token as any).role ?? "client";
  const viewerId = (token as any).uid ?? (token as any).sub ?? null;

  // rangeDays ?range=7
  const { searchParams } = new URL(req.url);
  const daysParam = searchParams.get("range");
  const rangeDays = Math.max(1, Math.min(31, Number(daysParam) || 7));

  let payload: any = {
    role,
    viewerId,
    counts: { clients: 0, trainers: 0, admins: 0, sessionsNext7d: 0 },
    trend7d: [],
    upcomingSessions: [],
    notifications: [],
  };

  try {
    if (role === "admin") {
      const data = await getAdminStats(rangeDays);
      payload = { role, viewerId, ...data };
    } else if (role === "pt") {
      const data = await getPTStats(String(viewerId ?? ""), rangeDays);
      payload = { role, viewerId, ...data };
    } else {
      const data = await getClientStats(String(viewerId ?? ""), rangeDays);
      payload = { role, viewerId, ...data };
    }
  } catch (e) {
    // Mantém payload com zeros para não partir a UI
  }

  return NextResponse.json(payload, { status: 200 });
}
