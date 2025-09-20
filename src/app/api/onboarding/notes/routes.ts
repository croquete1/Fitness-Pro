// src/app/api/onboarding/notes/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function POST(req: Request){
  const s = await getSessionUserSafe(); if(!s?.user?.id) return NextResponse.json({ ok:false }, { status:401 });
  const body = await req.json();
  const sb = createServerClient();
  const { error } = await sb.from('fitness_questionnaire_notes').insert({
    questionnaire_id: body.questionnaire_id,
    author_id: s.user.id,
    visibility: body.visibility,
    body: body.body
  });
  if (error) return NextResponse.json({ ok:false }, { status:500 });
  return NextResponse.json({ ok:true });
}
