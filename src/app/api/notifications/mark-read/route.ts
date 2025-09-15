// src/app/api/notifications/mark-read/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireUserGuard, isGuardErr } from '@/lib/api-guards';

export async function POST(req: Request): Promise<Response> {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  const body = await req.json().catch(() => ({}));
  const id = body?.id as string | undefined;
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 });

  const sb = createServerClient();
  const { error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', guard.me.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
