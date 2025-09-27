// Pesquisa global, com filtros por role e grupos.
// Groups suportados: users, sessions, plans, exercises
// Cursor simples (offset) para "ver mais" por grupo.
// Usa as tuas tabelas reais: public.users, profiles, sessions, plans, exercises.
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

type Group = 'users' | 'sessions' | 'plans' | 'exercises';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  const group = (url.searchParams.get('group') || '') as Group | '';
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const limit = Math.min(25, Math.max(5, Number(url.searchParams.get('limit') || '10')));
  const from = (page - 1) * limit;

  if (!q) return NextResponse.json({ items: [], page, nextPage: null });

  const sb = createServerClient();

  // descobre role e uid
  let role: 'ADMIN' | 'TRAINER' | 'CLIENT' = 'CLIENT';
  let uid: string | null = null;
  try {
    const { data: { user } } = await sb.auth.getUser();
    uid = user?.id || null;
    // tenta ler do profiles (se existir)
    if (uid) {
      const { data: prof } = await sb.from('profiles').select('role').eq('id', uid).maybeSingle();
      role = String((prof as any)?.role || 'CLIENT').toUpperCase() as any;
    }
  } catch {}

  // helper: empacota resultados
  const pack = (grp: Group, r: any[]) =>
    (r || []).map((x) => ({
      id: String(x.id ?? x.uuid ?? crypto.randomUUID()),
      group: grp,
      title: x.title ?? x.name ?? x.full_name ?? x.email ?? '—',
      subtitle: x.email ?? x.description ?? x.status ?? null,
      href:
        grp === 'users'      ? `/dashboard/admin/users?focus=${x.id}` :
        grp === 'sessions'   ? `/dashboard/sessions/${x.id}` :
        grp === 'plans'      ? `/dashboard/plans/${x.id}` :
        grp === 'exercises'  ? `/dashboard/admin/exercises?focus=${x.id}` : '#',
    }));

  // split em palavras (procura “todas as palavras” em OR de colunas → simples e rápido)
  const words = q.split(/\s+/).filter(Boolean).slice(0, 5);
  const like = (col: string) => words.map(w => `${col}.ilike.%${w}%`).join(',');

  const all: any[] = [];

  // USERS (apenas Admin por omissão; PT pode ver os seus clientes, se tiveres essa relação)
  if (!group || group === 'users') {
    if (role === 'ADMIN') {
      const { data } = await sb
        .from('users')
        .select('id, email, role, created_at, profiles:profiles!users_id_fkey(full_name)')
        .or([like('email'), like('profiles.full_name')].join(','))
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);
      const rows = (data || []).map(d => ({ ...d, name: (d as any).profiles?.full_name || null }));
      all.push(...pack('users', rows));
    } else if (role === 'TRAINER' && uid) {
      // se tiveres tabela de relação trainer_clients, filtra por aí. Exemplo genérico:
      const { data } = await sb
        .from('users')
        .select('id, email, created_at, profiles:profiles!users_id_fkey(full_name)')
        .or([like('email'), like('profiles.full_name')].join(','))
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);
      all.push(...pack('users', data || []));
    }
  }

  // SESSIONS
  if (!group || group === 'sessions') {
    const sel = sb
      .from('sessions')
      .select('id, title, kind, status, created_at, trainer_id, client_id')
      .or([like('title'), like('status')].join(','))
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (role === 'TRAINER' && uid) sel.eq('trainer_id', uid);
    if (role === 'CLIENT' && uid) sel.eq('client_id', uid);
    const { data } = await sel;
    all.push(...pack('sessions', data || []));
  }

  // PLANS
  if (!group || group === 'plans') {
    const sel = sb
      .from('plans')
      .select('id, title, description, status, trainer_id, client_id, created_at')
      .or([like('title'), like('description')].join(','))
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (role === 'TRAINER' && uid) sel.eq('trainer_id', uid);
    if (role === 'CLIENT' && uid) sel.eq('client_id', uid);
    const { data } = await sel;
    all.push(...pack('plans', data || []));
  }

  // EXERCISES
  if (!group || group === 'exercises') {
    const { data } = await sb
      .from('exercises')
      .select('id, name, description')
      .or([like('name'), like('description')].join(','))
      .order('id', { ascending: true })
      .range(from, from + limit - 1);
    all.push(...pack('exercises', data || []));
  }

  // paginação simplificada por grupo
  const nextPage = all.length === limit ? (page + 1) : null;
  return NextResponse.json({ items: all, page, nextPage });
}
