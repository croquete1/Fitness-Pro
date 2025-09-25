import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ items: [], total: 0 }, { status: 401 });

  const url = new URL(req.url);
  const page = Number(url.searchParams.get('page') || '1');
  const perPage = Number(url.searchParams.get('perPage') || url.searchParams.get('limit') || '20');
  const q = (url.searchParams.get('q') || '').trim();

  let query = sb.from('exercises').select('id, name, muscle_group, equipment, difficulty, is_active, created_at', { count: 'exact' });
  if (q) query = query.ilike('name', `%${q}%`);
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await query.range(from, to).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ items: data ?? [], total: count ?? 0 });
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(()=>({}));
  const insert: any = {
    name: String(body.name || '').trim(),
    muscle_group: body.muscle_group ? String(body.muscle_group) : null,
    equipment: body.equipment ? String(body.equipment) : null,
    difficulty: body.difficulty ? String(body.difficulty) : null,
    created_by: user.id,
    is_active: true,
  };
  if (!insert.name) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });

  const { error } = await sb.from('exercises').insert(insert);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
