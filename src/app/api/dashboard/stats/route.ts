import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

function atStartOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export async function GET() {
  try {
    const today = atStartOfDay(new Date());
    const in7 = addDays(today, 7);

    // Contagens principais
    const [clients, trainers, admins, sessionsNext7] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.session.count({
        where: { scheduledAt: { gte: today, lt: in7 } },
      }),
    ]);

    // Tendência últimos 7 dias (0..6)
    const trend = await Promise.all(
      Array.from({ length: 7 }).map(async (_, i) => {
        const dayStart = addDays(today, -6 + i); // há 6 dias até hoje
        const dayEnd = addDays(dayStart, 1);
        const count = await prisma.session.count({
          where: { scheduledAt: { gte: dayStart, lt: dayEnd } },
        });
        return { date: dayStart.toISOString().slice(0, 10), sessions: count };
      })
    );

    return NextResponse.json({
      counts: { clients, trainers, admins, sessionsNext7 },
      trend,
      upcomingSessions: [],
      notifications: [],
    });
  } catch (e) {
    console.error('stats error', e);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
