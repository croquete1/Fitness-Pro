// src/app/api/pt/sessions/order/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const sb = createServerClient();
    const { data: { user} } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];
    if (!ids.length) return NextResponse.json({ error: 'ids required' }, { status: 400 });

    const { data: rows, error: selErr } = await sb
      .from('sessions' as any)
      .select('id, trainer_id')
      .in('id', ids as any);

    if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

    const allMine = (rows ?? []).every((r: any) => String(r.trainer_id) === String(user.id));
    if (!allMine) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const { error: upErr } = await sb
        .from('sessions' as any)
        .update({ order_index: i + 1 } as any)
        .eq('id', id)
        .eq('trainer_id', user.id);
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'server error' }, { status: 500 });
  }
}
