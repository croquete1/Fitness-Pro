import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { logPlanChange } from '@/lib/planLog';
import { Role } from '@prisma/client';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') ?? undefined;

  // ADMIN pode ver todos; TRAINER vê só os seus; CLIENT vê os seus
  const where: any = {};
  if (clientId) where.clientId = clientId;

  if (user.role === Role.TRAINER) where.trainerId = user.id;
  if (user.role === Role.CLIENT) where.clientId = user.id;
  // ADMIN não restringe

  const plans = await prisma.trainingPlan.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, trainerId: true, clientId: true,
      title: true, status: true, updatedAt: true, createdAt: true,
    },
  });

  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  // Só TRAINER ou ADMIN podem criar
  if (![Role.TRAINER, Role.ADMIN].includes(user.role))
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await req.json();
  const { clientId, title, notes, exercises } = body ?? {};
  if (!clientId || !title)
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

  const plan = await prisma.trainingPlan.create({
    data: {
      trainerId: user.role === Role.TRAINER ? user.id : (body.trainerId ?? user.id),
      clientId,
      title,
      notes: notes ?? null,
      exercises: exercises ?? [],
    },
    select: { id: true, trainerId: true, clientId: true, title: true, notes: true, exercises: true, status: true, createdAt: true },
  });

  await logAudit({
    actorId: user.id,
    action: 'plan.create',
    target: `plan:${plan.id}`,
    meta: { clientId: plan.clientId, trainerId: plan.trainerId, title: plan.title },
  });

  await logPlanChange({
    planId: plan.id,
    actorId: user.id,
    changeType: 'create',
    snapshot: plan as any,
  });

  return NextResponse.json({ plan });
}
