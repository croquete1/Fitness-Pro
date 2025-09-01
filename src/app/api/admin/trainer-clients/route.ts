// src/app/api/admin/trainer-clients/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/sessions';
import { Role } from '@prisma/client';
import { auditLog } from '@/lib/audit';

function isAdminOrTrainer(r: unknown) {
  return r === 'ADMIN' || r === Role.ADMIN || r === 'TRAINER' || r === Role.TRAINER;
}

export async function POST(req: NextRequest) {
  const me = await getSessionUser();
  if (!me || !isAdminOrTrainer(me.role)) return new NextResponse('Forbidden', { status: 403 });

  const { trainerId, clientId } = await req.json().catch(() => ({}));
  if (!trainerId || !clientId) return new NextResponse('Missing trainerId/clientId', { status: 400 });

  // cria se não existir (par único)
  const link = await prisma.trainerClient.upsert({
    where: { trainerId_clientId: { trainerId, clientId } },
    update: {},
    create: { trainerId, clientId },
    select: { id: true, trainerId: true, clientId: true },
  });

  await auditLog({
    actorId: me.id,
    kind: 'ACCOUNT_APPROVAL',           // ou outro que prefiras
    message: 'Vínculo Trainer ⇄ Cliente criado',
    targetType: 'TRAINER_CLIENT',
    targetId: link.id,
    target: `${link.trainerId} ⇄ ${link.clientId}`,
    diff: { trainerId, clientId },
  });

  return NextResponse.json(link);
}