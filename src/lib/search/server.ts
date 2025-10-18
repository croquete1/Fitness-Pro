import type { SupabaseClient } from '@supabase/supabase-js';
import type { SearchCollectionInput, SearchResultRecord, SearchResultType } from '@/lib/search/types';

export const SEARCH_LIMIT = 24;
export const SUPPORTED_SEARCH_TYPES: SearchResultType[] = ['users', 'plans', 'exercises', 'sessions'];

export function parseSearchTypes(value: string | null): SearchResultType[] {
  if (!value) return SUPPORTED_SEARCH_TYPES;
  const candidates = value.split(',').map((token) => token.trim().toLowerCase());
  const filtered = candidates.filter((token): token is SearchResultType =>
    SUPPORTED_SEARCH_TYPES.includes(token as SearchResultType),
  );
  return filtered.length ? Array.from(new Set(filtered)) : SUPPORTED_SEARCH_TYPES;
}

export function parseSearchOffset(value: string | null): number {
  const parsed = Number(value ?? '0');
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function safeDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function mapUserRow(row: any): SearchResultRecord {
  const id = String(row.id ?? crypto.randomUUID());
  const role = row.role?.toString().toUpperCase?.() ?? null;
  const label =
    role === 'ADMIN'
      ? 'Administrador'
      : role === 'TRAINER'
      ? 'Treinador'
      : role === 'CLIENT'
      ? 'Cliente'
      : null;
  const tone = role === 'ADMIN' ? 'primary' : role === 'TRAINER' ? 'positive' : 'neutral';
  const name = row.name?.trim() || row.email?.trim() || `Utilizador ${id}`;
  const email = row.email?.trim() ?? null;
  return {
    id,
    type: 'users',
    title: name,
    subtitle: [email, role].filter(Boolean).join(' • ') || null,
    href: `/dashboard/admin/users/${id}`,
    keywords: [name, email ?? '', role ?? '', id],
    createdAt: safeDate(row.created_at) ?? null,
    updatedAt:
      safeDate(row.updated_at) ??
      safeDate(row.last_login_at) ??
      safeDate(row.last_seen_at) ??
      safeDate(row.created_at) ??
      null,
    badge: label ? { label, tone } : undefined,
    meta: row.status ?? null,
  } satisfies SearchResultRecord;
}

function mapPlanRow(row: any): SearchResultRecord {
  const id = String(row.id ?? crypto.randomUUID());
  const status = row.status?.toString().toUpperCase?.() ?? null;
  const tone = status === 'ACTIVE' ? 'positive' : status === 'ARCHIVED' ? 'neutral' : 'warning';
  return {
    id,
    type: 'plans',
    title: row.title?.trim() || `Plano ${id}`,
    subtitle: status ? `Estado ${status}` : null,
    href: `/dashboard/admin/plans/${id}`,
    keywords: [row.title ?? '', id, status ?? ''],
    createdAt: safeDate(row.created_at) ?? null,
    updatedAt: safeDate(row.updated_at) ?? safeDate(row.published_at) ?? safeDate(row.created_at) ?? null,
    badge: status ? { label: status, tone } : undefined,
    meta: row.updated_at ? `Actualizado ${new Date(row.updated_at).toLocaleDateString('pt-PT')}` : null,
  } satisfies SearchResultRecord;
}

function mapExerciseRow(row: any): SearchResultRecord {
  const id = String(row.id ?? crypto.randomUUID());
  const muscle = row.muscle_group?.toString() ?? null;
  return {
    id,
    type: 'exercises',
    title: row.name?.trim() || `Exercício ${id}`,
    subtitle: [muscle, row.equipment ?? null].filter(Boolean).join(' • ') || null,
    href: `/dashboard/admin/exercises/${id}`,
    keywords: [row.name ?? '', muscle ?? '', row.equipment ?? '', id],
    createdAt: safeDate(row.created_at) ?? null,
    updatedAt: safeDate(row.updated_at) ?? safeDate(row.created_at) ?? null,
    badge: muscle ? { label: muscle, tone: 'neutral' } : undefined,
    meta: row.updated_at
      ? `Actualizado ${new Date(row.updated_at).toLocaleDateString('pt-PT')}`
      : null,
  } satisfies SearchResultRecord;
}

function mapSessionRow(row: any): SearchResultRecord {
  const id = String(row.id ?? crypto.randomUUID());
  const title = row.title?.trim() || row.label?.trim() || 'Sessão agendada';
  const kind = row.kind?.toString()?.toLowerCase() ?? null;
  const location = row.location?.toString()?.trim() ?? null;
  const start = safeDate(row.start_at) ?? safeDate(row.start_time) ?? null;
  return {
    id,
    type: 'sessions',
    title,
    subtitle: [
      start
        ? new Date(start).toLocaleString('pt-PT', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        : null,
      location,
    ]
      .filter(Boolean)
      .join(' • ') || null,
    href: `/dashboard/admin/sessions/${id}`,
    keywords: [title, row.label ?? '', kind ?? '', location ?? '', id],
    createdAt: start,
    updatedAt: safeDate(row.updated_at) ?? start,
    badge: kind ? { label: kind, tone: kind === 'pt' ? 'positive' : 'neutral' } : undefined,
    meta: row.status ?? null,
  } satisfies SearchResultRecord;
}

async function fetchUsers(
  sb: SupabaseClient,
  term: string,
  offset: number,
): Promise<SearchCollectionInput> {
  const end = offset + SEARCH_LIMIT - 1;
  let query = sb
    .from('users')
    .select('id,name,email,role,status,created_at,updated_at,last_login_at,last_seen_at', { count: 'exact' })
    .order(term ? 'created_at' : 'created_at', { ascending: false });
  if (term) {
    const or = [`name.ilike.%${term}%`, `email.ilike.%${term}%`, `username.ilike.%${term}%`, `id.ilike.%${term}%`].join(',');
    query = query.or(or);
  }
  const { data, count, error } = await query.range(0, Math.max(end, SEARCH_LIMIT - 1));
  if (error) throw error;
  const rows = (data ?? []).map(mapUserRow);
  return {
    type: 'users',
    label: null,
    total: count ?? rows.length,
    offset: 0,
    limit: SEARCH_LIMIT,
    rows,
  } satisfies SearchCollectionInput;
}

async function fetchPlans(
  sb: SupabaseClient,
  term: string,
  offset: number,
): Promise<SearchCollectionInput> {
  const end = offset + SEARCH_LIMIT - 1;
  let query = sb
    .from('training_plans')
    .select('id,title,status,updated_at,created_at', { count: 'exact' })
    .order('updated_at', { ascending: false, nullsFirst: false });
  if (term) {
    query = query.ilike('title', `%${term}%`);
  }
  const { data, count, error } = await query.range(0, Math.max(end, SEARCH_LIMIT - 1));
  if (error) throw error;
  const rows = (data ?? []).map(mapPlanRow);
  return {
    type: 'plans',
    label: null,
    total: count ?? rows.length,
    offset: 0,
    limit: SEARCH_LIMIT,
    rows,
  } satisfies SearchCollectionInput;
}

async function fetchExercises(
  sb: SupabaseClient,
  term: string,
  offset: number,
): Promise<SearchCollectionInput> {
  const end = offset + SEARCH_LIMIT - 1;
  let query = sb
    .from('exercises')
    .select('id,name,muscle_group,equipment,updated_at,created_at', { count: 'exact' })
    .order('updated_at', { ascending: false, nullsFirst: false });
  if (term) {
    const or = [`name.ilike.%${term}%`, `muscle_group.ilike.%${term}%`, `equipment.ilike.%${term}%`].join(',');
    query = query.or(or);
  }
  const { data, count, error } = await query.range(0, Math.max(end, SEARCH_LIMIT - 1));
  if (error) throw error;
  const rows = (data ?? []).map(mapExerciseRow);
  return {
    type: 'exercises',
    label: null,
    total: count ?? rows.length,
    offset: 0,
    limit: SEARCH_LIMIT,
    rows,
  } satisfies SearchCollectionInput;
}

async function fetchSessions(
  sb: SupabaseClient,
  term: string,
  offset: number,
): Promise<SearchCollectionInput> {
  const end = offset + SEARCH_LIMIT - 1;
  let query = sb
    .from('sessions')
    .select('id,title,label,kind,status,start_at,start_time,location,updated_at', { count: 'exact' })
    .order('start_at', { ascending: false, nullsFirst: false });
  if (term) {
    const or = [`title.ilike.%${term}%`, `label.ilike.%${term}%`, `kind.ilike.%${term}%`, `location.ilike.%${term}%`].join(',');
    query = query.or(or);
  }
  const { data, count, error } = await query.range(0, Math.max(end, SEARCH_LIMIT - 1));
  if (error) throw error;
  const rows = (data ?? []).map(mapSessionRow);
  return {
    type: 'sessions',
    label: null,
    total: count ?? rows.length,
    offset: 0,
    limit: SEARCH_LIMIT,
    rows,
  } satisfies SearchCollectionInput;
}

export async function fetchSearchCollections(
  sb: SupabaseClient,
  options: {
    query: string;
    types: SearchResultType[];
    offsets?: Partial<Record<SearchResultType, number>>;
  },
): Promise<SearchCollectionInput[]> {
  const term = options.query.trim();
  const offsets = options.offsets ?? {};
  const tasks: Array<Promise<SearchCollectionInput>> = [];
  if (options.types.includes('users')) tasks.push(fetchUsers(sb, term, offsets.users ?? 0));
  if (options.types.includes('plans')) tasks.push(fetchPlans(sb, term, offsets.plans ?? 0));
  if (options.types.includes('exercises')) tasks.push(fetchExercises(sb, term, offsets.exercises ?? 0));
  if (options.types.includes('sessions')) tasks.push(fetchSessions(sb, term, offsets.sessions ?? 0));
  return Promise.all(tasks);
}
