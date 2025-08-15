// src/app/api/system/metrics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

export async function GET() {
  const [users, trainers, clients, pending] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { status: Status.PENDING } }),
  ]);

  const from = new Date(); from.setDate(from.getDate() - 7);
  const sessions7d = await prisma.session.count({ where: { scheduledAt: { gte: from } } }).catch(() => 0);

  return NextResponse.json({ ok: true, data: { users, trainers, clients, pending, sessions7d } });
}
