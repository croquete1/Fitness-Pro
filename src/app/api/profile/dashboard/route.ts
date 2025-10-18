import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadProfileDashboard } from '@/lib/profile/server';
import type { ProfileDashboardError, ProfileDashboardResponse } from '@/lib/profile/types';

type ProfileDashboardPayload = ProfileDashboardResponse | ProfileDashboardError;

export async function GET(): Promise<NextResponse<ProfileDashboardPayload>> {
  const session = await getSessionUserSafe();
  if (!session?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const result = await loadProfileDashboard(session.id, {
    email: session?.email,
    name: session?.name,
    role: session?.role,
  });

  const payload: ProfileDashboardResponse = {
    ok: true,
    source: result.source,
    ...result.data,
  };

  return NextResponse.json(payload, { headers: { 'cache-control': 'no-store' } });
}
