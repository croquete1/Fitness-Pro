import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);

  const [clients, trainers, admins, sessionsNext7] = await Promise.all([
    prisma.user.count({ where: { role: Role.CLIENT } }),
    prisma.user.count({ where: { role: Role.TRAINER } }),
    prisma.user.count({ where: { role: Role.ADMIN } }),
    prisma.session.count({ where: { scheduledAt: { gte: today, lt: in7 } } }),
  ]);

  return NextResponse.json({ clients, trainers, admins, sessionsNext7 });
}
