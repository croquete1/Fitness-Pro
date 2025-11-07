export const dynamic = 'force-dynamic';

import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import SessionHistoryClient from './SessionHistoryClient';
import { getSessionUserSafe } from '@/lib/session-bridge';
import { tryCreateServerClient } from '@/lib/supabaseServer';
import { toAppRole, type AppRole } from '@/lib/roles';
import { getEmptySessionHistory } from '@/lib/fallback/history';
import type { SessionHistoryDataset, SessionHistoryRow, SessionHistoryPerson } from '@/lib/history/types';

function firstString(...values: Array<any>): string | null {
  for (const value of values) {
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return null;
}

function resolvePerson(
  idCandidate: string | number | null | undefined,
  fallbackId: string | number | null | undefined,
  ...sources: Array<any | null | undefined>
): SessionHistoryPerson | null {
  const resolvedId = firstString(
    idCandidate,
    fallbackId,
    ...sources.flatMap((source) => [source?.id, source?.user_id, source?.userId]),
  );
  if (!resolvedId) return null;

  const email = firstString(
    ...sources.flatMap((source) => [source?.email, source?.user_email, source?.contact_email]),
  );

  const name =
    firstString(
      ...sources.flatMap((source) => [
        source?.name,
        source?.full_name,
        source?.display_name,
        source?.username,
        source?.user_name,
        source?.email,
        source?.user_email,
      ]),
    ) ?? `Utilizador ${String(resolvedId).slice(0, 6)}`;

  return {
    id: String(resolvedId),
    name,
    email: email ?? null,
  };
}

async function loadSessionHistory(userId: string, role: AppRole): Promise<{ data: SessionHistoryDataset; supabase: boolean }> {
  const sb = tryCreateServerClient();
  if (!sb) {
    return { data: getEmptySessionHistory(), supabase: false };
  }

  try {
    let query = sb
      .from('sessions')
      .select(
        'id, scheduled_at, start_at, start_time, end_at, end_time, duration_min, duration_minutes, status, session_status, client_attendance_status, attendance_status, location, notes, note, trainer_id, pt_id, client_id, user_id',
      )
      .order('scheduled_at', { ascending: false })
      .limit(400);

    if (role === 'PT') {
      query = query.eq('trainer_id', userId);
    } else if (role === 'CLIENT') {
      query = query.eq('client_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;

    const sessionRows = (data ?? []) as any[];
    const participantIds = new Set<string>();
    for (const row of sessionRows) {
      const trainerId = row.trainer_id ?? row.pt_id ?? null;
      const clientId = row.client_id ?? row.user_id ?? null;
      if (trainerId && String(trainerId).trim()) participantIds.add(String(trainerId));
      if (clientId && String(clientId).trim()) participantIds.add(String(clientId));
    }

    const ids = Array.from(participantIds);
    let profileRows: any[] = [];
    let userRows: any[] = [];
    if (ids.length) {
      const [profilesRes, usersRes] = await Promise.all([
        sb
          .from('profiles')
          .select('id, full_name, name, email')
          .in('id', ids)
          .limit(800),
        sb
          .from('users')
          .select('id, name, email')
          .in('id', ids)
          .limit(800),
      ]);

      if (profilesRes.error) {
        console.warn('[history] falha ao carregar perfis auxiliares', profilesRes.error);
      } else {
        profileRows = Array.isArray(profilesRes.data) ? profilesRes.data : [];
      }

      if (usersRes.error) {
        console.warn('[history] falha ao carregar utilizadores auxiliares', usersRes.error);
      } else {
        userRows = Array.isArray(usersRes.data) ? usersRes.data : [];
      }
    }

    const profileMap = new Map(profileRows.map((row) => [String(row.id), row] as const));
    const userMap = new Map(userRows.map((row) => [String(row.id), row] as const));

    const rows: SessionHistoryRow[] = sessionRows.map((row: any) => {
      const scheduledAt = row.scheduled_at ?? null;
      const startAt = row.start_at ?? row.start_time ?? scheduledAt;
      const endAt = row.end_at ?? row.end_time ?? null;
      const durationRaw = row.duration_min ?? row.durationMinutes ?? null;
      const durationMin =
        typeof durationRaw === 'number'
          ? durationRaw
          : durationRaw == null
          ? null
          : Number.isFinite(Number(durationRaw))
          ? Number(durationRaw)
          : null;
      const status = row.status ?? row.session_status ?? null;
      const attendance = row.client_attendance_status ?? row.attendance_status ?? status ?? null;

      const trainerId = row.trainer_id ?? row.pt_id ?? null;
      const clientId = row.client_id ?? row.user_id ?? null;
      const trainerProfile = trainerId ? profileMap.get(String(trainerId)) : null;
      const trainerUser = trainerId ? userMap.get(String(trainerId)) : null;
      const clientProfile = clientId ? profileMap.get(String(clientId)) : null;
      const clientUser = clientId ? userMap.get(String(clientId)) : null;

      const trainer = resolvePerson(trainerId, row.pt_id ?? null, row.trainer, trainerProfile, trainerUser);
      const client = resolvePerson(clientId, row.user_id ?? null, row.client, clientProfile, clientUser);

      return {
        id: String(row.id ?? randomUUID()),
        scheduledAt,
        startAt,
        endAt,
        durationMin,
        status,
        attendance,
        location: row.location ?? row.place ?? null,
        notes: row.notes ?? row.note ?? null,
        trainer,
        client,
      } satisfies SessionHistoryRow;
    });

    return {
      data: {
        generatedAt: new Date().toISOString(),
        rows,
      },
      supabase: true,
    };
  } catch (error) {
    console.warn('[history] supabase query falhou, a usar fallback vazio', error);
    return { data: getEmptySessionHistory(), supabase: false };
  }
}

export default async function HistoryPage() {
  const session = await getSessionUserSafe();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const role = toAppRole(session.user.role) ?? 'CLIENT';
  const { data, supabase } = await loadSessionHistory(session.user.id, role);
  const viewerName = session.user.name ?? session.user.email ?? null;

  return <SessionHistoryClient data={data} role={role} supabase={supabase} viewerName={viewerName} />;
}
