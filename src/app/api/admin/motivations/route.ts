// GET lista / POST criar
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { toAppRole } from '@/lib/roles';
import { supabaseFallbackJson } from '@/lib/supabase/responses';

export async function GET() {
  const sb = tryCreateServerClient();
  if (!sb) return supabaseFallbackJson({ ok: true, items: [] });
  const { data: auth } = await sb.auth.getUser();
  if (!auth?.user) return NextResponse.json({ ok:false, error:'UNAUTHENTICATED' }, { status:401 });

  // ADMIN vê tudo; outros só active
  const role = toAppRole((auth.user as any)?.role) ?? 'CLIENT';
  const q = sb.from('motivational_quotes').select('*').order('created_at', { ascending: false });
  const { data, error } = role === 'ADMIN' ? await q : await q.eq('active', true);
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });
  return NextResponse.json({ ok:true, items: data ?? [] });
}

export async function POST(req: Request) {
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
  const row = { text: String(body.text||'').trim(), author: body.author ? String(body.author) : null, active: body.active ?? true, created_by: auth.user.id };
  if (!row.text) return NextResponse.json({ ok:false, error:'MISSING_TEXT' }, { status:400 });

  const { data, error } = await sb.from('motivational_quotes').insert(row).select('*').single();
  if (error) return NextResponse.json({ ok:false, error:error.message }, { status:400 });
  return NextResponse.json({ ok:true, item: data });
}
