import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data, error } = await sb.from('exercises').select('*').eq('id', params.id).single();
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ item: data });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const b = await req.json().catch(()=>({}));
  const upd: any = {};
  if ('name' in b) upd.name = String(b.name || '').trim();
  if ('muscle_group' in b) upd.muscle_group = b.muscle_group ? String(b.muscle_group) : null;
  if ('equipment' in b) upd.equipment = b.equipment ? String(b.equipment) : null;
  if ('difficulty' in b) upd.difficulty = b.difficulty ? String(b.difficulty) : null;
  if ('is_active' in b) {
    const raw = b.is_active;
    upd.is_active = raw === true || raw === 'true' || raw === 'on' ? true : false;
  }
  const { error } = await sb.from('exercises').update(upd).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  // soft-delete: inativar
  const { error } = await sb.from('exercises').update({ is_active: false }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
