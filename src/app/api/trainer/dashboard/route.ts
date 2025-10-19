import { NextResponse } from 'next/server';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { loadTrainerDashboard } from '@/lib/trainer/dashboard/server';
import { getTrainerDashboardFallback } from '@/lib/fallback/trainer-dashboard';

export async function GET(request: Request) {
  try {
    const session = await getSessionUserSafe();
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, message: 'Não autenticado' }, { status: 401 });
    }

    const role = toAppRole(session.user.role) ?? toAppRole((session as any)?.role) ?? 'CLIENT';
    if (role !== 'PT' && role !== 'ADMIN') {
      return NextResponse.json({ ok: false, message: 'Sem permissões' }, { status: 403 });
    }

    const url = new URL(request.url);
    const requestedTrainerId = url.searchParams.get('trainerId');
    const trainerId = role === 'PT' ? session.user.id : requestedTrainerId;
    const trainerName =
      session.user.name ??
      (session.user as any)?.full_name ??
      (session.user as any)?.user_metadata?.full_name ??
      session.user.email ??
      null;

    const dashboard = await loadTrainerDashboard(trainerId, trainerName);
    return NextResponse.json({ ok: true, ...dashboard }, { status: 200 });
  } catch (error) {
    console.error('[trainer-dashboard] api route error', error);
    const fallback = getTrainerDashboardFallback('trainer-fallback');
    return NextResponse.json({ ok: true, ...fallback }, { status: 200 });
  }
}
