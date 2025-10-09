import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const sb = createServerClient();

  async function safeCount(table: string, where?: [string, string]) {
    try {
      let q = sb.from(table).select('id', { count: 'exact', head: true });
      if (where) q = q.eq(where[0], where[1]);
      const { count = 0 } = await q;
      return count;
    } catch {
      return 0;
    }
  }

  const messagesCount =
    (await safeCount('messages')) ||
    (await safeCount('client_messages')) ||
    0;

  const notificationsCount =
    (await safeCount('notifications', ['read', 'false'])) ||
    (await safeCount('client_notifications', ['is_read', 'false'])) ||
    0;

  return NextResponse.json({ messagesCount, notificationsCount });
}
