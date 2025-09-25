import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Auth' }, { status: 401 });

  const body = await req.json().catch(()=>({}));
  const role = String(body.role || 'CLIENT');

  // Aprovar = role escolhido + ACTIVE
  const { error } = await sb.from('profiles').update({ role, status: 'ACTIVE' }).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
