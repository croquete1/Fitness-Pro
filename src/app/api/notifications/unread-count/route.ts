import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { requireUserGuard, isGuardErr } from '@/lib/api-guards';

export async function GET(): Promise<Response> {
  const guard = await requireUserGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = createServerClient();
  const { count, error } = await sb
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', guard.me.id)
    .eq('read', false);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ count: count ?? 0 });
}
