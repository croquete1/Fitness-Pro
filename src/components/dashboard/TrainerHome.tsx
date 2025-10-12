import * as React from 'react';
import TrainerDashboardClient, { type TrainerDashboardData } from './TrainerDashboardClient';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { toAppRole } from '@/lib/roles';
import { getSampleTrainerDashboard } from '@/lib/fallback/users';

export const dynamic = 'force-dynamic';

async function loadTrainerDashboard(trainerId: string | null): Promise<{ data: TrainerDashboardData; supabase: boolean }> {
  const fallback = getSampleTrainerDashboard(trainerId ?? '1002');
  if (!trainerId) {
    return { data: fallback, supabase: false };
  }

  const sb = tryCreateServerClient();
  if (!sb) {
    return { data: fallback, supabase: false };
  }

  try {
    const { data: linkRows, error: linkError } = await sb
      .from('trainer_clients')
      .select('client_id,status')
      .eq('trainer_id', trainerId)
      .limit(200);

    if (linkError) throw linkError;

    const clientIds = (linkRows ?? []).map((row) => row?.client_id).filter(Boolean) as string[];
    let clientProfiles: Array<{ id: string; name: string; email?: string | null; status?: string | null }> = [];
    if (clientIds.length) {
      const { data: profiles, error: profileError } = await sb
        .from('users')
        .select('id,name,email,status')
        .in('id', clientIds);
      if (profileError) throw profileError;
      clientProfiles = (profiles ?? []).map((p) => ({
        id: String(p.id),
        name: p.name ?? p.email ?? String(p.id),
        email: p.email ?? null,
        status: p.status ?? null,
      }));
    }

    const now = new Date();
    const startWindow = new Date(now);
    startWindow.setDate(startWindow.getDate() - 7);
    const endWindow = new Date(now);
    endWindow.setDate(endWindow.getDate() + 14);

    const { data: sessionsData, error: sessionsError } = await sb
      .from('sessions')
      .select('id,client_id,start_time,location,status')
      .eq('trainer_id', trainerId)
      .gte('start_time', startWindow.toISOString())
      .lt('start_time', endWindow.toISOString())
      .order('start_time', { ascending: true });

    if (sessionsError) throw sessionsError;

    const sessions = (sessionsData ?? []).map((session) => ({
      id: session.id ? String(session.id) : `session-${Math.random().toString(16).slice(2)}`,
      start_time: session.start_time ?? null,
      client_id: session.client_id ? String(session.client_id) : null,
      client_name:
        (session.client_id && clientProfiles.find((client) => client.id === String(session.client_id))?.name) ||
        fallback.clients.find((client) => client.id === session.client_id)?.name ||
        'Cliente',
      location: session.location ?? null,
      status: session.status ?? null,
    }));

    const sessionsThisWeek = sessions.filter((session) => {
      if (!session.start_time) return false;
      const date = new Date(session.start_time);
      return date >= startWindow && date <= now;
    }).length;

    let activePlans = fallback.stats.activePlans;
    try {
      const { data: planRows } = await sb
        .from('training_plans')
        .select('id,status')
        .eq('trainer_id', trainerId);
      if (Array.isArray(planRows)) {
        activePlans = planRows.filter((plan) => {
          const status = String(plan?.status ?? '').toUpperCase();
          return ['ACTIVE', 'APPROVED', 'IN_PROGRESS', 'LIVE'].includes(status);
        }).length;
      }
    } catch {
      activePlans = fallback.stats.activePlans;
    }

    let pendingRequests = 0;
    try {
      const { count, error: approvalsError } = await sb
        .from('approvals')
        .select('id', { head: true, count: 'exact' })
        .eq('trainer_id', trainerId)
        .eq('status', 'pending');
      if (approvalsError) throw approvalsError;
      pendingRequests = count ?? 0;
    } catch {
      pendingRequests = fallback.stats.pendingRequests;
    }

    const data: TrainerDashboardData = {
      stats: {
        totalClients: clientProfiles.length,
        activePlans,
        sessionsThisWeek,
        pendingRequests,
      },
      clients: clientProfiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        status: profile.status ?? 'ACTIVE',
      })),
      upcoming: sessions,
    };

    return { data, supabase: true };
  } catch (error) {
    console.warn('[trainer dashboard] fallback sample data', error);
    return { data: fallback, supabase: false };
  }
}

function firstName(full?: string | null) {
  if (!full) return 'Personal Trainer';
  const parts = full.trim().split(/\s+/);
  return parts[0] ?? full;
}

export default async function TrainerHome() {
  const session = await getSessionUserSafe();
  const trainerId = session?.user?.id ?? session?.id ?? null;
  const role = toAppRole(session?.role) ?? toAppRole(session?.user?.role) ?? 'CLIENT';
  if (role !== 'PT' && role !== 'ADMIN') {
    const fallback = getSampleTrainerDashboard(trainerId ?? '1002');
    const name = firstName(session?.user?.name ?? session?.user?.email ?? undefined);
    return <TrainerDashboardClient name={name} data={fallback} supabase={false} />;
  }

  const { data, supabase } = await loadTrainerDashboard(trainerId);
  const name = firstName(session?.user?.name ?? session?.user?.email ?? undefined);

  return <TrainerDashboardClient name={name} data={data} supabase={supabase} />;
}
