// src/lib/planLog.ts
import prisma from '@/lib/prisma';

export type PlanChangeType = 'create' | 'update' | 'delete';

export type PlanChangeParams = {
  planId: string;
  actorId?: string | null;
  changeType: PlanChangeType;
  diff?: unknown;
  snapshot?: unknown;
};

export async function logPlanChange(params: PlanChangeParams) {
  await prisma.trainingPlanChange.create({
    data: {
      planId: params.planId,
      actorId: params.actorId ?? null,
      changeType: params.changeType,         // usa 'create' | 'update' | 'delete' (minúsculas)
      diff: (params.diff ?? null) as any,
      snapshot: (params.snapshot ?? null) as any,
    },
  });
}

/**
 * Diff raso de campos de plano (apenas top-level)
 */
export function shallowPlanDiff(
  prev: Record<string, any>,
  next: Record<string, any>
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
