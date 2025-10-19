import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { isAdmin, isPT, toAppRole } from '@/lib/roles';
import { loadTrainerLibraryDashboard } from '@/lib/trainer/library/server';

export async function GET() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: 'Não autenticado.' }, { status: 401 });
  }

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  if (!isPT(role) && !isAdmin(role)) {
    return NextResponse.json({ ok: false, message: 'Sem permissões para consultar este painel.' }, { status: 403 });
  }

  const dashboard = await loadTrainerLibraryDashboard(session.user.id);
  return NextResponse.json(dashboard);
}
