import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const id = params.id;
  const patch: any = { status: 'SUSPENDED' };

  // profiles → fallback users
  let { error } = await sb.from('profiles').update(patch).eq('id', id);
  if (error) {
    const r2 = await sb.from('users').update(patch).eq('id', id);
    if (r2.error) return NextResponse.json({ error: r2.error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
