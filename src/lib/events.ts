import { tryCreateServerClient } from '@/lib/supabaseServer';

export type EventInput = {
  type: 'PLAN_CREATED' | 'PLAN_UPDATED' | 'PLAN_ASSIGNED' | 'PLAN_VIEWED';
  actorId?: string | null;
  userId?: string | null;
  trainerId?: string | null;
  planId?: string | null;
  meta?: any;
  createdAt?: Date;
};

const EVENT_TABLES = ['plan_events', 'events', 'audit_log', 'event_log'];
const NOTIFICATION_TABLES = ['notifications', 'admin_notifications'];
const HISTORY_TABLES = ['plan_history', 'plan_events'];
const ASSIGNMENT_TABLES = ['plan_assignments', 'plan_clients'];
const PLAN_TABLES = ['training_plans', 'plans', 'programs'];
const PLAN_TRAINER_CACHE = new Map<string, string | null>();

function normalizeDate(value?: Date | string | null) {
  if (!value) return new Date().toISOString();
  if (typeof value === 'string') return new Date(value).toISOString();
  return value.toISOString();
}

async function tryInsert(table: string, payload: Record<string, any>) {
  const sb = tryCreateServerClient();
  if (!sb) return false;
  try {
    const res = await sb.from(table).insert(payload);
    if (res.error) {
      const code = res.error.code ?? '';
      if (code === 'PGRST205' || code === 'PGRST301' || code === '42703') return false;
      return false;
    }
    return true;
  } catch (error: any) {
    const code = error?.code ?? error?.message ?? '';
    if (code.includes('PGRST205') || code.includes('PGRST301') || code.includes('42703')) return false;
    return false;
  }
}

async function tryUpdate(table: string, id: string, payload: Record<string, any>) {
  const sb = tryCreateServerClient();
  if (!sb) return false;
  try {
    const res = await sb.from(table).update(payload).eq('id', id);
    if (res.error) {
      const code = res.error.code ?? '';
      if (code === 'PGRST205' || code === 'PGRST301' || code === '42703') return false;
      return false;
    }
    return (res.count ?? 0) > 0;
  } catch (error: any) {
    const code = error?.code ?? error?.message ?? '';
    if (code.includes('PGRST205') || code.includes('PGRST301') || code.includes('42703')) return false;
    return false;
  }
}

async function resolvePlanTrainerId(planId: string): Promise<string | null> {
  if (PLAN_TRAINER_CACHE.has(planId)) {
    return PLAN_TRAINER_CACHE.get(planId) ?? null;
  }

  const sb = tryCreateServerClient();
  if (!sb) return null;

  const sources: Array<{ table: string; column: string }> = [
    { table: 'training_plans', column: 'id' },
    { table: 'plans', column: 'id' },
    { table: 'programs', column: 'id' },
    { table: 'plan_assignments', column: 'plan_id' },
    { table: 'plan_assignments', column: 'planId' },
    { table: 'plan_clients', column: 'plan_id' },
    { table: 'plan_clients', column: 'planId' },
  ];

  for (const source of sources) {
    try {
      const res = await sb
        .from(source.table)
        .select('*')
        .eq(source.column, planId)
        .maybeSingle();

      if (res.error) {
        const code = res.error.code ?? '';
        if (code === 'PGRST205' || code === 'PGRST301' || code === '42703') continue;
        continue;
      }

      const row = res.data;
      if (!row) continue;

      const trainerRelation = Array.isArray(row.trainer)
        ? row.trainer[0]
        : typeof row.trainer === 'object'
          ? row.trainer
          : null;
      const trainer =
        row.trainer_id ??
        row.trainerId ??
        (trainerRelation && typeof trainerRelation === 'object' && 'id' in trainerRelation
          ? (trainerRelation as any).id
          : null);

      if (trainer) {
        const normalized = String(trainer);
        PLAN_TRAINER_CACHE.set(planId, normalized);
        return normalized;
      }
    } catch (error: any) {
      const code = error?.code ?? error?.message ?? '';
      if (code.includes('PGRST205') || code.includes('PGRST301') || code.includes('42703')) {
        continue;
      }
    }
  }

  PLAN_TRAINER_CACHE.set(planId, null);
  return null;
}

