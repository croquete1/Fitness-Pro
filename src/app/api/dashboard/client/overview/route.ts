// src/app/api/dashboard/client/overview/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';

type SupabaseClient = ReturnType<typeof createServerClient>;

type PlanRow = {
  id: string;
  title: string | null;
  status: string | null;
  start_date: string | null;
  end_date: string | null;
  trainer_id: string | null;
};

type SessionRow = {
  id: string;
  scheduled_at: string | null;
  location: string | null;
  status: string | null;
  trainer_id: string | null;
};

type MeasurementRow = {
  measured_at: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  body_fat_pct: number | null;
  bmi: number | null;
  notes?: string | null;
};

async function safeCount(
  client: SupabaseClient,
  table: string,
  build?: (query: any) => any,
): Promise<number> {
  try {
    let query = client.from(table).select('*', { count: 'exact', head: true });
    if (build) query = build(query);
    const { count } = await query;
    return count ?? 0;
  } catch {
    return 0;
  }
}

function toDisplayName(profile: any | null | undefined): string | undefined {
  if (!profile) return undefined;
  return (
    profile.full_name ||
    profile.name ||
    profile.display_name ||
    profile.first_name ||
    undefined
  );
}

export async function GET(request: Request): Promise<Response> {
  const me = await getSessionUserSafe().catch(() => null);
  if (!me?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const appRole = toAppRole(me.user.role) ?? 'CLIENT';
  const url = new URL(request.url);

  const targetClientId =
    appRole === 'ADMIN' && url.searchParams.get('clientId')
      ? url.searchParams.get('clientId')!
      : me.user.id;

  if (!targetClientId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Apenas clientes ou administradores podem aceder ao resumo do cliente.
  if (appRole !== 'CLIENT' && appRole !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const client = createServerClient();

  const now = new Date();
  const inSevenDays = new Date(now);
  inSevenDays.setDate(now.getDate() + 7);

  const plansPromise = client
    .from('training_plans')
    .select('id,title,status,start_date,end_date,trainer_id')
    .eq('client_id', targetClientId)
    .order('start_date', { ascending: false })
    .limit(6);

  const upcomingPromise = client
    .from('sessions')
    .select('id,scheduled_at,location,status,trainer_id', { count: 'exact' })
    .eq('client_id', targetClientId)
    .gte('scheduled_at', now.toISOString())
    .lt('scheduled_at', inSevenDays.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(6);

  const lastMeasurementsPromise = client
    .from('anthropometrics')
    .select('measured_at,weight_kg,height_cm,body_fat_pct,bmi,notes')
    .eq('user_id', targetClientId)
    .order('measured_at', { ascending: false })
    .limit(2);

  const [plansRes, upcomingRes, measurementsRes, unreadNotifications] = await Promise.all([
    plansPromise,
    upcomingPromise,
    lastMeasurementsPromise,
    safeCount(client, 'notifications', (q) => q.eq('user_id', targetClientId).eq('read', false)),
  ]);

  const plans = (plansRes?.data ?? []) as PlanRow[];
  const upcomingSessions = (upcomingRes?.data ?? []) as SessionRow[];
  const totalUpcomingSessions = upcomingRes?.count ?? upcomingSessions.length;
  const measurements = (measurementsRes?.data ?? []) as MeasurementRow[];

  const planCount = await safeCount(client, 'training_plans', (q) =>
    q.eq('client_id', targetClientId),
  );

  const activePlan = plans.find((plan) => {
    const status = (plan.status ?? '').toUpperCase();
    if (status === 'ACTIVE') return true;
    if (plan.end_date) {
      const end = new Date(plan.end_date);
      return end >= now;
    }
    return false;
  }) ?? null;

  const trainerIds = Array.from(
    new Set(
      [
        ...(plans.map((p) => p.trainer_id ?? undefined) ?? []),
        ...(upcomingSessions.map((s) => s.trainer_id ?? undefined) ?? []),
      ].filter(Boolean) as string[],
    ),
  );

  const trainerProfiles: Record<string, string> = {};
  if (trainerIds.length) {
    try {
      const { data: profileRows } = await client
        .from('profiles')
        .select('id, full_name, name, display_name, first_name')
        .in('id', trainerIds);
      for (const profile of profileRows ?? []) {
        if (!profile?.id) continue;
        const friendly = toDisplayName(profile);
        if (friendly) trainerProfiles[profile.id] = friendly;
      }
    } catch (error) {
      console.error('Failed to load trainer profiles', error);
    }
  }

  const lastMeasurement = measurements[0] ?? null;
  const previousMeasurement = measurements[1] ?? null;

  const recommendations: string[] = [];

  if (!activePlan) {
    recommendations.push('Ainda não tens um plano activo — fala com o teu PT para receberes um novo plano.');
  }

  if (totalUpcomingSessions === 0) {
    recommendations.push('Agenda uma nova sessão para manteres a consistência nos treinos.');
  }

  if (unreadNotifications > 0) {
    recommendations.push('Tens notificações por ler — verifica as novidades na tua área pessoal.');
  }

  if (lastMeasurement?.measured_at) {
    const lastMeasurementDate = new Date(lastMeasurement.measured_at);
    const diffDays = Math.floor((now.getTime() - lastMeasurementDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) {
      recommendations.push('Já passou mais de um mês desde o último registo de métricas — adiciona uma nova medição.');
    }
  } else {
    recommendations.push('Adiciona as tuas métricas iniciais para acompanhares a evolução.');
  }

  const response = {
    ok: true,
    stats: {
      totalPlans: planCount,
      activePlans: plans.filter((plan) => (plan.status ?? '').toUpperCase() === 'ACTIVE').length,
      sessionsUpcoming: totalUpcomingSessions,
      unreadNotifications,
    },
    activePlan: activePlan
      ? {
          ...activePlan,
          trainer_name: activePlan.trainer_id ? trainerProfiles[activePlan.trainer_id] : undefined,
        }
      : null,
    upcomingSessions: upcomingSessions.map((session) => ({
      ...session,
      trainer_name: session.trainer_id ? trainerProfiles[session.trainer_id] : undefined,
    })),
    lastMeasurement,
    previousMeasurement,
    recommendations,
  };

  return NextResponse.json(response);
}

