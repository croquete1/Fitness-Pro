import { NextResponse } from 'next/server';

import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadClientWalletDashboard } from '@/lib/client/wallet/server';

function parseRange(value?: string | null): number {
  if (!value) return 30;
  const numeric = value.endsWith('d') ? value.slice(0, -1) : value;
  const parsed = Number.parseInt(numeric, 10);
  if (Number.isNaN(parsed)) return 30;
  if (parsed < 7) return 7;
  if (parsed > 180) return 180;
  return parsed;
}

export async function GET(request: Request) {
  const viewer = await getSessionUserSafe();
  if (!viewer?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rangeParam = searchParams.get('range');
  const range = parseRange(rangeParam);

  const dashboard = await loadClientWalletDashboard(viewer.id, range);
  return NextResponse.json(dashboard);
}
