import { createServerClient, tryCreateServiceRoleClient } from '@/lib/supabaseServer';
import { buildAdminClientsDashboard } from './dashboard';
import type {
  AdminClientRecord,
  AdminClientsDashboardParams,
  AdminClientsDashboardResponse,
} from './types';
import { getAdminClientsDashboardFallback } from '@/lib/fallback/admin-clients';

const MAX_CLIENTS = 800;
const RANGE_TO_WEEKS: Record<'12w' | '24w' | '36w', number> = {
  '12w': 12,
  '24w': 24,
  '36w': 36,
};

const DAY_MS = 86_400_000;

function clampRange(value: AdminClientsDashboardParams['range']): '12w' | '24w' | '36w' {
  if (value === '24w' || value === '36w') return value;
  return '12w';
}

function parseMetadata(metadata: any): {
  satisfactionScore: number | null;
  churnRiskScore: number | null;
  engagementScore: number | null;
  goals: string[];
  tags: string[];
} {
  if (!metadata || typeof metadata !== 'object') {
    return { satisfactionScore: null, churnRiskScore: null, engagementScore: null, goals: [], tags: [] };
  }

  const extractNumber = (key: string): number | null => {
    const value = (metadata as any)[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const arrayFrom = (key: string): string[] => {
    const value = (metadata as any)[key];
    if (Array.isArray(value)) {
      return value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : null))
        .filter((entry): entry is string => Boolean(entry));
    }
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
    return [];
  };

  return {
    satisfactionScore: extractNumber('satisfaction_score'),
    churnRiskScore: extractNumber('churn_risk_score'),
    engagementScore: extractNumber('engagement_score'),
    goals: arrayFrom('goals'),
    tags: arrayFrom('tags'),
  };
}

type RawUserRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  status: string | null;
  approved: boolean | null;
  active: boolean | null;
  is_active?: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  last_sign_in_at?: string | null;
  last_login_at?: string | null;
  last_seen_at?: string | null;
  metadata: any;
};

type RawSessionRow = {
  id: string;
  client_id: string;
  trainer_id: string | null;
  scheduled_at: string;
  duration_min: number | null;
  client_attendance_status: string | null;
  client_attendance_at: string | null;
};

type RawPlanRow = {
  id: string;
  client_id: string | null;
  trainer_id: string | null;
  status: string | null;
  title: string | null;
  updated_at: string | null;
};

type RawWalletRow = {
  user_id: string;
  balance: number | null;
  currency: string | null;
  updated_at: string | null;
};

type RawInvoiceRow = {
  id: string;
  client_id: string | null;
  client_name: string | null;
  amount: number | null;
  status: string | null;
  issued_at: string | null;
  paid_at: string | null;
};

type RawRequestRow = {
  id: string;
  client_id: string;
  status: string;
  requested_start: string;
};

type RawProfileRow = {
  id: string;
  full_name?: string | null;
  name?: string | null;
  display_name?: string | null;
  first_name?: string | null;
  email?: string | null;
};

function toTrainerName(profile: RawProfileRow | undefined | null): string | null {
  if (!profile) return null;
  const names = [profile.full_name, profile.name, profile.display_name, profile.first_name]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);
  return names[0] || profile.email || null;
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isWithin(date: Date | null, start: Date, end: Date): boolean {
  if (!date) return false;
  const ms = date.getTime();
  return ms >= start.getTime() && ms <= end.getTime();
}

function addRecordDefaults(row: RawUserRow): AdminClientRecord {
  const { satisfactionScore, churnRiskScore, engagementScore, goals, tags } = parseMetadata(row.metadata);
  return {
    id: String(row.id),
    name: row.name ?? null,
    email: row.email ?? null,
    status: row.status ?? null,
    approved: row.approved ?? null,
    active: row.active ?? row.is_active ?? null,
    createdAt: row.created_at ?? null,
    lastActiveAt: row.last_seen_at ?? row.updated_at ?? null,
    lastSignInAt: row.last_login_at ?? row.last_sign_in_at ?? null,
    trainerId: null,
    trainerName: null,
    goals,
    tags,
    sessionsCompleted30d: 0,
    sessionsCompletedRange: 0,
    sessionsScheduled7d: 0,
    sessionsCancelled30d: 0,
    lastSessionAt: null,
    nextSessionAt: null,
    walletBalance: null,
    walletCurrency: 'EUR',
    walletUpdatedAt: null,
    invoicesPaidTotal: 0,
    invoicesPaidTotal30d: 0,
    invoicesPendingTotal: 0,
    invoicesPendingTotal30d: 0,
    invoicesPaidCount: 0,
    invoicesPendingCount: 0,
    planCount: 0,
    activePlanCount: 0,
    lastPlanTitle: null,
    lastPlanUpdatedAt: null,
    satisfactionScore,
    churnRiskScore,
    engagementScore,
  } satisfies AdminClientRecord;
}

