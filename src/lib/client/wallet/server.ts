import { tryCreateServerClient } from '@/lib/supabaseServer';
import { buildClientWalletDashboard } from './dashboard';
import type { ClientWalletDashboardResponse } from './types';
import type { ClientWalletEntryRow, ClientWalletRow } from '@/lib/client/dashboard/types';
import { getClientWalletFallback } from '@/lib/fallback/client-wallet';

function normaliseRange(rangeDays: number): number {
  if (!Number.isFinite(rangeDays)) return 30;
  if (rangeDays < 7) return 7;
  if (rangeDays > 180) return 180;
  return Math.round(rangeDays);
}

export async function loadClientWalletDashboard(
  userId: string,
  rangeDays = 30,
): Promise<ClientWalletDashboardResponse> {
  const normalizedRange = normaliseRange(rangeDays);
  const fallback = getClientWalletFallback(userId, normalizedRange);
  const supabase = tryCreateServerClient();
  if (!supabase) {
    return { ...fallback, ok: true, source: 'fallback' } satisfies ClientWalletDashboardResponse;
  }

  const now = new Date();
  const rangeStart = new Date(now);
  rangeStart.setDate(rangeStart.getDate() - (normalizedRange - 1));
  rangeStart.setHours(0, 0, 0, 0);
  const historyStart = new Date(rangeStart);
  historyStart.setDate(historyStart.getDate() - normalizedRange);

  try {
    const [walletResult, entriesResult] = await Promise.all([
      supabase
        .from('client_wallet')
        .select('balance,currency,updated_at')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('client_wallet_entries')
        .select('id,amount,desc,created_at')
        .eq('user_id', userId)
        .gte('created_at', historyStart.toISOString())
        .order('created_at', { ascending: true })
        .limit(480),
    ]);

    if (walletResult.error) throw walletResult.error;
    if (entriesResult.error) throw entriesResult.error;

    const source = buildClientWalletDashboard({
      now,
      rangeDays: normalizedRange,
      wallet: (walletResult.data ?? null) as ClientWalletRow | null,
      entries: (entriesResult.data ?? []) as ClientWalletEntryRow[],
    });

    return { ...source, ok: true, source: 'supabase' } satisfies ClientWalletDashboardResponse;
  } catch (error) {
    console.error('[client-wallet] erro ao carregar dados', error);
    return { ...fallback, ok: true, source: 'fallback' } satisfies ClientWalletDashboardResponse;
  }
}
