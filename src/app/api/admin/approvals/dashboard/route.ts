import { NextResponse } from 'next/server';

import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { buildAdminApprovalsDashboard, mapApprovalRow } from '@/lib/admin/approvals/dashboard';
import { getAdminApprovalsDashboardFallback } from '@/lib/fallback/admin-approvals';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { tryCreateServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

const TABLE_CANDIDATES = ['admin_approval_requests', 'approvals', 'pending_approvals'] as const;

export async function GET() {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const sb = tryCreateServerClient();
  if (!sb) {
    return supabaseFallbackJson(getAdminApprovalsDashboardFallback());
  }

  for (const table of TABLE_CANDIDATES) {
    const query = await sb.from(table).select('*', { count: 'exact' }).limit(1000);
    if (query.error) {
      const code = query.error.code ?? '';
      if (code === '42P01' || code === 'PGRST205' || code === 'PGRST301') {
        continue;
      }
      console.warn('[admin/approvals/dashboard] select failed', { table, code, message: query.error.message });
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const rows = query.data ?? [];
    const mapped = rows.map(mapApprovalRow);
    const datasetSize = typeof query.count === 'number' ? query.count : rows.length;
    const payload = buildAdminApprovalsDashboard(mapped, {
      source: 'supabase',
      total: datasetSize,
      supabaseConfigured: true,
    });
    return NextResponse.json(payload, { headers: { 'cache-control': 'no-store' } });
  }

  return supabaseFallbackJson(getAdminApprovalsDashboardFallback());
}

