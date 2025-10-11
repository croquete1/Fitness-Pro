import { tryCreateServerClient } from '@/lib/supabaseServer';

export type PlanChangeType = 'create' | 'update' | 'delete';

export type PlanChangeParams = {
  planId: string;
  actorId?: string | null;
  changeType: PlanChangeType;
  diff?: unknown;
  snapshot?: unknown;
};

const CHANGE_TABLES = ['training_plan_changes', 'plan_changes'];

export async function logPlanChange(params: PlanChangeParams) {
  const sb = tryCreateServerClient();
  if (!sb) return;
  const payload = {
    plan_id: params.planId,
    planId: params.planId,
    actor_id: params.actorId ?? null,
    actorId: params.actorId ?? null,
    change_type: params.changeType,
    changeType: params.changeType,
    diff: params.diff ?? null,
    snapshot: params.snapshot ?? null,
  };

  for (const table of CHANGE_TABLES) {
    try {
      const res = await sb.from(table).insert(payload);
      if (res.error) {
        const code = res.error.code ?? '';
        if (code === 'PGRST205' || code === 'PGRST301' || code === '42703') continue;
        return;
      }
      return;
    } catch (error: any) {
      const code = error?.code ?? error?.message ?? '';
      if (code.includes('PGRST205') || code.includes('PGRST301') || code.includes('42703')) continue;
      return;
    }
  }
}

export function shallowPlanDiff(
  prev: Record<string, any>,
  next: Record<string, any>,
) {
  const keys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})]);
  const changes: Record<string, { from: any; to: any }> = {};
  for (const k of keys) {
    const a = prev?.[k];
    const b = next?.[k];
    const same =
      (typeof a === 'object' && a !== null) || (typeof b === 'object' && b !== null)
        ? JSON.stringify(a) === JSON.stringify(b)
        : a === b;
    if (!same) {
      changes[k] = { from: a, to: b };
    }
  }
  return changes;
}
