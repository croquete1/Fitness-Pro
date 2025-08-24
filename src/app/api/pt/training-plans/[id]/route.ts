// src/app/api/pt/training-plans/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { logPlanChange } from '@/lib/planLog';
import { Role, AuditKind } from '@prisma/client';

type SessionUser = { id?: string; role?: Role | string } | null | undefined;
type PlanLite = { trainerId: string; clientId: string };

function asRole(v: unknown): Role | undefined {
  if (v === 'ADMIN' || v === 'TRAINER' || v === 'CLIENT') return v as Role;
  return undefined;
}

async function canAccess(user: SessionUser, plan: PlanLite) {
  if (!user?.id) return false;
  const role = asRole(user.role);
  if (role === Role.ADMIN) return true;
  if (role === Role.TRAINER && plan.trainerId === user.id) return true;
  if (role === Role.CLIENT && plan.clientId === user.id) return true;
  return false;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;
  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const plan = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!plan) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (!(await canAccess(user, plan))) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  return NextResponse.json({ plan });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;
  const role = asRole(user?.role);
  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const current = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Só TRAINER dono ou ADMIN
  if (!(await canAccess(user, current)) || !(role === Role.TRAINER || role === Role.ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({} as any));
  const data: Record<string, any> = {};
  if (typeof body.title === 'string') data.title = body.title;
  if (typeof body.notes === 'string' || body.notes === null) data.notes = body.notes ?? null;
  if (body.exercises !== undefined) data.exercises = body.exercises; // JSON
  if (typeof body.status === 'string') data.status = body.status;

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: 'nada_para_atualizar' }, { status: 400 });
  }

  const updated = await prisma.trainingPlan.update({
    where: { id: params.id },
    data,
  });

  // Audit genérico (compatível com a API nova)
  await logAudit({
    actorId: user.id!,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE, // a usar um kind existente; criaremos um KIND específico se necessário
    message: 'PLAN_UPDATE',
    targetType: 'TrainingPlan',
    targetId: updated.id,
    diff: { changed: Object.keys(data) },
  });

  // Log de alterações de plano (histórico detalhado)
  await logPlanChange({
    planId: updated.id,
    actorId: user.id!,
    changeType: 'UPDATE',
    diff: { before: current, after: updated },
    snapshot: updated,
  });

  return NextResponse.json({ plan: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;
  const role = asRole(user?.role);
  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const current = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Só TRAINER dono ou ADMIN
  if (!(await canAccess(user, current)) || !(role === Role.TRAINER || role === Role.ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  // Hard delete (mantendo snapshot nos logs)
  await prisma.trainingPlan.delete({ where: { id: params.id } });

  await logAudit({
    actorId: user.id!,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE,
    message: 'PLAN_DELETE',
    targetType: 'TrainingPlan',
    targetId: params.id,
    diff: { clientId: current.clientId, trainerId: current.trainerId },
  });

  await logPlanChange({
    planId: params.id,
    actorId: user.id!,
    changeType: 'DELETE',
    snapshot: current,
  });

  return NextResponse.json({ ok: true });
}
