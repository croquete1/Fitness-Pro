import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { loadTrainerPlansDashboard } from '@/lib/trainer/plans/server';
import { isAdmin, isPT, toAppRole } from '@/lib/roles';

export async function GET() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const role = toAppRole(session.user.role ?? null);
  if (!isPT(role) && !isAdmin(role)) {
    return NextResponse.json({ ok: false, message: 'Sem permissões para consultar este painel.' }, { status: 403 });
  }

  const trainerId = session.user.id;
  const dashboard = await loadTrainerPlansDashboard(trainerId);
  return NextResponse.json(dashboard);
}
