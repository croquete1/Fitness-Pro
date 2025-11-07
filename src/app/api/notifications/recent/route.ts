// src/app/api/notifications/recent/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { extractNotificationMetadata } from '@/lib/notifications/metadata';

function buildSelect(columns: Array<string | null | false | undefined>) {
  return columns.filter(Boolean).join(',');
}

function isMissingColumnError(error: unknown, column?: string) {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string | null; message?: string | null };
  if (err.code === '42703') {
    if (!column) return true;
    return err.message ? err.message.includes(column) : true;
  }
  if (typeof err.message === 'string') {
    return /column .* does not exist/i.test(err.message);
  }
  return false;
}

export async function GET() {
  try {
    const me = await getSessionUserSafe();
    if (!me?.id) return NextResponse.json({ items: [] }, { status: 200 });

    const sb = createServerClient();
    let includeMetadata = true;
    const selectColumns = (meta: boolean) =>
      buildSelect(['id', 'title', 'body', 'href', meta ? 'metadata' : null, 'created_at', 'read']);

    let { data, error } = await sb
      .from('notifications')
      .select(selectColumns(includeMetadata))
      .eq('user_id', me.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error && isMissingColumnError(error, 'metadata')) {
      includeMetadata = false;
      ({ data, error } = await sb
        .from('notifications')
        .select(selectColumns(includeMetadata))
        .eq('user_id', me.id)
        .order('created_at', { ascending: false })
        .limit(10));
    }

    if (error) {
      console.warn('[notifications/recent] supabase:', error.message);
      return NextResponse.json({ items: [] }, { status: 200 });
    }
    const items = (data ?? []).map((row: any) => {
      const meta = includeMetadata ? extractNotificationMetadata(row?.metadata ?? null) : { href: null };
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
