import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadSettingsDashboard } from '@/lib/settings/server';
import type { SettingsDashboardError, SettingsDashboardResponse } from '@/lib/settings/types';

const ALLOWED_RANGES = new Set(['30', '60', '90']);

export async function GET(request: Request) {
  const session = await getSessionUserSafe();
  if (!session?.id) {
    return NextResponse.json<SettingsDashboardError>({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const rangeParam = url.searchParams.get('range');
  const rangeValue = ALLOWED_RANGES.has(String(rangeParam)) ? Number(rangeParam) : 30;

  const dashboardResult = await loadSettingsDashboard(session.id, {
    rangeDays: rangeValue,
    session: {
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });

  const payload: SettingsDashboardResponse = {
    ok: true,
    source: dashboardResult.source,
    ...dashboardResult.data,
  };

  return NextResponse.json(payload, { status: 200 });
}
