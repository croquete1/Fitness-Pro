import { NextResponse } from 'next/server';
import { tryGetSBC } from '@/lib/supabase/server';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { getTrainerId } from '@/lib/auth/getTrainerId';

const ZERO = { approvalsCount: 0, messagesCount: 0, notificationsCount: 0 } as const;

type Filter = { column: string; value: any; op?: 'eq' | 'is' };
type Candidate = { table: string; filters?: Filter[] };

async function tryCount(sb: any, candidates: Candidate[]) {
  for (const candidate of candidates) {
    try {
      let query: any = sb
        .from(candidate.table)
        .select('id', { head: true, count: 'exact' });

      for (const filter of candidate.filters ?? []) {
        if (filter.op === 'is') {
          query = query.is(filter.column, filter.value);
        } else {
          query = query.eq(filter.column, filter.value);
        }
      }

      const { count } = await query;
      if (typeof count === 'number') return count;
    } catch (error) {
      // ignora tentativas que falhem (tabela/coluna inexistente, etc.)
    }
  }
  return 0;
}

export async function GET() {
  const { trainerId, reason } = await getTrainerId();
  if (!trainerId) {
    if (reason === 'SUPABASE_OFFLINE') {
      return supabaseFallbackJson({ ...ZERO });
    }
    const status = reason === 'NO_SESSION' ? 401 : 403;
    return NextResponse.json({ ...ZERO }, { status });
  }

  const sb = await tryGetSBC();
  if (!sb) {
    return supabaseFallbackJson({ ...ZERO });
  }

  const approvalsCount = await tryCount(sb, [
    {
      table: 'approvals',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'status', value: 'pending' },
      ],
    },
    {
      table: 'trainer_approvals',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'status', value: 'pending' },
      ],
    },
    {
      table: 'user_approvals',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'status', value: 'pending' },
      ],
    },
  ]);

  const messagesCount = await tryCount(sb, [
    {
      table: 'messages',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'read', value: false },
      ],
    },
    {
      table: 'messages',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'read', value: 'false' },
      ],
    },
    {
      table: 'trainer_messages',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'read', value: false },
      ],
    },
    {
      table: 'trainer_messages',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'read', value: 'false' },
      ],
    },
    {
      table: 'messages',
      filters: [
        { column: 'recipient_id', value: trainerId },
        { column: 'read', value: false },
      ],
    },
    {
      table: 'messages',
      filters: [
        { column: 'recipient_id', value: trainerId },
        { column: 'read', value: 'false' },
      ],
    },
  ]);

  const notificationsCount = await tryCount(sb, [
    {
      table: 'notifications',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'read', value: false },
      ],
    },
    {
      table: 'notifications',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'read', value: 'false' },
      ],
    },
    {
      table: 'trainer_notifications',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'is_read', value: false },
      ],
    },
    {
      table: 'trainer_notifications',
      filters: [
        { column: 'trainer_id', value: trainerId },
        { column: 'is_read', value: 'false' },
      ],
    },
    {
      table: 'notifications',
      filters: [
        { column: 'recipient_id', value: trainerId },
        { column: 'read', value: false },
      ],
    },
    {
      table: 'notifications',
      filters: [
        { column: 'recipient_id', value: trainerId },
        { column: 'read', value: 'false' },
      ],
    },
    {
      table: 'notifications',
      filters: [
        { column: 'recipient_role', value: 'TRAINER' },
        { column: 'read', value: false },
      ],
    },
    {
      table: 'notifications',
      filters: [
        { column: 'recipient_role', value: 'TRAINER' },
        { column: 'read', value: 'false' },
      ],
    },
  ]);

  return NextResponse.json({ approvalsCount, messagesCount, notificationsCount });
}
