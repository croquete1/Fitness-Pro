// src/app/api/notifications/recent/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

export async function GET() {
  try {
    const me = await getSessionUserSafe();
    if (!me?.id) return NextResponse.json({ items: [] }, { status: 200 });

    const sb = createServerClient();
    const { data, error } = await sb
      .from('notifications')
      .select('id,title,body,link,created_at,read')
      .eq('user_id', me.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.warn('[notifications/recent] supabase:', error.message);
      return NextResponse.json({ items: [] }, { status: 200 });
    }
    return NextResponse.json({ items: data ?? [] }, { status: 200 });
  } catch (e: any) {
    console.warn('[notifications/recent] fail:', e?.message);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
