// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, Status, Prisma } from '@prisma/client';

function isAdmin(role: unknown) {
  return String(role ?? '').toUpperCase() === 'ADMIN';
}

function parseIntSafe(v: string | null, def = 1) {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : def;
}
function mapRole(input: string | null): Role | undefined {
  if (!input) return undefined;
  const v = input.toUpperCase();
  if (v === 'ADMIN') return Role.ADMIN;
  if (v === 'TRAINER' || v === 'PT') return Role.TRAINER;
  if (v === 'CLIENT') return Role.CLIENT;
  return undefined;
}
function mapStatus(input: string | null): Status | undefined {
  if (!input) return undefined;
  const v = input.toUpperCase();
  if (v === 'ACTIVE') return Status.ACTIVE;
  if (v === 'PENDING') return Status.PENDING;
  if (v === 'SUSPENDED') return Status.SUSPENDED;
  return undefined;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin((session.user as any)?.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseIntSafe(searchParams.get('page'), 1);
  const pageSize = Math.min(parseIntSafe(searchParams.get('pageSize'), 20), 100);
  const q = (searchParams.get('q') || '').trim();
  const role = mapRole(searchParams.get('role'));
  const status = mapStatus(searchParams.get('status'));
  const sort = (searchParams.get('sort') || 'createdAt:desc').toLowerCase();

  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy:
        sort === 'name:asc'
          ? { name: 'asc' }
          : sort === 'name:desc'
          ? { name: 'desc' }
          : sort === 'createdat:asc'
          ? { createdAt: 'asc' }
          : { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    page,
    pageSize,
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    items: items.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() })),
  });
}
