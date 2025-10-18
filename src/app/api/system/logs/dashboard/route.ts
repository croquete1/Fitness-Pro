import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadSystemLogsDashboard } from '@/lib/system/logs/server';

const ALLOWED_RANGES = [7, 14, 30, 60, 90] as const;

type SuccessPayload = Awaited<ReturnType<typeof loadSystemLogsDashboard>>;

type ErrorPayload = { ok: false; message: string };

export async function GET(request: Request): Promise<NextResponse<SuccessPayload | ErrorPayload>> {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rangeParam = Number(searchParams.get('range'));
  const rangeDays = ALLOWED_RANGES.includes(rangeParam as (typeof ALLOWED_RANGES)[number])
    ? rangeParam
    : 14;

  const dashboard = await loadSystemLogsDashboard(rangeDays);
  return NextResponse.json(dashboard satisfies SuccessPayload);
}