export async function writeEvent(data: EventInput) {
  const trainerId = data.trainerId ?? (data.planId ? await resolvePlanTrainerId(data.planId) : null);
  const createdAt = normalizeDate(data.createdAt);
  const payload = {
    type: data.type,
    actor_id: data.actorId ?? trainerId ?? null,
    actorId: data.actorId ?? trainerId ?? null,
    user_id: data.userId ?? null,
    trainer_id: trainerId ?? null,
    plan_id: data.planId ?? null,
    meta: data.meta ?? null,
    created_at: createdAt,
    createdAt,
  };

  for (const table of EVENT_TABLES) {
    if (await tryInsert(table, payload)) break;
  }

  const notifPayload = {
    user_id: trainerId ?? data.userId ?? null,
    title: 'Atualização de plano',
    body: data.type.replace('PLAN_', '').replace('_', ' '),
    read: false,
    created_at: createdAt,
    createdAt,
    payload,
  };

  for (const table of NOTIFICATION_TABLES) {
    if (await tryInsert(table, notifPayload)) break;
  }
}

export async function fetchEventsSince(sinceISO?: string, filter?: { trainerId?: string; userId?: string }) {
  const sb = tryCreateServerClient();
  if (!sb) return [];

  for (const table of EVENT_TABLES) {
    try {
      const res = await sb
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (res.error) {
        const code = res.error.code ?? '';
        if (code === 'PGRST205' || code === 'PGRST301') continue;
        return [];
      }
      const rows = (res.data ?? []).map((row: any) => ({
        id: String(row?.id ?? `${row?.type ?? 'event'}-${row?.created_at ?? row?.createdAt ?? ''}`),
        type: row?.type ?? 'PLAN_UPDATED',
        userId: row?.user_id ?? row?.userId ?? null,
        trainerId: row?.trainer_id ?? row?.trainerId ?? null,
        actorId: row?.actor_id ?? row?.actorId ?? null,
        planId: row?.plan_id ?? row?.planId ?? null,
        meta: row?.meta ?? null,
        createdAt: row?.created_at ?? row?.createdAt ?? null,
      }));

      const filtered = rows.filter((item) => {
        if (sinceISO && item.createdAt && new Date(item.createdAt) < new Date(sinceISO)) return false;
        if (filter?.trainerId && item.trainerId !== filter.trainerId) return false;
        if (filter?.userId && item.userId !== filter.userId) return false;
        return true;
      });

      if (filtered.length) return filtered;
    } catch {
      continue;
    }
  }

  return [];
}

export async function markPlanViewed(planId: string, clientId?: string | null) {
  const stamp = normalizeDate();
  for (const table of PLAN_TABLES) {
    if (
      await tryUpdate(table, planId, {
        viewed_at: stamp,
        viewedAt: stamp,
        last_viewed_by_id: clientId ?? null,
        lastViewedById: clientId ?? null,
      })
    ) {
      break;
    }
  }

  await appendPlanHistory(planId, {
    kind: 'PLAN_VIEWED',
    text: 'Plano visualizado',
    by: clientId ?? null,
    when: stamp,
  });
}

export async function appendPlanHistory(
  planId: string,
  entry: { kind: string; when?: string; text: string; by?: string | null; extra?: any },
) {
  const payload = {
    plan_id: planId,
    planId,
    kind: entry.kind,
    text: entry.text,
    by: entry.by ?? null,
    meta: entry.extra ?? null,
    created_at: entry.when ?? normalizeDate(),
    createdAt: entry.when ?? normalizeDate(),
  };

  for (const table of HISTORY_TABLES) {
    if (await tryInsert(table, payload)) return;
  }
}

export async function upsertPlanAssignment(opts: { planId: string; clientId?: string | null; trainerId?: string | null }) {
  const sb = tryCreateServerClient();
  if (!sb) return;
  const payload = {
    plan_id: opts.planId,
    planId: opts.planId,
    client_id: opts.clientId ?? null,
    clientId: opts.clientId ?? null,
    trainer_id: opts.trainerId ?? null,
    trainerId: opts.trainerId ?? null,
  };

  PLAN_TRAINER_CACHE.set(opts.planId, opts.trainerId ?? null);

  for (const table of ASSIGNMENT_TABLES) {
    try {
      const res = await sb
        .from(table)
        .upsert(payload, { onConflict: 'plan_id,client_id' })
        .select('*');
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
