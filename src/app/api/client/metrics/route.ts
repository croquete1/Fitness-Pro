// src/app/api/clients/metrics/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request){
  const s = await getSessionUserSafe(); if(!s?.user?.id) return NextResponse.json({ ok:false }, { status:401 });
  const body = await req.json();
  const items = Array.isArray(body)
    ? body
    : Array.isArray(body?.rows)
      ? body.rows
      : [body];

  const rows = items
    .map((entry)=>{
      if(!entry || typeof entry !== 'object') return null;
      const measured_at = typeof entry.measured_at === 'string' && entry.measured_at
        ? new Date(entry.measured_at).toISOString()
        : null;
      return {
        user_id: s.user.id,
        measured_at: measured_at ?? new Date().toISOString(),
        weight_kg: entry.weight_kg ?? null,
        height_cm: entry.height_cm ?? null,
        body_fat_pct: entry.body_fat_pct ?? null,
        bmi: entry.bmi ?? null,
        notes: entry.notes ?? null,
      };
    })
    .filter((row): row is {
      user_id: string;
      measured_at: string;
      weight_kg: number|null;
      height_cm: number|null;
      body_fat_pct: number|null;
      bmi: number|null;
      notes: string|null;
    }=>Boolean(row));

  if(rows.length===0) return NextResponse.json({ ok:false, message:'Sem dados para guardar.' }, { status:400 });

  const sb = createServerClient();
  const { data, error } = await sb
    .from('anthropometry')
    .insert(rows)
    .select('id,measured_at,weight_kg,height_cm,body_fat_pct,bmi,notes')
    .order('measured_at', { ascending:false });

  if (error) return NextResponse.json({ ok:false, message:error.message }, { status:500 });
  const payload = { ok:true, rows: data ?? [] } as { ok:true; rows: typeof data extends Array<infer T> ? T[] : never; row?: unknown };
  if (Array.isArray(data) && data.length === 1) payload.row = data[0];
  return NextResponse.json(payload);
}
