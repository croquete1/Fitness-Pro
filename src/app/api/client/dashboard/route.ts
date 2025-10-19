import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { loadClientDashboard } from '@/lib/client/dashboard/server';
import type { ClientDashboardError, ClientDashboardResponse } from '@/lib/client/dashboard/types';

const MIN_RANGE = 7;
const MAX_RANGE = 180;
const DEFAULT_RANGE = 30;

type Payload = ClientDashboardResponse | ClientDashboardError;

function sanitiseRange(value: string | null): number {
  if (!value) return DEFAULT_RANGE;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_RANGE;
  return Math.min(Math.max(parsed, MIN_RANGE), MAX_RANGE);
}

export async function GET(request: Request): Promise<NextResponse<Payload>> {
  const session = await getSessionUserSafe();
  const userId = session?.user?.id ?? session?.id ?? null;
  if (!userId) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const role = toAppRole(session?.user?.role ?? session?.role) ?? 'CLIENT';
  if (role !== 'CLIENT' && role !== 'ADMIN') {
    return NextResponse.json({ ok: false, message: 'Sem permissões para consultar este painel.' }, { status: 403 });
  }

  const url = new URL(request.url);
  const rangeDays = sanitiseRange(url.searchParams.get('range'));
  const requestedClientId = url.searchParams.get('clientId');

  const targetClientId = role === 'ADMIN' && requestedClientId ? requestedClientId : userId;

  const result = await loadClientDashboard(targetClientId, rangeDays);
  return NextResponse.json(result, { headers: { 'cache-control': 'no-store' } });
}
