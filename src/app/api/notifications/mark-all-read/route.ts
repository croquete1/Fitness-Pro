// src/app/api/notifications/mark-all-read/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireUserGuard, isGuardErr } from '@/lib/api-guards';

export async function POST(): Promise<Response> {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  const { error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('user_id', guard.me.id)
    .eq('read', false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
