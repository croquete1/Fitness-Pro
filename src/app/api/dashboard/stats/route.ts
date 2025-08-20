import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (token as any).role ?? "client";
  const viewerId = (token as any).uid ?? (token as any).sub ?? null;

  // Exemplo de estrutura; substituir por queries reais
  let data: any = {
    role,
    viewerId,
    counts: { clients: 0, trainers: 0, admins: 0, sessionsNext7d: 0 },
    trend7d: [],          // [{ date: '2025-08-18', sessions: 0 }, ...]
    upcomingSessions: [], // [{ id, date, with: 'PT/Cliente' }, ...]
    notifications: [],    // [{ id, title, createdAt }, ...]
  };

  try {
    if (role === "client") {
      // TODO: prisma.session.count({ where: { clientId: viewerId, date: { gte: today, lte: +7d } } })
      // TODO: prisma.notification.findMany({ where: { userId: viewerId }, take: 5, orderBy: { createdAt: "desc" } })
    } else if (role === "pt") {
      // TODO: filtrar por treino do PT (ex.: where: { coachId: viewerId })
    } else if (role === "admin") {
      // TODO: queries globais (totais, tendências, etc.)
    }
  } catch (e) {
    // em caso de erro devolvemos placeholders (mantém a UI a funcionar)
  }

  return NextResponse.json(data);
}
