// src/app/api/pt/training-plans/[id]/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/sessions';
import { toAppRole } from '@/lib/roles';
import { createServerClient } from '@/lib/supabaseServer';
import { logAudit, AUDIT_KINDS, AUDIT_TARGET_TYPES } from '@/lib/audit';

/** Campos permitidos no update do plano (ajusta conforme o teu schema) */
type PlanUpdate = Partial<{
  title: string;
  description: string | null;
  is_published: boolean;
  blocks: unknown;          // JSON de exercícios/estruturas
  notes: string | null;
}>;

type TrainingPlanRow = {
  id: string;
  trainer_id: string | null;
  client_id: string | null;
  title: string;
  description?: string | null;
  is_published?: boolean | null;
  blocks?: unknown;
  notes?: string | null;
  updated_at?: string;
};

async function canEditPlan(userId: string, role: ReturnType<typeof toAppRole>, plan: TrainingPlanRow) {
  if (role === 'ADMIN') return true;
  if (role === 'TRAINER' && plan.trainer_id === userId) return true;
  return false;
}

// GET: devolve o plano (se tiver acesso)
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const supabase = createServerClient();
  const { data: plan, error } = await supabase
    .from('training_plans')
    .select('id, trainer_id, client_id, title, description, is_published, blocks, notes, updated_at')
    .eq('id', params.id)
    .maybeSingle<TrainingPlanRow>();

  if (error) return new NextResponse(error.message, { status: 500 });
  if (!plan) return new NextResponse('Not Found', { status: 404 });

  const role = toAppRole((user as any).role);
  if (!(await canEditPlan(user.id, role, plan))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  return NextResponse.json(plan);
}

// PATCH: atualiza campos do plano (PT dono ou ADMIN)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) return new NextResponse('Unauthorized', { status: 401 });

  const id = params.id;
  if (!id) return new NextResponse('Missing id', { status: 400 });

  const supabase = createServerClient();

  // Carrega plano atual para verificar permissões e capturar "before"
  const { data: before, error: loadErr } = await supabase
    .from('training_plans')
    .select('id, trainer_id, client_id, title, description, is_published, blocks, notes, updated_at')
    .eq('id', id)
    .maybeSingle<TrainingPlanRow>();

  if (loadErr) return new NextResponse(loadErr.message, { status: 500 });
  if (!before) return new NextResponse('Not Found', { status: 404 });

  const role = toAppRole((user as any).role);
  if (!(await canEditPlan(user.id, role, before))) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Sanitiza o body para só aceitar campos permitidos
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data: PlanUpdate = {};
  if (typeof body.title === 'string') data.title = body.title;
  if (typeof body.description === 'string' || body.description === null) data.description = body.description as any;
  if (typeof body.is_published === 'boolean') data.is_published = body.is_published as boolean;
  if (body.blocks !== undefined) data.blocks = body.blocks;
  if (typeof body.notes === 'string' || body.notes === null) data.notes = body.notes as any;

  if (Object.keys(data).length === 0) {
    return new NextResponse('No valid fields to update', { status: 400 });
  }

  // Atualiza
  const { data: updated, error: upErr } = await supabase
    .from('training_plans')
    .update(data)
    .eq('id', id)
    .select('id, trainer_id, client_id, title, description, is_published, blocks, notes, updated_at')
    .maybeSingle<TrainingPlanRow>();

  if (upErr) return new NextResponse(upErr.message, { status: 500 });
  if (!updated) return new NextResponse('Not Found', { status: 404 });

  // Audit (corrigido: usar 'TRAINING_PLAN' em vez de 'TrainingPlan' e kind de plano)
  await logAudit({
    actorId: user.id,
    kind: 'PLAN_UPDATE',
    message: 'PT/ADMIN atualizou plano de treino',
    targetType: 'TRAINING_PLAN', // <<< antes estava "TrainingPlan" (string inválida)
    targetId: updated.id,
    diff: { before: { title: before.title, is_published: before.is_published }, after: { title: updated.title, is_published: updated.is_published } },
  });

  return NextResponse.json(updated);
}