// src/app/api/notifications/list/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireUserGuard, isGuardErr } from '@/lib/api-guards';

export async function GET(): Promise<Response> {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  const { data, error } = await sb
    .from('notifications')
    .select('id, user_id, title, body, read, created_at')
    .eq('user_id', guard.me.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data ?? [] });
}
