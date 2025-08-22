// src/app/api/admin/users/[id]/reject/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role?.toUpperCase?.();
  if (role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const id = params.id;
  // regra simples: suspender; se preferires remover o utilizador, muda para delete
  await prisma.user.update({ where: { id }, data: { status: 'SUSPENDED' as any } });
  return NextResponse.json({ ok: true });
}
