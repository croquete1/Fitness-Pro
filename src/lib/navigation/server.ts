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

type AverageSource = {
  table: string;
  column: string;
  alias?: string;
  builder?: QueryBuilder;
  limit?: number;
};

const SKIPPABLE_TABLE_ERROR_CODES = new Set(['PGRST205', '42P01', '42703']);

function shouldSkipMissingRelation(error: any): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = typeof (error as any).code === 'string' ? (error as any).code : null;
  if (code && SKIPPABLE_TABLE_ERROR_CODES.has(code)) return true;
  const message = typeof (error as any).message === 'string' ? error.message.toLowerCase() : '';
  if (message.includes('does not exist')) return true;
  const hint = typeof (error as any).hint === 'string' ? error.hint.toLowerCase() : '';
  if (hint.includes('does not exist')) return true;
  return false;
}

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
    if (shouldSkipMissingRelation(error)) return null;
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
    if (shouldSkipMissingRelation(error)) return null;
    console.warn(`[navigation] falha ao somar ${table}.${column}`, error);
    return null;
  }
}

async function safeAverage(client: SupabaseLike, sources: AverageSource[]): Promise<number | null> {
  if (!client) return null;
  for (const source of sources) {
    try {
      const selection = source.alias ? `${source.alias}:${source.column}` : source.column;
      let query = (client as any).from(source.table).select(selection);
      if (source.builder) {
        query = source.builder(query);
      }
      query = query.limit(source.limit ?? 480);
      const { data, error } = await query;
      if (error) {
        if (shouldSkipMissingRelation(error)) continue;
        console.warn(
          `[navigation] falha ao calcular média ${source.table}.${source.column}`,
          error,
        );
        continue;
      }
      if (!Array.isArray(data) || !data.length) continue;
      const key = source.alias ?? source.column;
      const values = data
        .map((row: any) => Number(row?.[key]))
        .filter((value) => Number.isFinite(value));
      if (!values.length) continue;
      const total = values.reduce((sum, value) => sum + value, 0);
      return total / values.length;
    } catch (error) {
      if (shouldSkipMissingRelation(error)) continue;
      console.warn(`[navigation] falha ao calcular média ${source.table}.${source.column}`, error);
    }
  }
  return null;
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
  const walletRangeStart = startOfDay(new Date(now));
  walletRangeStart.setDate(walletRangeStart.getDate() - 29);

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

    if (role !== 'CLIENT') {
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
    } else {
      counts.notificationsUnread = 0;
    }

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

    const satisfactionScore = await safeAverage(client, [
      { table: 'plan_feedback', column: 'score', limit: 480 },
      { table: 'plan_feedback_entries', column: 'score', limit: 480 },
      { table: 'plan_feedbacks', column: 'score', limit: 480 },
      { table: 'plan_reviews', column: 'score', limit: 480 },
      { table: 'plan_day_feedback', column: 'score', limit: 480 },
      { table: 'plan_days', column: 'satisfaction_score', alias: 'score', limit: 480 },
    ]);
    if (satisfactionScore !== null) {
      counts.satisfactionScore = satisfactionScore;
    }

    if (params.userId) {
      const libraryPersonal = await safeCount(client, 'exercises', (query) =>
        query.eq('owner_id', params.userId).eq('is_global', false),
      );
      if (libraryPersonal !== null) counts.libraryPersonal = libraryPersonal;

      try {
        const { data: latest } = await client
          .from('exercises')
          .select('updated_at,created_at')
          .eq('owner_id', params.userId)
          .eq('is_global', false)
          .order('updated_at', { ascending: false, nullsFirst: false })
          .limit(1);
        const updatedAt = latest?.[0]?.updated_at ?? latest?.[0]?.created_at ?? null;
        if (updatedAt) counts.libraryUpdatedAt = updatedAt;
      } catch (error) {
        console.warn('[navigation] falha ao obter última actualização da biblioteca', error);
      }

      if (role === 'CLIENT') {
        try {
          const [walletResult, walletEntriesResult] = await Promise.all([
            client
              .from('client_wallet')
              .select('balance,currency,updated_at')
              .eq('user_id', params.userId)
              .maybeSingle(),
            client
              .from('client_wallet_entries')
              .select('amount,created_at')
              .eq('user_id', params.userId)
              .gte('created_at', walletRangeStart.toISOString())
              .order('created_at', { ascending: false })
              .limit(120),
          ]);

          if (walletResult?.data) {
            counts.walletBalance = Number(walletResult.data.balance ?? 0);
            counts.walletUpdatedAt = walletResult.data.updated_at ?? null;
          }

          if (walletEntriesResult?.data) {
            let credits = 0;
            let debits = 0;
            (walletEntriesResult.data as any[]).forEach((row) => {
              const amount = Number(row?.amount ?? 0);
              if (!Number.isFinite(amount)) return;
              if (amount >= 0) credits += amount;
              else debits += Math.abs(amount);
            });
            counts.walletCredits30d = credits;
            counts.walletDebits30d = debits;
            counts.walletNet30d = credits - debits;
          }
        } catch (error) {
          console.warn('[navigation] falha ao obter métricas da carteira', error);
        }
      }
    }

    const libraryCatalog = await safeCount(client, 'exercises', (query) =>
      query.eq('is_global', true).eq('is_published', true),
    );
    if (libraryCatalog !== null) counts.libraryCatalog = libraryCatalog;
  } catch (error) {
    console.error('[navigation] falha ao gerar resumo de navegação', error);
    return fallback;
  }

  return buildNavigationSummary({ role, now, counts });
}
