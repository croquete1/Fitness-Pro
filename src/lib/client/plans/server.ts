import { tryCreateServerClient, createServerClient } from '@/lib/supabaseServer';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ClientPlan } from '@/lib/plans/types';
import { buildClientPlanOverview } from './overview/builder';
import type { ClientPlanDayItem } from './overview/types';

function mapPlanRow(row: any): ClientPlan {
  const trainer = Array.isArray(row.trainer) ? row.trainer[0] : row.trainer;
  return {
    id: String(row.id),
    title: row.title ?? null,
    status: row.status ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? row.created_at ?? null,
    startDate: row.start_date ?? null,
    endDate: row.end_date ?? null,
    trainerId: trainer?.id ?? row.trainer_id ?? null,
    trainerName: trainer?.name ?? row.trainer_name ?? null,
    trainerEmail: trainer?.email ?? row.trainer_email ?? null,
  } satisfies ClientPlan;
}

function mapDayItem(row: any): ClientPlanDayItem | null {
  if (!row?.plan_id) return null;
  const dayIndex = Number.isFinite(row?.day_index) ? Number(row.day_index) : Number.parseInt(row?.day_index ?? '', 10);
  if (!Number.isFinite(dayIndex)) return null;
  return {
    planId: String(row.plan_id),
    dayIndex: Math.max(0, Math.min(6, Math.trunc(dayIndex))),
    exerciseId: row.exercise_id ? String(row.exercise_id) : row.exercise_id ?? null,
    id: row.id ? String(row.id) : row.id ?? null,
  } satisfies ClientPlanDayItem;
}

async function fetchDayItems(sb: SupabaseClient, planIds: string[]): Promise<ClientPlanDayItem[]> {
  if (!planIds.length) return [];
  const { data, error } = await sb
    .from('plan_day_exercises' as any)
    .select('id,plan_id,day_index,exercise_id')
    .in('plan_id', planIds);

  if (!error && Array.isArray(data)) {
    const mapped = data
      .map(mapDayItem)
      .filter((item): item is ClientPlanDayItem => Boolean(item));
    if (mapped.length > 0) return mapped;
  }

  const fallback = await sb
    .from('plan_day_items' as any)
    .select('id,plan_id,day_index,exercise_id')
    .in('plan_id', planIds);

  if (fallback.error) {
    console.error('[client-plan-overview] falha a carregar exercícios', fallback.error);
    return [];
  }

  return (fallback.data ?? [])
    .map(mapDayItem)
    .filter((item): item is ClientPlanDayItem => Boolean(item));
}

export async function fetchClientPlanOverview(
  userId: string,
  opts: { rangeDays?: number; now?: Date | string | number } = {},
) {
  const sb = createServerClient();
  const { data, error } = await sb
    .from('training_plans')
    .select(
      `id,title,status,created_at,updated_at,start_date,end_date,trainer_id,
       trainer:users!training_plans_trainer_id_fkey(id,name,email)`,
    )
    .eq('client_id', userId)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[client-plan-overview] falha ao carregar planos', error);
    throw error;
  }

  const plans: ClientPlan[] = (data ?? []).map(mapPlanRow);
  const dayItems = await fetchDayItems(sb, plans.map((plan) => plan.id));

  return buildClientPlanOverview(plans, dayItems, opts);
}

export async function fetchClientPlanOverviewSafe(
  userId: string,
  opts: { rangeDays?: number; now?: Date | string | number } = {},
) {
  const sb = tryCreateServerClient();
  if (!sb) return null;

  const { data, error } = await sb
    .from('training_plans')
    .select(
      `id,title,status,created_at,updated_at,start_date,end_date,trainer_id,
       trainer:users!training_plans_trainer_id_fkey(id,name,email)`,
    )
    .eq('client_id', userId)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[client-plan-overview] erro ao sincronizar planos', error);
    return null;
  }

  const plans: ClientPlan[] = (data ?? []).map(mapPlanRow);
  const dayItems = await fetchDayItems(sb, plans.map((plan) => plan.id));

  return buildClientPlanOverview(plans, dayItems, opts);
}
