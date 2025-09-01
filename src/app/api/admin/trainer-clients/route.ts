// src/app/api/admin/trainer-clients/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/guards';
import { logAudit } from '@/lib/audit';
import { AuditKind } from '@prisma/client';

export async function POST(req: Request) {
  // Em alguns projetos requireAdmin() devolve um Session; noutros, o próprio user.
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

  // Extrair actorId de forma robusta (session.user.id ou id direto)
  const actorId =
    // @ts-expect-error — compat múltiplos formatos
    (me?.id as string | undefined) ??
    // @ts-expect-error — compat Session
    (me?.user?.id as string | undefined) ??
    null;

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