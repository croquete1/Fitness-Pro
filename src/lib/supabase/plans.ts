// src/lib/supabase/plans.ts
import { getSBAdmin } from './admin';

/** Linha vinda da BD (snake_case) */
type PlanRow = {
  id: string;
  trainer_id: string;
  client_id: string;
  title: string;
  notes: string | null;
  exercises: any; // JSON
  status: string;
  created_at: string;
  updated_at: string;
};

/** Modelo usado pela app (camelCase) */
export type TrainingPlan = {
  id: string;
  trainerId: string;
  clientId: string;
  title: string;
  notes: string | null;
  exercises: any; // JSON
  status: string; // 'ACTIVE' | 'DELETED' | ...
  createdAt: string;
  updatedAt: string;
};

type Patch = Partial<
  Pick<TrainingPlan, 'title' | 'notes' | 'exercises' | 'status'>
>;

/* ------------------------ helpers ------------------------ */

function mapRowToPlan(r: PlanRow): TrainingPlan {
  return {
    id: r.id,
    trainerId: r.trainer_id,
    clientId: r.client_id,
    title: r.title,
    notes: r.notes,
    exercises: r.exercises,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/** Diff raso (nível 1) entre 2 objetos de plano (apenas campos relevantes) */
function shallowPlanDiff(
  a: Partial<Pick<TrainingPlan, 'title' | 'notes' | 'exercises' | 'status'>>,
  b: Partial<Pick<TrainingPlan, 'title' | 'notes' | 'exercises' | 'status'>>
) {
  const keys: Array<keyof typeof a> = ['title', 'notes', 'exercises', 'status'];
  const changed: string[] = [];
  const from: Record<string, unknown> = {};
  const to: Record<string, unknown> = {};
  for (const k of keys) {
    const av = (a as any)[k];
    const bv = (b as any)[k];
    // comparação simples; se precisares de deep-equal no JSON, troca por JSON.stringify
    const equal =
      k === 'exercises'
        ? JSON.stringify(av) === JSON.stringify(bv)
        : av === bv;
    if (!equal) {
      changed.push(String(k));
      from[String(k)] = av ?? null;
      to[String(k)] = bv ?? null;
    }
  }
  return { changed, from, to };
}

/* ------------------------ API ------------------------ */

export async function sbGetPlan(id: string): Promise<TrainingPlan | null> {
  const sb = getSBAdmin();
  const { data, error } = await sb
    .from('training_plans')
    .select('*')
    .eq('id', id)
    .single<PlanRow>();
  if (error || !data) return null;
  return mapRowToPlan(data);
}

export async function sbCreatePlan(
  input: {
    trainerId: string;
    clientId: string;
    title: string;
    notes?: string | null;
    exercises?: any;
    status?: string;
  },
  actorId: string
): Promise<TrainingPlan> {
  const sb = getSBAdmin();
  const payload = {
    trainer_id: input.trainerId,
    client_id: input.clientId,
    title: input.title,
    notes: input.notes ?? null,
    exercises: input.exercises ?? {},
    status: input.status ?? 'ACTIVE',
  };

  const { data, error } = await sb
    .from('training_plans')
    .insert(payload)
    .select('*')
    .single<PlanRow>();

  if (error || !data) throw new Error(error?.message || 'create failed');

  await sbLogPlanChange({
    planId: data.id,
    actorId,
    changeType: 'create',
    snapshot: data,
  });

  return mapRowToPlan(data);
}

export async function sbUpdatePlan(
  id: string,
  patch: Patch,
  actorId: string
): Promise<TrainingPlan> {
  const sb = getSBAdmin();
  const before = await sbGetPlan(id);
  if (!before) throw new Error('not_found');

  const updates: Partial<PlanRow> = {};
  if (patch.title !== undefined) updates.title = patch.title;
  if (patch.notes !== undefined) updates.notes = patch.notes;
  if (patch.exercises !== undefined) updates.exercises = patch.exercises;
  if (patch.status !== undefined) updates.status = patch.status;

  if (!Object.keys(updates).length) return before;

  const { data, error } = await sb
    .from('training_plans')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single<PlanRow>();

  if (error || !data) throw new Error(error?.message || 'update failed');

  const after = mapRowToPlan(data);

  const diff = shallowPlanDiff(
    {
      title: before.title,
      notes: before.notes,
      exercises: before.exercises,
      status: before.status,
    },
    {
      title: after.title,
      notes: after.notes,
      exercises: after.exercises,
      status: after.status,
    }
  );

  await sbLogPlanChange({
    planId: id,
    actorId,
    changeType: 'update',
    diff,
    snapshot: data,
  });

  return after;
}

export async function sbSoftDeletePlan(id: string, actorId: string) {
  const sb = getSBAdmin();
  const before = await sbGetPlan(id);
  if (!before) throw new Error('not_found');

  const { data, error } = await sb
    .from('training_plans')
    .update({ status: 'DELETED' })
    .eq('id', id)
    .select('*')
    .single<PlanRow>();

  if (error || !data) throw new Error(error?.message || 'delete failed');

  await sbLogPlanChange({
    planId: id,
    actorId,
    changeType: 'delete',
    diff: { from: { status: before.status }, to: { status: 'DELETED' } },
    snapshot: data,
  });

  return true;
}

/* --------------------- change log --------------------- */

export async function sbLogPlanChange(args: {
  planId: string;
  actorId?: string | null;
  changeType: 'create' | 'update' | 'delete';
  diff?: unknown;
  snapshot?: unknown;
}) {
  const sb = getSBAdmin();
  const payload = {
    plan_id: args.planId,
    actor_id: args.actorId ?? null,
    change_type: args.changeType,
    diff: args.diff ?? null,
    snapshot: args.snapshot ?? null,
  };
  const { error } = await sb.from('training_plan_changes').insert(payload);
  if (error) console.warn('[sbLogPlanChange] fail:', error.message);
}
