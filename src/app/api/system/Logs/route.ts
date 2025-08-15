// src/app/api/system/logs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, action: true, target: true, createdAt: true, actorId: true },
  });

  const actorIds = Array.from(new Set(logs.map(l => l.actorId).filter(Boolean))) as string[];
  const actors = actorIds.length
    ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, email: true } })
    : [];
  const map = new Map(actors.map(a => [a.id, a.email]));

  const data = logs.map(l => ({
    ...l,
    actorEmail: l.actorId ? map.get(l.actorId) ?? null : null,
  }));

  return NextResponse.json({ ok: true, data });
}
