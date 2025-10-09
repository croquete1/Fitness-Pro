import 'server-only';

import type { HeaderCounts } from '@/components/header/HeaderCountsContext';
import type { AdminCounts, ClientCounts } from '@/lib/hooks/useCounts';
import type { PtsCounts } from '@/lib/hooks/usePtsCounts';
import { serverSB } from '@/lib/supabase/server';
import type { DashboardCountsSnapshot } from '@/types/dashboard-counts';

type CountFallback = {
  table: string;
  where?: { column: string; value: string | number | boolean };
};

async function countWithFallbacks(list: CountFallback[]): Promise<number> {
  const sb = serverSB();

  async function countSingle(def: CountFallback): Promise<number> {
    let query = sb.from(def.table).select('id', { count: 'exact', head: true });
    if (def.where) {
      query = query.eq(def.where.column, def.where.value);
    }
    const { count, error } = await query;
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  for (const item of list) {
    try {
      return await countSingle(item);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[counts] Falha ao contar ${item.table}`, error);
      }
    }
  }

  return 0;
}

export async function getAdminCounts(): Promise<AdminCounts> {
  try {
    const approvalsCount = await countWithFallbacks([
      { table: 'approvals', where: { column: 'status', value: 'pending' } },
      { table: 'user_approvals', where: { column: 'status', value: 'pending' } },
    ]);

    const notificationsCount = await countWithFallbacks([
      { table: 'notifications', where: { column: 'read', value: false } },
      { table: 'admin_notifications', where: { column: 'is_read', value: false } },
    ]);

    return { approvalsCount, notificationsCount };
  } catch {
    return { approvalsCount: 0, notificationsCount: 0 };
  }
}

export async function getClientCounts(): Promise<ClientCounts> {
  try {
    const messagesCount = await countWithFallbacks([
      { table: 'messages' },
      { table: 'client_messages' },
    ]);

    const notificationsCount = await countWithFallbacks([
      { table: 'notifications', where: { column: 'read', value: false } },
      { table: 'client_notifications', where: { column: 'is_read', value: false } },
    ]);

    return { messagesCount, notificationsCount };
  } catch {
    return { messagesCount: 0, notificationsCount: 0 };
  }
}

export async function getTrainerPtsCounts(): Promise<PtsCounts> {
  try {
    const sb = serverSB();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfToday.getDate() + 1);
    const startInSeven = new Date(startOfToday);
    startInSeven.setDate(startOfToday.getDate() + 7);

    const { count: today = 0 } = await sb
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .gte('start_time', startOfToday.toISOString())
      .lt('start_time', startOfTomorrow.toISOString());

    const { count: next7 = 0 } = await sb
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .gte('start_time', startOfToday.toISOString())
      .lt('start_time', startInSeven.toISOString());

    return { today: today ?? 0, next7: next7 ?? 0 };
  } catch {
    return { today: 0, next7: 0 };
  }
}

export function buildHeaderSnapshot(
  role: string | null | undefined,
  counts: DashboardCountsSnapshot,
): Partial<HeaderCounts> {
  const normalized = String(role ?? 'CLIENT').toUpperCase();
  if (counts.header) return counts.header;
  if (normalized === 'ADMIN' && counts.admin) {
    return {
      approvalsCount: counts.admin.approvalsCount,
      notificationsCount: counts.admin.notificationsCount,
    };
  }
  if (normalized === 'CLIENT' && counts.client) {
    return {
      messagesCount: counts.client.messagesCount,
      notificationsCount: counts.client.notificationsCount,
    };
  }
  if (counts.trainer) {
    return {
      approvalsCount: 0,
      messagesCount: counts.client?.messagesCount ?? 0,
      notificationsCount: counts.client?.notificationsCount ?? 0,
    };
  }
  return {};
}
