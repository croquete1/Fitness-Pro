// src/app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions).catch(() => null);
    const role = String(
      (session as any)?.user?.role ?? (session as any)?.role ?? "CLIENT"
    ).toUpperCase();
    const userId: string | null =
      (session as any)?.user?.id ?? (session as any)?.id ?? null;

    const now = new Date();
    const sod = startOfDay(now);
    const tomorrow = addDays(sod, 1);
    const in7 = addDays(sod, 7);

    let sessionsToday = 0;
    let sessionsNext7Days = 0;
    let pendingApprovals = 0;
    let totalsClients = 0;
    let totalsTrainers = 0;
    let upcoming:
      | { id: string; scheduledAt: Date; status: string; client?: { name?: string | null } | null }[]
      | [] = [];

    if (role === "TRAINER" && userId) {
      // PT: métricas filtradas por trainerId
      sessionsToday = await prisma.session.count({
        where: {
          trainerId: userId,
          scheduledAt: { gte: sod, lt: tomorrow },
        },
      });

      sessionsNext7Days = await prisma.session.count({
        where: {
          trainerId: userId,
          scheduledAt: { gte: sod, lt: in7 },
        },
      });

      // Nº de clientes do PT = nº distinto de clientId nas sessões desse PT
      const distinctClients = await prisma.session.findMany({
        where: { trainerId: userId },
        select: { clientId: true },
        distinct: ["clientId"],
      });
      totalsClients = distinctClients.filter((c) => !!c.clientId).length;

      totalsTrainers = 1; // o próprio PT

      upcoming = await prisma.session.findMany({
        where: { trainerId: userId, scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
        take: 10,
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          client: { select: { name: true } },
        },
      });
    } else {
      // ADMIN (ou outros): métricas globais
      sessionsToday = await prisma.session.count({
        where: { scheduledAt: { gte: sod, lt: tomorrow } },
      });

      sessionsNext7Days = await prisma.session.count({
        where: { scheduledAt: { gte: sod, lt: in7 } },
      });

      pendingApprovals = await prisma.user.count({
        // tipos do Prisma podem ser enum; cast para evitar erro em build caso enum tenha nome diferente
        where: { status: "PENDING" as any },
      });

      totalsClients = await prisma.user.count({
        where: { role: "CLIENT" as any },
      });

      totalsTrainers = await prisma.user.count({
        where: { role: "TRAINER" as any },
      });

      upcoming = await prisma.session.findMany({
        where: { scheduledAt: { gte: now } },
        orderBy: { scheduledAt: "asc" },
        take: 10,
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          client: { select: { name: true } },
        },
      });
    }

    return NextResponse.json({
      role: role === "TRAINER" ? "TRAINER" : "ADMIN",
      sessionsToday,
      sessionsNext7Days,
      pendingApprovals,
      totals: { clients: totalsClients, trainers: totalsTrainers },
      upcoming,
    });
  } catch (err) {
    // fallback seguro para não rebentar a dashboard
    return NextResponse.json(
      {
        role: "ADMIN",
        sessionsToday: 0,
        sessionsNext7Days: 0,
        pendingApprovals: 0,
        totals: { clients: 0, trainers: 0 },
        upcoming: [],
        _error: "stats-failed",
      },
      { status: 200 }
    );
  }
}
