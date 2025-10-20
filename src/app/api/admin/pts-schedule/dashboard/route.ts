import { NextResponse } from 'next/server';

import { requireAdminGuard, isGuardErr } from '@/lib/api-guards';
import { loadAdminPtsScheduleDashboard } from '@/lib/admin/pts-schedule/dashboard';
import { getAdminPtsScheduleFallback } from '@/lib/fallback/admin-pts-schedule';
import { supabaseFallbackJson } from '@/lib/supabase/responses';
import { tryCreateServerClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireAdminGuard();
  if (isGuardErr(guard)) return guard.response;

  const now = new Date();
  const sb = tryCreateServerClient();
  if (!sb) {
    const fallback = getAdminPtsScheduleFallback(now);
    return supabaseFallbackJson({ ok: true, source: 'fallback', ...fallback });
  }

  try {
    const dashboard = await loadAdminPtsScheduleDashboard(sb, { now });
    return NextResponse.json(
      { ok: true, source: 'supabase', ...dashboard },
      { headers: { 'cache-control': 'no-store' } },
    );
  } catch (error) {
    console.error('[admin/pts-schedule] dashboard fallback', error);
    const fallback = getAdminPtsScheduleFallback(now);
    return supabaseFallbackJson({ ok: true, source: 'fallback', ...fallback });
  }
}
