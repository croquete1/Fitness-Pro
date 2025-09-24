// src/app/api/profile/metrics/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { assertCanViewClient } from '@/lib/acl';

export async function GET(req: Request) {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  const sb = createServerClient();
  const url = new URL(req.url);
  const target = url.searchParams.get('userId') || me.id;

  try { await assertCanViewClient({ id: me.id, role: me.role }, target, sb); }
  catch (e: any) { return NextResponse.json({ ok: false, error: 'FORBIDDEN' }, { status: e?.status ?? 403 }); }

  let items: any[] = [];
  try {
    const { data } = await sb.from('profile_metrics_history' as any)
      .select('*').eq('user_id', target).order('measured_at');
    if (data?.length) items = data as any[];
  } catch {}
  if (!items.length) {
    try {
      const { data } = await sb.from('metrics_history' as any)
        .select('*').eq('user_id', target).order('measured_at');
      if (data?.length) items = data as any[];
    } catch {}
  }
  if (!items.length) {
    try {
      const { data } = await sb.from('metrics_log' as any)
        .select('*').eq('user_id', target).order('created_at');
      items = (data ?? []).map((r: any) => ({
        id: r.id, measured_at: r.created_at,
        weight_kg: r.weight_kg, body_fat_pct: r.body_fat_pct,
        chest_cm: r.chest_cm, waist_cm: r.waist_cm, hips_cm: r.hips_cm,
        bicep_cm: r.bicep_cm, thigh_cm: r.thigh_cm, note: r.note
      }));
    } catch {}
  }

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });

  const sb = createServerClient();
  let body: any; try { body = await req.json(); } catch {
    return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
  }

  const row = {
    user_id: me.id,
    measured_at: body.measured_at ? new Date(body.measured_at).toISOString() : new Date().toISOString(),
    weight_kg: body.weight_kg ?? null,
    body_fat_pct: body.body_fat_pct ?? null,
    chest_cm: body.chest_cm ?? null, waist_cm: body.waist_cm ?? null, hips_cm: body.hips_cm ?? null,
    bicep_cm: body.bicep_cm ?? null, thigh_cm: body.thigh_cm ?? null,
    note: body.note ?? null,
  };

  try {
    const { error } = await sb.from('profile_metrics_history' as any).insert(row);
    if (!error) return NextResponse.json({ ok: true });
  } catch {}
  try {
    const { error } = await sb.from('metrics_history' as any).insert(row);
    if (!error) return NextResponse.json({ ok: true });
  } catch {}

  return NextResponse.json({ ok: false, error: 'TABLE_NOT_FOUND' }, { status: 400 });
}