function resolveTrainerNames(records: Iterable<{ trainer_id: string | null }>, profiles: RawProfileRow[]): Record<string, string> {
  const lookup = new Map<string, string>();
  const profileMap = new Map(profiles.map((profile) => [String(profile.id), profile] as const));
  for (const record of records) {
    if (!record.trainer_id) continue;
    const key = String(record.trainer_id);
    if (lookup.has(key)) continue;
    const profile = profileMap.get(key);
    const name = toTrainerName(profile);
    if (name) lookup.set(key, name);
  }
  return Object.fromEntries(lookup);
}

export async function loadAdminClientsDashboard(
  params: AdminClientsDashboardParams = {},
): Promise<AdminClientsDashboardResponse> {
  const range = clampRange(params.range);
  const weeks = RANGE_TO_WEEKS[range];
  const now = new Date();
  const rangeStart = new Date(now.getTime() - (weeks - 1) * 7 * DAY_MS);
  rangeStart.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(now.getTime() - 29 * DAY_MS);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const sevenDaysAhead = new Date(now.getTime() + 7 * DAY_MS);

  const sb = tryCreateServiceRoleClient() ?? createServerClient();
  if (!sb) {
    const fallback = getAdminClientsDashboardFallback();
    return { ok: true, data: fallback } satisfies AdminClientsDashboardResponse;
  }

  try {
    const { data: userRows, error: userError } = await sb
      .from('users')
      .select(
        'id,email,name,role,status,approved,active:is_active,created_at,updated_at,last_login_at,last_seen_at,metadata',
      )
      .eq('role', 'CLIENT')
      .order('created_at', { ascending: false })
      .limit(MAX_CLIENTS);

    if (userError) throw userError;

    const baseRecords = new Map<string, AdminClientRecord>();
    const clientIds: string[] = [];

    for (const row of userRows ?? []) {
      if (!row?.id) continue;
      const id = String(row.id);
      clientIds.push(id);
      baseRecords.set(id, addRecordDefaults(row as RawUserRow));
    }

    if (!clientIds.length) {
      const empty = buildAdminClientsDashboard([], { supabase: true, weeks, now });
      return { ok: true, data: empty } satisfies AdminClientsDashboardResponse;
    }

    const [{ data: sessions, error: sessionsError }, { data: plans, error: plansError }, { data: wallets, error: walletsError }, { data: invoices, error: invoicesError }, { data: requests, error: requestsError }] = await Promise.all([
      sb
        .from('sessions')
        .select('id,client_id,trainer_id,scheduled_at,duration_min,client_attendance_status,client_attendance_at')
        .in('client_id', clientIds)
        .gte('scheduled_at', rangeStart.toISOString())
        .lte('scheduled_at', sevenDaysAhead.toISOString())
        .limit(4000),
      sb
        .from('training_plans')
        .select('id,client_id,trainer_id,status,title,updated_at')
        .in('client_id', clientIds)
        .order('updated_at', { ascending: false })
        .limit(2000),
      sb
        .from('client_wallet')
        .select('user_id,balance,currency,updated_at')
        .in('user_id', clientIds)
        .limit(clientIds.length),
      sb
        .from('billing_invoices')
        .select('id,client_id,client_name,amount,status,issued_at,paid_at')
        .in('client_id', clientIds)
        .gte('issued_at', rangeStart.toISOString())
        .limit(3000),
      sb
        .from('session_requests')
        .select('id,client_id,status,requested_start')
        .in('client_id', clientIds)
        .gte('requested_start', rangeStart.toISOString())
        .limit(2000),
    ]);

    if (sessionsError) throw sessionsError;
    if (plansError) throw plansError;
    if (walletsError) throw walletsError;
    if (invoicesError) throw invoicesError;
    if (requestsError) throw requestsError;

    const trainerIds = new Set<string>();
    for (const row of sessions ?? []) {
      if (row?.trainer_id) trainerIds.add(String(row.trainer_id));
    }
    for (const row of plans ?? []) {
      if (row?.trainer_id) trainerIds.add(String(row.trainer_id));
    }

    let trainerNames: Record<string, string> = {};
    if (trainerIds.size) {
      const { data: profiles } = await sb
        .from('profiles')
        .select('id,full_name,name,display_name,first_name,email')
        .in('id', Array.from(trainerIds))
        .limit(trainerIds.size);
      trainerNames = resolveTrainerNames([{ trainer_id: null }, ...(sessions ?? []), ...(plans ?? [])], profiles ?? []);
    }

    for (const session of sessions ?? []) {
      if (!session?.client_id) continue;
      const record = baseRecords.get(String(session.client_id));
      if (!record) continue;

      const scheduledAt = parseDate(session.scheduled_at);
      const attendanceAt = parseDate(session.client_attendance_at);
      const trainerName = session.trainer_id ? trainerNames[String(session.trainer_id)] ?? null : null;

      if (trainerName && !record.trainerName) {
        record.trainerId = String(session.trainer_id);
        record.trainerName = trainerName;
      }

      if (scheduledAt && scheduledAt <= now) {
        if (!record.lastSessionAt || new Date(record.lastSessionAt) < scheduledAt) {
          record.lastSessionAt = scheduledAt.toISOString();
        }
      }
      if (scheduledAt && scheduledAt > now) {
        if (!record.nextSessionAt || new Date(record.nextSessionAt) > scheduledAt) {
          record.nextSessionAt = scheduledAt.toISOString();
        }
      }

      const status = session.client_attendance_status?.toString().toLowerCase();
      if (status === 'completed' || status === 'confirmed') {
        if (scheduledAt && isWithin(scheduledAt, thirtyDaysAgo, now)) {
          record.sessionsCompleted30d += 1;
        }
        if (scheduledAt && isWithin(scheduledAt, rangeStart, now)) {
          record.sessionsCompletedRange += 1;
        }
      } else if (status === 'cancelled' || status === 'no_show') {
        if (scheduledAt && isWithin(scheduledAt, thirtyDaysAgo, now)) {
          record.sessionsCancelled30d += 1;
        }
      } else if ((!status || status === 'pending') && scheduledAt && scheduledAt > now && scheduledAt <= sevenDaysAhead) {
        record.sessionsScheduled7d += 1;
      }

      if (attendanceAt && (!record.lastActiveAt || new Date(record.lastActiveAt) < attendanceAt)) {
        record.lastActiveAt = attendanceAt.toISOString();
      }
    }

    for (const plan of plans ?? []) {
      if (!plan?.client_id) continue;
      const record = baseRecords.get(String(plan.client_id));
      if (!record) continue;
      record.planCount += 1;
      const status = plan.status?.toString().toUpperCase();
      if (status === 'ACTIVE') record.activePlanCount += 1;

      const trainerName = plan.trainer_id ? trainerNames[String(plan.trainer_id)] ?? null : null;
      if (trainerName && !record.trainerName) {
        record.trainerId = String(plan.trainer_id);
        record.trainerName = trainerName;
      }

      if (!record.lastPlanUpdatedAt || (plan.updated_at && record.lastPlanUpdatedAt < plan.updated_at)) {
        record.lastPlanUpdatedAt = plan.updated_at ?? null;
        record.lastPlanTitle = plan.title ?? null;
      }
    }

    for (const wallet of wallets ?? []) {
      if (!wallet?.user_id) continue;
      const record = baseRecords.get(String(wallet.user_id));
      if (!record) continue;
      record.walletBalance = wallet.balance ?? record.walletBalance ?? 0;
      record.walletCurrency = wallet.currency ?? record.walletCurrency ?? 'EUR';
      record.walletUpdatedAt = wallet.updated_at ?? record.walletUpdatedAt;
    }

    for (const invoice of invoices ?? []) {
      if (!invoice?.client_id) continue;
      const record = baseRecords.get(String(invoice.client_id));
      if (!record) continue;
      const amount = Number(invoice.amount ?? 0) || 0;
      const issuedAt = parseDate(invoice.issued_at);
      const paidAt = parseDate(invoice.paid_at);
      const status = invoice.status?.toString().toLowerCase();

      if (status === 'paid') {
        record.invoicesPaidTotal += amount;
        record.invoicesPaidCount += 1;
        if ((paidAt && paidAt >= thirtyDaysAgo && paidAt <= now) || (issuedAt && isWithin(issuedAt, thirtyDaysAgo, now))) {
          record.invoicesPaidTotal30d += amount;
        }
      } else if (status === 'pending') {
        record.invoicesPendingTotal += amount;
        record.invoicesPendingCount += 1;
        if (issuedAt && isWithin(issuedAt, thirtyDaysAgo, now)) {
          record.invoicesPendingTotal30d += amount;
        }
      }
    }

    for (const request of requests ?? []) {
      if (!request?.client_id) continue;
      const record = baseRecords.get(String(request.client_id));
      if (!record) continue;
      if (request.status === 'pending' || request.status === 'reschedule_pending') {
        record.sessionsScheduled7d += 1;
      }
    }

    const records = Array.from(baseRecords.values());
    const dashboard = buildAdminClientsDashboard(records, { supabase: true, weeks, now });
    return { ok: true, data: dashboard } satisfies AdminClientsDashboardResponse;
  } catch (error) {
    console.error('[admin-clients-dashboard] fallback due to error', error);
    const fallback = getAdminClientsDashboardFallback();
    return { ok: true, data: fallback } satisfies AdminClientsDashboardResponse;
  }
}
