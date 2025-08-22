import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client'; // <-- fix

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

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = startOfToday();
    const in7 = addDays(today, 7);

    const [clients, trainers, admins, sessionsNext7] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.session.count({
        // use your real datetime field; keeping scheduledAt based on your schema
        where: { scheduledAt: { gte: today, lt: in7 } },
      }),
    ]);

    return NextResponse.json({ clients, trainers, admins, sessionsNext7 });
  } catch (e) {
    console.error('stats error:', e);
    return NextResponse.json({ error: 'stats_failed' }, { status: 500 });
  }
}
