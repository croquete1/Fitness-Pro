import { createServerClient, tryCreateServerClient } from '@/lib/supabaseServer';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientPlanDetail, ClientPlanDetailExercise } from './types';

function normalizeTrainer(row: any) {
  if (!row) return null;
  if (Array.isArray(row)) return row[0] ?? null;
  return row;
}

function mapExercise(row: any): ClientPlanDetailExercise | null {
  if (!row?.plan_id) return null;
  const dayIndex = Number.isFinite(row?.day_index) ? Number(row.day_index) : Number.parseInt(row?.day_index ?? '', 10);
  if (!Number.isFinite(dayIndex)) return null;
  return {
    id: row.id ? String(row.id) : `${row.plan_id}-${row.day_index}-${row.exercise_id ?? 'exercise'}`,
    dayIndex: Math.max(0, Math.min(6, Math.trunc(dayIndex))),
    order: Number.isFinite(row?.order) ? Number(row.order) : row?.order ?? null,
    exerciseId: String(row.exercise_id ?? row.id ?? ''),
    sets: row?.sets ?? null,
    reps: row?.reps ?? null,
    restSeconds: Number.isFinite(row?.rest_seconds) ? Number(row.rest_seconds) : row?.rest_seconds ?? null,
    notes: row?.notes ?? null,
    exercise: row?.exercise
      ? {
          id: row.exercise.id ? String(row.exercise.id) : row.exercise_id ?? String(row.id ?? ''),
          name: row.exercise.name ?? null,
          gifUrl: row.exercise.gif_url ?? null,
          videoUrl: row.exercise.video_url ?? null,
        }
      : null,
  } satisfies ClientPlanDetailExercise;
}

async function fetchPlanExercises(sb: SupabaseClient, planId: string): Promise<ClientPlanDetailExercise[]> {
  const { data, error } = await sb
    .from('plan_day_exercises' as any)
    .select(
      'id,plan_id,day_index,order,exercise_id,sets,reps,rest_seconds,notes,exercise:exercises(id,name,gif_url,video_url)',
    )
    .eq('plan_id', planId)
    .order('day_index')
    .order('order');

  if (!error && Array.isArray(data) && data.length > 0) {
    return data.map(mapExercise).filter((item): item is ClientPlanDetailExercise => Boolean(item));
  }

  const fallback = await sb
    .from('plan_day_items' as any)
    .select(
      'id,plan_id,day_index,order,exercise_id,sets,reps,rest_seconds,notes,exercise:exercises(id,name,gif_url,video_url)',
    )
    .eq('plan_id', planId)
    .order('day_index')
    .order('order');

  if (fallback.error) {
    console.error('[client-plan-detail] falha ao carregar exercícios', fallback.error);
    return [];
  }

  return (fallback.data ?? [])
    .map(mapExercise)
    .filter((item): item is ClientPlanDetailExercise => Boolean(item));
}

export async function getClientPlanDetail(
  planId: string,
  userId: string,
  role: 'CLIENT' | 'PT' | 'ADMIN',
): Promise<ClientPlanDetail | null> {
  const sb = createServerClient();

  const { data: plan, error } = await sb
    .from('training_plans')
    .select(
      `id,title,status,start_date,end_date,created_at,client_id,trainer_id,
       trainer:users!training_plans_trainer_id_fkey(id,name,email)`,
    )
    .eq('id', planId)
    .maybeSingle();

  if (error || !plan) {
    if (error) console.error('[client-plan-detail] falha ao carregar plano', error);
    return null;
  }

  if (role === 'CLIENT' && plan.client_id !== userId) {
    return null;
  }

  if (role === 'PT' && plan.trainer_id !== userId) {
    const { data: sessions } = await sb
      .from('sessions')
      .select('id')
      .eq('trainer_id', userId)
      .eq('client_id', plan.client_id)
      .limit(1);
    if (!sessions?.length) return null;
  }

  const trainerRow = normalizeTrainer(plan.trainer);
  const exercises = await fetchPlanExercises(sb, plan.id);
  const days = Array.from({ length: 7 }, (_, idx) => ({
    dayIndex: idx,
    items: exercises.filter((item) => item.dayIndex === idx),
  }));

  return {
    id: String(plan.id),
    title: plan.title ?? null,
    status: plan.status ?? null,
    startDate: plan.start_date ?? null,
    endDate: plan.end_date ?? null,
    createdAt: plan.created_at ?? null,
    clientId: plan.client_id ?? null,
    trainerId: plan.trainer_id ?? null,
    trainerName: trainerRow?.name ?? null,
    trainerEmail: trainerRow?.email ?? null,
    days,
  } satisfies ClientPlanDetail;
}

export async function getClientPlanDetailSafe(
  planId: string,
  userId: string,
  role: 'CLIENT' | 'PT' | 'ADMIN',
): Promise<ClientPlanDetail | null> {
  const sb = tryCreateServerClient();
  if (!sb) return null;

  const { data: plan, error } = await sb
    .from('training_plans')
    .select(
      `id,title,status,start_date,end_date,created_at,client_id,trainer_id,
       trainer:users!training_plans_trainer_id_fkey(id,name,email)`,
    )
    .eq('id', planId)
    .maybeSingle();

  if (error || !plan) {
    if (error) console.error('[client-plan-detail] falha ao sincronizar plano', error);
    return null;
  }

  if (role === 'CLIENT' && plan.client_id !== userId) {
    return null;
  }

  if (role === 'PT' && plan.trainer_id !== userId) {
    const { data: sessions } = await sb
      .from('sessions')
      .select('id')
      .eq('trainer_id', userId)
      .eq('client_id', plan.client_id)
      .limit(1);
    if (!sessions?.length) return null;
  }

  const trainerRow = normalizeTrainer(plan.trainer);
  const exercises = await fetchPlanExercises(sb, plan.id);
  const days = Array.from({ length: 7 }, (_, idx) => ({
    dayIndex: idx,
    items: exercises.filter((item) => item.dayIndex === idx),
  }));

  return {
    id: String(plan.id),
    title: plan.title ?? null,
    status: plan.status ?? null,
    startDate: plan.start_date ?? null,
    endDate: plan.end_date ?? null,
    createdAt: plan.created_at ?? null,
    clientId: plan.client_id ?? null,
    trainerId: plan.trainer_id ?? null,
    trainerName: trainerRow?.name ?? null,
    trainerEmail: trainerRow?.email ?? null,
    days,
  } satisfies ClientPlanDetail;
}
