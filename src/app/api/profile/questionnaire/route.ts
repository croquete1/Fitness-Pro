// src/app/api/profile/questionnaire/route.ts
import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const sb = createServerClient();
  const { data, error } = await sb
    .from('fitness_questionnaire')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('[profile/questionnaire] fetch failed', error);
    return NextResponse.json({ ok: false, error: 'Não foi possível carregar o questionário.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}
