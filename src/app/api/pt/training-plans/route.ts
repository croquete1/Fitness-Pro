// src/app/api/pt/training-plans/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { AppRole } from '@/lib/roles';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

export async function GET(_req: Request) {
  // 1) Auth
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // 2) Role normalizada da App
  const role = toAppRole((user as any).role);
  if (!role) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 3) Autorização: apenas ADMIN ou PT
  if (!isAdmin(role) && !isPT(role)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // 4) Query
  const viewerId = String(user.id);
  const where = isAdmin(role) ? {} : { trainerId: viewerId };

  const plans = await prisma.trainingPlan.findMany({
    where,
    select: {
      id: true,
      trainerId: true,
      clientId: true,
      title: true,
      status: true,
      updatedAt: true,
      createdAt: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 100, // ajusta conforme necessário
  });

  // 5) Serializar datas (ISO) para evitar hydration issues
  const data = plans.map((p) => ({
    ...p,
    updatedAt: p.updatedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

  return NextResponse.json({
    ok: true,
    viewer: { id: viewerId, role: role as AppRole }, // 'ADMIN' | 'PT'
    count: data.length,
    plans: data,
  });
}
