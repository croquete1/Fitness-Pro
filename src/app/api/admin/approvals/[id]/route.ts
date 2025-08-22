// src/app/api/admin/approvals/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Status } from '@prisma/client';

function isAdmin(role: unknown) {
  const v = String(role ?? '').toUpperCase();
  return v === 'ADMIN';
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !isAdmin((session.user as any)?.role)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const { action } = await req.json().catch(() => ({}));
  if (!action || !['approve', 'suspend'].includes(action)) {
    return NextResponse.json({ error: 'invalid action' }, { status: 400 });
  }

  const newStatus = action === 'approve' ? Status.ACTIVE : Status.SUSPENDED;

  const user = await prisma.user.update({
    where: { id: params.id },
    data: { status: newStatus },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, user });
}
