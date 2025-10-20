import { NextResponse } from 'next/server';

import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { buildAdminNotificationsDashboard, mapNotificationRow } from '@/lib/admin/notifications/dashboard';
import { getAdminNotificationsDashboardFallback } from '@/lib/fallback/admin-notifications';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { tryCreateServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const TABLE_CANDIDATES = ['notifications', 'admin_notifications', 'app_notifications'] as const;

export async function GET() {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(getAdminNotificationsDashboardFallback());
  }

  for (const table of TABLE_CANDIDATES) {
    const query = await sb.from(table).select('*', { count: 'exact' }).limit(1000);
    if (query.error) {
      const code = query.error.code ?? '';
      if (code === '42P01' || code === 'PGRST205' || code === 'PGRST301') {
        continue;
      }
      console.warn('[admin/notifications/dashboard] select failed', { table, code, message: query.error.message });
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const rows = query.data ?? [];
    const mapped = rows.map(mapNotificationRow);
    const datasetSize = typeof query.count === 'number' ? query.count : rows.length;
    const payload = buildAdminNotificationsDashboard(mapped, {
      source: 'supabase',
      total: datasetSize,
      supabaseConfigured: true,
    });
    return NextResponse.json(payload, { headers: { 'cache-control': 'no-store' } });
  }

  return supabaseFallbackJson(getAdminNotificationsDashboardFallback());
}

