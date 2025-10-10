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

    const [usersCount, clientsCount, trainersCount, pendingCount, sessionsToday] = await Promise.all([
      sb.from('users').select('*', { count: 'exact', head: true }),
      sb.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CLIENT'),
      sb.from('users').select('*', { count: 'exact', head: true }).in('role', ['TRAINER', 'PT']),
      sb.from('users').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
      sb
        .from('sessions')
        .select('id', { count: 'exact', head: true })
        .gte('start_time', startToday.toISOString())
        .lt('start_time', startTomorrow.toISOString()),
    ]).then((results) => results.map((r) => r.count ?? 0));

    const { data: lastUsers } = await sb
      .from('users')
      .select('id,name,email,created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: sessionsUpcoming } = await sb
      .from('sessions')
      .select('id, trainer_id, client_id, start_time, location')
      .gte('start_time', startToday.toISOString())
      .lt('start_time', sevenDays.toISOString())
      .order('start_time', { ascending: true });

  const trainerCounts = new Map<string, number>();
  const trainerIds = new Set<string>();
  const clientIds = new Set<string>();
  for (const row of sessionsUpcoming ?? []) {
    if (!row?.trainer_id) continue;
    const trainerId = String(row.trainer_id);
    trainerCounts.set(trainerId, (trainerCounts.get(trainerId) ?? 0) + 1);
    trainerIds.add(trainerId);
    if (row?.client_id) clientIds.add(String(row.client_id));
  }

  const trainerProfiles: Record<string, { name: string }> = {};
  if (trainerIds.size) {
    const { data: trainers } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', Array.from(trainerIds));
    for (const t of trainers ?? []) {
      if (!t?.id) continue;
      trainerProfiles[String(t.id)] = { name: t.name ?? t.email ?? String(t.id) };
    }
  }

  const clientProfiles: Record<string, { name: string }> = {};
  if (clientIds.size) {
    const { data: clients } = await sb
      .from('users')
      .select('id,name,email')
      .in('id', Array.from(clientIds));
    for (const c of clients ?? []) {
      if (!c?.id) continue;
      clientProfiles[String(c.id)] = { name: c.name ?? c.email ?? String(c.id) };
    }
  }

  const topTrainers = Array.from(trainerCounts.entries())
    .map(([id, total]) => ({
      id,
      name: trainerProfiles[id]?.name ?? id,
      total,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const agenda = (sessionsUpcoming ?? []).map((session, index) => ({
    id: session?.id ? String(session.id) : `session-${index}`,
    start_time: session.start_time ?? null,
    trainer_id: session.trainer_id ? String(session.trainer_id) : null,
    trainer_name:
      (session.trainer_id && trainerProfiles[String(session.trainer_id)]?.name) ||
      (session.trainer_id ? String(session.trainer_id) : '—'),
    client_id: session.client_id ? String(session.client_id) : null,
    client_name:
      (session.client_id && clientProfiles[String(session.client_id)]?.name) ||
      (session.client_id ? String(session.client_id) : '—'),
    location: session.location ?? null,
  }));

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
