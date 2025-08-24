// src/app/api/admin/approvals/[id]/route.ts
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/authz';
import { logAudit } from '@/lib/logs';
import { AuditKind, Status } from '@prisma/client';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  const { action } = await req.json().catch(() => ({} as any));
  if (!['approve', 'suspend'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      status: action === 'approve' ? Status.ACTIVE : Status.SUSPENDED,
    },
    select: { id: true, email: true, status: true, role: true },
  });

  // usar actorId no log (deixa de ser "unused")
  await logAudit({
    actorId: user?.id ?? null,
    kind: action === 'approve' ? AuditKind.ACCOUNT_APPROVAL : AuditKind.ACCOUNT_STATUS_CHANGE,
    message:
      action === 'approve'
        ? `Aprovou conta ${updated.email}`
        : `Alterou status da conta ${updated.email} para ${updated.status}`,
    targetType: 'user',
    targetId: updated.id,
    diff: { action, status: updated.status },
  });

  return NextResponse.json({ ok: true });
}
