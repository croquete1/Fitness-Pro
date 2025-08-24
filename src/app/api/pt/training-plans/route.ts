// src/app/api/pt/training-plans/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { logPlanChange } from '@/lib/planLog';
import { AuditKind, Role } from '@prisma/client';

type SessionUser = { id?: string; role?: Role | string } | null | undefined;

function asRole(v: unknown): Role | undefined {
  if (v === 'ADMIN' || v === 'TRAINER' || v === 'CLIENT') return v as Role;
  return undefined;
}

// POST /api/pt/training-plans  -> criar plano
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;
  const role = asRole(user?.role);

  if (!user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!(role === Role.TRAINER || role === Role.ADMIN)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({} as any));
  const clientId = String(body.clientId ?? '');
  const title = String(body.title ?? '');
  const notes = body.notes ?? null;
  const exercises = body.exercises ?? [];

  // se for TRAINER, o trainerId é sempre o do utilizador
  const trainerId = role === Role.TRAINER ? user.id! : String(body.trainerId ?? user?.id ?? '');

  if (!clientId || !title) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 });
  }

  // (opcional) garantir que o treinador é dono do plano quando TRAINER
  if (role === Role.TRAINER && trainerId !== user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const plan = await prisma.trainingPlan.create({
    data: {
      trainerId,
      clientId,
      title,
      notes,
      exercises, // JSON
      status: 'ACTIVE',
    },
  });

  // 🔎 AUDIT (sem 'action/target/meta'; usar assinatura nova)
  await logAudit({
    actorId: user.id!,
    kind: AuditKind.ACCOUNT_STATUS_CHANGE, // usa um dos enums existentes
    message: 'PLAN_CREATE',
    targetType: 'TrainingPlan',
    targetId: plan.id,
    diff: { clientId: plan.clientId, trainerId: plan.trainerId, title: plan.title },
  });

  // 📘 Registo de alterações de plano
  await logPlanChange({
    planId: plan.id,
    actorId: user.id!,
    changeType: 'create', // <- minúsculas
    snapshot: plan,
  });

  return NextResponse.json({ plan }, { status: 201 });
}
