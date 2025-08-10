import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [clientes, pts, admins, sessionsTotal] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.session.count(),
    ]);

    return NextResponse.json({
      users: { clientes, pts, admins },
      sessions: { total: sessionsTotal },
    });
  } catch (e) {
    console.error("dashboard/stats error:", e);
    return NextResponse.json({ error: "Erro a obter stats" }, { status: 500 });
  }
}
