import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Força runtime dinâmico (estes dados são sempre "reais")
export const dynamic = "force-dynamic";
export const revalidate = 0;

function startOfUTCDay(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}
function endOfUTCDay(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(24, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id as string | undefined;
    const role = ((session?.user as any)?.role ?? "ADMIN") as "ADMIN" | "TRAINER" | "CLIENT";

    // Filtros por role (PT só vê dele)
    const roleFilter =
      role === "TRAINER" && userId ? { trainerId: userId } : {};

    // Janela temporal
    const todayStart = startOfUTCDay();
    const todayEnd = endOfUTCDay();
    const weekEnd = addDays(todayStart, 7);

    // === SESSÕES (usar scheduledAt, que existe no schema) ===
    const sessionsToday = await prisma.session.count({
      where: {
        ...roleFilter,
        scheduledAt: { gte: todayStart, lt: todayEnd },
      },
    });

    const sessionsNext7Days = await prisma.session.count({
      where: {
        ...roleFilter,
        scheduledAt: { gte: todayStart, lt: weekEnd },
      },
    });

    const upcoming = await prisma.session.findMany({
      where: {
        ...roleFilter,
        scheduledAt: { gte: todayStart, lt: weekEnd },
      },
      orderBy: { scheduledAt: "asc" },
      take: 10,
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        client: { select: { name: true } },
      },
    });

    // === APROVAÇÕES PENDENTES (ADMIN) ===
    const pendingApprovals =
      role === "ADMIN"
        ? await prisma.user.count({ where: { status: "PENDING" } })
        : 0;

    // === TOTAIS SIMPLES ===
    const totalClients =
      role === "TRAINER" && userId
        ? await prisma.user.count({
            where: { role: "CLIENT", sessionsAsClient: { some: { trainerId: userId } } },
          })
        : await prisma.user.count({ where: { role: "CLIENT" } });

    const totalTrainers =
      role === "TRAINER"
        ? 1 // o próprio
        : await prisma.user.count({ where: { role: "TRAINER" } });

    return NextResponse.json({
      role,
      sessionsToday,
      sessionsNext7Days,
      pendingApprovals,
      totals: {
        clients: totalClients,
        trainers: totalTrainers,
      },
      upcoming,
    });
  } catch (e: any) {
    console.error("stats route error:", e);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
