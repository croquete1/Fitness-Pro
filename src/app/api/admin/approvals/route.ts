import { NextResponse } from 'next/server';

import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { getSampleApprovals } from '@/lib/fallback/users';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';
import { tryCreateServerClient } from '@/lib/supabaseServer';

const MAX_FALLBACK_LIMIT = 1000;
const FALLBACK_PAD = 2;
const DEFAULT_PAGE_SIZE = 20;

const STATUS_FIELDS = ['status', 'state', 'decision', 'outcome'] as const;

type FallbackReason = 'search' | 'status' | 'mixed';

function computeFallbackLimit(page: number, pageSize: number) {
  return Math.min(MAX_FALLBACK_LIMIT, Math.max(pageSize * (page + FALLBACK_PAD), pageSize));
}

function escapeSearchValue(value: string): string {
  return value
    .replace(/[%_]/g, '\\$&')
    .replace(/[(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normaliseText(value: unknown): string {
  if (value == null) return '';
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9@._-]+/g, ' ')
    .toLowerCase()
    .trim();
}

function createTokens(search: string): string[] {
  return normaliseText(search)
    .split(/\s+/)
    .filter(Boolean);
}

function normaliseStatus(value: unknown): string {
  if (!value) return 'pending';
  const raw = String(value).toLowerCase();
  if (
    raw.includes('reject') ||
    raw.includes('deny') ||
    raw.includes('suspend') ||
    raw.includes('rejeit') ||
    raw.includes('recus') ||
    raw.includes('negad')
  ) {
    return 'rejected';
  }
  if (
    raw.includes('approve') ||
    raw === 'ok' ||
    raw === 'accepted' ||
    raw.includes('aprov') ||
    raw.includes('aceit') ||
    raw.includes('confirm')
  ) {
    return 'approved';
  }
  if (raw.includes('pend') || raw.includes('aguard') || raw.includes('analis')) {
    return 'pending';
  }
  return raw;
}

function buildStatusFilterValues(value: string): string[] {
  const canonical = normaliseStatus(value);
  const variants = new Set<string>();

  function register(raw: string) {
    if (!raw) return;
    const trimmed = raw.trim();
    if (!trimmed) return;
    variants.add(trimmed);
    variants.add(trimmed.toLowerCase());
    variants.add(trimmed.toUpperCase());
    variants.add(trimmed.replace(/^./, (char) => char.toUpperCase()));
  }

  register(value);
  register(canonical);

  const synonyms: Record<string, string[]> = {
    pending: ['pending', 'pendente', 'pendentes', 'aguardar', 'aguardando', 'em análise'],
    approved: ['approved', 'aprovado', 'aprovada', 'aceite', 'aceito', 'confirmado'],
    rejected: ['rejected', 'rejeitado', 'rejeitada', 'recusado', 'recusada', 'negado', 'negada'],
  };

  if (synonyms[canonical]) {
    for (const synonym of synonyms[canonical]) {
      register(synonym);
    }
  }

  return Array.from(variants.values());
}

const SEARCHABLE_FIELDS = [
  'name',
  'full_name',
  'profile_name',
  'email',
  'user_email',
  'uid',
  'user_id',
  'member_id',
  'trainer_id',
  'metadata',
];

function extractStatus(row: Record<string, any>): string {
  for (const field of STATUS_FIELDS) {
    if (row[field] != null) {
      return normaliseStatus(row[field]);
    }
  }
  return 'pending';
}

function buildSearchHaystack(row: Record<string, any>): string {
  const chunks: string[] = [];
  for (const field of SEARCHABLE_FIELDS) {
    if (!(field in row)) continue;
    const value = row[field];
    if (value == null) continue;
    if (typeof value === 'object') {
      chunks.push(normaliseText(JSON.stringify(value)));
    } else {
      chunks.push(normaliseText(value));
    }
  }
  return chunks.join(' ');
}

function filterRows(
  rows: Record<string, any>[],
  tokens: string[],
  status: string,
): { filtered: Record<string, any>[]; sampleSize: number } {
  const sampleSize = rows.length;
  if (!tokens.length && !status) {
    return { filtered: rows, sampleSize };
  }
  const filtered = rows.filter((row) => {
    if (status && extractStatus(row) !== status) {
      return false;
    }
    if (!tokens.length) return true;
    const haystack = buildSearchHaystack(row);
    return tokens.every((token) => haystack.includes(token));
  });
  return { filtered, sampleSize };
}

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const url = new URL(req.url);
  const rawPageParam = Number.parseInt(url.searchParams.get('page') ?? '', 10);
  const page = Number.isFinite(rawPageParam) && rawPageParam >= 0 ? rawPageParam : 0;
  const rawPageSizeParam = Number.parseInt(url.searchParams.get('pageSize') ?? '', 10);
  const parsedPageSize = Number.isFinite(rawPageSizeParam) ? rawPageSizeParam : DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(Math.max(parsedPageSize, 1), 100);
  const q = (url.searchParams.get('q') || '').trim();
  const statusParam = (url.searchParams.get('status') || '').trim();
  const status = statusParam ? normaliseStatus(statusParam) : '';

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      getSampleApprovals({ page, pageSize, search: q, status }),
    );
  }

  async function base(
    table: string,
    options: { skipSearch?: boolean; skipStatus?: boolean; limit?: number } = {},
  ) {
    let sel = sb.from(table).select('*', { count: 'exact' });
    if (!options.skipSearch && q) {
      const searchValue = escapeSearchValue(q);
      sel = sel.or(
        [
          `name.ilike.%${searchValue}%`,
          `email.ilike.%${searchValue}%`,
          `full_name.ilike.%${searchValue}%`,
          `profile_name.ilike.%${searchValue}%`,
          `user_email.ilike.%${searchValue}%`,
        ].join(','),
      );
    }
    if (!options.skipStatus && status) {
      const candidates = buildStatusFilterValues(status);
      if (candidates.length) {
        sel = sel.in('status', candidates);
      }
    }
    sel = sel
      .order('requested_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false, nullsFirst: false })
      .order('id', { ascending: true });

    if (options.limit != null) {
      return sel.limit(options.limit);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;
    return sel.range(from, to);
  }

  try {
    const headers = { 'cache-control': 'no-store' as const };
    let tableFound = false;
    let emptyResult: { rows: any[]; count: number } | null = null;

    const sources = ['admin_approval_requests', 'approvals', 'pending_approvals'];

    for (const table of sources) {
      const r = await base(table);
      if (r.error) {
        const code = r.error.code ?? '';
        if (code === 'PGRST205' || code === 'PGRST301') continue;

        if ((code === '42703' || code === 'PGRST204') && (q || status)) {
          const fallbackLimit = computeFallbackLimit(page, pageSize);
          const fallback = await base(table, {
            skipSearch: true,
            skipStatus: true,
            limit: fallbackLimit,
          });
          if (!fallback.error) {
            tableFound = true;
            const raw = fallback.data ?? [];
            const tokens = createTokens(q);
            const { filtered, sampleSize } = filterRows(raw, tokens, status);
            const start = page * pageSize;
            const slice = filtered.slice(start, start + pageSize);
            const reason: FallbackReason = q && status ? 'mixed' : q ? 'search' : 'status';
            return NextResponse.json(
              {
                rows: slice,
                count: filtered.length,
                _searchFallback: true,
                fallbackReason: reason,
                searchSampleSize: sampleSize,
              },
              { headers },
            );
          }
        }

        if (code === '42P01') continue;
        throw r.error;
      }

      tableFound = true;
      const rows = r.data ?? [];
      const count = typeof r.count === 'number' ? r.count : rows.length;

      if (status && rows.length === 0) {
        const fallbackLimit = computeFallbackLimit(page, pageSize);
        const fallback = await base(table, { skipStatus: true, limit: fallbackLimit });
        if (!fallback.error) {
          const raw = fallback.data ?? [];
          const tokens = createTokens(q);
          const { filtered, sampleSize } = filterRows(raw, tokens, status);
          const start = page * pageSize;
          const slice = filtered.slice(start, start + pageSize);
          const reason: FallbackReason = q ? 'mixed' : 'status';
          return NextResponse.json(
            {
              rows: slice,
              count: filtered.length,
              _searchFallback: true,
              fallbackReason: reason,
              searchSampleSize: sampleSize,
            },
            { headers },
          );
        }
      }

      if (rows.length > 0 || count > 0) {
        return NextResponse.json({ rows, count }, { headers });
      }

      emptyResult = { rows: [], count };
    }

    if (tableFound) {
      return NextResponse.json(emptyResult ?? { rows: [], count: 0 }, { headers });
    }

    // Nenhuma tabela encontrada → devolve fallback para manter a UI funcional
    return supabaseFallbackJson(
      getSampleApprovals({ page, pageSize, search: q, status }),
      { headers },
    );
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/approvals] list failed', { code });
    return NextResponse.json(
      { rows: [], count: 0, error: 'UNAVAILABLE' },
      { status: 200, headers: { 'cache-control': 'no-store' } },
    );
  }
}

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) return supabaseUnavailableResponse();
  const b = await req.json().catch(() => ({}));

  const payload: Record<string, any> = {
    user_id: b.user_id ?? b.uid ?? null,
    trainer_id: b.trainer_id ?? b.coach_id ?? null,
    name: b.name ?? b.full_name ?? null,
    email: b.email ?? b.user_email ?? null,
    status: (b.status ?? 'pending') as string,
  };

  if (b.requested_at) {
    const iso = new Date(b.requested_at);
    payload.requested_at = Number.isNaN(iso.getTime()) ? b.requested_at : iso.toISOString();
  }
  if (b.metadata !== undefined) {
    let metadata = b.metadata ?? {};
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch {
        metadata = {};
      }
    }
    payload.metadata = metadata && typeof metadata === 'object' ? metadata : {};
  }

  if (payload.user_id) {
    payload.user_id = String(payload.user_id).trim();
  }
  if (payload.name) {
    const trimmed = String(payload.name).trim();
    payload.name = trimmed.length ? trimmed : null;
  }
  if (payload.email) {
    const trimmed = String(payload.email).trim();
    payload.email = trimmed.length ? trimmed : null;
  }
  if (payload.trainer_id) {
    const trainerId = String(payload.trainer_id).trim();
    payload.trainer_id = trainerId.length ? trainerId : null;
  }

  if (!payload.user_id) {
    return NextResponse.json({ error: 'USER_REQUIRED' }, { status: 400 });
  }

  payload.status = String(payload.status ?? 'pending').toLowerCase();
  if (!['pending', 'approved', 'rejected'].includes(payload.status)) {
    payload.status = 'pending';
  }
  const ins = async (table: string) => sb.from(table).insert(payload).select('*').single();
  let r = await ins('approvals'); if (r.error?.code === '42P01') r = await ins('pending_approvals');
  if (r.error) {
    const code = typeof r.error === 'object' && r.error && 'code' in r.error ? (r.error as any).code : 'unknown';
    console.warn('[admin/approvals] insert failed', { code });
    return NextResponse.json({ error: 'REQUEST_FAILED' }, { status: 400 });
  }
  return NextResponse.json({ ok: true, row: r.data });
}
