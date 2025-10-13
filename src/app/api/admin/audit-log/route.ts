import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { AUDIT_TABLE_CANDIDATES, isMissingAuditTableError } from '@/lib/audit';

type AuditRow = {
  id: string;
  created_at: string | null;
  kind: string | null;
  category: string | null;
  action: string | null;
  target_type: string | null;
  target_id: string | null;
  target: string | null;
  actor_id: string | null;
  actor: string | null;
  note: string | null;
  details: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
};

type MetaResponse = {
  kinds: string[];
  targetTypes: string[];
  actors: { id: string | null; label: string | null }[];
};

type ActorOption = { id: string | null; label: string | null };

type ActorHydrationResult = {
  rows: AuditRow[];
  actors?: ActorOption[];
};

function firstNonEmptyString(values: (string | null | undefined)[]): string | null {
  for (const value of values) {
    if (value) {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
  }
  return null;
}

async function hydrateActors(
  sb: ReturnType<typeof createServerClient>,
  rows: AuditRow[],
  metaActors?: ActorOption[]
): Promise<ActorHydrationResult> {
  const candidateIds = new Set<string>();

  rows.forEach((row) => {
    if (!row.actor_id) return;
    const actor = row.actor ? row.actor.trim() : '';
    if (!actor || actor === row.actor_id) candidateIds.add(row.actor_id);
  });

  metaActors?.forEach((option) => {
    if (!option?.id) return;
    const label = option.label ? option.label.trim() : '';
    if (!label || label === option.id) candidateIds.add(option.id);
  });

  if (!candidateIds.size) {
    return { rows, actors: metaActors };
  }

  const ids = Array.from(candidateIds);
  const labels = new Map<string, string>();

  try {
    const { data: profileRows, error: profileError } = await sb
      .from('profiles')
      .select('id, name, full_name')
      .in('id', ids)
      .limit(ids.length);
    if (!profileError && Array.isArray(profileRows)) {
      for (const row of profileRows) {
        const id = typeof row?.id === 'string' ? row.id : null;
        if (!id) continue;
        const label = firstNonEmptyString([row?.name ?? null, row?.full_name ?? null]);
        if (label) labels.set(id, label);
      }
    }
  } catch (err) {
    console.warn('[audit-log] falha ao hidratar perfis de atores', err);
  }

  const missingAfterProfiles = ids.filter((id) => !labels.has(id));
  if (missingAfterProfiles.length) {
    try {
      const { data: userRows, error: userError } = await sb
        .from('users')
        .select('id, name, email')
        .in('id', missingAfterProfiles)
        .limit(missingAfterProfiles.length);
      if (!userError && Array.isArray(userRows)) {
        for (const row of userRows) {
          const id = typeof row?.id === 'string' ? row.id : null;
          if (!id) continue;
          const label = firstNonEmptyString([row?.name ?? null, row?.email ?? null]);
          if (label) labels.set(id, label);
        }
      }
    } catch (err) {
      console.warn('[audit-log] falha ao hidratar utilizadores', err);
    }
  }

  const hydratedRows = rows.map((row) => {
    if (!row.actor_id) return row;
    const label = labels.get(row.actor_id);
    if (!label) return row;
    const current = row.actor ? row.actor.trim() : '';
    if (current && current !== row.actor_id) return row;
    return { ...row, actor: label };
  });

  const hydratedMeta = metaActors?.map((option) => {
    if (!option?.id) return option;
    const label = labels.get(option.id);
    if (!label) return option;
    const current = option.label ? option.label.trim() : '';
    if (current && current !== option.id) return option;
    return { ...option, label };
  });

  return { rows: hydratedRows, actors: hydratedMeta };
}

function dedupe<T>(values: (T | null | undefined)[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const value of values) {
    if (value == null) continue;
    const key = typeof value === 'string' ? value : JSON.stringify(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function toCsv(rows: AuditRow[]): string {
  const header = [
    'id',
    'created_at',
    'kind',
    'category',
    'action',
    'target_type',
    'target_id',
    'target',
    'actor_id',
    'actor',
    'note',
    'ip',
    'user_agent',
    'details',
    'meta',
    'payload',
  ];

  const escape = (value: unknown) => {
    if (value == null) return '';
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    const needsQuotes = /[",\n]/.test(str);
    return needsQuotes ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const lines = rows.map((row) =>
    header
      .map((key) => escape((row as Record<string, unknown>)[key]))
      .join(',')
  );

  return [header.join(','), ...lines].join('\n');
}

export async function GET(req: NextRequest) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ items: [] }, { status: 401 });
  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ items: [] }, { status: 403 });

  const sb = createServerClient();
  const searchParams = req.nextUrl.searchParams;
  const target = searchParams.get('target') || undefined;
  const targetType = searchParams.get('targetType') || undefined;
  const kind = searchParams.get('kind') || undefined;
  const actorId = searchParams.get('actorId') || undefined;
  const actor = searchParams.get('actor') || undefined;
  const search = searchParams.get('search') || undefined;
  const includeMeta = searchParams.get('meta') === '1';
  const format = searchParams.get('format') || undefined;

  const rawPage = Number(searchParams.get('page') || 1);
  const rawPageSize = Number(searchParams.get('pageSize') || (format === 'csv' ? 500 : 20));
  const maxPageSize = format === 'csv' ? 1000 : 50;
  const page = Math.max(1, Number.isFinite(rawPage) ? rawPage : 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, Number.isFinite(rawPageSize) ? rawPageSize : 20));
  const from = format === 'csv' ? 0 : (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let lastMissing = false;

    for (const table of AUDIT_TABLE_CANDIDATES) {
      try {
        let q = sb
          .from(table as any)
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(from, to);

        if (target) q = q.eq('target_id', target);
        if (targetType) q = q.eq('target_type', targetType);
        if (kind) q = q.eq('kind', kind);
        if (actorId) q = q.eq('actor_id', actorId);
        if (actor) q = q.ilike('actor', `%${actor}%`);
        if (search) {
          const term = `%${search}%`;
          q = q.or(
            [
              `note.ilike.${term}`,
              `action.ilike.${term}`,
              `target.ilike.${term}`,
              `actor.ilike.${term}`,
              `ip.ilike.${term}`,
              `user_agent.ilike.${term}`,
            ].join(',')
          );
        }

        const { data, count, error } = await q as unknown as { data: AuditRow[] | null; count: number | null; error: any };
        if (error) {
          if (isMissingAuditTableError(error)) {
            lastMissing = true;
            continue;
          }
          throw error;
        }

        const items = data ?? [];

        if (format === 'csv') {
          const csv = toCsv(items);
          return new NextResponse(csv, {
            headers: {
              'content-type': 'text/csv; charset=utf-8',
              'content-disposition': `attachment; filename="audit-log-${new Date().toISOString()}.csv"`,
            },
          });
        }

        let meta: MetaResponse | undefined;
        if (includeMeta) {
          const [kindsRes, targetsRes, actorsRes] = await Promise.all([
            sb
              .from(table as any)
              .select('kind')
              .not('kind', 'is', null)
              .order('kind', { ascending: true })
              .limit(200),
            sb
              .from(table as any)
              .select('target_type')
              .not('target_type', 'is', null)
              .order('target_type', { ascending: true })
              .limit(200),
            sb
              .from(table as any)
              .select('actor_id, actor')
              .order('actor', { ascending: true, nullsFirst: false })
              .limit(200),
          ]);

          const kinds = dedupe((kindsRes.data ?? []).map((r: any) => r.kind as string | null));
          const targetTypes = dedupe((targetsRes.data ?? []).map((r: any) => r.target_type as string | null));

          const actors = dedupe(
            (actorsRes.data ?? []).map((r: any) => ({
              id: (r.actor_id as string | null) ?? null,
              label: (r.actor as string | null) ?? (r.actor_id as string | null) ?? null,
            }))
          );

          meta = { kinds, targetTypes, actors };
        }

        const hydrated = await hydrateActors(sb, items, meta?.actors);

        return NextResponse.json({
          items: hydrated.rows,
          count: count ?? items.length,
          page,
          pageSize,
          meta: meta ? { ...meta, actors: hydrated.actors ?? meta.actors } : undefined,
          missingTable: false,
        });
      } catch (err) {
        if (isMissingAuditTableError(err)) {
          lastMissing = true;
          continue;
        }
        console.error('[audit-log] failed to fetch rows', err);
        return NextResponse.json({ items: [], count: 0, page, pageSize, missingTable: false }, { status: 500 });
      }
    }

    if (lastMissing) {
      return NextResponse.json({
        items: [],
        count: 0,
        page,
        pageSize,
        meta: includeMeta ? { kinds: [], targetTypes: [], actors: [] } : undefined,
        missingTable: true,
      });
    }

    return NextResponse.json({ items: [], count: 0, page, pageSize, missingTable: false });
  } catch (err) {
    console.error('[audit-log] unexpected error', err);
    return NextResponse.json({ items: [], count: 0, page, pageSize, missingTable: false }, { status: 500 });
  }
}
