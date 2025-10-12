import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

const IGNORED_CODES = new Set(['42P01', '42703', 'PGRST204']);

type Filter = (query: any) => any;

type Candidate = {
  table: string;
  select?: string;
  filters?: Filter[];
};

function shouldIgnore(error: any) {
  return Boolean(error && typeof error === 'object' && 'code' in error && IGNORED_CODES.has(String((error as any).code)));
}

export async function GET() {
  const session = await getSessionUserSafe();
  const me = session?.user;
  if (!me?.id) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const role = toAppRole(me.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const sb = createServerClient();

  async function headCount(candidate: Candidate): Promise<number | null> {
    let query = sb.from(candidate.table).select(candidate.select ?? 'id', { head: true, count: 'exact' });
    for (const apply of candidate.filters ?? []) {
      query = apply(query);
    }
    const { count, error } = await query;
    if (error) {
      if (shouldIgnore(error)) return null;
      throw error;
    }
    return typeof count === 'number' ? count : null;
  }

  async function tryCount(list: Candidate[]): Promise<number> {
    for (const candidate of list) {
      try {
        const count = await headCount(candidate);
        if (typeof count === 'number' && !Number.isNaN(count)) return count;
      } catch (error) {
        if (!shouldIgnore(error)) {
          console.warn('[trainer/counts]', candidate.table, error);
        }
      }
    }
    return 0;
  }

  const approvalsCount = await tryCount([
    { table: 'approvals', filters: [(q) => q.eq('trainer_id', me.id).eq('status', 'pending')] },
    { table: 'trainer_approvals', filters: [(q) => q.eq('trainer_id', me.id).eq('status', 'pending')] },
    { table: 'approvals', filters: [(q) => q.eq('status', 'pending')] },
  ]);

  const messagesCount = await tryCount([
    { table: 'messages', filters: [(q) => q.eq('recipient_id', me.id).eq('read', false)] },
    { table: 'messages', filters: [(q) => q.eq('recipient_id', me.id).eq('is_read', false)] },
    { table: 'messages', filters: [(q) => q.eq('user_id', me.id).eq('read', false)] },
    { table: 'trainer_messages', filters: [(q) => q.eq('trainer_id', me.id).eq('read', false)] },
    { table: 'messages_unread', filters: [(q) => q.eq('recipient_id', me.id)] },
  ]);

  const notificationsCount = await tryCount([
    { table: 'notifications', filters: [(q) => q.eq('user_id', me.id).eq('read', false)] },
    { table: 'notifications', filters: [(q) => q.eq('user_id', me.id).eq('is_read', false)] },
    { table: 'trainer_notifications', filters: [(q) => q.eq('trainer_id', me.id).eq('is_read', false)] },
    { table: 'notifications_unread', filters: [(q) => q.eq('user_id', me.id)] },
  ]);

  return NextResponse.json(
    { approvalsCount, messagesCount, notificationsCount },
    { headers: { 'cache-control': 'no-store' } },
  );
}
