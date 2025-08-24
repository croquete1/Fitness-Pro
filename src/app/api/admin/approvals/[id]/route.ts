// src/app/api/admin/approvals/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { Status } from '@prisma/client';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const actorId = (session?.user as any)?.id as string | undefined;

    const { action } = await req.json();
    if (!['approve', 'suspend'].includes(action)) {
      return NextResponse.json({ error: 'ação inválida' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? Status.ACTIVE : Status.SUSPENDED;

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { status: newStatus },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

await logAudit({
  actorId: adminUser.id,
  kind: AuditKind.ACCOUNT_STATUS_CHANGE,
  message: action === "approve" ? "ACCOUNT_APPROVAL" : "ACCOUNT_STATUS_CHANGE",
  targetType: "User",
  targetId: user.id,
  diff: { statusFrom: prev.status, statusTo: next.status },
  req,
});

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
