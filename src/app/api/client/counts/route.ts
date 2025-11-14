import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';

const SKIPPABLE_TABLE_ERROR_CODES = new Set(['PGRST205', '42P01', '42703', '42501', 'PGRST301']);

function shouldSkipMissingRelation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as { code?: string | null; message?: string | null; hint?: string | null };
  if (err.code && SKIPPABLE_TABLE_ERROR_CODES.has(err.code)) return true;
  const message = typeof err.message === 'string' ? err.message.toLowerCase() : '';
  if (message.includes('does not exist')) return true;
  if (message.includes('permission denied') || message.includes('not allowed')) return true;
  const hint = typeof err.hint === 'string' ? err.hint.toLowerCase() : '';
  if (hint.includes('does not exist')) return true;
  return false;
}

type QueryBuilder = (query: any) => any;

async function safeCount(client: ReturnType<typeof createServerClient>, table: string, builder?: QueryBuilder) {
  if (!client) return null;
  try {
    let query = client.from(table).select('id', { count: 'exact', head: true });
    if (builder) query = builder(query);
    const { count, error } = await query;
    if (error) throw error;
    return typeof count === 'number' ? count : 0;
  } catch (error) {
    if (shouldSkipMissingRelation(error)) return null;
    console.warn(`[client/counts] falha ao contar ${table}`, error);
    return null;
  }
}

async function countFirst(
  client: ReturnType<typeof createServerClient>,
  attempts: Array<{ table: string; builder?: QueryBuilder }>,
) {
  for (const attempt of attempts) {
    const value = await safeCount(client, attempt.table, attempt.builder);
    if (value !== null) return value;
  }
  return null;
}

export async function GET() {
  const session = await getSessionUserSafe();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ messagesCount: 0, notificationsCount: 0 });
  }

  let messagesCount = 0;
  let notificationsCount = 0;

  try {
    const sb = createServerClient();

    const messagesResult = await countFirst(sb, [
      { table: 'messages', builder: (query) => query.eq('to_id', userId).is('read_at', null) },
      { table: 'client_messages', builder: (query) => query.eq('user_id', userId).eq('status', 'unread') },
      { table: 'message_receipts', builder: (query) => query.eq('user_id', userId).is('read_at', null) },
    ]);
    if (typeof messagesResult === 'number') {
      messagesCount = messagesResult;
    }

    const notificationsResult = await countFirst(sb, [
      { table: 'notifications', builder: (query) => query.eq('user_id', userId).eq('read', false) },
      { table: 'notification_receipts', builder: (query) => query.eq('user_id', userId).is('read_at', null) },
      { table: 'client_notifications', builder: (query) => query.eq('user_id', userId).eq('is_read', false) },
    ]);
    if (typeof notificationsResult === 'number') {
      notificationsCount = notificationsResult;
    }
  } catch (error) {
    console.warn('[client/counts] supabase indisponível', error);
  }

  return NextResponse.json({ messagesCount, notificationsCount });
}
