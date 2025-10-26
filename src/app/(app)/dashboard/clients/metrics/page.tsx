export const dynamic = 'force-dynamic';

import { redirect } from 'next/navigation';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { createServerClient } from '@/lib/supabaseServer';
import {
  computeClientMetrics,
  normalizeClientMetricRows,
  type ClientMetricRow,
} from '@/lib/metrics/dashboard';
import { fallbackClientMetrics } from '@/lib/fallback/metrics';
import MetricsClient from './metricsClient';

export default async function Page() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) redirect('/login');

  const sb = createServerClient();
  let source: 'supabase' | 'fallback' = 'supabase';
  let rows: ClientMetricRow[] = [];

  try {
    const { data, error } = await sb
      .from('anthropometry')
      .select('id,measured_at,weight_kg,height_cm,body_fat_pct,bmi,notes')
      .eq('user_id', session.user.id)
      .order('measured_at', { ascending: false })
      .limit(365);

    if (error) {
      throw error;
    }

    rows = normalizeClientMetricRows(data ?? []);
  } catch (error) {
    console.error('[client-metrics] Falha ao carregar dados do servidor:', error);
    rows = fallbackClientMetrics;
    source = 'fallback';
  }

  const dashboard = computeClientMetrics(rows);

  return (
    <MetricsClient
      initialRows={rows}
      initialSummary={dashboard.summary}
      initialTimeline={dashboard.timeline}
      fallback={source === 'fallback'}
    />
  );
}
