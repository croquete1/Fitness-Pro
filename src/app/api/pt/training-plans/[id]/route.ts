// src/app/api/pt/training-plans/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import type { AppRole } from '@/lib/roles';
import { toAppRole, isAdmin, isPT } from '@/lib/roles';

type PlanStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

// Shape canónico do plano (camelCase do Prisma)
type TrainingPlanRow = {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  status: PlanStatus | string;
  updatedAt: Date;
};

function canViewPlan(userId: string, role: AppRole, plan: TrainingPlanRow) {
  if (isAdmin(role)) return true;
  if (isPT(role) && plan.trainerId === userId) return true; // PT só vê planos que treinam
  // Cliente pode ver o seu próprio plano — se fizeres GET autenticado para clientes
  if (role === 'CLIENT' && plan.clientId === userId) return true;
  return false;
}

function canEditPlan(userId: string, role: AppRole, plan: TrainingPlanRow) {
  if (isAdmin(role)) return true;
  // 🔧 Corrigido: usar 'PT' (role da App), não 'TRAINER'
  if (isPT(role) && plan.trainerId === userId) return true;
  return false;
}

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  const rawUser = session?.user;
  if (!rawUser?.id) return null;

  const role = toAppRole((rawUser as any).role);
  if (!role) return null;

  return { id: String(rawUser.id), role };
}

/** GET: obter um plano de treino (admin, PT do plano, ou cliente dono do plano) */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return new NextResponse('Unauthorized', { status: 401 });

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      trainerId: true,
      clientId: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  if (!plan) return new NextResponse('Not found', { status: 404 });

  if (!canViewPlan(me.id, me.role, plan)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Serializar datas para ISO
  return NextResponse.json({
    ...plan,
    updatedAt: plan.updatedAt.toISOString(),
  });
}

/** PATCH: atualizar um plano (admin ou PT dono do plano) */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const me = await getSessionUser();
  if (!me) return new NextResponse('Unauthorized', { status: 401 });

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      trainerId: true,
      clientId: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });
  if (!plan) return new NextResponse('Not found', { status: 404 });

  if (!canEditPlan(me.id, me.role, plan)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Corpo minimal (sem zod para evitar deps): aceita title/status
  let body: Partial<{ title: string; status: PlanStatus }>;
  try {
    body = await req.json();
  } catch {
    return new NextResponse('Invalid JSON body', { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.title === 'string' && body.title.trim()) data.title = body.title.trim();
  if (body.status && ['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(body.status)) {
    data.status = body.status;
  }

  if (Object.keys(data).length === 0) {
    return new NextResponse('No valid fields to update', { status: 400 });
  }

  const updated = await prisma.trainingPlan.update({
    where: { id: params.id },
    data,
    select: {
      id: true,
      trainerId: true,
      clientId: true,
      title: true,
      status: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({
    ...updated,
    updatedAt: updated.updatedAt.toISOString(),
  });
}
