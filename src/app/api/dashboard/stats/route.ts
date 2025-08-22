import { NextResponse } from 'next/server';
import prisma, { Role } from '@/lib/prisma'; // Role vem de @prisma/client

// util simples para “hoje” (00:00) e +7 dias
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

    // ⚠️ Usa os ENUNS do Prisma: ADMIN / TRAINER / CLIENT
    const [clients, trainers, admins, sessionsNext7] = await Promise.all([
      prisma.user.count({ where: { role: Role.CLIENT } }),
      prisma.user.count({ where: { role: Role.TRAINER } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.session.count({
        where: {
          // usa o campo certo do teu schema (deixei 'scheduledAt' por ser o que tinhas nos logs)
          scheduledAt: { gte: today, lt: in7 },
        },
      }),
    ]);

    return NextResponse.json({
      clients,
      trainers,
      admins,
      sessionsNext7,
    });
  } catch (e: any) {
    console.error('stats error:', e);
    return NextResponse.json({ error: 'stats_failed' }, { status: 500 });
  }
}
