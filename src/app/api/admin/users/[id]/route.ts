// src/app/api/admin/approvals/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Status } from '@prisma/client';
import { revalidateTag } from 'next/cache';

function isAdmin(role: unknown) {
  return String(role ?? '').toUpperCase() === 'ADMIN';
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin((session.user as any)?.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { action } = (await req.json()) as { action: 'approve' | 'suspend' };
  if (!['approve', 'suspend'].includes(action))
    return NextResponse.json({ error: 'invalid_action' }, { status: 400 });

  const status = action === 'approve' ? Status.ACTIVE : Status.SUSPENDED;

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { status },
    select: { id: true, status: true },
  });

  // Notifica todas as páginas/tagged fetches
  revalidateTag('dashboard:counters');

  return NextResponse.json(updated);
}
