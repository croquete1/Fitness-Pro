import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Role, AuditKind } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const me = session?.user as { id: string; role: Role } | null;
  if (!me?.id) return new NextResponse('Unauthorized', { status: 401 });

  const id = params.id;
  const body = await _.json().catch(() => ({}));
  const status = String(body?.status ?? '').toLowerCase(); // 'active' | 'paused'

  if (!['active','paused'].includes(status)) return new NextResponse('Bad Request', { status: 400 });

  // exemplo com Supabase-like tabela via Prisma (ajusta para a tua fonte real)
  const before = await prisma.trainingPlan.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!before) return new NextResponse('Not Found', { status: 404 });

  const after = await prisma.trainingPlan.update({
    where: { id },
    data: { status: status.toUpperCase() }, // se guardares em uppercase
    select: { id: true, status: true },
  });

  await logAudit({
    actorId: me.id,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE,
    message: 'Alteração de estado de pacote/plan',
    targetType: 'PACKAGE',
    targetId: id,
    diff: { before, after },
  });

  return NextResponse.json(after);
}