// src/app/api/dashboard/stats/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role, Status } from '@prisma/client';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export async function GET() {
  const today = startOfToday();
  const in7 = addDays(today, 7);

  const [clients, trainers, admins, sessionsNext7, pendingApprovals] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.session.count({
      where: { scheduledAt: { gte: today, lt: in7 } },
    }),
    prisma.user.count({ where: { status: Status.PENDING } }),
  ]);

  return NextResponse.json({
    clients,
    trainers,
    admins,
    totalUsers: clients + trainers + admins,
    sessionsNext7,
    pendingApprovals,
  });
}
