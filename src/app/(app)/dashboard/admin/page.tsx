import * as React from 'react';
import AdminDashboardClient, { type AdminDashboardData } from './AdminDashboardClient';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { getSampleAdminDashboard } from '@/lib/fallback/users';

export const dynamic = 'force-dynamic';

async function loadAdminDashboard(): Promise<{ data: AdminDashboardData; supabase: boolean }> {
  const sb = tryCreateServerClient();
  if (!sb) {
    const sample = getSampleAdminDashboard();
    return { data: sample, supabase: false };
  }

  try {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startTomorrow = new Date(startToday);
    startTomorrow.setDate(startTomorrow.getDate() + 1);
    const sevenDays = new Date(startToday);
    sevenDays.setDate(sevenDays.getDate() + 7);

    const startTodayIso = startToday.toISOString();
    const startTomorrowIso = startTomorrow.toISOString();
    const sevenDaysIso = sevenDays.toISOString();

    async function count(table: 'users' | 'sessions', build?: (q: any) => any) {
      let query: any = sb.from(table as any);
      if (build) {
        query = build(query) ?? query;
      }
      const { count, error } = await query.select('id', { count: 'exact', head: true });
      if (error) {
        console.warn('[admin dashboard] falha ao contar registos', error);
        return 0;
      }
      return count ?? 0;
    }

    const [usersCount, clientsCount, trainersCount, pendingCount, sessionsToday] = await Promise.all([
      count('users'),
      count('users', (q) => q.eq('role', 'CLIENT')),
      count('users', (q) => q.in('role', ['TRAINER', 'PT'])),
      count('users', (q) => q.eq('status', 'PENDING')),
      count('sessions', (q) => q.gte('scheduled_at', startTodayIso).lt('scheduled_at', startTomorrowIso)),
    ]);

    const { data: lastUsers } = await sb
      .from('users')
      .select('id,name,email,created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: sessionsUpcoming } = await sb
      .from('sessions')
      .select(
        `
          id,
          trainer_id,
          client_id,
          scheduled_at,
          location,
          trainer:users!sessions_trainer_id_fkey(id,name,email),
          client:users!sessions_client_id_fkey(id,name,email)
        `,
      )
      .gte('scheduled_at', startTodayIso)
      .lt('scheduled_at', sevenDaysIso)
      .order('scheduled_at', { ascending: true });

    const trainerNames = new Map<string, string>();
    const clientNames = new Map<string, string>();
    for (const row of sessionsUpcoming ?? []) {
      if (row?.trainer_id) {
        const trainer = (row as any).trainer ?? {};
        const id = String(row.trainer_id);
        trainerNames.set(id, trainer.name ?? trainer.email ?? id);
      }
      if (row?.client_id) {
        const client = (row as any).client ?? {};
        const id = String(row.client_id);
        clientNames.set(id, client.name ?? client.email ?? id);
      }
    }

    const trainerTotals = new Map<string, number>();
    let viewAggregated = false;
    try {
      await sb.rpc('refresh_mv_sessions_next7_by_trainer');
      const { data: mvRows, error: mvError } = await sb
        .from('mv_sessions_next7_by_trainer' as any)
        .select('trainer_id,total');
      if (!mvError) {
        for (const row of mvRows ?? []) {
          if (!row?.trainer_id) continue;
          const id = String(row.trainer_id);
          const total = Number(row.total ?? 0);
          trainerTotals.set(id, (trainerTotals.get(id) ?? 0) + total);
        }
        viewAggregated = trainerTotals.size > 0;
      } else {
        console.warn('[admin dashboard] falha ao ler vista materializada de sessões', mvError);
      }
    } catch (error) {
      console.warn('[admin dashboard] erro ao actualizar vista materializada de sessões', error);
    }

    if (!viewAggregated) {
      for (const row of sessionsUpcoming ?? []) {
        if (!row?.trainer_id) continue;
        const id = String(row.trainer_id);
        trainerTotals.set(id, (trainerTotals.get(id) ?? 0) + 1);
      }
    }

    const missingTrainerIds = Array.from(trainerTotals.keys()).filter((id) => !trainerNames.has(id));
    if (missingTrainerIds.length > 0) {
      const { data: trainers, error } = await sb
        .from('users')
        .select('id,name,email')
        .in('id', missingTrainerIds);
      if (error) {
        console.warn('[admin dashboard] falha ao carregar nomes dos PT', error);
      }
      for (const trainer of trainers ?? []) {
        if (!trainer?.id) continue;
        const id = String(trainer.id);
        trainerNames.set(id, trainer.name ?? trainer.email ?? id);
      }
    }

    const topTrainers = Array.from(trainerTotals.entries())
      .map(([id, total]) => ({ id, name: trainerNames.get(id) ?? id, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const agenda = (sessionsUpcoming ?? []).map((session, index) => {
      const trainerId = session.trainer_id ? String(session.trainer_id) : null;
      const clientId = session.client_id ? String(session.client_id) : null;
      return {
        id: session?.id ? String(session.id) : `session-${index}`,
        scheduled_at: session?.scheduled_at ?? null,
        start_time: session?.scheduled_at ?? null,
        trainer_id: trainerId,
        trainer_name: trainerId ? trainerNames.get(trainerId) ?? trainerId : '-',
        client_id: clientId,
        client_name: clientId ? clientNames.get(clientId) ?? clientId : '-',
        location: session.location ?? null,
      };
    });

    const data: AdminDashboardData = {
      totals: {
        users: usersCount,
        clients: clientsCount,
        trainers: trainersCount,
        sessionsToday,
        pendingApprovals: pendingCount,
      },
      recentUsers: (lastUsers ?? []).map((u) => ({
        id: String(u.id),
        name: u.name ?? u.email ?? 'Utilizador',
        email: u.email ?? null,
        createdAt: u.created_at ?? null,
      })),
      topTrainers,
      agenda,
    };

    return { data, supabase: true };
  } catch (error) {
    console.warn('[admin dashboard] fallback sample data', error);
    const sample = getSampleAdminDashboard();
    return { data: sample, supabase: false };
  }
}

function firstName(full?: string | null) {
  if (!full) return 'Admin';
  const parts = full.trim().split(/\s+/);
  return parts[0] ?? full;
}

export default async function AdminDashboardPage() {
  const session = await getSessionUserSafe();
  const name = firstName(session?.user?.name ?? session?.user?.email ?? undefined);
  const { data, supabase } = await loadAdminDashboard();

  return <AdminDashboardClient name={name} data={data} supabase={supabase} />;
}
