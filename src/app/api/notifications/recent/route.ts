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
      .select('id,title,body,href,metadata,created_at,read')
      .eq('user_id', me.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.warn('[notifications/recent] supabase:', error.message);
      return NextResponse.json({ items: [] }, { status: 200 });
    }
    const items = (data ?? []).map((row: any) => {
      const meta = row?.metadata && typeof row.metadata === 'object' ? (row.metadata as Record<string, unknown>) : null;
      const href = typeof row?.href === 'string' && row.href.trim() ? row.href.trim() : null;
      const metaHref =
        meta && typeof meta.href === 'string' && meta.href.trim() ? (meta.href as string).trim() : null;
      return {
        id: row.id,
        title: row.title ?? null,
        body: row.body ?? null,
        href: href ?? metaHref,
        link: href ?? metaHref,
        created_at: row.created_at ?? null,
        read: row.read ?? false,
      };
    });
    return NextResponse.json({ items }, { status: 200 });
  } catch (e: any) {
    console.warn('[notifications/recent] fail:', e?.message);
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
