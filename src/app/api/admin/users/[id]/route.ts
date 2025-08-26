import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import { Role, Status, AuditKind } from '@prisma/client';
import { logAudit } from '@/lib/logs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if ('error' in guard) return guard.error;
  const admin = guard.user;

  const payload = await req.json().catch(() => ({} as any));
  const data: Partial<{
    name: string;
    email: string;
    role: Role;
    status: Status;
  }> = {};

  if (typeof payload.name === 'string') data.name = payload.name.trim();
  if (typeof payload.email === 'string') data.email = payload.email.trim().toLowerCase();
  if (typeof payload.role === 'string' && payload.role in Role) data.role = payload.role as Role;
  if (typeof payload.status === 'string' && payload.status in Status) data.status = payload.status as Status;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
  }

  const before = await prisma.user.findUnique({
    where: { id: params.id },
    select: { name: true, email: true, role: true, status: true },
  });
  if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const updated = await prisma.user.update({ where: { id: params.id }, data });

    await logAudit({
      actorId: admin.id!,
      kind:
        'role' in data
          ? AuditKind.ACCOUNT_ROLE_CHANGE
          : AuditKind.ACCOUNT_STATUS_CHANGE,
      message: 'user.update',
      targetType: 'User',
      targetId: params.id,
      diff: { before, after: { ...before, ...data } },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (e: any) {
    // conflito de email único
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'EMAIL_UNIQUE' }, { status: 409 });
    }
    console.error('[users.patch]', e);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
