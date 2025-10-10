// GET lista / POST criar
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { supabaseFallbackJson, supabaseUnavailableResponse } from '@/lib/supabase/responses';
import { requireAdminGuard, isGuardErr, requireUserGuard } from '@/lib/api-guards';

export async function GET() {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = tryCreateServerClient();
  if (!sb) return supabaseFallbackJson({ ok: true, items: [] });

  const q = sb.from('motivational_quotes').select('*').order('created_at', { ascending: false });
  try {
    const data = await q.then((res) => {
      if (res.error) throw res.error;
      if (guard.me.role !== 'ADMIN') {
        return (res.data ?? []).filter((row: any) => row?.active !== false);
      }
      return res.data ?? [];
    });
    return NextResponse.json({ ok: true, items: data });
  } catch (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/motivations] list failed', { code });
    return NextResponse.json({ ok: false, error: 'REQUEST_FAILED' }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;
  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseUnavailableResponse();
  }

  let body:any; try { body = await req.json(); } catch { return NextResponse.json({ ok:false, error:'INVALID_JSON' }, { status:400 }); }
  const row = { text: String(body.text||'').trim(), author: body.author ? String(body.author) : null, active: body.active ?? true, created_by: guard.me.id };
  if (!row.text) return NextResponse.json({ ok:false, error:'MISSING_TEXT' }, { status:400 });

  const { data, error } = await sb.from('motivational_quotes').insert(row).select('*').single();
  if (error) {
    const code = typeof error === 'object' && error && 'code' in error ? (error as any).code : 'unknown';
    console.warn('[admin/motivations] create failed', { code });
    return NextResponse.json({ ok:false, error:'REQUEST_FAILED' }, { status:400 });
  }
  return NextResponse.json({ ok:true, item: data });
}
