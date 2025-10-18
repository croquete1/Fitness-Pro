import { tryCreateServerClient } from '@/lib/supabaseServer';
import { isMissingAuditTableError } from '@/lib/audit';
import { buildAuditLogDashboard } from './dashboard';
import type { AuditLogDashboardResponse, AuditLogRecord } from './types';
import { getSystemLogsDashboardFallback } from '@/lib/fallback/system-logs';

const AUDIT_SELECT =
  'id,created_at,kind,category,action,target_type,target_id,target,actor_id,actor,note,details,meta,payload,ip';

function toObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  if (value instanceof Date) return null;
  if (Array.isArray(value)) return { items: value };
  return value as Record<string, unknown>;
}

function mapRow(row: any): AuditLogRecord {
  return {
    id: typeof row.id === 'string' ? row.id : String(row.id ?? crypto.randomUUID()),
    createdAt: typeof row.created_at === 'string' ? row.created_at : null,
    kind: typeof row.kind === 'string' ? row.kind : null,
    category: typeof row.category === 'string' ? row.category : null,
    action: typeof row.action === 'string' ? row.action : null,
    targetType: typeof row.target_type === 'string' ? row.target_type : null,
    targetId: row.target_id != null ? String(row.target_id) : null,
    target: typeof row.target === 'string' ? row.target : null,
    actorId: row.actor_id != null ? String(row.actor_id) : null,
    actor: typeof row.actor === 'string' ? row.actor : null,
    note: typeof row.note === 'string' ? row.note : null,
    details: toObject(row.details),
    meta: toObject(row.meta),
    payload: toObject(row.payload),
    ip: typeof row.ip === 'string' ? row.ip : null,
  } satisfies AuditLogRecord;
}

async function hydrateMissingActorNames(
  sb: ReturnType<typeof tryCreateServerClient>,
  records: AuditLogRecord[],
): Promise<void> {
  if (!sb) return;
  const ids = new Set<string>();
  for (const record of records) {
    if (record.actorId && (!record.actor || record.actor.trim().length === 0)) {
      ids.add(record.actorId);
    }
  }
  if (!ids.size) return;
  try {
    const { data, error } = await sb
      .from('profiles')
      .select('id,full_name,name')
      .in('id', Array.from(ids))
      .limit(240);
    if (error) throw error;
    const map = new Map<string, string>();
    (data ?? []).forEach((profile: any) => {
      if (!profile?.id) return;
      const label =
        (typeof profile.full_name === 'string' && profile.full_name.trim().length > 0
          ? profile.full_name
          : typeof profile.name === 'string'
          ? profile.name
          : null) ?? null;
      if (label) map.set(String(profile.id), label);
    });
    records.forEach((record) => {
      if (record.actorId && (!record.actor || record.actor.trim().length === 0)) {
        const candidate = map.get(record.actorId);
        if (candidate) record.actor = candidate;
      }
    });
  } catch (error) {
    console.warn('[system-logs] falha ao hidratar nomes de actores', error);
  }
}

export async function loadSystemLogsDashboard(rangeDays = 14): Promise<AuditLogDashboardResponse> {
  const fallback = getSystemLogsDashboardFallback(rangeDays);
  const sb = tryCreateServerClient();
  if (!sb) {
    return { ...fallback, ok: true, source: 'fallback' } satisfies AuditLogDashboardResponse;
  }

  try {
    const { data, error } = await sb
      .from('audit_log')
      .select(AUDIT_SELECT)
      .order('created_at', { ascending: false })
      .limit(720);
    if (error) throw error;

    const rows = Array.isArray(data) ? data : [];
    const records = rows.map(mapRow);

    await hydrateMissingActorNames(sb, records);

    const dashboard = buildAuditLogDashboard(records, { rangeDays });
    return { ...dashboard, ok: true, source: 'supabase' } satisfies AuditLogDashboardResponse;
  } catch (error) {
    if (isMissingAuditTableError(error)) {
      console.warn('[system-logs] tabela audit_log inexistente, a usar fallback.', error);
    } else {
      console.error('[system-logs] erro ao carregar dados de auditoria', error);
    }
    return { ...fallback, ok: true, source: 'fallback' } satisfies AuditLogDashboardResponse;
  }
}
