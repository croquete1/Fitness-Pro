import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const sb = createServerClient();

  const upd: any = {};
  ['name','email','role','status','approved','active'].forEach(k => {
    if (k in body) upd[k] = body[k];
  });

  const { data, error } = await sb.from('users').update(upd).eq('id', params.id).select('*').maybeSingle();
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { error } = await sb.from('users').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
