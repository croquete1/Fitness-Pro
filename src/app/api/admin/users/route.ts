// src/app/api/admin/users/route.ts
// GET /api/admin/users?role=CLIENT|TRAINER|ADMIN&q=andre&page=1&pageSize=20
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { toAppRole } from '@/lib/roles';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const me = await getSessionUser();
  if (!me || toAppRole((me as any).role) !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const role = (url.searchParams.get('role') ?? '').toUpperCase();
  const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(5, Number(url.searchParams.get('pageSize') ?? 20)));

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (role === 'CLIENT' || role === 'TRAINER' || role === 'ADMIN') where.role = role;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ ok: true, items, total, page, pageSize });
}
