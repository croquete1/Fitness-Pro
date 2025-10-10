// PATCH atualizar / DELETE remover
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      { ok: false, error: 'SUPABASE_UNCONFIGURED' },
      { status: 503 }
    );
  }

  let body:any; try { body = await req.json(); } catch { return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 }); }
  const patch:any = {};
  if ('text' in body) patch.text = String(body.text||'').trim();
  if ('author' in body) patch.author = body.author ? String(body.author) : null;
  if ('active' in body) patch.active = !!body.active;

  const { error } = await sb.from('motivational_quotes').update(patch).eq('id', id);
  if (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/motivations] update failed', { code });
    return NextResponse.json({ ok:false, error:'REQUEST_FAILED' }, { status:400 });
  }
  return NextResponse.json({ ok:true });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(
      { ok: false, error: 'SUPABASE_UNCONFIGURED' },
      { status: 503 }
    );
  }

  const { error } = await sb.from('motivational_quotes').delete().eq('id', id);
  if (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/motivations] delete failed', { code });
    return NextResponse.json({ ok:false, error:'REQUEST_FAILED' }, { status:400 });
  }
  return NextResponse.json({ ok:true });
}
