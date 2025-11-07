import { NextResponse } from 'next/server';

import { appendPlanHistory, upsertPlanAssignment, writeEvent } from '@/lib/events';
import { toAppRole } from '@/lib/roles';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

const DEFAULT_STATUS: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' = 'DRAFT';

type CreatePlanBody = {
  title?: string | null;
  description?: string | null;
  notes?: string | null;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  clientId?: string | null;
  client_id?: string | null;
  isTemplate?: boolean;
  is_template?: boolean;
  copyFromPlanId?: string | null;
  copy_from_plan_id?: string | null;
};

type PlanDayRow = {
  id: string;
  plan_id: string;
  day_index: number;
  title: string | null;
};

type PlanExerciseRow = {
  id: string;
  day_id: string;
  order_index: number;
  title: string;
  notes: string | null;
};

function normaliseString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function normaliseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (lowered === 'true') return true;
    if (lowered === 'false') return false;
  }
  if (typeof value === 'number') return value !== 0;
  return fallback;
}

async function duplicatePlanStructure(
  sb: ReturnType<typeof createServerClient>,
  sourcePlanId: string,
  targetPlanId: string,
) {
  const { data: days, error: dayError } = await sb
    .from('plan_days')
    .select('id, plan_id, day_index, title')
    .eq('plan_id', sourcePlanId)
    .order('day_index', { ascending: true });

  if (dayError) throw new Error(dayError.message);

  const originalDays = (days ?? []) as PlanDayRow[];
  if (!originalDays.length) return;

  const dayIdMap = new Map<string, string>();
  const nowIso = new Date().toISOString();
  const dayPayload = originalDays.map((day, index) => {
    const newId = crypto.randomUUID();
    dayIdMap.set(day.id, newId);
    return {
      id: newId,
      plan_id: targetPlanId,
      day_index: index,
      title: day.title ?? null,
      created_at: nowIso,
    };
  });

  const { error: insertDaysError } = await sb.from('plan_days').insert(dayPayload);
  if (insertDaysError) throw new Error(insertDaysError.message);

  const sourceDayIds = originalDays.map((day) => day.id);
  const { data: exercises, error: exError } = await sb
    .from('plan_exercises')
    .select('id, day_id, order_index, title, notes')
    .in('day_id', sourceDayIds)
    .order('order_index', { ascending: true });

  if (exError) throw new Error(exError.message);

  const exerciseRows = (exercises ?? []) as PlanExerciseRow[];
  if (!exerciseRows.length) return;

  const exercisePayload = exerciseRows
    .map((exercise) => {
      const targetDayId = dayIdMap.get(exercise.day_id);
      if (!targetDayId) return null;
      return {
        id: crypto.randomUUID(),
        day_id: targetDayId,
        order_index: exercise.order_index ?? 0,
        title: exercise.title?.trim() || 'Exercício',
        notes: exercise.notes ?? null,
        created_at: nowIso,
      };
    })
    .filter(Boolean);

  if (!exercisePayload.length) return;

  const { error: insertExercisesError } = await sb.from('plan_exercises').insert(exercisePayload);
  if (insertExercisesError) throw new Error(insertExercisesError.message);
}

export async function POST(req: Request): Promise<Response> {
  const session = await getSessionUserSafe();
  if (!session?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const role = toAppRole(session.role);
  if (role !== 'PT' && role !== 'ADMIN') {
    return new NextResponse('Forbidden', { status: 403 });
  }

  let body: CreatePlanBody;
  try {
    body = (await req.json()) as CreatePlanBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const rawTitle = normaliseString(body.title);
  if (!rawTitle) {
    return NextResponse.json({ ok: false, error: 'missing_title' }, { status: 400 });
  }

  const status = body.status === 'ACTIVE' || body.status === 'ARCHIVED' ? body.status : DEFAULT_STATUS;
  const requestedClientId = normaliseString(body.clientId ?? body.client_id);
  const isTemplate = normaliseBoolean(body.isTemplate ?? body.is_template, false);
  const clientId = isTemplate ? null : requestedClientId;
  const description = normaliseString(body.description);
  const notes = normaliseString(body.notes);
  const copyFromPlanId = normaliseString(body.copyFromPlanId ?? body.copy_from_plan_id);

  const sb = createServerClient();

  try {
    if (copyFromPlanId) {
      const { data: sourcePlan, error: sourceError } = await sb
        .from('training_plans')
        .select('id, trainer_id, is_template')
        .eq('id', copyFromPlanId)
        .maybeSingle();

      if (sourceError) throw new Error(sourceError.message);
      if (!sourcePlan) {
        return NextResponse.json({ ok: false, error: 'template_not_found' }, { status: 404 });
      }

      if (sourcePlan.trainer_id && sourcePlan.trainer_id !== session.id && !sourcePlan.is_template) {
        return NextResponse.json({ ok: false, error: 'template_forbidden' }, { status: 403 });
      }
    }

    const nowIso = new Date().toISOString();
    const insertPayload = {
      title: rawTitle,
      description,
      status,
      client_id: clientId,
      trainer_id: session.id,
      notes,
      is_template: isTemplate,
      template_id: copyFromPlanId ?? null,
      created_at: nowIso,
      updated_at: nowIso,
    } as const;

    const { data: created, error: insertError } = await sb
      .from('training_plans')
      .insert(insertPayload)
      .select('id, client_id, trainer_id, is_template')
      .single();

    if (insertError || !created) {
      throw new Error(insertError?.message ?? 'failed_to_create_plan');
    }

    const planId = created.id as string;

    try {
      if (copyFromPlanId) {
        await duplicatePlanStructure(sb, copyFromPlanId, planId);
      }
    } catch (copyError) {
      await sb.from('training_plans').delete().eq('id', planId);
      throw copyError instanceof Error
        ? copyError
        : new Error('failed_to_copy_template');
    }

    if (clientId) {
      try {
        await upsertPlanAssignment({ planId, clientId, trainerId: session.id });
      } catch {
        // non-blocking
      }
    }

    const historyText = isTemplate
      ? 'Plano base criado.'
      : clientId
        ? 'Plano criado para o cliente.'
        : 'Plano criado sem cliente atribuído.';

    await appendPlanHistory(planId, {
      kind: 'PLAN_CREATED',
      text: historyText,
      by: session.id,
      extra: { clientId, isTemplate, copyFromPlanId },
    });

    await writeEvent({
      type: 'PLAN_CREATED',
      actorId: session.id,
      trainerId: session.id,
      userId: clientId,
      planId,
      meta: { clientId, isTemplate, copyFromPlanId },
    });

    if (clientId) {
      try {
        const now = new Date().toISOString();
        await sb.from('notifications').insert([
          {
            user_id: clientId,
            type: 'TRAINING_PLAN_CREATED',
            payload: { plan_id: planId, trainer_id: session.id, client_id: clientId },
            read: false,
            created_at: now,
          } as any,
          {
            user_id: session.id,
            type: 'TRAINING_PLAN_CREATED',
            payload: { plan_id: planId, trainer_id: session.id, client_id: clientId },
            read: false,
            created_at: now,
          } as any,
        ]);
      } catch {
        // ignore notification failures
      }
    }

    return NextResponse.json({
      ok: true,
      id: planId,
      plan: {
        id: planId,
        clientId,
        isTemplate,
        status,
        title: rawTitle,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? 'unexpected_error' },
      { status: 500 },
    );
  }
}
