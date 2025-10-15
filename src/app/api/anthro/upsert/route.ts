import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  const s = await getSessionUserSafe();
  if (!s?.user?.id) return NextResponse.json({ ok: false }, { status: 401 });

  const b = await req.json();
  const row = {
    user_id: s.user.id,
    measured_at: b.measured_at ? new Date(b.measured_at).toISOString() : new Date().toISOString(),
    weight_kg: b.weight_kg ?? null,
    body_fat_pct: b.body_fat_pct ?? null,
    height_cm: b.height_cm ?? null,
    chest_cm: b.chest_cm ?? null,
    waist_cm: b.waist_cm ?? null,
    hip_cm: b.hip_cm ?? null,
    notes: b.notes ?? null,
  };

  const sb = createServerClient();
  const { error } = await sb.from('anthropometry').insert(row);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  // opcional: sincronizar peso/altura recentes no profiles
  await sb.from('profiles').update({
    weight_kg: row.weight_kg,
    height_cm: row.height_cm,
  }).eq('id', s.user.id);

  return NextResponse.json({ ok: true });
}
