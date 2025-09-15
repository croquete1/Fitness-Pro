// src/app/api/admin/notifications/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';

export async function GET(): Promise<Response> {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  const { data, error } = await sb
    .from('notifications')
    .select('id, user_id, title, body, read, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, items: data ?? [] });
}
