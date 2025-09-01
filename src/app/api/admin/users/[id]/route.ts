// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AuditKind, Role, Status } from '@prisma/client';
import { getSessionUser } from '@/lib/sessions';
import { logAudit } from '@/lib/audit';

function isAdmin(role: unknown) {
  return role === 'ADMIN' || role === Role.ADMIN;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me || !isAdmin(me.role)) return new NextResponse('Forbidden', { status: 403 });

  const id = params.id;
  const body = await req.json().catch(() => ({}));

  // Recolha de campos permitidos
  const data: Partial<{ status: Status; role: Role; name: string }> = {};
  if (body.status) data.status = body.status as Status;
  if (body.role)   data.role   = body.role   as Role;
  if (body.name)   data.name   = String(body.name);

  const before = await prisma.user.findUnique({ where: { id }, select: { role: true, status: true, email: true, name: true } });
  if (!before) return new NextResponse('Not found', { status: 404 });

  const user = await prisma.user.update({ where: { id }, data });

  // Auditoria segura — targetType NUNCA falta
  await logAudit({
    actorId: me.id,
    kind: body.status ? AuditKind.ACCOUNT_STATUS_CHANGE :
          body.role   ? AuditKind.ACCOUNT_ROLE_CHANGE   :
                        AuditKind.ACCOUNT_APPROVAL,
    message: 'Admin atualizou conta do utilizador',
    targetType: 'USER',
    targetId: user.id,
    target: user.email ?? user.name ?? user.id,
    diff: { before, after: data },
  });

  return NextResponse.json(user);
}