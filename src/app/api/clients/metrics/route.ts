// src/app/api/clients/metrics/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request){
  const s = await getSessionUserSafe(); if(!s?.user?.id) return NextResponse.json({ ok:false }, { status:401 });
  const body = await req.json();
  const sb = createServerClient();
  const { data, error } = await sb.from('anthropometrics').insert({
    user_id: s.user.id,
    measured_at: body.measured_at || new Date().toISOString(),
    weight_kg: body.weight_kg ?? null,
    height_cm: body.height_cm ?? null,
    body_fat_pct: body.body_fat_pct ?? null,
    bmi: body.bmi ?? null,
    notes: body.notes ?? null,
  }).select('id,measured_at,weight_kg,height_cm,body_fat_pct,bmi,notes').maybeSingle();
  if (error) return NextResponse.json({ ok:false }, { status:500 });
  return NextResponse.json({ ok:true, row: data });
}
