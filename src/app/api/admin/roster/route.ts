// src/app/api/admin/roster/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function GET() {
  const trainers = await prisma.user.findMany({
    where: { role: Role.TRAINER },
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: "asc" },
  });

  const counts = await prisma.trainerClient.groupBy({
    by: ["trainerId"],
    _count: { clientId: true },
  });

  const map = new Map(counts.map((c) => [c.trainerId, c._count.clientId]));
  const data = trainers.map((t) => ({
    id: t.id,
    name: t.name,
    email: t.email,
    role: "TRAINER" as const,
    clients: map.get(t.id) ?? 0,
  }));

  return NextResponse.json({ ok: true, data });
}
