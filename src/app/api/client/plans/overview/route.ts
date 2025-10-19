import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { fetchClientPlanOverviewSafe } from '@/lib/client/plans/server';
import { getClientPlanOverviewFallback } from '@/lib/fallback/client-plan-overview';

function clampRange(value: string | null): number {
  const numeric = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(numeric)) return 7;
  return Math.max(7, Math.min(28, numeric));
}

export async function GET(request: Request) {
  const session = await getSessionUserSafe();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Sessão inválida.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const days = clampRange(url.searchParams.get('days'));

  const overview = await fetchClientPlanOverviewSafe(userId, { rangeDays: days });
  if (!overview) {
    const fallback = getClientPlanOverviewFallback(days);
    return NextResponse.json({ ok: true, ...fallback, source: 'fallback' as const });
  }

  return NextResponse.json({ ok: true, ...overview, source: 'supabase' as const });
}
