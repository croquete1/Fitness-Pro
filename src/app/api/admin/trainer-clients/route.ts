// src/app/api/admin/trainer-clients/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/guards';
import { logAudit } from '@/lib/audit';
import { AuditKind } from '@prisma/client';

/** Extrai o id do utilizador a partir de diferentes formatos (user ou session). */
function resolveActorId(me: unknown): string | null {
  if (!me) return null;
  const anyMe = me as { id?: unknown; user?: { id?: unknown } };
  if (typeof anyMe.id === 'string') return anyMe.id;
  if (anyMe.user && typeof anyMe.user.id === 'string') return anyMe.user.id;
  return null;
}

export async function POST(req: Request) {
  const me = await requireAdmin();

  const body = await req.json().catch(() => ({}));
  const trainerId = String(body?.trainerId ?? '');
  const clientId  = String(body?.clientId ?? '');

  if (!trainerId || !clientId) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Upsert do vínculo PT-Cliente (único por par)
  const link = await prisma.trainerClient.upsert({
    where: { trainerId_clientId: { trainerId, clientId } },
    create: { trainerId, clientId },
    update: {},
    select: { id: true, trainerId: true, clientId: true },
  });

  const actorId = resolveActorId(me);

  await logAudit({
    actorId,
    kind: AuditKind.ACCOUNT_ROLE_CHANGE,
    message: 'Atribuição de cliente ao PT',
    targetType: 'TRAINER_CLIENT',
    targetId: link.id,
    diff: { trainerId, clientId },
  });

  return NextResponse.json(link);
}