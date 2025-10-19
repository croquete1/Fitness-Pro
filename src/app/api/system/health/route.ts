import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadSystemHealthDashboard } from '@/lib/system/health/server';

type SuccessPayload = Awaited<ReturnType<typeof loadSystemHealthDashboard>>;
type ErrorPayload = { ok: false; message: string };

export async function GET(): Promise<NextResponse<SuccessPayload | ErrorPayload>> {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const dashboard = await loadSystemHealthDashboard();
  return NextResponse.json(dashboard satisfies SuccessPayload);
}
