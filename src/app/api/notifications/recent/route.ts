// src/app/api/notifications/recent/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { extractNotificationMetadata } from '@/lib/notifications/metadata';

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
      const meta = extractNotificationMetadata(row?.metadata ?? null);
      const hrefCandidate = [row?.href, meta.href]
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .find((value) => value.length > 0);

      const href = hrefCandidate && hrefCandidate.length > 0 ? hrefCandidate : null;

      return {
        id: row.id,
        title: row.title ?? null,
        body: row.body ?? null,
        href,
        link: href,
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
