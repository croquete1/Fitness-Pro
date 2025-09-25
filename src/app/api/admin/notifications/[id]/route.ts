import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const b = await req.json().catch(()=>({}));
  const upd: any = {};
  if ('title' in b) upd.title = String(b.title || '').trim();
  if ('body' in b) upd.body = b.body ? String(b.body) : null;
  if ('active' in b) upd.active = !!b.active;

  try {
    const { error } = await sb.from('notifications').update(upd).eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Falha ao atualizar' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  try {
    const { error } = await sb.from('notifications').delete().eq('id', params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Falha ao apagar' }, { status: 400 });
  }
}
