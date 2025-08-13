// src/app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [clientes, trainers, admins, totalSessionsUpcoming] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.session.count({
        where: {
          scheduledAt: { gte: new Date() },
        },
      }),
    ]);

    return NextResponse.json(
      {
        clientes,
        trainers,
        admins,
        sessionsUpcoming: totalSessionsUpcoming,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Falha a carregar estatísticas" }, { status: 500 });
  }
}
