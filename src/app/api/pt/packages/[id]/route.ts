// src/app/api/pt/packages/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AuditKind } from '@prisma/client';
import { logAudit } from '@/lib/audit';
import { normalizeRole } from '@/lib/roles'; // << NOVO

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  // --- INÍCIO: parte corrigida da sessão / me ---
  const rawUser = session?.user as any;
  if (!rawUser?.id) return new NextResponse('Unauthorized', { status: 401 });

  const role = normalizeRole(rawUser.role);
  if (!role) return new NextResponse('Forbidden', { status: 403 });

  const me: { id: string; role: Role } = { id: String(rawUser.id), role };

  // (opcional, mas recomendado): restringir operação a ADMIN/TRAINER
  if (me.role !== Role.ADMIN && me.role !== Role.TRAINER) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  // --- FIM: parte corrigida da sessão / me ---

  const id = params.id;
  const body = await _.json().catch(() => ({}));
  const status = String(body?.status ?? '').toLowerCase(); // 'active' | 'paused'

  if (!['active','paused'].includes(status)) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // exemplo com Prisma (ajusta conforme o teu schema real)
  const before = await prisma.trainingPlan.findUnique({
    where: { id },
    select: { id: true, status: true }
  });
  if (!before) return new NextResponse('Not Found', { status: 404 });

  // Se no Prisma 'status' for enum, mapeia explicitamente:
  // const nextStatus = status === 'active' ? 'ACTIVE' : 'PAUSED' as TrainingPlanStatus;
  const after = await prisma.trainingPlan.update({
    where: { id },
    data: { status: status.toUpperCase() }, // se guardares em UPPERCASE
    select: { id: true, status: true },
  });

  await logAudit({
    actorId: me.id,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE,
    message: 'Alteração de estado de pacote/plan',
    targetType: 'PACKAGE',        // mantém UPPERCASE para bater no tipo AuditTargetType
    targetId: id,
    diff: { before, after },
  });

  return NextResponse.json(after);
}