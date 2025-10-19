import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadMessagesDashboard } from '@/lib/messages/server';

const ALLOWED_RANGES = [7, 14, 30, 60, 90];

export async function GET(request: Request) {
  const session = await getSessionUserSafe();
  const uid = session?.user?.id;
  if (!uid) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rangeParam = Number(searchParams.get('range'));
  const range = Number.isFinite(rangeParam) && ALLOWED_RANGES.includes(rangeParam) ? rangeParam : 14;

  const dashboard = await loadMessagesDashboard(uid, range);
  return NextResponse.json(dashboard);
}
