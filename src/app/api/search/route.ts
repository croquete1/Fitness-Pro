// src/app/api/search/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

const LIMIT = 10;

type GroupResult = { items: Array<{ id: string; label: string; sub?: string | null; href: string }>; nextOffset: number | null };

async function tryRpc<T>(
  sb: any,
  fn: string,
  args: Record<string, any>,
  fallback: () => Promise<T>
): Promise<T> {
  try {
    const { data, error } = await sb.rpc(fn, args);
    if (error) throw error;
    return data as T;
  } catch {
    return await fallback();
  }
}

async function usersGroup(sb: any, q: string, offset = 0): Promise<GroupResult> {
  // RPC (se existir): fp_search_users(term text, offset int, limit int) → { id, name, email, role }
  return tryRpc<GroupResult>(
    sb,
    'fp_search_users',
    { term: q, offset, limit: LIMIT },
    async () => {
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
        label: u.name ?? u.email ?? 'Utilizador',
        sub: [u.email, u.role].filter(Boolean).join(' • ') || null,
        href: `/dashboard/admin/users/${u.id}`,
      }));
      const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
      return { items, nextOffset };
    }
  );
}

async function plansGroup(sb: any, q: string, offset = 0): Promise<GroupResult> {
  // RPC (se existir): fp_search_plans(term, offset, limit) → { id, title, updated_at }
  return tryRpc<GroupResult>(
    sb,
    'fp_search_plans',
    { term: q, offset, limit: LIMIT },
    async () => {
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
  );
}

async function exercisesGroup(sb: any, q: string, offset = 0): Promise<GroupResult> {
  // RPC (se existir): fp_search_exercises(term, offset, limit) → { id, name, muscle, equipment, created_at }
  return tryRpc<GroupResult>(
    sb,
    'fp_search_exercises',
    { term: q, offset, limit: LIMIT },
    async () => {
      // Alguns schemas não têm muscle/equipment — protegemos com fallback
      try {
        const or = [`name.ilike.%${q}%`, `muscle.ilike.%${q}%`, `equipment.ilike.%${q}%`].join(',');
        const { data, error, count } = await sb
          .from('exercises')
          .select('id, name, muscle, equipment, created_at', { count: 'estimated' })
          .or(or)
          .order('created_at', { ascending: false })
          .range(offset, offset + LIMIT - 1);
        if (error) throw error;
        const items = (data ?? []).map((e: any) => ({
          id: String(e.id),
          label: e.name ?? 'Exercício',
          sub: [e.muscle, e.equipment].filter(Boolean).join(' • ') || null,
          href: `/dashboard/admin/exercises/${e.id}`,
        }));
        const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
        return { items, nextOffset };
      } catch {
        const { data, error, count } = await sb
          .from('exercises')
          .select('id, name, created_at', { count: 'estimated' })
          .ilike('name', `%${q}%`)
          .order('created_at', { ascending: false })
          .range(offset, offset + LIMIT - 1);
        if (error) return { items: [], nextOffset: null };
        const items = (data ?? []).map((e: any) => ({
          id: String(e.id),
          label: e.name ?? 'Exercício',
          href: `/dashboard/admin/exercises/${e.id}`,
        }));
        const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
        return { items, nextOffset };
      }
    }
  );
}

async function sessionsGroup(sb: any, q: string, offset = 0): Promise<GroupResult> {
  // RPC (se existir): fp_search_sessions(term, offset, limit) → { id, title/label/name, start_at }
  return tryRpc<GroupResult>(
    sb,
    'fp_search_sessions',
    { term: q, offset, limit: LIMIT },
    async () => {
      // procura em colunas comuns (title/label/name); usamos 2 tentativas
      try {
        const or = [`title.ilike.%${q}%`, `label.ilike.%${q}%`, `name.ilike.%${q}%`].join(',');
        const { data, error, count } = await sb
          .from('sessions')
          .select('id, title, label, name, start_at', { count: 'estimated' })
          .or(or)
          .order('start_at', { ascending: false })
          .range(offset, offset + LIMIT - 1);
        if (error) throw error;
        const items = (data ?? []).map((s: any) => ({
          id: String(s.id),
          label: s.title ?? s.label ?? s.name ?? 'Sessão',
          sub: s.start_at ? new Date(s.start_at).toLocaleString() : null,
          href: `/dashboard/admin/sessions/${s.id}`,
        }));
        const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
        return { items, nextOffset };
      } catch {
        const { data, error, count } = await sb
          .from('sessions')
          .select('id, start_at', { count: 'estimated' })
          .order('start_at', { ascending: false })
          .range(offset, offset + LIMIT - 1);
        if (error) return { items: [], nextOffset: null };
        const items = (data ?? []).map((s: any) => ({
          id: String(s.id),
          label: 'Sessão',
          sub: s.start_at ? new Date(s.start_at).toLocaleString() : null,
          href: `/dashboard/admin/sessions/${s.id}`,
        }));
        const nextOffset = (count ?? items.length) > offset + LIMIT ? offset + LIMIT : null;
        return { items, nextOffset };
      }
    }
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const usersOffset = Number(url.searchParams.get('usersOffset') ?? '0') || 0;
  const plansOffset = Number(url.searchParams.get('plansOffset') ?? '0') || 0;
  const exercisesOffset = Number(url.searchParams.get('exercisesOffset') ?? '0') || 0;
  const sessionsOffset = Number(url.searchParams.get('sessionsOffset') ?? '0') || 0;

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

  const [users, plans, exercises, sessions] = await Promise.all([
    usersGroup(sb, q, usersOffset),
    plansGroup(sb, q, plansOffset),
    exercisesGroup(sb, q, exercisesOffset),
    sessionsGroup(sb, q, sessionsOffset),
  ]);

  return NextResponse.json({ q, users, plans, exercises, sessions });
}
