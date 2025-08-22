import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client'; // <- importa o enum do Prisma

// util simples para hoje e +7
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d: Date, days: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + days);
  return c;
}

export async function GET() {
  try {
    const today = startOfToday();
    const in7 = addDays(today, 7);

    const [clients, trainers, admins, sessionsNext7] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.session.count({ where: { scheduledAt: { gte: today, lt: in7 } } }),
    ]);

    return NextResponse.json({
      clients,
      trainers,
      admins,
      sessionsNext7,
    });
  } catch (err) {
    // loga e devolve zeros para não quebrar o UI
    console.error('stats endpoint error:', err);
    return NextResponse.json(
      { clients: 0, trainers: 0, admins: 0, sessionsNext7: 0 },
      { status: 200 }
    );
  }
}
