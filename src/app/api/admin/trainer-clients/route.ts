import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/guards';
import prisma from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { AuditKind } from '@prisma/client';

export async function POST(req: Request) {
  const me = await requireAdmin();
  const { trainerId, clientId } = await req.json();

  if (!trainerId || !clientId) return new NextResponse('Bad Request', { status: 400 });

  const link = await prisma.trainerClient.upsert({
    where: { trainerId_clientId: { trainerId, clientId } },
    create: { trainerId, clientId },
    update: {},
    select: { id: true, trainerId: true, clientId: true },
  });

  await logAudit({
    actorId: me.id,
    kind: AuditKind.ACCOUNT_ROLE_CHANGE,
    message: 'Atribuição de cliente ao PT',
    targetType: 'TRAINER_CLIENT',
    targetId: link.id,
    diff: { trainerId, clientId },
  });

  return NextResponse.json(link);
}