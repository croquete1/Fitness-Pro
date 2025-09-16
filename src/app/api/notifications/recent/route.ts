// src/app/api/notifications/recent/route.ts
import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const session = await getSessionUserSafe();
  const userId = session?.user?.id ? String(session.user.id) : null;
  if (!userId) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const sb = createServerClient();
  const { data, error } = await sb
    .from('notifications')
    .select('id,title,body,link,created_at,read')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}
