import { createServerClient, tryCreateServiceRoleClient } from '@/lib/supabaseServer';
import { buildNavigationSummary } from './summary';
import {
  type NavigationRole,
  type NavigationSummary,
  type NavigationSummaryCounts,
} from './types';
import {
  getNavigationFallback,
  getNavigationFallbackCounts,
} from '@/lib/fallback/navigation';

export type LoadNavigationSummaryParams = {
  role?: string | null;
  userId?: string | null;
  now?: Date;
};

type SupabaseLike = ReturnType<typeof createServerClient> | null;

type QueryBuilder = (query: any) => any;

type CountAttempt = {
  table: string;
  builder?: QueryBuilder;
};

function normaliseRole(role?: string | null): NavigationRole {
  const value = String(role ?? 'CLIENT').toUpperCase();
  if (value === 'ADMIN') return 'ADMIN';
  if (value === 'TRAINER' || value === 'PT') return 'TRAINER';
  return 'CLIENT';
}

function startOfDay(date: Date): Date {
  const clone = new Date(date.getTime());
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function endOfDay(date: Date): Date {
  const clone = new Date(date.getTime());
  clone.setHours(23, 59, 59, 999);
  return clone;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

async function safeCount(client: SupabaseLike, table: string, builder?: QueryBuilder): Promise<number | null> {
  if (!client) return null;
  try {
    let query = (client as any).from(table).select('id', { count: 'exact', head: true });
    if (builder) {
      query = builder(query);
    }
    const { count, error } = await query;
    if (error) throw error;
    return typeof count === 'number' ? count : 0;
  } catch (error) {
    console.warn(`[navigation] falha ao contar ${table}`, error);
    return null;
  }
}

async function countFirst(client: SupabaseLike, attempts: CountAttempt[]): Promise<number | null> {
  for (const attempt of attempts) {
    const value = await safeCount(client, attempt.table, attempt.builder);
    if (value !== null) return value;
  }
  return null;
}

async function safeSum(
  client: SupabaseLike,
  table: string,
  column: string,
  builder?: QueryBuilder,
): Promise<number | null> {
  if (!client) return null;
  try {
    let query = (client as any).from(table).select(column).limit(720);
    if (builder) query = builder(query);
    const { data, error } = await query;
    if (error) throw error;
    if (!Array.isArray(data)) return 0;
    return data.reduce((total, row) => total + Number(row?.[column] ?? 0), 0);
  } catch (error) {
    console.warn(`[navigation] falha ao somar ${table}.${column}`, error);
    return null;
  }
}

export async function loadNavigationSummary(
  params: LoadNavigationSummaryParams = {},
): Promise<NavigationSummary> {
  const now = params.now ?? new Date();
  const role = normaliseRole(params.role);
  const fallback = getNavigationFallback(role, now);
  const fallbackCounts = getNavigationFallbackCounts(role, now);

  let client: SupabaseLike = null;
  try {
    client = tryCreateServiceRoleClient() ?? createServerClient();
  } catch (error) {
    console.warn('[navigation] supabase indisponível', error);
    return fallback;
  }
  if (!client) {
    return fallback;
  }

  const counts: NavigationSummaryCounts = { ...fallbackCounts };
  const startDay = startOfDay(now);
  const endDay = endOfDay(now);
  const startMonthValue = startOfMonth(now);
  const endMonthValue = endOfMonth(now);
  const nowIso = now.toISOString();

  try {
    const approvals = await countFirst(client, [
      { table: 'approvals', builder: (query) => query.eq('status', 'pending') },
      { table: 'user_approvals', builder: (query) => query.eq('status', 'pending') },
    ]);
    if (approvals !== null) counts.approvalsPending = approvals;

    const onboardingPending = await safeCount(client, 'onboarding_forms', (query) =>
      query.eq('status', 'submitted'),
    );
    if (onboardingPending !== null) counts.onboardingPending = onboardingPending;

    const notifications = await countFirst(client, [
      params.userId
        ? {
            table: 'notifications',
            builder: (query) => query.eq('user_id', params.userId).eq('read', false),
          }
        : { table: 'notifications', builder: (query) => query.eq('read', false) },
      {
        table: 'admin_notifications',
        builder: (query) => query.eq('is_read', false),
      },
      {
        table: 'notification_receipts',
        builder: (query) =>
          params.userId
            ? query.eq('user_id', params.userId).is('read_at', null)
            : query.is('read_at', null),
      },
    ]);
    if (notifications !== null) counts.notificationsUnread = notifications;

    const messagesUnread = params.userId
      ? await safeCount(client, 'messages', (query) =>
          query.eq('to_id', params.userId).is('read_at', null),
        )
      : null;
    if (messagesUnread !== null) counts.messagesUnread = messagesUnread;

    const clientsActive = await countFirst(client, [
      { table: 'users', builder: (query) => query.ilike('role', 'client%') },
      { table: 'profiles', builder: (query) => query.ilike('role', 'client%') },
    ]);
    if (clientsActive !== null) counts.clientsActive = clientsActive;

    const trainersActive = await countFirst(client, [
      {
        table: 'users',
        builder: (query) => query.in('role', ['trainer', 'pt', 'coach', 'TRAINER', 'PT']),
      },
      {
        table: 'profiles',
        builder: (query) => query.in('role', ['trainer', 'pt', 'coach', 'TRAINER', 'PT']),
      },
      {
        table: 'trainer_roster_assignments',
        builder: (query) => query.eq('status', 'active'),
      },
    ]);
    if (trainersActive !== null) counts.trainersActive = trainersActive;

    const sessionsUpcoming = await safeCount(client, 'sessions', (query) =>
      query.gte('scheduled_at', nowIso),
    );
    if (sessionsUpcoming !== null) counts.sessionsUpcoming = sessionsUpcoming;

    const sessionsToday = await safeCount(client, 'sessions', (query) =>
      query
        .gte('scheduled_at', startDay.toISOString())
        .lte('scheduled_at', endDay.toISOString()),
    );
    if (sessionsToday !== null) counts.sessionsToday = sessionsToday;

    const plansActive = await countFirst(client, [
      {
        table: 'training_plans',
        builder: (query) => query.eq('status', 'active'),
      },
      {
        table: 'plans',
        builder: (query) => query.eq('status', 'active'),
      },
    ]);
    if (plansActive !== null) counts.plansActive = plansActive;

    const invoicesPending = await safeCount(client, 'billing_invoices', (query) =>
      query.eq('status', 'pending'),
    );
    if (invoicesPending !== null) counts.invoicesPending = invoicesPending;

    const revenueMonth = await safeSum(client, 'billing_invoices', 'amount', (query) =>
      query
        .eq('status', 'paid')
        .gte('issued_at', startMonthValue.toISOString())
        .lte('issued_at', endMonthValue.toISOString()),
    );
    if (revenueMonth !== null) counts.revenueMonth = revenueMonth;

    const revenuePending = await safeSum(client, 'billing_invoices', 'amount', (query) =>
      query.eq('status', 'pending'),
    );
    if (revenuePending !== null) counts.revenuePending = revenuePending;

    const satisfaction = await safeSum(client, 'plan_feedback', 'score', (query) =>
      query.limit(480),
    );
    const satisfactionTotal = await safeCount(client, 'plan_feedback');
    if (satisfaction !== null && satisfactionTotal && satisfactionTotal > 0) {
      counts.satisfactionScore = satisfaction / satisfactionTotal;
    }
  } catch (error) {
    console.error('[navigation] falha ao gerar resumo de navegação', error);
    return fallback;
  }

  return buildNavigationSummary({ role, now, counts });
}
