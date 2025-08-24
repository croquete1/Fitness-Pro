import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { logPlanChange } from '@/lib/planLog';
import { Role } from '@prisma/client';

async function canAccess(user: any, plan: { trainerId: string; clientId: string }) {
  if (!user) return false;
  if (user.role === Role.ADMIN) return true;
  if (user.role === Role.TRAINER && plan.trainerId === user.id) return true;
  if (user.role === Role.CLIENT && plan.clientId === user.id) return true;
  return false;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: params.id },
  });
  if (!plan) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  if (!(await canAccess(user, plan))) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  return NextResponse.json({ plan });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const current = await prisma.trainingPlan.findUnique({
    where: { id: params.id },
  });
  if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Só TRAINER dono ou ADMIN
  if (!(await canAccess(user, current)) || ![Role.TRAINER, Role.ADMIN].includes(user.role))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  const data: any = {};
  if (typeof body.title === 'string') data.title = body.title;
  if (typeof body.notes === 'string' || body.notes === null) data.notes = body.notes ?? null;
  if (body.exercises !== undefined) data.exercises = body.exercises;
  if (typeof body.status === 'string') data.status = body.status;

  const updated = await prisma.trainingPlan.update({
    where: { id: params.id },
    data,
  });

  await logAudit({
    actorId: user.id,
    action: 'plan.update',
    target: `plan:${updated.id}`,
    meta: { changed: Object.keys(data) },
  });

  await logPlanChange({
    planId: updated.id,
    actorId: user.id,
    changeType: 'update',
    diff: { before: current, after: updated } as any,
    snapshot: updated as any,
  });

  return NextResponse.json({ plan: updated });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const current = await prisma.trainingPlan.findUnique({ where: { id: params.id } });
  if (!current) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  // Só TRAINER dono ou ADMIN
  if (!(await canAccess(user, current)) || ![Role.TRAINER, Role.ADMIN].includes(user.role))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  await prisma.trainingPlan.delete({ where: { id: params.id } });

  await logAudit({
    actorId: user.id,
    action: 'plan.delete',
    target: `plan:${params.id}`,
    meta: { clientId: current.clientId },
  });

  await logPlanChange({
    planId: params.id,
    actorId: user.id,
    changeType: 'delete',
    snapshot: current as any,
  });

  return NextResponse.json({ ok: true });
}
