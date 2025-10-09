// PATCH atualizar / DELETE remover
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      { ok: false, error: 'SUPABASE_UNCONFIGURED' },
      { status: 503 }
    );
  }
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status:401 });
  const role = toAppRole((auth.user as any)?.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status:403 });

  let body:any; try { body = await req.json(); } catch { return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 }); }
  const patch:any = {};
  if ('text' in body) patch.text = String(body.text||'').trim();
  if ('author' in body) patch.author = body.author ? String(body.author) : null;
  if ('active' in body) patch.active = !!body.active;

  const { error } = await sb.from('motivational_quotes').update(patch).eq('id', params.id);
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });
  return NextResponse.json({ ok:true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      { ok: false, error: 'SUPABASE_UNCONFIGURED' },
      { status: 503 }
    );
  }
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status:401 });
  const role = toAppRole((auth.user as any)?.role) ?? 'CLIENT';
  if (role !== 'ADMIN') return NextResponse.json({ ok:false, error:'FORBIDDEN' }, { status:403 });

  const { error } = await sb.from('motivational_quotes').delete().eq('id', params.id);
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });
  return NextResponse.json({ ok:true });
}
