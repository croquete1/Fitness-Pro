// GET: devolve o meu perfil
// PATCH: atualiza nome/email/username (e o que permitires)
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function GET() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('profiles')
    .select('id,name,avatar_url,username') // ajusta aos campos que tens
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data ?? null });
}

export async function PATCH(req: Request) {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const allowed = (({ name, email, username }) => ({ name, email, username }))(body);

  const sb = createServerClient();

  // email pode viver em "users", nome/username em "profiles" — ajusta se necessário
  if (typeof allowed.email === 'string') {
    const { error: e1 } = await sb.from('users').update({ email: allowed.email }).eq('id', session.user.id);
    if (e1) return NextResponse.json({ error: e1.message }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof allowed.name === 'string') patch.name = allowed.name;
  if (typeof allowed.username === 'string') patch.username = allowed.username;

  if (Object.keys(patch).length) {
    const { error: e2 } = await sb.from('profiles').update(patch).eq('id', session.user.id);
    if (e2) return NextResponse.json({ error: e2.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
