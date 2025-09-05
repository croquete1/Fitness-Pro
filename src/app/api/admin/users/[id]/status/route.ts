import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { toAppRole } from '@/lib/roles';

type Body = { status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' };

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });
  if (toAppRole(session.user.role) !== 'ADMIN') return new NextResponse('Forbidden', { status: 403 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 });
  }

  if (!['ACTIVE', 'SUSPENDED', 'PENDING'].includes(body.status))
    return new NextResponse('Invalid status', { status: 400 });

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { status: body.status },
    select: { id: true, status: true, updatedAt: true },
  });

  // opcional: log
  try {
    await prisma.auditLog.create({
      data: {
        actorId: String(session.user.id),
        kind: 'ACCOUNT_STATUS_CHANGE',
        action: `STATUS:${body.status}`,
        target: 'USER',
        targetId: params.id,
        targetType: 'user',
        meta: { old: null, new: body.status },
      } as any,
    });
  } catch {}

  return NextResponse.json({ ok: true, user: updated });
}
