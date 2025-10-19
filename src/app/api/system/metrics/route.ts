import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadSystemDashboard } from '@/lib/system/server';

const ALLOWED_RANGES = [7, 14, 30, 60];

type ErrorPayload = { ok: false; message: string };

type SuccessPayload = Awaited<ReturnType<typeof loadSystemDashboard>>;

export async function GET(request: Request): Promise<NextResponse<SuccessPayload | ErrorPayload>> {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const url = new URL(request.url);
  const rangeParam = url.searchParams.get('range');
  const parsedRange = Number(rangeParam);
  const rangeDays = ALLOWED_RANGES.includes(parsedRange) ? parsedRange : 14;

  const dashboard = await loadSystemDashboard(rangeDays);
  return NextResponse.json(dashboard satisfies SuccessPayload);
}
