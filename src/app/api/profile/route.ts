// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function PATCH(req: Request) {
  const sb = createServerClient();
  const { data: auth } = await sb.auth.getUser();
  const me = auth?.user; if (!me?.id) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status: 401 });

  let body:any; try{ body = await req.json(); } catch { return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 }); }

  // username único (case-insensitive) ignorando o próprio
  if (body?.username) {
    const uname = String(body.username).trim();
    const { count } = await sb.from('profiles')
      .select('*',{ count:'exact', head:true })
      .ilike('username', uname)
      .neq('id', me.id);
    if ((count ?? 0) > 0) {
      return NextResponse.json({ ok:false, error:'USERNAME_TAKEN' }, { status:409 });
    }
  }

  const patch: Record<string, any> = {};
  if (body?.name != null) patch.name = String(body.name);
  if (body?.avatar_url != null) patch.avatar_url = String(body.avatar_url);
  if (body?.username != null) patch.username = String(body.username);

  if (!Object.keys(patch).length) return NextResponse.json({ ok:true });

  const { error } = await sb.from('profiles').upsert({ id: me.id, ...patch }, { onConflict: 'id' });
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });

  return NextResponse.json({ ok:true });
}
