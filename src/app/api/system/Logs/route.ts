import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Converte "YYYY-MM-DD" para início/fim do dia em UTC, ou respeita ISO completo.
function parseDateParam(s: string | null, end = false): Date | null {
  if (!s) return null;
  const hasTime = /T\d{2}:\d{2}/.test(s);
  if (hasTime) {
    const d = new Date(s);
    return Number.isNaN(+d) ? null : d;
  }
  // Sem hora -> usa limites do dia (UTC)
  const d = new Date(end ? `${s}T23:59:59.999Z` : `${s}T00:00:00.000Z`);
  return Number.isNaN(+d) ? null : d;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const from = parseDateParam(searchParams.get("from"), false);
    const to = parseDateParam(searchParams.get("to"), true);
    const limitParam = Number(searchParams.get("limit") || "100");
    const limit = Math.max(1, Math.min(200, Number.isFinite(limitParam) ? limitParam : 100));

    // Construção do filtro base
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    // Pesquisa por texto: em action/target e por email do ator
    let actorIdsByEmail: string[] = [];
    if (q) {
      const users = await prisma.user.findMany({
        where: { email: { contains: q, mode: "insensitive" } },
        select: { id: true },
      });
      actorIdsByEmail = users.map((u) => u.id);

      where.OR = [
        { action: { contains: q, mode: "insensitive" } },
        { target: { contains: q, mode: "insensitive" } },
        ...(actorIdsByEmail.length ? [{ actorId: { in: actorIdsByEmail } }] : []),
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, action: true, target: true, createdAt: true, actorId: true },
    });

    const actorIds = Array.from(new Set(logs.map((l) => l.actorId).filter(Boolean))) as string[];
    const actors = actorIds.length
      ? await prisma.user.findMany({
          where: { id: { in: actorIds } },
          select: { id: true, email: true },
        })
      : [];
    const map = new Map(actors.map((a) => [a.id, a.email]));

    const data = logs.map((l) => ({
      id: l.id,
      action: l.action,
      target: l.target,
      createdAt: l.createdAt,
      actorEmail: l.actorId ? map.get(l.actorId) ?? null : null,
    }));

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[api/system/logs] error:", err);
    return NextResponse.json({ ok: false, data: [], error: "INTERNAL_ERROR" }, { status: 200 });
  }
}
