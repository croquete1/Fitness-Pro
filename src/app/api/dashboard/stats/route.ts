import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session as any)?.user?.id as string | undefined;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday); endOfToday.setDate(endOfToday.getDate() + 1);
    const in7Days = new Date(startOfToday); in7Days.setDate(in7Days.getDate() + 7);

    const [clients, trainers, admins, sessionsNext7] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "TRAINER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.session.count({ where: { scheduledAt: { gte: startOfToday, lt: in7Days } } }),
    ]);

    let nextSessions: Array<{ id: string; scheduledAt: Date; status: string; type: string; client: { name: string | null } }> = [];
    if (userId) {
      const raw = await prisma.session.findMany({
        where: { trainerId: userId, scheduledAt: { gte: startOfToday, lt: in7Days } },
        orderBy: { scheduledAt: "asc" },
        take: 10,
        select: { id: true, scheduledAt: true, status: true, client: { select: { name: true } } },
      });
      nextSessions = raw.map(s => ({ ...s, type: s.status }));
    }

    return NextResponse.json({ counts: { clients, trainers, admins, sessionsNext7 }, nextSessions });
  } catch (e) {
    console.error("stats route error", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
