// src/app/api/anthropometry/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getSessionUser } from '@/lib/sessions';

function num(v: any) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  try {
    const me = await getSessionUser();
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    const payload = {
      client_id: String(body.clientId),
      created_by_id: String(me.id),
      date: body.date ? String(body.date) : new Date().toISOString().slice(0, 10),

      height_cm: num(body.height_cm),
      weight_kg: num(body.weight_kg),
      body_fat_pct: num(body.body_fat_pct),
      chest_cm: num(body.chest_cm),
      waist_cm: num(body.waist_cm),
      hip_cm: num(body.hip_cm),
      thigh_cm: num(body.thigh_cm),
      arm_cm: num(body.arm_cm),
      calf_cm: num(body.calf_cm),
      shoulders_cm: num(body.shoulders_cm),
      neck_cm: num(body.neck_cm),
      notes: body.notes ? String(body.notes) : null,
    };

    const { data, error } = await supabaseAdmin
      .from('anthropometry')
      .insert(payload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unexpected error' }, { status: 500 });
  }
}
