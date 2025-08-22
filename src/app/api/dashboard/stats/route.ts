import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0,0,0,0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function fmt(d: Date) {
  return d.toISOString().slice(0,10);
}

export async function GET() {
  try {
    const now = new Date();
    const today = startOfDay(now);
    const in7 = addDays(today, 7);

    const [clients, trainers, admins, sessionsNext7] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.session.count({
        where: { scheduledAt: { gte: today, lt: in7 } },
      }),
    ]);

    // tendência últimos 7 dias
    const trend: Array<{date: string; sessions: number}> = [];
    for (let i = 6; i >= 0; i--) {
      const day = addDays(today, -i);
      const next = addDays(day, 1);
      const sessions = await prisma.session.count({
        where: { scheduledAt: { gte: day, lt: next } },
      });
      trend.push({ date: fmt(day), sessions });
    }

    return NextResponse.json({
      counts: { clients, trainers, admins, sessionsNext7 },
      trend,
      upcomingSessions: [],
      notifications: [],
    });
  } catch (e) {
    console.error('stats error', e);
    return NextResponse.json({ error: 'stats_failed' }, { status: 500 });
  }
}
