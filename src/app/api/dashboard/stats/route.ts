import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [
      totalUsers,
      adminCount,
      trainerCount,
      clientCount,
      pendingSessions,
      acceptedSessions,
      rejectedSessions,
      cancelledSessions,
      doneSessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ["admin", "administrador", "adm"] } } }),
      prisma.user.count({ where: { role: "trainer" } }),
      prisma.user.count({ where: { role: "cliente" } }),
      prisma.session.count({ where: { status: SessionStatus.pendente } }),
      prisma.session.count({ where: { status: SessionStatus.aceite } }),
      prisma.session.count({ where: { status: SessionStatus.recusada } }),
      prisma.session.count({ where: { status: SessionStatus.cancelada } }),
      prisma.session.count({ where: { status: SessionStatus.realizada } }),
    ]);

    return NextResponse.json({
      users: { total: totalUsers, admins: adminCount, trainers: trainerCount, clients: clientCount },
      sessions: {
        pendente: pendingSessions,
        aceite: acceptedSessions,
        recusada: rejectedSessions,
        cancelada: cancelledSessions,
        realizada: doneSessions,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: "Falha a obter estatísticas" }, { status: 500 });
  }
}