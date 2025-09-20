// src/app/api/onboarding/submit/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request){
  const s = await getSessionUserSafe(); if(!s?.user?.id) return NextResponse.json({ ok:false }, { status:401 });
  const body = await req.json();
  const sb = createServerClient();

  const { data, error } = await sb.from('fitness_questionnaire').upsert({
    user_id: s.user.id,
    wellbeing_0_to_5: body.wellbeing_0_to_5 ?? null,
    objective: body.objective ?? null,
    job: body.job ?? null,
    active: !!body.active,
    sport: body.sport ?? null,
    sport_time: body.sport_time ?? null,
    pathologies: body.pathologies ?? null,
    schedule: body.schedule ?? null,
    metrics: body.metrics ?? null,
    status: body.status ?? 'submitted',
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' }).select('id').maybeSingle();

  if (error) return NextResponse.json({ ok:false }, { status:500 });

  // notificar admins
  try{
    const { data: admins } = await sb.from('users').select('id').eq('role','ADMIN');
    const items = (admins ?? []).map((a:any)=>({
      user_id: a.id, title: 'Questionário submetido', body: 'Um cliente submeteu a avaliação física.',
      read: false, href: '/dashboard/admin'
    }));
    if (items.length) await sb.from('notifications').insert(items);
  }catch{}

  return NextResponse.json({ ok:true, id: data?.id });
}
