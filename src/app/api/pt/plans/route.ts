// src/app/api/pt/plans/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireUser } from '@/lib/authz';
import { logPlanChange } from '@/lib/planLog';
import { Role } from '@prisma/client';

// GET /api/pt/plans  -> listar planos visíveis ao utilizador
export async function GET() {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER, Role.CLIENT]);
  if ('error' in guard) return guard.error;
  const { user } = guard;

  if (user.role === Role.ADMIN) {
    const plans = await prisma.trainingPlan.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(plans);
  }

  if (user.role === Role.TRAINER) {
    const plans = await prisma.trainingPlan.findMany({
      where: {
        OR: [{ trainerId: user.id }, { clientId: user.id }],
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(plans);
  }

  // CLIENT
  const plans = await prisma.trainingPlan.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(plans);
}

// POST /api/pt/plans  -> criar plano (PT/Admin)
export async function POST(req: Request) {
  const guard = await requireUser([Role.ADMIN, Role.TRAINER]);
  if ('error' in guard) return guard.error;
  const { user } = guard;

  const body = await req.json().catch(() => ({} as any));
  const { clientId, title, notes, exercises, status } = body || {};

  if (!clientId || !title) {
    return NextResponse.json({ error: 'clientId e title são obrigatórios' }, { status: 400 });
  }

  const plan = await prisma.trainingPlan.create({
    data: {
      trainerId: user.id!,
      clientId: String(clientId),
      title: String(title),
      notes: typeof notes === 'string' ? notes : null,
      exercises: exercises ?? {},
      status: typeof status === 'string' ? status : 'ACTIVE',
    },
  });

  await logPlanChange({
    planId: plan.id,
    actorId: user.id!,
    changeType: 'create',         // <- minúsculas, conforme o tipo definido
    snapshot: plan as any,
  });

  return NextResponse.json(plan, { status: 201 });
}
