import { tryCreateServerClient } from '@/lib/supabaseServer';
import { isSkippableSchemaError } from '@/lib/supabase/errors';

import { buildClientDashboard } from './dashboard';
import type {
  ClientDashboardData,
  ClientDashboardResponse,
  ClientDashboardSource,
  ClientMeasurementRow,
  ClientNotificationRow,
  ClientPlanRow,
  ClientSessionRowRaw,
  ClientWalletEntryRow,
  ClientWalletRow,
} from './types';
import { getClientDashboardFallback } from '@/lib/fallback/client-dashboard';

function uniq<T>(values: Iterable<T>): T[] {
  return Array.from(new Set(values));
}

function normaliseReadFlag(value: unknown): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return null;
    return value !== 0;
  }
  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    if (!normalised) return null;
    if (['true', 't', '1', 'yes', 'y'].includes(normalised)) return true;
    if (['false', 'f', '0', 'no', 'n'].includes(normalised)) return false;
  }
  if (typeof value === 'object') return Boolean(value);
  return Boolean(value);
}

async function fetchClientNotifications(
  sb: ReturnType<typeof tryCreateServerClient>,
  clientId: string,
): Promise<ClientNotificationRow[]> {
  if (!sb) return [];

  const baseQuery = sb
    .from('notifications' as any)
    .select('id,title,type,read,created_at')
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })
    .limit(24);

  const { data, error } = await baseQuery;
  if (!error) {
    return (data ?? []).map((row: any) => ({
      id: row.id,
      title: row.title ?? null,
      type: row.type ?? null,
      read: normaliseReadFlag(row.read),
      created_at: row.created_at ?? null,
    }));
  }

  if (!isSkippableSchemaError(error)) {
    throw error;
  }

  console.warn(
    '[client-dashboard] notificações com esquema diferente do esperado, a recuar para selecção reduzida',
    error,
  );

  const fallbackQuery = sb
    .from('notifications' as any)
    .select('id,title,read,created_at')
    .eq('user_id', clientId)
    .order('created_at', { ascending: false })
    .limit(24);

  const { data: fallbackData, error: fallbackError } = await fallbackQuery;
  if (fallbackError) {
    if (isSkippableSchemaError(fallbackError)) {
      console.warn('[client-dashboard] tabela de notificações indisponível, a apresentar lista vazia', fallbackError);
      return [];
    }
    throw fallbackError;
  }

  return (fallbackData ?? []).map((row: any) => ({
    id: row.id,
    title: row.title ?? null,
    type: null,
    read: normaliseReadFlag(row.read),
    created_at: row.created_at ?? null,
  }));
}

export async function loadClientDashboard(
  clientId: string,
  rangeDays = 30,
): Promise<ClientDashboardResponse> {
  const fallback = getClientDashboardFallback(clientId, rangeDays);
  const sb = tryCreateServerClient();
  if (!sb) {
    return { ...fallback, ok: true, source: 'fallback' } satisfies ClientDashboardResponse;
  }

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - (rangeDays - 1));
  rangeStart.setHours(0, 0, 0, 0);
  const historyStart = new Date(rangeStart);
  historyStart.setDate(historyStart.getDate() - rangeDays);
  const futureEnd = new Date(now);
  futureEnd.setDate(futureEnd.getDate() + 30);

  try {
    const [
      { data: planRows, error: planError },
      { data: sessionRows, error: sessionError },
      { data: measurementRows, error: measurementError },
      { data: walletRow, error: walletError },
      { data: walletEntryRows, error: walletEntryError },
    ] = await Promise.all([
      sb
        .from('training_plans')
        .select('id,title,status,client_id,trainer_id,start_date,end_date,updated_at,notes')
        .eq('client_id', clientId)
        .order('updated_at', { ascending: false })
        .limit(20),
      sb
        .from('sessions')
        .select('id,trainer_id,scheduled_at,duration_min,location,client_attendance_status')
        .eq('client_id', clientId)
        .gte('scheduled_at', historyStart.toISOString())
        .lte('scheduled_at', futureEnd.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(180),
      sb
        .from('anthropometry')
        .select('measured_at,weight_kg,body_fat_pct,bmi')
        .eq('user_id', clientId)
        .order('measured_at', { ascending: false })
        .limit(24),
      sb
        .from('client_wallet')
        .select('balance,currency,updated_at')
        .eq('user_id', clientId)
        .maybeSingle(),
      sb
        .from('client_wallet_entries')
        .select('id,amount,desc,created_at')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(24),
    ]);

    if (planError || sessionError || measurementError || walletError || walletEntryError) {
      throw planError || sessionError || measurementError || walletError || walletEntryError;
    }

    const plans = (planRows ?? []) as ClientPlanRow[];
    const sessions = (sessionRows ?? []) as ClientSessionRowRaw[];
    const notifications = await fetchClientNotifications(sb, clientId);
    const measurements = (measurementRows ?? []) as ClientMeasurementRow[];
    const wallet = (walletRow ?? null) as ClientWalletRow | null;
    const walletEntries = (walletEntryRows ?? []) as ClientWalletEntryRow[];

    const trainerIds = uniq([
      ...plans.map((plan) => plan.trainer_id).filter(Boolean),
      ...sessions.map((session) => session.trainer_id).filter(Boolean),
    ]) as string[];

    const trainerNames: Record<string, string> = {};

    if (trainerIds.length) {
      try {
        const { data: profiles } = await sb
          .from('profiles')
          .select('id,full_name,name,display_name,first_name')
          .in('id', trainerIds)
          .limit(120);
        (profiles ?? []).forEach((profile: any) => {
          if (!profile?.id) return;
          const label =
            (typeof profile.full_name === 'string' && profile.full_name.trim()) ||
            (typeof profile.name === 'string' && profile.name.trim()) ||
            (typeof profile.display_name === 'string' && profile.display_name.trim()) ||
            (typeof profile.first_name === 'string' && profile.first_name.trim()) ||
            null;
          if (label) {
            trainerNames[profile.id as string] = label;
          }
        });
      } catch (error) {
        console.warn('[client-dashboard] failed to resolve trainer names', error);
      }
    }

    const source: ClientDashboardSource = {
      now,
      rangeDays,
      plans,
      sessions,
      notifications,
      measurements,
      wallet,
      walletEntries,
      trainerNames,
    };

    const data: ClientDashboardData = buildClientDashboard(source);
    return { ...data, ok: true, source: 'supabase' } satisfies ClientDashboardResponse;
  } catch (error) {
    console.error('[client-dashboard] fallback due to supabase error', error);
    return { ...fallback, ok: true, source: 'fallback' } satisfies ClientDashboardResponse;
  }
}
