import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

const LIMIT = 10;

// Util: normaliza offsets
function num(v: string | null, d = 0) {
  const n = Number(v ?? '');
  return Number.isFinite(n) && n >= 0 ? n : d;
}

type GroupResult = { items: Array<{ id: string; label: string; sub?: string | null; href: string }>; nextOffset: number | null };

async function fetchUsers(sb: any, q: string, offset = 0): Promise<GroupResult> {
  // 1) tenta RPC com fp_norm_imm; 2) fallback p/ ILIKE
  try {
    const { data, error, count } = await sb.rpc('fp_search_users', { _term: q, _offset: offset, _limit: LIMIT }, { count: 'estimated' });
    if (!error && Array.isArray(data)) {
      const items = data.map((u: any) => ({
        id: String(u.id),
        label: String(u.name ?? u.email ?? 'Utilizador'),
        sub: [u.email, u.role].filter(Boolean).join(' • ') || null,
        href: `/dashboard/admin/users/${u.id}`,
      }));
      const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
      return { items, nextOffset };
    }
  } catch {}
  // Fallback (ILIKE)
  const or = [`name.ilike.%${q}%`, `email.ilike.%${q}%`, `username.ilike.%${q}%`].join(',');
  const { data, error, count } = await sb
    .from('users')
    .select('id, name, email, role', { count: 'estimated' })
    .or(or)
    .order('created_at', { ascending: false })
    .range(offset, offset + LIMIT - 1);
  if (error) return { items: [], nextOffset: null };
  const items = (data ?? []).map((u: any) => ({
    id: String(u.id),
    label: String(u.name ?? u.email ?? 'Utilizador'),
    sub: [u.email, u.role].filter(Boolean).join(' • ') || null,
    href: `/dashboard/admin/users/${u.id}`,
  }));
  const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
  return { items, nextOffset };
}

async function fetchPlans(sb: any, q: string, offset = 0): Promise<GroupResult> {
  try {
    const { data, error, count } = await sb.rpc('fp_search_plans', { _term: q, _offset: offset, _limit: LIMIT }, { count: 'estimated' });
    if (!error && Array.isArray(data)) {
      const items = data.map((p: any) => ({
        id: String(p.id),
        label: p.title ?? 'Plano',
        sub: p.updated_at ? new Date(p.updated_at).toLocaleString() : null,
        href: `/dashboard/admin/plans/${p.id}`,
      }));
      const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
      return { items, nextOffset };
    }
  } catch {}
  const { data, error, count } = await sb
    .from('training_plans')
    .select('id, title, updated_at', { count: 'estimated' })
    .ilike('title', `%${q}%`)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + LIMIT - 1);
  if (error) return { items: [], nextOffset: null };
  const items = (data ?? []).map((p: any) => ({
    id: String(p.id),
    label: p.title ?? 'Plano',
    sub: p.updated_at ? new Date(p.updated_at).toLocaleString() : null,
    href: `/dashboard/admin/plans/${p.id}`,
  }));
  const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
  return { items, nextOffset };
}

async function fetchExercises(sb: any, q: string, offset = 0): Promise<GroupResult> {
  try {
    const { data, error, count } = await sb.rpc('fp_search_exercises', { _term: q, _offset: offset, _limit: LIMIT }, { count: 'estimated' });
    if (!error && Array.isArray(data)) {
      const items = data.map((e: any) => ({
        id: String(e.id),
        label: e.name ?? 'Exercício',
        sub: [e.muscle, e.equipment].filter(Boolean).join(' • ') || null,
        href: `/dashboard/admin/exercises/${e.id}`,
      }));
      const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
      return { items, nextOffset };
    }
  } catch {}
  const or = [`name.ilike.%${q}%`, `muscle.ilike.%${q}%`, `equipment.ilike.%${q}%`].join(',');
  const { data, error, count } = await sb
    .from('exercises')
    .select('id, name, muscle, equipment, created_at', { count: 'estimated' })
    .or(or)
    .order('created_at', { ascending: false })
    .range(offset, offset + LIMIT - 1);
  if (error) return { items: [], nextOffset: null };
  const items = (data ?? []).map((e: any) => ({
    id: String(e.id),
    label: e.name ?? 'Exercício',
    sub: [e.muscle, e.equipment].filter(Boolean).join(' • ') || null,
    href: `/dashboard/admin/exercises/${e.id}`,
  }));
  const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
  return { items, nextOffset };
}

async function fetchSessions(sb: any, q: string, offset = 0): Promise<GroupResult> {
  try {
    const { data, error, count } = await sb.rpc('fp_search_sessions', { _term: q, _offset: offset, _limit: LIMIT }, { count: 'estimated' });
    if (!error && Array.isArray(data)) {
      const items = data.map((s: any) => ({
        id: String(s.id),
        label: s.title ?? s.label ?? 'Sessão',
        sub: s.start_at ? new Date(s.start_at).toLocaleString() : null,
        href: `/dashboard/admin/sessions/${s.id}`,
      }));
      const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
      return { items, nextOffset };
    }
  } catch {}
  // Fallback prudente (evita colunas problemáticas)
  const or = [`label.ilike.%${q}%`, `kind.ilike.%${q}%`].join(',');
  const { data, error, count } = await sb
    .from('sessions')
    .select('id, label, start_at, kind', { count: 'estimated' })
    .or(or)
    .order('start_at', { ascending: false })
    .range(offset, offset + LIMIT - 1);
  if (error) return { items: [], nextOffset: null };
  const items = (data ?? []).map((s: any) => ({
    id: String(s.id),
    label: s.label ?? 'Sessão',
    sub: s.start_at ? new Date(s.start_at).toLocaleString() : null,
    href: `/dashboard/admin/sessions/${s.id}`,
  }));
  const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
  return { items, nextOffset };
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  if (!q) {
    return NextResponse.json({
      q,
      users: { items: [], nextOffset: null },
      plans: { items: [], nextOffset: null },
      exercises: { items: [], nextOffset: null },
      sessions: { items: [], nextOffset: null },
    });
  }

  const usersOffset = num(url.searchParams.get('usersOffset'));
  const plansOffset = num(url.searchParams.get('plansOffset'));
  const exercisesOffset = num(url.searchParams.get('exercisesOffset'));
  const sessionsOffset = num(url.searchParams.get('sessionsOffset'));

  const sb = createServerClient();

  // (Opcional) poderias filtrar por role/sessão aqui
  const [users, plans, exercises, sessions] = await Promise.all([
    fetchUsers(sb, q, usersOffset),
    fetchPlans(sb, q, plansOffset),
    fetchExercises(sb, q, exercisesOffset),
    fetchSessions(sb, q, sessionsOffset),
  ]);

  return NextResponse.json({ q, users, plans, exercises, sessions });
}
