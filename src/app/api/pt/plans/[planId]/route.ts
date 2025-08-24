import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PlanAction } from '@prisma/client';
import { logPlanChange } from '@/lib/logs';

// Notas:
// - Garante que só TRAINER pode mexer (ou ADMIN se quiseres permitir).
// - O corpo aceito em cada método tem { clientId, diff?, ... }.
// - Aqui apenas registamos no log. A persistência do plano fica a teu cargo.

async function ensureTrainer(session: any) {
  if (!session?.user?.id) return false;
  return session.user.role === 'TRAINER' || session.user.role === 'ADMIN';
}

export async function POST(req: Request, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!(await ensureTrainer(session))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const clientId = body.clientId as string | undefined;
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 });

  await logPlanChange({
    planId: params.planId,
    trainerId: session.user.id,
    clientId,
    action: PlanAction.CREATE,
    diff: body.diff ?? { fields: body.fields ?? null }, // livre
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!(await ensureTrainer(session))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const clientId = body.clientId as string | undefined;
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 });

  await logPlanChange({
    planId: params.planId,
    trainerId: session.user.id,
    clientId,
    action: PlanAction.UPDATE,
    diff: body.diff ?? { before: body.before ?? null, after: body.after ?? null },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: { planId: string } }) {
  const session = await getServerSession(authOptions);
  if (!(await ensureTrainer(session))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const clientId = body.clientId as string | undefined;
  if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 });

  await logPlanChange({
    planId: params.planId,
    trainerId: session.user.id,
    clientId,
    action: PlanAction.DELETE,
    diff: body.diff ?? null,
  });

  return NextResponse.json({ ok: true });
}
