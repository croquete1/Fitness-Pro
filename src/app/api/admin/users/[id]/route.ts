// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role, Status, AuditKind } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getReqMeta, logAudit } from '@/lib/logs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  // aceitar role como string ("admin") ou enum (Role.ADMIN)
  const isAdmin =
    !!session?.user &&
    (typeof (session.user as any).role === 'string'
      ? String((session.user as any).role).toUpperCase() === 'ADMIN'
      : (session.user as any).role === Role.ADMIN);

  if (!session?.user?.id || !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const nextRole   = body.role   as keyof typeof Role | undefined;   // 'ADMIN' | 'TRAINER' | 'CLIENT'
  const nextStatus = body.status as keyof typeof Status | undefined; // 'PENDING' | 'ACTIVE' | 'SUSPENDED'

  if (!nextRole && !nextStatus) {
    return NextResponse.json({ error: 'Nothing to change' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updates: Record<string, any> = {};
  const diffs: Array<{ kind: AuditKind; message: string; diff: any }> = [];

  if (nextRole && Role[nextRole]) {
    updates.role = Role[nextRole];
    diffs.push({
      kind: AuditKind.ACCOUNT_ROLE_CHANGE,
      message: 'Role changed',
      diff: { from: { role: user.role }, to: { role: Role[nextRole] } },
    });
  }

  if (nextStatus && Status[nextStatus]) {
    updates.status = Status[nextStatus];
    diffs.push({
      kind: AuditKind.ACCOUNT_STATUS_CHANGE,
      message: 'Status changed',
      diff: { from: { status: user.status }, to: { status: Status[nextStatus] } },
    });
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data: updates });

  // capturar IP/UA mas embutir no diff (já que logAudit não aceita ip/userAgent)
  const { ip, userAgent } = getReqMeta();

await Promise.all(
  diffs.map((d) =>
    logAudit({
      actorId: String((session.user as any).id),
      kind: d.kind,
      message: d.message,
      targetType: 'User',
      targetId: user.id,
      diff: d.diff,
      ip,
      userAgent,
    })
  )
);

  return NextResponse.json({
    ok: true,
    user: { id: updated.id, role: updated.role, status: updated.status },
  });
}
