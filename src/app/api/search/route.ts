// src/app/api/search/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { createServerClient } from '@/lib/supabaseServer';

const LIMIT = 10;

type Group = { items: any[]; nextOffset: number | null };

function makeGroup(items: any[], count: number | undefined | null, offset: number): Group {
  const next = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
  return { items, nextOffset: next };
}

// ------------------------------
// FALLBACKS (funcionam em qualquer DB)
// ------------------------------
async function fallbackUsers(sb: any, q: string, offset: number): Promise<Group> {
  const or = [`name.ilike.%${q}%`, `email.ilike.%${q}%`, `username.ilike.%${q}%`].join(',');
  const { data, count } = await sb
    .from('users')
    .select('id, name, email, role', { count: 'estimated' })
    .or(or)
    .order('created_at', { ascending: false })
    .range(offset, offset + LIMIT - 1);

  const items = (data ?? []).map((u: any) => ({
    id: String(u.id),
    label: u.name ?? u.email ?? 'Utilizador',
    sub: [u.email, u.role].filter(Boolean).join(' • ') || null,
    href: `/dashboard/admin/users/${u.id}`,
  }));
  return makeGroup(items, count, offset);
}

async function fallbackPlans(sb: any, q: string, offset: number): Promise<Group> {
  const { data, count } = await sb
    .from('training_plans')
    .select('id, title, updated_at', { count: 'estimated' })
    .ilike('title', `%${q}%`)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .range(offset, offset + LIMIT - 1);

  const items = (data ?? []).map((p: any) => ({
    id: String(p.id),
    label: p.title ?? 'Plano',
    sub: p.updated_at ? new Date(p.updated_at).toLocaleString() : null,
    href: `/dashboard/admin/plans/${p.id}`,
  }));
  return makeGroup(items, count, offset);
}

async function fallbackExercises(sb: any, q: string, offset: number): Promise<Group> {
  const or = [`name.ilike.%${q}%`, `muscle.ilike.%${q}%`, `equipment.ilike.%${q}%`].join(',');
  const { data, count } = await sb
    .from('exercises')
    .select('id, name, muscle, equipment, created_at', { count: 'estimated' })
    .or(or)
    .order('created_at', { ascending: false })
    .range(offset, offset + LIMIT - 1);

  const items = (data ?? []).map((e: any) => ({
    id: String(e.id),
    label: e.name ?? 'Exercício',
    sub: [e.muscle, e.equipment].filter(Boolean).join(' • ') || null,
    href: `/dashboard/admin/exercises/${e.id}`,
  }));
  return makeGroup(items, count, offset);
}

async function fallbackSessions(sb: any, q: string, offset: number): Promise<Group> {
  const or = [`title.ilike.%${q}%`, `label.ilike.%${q}%`, `kind.ilike.%${q}%`].join(',');
  const { data, count } = await sb
    .from('sessions')
    .select('id, title, label, start_at', { count: 'estimated' })
    .or(or)
    .order('start_at', { ascending: false })
    .range(offset, offset + LIMIT - 1);

  const items = (data ?? []).map((s: any) => ({
    id: String(s.id),
    label: s.title ?? s.label ?? 'Sessão',
    sub: s.start_at ? new Date(s.start_at).toLocaleString() : null,
    href: `/dashboard/admin/sessions/${s.id}`,
  }));
  return makeGroup(items, count, offset);
}

// ------------------------------
// GET /api/search
// ------------------------------
export async function GET(req: NextRequest) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) {
    return guard.response;
  }

  const u = new URL(req.url);
  const q = (u.searchParams.get('q') ?? '').trim();
  const role = (u.searchParams.get('role') ?? 'ADMIN').toUpperCase();

  const usersOffset = Number(u.searchParams.get('usersOffset') ?? '0') || 0;
  const plansOffset = Number(u.searchParams.get('plansOffset') ?? '0') || 0;
  const exercisesOffset = Number(u.searchParams.get('exercisesOffset') ?? '0') || 0;
  const sessionsOffset = Number(u.searchParams.get('sessionsOffset') ?? '0') || 0;

  if (!q) {
    return NextResponse.json({
      q,
      users: { items: [], nextOffset: null },
      plans: { items: [], nextOffset: null },
      exercises: { items: [], nextOffset: null },
      sessions: { items: [], nextOffset: null },
    });
  }

  const sb = createServerClient();

  // 1) Tenta RPC (acentos-insensível) — se não existir/unaccent não ativo, ignora erro
  try {
    const { data, error } = await sb.rpc('fp_search_all', {
      _term: q,
      _users_offset: usersOffset,
      _users_limit: LIMIT,
      _plans_offset: plansOffset,
      _plans_limit: LIMIT,
      _exercises_offset: exercisesOffset,
      _exercises_limit: LIMIT,
      _sessions_offset: sessionsOffset,
      _sessions_limit: LIMIT,
      _role: role,
    });
    if (!error && data) {
      // o RPC já devolve { users, plans, exercises, sessions } com nextOffset
      return NextResponse.json(data);
    }
  } catch {
    // Sem RPC/unaccent: segue para fallback
  }

  // 2) Fallback ILIKE (funciona sempre)
  const [users, plans, exercises, sessions] = await Promise.all([
    fallbackUsers(sb, q, usersOffset),
    fallbackPlans(sb, q, plansOffset),
    fallbackExercises(sb, q, exercisesOffset),
    fallbackSessions(sb, q, sessionsOffset),
  ]);

  return NextResponse.json({ q, users, plans, exercises, sessions });
}
